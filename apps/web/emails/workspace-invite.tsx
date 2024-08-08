import { APP_NAME, DUB_LOGO } from "@dub/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { Fragment } from "react";
import Footer from "./components/footer";
import { PREVIEW_PROPS } from "./preview-props";

type Props = {
  email: string;
  url: string;
  workspaceName: string;
  workspaceUser?: string | null;
  workspaceUserEmail: string;
};

WorkspaceInvite.PreviewProps = {
  email: "ahmad@example.com",
  url: `http://localhost:8888/api/auth/callback/email?callbackUrl=http%3A%2F%2Fapp.localhost%3A3000%2Flogin&token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&email=ahmad@example.com`,
  workspaceName: PREVIEW_PROPS.WORKSPACE.NAME,
  workspaceUser: PREVIEW_PROPS.USER.NAME,
  workspaceUserEmail: PREVIEW_PROPS.USER.EMAIL,
} satisfies Props;

export default function WorkspaceInvite({
  email,
  url,
  workspaceName,
  workspaceUser,
  workspaceUserEmail,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Join {workspaceName} on {APP_NAME}
      </Preview>
      <Tailwind>
        <Fragment>
          <Body className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
              <Section className="mt-8">
                <Img
                  src={DUB_LOGO}
                  width="40"
                  height="40"
                  alt={APP_NAME}
                  className="mx-auto my-0"
                />
              </Section>
              <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
                Join {workspaceName} on {APP_NAME}
              </Heading>
              {workspaceUser ? (
                <Text className="text-sm leading-6 text-black">
                  <strong>{workspaceUser}</strong> (
                  <Link
                    className="text-blue-600 no-underline"
                    href={`mailto:${workspaceUserEmail}`}
                  >
                    {workspaceUserEmail}
                  </Link>
                  ) has invited you to join the workspace{" "}
                  <strong>&apos;{workspaceName}&apos;</strong> on {APP_NAME}!
                </Text>
              ) : (
                <Text className="text-sm leading-6 text-black">
                  You have been invited to join the workspace{" "}
                  <strong>&apos;{workspaceName}&apos;</strong> on {APP_NAME}!
                </Text>
              )}
              <Section className="my-8 text-center">
                <Link
                  className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                  href={url}
                >
                  Join Workspace
                </Link>
              </Section>
              <Text className="text-sm leading-6 text-black">
                or copy and paste this URL into your browser:
              </Text>
              <Text className="max-w-sm flex-wrap break-all font-medium text-purple-600 no-underline">
                {url}
              </Text>
              <Footer email={email} />
            </Container>
          </Body>
        </Fragment>
      </Tailwind>
    </Html>
  );
}
