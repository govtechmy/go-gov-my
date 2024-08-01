"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import React, { useState } from "react";
import { cn } from "./cn";
import Collapse from "./layout";

const IdentifyWebsite: React.FC = () => {
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
                <div className="size-4 sm:size-5 text-blue-600">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 2L11.5131 3.37049L13.4711 2.79225L14.2397 4.68355L16.2547 5.01208L16.1266 7.04959L17.7994 8.21983L16.8 10L17.7994 11.7802L16.1266 12.9504L16.2547 14.9879L14.2397 15.3165L13.4711 17.2078L11.5131 16.6295L10 18L8.48686 16.6295L6.52893 17.2078L5.76027 15.3165L3.74535 14.9879L3.87341 12.9504L2.20058 11.7802L3.2 10L2.20058 8.21983L3.87341 7.04959L3.74535 5.01208L5.76027 4.68355L6.52893 2.79225L8.48686 3.37049L10 2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.75 10.75L9 12.25L12.25 7.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-black-700">
                  An official Malaysian Government Website
                </span>
              </div>
              <div className="max-sm:bg-outline-200 flex items-center gap-0.5 max-sm:rounded-md max-sm:px-1">
                <span className="hidden tracking-[-0.01em] text-blue-600 sm:block">
                  Here&apos;s how you know
                </span>
                <div
                  className={cn("size-4 transition", open ? "rotate-180" : "")}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 8L10 13L15 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button>
          <Collapse isOpen={open}>
            <div className="gap-4.5 pt-4.5 grid grid-cols-1 px-2 pb-6 sm:grid-cols-2 sm:gap-6 sm:pb-8 sm:pt-6">
              <span className="text-brand-700 static pb-5 text-sm text-blue-600 sm:hidden">
                Here&apos;s how you know
              </span>
              <div className="flex gap-3">
                <div className="text-dim-500 shrink-0">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9.25H8M12 9.25H15.5M12 9.25L12.1325 9.1617C13.4102 8.30987 13.291 6.3955 11.9175 5.70874L11.0963 5.29814C10.7092 5.10461 10.3954 4.79077 10.2019 4.40372L10 4M8 9.25H4.5M8 9.25L7.86754 9.1617C6.58981 8.30987 6.70899 6.3955 8.08252 5.70874L8.90372 5.29814C9.29077 5.10461 9.60461 4.79077 9.79814 4.40372L10 4M10 4V3.25M10 3.25V2.25L12.5 2.75L10 3.25Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.75 17.75H18.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15.25V12.25M5.5 15.25V12.25M14.5 15.25V12.25M17 12.25V15.25M8 15.25V13.5C8 12.3954 8.89543 11.5 10 11.5C11.1046 11.5 12 12.3954 12 13.5V15.25"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <p className="font-medium max-sm:text-sm">
                    Official government websites end with
                    <span className="text-bold strong">.gov.my</span>
                  </p>
                  <p className="text-black-700 text-balance max-w-prose text-sm">
                    If the link does not end with
                    <span className="font-semibold">.gov.my</span>, exit the
                    website immediately even if it looks similar.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-dim-500 shrink-0">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.75 8.5V8.3427C5.75 6.78147 5.65607 5.04125 6.74646 3.9239C7.36829 3.2867 8.3745 2.75 10 2.75C11.6255 2.75 12.6317 3.2867 13.2535 3.9239C14.3439 5.04125 14.25 6.78147 14.25 8.3427V8.5M3.75 9.75C3.75 9.1977 4.19772 8.75 4.75 8.75H15.25C15.8023 8.75 16.25 9.1977 16.25 9.75V15.25C16.25 16.3546 15.3546 17.25 14.25 17.25H5.75C4.64543 17.25 3.75 16.3546 3.75 15.25V9.75Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <p className="font-medium max-sm:text-sm">
                    Secure websites use
                    <span className="text-bold text-green-600">HTTPS</span>
                  </p>
                  <div className="text-black-700 text-balance max-w-prose text-sm">
                    If the link does not end with
                    <div className="size-3.5 -ml-[3px] mb-0.5 mr-px inline text-green-600">
                      <svg
                        width="12"
                        height="14"
                        viewBox="0 0 12 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 6.6C1 6.15816 1.35818 5.8 1.8 5.8H10.2C10.6418 5.8 11 6.15816 11 6.6V11C11 11.8837 10.2837 12.6 9.4 12.6H2.6C1.71634 12.6 1 11.8837 1 11V6.6Z"
                          fill="currentColor"
                        />
                        <path
                          d="M2.6 5.6V5.47416C2.6 4.22518 2.52486 2.833 3.39717 1.93912C3.89463 1.42936 4.6996 1 6 1C7.3004 1 8.10536 1.42936 8.6028 1.93912C9.47512 2.833 9.4 4.22518 9.4 5.47416V5.6M1 6.6C1 6.15816 1.35818 5.8 1.8 5.8H10.2C10.6418 5.8 11 6.15816 11 6.6V11C11 11.8837 10.2837 12.6 9.4 12.6H2.6C1.71634 12.6 1 11.8837 1 11V6.6Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    ) or
                    <span className="font-semibold">https://</span>
                    as an added precaution. Share sensitive information only on
                    official, secure websites.
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
