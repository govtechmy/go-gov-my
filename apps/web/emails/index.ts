import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { JSXElementConstructor, ReactElement } from "react";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

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
  const sourceEmail = process.env.SES_EMAIL_SOURCE;
  if (!sourceEmail) {
    throw new Error("SES_EMAIL_SOURCE is not defined");
  }

  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendEmailCommand } },
  });

  const params = {
    from: sourceEmail,
    to: email,
    subject: subject,
    html: react ? render(react) : "",
    text: text || "", // Use the text field instead of data
  };

  const response = await transporter.sendMail(params);

  if (process.env.NODE_ENV === "development") {
    console.info(`Email sent to ${email} with subject ${subject}`);
  }
};
