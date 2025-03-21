export interface IUser {
  role: "admin" | "user";
  previousPasswords?: string[];
  createdAt: string;
  updatedAt: string;
  uid: string;
  profile: IProfile;
  accountStatus: "active" | "inactive";
}

export interface IProfile {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  password?: string;
}

export interface ISignin {
  email: string;
  password: string;
}
