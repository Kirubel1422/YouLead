export type AuthState = {
     isAuthenticated: boolean;
     user: any;
     hasTeam: string | null;
};

export type DefaultUserRoleType = "teamLeader" | "teamMember";
