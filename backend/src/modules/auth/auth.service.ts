import axiosInstance from "src/api/axios";
import { auth, db } from "src/configs/firebase";
import { ENV } from "src/constants/dotenv";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ISignin, ISignupRequest } from "src/interfaces/auth.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";

export class AuthServices {
  constructor() {
    this.login = this.login.bind(this);
    this.userSignup = this.userSignup.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.me = this.me.bind(this);
  }

  async login(signinData: ISignin): Promise<{ token: string; user: IUser }> {
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

    return { token: idToken, user };
  }

  async userSignup(
    signupData: ISignupRequest
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

    let user: IUser = {
      profile: { ...signupData },
      createdAt: savedAt,
      updatedAt: savedAt,
      role: signupData.role,
      uid: createdUser.uid,
      accountStatus: "active",
      teamId: "",
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
    return { token: idToken, user };
  }

  // Delete user by uid
  async deleteUser(uid: string) {
    // Delete from auth
    auth.deleteUser(uid);

    // Delete from user collections
    await db.collection(COLLECTIONS.USERS).doc(uid).delete();
  }

  /**
   * For refetching user data
   * @param userId
   * @returns IUser
   */
  async me(userId: string): Promise<{ user: IUser }> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = (await userRef).data() as IUser;

    return { user: userData };
  }
}
