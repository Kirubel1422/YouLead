import {
  IAnalyticsMain,
  IMembersAnalytics,
  ITasksByPriority,
  ITasksByStatus,
  ITeamAnalytics,
  IWeeklyProgress,
} from "src/interfaces/analytics.interface";
import { TaskService } from "../tasks/tasks.service";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IUser } from "src/interfaces/user.interface";
import { IProject, ProjectStatus } from "src/interfaces/project.interface";
import { ITask, TaskStatus } from "src/interfaces/task.interface";
import dayjs from "dayjs";
import { IMeeting } from "src/interfaces/meeting.interface";
import { AuthServices } from "../auth/auth.service";
import { ApiError } from "src/utils/api/api.response";

export class AnalyticsService {
  private taskService: TaskService;
  constructor() {
    this.taskService = new TaskService();
    this.getMain = this.getMain.bind(this);
    this.teamAnalytics = this.teamAnalytics.bind(this);
    this.teamMembers = this.teamMembers.bind(this);
  }

  async teamMembers(userId: string): Promise<IMembersAnalytics[]> {
    const userData = await AuthServices.getUserById(userId);
    if (!["admin", "teamLeader"].includes(userData.role)) {
      throw new ApiError("You are not authorized to access this resource", 403);
    }

    const teamId = userData.teamId;
    const usersQ = db
      .collection(COLLECTIONS.USERS)
      .where("teamId", "==", teamId);
    const usersSnap = await usersQ.get();

    const usersData: IMembersAnalytics[] = usersSnap.docs.map((doc) => {
      const data = doc.data() as IUser;
      return {
        id: doc.id,
        name: data.profile.firstName + " " + data.profile.lastName,
        email: data.profile.email,
        workRole: data.workRole || "N/A",
        avatar:
          data.profile.profilePicture || "/placeholder.svg?height=40&width=40",
        tasksCompleted: data.taskStatus?.completed || 0,
        tasksInProgress: data.taskStatus?.pending || 0,
        status: data.accountStatus,
      };
    });

    return usersData;
  }

  async teamAnalytics(userId: string): Promise<ITeamAnalytics> {
    const userData = await AuthServices.getUserById(userId);
    if (!["admin", "teamLeader"].includes(userData.role)) {
      throw new ApiError("You are not authorized to access this resource", 403);
    }

    // Extract teamId from userData
    const { teamId } = userData;
    const teamSnap = await db
      .collection(COLLECTIONS.TEAMS)
      .doc(teamId as string)
      .get();

    if (!teamSnap.exists) {
      throw new ApiError("Team not found", 404);
    }

    // Retrieve upcoming meetings count and latest meeting
    const nowISOString = new Date().toISOString();
    const meetingsQ = db
      .collection(COLLECTIONS.MEETINGS)
      .where("teamId", "==", teamId)
      .where("startTime", ">=", nowISOString)
      .orderBy("startTime");
    const meetingSnap = await meetingsQ.get();
    const meetingsData = meetingSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IMeeting[];
    const upcomingMeetings = meetingSnap.size;
    const latestMeeting =
      meetingsData.length > 0 ? meetingsData[0].startTime : "";

    // Retrieve team active projects count
    const projectsQ = db
      .collection(COLLECTIONS.PROJECTS)
      .where("teamId", "==", teamId)
      .where("status", "!=", "completed");
    const projectsSnap = await projectsQ.get();
    const activeProjects = projectsSnap.size;

    // Variables for analytics
    let tasksDueSoon = 0;
    let totalTasks = 0;
    const tasksByStatus: ITasksByStatus[] = [];
    const tasksByPriority: ITasksByPriority[] = [];
    const weeklyProgress: IWeeklyProgress[] = [];

    // Handle Weekly Progress
    const weekly: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    // Aggregators for status/priority across all projects
    const statusCounts: Record<string, number> = {
      completed: 0,
      pastDue: 0,
      pending: 0,
    };
    const priorityCounts: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const doc of projectsSnap.docs) {
      const projectData = { id: doc.id, ...doc.data() } as IProject;
      const projectId = projectData.id;

      // Query tasks associated with each project
      const tasksSnap = await db
        .collection(COLLECTIONS.TASKS)
        .where("projectId", "==", projectId)
        .get();
      const tasksData = tasksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ITask[];

      // Add each project's tasks to total tasks
      totalTasks += tasksData.length;

      // Count status and priority for this project's tasks
      for (const task of tasksData) {
        // Status
        if (
          typeof task.status === "string" &&
          statusCounts[task.status] !== undefined
        ) {
          statusCounts[task.status]++;
        }
        // Priority
        if (
          typeof task.priority === "string" &&
          priorityCounts[task.priority] !== undefined
        ) {
          priorityCounts[task.priority]++;
        }
        // Due soon (e.g., due in next 5 days)
        const dueDate =
          Array.isArray(task.deadline) && task.deadline.length > 0
            ? task.deadline[task.deadline.length - 1]
            : null;
        if (dueDate) {
          const now = dayjs();
          const deadlineDay = dayjs(dueDate);
          if (
            deadlineDay.diff(now, "day") <= 5 &&
            deadlineDay.diff(now, "day") >= 0
          ) {
            tasksDueSoon++;
          }
          // Weekly Progress: count completed tasks by weekday
          if (task.status === "completed") {
            const formattedDueDate = deadlineDay.format("ddd");
            if (weekly[formattedDueDate] !== undefined) {
              weekly[formattedDueDate] += 1;
            }
          }
        }
      }
    }

