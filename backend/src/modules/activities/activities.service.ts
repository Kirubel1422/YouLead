import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import {
  AuthActivity,
  IActivity,
  InvitationActivity,
  MeetingActivity,
  ProjectAcitivity,
  TaskActivity,
  TeamActivity,
} from "src/interfaces/activity.interface";
import { AuthServices } from "../auth/auth.service";
// import { TaskService } from "../tasks/tasks.service";
import { ProjectService } from "../projects/projects.service";
import { Helper } from "src/utils/helpers";

export class ActivityService {
  private userService: AuthServices;
  //   private taskService: TaskService;
  private projectService: ProjectService;
  private helper: Helper;

  constructor() {
    // this.taskService = new TaskService();
    this.userService = new AuthServices();
    this.projectService = new ProjectService();

    this.helper = new Helper();
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
          type,
        });
        break;
      case "create":
        await this.onTaskCreate({ taskName, projectId, createdBy, type });
        break;
      case "complete":
        await this.onTaskComplete({
          taskId,
          completedBy,
          projectId,
          taskName,
          type,
        });
        break;
      case "delete":
        await this.onTaskDelete({
          taskId,
          taskName,
          projectId,
          deletedBy,
          type,
        });
        break;
      case "mutate-deadline":
        await this.onTaskDeadlineMutation({
          taskId,
          taskName,
          projectId,
          createdBy,
          type,
        });
        break;
    }
  }

  async writeProjectActivity({
    projectId,
    projectName,
    createdBy,
    teamId,
    deletedBy,
    type,
    completedBy,
    names,
  }: ProjectAcitivity) {
    switch (type) {
      case "assign":
        await this.onProjectAssign({
          names,
          createdBy,
          projectId,
          projectName,
          type,
        });
        break;
      case "complete":
        await this.onProjectComplete({
          projectId,
          completedBy,
          type,
        });
        break;
      case "create":
        await this.onProjectCreate({
          projectName,
          createdBy,
          teamId,
          type,
        });
        break;
      case "delete":
        await this.onProjectDelete({
          teamId,
          deletedBy,
          projectId,
          projectName,
          type,
        });
        break;
      case "mutate-deadline":
        await this.onProjectDeadlineMutation({
          createdBy,
          projectId,
          projectName,
          type,
        });
        break;
    }
  }

  async writeMeetingActivity({
    createdBy,
    teamId,
    startTime,
    type,
  }: Omit<MeetingActivity, "meetingId">) {
    switch (type) {
      case "create":
        await this.onMeetingCreate({ createdBy, teamId, startTime, type });
    }
  }

  async writeAuthActivity({ type, deletedBy, email, ip, uid }: AuthActivity) {
    switch (type) {
      case "delete":
        await this.onUserDelete({ ip, email, deletedBy, type });
        break;
      case "login":
        await this.onUserLogin({ email, ip, uid, type });
        break;
      case "signup":
        await this.onUserSignup({ email, ip, uid, type });
        break;
    }
  }

  async writeTeamActivity({
    email,
    type,
    uid,
    teamName,
    teamId,
  }: TeamActivity) {
    switch (type) {
      case "create":
        await this.onTeamCreate({ email, uid, teamName, type });
        break;
      case "delete":
        await this.onTeamDelete({ uid, teamName, type });
        break;
      case "remove-member":
        await this.onTeamMemberRemove({ email, uid, teamId, type });
        break;
    }
  }

  async writeInvitationActivity({
    type,
    inviteeId,
    teamId,
    userId,
    invitationId,
  }: InvitationActivity) {
    switch (type) {
      case "invite":
        await this.onInviteTeamMember({ inviteeId, teamId, userId, type });
        break;
      case "accept":
        await this.onInvitationAccept({ inviteeId, teamId, type });
        break;
      case "cancel":
        await this.onInvitationCancel({ userId, invitationId, type });
        break;
      case "decline":
        await this.onInvitationDecline({ inviteeId, teamId, type });
        break;
    }
  }

  // Regarding Projects, Tasks, and Meetings
  private async onTaskCreate({
    createdBy,
    taskName,
    projectId,
    type,
  }: Partial<TaskActivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${fullName} created ${taskName} in ${projectName}.`;
    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: projectId,
      ...this.helper.fillTimeStamp(),
      context: "task",
      type: type as string,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Super Admin Only
  private async onTaskDelete({
    taskName,
    projectId,
    deletedBy,
    type,
  }: Partial<TaskActivity>) {
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const userData = await this.userService.getUserById(deletedBy as string);

    const fullName = this.helper.extractFullName(userData.profile);
    const msg = `${fullName} deleted ${taskName} in ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: true,
      entityId: projectId,
      ...this.helper.fillTimeStamp(),
      context: "task",
      type: type as string,
    };
    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onTaskAssign({
    names,
    taskName,
    taskId,
    createdBy,
    projectId,
    type,
  }: Partial<TaskActivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${fullName} assigned ${names?.join(
      ", "
    )} to ${taskName} in ${projectName}`;

    const activity: IActivity = {
      type: type as string,
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      ...this.helper.fillTimeStamp(),
      context: "task",
    };
    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onTaskComplete({
    taskId,
    taskName,
    projectId,
    completedBy,
    type,
  }: Partial<TaskActivity>) {
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${completedBy} completed ${taskName} in ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      ...this.helper.fillTimeStamp(),
      context: "task",
      type: type as string,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onTaskDeadlineMutation({
    taskId,
    taskName,
    projectId,
    createdBy,
    type,
  }: Partial<TaskActivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );

    const projectName = projectData.name;
    const msg = `${fullName} changed the deadline of ${taskName} in ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: taskId,
      ...this.helper.fillTimeStamp(),
      context: "task",
      type: type as string,
    };
    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onProjectCreate({
    projectName,
    createdBy,
    teamId,
    type,
  }: Partial<ProjectAcitivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const msg = `${fullName} created ${projectName}.`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: teamId,
      ...this.helper.fillTimeStamp(),
      context: "project",
      type: type as string,
    };
    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onProjectAssign({
    names,
    createdBy,
    projectId,
    projectName,
  }: Partial<ProjectAcitivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const msg = `${fullName} assigned ${names?.join(", ")} to ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: projectId,
      ...this.helper.fillTimeStamp(),
      context: "project",
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Super Admin Only
  private async onProjectDelete({
    teamId,
    deletedBy,
    projectName,
  }: Partial<ProjectAcitivity>) {
    const userData = await this.userService.getUserById(deletedBy as string);

    const fullName = this.helper.extractFullName(userData.profile);
    const msg = `${fullName} deleted ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: true,
      entityId: teamId,
      ...this.helper.fillTimeStamp(),
      context: "project",
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onProjectComplete({
    projectId,
    completedBy,
  }: Partial<ProjectAcitivity>) {
    const projectData = await this.projectService.getProjectById(
      projectId as string
    );
    const projectName = projectData.name;

    const msg = `${completedBy} completed ${projectName}`;

    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: projectId,
      ...this.helper.fillTimeStamp(),
      context: "project",
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onProjectDeadlineMutation({
    createdBy,
    projectName,
    projectId,
  }: Partial<ProjectAcitivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const msg = `${fullName} changed the deadline of ${projectName}`;
    const activity: IActivity = {
      activity: msg,
      superAdminOnly: false,
      entityId: projectId,
      ...this.helper.fillTimeStamp(),
      context: "project",
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Meeting
  private async onMeetingCreate({
    createdBy,
    teamId,
    startTime,
  }: Partial<MeetingActivity>) {
    const userData = await this.userService.getUserById(createdBy as string);
    const fullName = this.helper.extractFullName(userData.profile);

    const msg = `${fullName} scheduled meeting for ${startTime}`;
    const activity: IActivity = {
      activity: msg,
      context: "meeting",
      superAdminOnly: false,
      entityId: teamId,
      ...this.helper.fillTimeStamp(),
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Regarding Authentication
  // Super Admin only
  private async onUserSignup({
    ip,
    email,
    uid,
  }: Omit<AuthActivity, "deletedBy" | "type">) {
    const msg = `${email} registered from ${ip}`;
    const activity: IActivity = {
      activity: msg,
      context: "auth",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: uid,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Super Admin only
  private async onUserLogin({
    ip,
    email,
    uid,
  }: Omit<AuthActivity, "deletedBy" | "type">) {
    const msg = `${email} signed in from ${ip}`;
    const activity: IActivity = {
      activity: msg,
      context: "auth",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: uid,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Super Admin only
  private async onUserDelete({
    ip,
    email,
    deletedBy,
  }: Omit<AuthActivity, "type" | "uid">) {
    const msg = `${deletedBy} deleted ${email} from ${ip}`;
    const activity: IActivity = {
      activity: msg,
      context: "auth",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: deletedBy,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Regarding Teams
  // Super Admin only
  private async onTeamCreate({
    email,
    uid,
    teamName,
  }: Omit<TeamActivity, "type">) {
    const msg = `${email} created team: ${teamName}`;
    const activity: IActivity = {
      activity: msg,
      context: "team",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: false,
      entityId: uid,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Super Admin only
  private async onTeamDelete({ uid, teamName }: Partial<TeamActivity>) {
    const userData = await this.userService.getUserById(uid as string);
    const email = userData.profile.email;

    const msg = `${email} deleted ${teamName}`;
    const activity: IActivity = {
      ...this.helper.fillTimeStamp(),
      activity: msg,
      entityId: uid,
      context: "team",
      superAdminOnly: true,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }
  private async onTeamMemberRemove({
    email,
    uid,
    teamId,
  }: Partial<TeamActivity>) {
    const msg = `${email} removed ${uid} from ${teamId}`;
    const activity: IActivity = {
      activity: msg,
      context: "team",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: teamId,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // Regarding Invitations
  // Super Admin only
  private async onInviteTeamMember({
    userId, // inviter
    inviteeId,
    teamId,
  }: Omit<InvitationActivity, "type">) {
    const msg = `${userId} invited ${inviteeId} to ${teamId}`;

    const activity: IActivity = {
      activity: msg,
      context: "invitation",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: teamId,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onInvitationAccept({
    inviteeId,
    teamId,
  }: Omit<InvitationActivity, "userId" | "type">) {
    const msg = `${inviteeId} accepted invitation to ${teamId}`;

    const activity: IActivity = {
      activity: msg,
      context: "invitation",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: teamId,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  private async onInvitationDecline({
    inviteeId,
    teamId,
  }: Omit<InvitationActivity, "userId" | "type">) {
    const msg = `${inviteeId} rejected invitation to ${teamId}`;

    const activity: IActivity = {
      activity: msg,
      context: "invitation",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: teamId,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }

  // userId = inviterId
  private async onInvitationCancel({
    userId,
    invitationId,
  }: Omit<InvitationActivity, "type" | "inviteeId" | "teamId">) {
    const msg = `${userId} cancelled ${invitationId}`;

    const activity: IActivity = {
      activity: msg,
      context: "invitation",
      ...this.helper.fillTimeStamp(),
      superAdminOnly: true,
      entityId: invitationId,
    };

    await db.collection(COLLECTIONS.ACTIVITES).add(activity);
  }
}
