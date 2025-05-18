import { z } from "zod";

export const ProjectSchema = z.object({
     name: z.string().min(1, "Required"),
     teamId: z.string().min(1, "Required"),
     status: z.string().optional(),
     members: z.array(z.string()).optional(),
     description: z.string().optional(),
     deadline: z.array(z.string()).optional(),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
