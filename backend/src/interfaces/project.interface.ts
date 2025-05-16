type ProjectStatusTypes = "pending" | "pastDue" | "completed";

export interface ProjectStatus {
  completed: number;
  pending: number;
  pastDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProjectMembers {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface IProject {
  id?: string;
  createdBy: string;
  name: string;
  description?: string;
  members: string[];
  teamId: string;
  deadline?: string[];
  status: ProjectStatusTypes;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  limit: number;
  page: number;
}
