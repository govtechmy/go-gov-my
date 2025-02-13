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
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "https://app.pautan.org";
  const LANDING_DOMAIN = process.env.LANDING_DOMAIN || "pautan.org";
  const [url, setUrl] = useState("")


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
            <span className="bg-blue-100 text-blue-600 me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{`${process.env.NEXT_PUBLIC_LANDING_DOMAIN}`}</span>{props.descriptionKey}
          </Paragraph>
        </div>
        <div className=" flex flex-col items-center w-full">
          {/* <ButtonB
            variant="primary"
            size="large"
            href={process.env.NEXT_PUBLIC_APP_DOMAIN}
            target="_blank"
            iconEnd={<IconLink />}
          >
            <span>{props.buttonKey}</span>
          </ButtonB> */}
          <div className="w-full mt-[2.25rem] flex flex-row items-center"></div>
          
          <div className="w-full flex flex-row gap-3">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`${LANDING_DOMAIN ? LANDING_DOMAIN : 'pautan.org'}/example`}
              className={cn(
                "flex-1 w-full rounded-lg border shadow-sm border-washed-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                dialogOpen && "bg-gray-100 cursor-not-allowed"
              )}
              disabled={dialogOpen}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && url.trim()) {
                  setDialogOpen(true);
                }
              }}
            />
        
            <button 
              onClick={()=>{
                setDialogOpen(true)
              }}
              disabled={dialogOpen || !url.trim()}
              className={cn(
                "flex-3 shadow-sm hover:shadow-md rounded-lg px-3 py-2 text-base xl:text-base font-regular text-neutral-50",
                dialogOpen || !url.trim() ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {dialogOpen ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Checking...
                </span>
              ) : props.checkLinkDialog.mainDialog.checkLinkBtn}
            </button>
            
          </div>
          <CheckLinkDialog 
            open={dialogOpen} 
            onOpenChange={setDialogOpen}
            url={url}
            mainDialog={props.checkLinkDialog.mainDialog}
            successDialog={props.checkLinkDialog.successDialog}
            expiredDialog={props.checkLinkDialog.expiredDialog}
            notFoundDialog={props.checkLinkDialog.notFoundDialog}
            reportDialog={props.checkLinkDialog.reportDialog}
          />

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