    // Prepare tasksByStatus and tasksByPriority arrays
    for (const status of Object.keys(statusCounts)) {
      tasksByStatus.push({
        status,
        count: statusCounts[status],
      });
    }
    for (const priority of Object.keys(priorityCounts)) {
      tasksByPriority.push({
        priority,
        count: priorityCounts[priority],
      });
    }

    // Prepare weekly progress array
    for (const day in weekly) {
      weeklyProgress.push({ day, completed: weekly[day] });
    }

    // Count total completed tasks
    const totalCompleted = statusCounts["completed"] ?? 0;

    // Calculate completion rate
    const completionRate =
      totalTasks === 0
        ? 0
        : parseFloat((totalCompleted / totalTasks).toFixed(2));

    return {
      upcomingMeetings,
      tasksDueSoon,
      latestMeeting,
      activeProjects,
      tasksByPriority,
      tasksByStatus,
      weeklyProgress,
      completionRate,
    } as ITeamAnalytics;
  }

  async getMain(userId: string): Promise<IAnalyticsMain> {
    const { tasks, total } = await this.taskService.fetchMyTasks(userId);
    const userRef = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userRef.data() as IUser;

    const { pending: activeProjects } = userData.projectStatus as ProjectStatus;

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

    if (total === 0) {
      return {
        activeProjects: activeProjects,
        completionRate: 0,

        latestMeeting: meetingsData.length > 0 ? meetingsData[0].startTime : "",
        tasksDueSoon: 0,
        tasksThisWeek: 0,
        upcomingMeetings: meetingsData.length,
      };
    }

    const { completed: completedTasks } = userData.taskStatus as TaskStatus;

    const today = dayjs();

    let tasksThisWeek = 0; // Week - 7days
    let tasksDueSoon = 0; // Month - 30days

    for (const task of tasks) {
      if (task.deadline && task.status === "pending") {
        const lastIndex = task.deadline.length - 1;
        const deadline = task.deadline[lastIndex];
        const diff = Math.abs(dayjs(deadline).diff(today, "day"));

        if (diff <= 7) {
          tasksThisWeek++;
        } else if (diff <= 30) {
          tasksDueSoon++;
        }
      }
    }

    return {
      activeProjects: activeProjects,
      completionRate: parseFloat((completedTasks / total).toFixed(2)),

      latestMeeting: meetingsData.length > 0 ? meetingsData[0].startTime : "",
      tasksDueSoon,
      tasksThisWeek,
      upcomingMeetings: meetingsData.length,
    };
  }
}
