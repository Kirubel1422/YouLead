export interface IAttendace {
  id: string;
  meetingId: string;
  absentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceInfo {
  id: string;
  missed: number;
  attended: number;
  total: number;
  absenceScore: number;

  createdAt: string;
  updatedAt: string;
}
