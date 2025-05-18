export type TaskStatusType = "pending" | "completed" | "pastDue";
export type TaskPriorityType = "low" | "medium" | "high";

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
     progress: number;
     createdAt: string;
     updatedAt: string;
     priority: TaskPriorityType;
}

export interface ITaskDetail extends ITask {
     projectName: string;
}

export interface ITaskMetaData {
     taskId: string;
     progress: number;
}

export type TaskFilter = "today" | "upcoming" | "all" | undefined;

export type IEditTask = Pick<ITask, "description" | "name" | "priority" | "status" | "teamId" | "projectId">;
