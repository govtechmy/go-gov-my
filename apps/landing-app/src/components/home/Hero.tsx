"use client";

import BorderedSection from "@/components/BorderedSection";
import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import Paragraph from "@/components/Paragraph";
import { URL_APP_MAIN } from "@/constants/urls";
import IconLink from "@/icons/link";
import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";
import CheckLinkDialog from "@/components/CheckLinkDialog";
import { useState, useEffect } from "react";
import { Button } from "../Button";
import { sign, verify } from 'jsonwebtoken';

type Props = {
  id?: string;
  className?: string;
  titleKey: string;
  descriptionKey: React.ReactNode;
  signInKey: React.ReactNode;
  buttonKey: string;
  checkLinkKey: string;
  checkLinkDialog: {
    mainDialog: {
      title: string;
      description: string;
      cancelBtn: string;
      checkLinkBtn: string;
    };
    successDialog: {
      title: string;
      description: string;
      doneBtn: string;
      visitLinkBtn: string;
    };
    expiredDialog: {
      title: string;
      description: string;
      doneBtn: string;
    };
    notFoundDialog: {
      title: string;
      description: string;
      doneBtn: string;
      reportBtn: string;
      failedMsg: string;
    };
    reportDialog: {
      title: string;
      description: string;
      doneBtn: string;
    };
  };
};

export default function Hero(props: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const landingDomain = process.env.APP_DOMAIN || "https://app.go.gov.my";

  return (
    // Disable left/right padding on the container
    <BorderedSection
      id={props.id}
      className={cn("px-0", "grid grid-cols-12", props.className)}
    >
      <div
        className={cn(
          "col-span-full lg:col-start-2 lg:col-end-6",
          "px-[1.125rem] py-[3rem] lg:py-0 lg:pl-[1.5rem] lg:pr-0 lg:pt-0",
          "flex flex-col items-center lg:items-start lg:justify-center",
          "md:max-lg:mx-auto md:max-lg:w-[600px]",
          "order-2 lg:order-none",
          props.className,
        )}
      >
        <div className="grid grid-cols-12 lg:flex">
          <Heading
            level={1}
            className={cn(
              "col-start-2 col-end-12",
              "text-pretty text-center lg:text-start",
            )}
          >
            {props.titleKey}
          </Heading>
        </div>
        <div className="grid grid-cols-12 lg:flex">
          <Paragraph
            className={cn(
              "col-start-2 col-end-12",
              "mt-[1.625rem]",
              "text-center lg:text-start",
            )}
          >
            {props.descriptionKey}
          </Paragraph>
        </div>
        <div className="mt-[2.25rem] flex flex-row items-center">
          <ButtonB
            variant="primary"
            size="large"
            href={landingDomain}
            target="_blank"
            iconEnd={<IconLink />}
          >
            <span>{props.buttonKey}</span>
          </ButtonB>
          <div className="w-[0.5rem] mt-[2.25rem] flex flex-row items-center"></div>
          <CheckLinkDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            mainDialog={props.checkLinkDialog.mainDialog}
            successDialog={props.checkLinkDialog.successDialog}
            expiredDialog={props.checkLinkDialog.expiredDialog}
            notFoundDialog={props.checkLinkDialog.notFoundDialog}
            reportDialog={props.checkLinkDialog.reportDialog}
          >
            <Button
              className="border border-washed-300 rounded-lg shadow-sm hover:shadow-md bg-neutral-50"
              variant="tertiary"
              size="large"
              onClick={() => setDialogOpen(true)}
            >
              <span className="text-gray-700 font-medium text-base">{props.checkLinkKey}</span>
            </Button>
          </CheckLinkDialog>
        </div>
        <Paragraph className="mt-[1.125rem] text-center lg:text-start">
          {props.signInKey}
        </Paragraph>
      </div>
      <div
        className={cn(
          "col-span-full lg:col-start-7 lg:col-end-13",
          "mt-[3rem] lg:mt-0",
          "border-washed-100 max-lg:border-b",
          "lg:h-[43.75rem]",
          "lg:pr-0",
          "order-1 lg:order-none",
        )}
      >
        <Rive
          src="/rive/animation.riv"
          stateMachines="home"
          artboard="home"
          className="h-[18.75rem] min-w-full md:h-[32rem] lg:h-[43.75rem]"
        />
      </div>
    </BorderedSection>
  );
}
