import { transport } from "src/configs/nodemailer";
import { ENV } from "src/constants/dotenv";
import { ApiError } from "src/utils/api/api.response";

export const sendEmail = async (
  subject: string,
  to: string,
  html: string,
  from: string = ENV.APP_EMAIL as string
) => {
  try {
    return await transport.sendMail({
      subject,
      to,
      from,
      html,
    });
  } catch (error) {
    throw new ApiError("Failed to send sms.", 500);
  }
};
