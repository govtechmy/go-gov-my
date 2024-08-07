import { DUB_LOGO, DUB_THUMBNAIL } from "@dub/utils";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import Footer from "./components/footer";

export default function RebrandEmail({
  name = "Abu Kassim",
  email = "name@agency.gov.my",
}: {
  name: string | null;
  email: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Today, we're thrilled to announce our rebrand. Dub.sh is now Dub.co.
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={DUB_LOGO}
                width="40"
                height="40"
                alt="GoGovMY"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Dub​.sh is rebranding to Dub​.co
            </Heading>
            <Section className="my-8">
              <Img
                src={DUB_THUMBNAIL}
                alt="GoGovMY"
                className="max-w-[500px]"
              />
            </Section>
            <Text className="text-sm leading-6 text-black">
              Hey{name ? ` ${name}` : " there"}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              Hey! We're from GovTech. Today, we have some exciting news to
              share with you.
            </Text>
            <Text className="text-sm font-bold leading-6 text-black">
              GoGovMY is rebranding to GoGovMy
            </Text>
            <Text className="text-sm leading-6 text-black">
              You can learn more about the rebrand and what's changing{" "}
              <Link
                href="https://github.com/govtechmy/go-gov-my/discussions"
                className="font-medium text-blue-600 no-underline"
              >
                in this blog post
              </Link>
              .
            </Text>
            <Text className="text-sm leading-6 text-black">
              Moving forward, we'll also be sending product update emails from{" "}
              <strong>ship.dub​.co</strong> instead of{" "}
              <strong>ship.dub​.sh</strong>. We'd appreciate it if you can add{" "}
              <strong>ship.dub​.co</strong> to your email whitelist to ensure
              you receive our emails.
            </Text>
            <Hr />
            <Text className="text-sm leading-6 text-black">
              Along with the rebrand, we've also been working on a multitude of
              new features. In the last 30 days, we rolled out 9 major updates:
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆{" "}
              <Link
                href="https://github.com/govtechmy/go-gov-my/discussions"
                className="font-bold text-blue-600 no-underline"
              >
                Migration Assistants
              </Link>{" "}
              for Bitly and Short​.io
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆{" "}
              <Link
                href="https://github.com/govtechmy/go-gov-my/discussions"
                className="font-bold text-blue-600 no-underline"
              >
                Dub Help Center
              </Link>{" "}
              - a one-stop shop for all your Dub questions
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Geo Targeting</strong> - Redirect visitors based on
              their location
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link comments</strong> - Leave comments on your links
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link Cloaking</strong> – Mask your destination URL
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Custom QR Codes</strong> – Available on the Pro plan
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Custom Social Media Cards</strong>
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Detailed Link Stats</strong>
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link Pagination</strong>
            </Text>
            <Text className="text-sm leading-6 text-black">
              Check out our{" "}
              <Link
                href="https://github.com/govtechmy/go-gov-my/releases"
                className="font-medium text-blue-600 no-underline"
              >
                changelog
              </Link>{" "}
              to see what's new on Dub.
            </Text>

            <Text className="text-sm leading-6 text-black">
              Let us know if you have any questions or feedback. We're always
              happy to help!
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-400">
              GovTech Team
            </Text>

            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
