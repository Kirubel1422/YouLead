import dayjs from "dayjs";
import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IProject } from "src/interfaces/project.interface";
import { IUser, Role } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import {
  ProjectAddMembersSchemaType,
  ProjectSchemaType,
} from "src/validators/project.validator";
import { ActivityService } from "../activities/activities.service";
import { Helper } from "src/utils/helpers";

interface Pagination {
  page: number;
  limit: number;
}

export class ProjectService {
  private activityService: ActivityService;
  private helper: Helper;

  constructor() {
    this.activityService = new ActivityService();
    this.helper = new Helper();

    this.createProject = this.createProject.bind(this);
    this.addMembers = this.addMembers.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.mutuateDeadline = this.mutuateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.getMyProjects = this.getMyProjects.bind(this);
    this.fetchProjectMembers = this.fetchProjectMembers.bind(this);
  }

  // Fetch project members
  async fetchProjectMembers(
    projectId: string,
    userId: string
  ): Promise<Partial<IUser & { id: string }>[]> {
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new ApiError("Project not found", 400);
    }

    const projectData = projectSnap.data() as IProject;

    // if (projectData.createdBy != userId) {
    //   throw new ApiError("Unauthorized", 401);
    // }

    if (projectData.members.length == 0) {
      return [];
    }

    // Fetch all members
    const membersRef = db
      .collection(COLLECTIONS.USERS)
      .where("uid", "in", projectData.members);

    const membersSnap = await membersRef.get();

