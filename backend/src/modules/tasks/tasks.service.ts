import dayjs from "dayjs";
import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IProject, IProjectMembers } from "src/interfaces/project.interface";
import {
  type ITask,
  type ITaskDetail,
  type ITaskMetaData,
  type TaskFilter,
} from "src/interfaces/task.interface";
import { IUser, Role } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import {
  TaskAddMembersSchemaType,
  TaskSchemaType,
} from "src/validators/task.validator";
import { ProjectService } from "../projects/projects.service";
import { ActivityService } from "../activities/activities.service";
import logger from "src/utils/logger/logger";
import { AuthServices } from "../auth/auth.service";
import { Helper } from "src/utils/helpers";

export class TaskService {
  projectService: ProjectService;
  activityService: ActivityService;
  helper: Helper;

  constructor() {
    this.createTask = this.createTask.bind(this);
    this.assignTask = this.assignTask.bind(this);
    this.unAssign = this.unAssign.bind(this);
    this.mutuateDeadline = this.mutuateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.fetchMyTasks = this.fetchMyTasks.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.updateTask = this.updateTask.bind(this);

    this.helper = new Helper();
    this.activityService = new ActivityService();
    this.projectService = new ProjectService();
  }

  // Update a Task
  async updateTask(
    taskId: string,
    taskData: TaskSchemaType,
    userRole: Role,
    userId: string
  ): Promise<{ message: string }> {
    if (!["teamLeader", "admin"].includes(userRole)) {
      throw new ApiError("Unauthorized", 401);
    }

    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new ApiError("Task not found", 400);
    }

    // If teamLeader, check if the user is part of the task
    if (userRole === "teamLeader") {
      const taskData = taskSnap.data() as ITask;
      if (taskData.createdBy != userId) {
        throw new ApiError("Unauthorized", 401);
      }
    }
    await taskRef.update({
      ...taskData,
      updatedAt: new Date().toISOString(),
    });

