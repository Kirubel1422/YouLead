import axiosInstance from "src/api/axios";
import { auth, db } from "src/configs/firebase";
import { ENV } from "src/constants/dotenv";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ISignupRequest } from "src/types/api/signup.interface";
import { ISignin, IUser } from "src/types/user.interface";
import { ApiError } from "src/utils/api/api.response";

export class AuthServices {
  constructor() {
    this.login = this.login.bind(this);
    this.userSignup = this.userSignup.bind(this);
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
    await auth.setCustomUserClaims(createdUser.uid, { role: "user" });

    // Save User to FireStore
    const userPassword = signupData.password;

    // delete password before saving
    delete signupData.password;
    const user: IUser = {
      profile: { ...signupData },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: "user",
      uid: createdUser.uid,
      accountStatus: "active",
    };

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
}
