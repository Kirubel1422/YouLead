import z from "zod";

export const TaskSchema = z.object({
  name: z.string().nonempty("Project name is required"),
  description: z.string().optional(),
  taskDeadline: z.string().date("Invalid date").optional(),
  teamId: z.string().nonempty("Team id is required"),
  projectId: z.string().nonempty("Project id is required"),
});

export const TaskAddMembersSchema = z.object({
  assignedTo: z.array(z.string(), { message: "Members invalid" }),
});

export type TaskSchemaType = z.infer<typeof TaskSchema>;
export type TaskAddMembersSchemaType = z.infer<typeof TaskAddMembersSchema>;
