"use client";

import Image from "next/image";
import React, { useState } from "react";

const IdentifyWebsite: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <span className="px-3">A Malaysian Government Agency Website</span>
            <span className="items-center text-blue-600 underline">
              How to identify Malaysian Government Website?
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
                    Official website links end with .gov.my
                  </h2>
                  <p className="text-gray-700">
                    Government agencies communicate via .gov.my websites (e.g.
                    go.gov.my).
                    <a
                      href="https://trusted-websites.gov.my"
                      className="text-blue-600 underline"
                    >
                      Trusted websites
                    </a>
                    {/* REWRITE BACK THIS PLACEHOLDER FOR TRUSTED WEBSITES FROM GOV */}
                  </p>
                </div>
              </div>
            </div>
            <div id="secure-websites" className="rounded-md p-4">
              <div className="flex items-start">
                <div className="mr-2 text-xl">🔒</div>
                <div>
                  <h2 className="text-lg font-semibold">
                    Secure websites use HTTPS
                  </h2>
                  <p className="text-gray-700">
                    Look for a lock (🔒) or https:// as an added precaution.
                    Share sensitive information only on official, secure
                    websites.
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
