import z from "zod";

export const meetingSchema = z.object({
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start time format",
  }),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end time format",
  }),
  attendees: z.array(z.string()).nonempty("Attendees cannot be empty"),
  passcode: z.string().nonempty("Passcode cannot be empty"),
  link: z.string().url("Invalid URL format"),
  category: z.string().nonempty("Category cannot be empty"),
  agenda: z.string(),
});

export type MeetingSchema = z.infer<typeof meetingSchema>;
