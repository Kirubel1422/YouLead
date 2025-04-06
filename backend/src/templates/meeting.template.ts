import { IMeetingTemplate } from "src/interfaces/meeting.interface";

export const meetingEmail = (emailData: IMeetingTemplate): string => {
  return `
    <html>
        <body>
            <h1>Meeting</h1>
            <br/>
            <p>
                Dear ${
                  emailData.attendeeFirstName
                }, Hope you are doing well. A meeting has been setup for ${
    emailData.startDay
  }. 
            </p>
            <br/>
            <ul>
                <li>Meeting Link: <a href="${
                  emailData.link
                }">click here</a></li>
                ${
                  emailData.passcode != ""
                    ? `<li>Passcode: ${emailData.passcode}`
                    : ""
                }
            </ul>
        </body>
    </html>
    `;
};
