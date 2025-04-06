import { ENV } from "src/constants/dotenv";
import nodemailer from "nodemailer";
import { TransportOptions } from "nodemailer";

const nodemailerConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ENV.APP_EMAIL,
    pass: ENV.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
};

export const transport = nodemailer.createTransport(
  nodemailerConfig as TransportOptions
);
