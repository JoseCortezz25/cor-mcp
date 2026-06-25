export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    lastPage?: number;
  };
}

// Projects
export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: "in_process" | "finished" | "suspended";
  health?: 1 | 2 | 3 | 4; // 1=On track, 2=At risk, 3=Delayed, 4=Critical
  clientId?: number;
  teamId?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId?: number;
  teamId?: number;
  status?: "in_process" | "finished" | "suspended";
  health?: 1 | 2 | 3 | 4;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: number;
}

// Tasks
export type TaskStatus = "nueva" | "en_proceso" | "estancada" | "finalizada";
export type TaskPriority = 0 | 1 | 2 | 3; // Low, Medium, High, Urgent

export interface Task {
  id: number;
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: number;
  assigneeId?: number;
  dueDate?: string;
  estimatedHours?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateTaskInput {
  name: string;
  projectId: number;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, "projectId">> {
  id: number;
}

// Hours
export interface Hour {
  id: number;
  taskId?: number;
  projectId?: number;
  userId?: number;
  hours: number;
  date: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface LogHoursInput {
  taskId: number;
  hours: number;
  date: string;
  description?: string;
}

// Clients
export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Teams
export interface Team {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Users
export interface User {
  id: number;
  name: string;
  email?: string;
  position?: string;
  teamId?: number;
  createdAt?: string;
  [key: string]: unknown;
}
