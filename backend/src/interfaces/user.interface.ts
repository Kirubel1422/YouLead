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
  taskStatus?: WorkStatus;
  projectStatus?: WorkStatus;
}

export interface IProfile {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  password?: string;
}

export interface WorkStatus {
  completed: number;
  pastdue: number;
  pending: number;
}
