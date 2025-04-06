export type AuthState = {
     isAuthenticated: boolean;
     user: any;
     hasTeam: boolean | null;
};

export type DefaultUserRoleType = "teamLeader" | "teamMember";
