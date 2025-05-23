import { ApiResp } from "src/utils/api/api.response";
import { ProjectService } from "./projects.service";
import { Request, Response, NextFunction } from "express";
import { EmailService } from "../email/email.service";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
    this.createProject = this.createProject.bind(this);
    this.addMembers = this.addMembers.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.mutateDeadline = this.mutateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.my = this.my.bind(this);
    this.getProjectMembers = this.getProjectMembers.bind(this);
    this.getMyProjects = this.getMyProjects.bind(this);
    this.updateProject = this.updateProject.bind(this);
  }

  // Update project controller
  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.projectService.updateProject(
        req.params.projectId,
        req.body,
        req.user.role,
        req.user.uid
      );
      res.json(new ApiResp(message, 200, true, message));
    } catch (error) {
      next(error);
    }
  }

  // Get project members controller
  async getProjectMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await this.projectService.fetchProjectMembers(
        req.params.projectId,
        req.user.uid
      );
      res.json(new ApiResp("Members fetched successfully", 200, true, members));
    } catch (error) {
      next(error);
    }
  }

  // Create Project Controller
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.projectService.createProject(
        req.body,
        req.user.uid
      );
      res.json(new ApiResp(message, 201, true, data));
    } catch (error) {
      next(error);
    }
  }

  // Add Members Controller
  async addMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, email, fullName, projectName } =
        await this.projectService.addMembers(
          req.body,
          req.params.projectId,
          req.user.uid
        );
      res.json(new ApiResp(message, 200));
      EmailService.projectAssign(email, projectName, fullName);
    } catch (error) {
      next(error);
    }
  }

  // Remove Member from Project Controller
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, email, fullName, projectName } =
        await this.projectService.removeMember(
          req.query.memberId as string,
          req.params.projectId
        );
      res.json(new ApiResp(message, 200));
      EmailService.projectUnAssign(email, projectName, fullName);
    } catch (error) {
      next(error);
    }
  }

  // Mutate Deadline Controller
  async mutateDeadline(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.projectService.mutuateDeadline(
        req.params.projectId,
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
      const { message } = await this.projectService.markAsComplete(
        req.params.projectId,
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

  // Mark Project Complete Controller
  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.projectService.deleteProject(
        req.params.projectId,
        req.user.uid
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Fetch my projects
  async getMyProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, page, limit } = req.query;

      const { projects, total } = await this.projectService.getMyProjects(
        req.user.uid,
        teamId as string,
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );
      res.json(new ApiResp("Sucess", 200, true, { projects, total }));
    } catch (error) {
      next(error);
    }
  }
  async getProjectById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ProjectService.getProjectById(req.params.projectId);
      res.json(new ApiResp("Success", 200, true, data));
    } catch (error) {
      next(error);
    }
  }

  async my(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await this.projectService.getMyProjects(
        req.user.uid,
        req.query.teamId as string,
        {
          page: parseInt(req.query.page as string) || 1,
          limit: parseInt(req.query.limit as string) || 8,
        }
      );

      res
        .status(200)
        .json(
          new ApiResp("Successfully fetched projects.", 200, true, projects)
        );
    } catch (error) {
      next(error);
    }
  }
}
