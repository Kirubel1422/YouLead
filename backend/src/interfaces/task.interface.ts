type TaskStatusType = "pending" | "completed" | "pastDue";

export interface TaskStatus {
  completed: number;
  pending: number;
  pastDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id?: string;
  createdBy: string;
  projectId: string;
  name: string;
  description?: string;
  assignedTo: string[];
  teamId: string;
  deadline?: string[];
  status: TaskStatusType;
  createdAt: string;
  updatedAt: string;
}
