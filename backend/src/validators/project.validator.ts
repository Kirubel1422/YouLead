import z from "zod";

export const ProjectSchema = z.object({
  name: z.string().nonempty("Project name is required"),
  description: z.string().optional(),
  projectDeadline: z.string().date("Invalid date").optional(),
  teamId: z.string().nonempty(),
});

export const ProjectAddMembersSchema = z.object({
  members: z.array(z.string(), { message: "Members invalid" }),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
export type ProjectAddMembersSchemaType = z.infer<
  typeof ProjectAddMembersSchema
>;
