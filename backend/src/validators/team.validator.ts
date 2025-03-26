import z from "zod";

export const CreateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  organization: z.string().optional(),
});

export type CreateTeamSchemaType = z.infer<typeof CreateTeamSchema>;
