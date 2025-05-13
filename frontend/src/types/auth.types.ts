import { type IUser } from "./user.types";

export type AuthState = {
     isAuthenticated: boolean;
     user: IUser;
     hasTeam: boolean | null;
};

export type DefaultUserRoleType = "teamLeader" | "teamMember";
