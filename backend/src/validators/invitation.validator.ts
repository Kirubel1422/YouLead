import z from "zod";

export const InvitationSchema = z.object({
  teamId: z.string().nonempty(),
  inviteeEmail: z.string().email("Invalid email"),
});

export type InvitationSchemaType = z.infer<typeof InvitationSchema>;
