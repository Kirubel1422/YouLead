import { IEditTask } from "@/types/task.types";

export function pickIEditTaskFields(data: Record<string, any>): IEditTask {
     // List your IEditTask keys here:
     const keys: (keyof IEditTask)[] = ["description", "name", "priority", "projectId", "status", "teamId"];
     const result = {} as Partial<IEditTask>;
     for (const key of keys) {
          if (key in data) result[key] = data[key];
     }
     return result as IEditTask;
}
