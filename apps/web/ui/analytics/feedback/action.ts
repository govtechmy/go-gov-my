"use server";

import { sendEmail } from "emails";
import FeedbackEmail from "emails/feedback-email";

export async function submitFeedback(data: FormData) {
  const email = data.get("email") as string;
  const feedback = data.get("feedback") as string;

  await sendEmail({
    from: "feedback@dub.co",
    email: "steven@dub.co",
    subject: "🎉 New Feedback Received!",
    react: FeedbackEmail({ email, feedback }),
  });
}
