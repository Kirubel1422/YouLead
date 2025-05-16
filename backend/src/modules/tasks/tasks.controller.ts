import { ApiResp } from "src/utils/api/api.response";
import { Request, Response, NextFunction } from "express";
import { TaskService } from "./tasks.service";
import { ITaskMetaData, TaskFilter } from "src/interfaces/task.interface";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();

    this.createTask = this.createTask.bind(this);
    this.assignMembers = this.assignMembers.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.mutateDeadline = this.mutateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.unAssign = this.unAssign.bind(this);
    this.fetchMyTasks = this.fetchMyTasks.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
  }

  // Create Task Controller
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.taskService.createTask(
        req.body,
        req.user.uid
      );
      res.json(new ApiResp(message, 201, true, data));
    } catch (error) {
      next(error);
    }
  }

  // Assign Task Controller
  async assignMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.taskService.assignTask(
        req.body,
        req.params.taskId,
        req.user.uid
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Remove or Unassign user from a task
  async unAssign(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.taskService.unAssign(
        req.query.memberId as string,
        req.params.taskId
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Mutate Deadline Controller
  async mutateDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.taskService.mutuateDeadline(
        req.params.taskId,
        req.query.newDeadline as string,
        req.user.uid
      );
      res.json(new ApiResp(message, 200, true, data));
    } catch (error) {
      next(error);
    }
  }

  // Mark Project Complete Controller
  async markAsComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.taskService.markAsComplete(
        req.params.taskId,
        {
          role: req.user.role,
          uid: req.user.uid,
        }
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Delete Task Controller
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.taskService.deleteTask(
        req.params.taskId,
        req.user.uid
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Fetch My Tasks Controller
  async fetchMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.taskService.fetchMyTasks(
        req.user.uid,
        req.query.deadline as TaskFilter,
        req.user.role
      );
      res.json(new ApiResp("Successfully fetched tasks.", 200, true, data));
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const taskData = {
        progress: parseInt(req.query.progress as string),
        taskId: req.query.taskId,
      } as ITaskMetaData;

      const data = await this.taskService.updateProgress(
        req.user.uid,
        req.user.role,
        taskData
      );
      res.status(200).json(new ApiResp("Progress updated", 200, true, data));
    } catch (error) {
      next(error);
    }
  }
}
