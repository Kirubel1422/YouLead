import { sendEmail } from "src/services/email";
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
}
