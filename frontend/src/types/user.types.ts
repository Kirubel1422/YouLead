import { ProjectStatus } from "./project.types";
import { TaskStatus } from "./task.types";

export type UserRole = "admin" | "teamLeader" | "teamMember" | "coLeader";
export type AccountStatus = "active" | "inactive";

export interface IUser {
     role: UserRole;
     previousPasswords?: string[];
     createdAt: string;
     updatedAt: string;
     uid: string;
     profile: IProfile;
     accountStatus: AccountStatus;
     teamId?: string;
     taskStatus?: TaskStatus;
     projectStatus?: ProjectStatus;
     workRole?: string;
}

export interface IProfile {
     firstName: string;
     lastName?: string;
     email: string;
     phoneNumber?: string;
     profilePicture?: string;
     password?: string;
}
