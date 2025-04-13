export type ActivityContext =
  | "task"
  | "project"
  | "meeting"
  | "auth"
  | "team"
  | "invitation";

export interface IActivity {
  type: string;
  activity: string;
  id?: string;
  superAdminOnly: boolean;
  entityId?: string;
  context: ActivityContext;

  createdAt: string;
  updatedAt: string;
}

export interface TaskActivity {
  type: "assign" | "complete" | "create" | "delete" | "mutate-deadline";
  userIds?: string[];
  taskId?: string;
  taskName?: string;
  names?: string[];
  createdBy?: string;
  projectId?: string;
  completedBy?: string;
  deletedBy?: string;
}

export interface ProjectAcitivity
  extends Omit<TaskActivity, "taskName" | "taskId" | "userIds"> {
  projectName?: string;
  teamId?: string;
}

export interface MeetingActivity {
  meetingId?: string;
  startTime?: string;
  createdBy: string;
  teamId?: string;
  type: "create";
}

export interface AuthActivity {
  type: "login" | "signup" | "delete";
  ip?: string;
  email?: string;
  uid?: string;
  deletedBy?: string;
}

export interface TeamActivity {
  type: "create" | "delete" | "remove-member";
  email: string;
  uid: string;
  teamId?: string;
  teamName?: string;
}

export interface InvitationActivity {
  type: "invite" | "accept" | "decline" | "cancel";
  userId?: string;
  teamId?: string;
  invitationId?: string;
  inviteeId?: string;
}
