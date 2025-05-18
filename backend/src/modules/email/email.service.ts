import { sendEmail } from "src/services/email";
import { projectAssignTemplate } from "src/templates/projectAssign.template";
import { projectUnAssignTemplate } from "src/templates/projectUnAssign.template";
import { taskAssignTemplate } from "src/templates/taskAssign.template";
import logger from "src/utils/logger/logger";

export class EmailService {
  static async taskAssign(to: string, taskName: string, fullName: string) {
    const html = taskAssignTemplate(fullName, taskName);
    await sendEmail("Task Assignment", to, html);
    logger.info("Assign email sent to: " + to);
  }

  static async taskUnAssign(to: string, taskName: string, fullName: string) {
    const html = taskAssignTemplate(fullName, taskName);
    await sendEmail("Task Unassignment", to, html);
    logger.info("UnAssign email sent to: " + to);
  }

  static async projectAssign(
    to: string,
    projectName: string,
    fullName: string
  ) {
    const html = projectAssignTemplate(fullName, projectName);
    await sendEmail("Project Assignment", to, html);
    logger.info("Project Assign email sent to: " + to);
  }

  static async projectUnAssign(
    to: string,
    projectName: string,
    fullName: string
  ) {
    const html = projectUnAssignTemplate(fullName, projectName);
    await sendEmail("Project Unassignment", to, html);
    logger.info("Project UnAssign email sent to: " + to);
  }
}
