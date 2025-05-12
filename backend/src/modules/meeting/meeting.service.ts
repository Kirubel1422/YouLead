import dayjs from "dayjs";
import { firestore } from "firebase-admin";
import { DATE_FORMAT } from "src/configs/date";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IMeeting } from "src/interfaces/meeting.interface";
import { IUser } from "src/interfaces/user.interface";
import { sendEmail } from "src/services/email";
import { meetingEmail } from "src/templates/meeting.template";
import { ApiError } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import { MeetingSchema } from "src/validators/meeting.validator";
import { ActivityService } from "../activities/activities.service";
import { Helper } from "src/utils/helpers";

export class MeetingService {
  private activityService: ActivityService;
  private helper: Helper;

  constructor() {
    this.activityService = new ActivityService();
    this.helper = new Helper();

    this.createMeeting = this.createMeeting.bind(this);
    this.updateMeeting = this.updateMeeting.bind(this);
    this.getMeetingById = this.getMeetingById.bind(this);
    this.upcomingMeetings = this.upcomingMeetings.bind(this);
    this.addMemberToMeeting = this.addMemberToMeeting.bind(this);
  }

  /**
   *
   * @param data
   * @param userId
   */
  async createMeeting(
    data: MeetingSchema,
    userId: string,
    teamId: string
  ): Promise<void> {
    return db.runTransaction(async (transaction) => {
      // Check if team exists
      logger.info("Creating a meeting");
      const teamRef = db.collection(COLLECTIONS.TEAMS).doc(teamId);
      const teamSnap = await transaction.get(teamRef);

      if (!teamSnap.exists) {
        throw new ApiError("Team does not exist.", 400);
      }

      // Check if all attendees are part of that team.
      const meetingRef = db.collection(COLLECTIONS.MEETINGS).doc();
      const { attendees } = data;

      // Prepare for email notification
      logger.info("Parsing email and first name from meeting attendees");
      const attendeesInfo: (
        | { email: string; firstName: string }
        | undefined
      )[] = await Promise.all(
        attendees.map(async (attendee: string) => {
          const userRef = db.collection(COLLECTIONS.USERS).doc(attendee);
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists) {
            throw new ApiError("User not found", 400);
          }

          const user = userSnap.data() as IUser;

          // Check if the user is part of another team
          if (user.teamId != teamId) {
            logger.warn(
              `User id: ${user.uid} can't be added to this meeting as its not part of this team.`
            );
            return undefined;
          }

          return {
            email: user.profile.email,
            firstName: user.profile.firstName,
          };
        })
      );

      // Write to Activity Log
      await this.activityService.writeMeetingActivity({
        createdBy: userId,
        teamId,
        startTime: data.startTime,
        type: "create",
      });

      // Finally set meeting data to collection
      transaction.set(meetingRef, {
        ...data,
        status: "scheduled",
        organizerId: userId,
        ...this.helper.fillTimeStamp(),
      });
      logger.info("Meeting document set.");

      // Remove undefined and null values
      const filteredAttendeesInfo = attendeesInfo.filter(Boolean);

      // Send emails
      logger.info("Starting to send email to attendees");
      for (const info of filteredAttendeesInfo) {
        const startDay = dayjs(data.startTime).format(DATE_FORMAT);
        await sendEmail(
          "New Meeting",
          info?.email as string,
          meetingEmail({
            ...data,
            startDay,
            attendeeFirstName: info?.firstName as string,
          })
        );
      }
    });
  }

  /**
   *
   * @param id
   * @returns
   */
  async getMeetingById(id: string): Promise<IMeeting> {
    const meetingSnap = await db.collection(COLLECTIONS.MEETINGS).doc(id).get();

    if (!meetingSnap.exists) {
      throw new ApiError("Meeting does not exist.", 400, false, null);
    }

    return meetingSnap.data() as IMeeting;
  }

  /**
   *
   * @param meetingId
   * @param userId
   * @param data
   */
  async updateMeeting(
    meetingId: string,
    userId: string,
    data: Partial<MeetingSchema>
  ): Promise<void> {
    const meetingRef = db.collection(COLLECTIONS.MEETINGS).doc(meetingId);
    const meetingSnap = await meetingRef.get();

    if (!meetingSnap.exists) {
      throw new ApiError("Meeting does not exist.", 400);
    }

    const meetingData = meetingSnap.data() as IMeeting;
    if (meetingData.organizerId != userId) {
      throw new ApiError("Unauthorized to update meeting information", 401);
    }

    await meetingRef.update({ ...meetingData, data });
  }

  /**
   *
   * @param userId
   * @param days
   * @returns
   */
  async upcomingMeetings(userId: string): Promise<IMeeting[]> {
    // Query meetings
    const meetingsQ = db
      .collection(COLLECTIONS.MEETINGS)
      .where("attendees", "array-contains", userId)
      .where("startTime", ">=", new Date(Date.now()).toISOString())
      .orderBy("startTime");

    const meetingsSnap = await meetingsQ.get();
    const meetingsData = meetingsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IMeeting[];

    return meetingsData;
  }

  /**
   *
   * @param memberId
   * @param userId
   * @param meetingId
   */
  async addMemberToMeeting(
    memberId: string,
    userId: string,
    meetingId: string
  ): Promise<void> {
    // Check if the user exists
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(memberId).get();

    if (!userSnap.exists) {
      throw new ApiError("User not found", 400);
    }
    const userData = userSnap.data() as IUser;

    const meetingRef = db.collection(COLLECTIONS.MEETINGS).doc(meetingId);
    const meetingSnap = await meetingRef.get();

    if (!meetingSnap.exists) {
      throw new ApiError("Meeting not found.", 400);
    }

    const meetingData = meetingSnap.data() as IMeeting;
    const { organizerId } = meetingData;

    // Check if the user trying to edit is the user who created the meeting
    if (organizerId != userId) {
      throw new ApiError("Unauthorized to perfom this action.", 401);
    }

    // Check if the user is part of the team
    if (userData.teamId != meetingData.teamId) {
      throw new ApiError("Unauthorized to perfom this action.", 401);
    }

    await meetingRef.update({
      attendees: firestore.FieldValue.arrayUnion(memberId),
    });

    // Send email to the added attendee
    const startDay = dayjs(meetingData.startTime).format(DATE_FORMAT);
    await sendEmail(
      "New Meeting",
      userData.profile.email,
      meetingEmail({
        ...userData,
        startDay,
        attendeeFirstName: userData.profile.firstName,
      })
    );
  }
}
