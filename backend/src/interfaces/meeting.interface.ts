export type MeetingStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "canceled";

export interface IMeeting {
  id: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  status: MeetingStatus;
  teamId: string;
  organizerId: string;
  passcode: string;
  link: string;
  category: string;
  agenda: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMeetingTemplate extends Partial<IMeeting> {
  attendeeFirstName: string;
  startDay: string;
}
