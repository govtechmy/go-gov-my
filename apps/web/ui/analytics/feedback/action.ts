'use server';

export async function submitFeedback(data: FormData) {
  const email = data.get('email') as string;
  const feedback = data.get('feedback') as string;

  // Disabled since we do not have a receiving email yet
  // await sendEmail({
  //   from: `feedback@${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  //   email: "",
  //   subject: "🎉 New Feedback Received!",
  //   react: FeedbackEmail({ email, feedback }),
  // });
}
