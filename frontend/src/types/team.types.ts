export interface TeamState {
     team: ITeam | null;
}

export interface ITeam {
     name: string;
     organization?: string;
     id: string;
     teamLeaderId: string;
     createdAt: string;
     updatedAt: string;
}

export interface ITeamLeaderInfo {
     name: string;
     email: string;
     profilePicture: string;
}

export interface ITeamDetail {
     id: string;
     name: string;
     leader: ITeamLeaderInfo;
     members: number;
     projects: number;
     organization: string;
}
