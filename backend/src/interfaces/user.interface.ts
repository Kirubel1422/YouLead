import { ProjectStatus } from "./project.interface";
import { TaskStatus } from "./task.interface";

export type Role =
  | "admin"
  | "teamMember"
  | "teamLeader"
  | "coLeader"
  | "unAssigned";

export interface IUser {
  role: Role;
  previousPasswords?: string[];
  createdAt: string;
  updatedAt: string;
  uid: string;
  profile: IProfile;
  accountStatus: "active" | "inactive";
  teamId?: string;
  taskStatus?: TaskStatus;
  projectStatus?: ProjectStatus;
}

export interface IProfile {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  password?: string;
}
