import z from "zod";

export const attendaceSchema = z.object({
  meetingId: z.string().nonempty("Meeting id is missing"),
  absentIds: z.array(z.string().nonempty("User id is missing")),
});

export type AttendanceSchema = z.infer<typeof attendaceSchema>;
