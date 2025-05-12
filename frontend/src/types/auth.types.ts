import { type IUser } from "./user.types";

export type AuthState = {
     isAuthenticated: boolean;
     user: IUser | null;
     hasTeam: boolean | null;
};

export type DefaultUserRoleType = "teamLeader" | "teamMember";
