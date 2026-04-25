import { appendFile } from "node:fs/promises";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { EmailProvider } from "@prisma/client";
import nodemailer from "nodemailer";
import { getEnv } from "@/config/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
};

export type SendEmailResult = {
  provider: EmailProvider;
  messageId?: string | null;
  from: string;
};

let cachedSesClient: SESv2Client | null = null;

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEnv();
  const from = input.from ?? env.SMTP_FROM;
  const provider = getConfiguredEmailProvider();

  if (provider === "CONSOLE") {
    await appendFile(
      ".dev-emails.log",
      [
        "----- DEV EMAIL -----",
        `To: ${input.to}`,
        `From: ${from}`,
        `Subject: ${input.subject}`,
        input.text,
        ""
      ].join("\n"),
      "utf8"
    );

    console.info("email_dev_delivery", {
      to: input.to,
      from,
      subject: input.subject
    });

    return { provider, from, messageId: null };
  }

  if (provider === "SES") {
    const client = getSesClient();
    const response = await client.send(
      new SendEmailCommand({
        FromEmailAddress: from,
        Destination: {
          ToAddresses: [input.to]
        },
        ReplyToAddresses: input.replyTo ? [input.replyTo] : undefined,
        ConfigurationSetName: env.AWS_SES_CONFIGURATION_SET || undefined,
        Content: {
          Simple: {
            Subject: {
              Charset: "UTF-8",
              Data: input.subject
            },
            Body: {
              Html: {
                Charset: "UTF-8",
                Data: input.html
              },
              Text: {
                Charset: "UTF-8",
                Data: input.text
              }
            }
          }
        }
      })
    );

    return {
      provider,
      from,
      messageId: response.MessageId ?? null
    };
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

  const response = await transporter.sendMail({
    from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    text: input.text
  });

  return {
    provider,
    from,
    messageId: response.messageId
  };
}

export function getConfiguredEmailProvider(): EmailProvider {
  const env = getEnv();

  switch (env.EMAIL_PROVIDER) {
    case "console":
      return "CONSOLE";
    case "smtp":
      return "SMTP";
    case "ses":
      return "SES";
    default:
      if (env.AWS_SES_REGION || env.AWS_REGION) {
        return "SES";
      }
      if (env.SMTP_HOST) {
        return "SMTP";
      }
      return "CONSOLE";
  }
}

function getSesClient() {
  if (cachedSesClient) {
    return cachedSesClient;
  }

  const env = getEnv();
  const region = env.AWS_SES_REGION || env.AWS_REGION;

  if (!region) {
    throw new Error("AWS SES region is not configured.");
  }

  cachedSesClient = new SESv2Client({
    region
  });

  return cachedSesClient;
}
