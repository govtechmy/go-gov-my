import Heading from "@/components/Heading";
import QuickLinks from "@/components/page/common/QuickLinks";
import SecureLinkForm from "@/components/page/secure/SecureLinkForm";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import { GOAPP_PARAM_URL } from "@/constants/goapp";
import { cn } from "@/lib/utils";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const URL = GOAPP_PARAM_URL;

export default async function PageSecure({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main
      className={cn(
        "pt-[5rem] md:pt-[4rem] lg:pt-[7rem]",
        "px-[1.125rem] lg:px-0",
        "h-full w-full",
        "flex grow flex-col items-center justify-start",
      )}
    >
      <div
        className={cn(
          "flex grow flex-col items-center justify-start tall:justify-center",
        )}
      >
        <img
          width={32}
          height={32}
          src="/__goapp_public__/icons/padlock.svg"
          alt="Logo"
        />
        <Heading
          level={2}
          className={cn(
            "text-center md:text-start",
            "mt-[0.75rem] md:mt-[1rem]",
          )}
        >
          {t("pages.index.password.title")}
        </Heading>
        <Paragraph
          textSize="small"
          textAlign="center"
          className="mt-[0.75rem] md:mt-[1rem]"
        >
          {t.rich("pages.index.password.description", {
            em: (chunks) => (
              <RoundedText variant="primary" weight="medium" textSize="small">
                go.gov.my
              </RoundedText>
            ),
          })}
        </Paragraph>
        <SecureLinkForm />
      </div>
      <QuickLinks />
    </main>
  );
}
