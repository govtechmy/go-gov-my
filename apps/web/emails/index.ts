import { render } from "@react-email/render";
import AWS from "aws-sdk";
import nodemailer from "nodemailer";
import { JSXElementConstructor, ReactElement } from "react";
// import SMTPTransport from "nodemailer/lib/smtp-transport";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1", // Set your preferred region
});

AWS.config.getCredentials(function (error) {
  if (error) {
    console.log(error.stack);
  }
});

console.log("AWS.config", AWS.config);

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

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
  const transporter = nodemailer.createTransport({
    SES: ses,
  });

  if (!sourceEmail) {
    throw new Error("SES_EMAIL_SOURCE is not defined");
  }

  const params = {
    from: sourceEmail,
    to: email,
    subject: subject,
    html: react ? render(react) : "",
    data: text || "",
  };

  const response = await transporter.sendMail(params);

  if (process.env.NODE_ENV === "development") {
    console.info(`Email sent to ${email} with subject ${subject}`);
  }
};
