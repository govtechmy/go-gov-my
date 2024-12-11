"use client";

import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import UploadDocuments from "./UploadDocuments";

type Props = {
  redirectUrl: string;
  redirectSeconds: number;
  files: string;
};

export default function DownloadContent(props: Props) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "flex grow flex-col items-center justify-start tall:justify-center",
      )}
    >
      <Heading level={2} className="text-center md:text-start">
        {t("pages.download.download.title")}
      </Heading>
      <Paragraph
        textSize="small"
        textAlign="center"
        className="mt-[0.75rem] md:mt-[1rem]"
      >
        {t.rich("pages.download.download.description", {
          em: (chunks) => (
            <RoundedText variant="primary" weight="medium" textSize="small">
              go.gov.my
            </RoundedText>
          ),
        })}
      </Paragraph>
      <UploadDocuments files={props.files} />

    </div>
  );
}
