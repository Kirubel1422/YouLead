import { z } from "zod";
export type TaskStatusType = "pending" | "completed" | "pastDue";
export type TaskPriorityType = "low" | "medium" | "high";

export const TaskSchema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().max(500).optional(),
     status: z.enum(["pending", "completed", "pastDue"], {
          message: "Status must be either pending, completed, or pastDue",
     }),
     progress: z.number().min(0).max(100).default(0),
     priority: z.enum(["low", "medium", "high"], {
          message: "Priority must be either low, medium, or high",
     }),
     assignedTo: z.array(z.string()).optional(),
     deadline: z.array(z.string()).optional(),
     projectId: z.string().min(1, {
          message: "Project ID is required",
     }),
     teamId: z.string().min(1, {
          message: "Team ID is required",
     }),
});

export type TaskSchemaType = z.infer<typeof TaskSchema>;
