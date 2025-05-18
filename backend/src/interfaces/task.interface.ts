import { IProjectMembers } from "./project.interface";

export type TaskStatusType = "pending" | "completed" | "pastDue";

export interface TaskStatus {
  completed: number;
  pending: number;
  pastDue: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriorityType = "low" | "medium" | "high";
export type TaskFilter = "today" | "upcoming" | "all";

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
  progress: number;
  createdAt: string;
  updatedAt: string;
  priority: TaskPriorityType;
}

export interface ITaskDetail extends Omit<ITask, "assignedTo"> {
  projectName: string;
  assignedTo: IProjectMembers[];
}

export interface ITaskMetaData {
  taskId: string;
  progress: number;
}
