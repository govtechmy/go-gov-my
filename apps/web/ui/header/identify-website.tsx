"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import Image from "next/image";
import React, { useState } from "react";
import Checkmark14PointStar from "../icons/checkmark";
import ChevronDown from "../icons/chevron";
import GovMY from "../icons/govmy";
import Lock from "../icons/lock";
import SolidLock from "../icons/solid-lock";
import { cn } from "./cn";
import Collapse from "./layout";

const IdentifyWebsite: React.FC = () => {
  const { messages, locale } = useIntlClientHook();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={
          open
            ? "from-washed-100 to-outline-200 bg-gradient-to-b from-[84.74%] to-100% "
            : "bg-washed-100 "
        }
      >
        <div className="container">
          <div className="text-brand-700 m-1 flex flex-wrap items-center justify-center py-1 text-sm leading-4">
            <Image
              src="/jata_logo.png"
              width={25}
              height={25}
              alt="Logo Jata Negara"
            />
            <Checkmark14PointStar className="mx-2 size-4 text-blue-600 sm:size-5" />
            <span className="text-black-700">
              {messages?.masthead?.masthead_title}
            </span>
            <button
              className="ml-2 flex items-center gap-0.5 text-blue-600"
              onClick={() => setOpen(!open)}
            >
              {messages?.masthead?.masthead_subtitle}
              <ChevronDown
                className={cn(
                  "size-4 text-blue-600 transition duration-200",
                  open ? "rotate-180" : "",
                )}
              />
            </button>
          </div>
          <Collapse isOpen={open}>
            <div className="grid grid-cols-1 gap-6 pb-8 pt-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <GovMY className="text-foreground-success shrink-0 text-green-600" />
                <div className="space-y-1.5">
                  <p className="font-medium">
                    {messages?.masthead?.masthead_official_site_title}{" "}
                    <span className="font-semibold text-green-600">
                      {" "}
                      .gov.my
                    </span>
                  </p>

                  <p className="text-black-700 max-w-prose text-balance text-sm">
                    {messages?.masthead?.masthead_official_site_desc}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Lock className="text-foreground-success shrink-0 text-orange-400" />
                <div className="space-y-1.5">
                  <p className="font-medium">
                    {" "}
                    {messages?.masthead?.masthead_ssl_title}{" "}
                    <span className="font-semibold text-green-600"> HTTPS</span>
                  </p>
                  <div className="text-black-700 max-w-prose text-balance text-sm">
                    {messages?.masthead?.masthead_ssl_desc_1}{" "}
                    <SolidLock className="inline size-4 text-green-600" />{" "}
                    {messages?.masthead?.masthead_ssl_or}{" "}
                    <span className="font-semibold text-green-600">
                      https://
                    </span>{" "}
                    {messages?.masthead?.masthead_ssl_desc_2}
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
