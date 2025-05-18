export const taskUnAssignTemplate = (fullName: string, taskName: string) => {
  return `
        <html>
            <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">Task Unassignment</h2>
            <p>Dear ${fullName},</p>
            <p>You have been unassigned from the task: <strong>${taskName}</strong>.</p>
            <p>If you have any questions, please contact your team lead.</p>
            <p>Best regards,</p>
            <p>Your Team - You Lead</p>
            </div>
            </body>
        </html>
        `;
};
