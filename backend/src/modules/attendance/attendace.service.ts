import { AttendanceSchema } from "src/validators/attendance.validator";
import { MeetingService } from "../meeting/meeting.service";
import { ApiError } from "src/utils/api/api.response";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IUser } from "src/interfaces/user.interface";
import {
  IAttendace,
  IAttendanceInfo,
} from "src/interfaces/attendace.interface";
import logger from "src/utils/logger/logger";

export class AttendanceService {
  private meetingService: MeetingService;

  constructor() {
    this.postAttendance = this.postAttendance.bind(this);
    this.meetingService = new MeetingService();
  }

  /**
   *
   * @param data
   * @param userId
   */
  async postAttendance(data: AttendanceSchema, userId: string): Promise<void> {
    // Fetch Meeting Detail
    const savedMeeting = await this.meetingService.getMeetingById(
      data.meetingId
    );
    logger.info(`Fetched meeting: ${data.meetingId}`);

    if (savedMeeting.organizerId != userId) {
      throw new ApiError("Organizer id mismatch.", 400);
    }

    const batch = db.batch();

    // Adjust AttendanceInfo for each absent
    for (const userId of data.absentIds) {
      const userSnap = await db.collection(COLLECTIONS.USERS).doc(userId).get();

      if (!userSnap.exists) {
        logger.warn(`User with id: ${userId}, does not exist.`);
        continue;
      }
      const userData = userSnap.data() as IUser;

      const attendanceInfoId = userData.attendanceInfoId;
      const attendanceInfoRef = db
        .collection(COLLECTIONS.ATTENDACEINFO)
        .doc(attendanceInfoId);
      const attendanceInfoSnap = await attendanceInfoRef.get();

      if (!attendanceInfoSnap.exists) {
        logger.warn(`User with id: ${userId}, don't have attendance document.`);
        continue;
      }

      const attendanceInfoData = attendanceInfoSnap.data() as IAttendanceInfo;
      const prevAbsenceScore = attendanceInfoData.absenceScore;

      const prevMissed = attendanceInfoData.missed;
      batch.update(attendanceInfoRef, {
        absenceScore: prevAbsenceScore + 4,
        missed: prevMissed + 1,
      });
    }

    await batch.commit();

    // Save attendance
    const timestamp = new Date().toISOString();
    const attendance = {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as IAttendace;

    await db.collection(COLLECTIONS.ATTENDACE).add(attendance);
  }
}
