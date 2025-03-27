import dayjs from "dayjs";
import { firestore } from "firebase-admin";
import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { IProject } from "src/interfaces/project.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import {
  ProjectAddMembersSchemaType,
  ProjectSchemaType,
} from "src/validators/project.validator";

export class ProjectService {
  constructor() {
    this.createProject = this.createProject.bind(this);
    this.addMembers = this.addMembers.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.mutuateDeadline = this.mutuateDeadline.bind(this);
    this.markAsComplete = this.markAsComplete.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
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
      deadline: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await projectCollection.add(newProjectData);

    return { message: "Project created successfully", data: newProjectData };
  }

  // Add Members to Project
  async addMembers(
    data: ProjectAddMembersSchemaType,
    projectId: string
  ): Promise<{ message: string }> {
    return await db.runTransaction(async (transaction) => {
      const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
      const projectSnap = await transaction.get(projectRef);
      const projectData = projectSnap.data() as IProject;

      if (!projectSnap.exists) {
        throw new ApiError("Project does not exist", 400);
      }

      // Process all members concurrently using Promise.all
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

          transaction.update(userRef, {
            projectStatus: {
              ...userData.projectStatus,
              pending: (userData.projectStatus?.pending ?? 0) + 1,
              updatedAt: new Date().toISOString(),
            },
          });
        })
      );

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

      transaction.update(projectRef, {
        members: firestore.FieldValue.arrayRemove(memberId),
      });

      return { message: "Member removed successfully" };
    });
  }

  // Extend and Reduce deadline
  async mutuateDeadline(
    projectId: string,
    newDeadline: string
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
      deadline: newDeadline,
      updatedAt: new Date().toISOString(),
    });
    const projectData = (await projectRef.get()).data() as IProject;

    return {
      message: "Project deadline has been changed successfully",
      data: projectData,
    };
  }

  // Mark Project as Complete
  async markAsComplete(projectId: string): Promise<{ message: string }> {
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

      transaction.update(projectRef, { status: "completed" });

      return { message: "Congratulations for completing the project!" };
    });
  }

  // Delete Project
  async deleteProject(projectId: string): Promise<{ message: string }> {
    const projectRef = db.collection(COLLECTIONS.PROJECTS).doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new ApiError("Project not found", 400);
    }

    await projectRef.delete();

    return { message: "Project has been deleted successfully!" };
  }
}
