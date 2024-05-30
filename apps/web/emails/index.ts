import { render } from "@react-email/render";
import nodemailer, { SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { JSXElementConstructor, ReactElement } from "react";

const hasEnvVars =
  !!process.env.SMTP_HOST &&
  !!process.env.SMTP_PORT &&
  !!process.env.SMTP_USER &&
  !!process.env.SMTP_PASSWORD;

const smtpOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const client = hasEnvVars ? nodemailer.createTransport(smtpOptions) : null;

if (process.env.NODE_ENV === "production" && !client) {
  // Fail fast if it's a production environment
  throw Error(
    "Email is not configured. You may be missing some environment variables",
  );
}

export const sendEmail = async ({
  email,
  subject,
  from,
  text,
  react,
  marketing,
}: {
  email: string;
  subject: string;
  from?: string;
  text?: string;
  react?: ReactElement<any, string | JSXElementConstructor<any>>;
  marketing?: boolean;
}): Promise<void> => {
  if (!client) {
    console.error(
      "Email is not configured. You may be missing some environment variables",
    );
    return Promise.resolve();
  }

  const sendOptions: SendMailOptions = {
    from:
      from ||
      (marketing
        ? `system@marketing.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
        : `${process.env.NEXT_PUBLIC_APP_NAME} <system@${process.env.NEXT_PUBLIC_APP_DOMAIN}>`),
    to: email,
    replyTo: `support@${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
    subject: subject,
    text,
    ...(react && { html: render(react) }),
  };

  const response = await client.sendMail(sendOptions);

  if (process.env.NODE_ENV === "development") {
    const { to, subject, from } = sendOptions;
    const previewUrl = nodemailer.getTestMessageUrl(response);
    console.info(
      `Email to ${to} with subject ${subject} sent from ${from}\nPreview email: ${previewUrl}`,
    );
  }
};
