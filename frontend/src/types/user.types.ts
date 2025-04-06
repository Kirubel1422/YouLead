import { ProjectStatus } from "./project.types";
import { TaskStatus } from "./task.types";

export type UserRole = "admin" | "teamLeader" | "teamMember" | "coLeader";

export interface IUser {
     role: UserRole;
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
