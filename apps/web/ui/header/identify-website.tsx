"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import Image from "next/image";
import React, { useState } from "react";

const IdentifyWebsite: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, locale } = useIntlClientHook();

  return (
    <div className="bg-background border-b px-3 py-1">
      <div
        className="flex w-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="inline-flex">
          <div className="flex flex-wrap items-center text-xs">
            <Image
              src="/jata_logo.png"
              width={25}
              height={25}
              alt="Logo Jata Negara"
            />
            <span className="px-3">{messages?.masthead?.masthead_title}</span>
            <span className="items-center text-blue-600 underline">
              {messages?.masthead?.masthead_subtitle}
            </span>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="mt-2 w-full rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            <div id="official-links" className="mb-4 rounded-md p-4">
              <div className="flex items-start">
                <div className="mr-2 text-xl">🏛️</div>
                <div>
                  <h2 className="text-lg font-semibold">
                  {messages?.masthead?.masthead_official_site_title}
                  </h2>
                  <p className="text-gray-700">
                    {messages?.masthead?.masthead_official_site_desc}
                  </p>
                </div>
              </div>
            </div>
            <div id="secure-websites" className="rounded-md p-4">
              <div className="flex items-start">
                <div className="mr-2 text-xl">🔒</div>
                <div>
                  <h2 className="text-lg font-semibold">
                  {messages?.masthead?.masthead_ssl_title}
                  </h2>
                  <p className="text-gray-700">
                  {messages?.masthead?.masthead_ssl_desc_1} 🔒 {messages?.masthead?.masthead_ssl_desc_2}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentifyWebsite;
