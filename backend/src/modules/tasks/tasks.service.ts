import dayjs from "dayjs";
import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IProject } from "src/interfaces/project.interface";
import { ITask } from "src/interfaces/task.interface";
import { IUser, Role } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import {
  TaskAddMembersSchemaType,
  TaskSchemaType,
} from "src/validators/task.validator";

export class TaskService {
  constructor() {
    this.createTask = this.createTask.bind(this);
    this.assignTask = this.assignTask.bind(this);
    this.unAssign = this.unAssign.bind(this);
    this.mutuateDeadline = this.mutuateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
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
    };

    await taskCollection.add(newTask);

    return { message: "Task created successfully", data: newTask };
  }

  // Assign Task
  async assignTask(
    data: TaskAddMembersSchemaType,
    taskId: string
  ): Promise<{ message: string }> {
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
          console.log(userData);
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

      return { message: "Successfully assigned Task!" };
    });
  }

  // Remove Member from Task
  async unAssign(
    memberId: string,
    taskId: string
  ): Promise<{ message: string }> {
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

      return { message: "Unassigned user from the task" };
    });
  }

  // Extend and Reduce deadline
  async mutuateDeadline(
    taskId: string,
    newDeadline: string
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
        })
      );

      // Finally mark as complete
      transaction.update(taskRef, { status: "completed" });

      return { message: "Congratulations for completing the task!" };
    });
  }

  // Delete Task
  async deleteTask(taskId: string): Promise<{ message: string }> {
    const taskRef = db.collection(COLLECTIONS.TASKS).doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
      throw new ApiError("Task not found", 400);
    }

    await taskRef.delete();

    return { message: "Task has been deleted successfully!" };
  }
}
