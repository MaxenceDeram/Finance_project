import nodemailer from "nodemailer";
import { getEnv } from "@/config/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  const env = getEnv();

  if (!env.SMTP_HOST) {
    console.info("email_dev_delivery", {
      to: input.to,
      subject: input.subject,
      text: input.text
    });
    return { provider: "console" as const };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD
          }
        : undefined
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });

  return { provider: "smtp" as const };
}
