export const taskAssignTemplate = (fullName: string, taskName: string) => {
  return `
      <html>
        <body>
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Task Assignment</h2>
        <p>Dear ${fullName},</p>
        <p>You have been assigned a new task: <strong>${taskName}</strong>.</p>
        <p>Please log in to your account to view the details and start working on it.</p>
        <p>Best regards,</p>
        <p>Your Team - You Lead</p>
        </div>
        </body>
    </html>
    `;
};
