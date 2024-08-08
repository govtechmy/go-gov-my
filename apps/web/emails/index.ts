import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { JSXElementConstructor, ReactElement } from "react";

// Create an instance of SESClient
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Function to send email using SES and Nodemailer
export const sendEmail = async ({
  email,
  subject,
  from,
  react,
}: {
  email: string;
  subject: string;
  from?: string;
  react: ReactElement<any, string | JSXElementConstructor<any>>;
}): Promise<void> => {
  const sourceEmail = process.env.SES_EMAIL_SOURCE;
  if (!sourceEmail) {
    throw new Error("SES_EMAIL_SOURCE is not defined");
  }

  // Create Nodemailer transporter using SES transport
  const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } },
  });

  const htmlContent = render(react);
  const textContent = render(react, { pretty: true });

  const params = {
    from: sourceEmail,
    to: email,
    subject: subject,
    html: htmlContent,
    text: textContent,
  };

  // Send email using the transporter
  const response = await transporter.sendMail(params);

  if (process.env.NODE_ENV === "development") {
    console.info(`Email sent to ${email} with subject ${subject}`);
  }
};
