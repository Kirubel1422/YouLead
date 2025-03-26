import { IProfile, Role } from "./user.interface";

export interface ISignupRequest extends IProfile {
  role: Role;
}

export interface ISignin {
  email: string;
  password: string;
}
