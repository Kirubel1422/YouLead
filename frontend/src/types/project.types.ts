type ProjectStatusTypes = "pending" | "pastDue" | "completed";

export interface ProjectState {
     projects: IProject[];
}

export interface ProjectStatus {
     completed: number;
     pending: number;
     pastDue: number;
     createdAt: string;
     updatedAt: string;
}

export interface IProject {
     id: string;
     createdBy: string;
     name: string;
     description?: string;
     members: string[];
     teamId: string;
     deadline?: string[];
     status: ProjectStatusTypes;
     createdAt: string;
     updatedAt: string;
     details: ProjectStatus;
}

export interface ProjectStatus {
     completed: number;
     pending: number;
     pastDue: number;
     createdAt: string;
     updatedAt: string;
}

export interface Pagination {
     page: number;
     limit: number;
}