    return { message: "Task updated successfully" };
  }

  // Create Task
  async createTask(
    taskData: TaskSchemaType,
    createdBy: string
  ): Promise<{
    message: string;
    data: ITask;
  }> {
    // Task name must be unique
    const taskCollection = db.collection(COLLECTIONS.TASKS);
    const taskQuery = taskCollection.where("name", "==", taskData.name).count();
    const taskSnap = await taskQuery.get();

    if (taskSnap.data().count > 0) {
      throw new ApiError("Task name must be unique", 400);
    }

    // Save Task
    const newTask: ITask = {
      ...taskData,
      createdBy,
      status: "pending",
      assignedTo: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: "medium",
      progress: 0,
    };

    await taskCollection.add(newTask);

    // Write to activity logs
    await this.activityService.writeTaskActivity({
      type: "create",
      taskName: taskData.name,
      projectId: taskData.projectId,
      createdBy,
    });

    return { message: "Task created successfully", data: newTask };
  }

  // Assign Task
  async assignTask(
    data: TaskAddMembersSchemaType,
    taskId: string,
    createdBy: string
  ): Promise<{
    message: string;
    fullName: string;
    email: string;
    taskName: string;
  }> {
    return await db.runTransaction(async (transaction) => {
      const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
      const taskSnap = await transaction.get(taskRef);
      const taskData = taskSnap.data() as ITask;

      if (!taskSnap.exists) {
        throw new ApiError("Task does not exist", 400);
      }

      // Check if the member to be added is part of the project
      const projectRef = db
        .collection(COLLECTIONS.PROJECTS)
        .doc(taskData.projectId);
      const projectSnap = await transaction.get(projectRef);
      const projectData = projectSnap.data() as IProject;

      if (!projectSnap.exists) {
        throw new ApiError("Project is not found.", 400);
      }

      // Check if a non-project member is about to be assigned for a task
      data.assignedTo.forEach((membId) => {
        if (
          !projectData.members.some(
            (projectMemberId) => projectMemberId == membId
          )
        ) {
          throw new ApiError(
            "A person from another project is being assigned to this task. Please make sure to have the person in the project before assigning him a task.",
            400
          );
        }
      });

      // Process all members concurrently using Promise.all
      const names: string[] = []; // For activity log purpose
      const emails: string[] = []; // For activity log purpose
      await Promise.all(
        data.assignedTo.map(async (memberId: string) => {
          const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
          const userSnap = await transaction.get(userRef);

          // Check if the member is already in the task
          if (taskData.assignedTo.some((preMember) => preMember == memberId)) {
            throw new ApiError("User is already in the task", 400);
          }

          // Check if the user exists
          if (!userSnap.exists) {
            throw new ApiError(`${memberId} is not found`, 400);
          }

          const userData = userSnap.data() as IUser;

          // Add user name for activity log
          const fullName = `${userData.profile.firstName} ${userData.profile.lastName}`;
          names.push(fullName);
          emails.push(userData.profile.email);

          // Increase the pending count for the user
          transaction.update(userRef, {
            taskStatus: {
              ...userData.taskStatus,
              pending: (userData.taskStatus?.pending as number) + 1,
              updatedAt: new Date().toISOString(),
            },
          });
        })
      );

      // Add members to task
      transaction.update(taskRef, {
        assignedTo: firestore.FieldValue.arrayUnion(...data.assignedTo),
      });

      // Write to activity logs
      await this.activityService.writeTaskActivity({
        taskId,
        type: "assign",
        userIds: data.assignedTo,
        createdBy,
        names,
        taskName: taskData.name,
        projectId: taskData.projectId,
      });

      return {
        message: "Successfully assigned Task!",
        fullName: names[0],
        email: emails[0],
        taskName: taskData.name,
      };
    });
  }

  // Remove Member from Task
  async unAssign(
    memberId: string,
    taskId: string
  ): Promise<{
    message: string;
    fullName: string;
    taskName: string;
    email: string;
  }> {
    return await db.runTransaction(async (transaction) => {
      const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
      const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);

      const [userSnap, taskSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(taskRef),
      ]);

      if (!userSnap.exists) {
        throw new ApiError("User does not exist", 400);
      }

      if (!taskSnap.exists) {
        throw new ApiError("Task does not exist", 400);
      }

      const taskData = taskSnap.data() as ITask;

      // Check if the user is not in the task
      if (!taskData.assignedTo.some((memId) => memId == memberId)) {
        throw new ApiError("Assign the user first.", 400);
      }

      // Check if the task is already completed
      if (taskData.status == "completed") {
        throw new ApiError(
          "You can not unassign this user as the task is already completed.",
          400
        );
      }

      // Decrease the pending count from the user
      const userData = userSnap.data() as IUser;

      transaction.update(userRef, {
        taskStatus: {
          ...userData.taskStatus,
          pending: (userData.taskStatus?.pending as number) - 1,
          updatedAt: new Date().toISOString(),
        },
      });

      transaction.update(taskRef, {
        assignedTo: firestore.FieldValue.arrayRemove(memberId),
      });

      return {
        message: "Unassigned user from the task",
        fullName: this.helper.extractFullName(userData.profile),
        taskName: taskData.name,
        email: userData.profile.email,
      };
    });
  }

  // Extend and Reduce deadline
  async mutuateDeadline(
    taskId: string,
    newDeadline: string,
    userId: string
  ): Promise<{ message: string; data: ITask }> {
    if (!dayjs(newDeadline).isValid()) {
      throw new ApiError("Invalid date", 400);
    }

    // Check if the task exists
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new ApiError("Task not found", 400);
    }

    await taskRef.update({
      deadline: firestore.FieldValue.arrayUnion(newDeadline),
      updatedAt: new Date().toISOString(),
    });

    const taskData = (await taskRef.get()).data() as ITask;

    // Write to Activity Log
    await this.activityService.writeTaskActivity({
      taskId,
      taskName: taskData.name,
      projectId: taskData.projectId,
      createdBy: userId,
      type: "mutate-deadline",
    });

    return {
      message: "Task deadline has been changed successfully",
      data: taskData,
    };
  }

  // Mark Task as Complete
  async markAsComplete(
    taskId: string,
    authData: {
      role: Role;
      uid: string;
    }
  ): Promise<{ message: string }> {
    return db.runTransaction(async (transaction) => {
      // Increment Project Complete Count for Members
      const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
      const taskSnap = await transaction.get(taskRef);

      if (!taskSnap.exists) {
        throw new ApiError("Project not found", 400);
      }

      // Iterate over all assigned personal
      // who are part of this task and
      const task = taskSnap.data() as ITask;

      // Check if the request is coming from a personal
      // who is part of the task
      if (
        !task.assignedTo.some((memId) => memId == authData.uid) &&
        !["admin", "teamLeader"].some((role) => role == authData.role)
      ) {
        throw new ApiError("Unauthorized", 401);
      }

      // Check if the project is already completed
      if (task.status == "completed") {
        throw new ApiError("Project is already completed!", 400);
      }

      // Completed by
      let completedBy = null;

      await Promise.all(
        task.assignedTo.map(async (memberId) => {
          // Check if member exists
          const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists) {
            throw new ApiError("User not found", 400);
          }

          // Increment completed project for each user
          const userData = userSnap.data() as IUser;
          const completedAmount = userData.taskStatus?.completed as number;
          const pendingAmount = userData.taskStatus?.pending as number;

          const newTaskStatus = {
            ...userData.taskStatus,
            completed: completedAmount + 1,
            pending: pendingAmount - 1,
            updatedAt: new Date().toISOString(),
          };

          transaction.update(userRef, { taskStatus: newTaskStatus });

          if (memberId === authData.uid) {
            completedBy = `${userData.profile.firstName} ${userData.profile.lastName}`;
          }
        })
      );

      // Finally mark as complete
      transaction.update(taskRef, {
        status: "completed",
        progress: 100,
        completedAt: new Date().toISOString(),
        completedBy: authData.uid,
      });

      // Write to activity logs
      await this.activityService.writeTaskActivity({
        taskId,
        type: "complete",
        taskName: task.name,
        projectId: task.projectId,
        completedBy: completedBy || authData.uid,
      });

      return { message: "Congratulations for completing the task!" };
    });
  }

  // Delete Task
  async deleteTask(
    taskId: string,
    userId: string
  ): Promise<{ message: string }> {
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new ApiError("Task not found", 400);
    }

    const taskData = taskSnap.data() as ITask;
    await taskRef.delete();

    // Write to Activity logs
    await this.activityService.writeTaskActivity({
      taskId,
      taskName: taskData.name,
      projectId: taskData.projectId,
      deletedBy: userId,
      type: "delete",
    });

    return { message: "Task has been deleted successfully!" };
  }

  // Fetch my tasks
  async fetchMyTasks(
    userId: string,
    deadline?: TaskFilter,
    userRole?: Role
  ): Promise<{ tasks: ITaskDetail[]; total: number }> {
    if (deadline && !["today", "upcoming", "all"].includes(deadline)) {
      throw new ApiError("Invalid filter", 400);
    }

    let tasksQuerySnap = null;

    if (userRole === "teamLeader") {
      tasksQuerySnap = await db
        .collection(COLLECTIONS.TASKS)
        .where("createdBy", "==", userId)
        .get();
    } else {
      tasksQuerySnap = await db
        .collection(COLLECTIONS.TASKS)
        .where("assignedTo", "array-contains", userId)
        .get();
    }

    const today = dayjs();

    const tasks = await Promise.all(
      tasksQuerySnap.docs.map(async (doc) => {
        const data = doc.data();

        if (deadline !== "all") {
          const deadlineArray: string[] = data.deadline || [];

          if (deadline && deadlineArray.length > 0) {
            const lastDeadline = dayjs(deadlineArray.at(-1));

            const isToday = lastDeadline.isSame(today, "day");
            const isUpcoming = lastDeadline.isAfter(today, "day");

            if (deadline === "today" && !isToday) return null;
            if (deadline === "upcoming" && !isUpcoming) return null;
          }
        }

        const projectDetail = await ProjectService.getProjectById(
          data.projectId
        );

        const assignedTo: IProjectMembers[] = await Promise.all(
          data.assignedTo.map(async (memId: string) => {
            const member = (await AuthServices.getUserById(memId)) as IUser;
            return {
              id: member.uid,
              name: `${member.profile.firstName} ${member.profile.lastName}`,
              role: member.role,
              email: member.profile.email,
              avatar: member.profile.profilePicture as string,
            };
          })
        );

        return {
          id: doc.id,
          ...data,
          projectName: projectDetail.name,
          assignedTo,
        } as ITaskDetail;
      })
    );

    return {
      tasks: tasks.filter(Boolean) as ITaskDetail[], // removes null values,
      total: tasks.filter(Boolean).length,
    };
  }

  // Update Progress
  async updateProgress(
    userId: string,
    userRole: Role,
    taskData: ITaskMetaData
  ): Promise<{ newProgressLevel: number }> {
    logger.info(`User Id: ${userId} started to update task progress.`);
    logger.info(`Task Id: ${taskData.taskId}`);

    // Check if the task exists
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskData.taskId);

    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new ApiError("Task doesn't exist.", 400);
    }

    // Check if the user is either ADMIN or Part of `assignedTo` field
    const taskDetail = taskSnap.data() as ITask;

    // If user id did not create the task or not an admin
    if (userRole == "teamLeader" && taskDetail.createdBy != userId) {
      logger.error("Neither task creator nor admin");
      throw new ApiError(
        "You can't update this task. You are not assigned to it.",
        401
      );
    }

    if (userRole === "teamMember") {
      const { assignedTo } = taskDetail;

      if (!assignedTo.some((memId: string) => memId == userId)) {
        logger.error(
          "User is not assigned to the task. So it can't update the progress."
        );
        throw new ApiError(
          "You can't update this task. You are not assigned to it.",
          401
        );
      }
    }

    // Check if the task progress is not decreased.
    // Allow decreasing by admin | teamLeader
    const { progress } = taskData;
    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw new ApiError("Invalid progress value", 400);
    }

    // Previous progress level
    const prevProgressLvl = taskDetail.progress;

    // Check if a member is trying to deprogress
    if (
      !["admin", "teamLeader"].some((role: string) => role == userRole) &&
      prevProgressLvl > progress
    ) {
      throw new ApiError("Invalid progress value", 400);
    }

    // Update task
    taskRef.update({ progress: taskData.progress });

    return { newProgressLevel: progress };
  }
}
