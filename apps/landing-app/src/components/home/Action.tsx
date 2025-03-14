import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import Paragraph from "@/components/Paragraph";
import Section from "@/components/Section";
import IconLink from "@dub/ui";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  title: string;
  description: ReactNode;
  className?: string;
  buttonText: string;
};

export default function Action(props: Props) {
  return (
    <Section
      className={cn(
        "col-rows-2 md:col-rows-1",
        "md:max-lg:mx-auto md:max-lg:w-[600px]",
        "md:px-0",
        "grid grid-cols-12",
        props.className,
      )}
    >
      <div
        className={cn(
          "col-span-full md:col-start-1 md:col-end-10 lg:col-span-5 lg:col-start-2",
          "row-start-1",
        )}
      >
        <Heading level={2} className="text-center md:text-start">
          {props.title}
        </Heading>
        <Paragraph className={cn("mt-[1.625rem]", "text-center md:text-start")}>
          {props.description}
        </Paragraph>
      </div>
      <div
        className={cn(
          "col-start-1 col-end-13 md:col-start-10 md:col-end-13 lg:col-start-10 lg:col-end-12",
          "row-start-2 md:row-start-1",
          "mt-[2rem] md:mt-0",
          "flex flex-row items-center justify-center lg:justify-end",
        )}
      >
        <ButtonB
          variant="primary"
          size="large"
          href={process.env.NEXT_PUBLIC_APP_DOMAIN}
          target="_blank"
          iconEnd={<IconLink />}
        >
          {props.buttonText}
        </ButtonB>
      </div>
    </Section>
  );
}
