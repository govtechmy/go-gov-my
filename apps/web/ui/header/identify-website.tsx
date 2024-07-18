"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import React, { useState } from "react";
import Checkmark14PointStar from "../icons/checkmark";
import ChevronDown from "../icons/chevron";
import GovMY from "../icons/govmy";
import Lock from "../icons/lock";
import SolidLock from "../icons/solid-lock";
import { cn } from "./cn";
import Collapse from "./layout";

const IdentifyWebsite: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, locale } = useIntlClientHook();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "z-[99]",
          open
            ? "from-washed-100 to-outline-200 bg-gradient-to-b from-[84.74%] to-100%"
            : "bg-washed-100",
        )}
      >
        <div className="container">
          <button className="w-full" onClick={() => setOpen(!open)}>
            <div className="text-brand-700 flex flex-wrap items-center gap-1.5 py-2.5 text-sm/4 max-sm:justify-between sm:py-1">
              <div className="flex items-center gap-1.5">
                <Checkmark14PointStar className="size-4 text-blue-600 sm:size-5" />
                <span className="text-black-700">
                  {messages?.masthead?.masthead_title}
                </span>
              </div>
              <div className="max-sm:bg-outline-200 flex items-center gap-0.5 max-sm:rounded-md max-sm:px-1">
                <span className="hidden tracking-[-0.01em] text-blue-600 sm:block">
                  {messages?.masthead?.masthead_subtitle}
                </span>
                <ChevronDown
                  className={cn("size-4 transition", open ? "rotate-180" : "")}
                />
              </div>
            </div>
          </button>
          <Collapse isOpen={open}>
            <div className="gap-4.5 pt-4.5 grid grid-cols-1 px-2 pb-6 sm:grid-cols-2 sm:gap-6 sm:pb-8 sm:pt-6">
              <span className="text-brand-700 static pb-5 text-sm text-blue-600 sm:hidden">
                {messages?.masthead?.masthead_subtitle}
              </span>

              <div className="flex gap-3">
                <GovMY className="text-dim-500 shrink-0" />
                <div className="space-y-1.5">
                  <p className="font-medium max-sm:text-sm">
                    {" "}
                    {messages?.masthead?.masthead_official_site_title}{" "}
                    <span className="text-bold strong">
                      {" "}
                      {messages?.masthead?.masthead_official_site_desc_domain}
                    </span>
                  </p>
                  <p className="text-black-700 max-w-prose text-balance text-sm">
                    {messages?.masthead?.masthead_official_site_desc_1}
                    <span className="font-semibold">
                      {" "}
                      {messages?.masthead?.masthead_official_site_desc_domain}
                    </span>
                    {messages?.masthead?.masthead_official_site_desc_2}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Lock className="text-dim-500 shrink-0" />
                <div className="space-y-1.5">
                  <p className="font-medium max-sm:text-sm">
                    {messages?.masthead?.masthead_ssl_title}{" "}
                    <span className="text-bold text-green-600">HTTPS</span>
                  </p>
                  <div className="text-black-700 max-w-prose text-balance text-sm">
                    {messages?.masthead?.masthead_ssl_desc_1}{" "}
                    <SolidLock className="-ml-[3px] mb-0.5 mr-px inline size-3.5 text-green-600" />
                    {messages?.masthead?.masthead_ssl_or}{" "}
                    <span className="font-semibold">https://</span>{" "}
                    {messages?.masthead?.masthead_ssl_desc_2}{" "}
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </>
  );
};

export default IdentifyWebsite;
