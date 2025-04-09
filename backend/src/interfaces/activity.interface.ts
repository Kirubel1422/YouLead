export interface IActivity {
  activity: string;
  id?: string;
  superAdminOnly: boolean;
  entityId?: string;

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
