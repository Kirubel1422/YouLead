import { AccountStatus } from "./user.types";

export interface IAnalyticsMain {
     tasksDueSoon: number;
     tasksThisWeek: number;
     completionRate: number;
     activeProjects: number;
     upcomingMeetings: number;
     latestMeeting: string;
}

export interface IMembersAnalytics {
     id: string;
     name: string;
     email: string;
     workRole: string;
     avatar: string;
     tasksCompleted: number;
     tasksInProgress: number;

     status: AccountStatus;
}

export interface ITasksByStatus {
     status: string;
     count: number;
}

export interface ITasksByPriority {
     priority: string;
     count: number;
}

export interface IWeeklyProgress {
     day: string;
     completed: number;
}

export interface ITeamAnalytics {
     tasksDueSoon: number;
     completionRate: number;
     activeProjects: number;
     upcomingMeetings: number;
     latestMeeting: string;
     tasksByStatus: ITasksByStatus[];
     tasksByPriority: ITasksByPriority[];
     weeklyProgress: IWeeklyProgress[];
}
