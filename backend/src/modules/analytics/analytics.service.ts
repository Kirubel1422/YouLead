import { IAnalyticsMain } from "src/interfaces/analytis.interface";
import { TaskService } from "../tasks/tasks.service";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IUser } from "src/interfaces/user.interface";
import { ProjectStatus } from "src/interfaces/project.interface";
import { TaskStatus } from "src/interfaces/task.interface";
import dayjs from "dayjs";

export class AnalyticsService {
  private taskService: TaskService;
  constructor() {
    this.taskService = new TaskService();
    this.getMain = this.getMain.bind(this);
  }

  // Tasks due soon - 30days
  // Tasks due this week
  // Task completion rate: completed / total
  // Active Projects
  // Upcoming Meetings - 2 weeks
  // Latest Meeting
  async getMain(userId: string): Promise<IAnalyticsMain> {
    const { tasks, total } = await this.taskService.fetchMyTasks(userId);
    const userRef = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userRef.data() as IUser;

    const { pending: activeProjects } = userData.projectStatus as ProjectStatus;

    if (total === 0) {
      return {
        activeProjects: activeProjects,
        completionRate: 1,

        latestMeeting: new Date().toISOString(),
        tasksDueSoon: 0,
        tasksThisWeek: 0,
        upcomingMeetings: 0, // Adjust this one after adding meeting collection
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
      completionRate: parseFloat((completedTasks / total).toFixed(3)),

      latestMeeting: new Date().toISOString(),
      tasksDueSoon,
      tasksThisWeek,
      upcomingMeetings: 0, // Adjust this one after adding meeting collection
    };
  }
}
