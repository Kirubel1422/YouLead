import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { TaskActivity } from "src/interfaces/activity.interface";
import { AuthServices } from "../auth/auth.service";
// import { TaskService } from "../tasks/tasks.service";
import { ProjectService } from "../projects/projects.service";

export class ActivityService {
  private userService: AuthServices;
  //   private taskService: TaskService;
  private projectService: ProjectService;

  constructor() {
    // this.taskService = new TaskService();
    this.userService = new AuthServices();
    this.projectService = new ProjectService();
  }

  // Interactions with other classes
  async writeTaskActivity({
    type,
    userIds,
    taskId,
    names,
    taskName,
    createdBy,
    projectId,
    completedBy, // Can be user id or nme
    deletedBy,
  }: TaskActivity) {
    // If action is related to a task assignment
    switch (type) {
      case "assign":
        await this.onTaskAssign({
          names,
          taskName,
          taskId,
          createdBy,
          projectId,
        });
        break;
      case "create":
        await this.onTaskCreate({ taskName, projectId, createdBy });
        break;
      case "complete":
        await this.onTaskComplete({ taskId, completedBy, projectId, taskName });
        break;
      case "delete":
        await this.onTaskDelete({ taskId, taskName, projectId, deletedBy });
        break;
      case "mutate-deadline":
        await this.onTaskDeadlineMutation({
          taskId,
          taskName,
          projectId,
          createdBy,
        });
        break;
    }
  }

  async writeProjectActivity() {}

  async writeMeetingActivity() {}
  async writeTeamActivity() {}

  async writeUserActivity() {}
  async writeInvitationActivity() {}

  // Regarding Projects, Tasks, and Meetings
  private async onTaskCreate({
    createdBy,
    taskName,
    projectId,
  }: Partial<TaskActivity>) {
    const taskCreatorData = await this.userService.getUserById(
      createdBy as string
    );
    const taskCreatorFullName = `${taskCreatorData.profile.firstName} ${taskCreatorData.profile.lastName}`;

    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${taskCreatorFullName} created ${taskName} in ${projectName}.`;
    await db.collection(COLLECTIONS.ACTIVITES).add({
      activity: msg,
      superAdminOnly: false,
      entityId: projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Super Admin Only
  private async onTaskDelete({
    taskId,
    taskName,
    projectId,
    deletedBy,
  }: Partial<TaskActivity>) {
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;
    const taskDeleterData = await this.userService.getUserById(
      deletedBy as string
    );

    const taskDeleterFullName = `${taskDeleterData.profile.firstName} ${taskDeleterData.profile.lastName}`;
    const msg = `${taskDeleterFullName} deleted ${taskName} in ${projectName}`;

    await db.collection(COLLECTIONS.ACTIVITES).add({
      activity: msg,
      superAdminOnly: true,
      entityId: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async onTaskAssign({
    names,
    taskName,
    taskId,
    createdBy,
    projectId,
  }: Partial<TaskActivity>) {
    const taskAssignerData = await this.userService.getUserById(
      createdBy as string
    );
    const taskAssignerFullName = `${taskAssignerData.profile.firstName} ${taskAssignerData.profile.lastName}`;
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${taskAssignerFullName} assigned ${names?.join(
      ", "
    )} to ${taskName} in ${projectName}`;

    await db.collection(COLLECTIONS.ACTIVITES).add({
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async onTaskComplete({
    taskId,
    taskName,
    projectId,
    completedBy,
  }: Partial<TaskActivity>) {
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${completedBy} completed ${taskName} in ${projectName}`;

    await db.collection(COLLECTIONS.ACTIVITES).add({
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async onTaskDeadlineMutation({
    taskId,
    taskName,
    projectId,
    createdBy,
  }: Partial<TaskActivity>) {
    const taskMutatorData = await this.userService.getUserById(
      createdBy as string
    );
    const taskMutatorFullName = `${taskMutatorData.profile.firstName} ${taskMutatorData.profile.lastName}`;
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${taskMutatorFullName} changed the deadline of ${taskName} in ${projectName}`;

    await db.collection(COLLECTIONS.ACTIVITES).add({
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  //   private async onProjectAssign() {}
  //   private async onProjectCreate() {}
  //   private async onProjectDelete() {}
  //   private async onProjectComplete() {}
  //   private async onProjectDeadlineMutation() {}

  // Meeting
  //   private async onMeetingCreate() {}

  // Regarding Authentication
  //   private async onUserSignup() {} // Super Admin only
  //   private async onUserLogin() {} // Super Admin only
  //   private async onUserDelete() {} // Super Admin only

  // Regarding Teams
  //   private async onTeamCreate() {} // Super Admin only
  //   private async onTeamDelete() {} // Super Admin only

  //   private async onTeamMemberAdd() {}
  //   private async onTeamMemberRemove() {}

  // private async onTeamMemberRoleChange() {}

  // Regarding Invitations
  //   private async onInviteTeamMember() {}
  //   private async onInvitationAccept() {}
  //   private async onInvitationDecline() {}
  //   private async onInvitationCancel() {}
}
