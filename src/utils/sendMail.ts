import nodemailer from "nodemailer";
import { getTemplate } from "./getMailTemplates";

export type EmailOptions = {
  email: string;
  subject: string;
  message: string;
  username?: string;
  tag?: string
};
export const sendMail = async (options: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: options.email,
      subject: options.subject,
      html: getTemplate(options),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
