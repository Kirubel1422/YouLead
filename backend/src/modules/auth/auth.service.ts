import { firestore } from "firebase-admin";
import axiosInstance from "src/api/axios";
import { auth, db } from "src/configs/firebase";
import { ENV } from "src/constants/dotenv";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ISignin, ISignupRequest } from "src/interfaces/auth.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import { ActivityService } from "../activities/activities.service";
import { IChatUser } from "src/interfaces/message.interface";
import { Helper } from "src/utils/helpers";
import { activeUsers } from "src/services/socket";
import logger from "src/utils/logger/logger";

export class AuthServices {
  private activityService: ActivityService;
  private static helper: Helper;

  constructor() {
    this.activityService = new ActivityService();
    AuthServices.helper = new Helper();

    this.login = this.login.bind(this);
    this.userSignup = this.userSignup.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.me = this.me.bind(this);

    this.getUserByEmail = this.getUserByEmail.bind(this);
  }

  async login(
    signinData: ISignin,
    ip: string | undefined
  ): Promise<{ token: string; user: IUser }> {
    const userExists = await auth
      .getUserByEmail(signinData.email)
      .catch(() => null);

    // If there is no user
    if (!userExists) {
      throw new ApiError("Wrong email or password", 400, false);
    }

    // Sigin
    const response = await axiosInstance.post(
      `:signInWithPassword?key=${ENV.FIREBASE_API_KEY}`,
      {
        email: signinData.email,
        password: signinData.password,
        returnSecureToken: true,
      }
    );

    // Extract token
    const { idToken, localId } = response.data;

    // Fetch user data from firestore
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(localId).get();

    if (!userDoc.exists) {
      throw new ApiError("User not found", 400, false);
    }

    const user = userDoc.data() as IUser;

    // Write to Activity Log
    await this.activityService.writeAuthActivity({
      ip,
      email: signinData.email,
      uid: user.uid,
      type: "login",
    });

    return { token: idToken, user };
  }

  async userSignup(
    signupData: ISignupRequest,
    ip: string | undefined
  ): Promise<{ token: string; user: IUser }> {
    // Check if the user is already there
    const userExists = await auth
      .getUserByEmail(signupData.email)
      .catch(() => null);

    if (userExists) {
      throw new ApiError("User already exists", 401);
    }

    // Prepare user for signin up to firebase
    const userData = {
      displayName: `${signupData.firstName} ${signupData.lastName}`,
      password: signupData.password,
      email: signupData.email,
    };

    // Create user
    const createdUser = await auth.createUser(userData);

    // Set Custom Claim for User
    await auth.setCustomUserClaims(createdUser.uid, { role: signupData.role });

    // Save User to FireStore
    const userPassword = signupData.password;

    // delete password before saving
    const savedAt = new Date().toISOString();
    delete signupData.password;

    // Create attendance info
    let result: firestore.DocumentReference | null = null;

    if (signupData.role != "teamLeader" && signupData.role != "admin") {
      result = await db.collection(COLLECTIONS.ATTENDACEINFO).add({
        createdAt: savedAt,
        updatedAt: savedAt,
        absenceScore: 0,
        attended: 0,
        missed: 0,
        total: 0,
      });
    }

    let user: IUser = {
      profile: { ...signupData },
      createdAt: savedAt,
      updatedAt: savedAt,
      role: signupData.role,
      uid: createdUser.uid,
      accountStatus: "active",
      teamId: "",
      attendanceInfoId: result != null ? result.id : "",
    };

    if (signupData.role != "teamLeader" && signupData.role != "admin") {
      user = {
        ...user,
        taskStatus: {
          completed: 0,
          pending: 0,
          pastDue: 0,
          createdAt: savedAt,
          updatedAt: savedAt,
        },
        projectStatus: {
          completed: 0,
          pending: 0,
          pastDue: 0,
          createdAt: savedAt,
          updatedAt: savedAt,
        },
      };
    }

    await db.collection(COLLECTIONS.USERS).doc(createdUser.uid).set(user);

    // call api to firebase auth to retrieve token
    const response = await axiosInstance.post(
      `:signInWithPassword?key=${ENV.FIREBASE_API_KEY}`,
      {
        email: signupData.email,
        password: userPassword,
        returnSecureToken: true,
      }
    );

    // return user and idToken to controller
    const { idToken } = response.data;

    // Write to Activity Log
    await this.activityService.writeAuthActivity({
      ip,
      email: signupData.email,
      uid: user.uid,
      type: "signup",
    });

    return { token: idToken, user };
  }

  // Delete user by uid, userId = user performing this action.
  async deleteUser(uid: string, userId: string, ip: string): Promise<void> {
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(uid).get();

    if (!userSnap.exists) {
      throw new ApiError("User not found", 400);
    }

    const userData = userSnap.data() as IUser;

    // Edit user status in firestore collections
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    await userRef.update({
      status: "inactive",
    });

    // Delete user from firebase authentication
    auth.deleteUser(uid);

    // Write to Activity Log
    await this.activityService.writeAuthActivity({
      ip,
      email: userData.profile.email,
      deletedBy: userId,
      type: "delete",
    });
  }

  /**
   *
   * @param userId
   * @returns
   */
  async me(userId: string): Promise<Omit<IUser, "previousPasswords">> {
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    const userData = userSnap.data() as Omit<IUser, "previousPasswords">;

    return { ...userData };
  }

  // GET: User detail by ID
  static async getUserById(userId: string): Promise<IUser> {
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    const userData = userSnap.data() as IUser;

    if (!userData) {
      throw new ApiError("User not found", 404, false);
    }

    return { ...userData };
  }

  // Get some information to display on chat list
  static async chatUserInfo(userId: string): Promise<IChatUser> {
    const userData = await this.getUserById(userId);

    const initials = AuthServices.helper.getInitials(
      userData.profile.firstName,
      userData.profile.lastName
    );

    return {
      id: userId,
      initials,
      name: userData.profile.firstName + " " + userData.profile.lastName,
      status: activeUsers.get(userId) ? "online" : "offline",
      avatar:
        userData.profile.profilePicture ||
        "/placeholder.svg?height=40&width=40",
      role: userData.role,
    };
  }

  // GET: User Detail by Email
  async getUserByEmail(email: string): Promise<IUser> {
    const userSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("profile.email", "==", email)
      .get();

    const userData = userSnap.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id,
    }))[0] as IUser;

    if (!userData) {
      throw new ApiError("User not found", 404, false);
    }

    return { ...userData };
  }

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
    email: string;
  }): Promise<{ message: string }> {
    try {
      // Sigin
      const response = await axiosInstance.post(
        `:signInWithPassword?key=${ENV.FIREBASE_API_KEY}`,
        {
          email: data.email,
          password: data.oldPassword,
          returnSecureToken: true,
        }
      );

      // Extract token
      const { localId } = response.data;

      // Fetch user data from firestore
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(localId).get();

      if (!userDoc.exists) {
        throw new ApiError("User not found", 400, false);
      }

      // Now Change Password
      await auth.updateUser(localId, {
        password: data.newPassword,
      });
      return { message: "Password changed successfully!" };
    } catch (error: any) {
      logger.error(error.message);
      throw new ApiError("Old password is incorrect", 400, false);
    }
  }
}