    return membersSnap.docs.map((doc) => ({
      name: doc.data().profile.firstName + " " + doc.data().profile.lastName,
      email: doc.data().profile.email,
      id: doc.id,
    })) as Partial<IUser & { id: string }>[];
  }

  // Create Project
  async createProject(
    projectData: ProjectSchemaType,
    createdBy: string
  ): Promise<{
    message: string;
    data: IProject;
  }> {
    // Project name must be unique
    const projectCollection = db.collection(COLLECTIONS.PROJECTS);
    const projectQuery = projectCollection
      .where("name", "==", projectData.name)
      .count();
    const projectSnap = await projectQuery.get();

    if (projectSnap.data().count > 0) {
      throw new ApiError("Project name must be unique", 400);
    }

    // Save Project
    const newProjectData: IProject = {
      ...projectData,
      createdBy,
      status: "pending",
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await projectCollection.add(newProjectData);

    // Write to Activity Log
    await this.activityService.writeProjectActivity({
      projectName: projectData.name,
      createdBy,
      teamId: projectData.teamId,
      type: "create",
    });

    return { message: "Project created successfully", data: newProjectData };
  }

  // Add Members to Project
  async addMembers(
    data: ProjectAddMembersSchemaType,
    projectId: string,
    userId: string
  ): Promise<{ message: string }> {
    return await db.runTransaction(async (transaction) => {
      const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
      const projectSnap = await transaction.get(projectRef);

      if (!projectSnap.exists) {
        throw new ApiError("Project does not exist", 400);
      }

      const projectData = projectSnap.data() as IProject;

      // Process all members concurrently using Promise.all
      const names: string[] = [];
      await Promise.all(
        data.members.map(async (memberId: string) => {
          const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
          const userSnap = await transaction.get(userRef);

          // Check if the member is already in the project
          if (projectData.members.some((preMember) => preMember == memberId)) {
            throw new ApiError("User is already in the project", 400);
          }

          // Check if the user exists
          if (!userSnap.exists) {
            throw new ApiError(`${memberId} is not found`, 400);
          }

          const userData = userSnap.data() as IUser;

          // Append full names to `names` array
          const fullName = this.helper.extractFullName(userData.profile);
          names.push(fullName);

          transaction.update(userRef, {
            projectStatus: {
              ...userData.projectStatus,
              pending: (userData.projectStatus?.pending ?? 0) + 1,
              updatedAt: new Date().toISOString(),
            },
          });
        })
      );

      // Add to Activity Log
      await this.activityService.writeProjectActivity({
        names,
        createdBy: userId,
        projectId,
        projectName: projectData.name,
        type: "assign",
      });

      // Add members to project
      transaction.update(projectRef, {
        members: firestore.FieldValue.arrayUnion(...data.members),
      });

      return { message: "Successfully added users to project!" };
    });
  }

  // Remove Member from Project
  async removeMember(
    memberId: string,
    projectId: string
  ): Promise<{ message: string }> {
    return await db.runTransaction(async (transaction) => {
      const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
      const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);

      const [userSnap, projectSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(projectRef),
      ]);

      if (!userSnap.exists) {
        throw new ApiError("User does not exist", 400);
      }

      if (!projectSnap.exists) {
        throw new ApiError("Project does not exist", 400);
      }

      // Check if the project is already completed
      const projectData = projectSnap.data() as IProject;

      if (projectData.status == "completed") {
        throw new ApiError(
          "You can not unassign this user as the project is already completed.",
          400
        );
      }

      // Decrease the pending count from the user
      const userData = userSnap.data() as IUser;
      transaction.update(userRef, {
        projectStatus: {
          ...userData.projectStatus,
          pending: (userData.projectStatus?.pending as number) - 1,
        },
      });

      transaction.update(projectRef, {
        members: firestore.FieldValue.arrayRemove(memberId),
      });

      return { message: "Member removed successfully" };
    });
  }

  // Extend and Reduce deadline
  async mutuateDeadline(
    projectId: string,
    newDeadline: string,
    userId: string
  ): Promise<{ message: string; data: IProject }> {
    if (!dayjs(newDeadline).isValid()) {
      throw new ApiError("Invalid date", 400);
    }

    // Check if the project exists
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new ApiError("Project not found", 400);
    }

    await projectRef.update({
      deadline: firestore.FieldValue.arrayUnion(newDeadline),
      updatedAt: new Date().toISOString(),
    });

    const projectData = (await projectRef.get()).data() as IProject;

    // Write to Activity Log
    await this.activityService.writeProjectActivity({
      createdBy: userId,
      projectId,
      projectName: projectData.name,
      type: "mutate-deadline",
    });

    return {
      message: "Project deadline has been changed successfully",
      data: projectData,
    };
  }

  // Mark Project as Complete
  async markAsComplete(
    projectId: string,
    authData: { role: Role; uid: string }
  ): Promise<{ message: string }> {
    return db.runTransaction(async (transaction) => {
      // Increment Project Complete Count for Members
      const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
      const projectSnap = await transaction.get(projectRef);

      if (!projectSnap.exists) {
        throw new ApiError("Project not found", 400);
      }

      // Iterate over all members who are part of this project and
      // Increment complete count
      const project = projectSnap.data() as IProject;

      // Check if the request is coming from a personal
      // who is part of the task
      if (
        !project.members.some((memId) => memId == authData.uid) &&
        !["admin", "teamLeader"].some((role) => role == authData.role)
      ) {
        throw new ApiError("Unauthorized", 401);
      }

      // Check if the project is already completed
      if (project.status == "completed") {
        throw new ApiError("Project is already completed!", 400);
      }

      await Promise.all(
        project.members.map(async (memberId) => {
          // Check if member exists
          const userRef = db.collection(COLLECTIONS.USERS).doc(memberId);
          const userSnap = await transaction.get(userRef);

          if (!userSnap.exists) {
            throw new ApiError("User not found", 400);
          }

          // Increment completed project for each user
          const userData = userSnap.data() as IUser;
          const completedAmount = userData.projectStatus?.completed as number;
          const pendingAmount = userData.projectStatus?.pending as number;

          const newProjectStatus = {
            ...userData.projectStatus,
            completed: completedAmount + 1,
            pending: pendingAmount - 1,
            updatedAt: new Date().toISOString(),
          };

          transaction.update(userRef, { projectStatus: newProjectStatus });
        })
      );

      // Write to Activity Log
      await this.activityService.writeProjectActivity({
        projectId,
        completedBy: authData.uid,
        type: "complete",
      });

      transaction.update(projectRef, { status: "completed" });

      return { message: "Congratulations for completing the project!" };
    });
  }

  // Delete Project
  async deleteProject(
    projectId: string,
    userId: string
  ): Promise<{ message: string }> {
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new ApiError("Project not found", 400);
    }

    const projectData = projectSnap.data() as IProject;
    await projectRef.delete();

    // Write to Activity Log
    await this.activityService.writeProjectActivity({
      teamId: projectData.teamId,
      deletedBy: userId,
      projectId,
      projectName: projectData.name,
      type: "delete",
    });

    return { message: "Project has been deleted successfully!" };
  }

  /*
  Fetch my projects
  based on the decoded token
  */
  async getMyProjects(
    userId: string,
    reqTeamId: string,
    { page, limit }: Pagination
  ): Promise<{ total: number; projects: Partial<IProject>[] }> {
    // Parse teamid from the user
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userData = (await userRef.get()).data();
    const { teamId } = userData as IUser;

    // Check if the user is part of the team where the request
    // is coming from
    logger.info(`user id:  ${userId}`);
    logger.info(`reqTeamId:  ${reqTeamId}  - teamId: ${teamId}`);
    if (teamId != reqTeamId) {
      throw new ApiError("Unauthorized to read projects.", 403);
    }

    // Check user role and if it's the leader return all projects
    if (userData?.role === "teamLeader") {
      const projectsQ = db
        .collection(COLLECTIONS.PROJECTS)
        .where("teamId", "==", teamId)
        .where("createdBy", "==", userId);

      const total = (await projectsQ.get()).size; // Size of all matching docs
      const paginatedQuery = projectsQ.offset((page - 1) * limit).limit(limit);
      const paginatedQueryRef = await paginatedQuery.get();
      const projects = paginatedQueryRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Partial<IProject>[];
      return { total, projects };
    }

    // Read projects which contain this user
    // as part of their project members
    const projectsQuery = db
      .collection(COLLECTIONS.PROJECTS)
      .where("members", "array-contains", userId); // Query all
    const total = (await projectsQuery.get()).size; // Size of all matching docs

    const paginatedQuery = projectsQuery
      .offset((page - 1) * limit)
      .limit(limit);

    const paginatedQueryRef = await paginatedQuery.get();

    const projects = paginatedQueryRef.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as IProject[];

    return { total, projects };
  }

  /**
   *
   * @param projectId
   * @returns
   */
  static async getProjectById(projectId: string): Promise<IProject> {
    const projectSnap = await db
      .collection(COLLECTIONS.PROJECTS)
      .doc(projectId)
      .get();

    if (!projectSnap.exists) {
      throw new ApiError("Project not found", 400);
    }

    const projectData = projectSnap.data() as IProject;

    return {
      ...projectData,
      id: projectSnap.id,
    };
  }
}
