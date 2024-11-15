'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import React, { useState } from 'react';
import { cn } from './cn';
import Collapse from './layout';
import MalaysiaFlag from './malaysia-flag';
import { poppins, inter } from '@/styles/fonts'; // Add this import
import ChevronDown from '@/ui/shared/icons/chevron-down';
import FlagMY from '@/ui/shared/icons/flag-my';
import GovMY from '@/ui/shared/icons/govmy';
import EncryptedLock from '@/ui/shared/icons/lock';
import SolidLock from '@/ui/shared/icons/solid-lock';

interface IdentifyWebsiteProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const IdentifyWebsite: React.FC<IdentifyWebsiteProps> = ({ isOpen, onOpenChange }) => {
  const { messages, locale } = useIntlClientHook();
  const message = messages?.masthead;

  return (
    <div className={inter.className}>
      <div className="relative">
        <div className="px-4 lg:px-0">
          <button
            className="h-[2.25rem] w-full md:h-[1.75rem]"
            onClick={() => onOpenChange(!isOpen)}
          >
            <div className="flex flex-wrap items-center gap-1.5 text-sm/4 text-blue-700 max-sm:justify-between sm:py-1">
              <div className="flex items-center gap-1.5">
                <FlagMY className="h-[1rem] w-[2rem]" />
                <span className={cn('text-gray-700', inter.className)}>
                  {message?.masthead_title}
                </span>
              </div>
              <div className="flex items-center gap-0.5 max-sm:rounded-md max-sm:bg-outline-200 max-sm:px-1">
                <span className="hidden tracking-[-0.01em] sm:block">
                  {message?.masthead_subtitle}
                </span>
                <ChevronDown className={cn('size-4 transition', isOpen ? 'rotate-180' : '')} />
              </div>
            </div>
          </button>
          <Collapse isOpen={isOpen}>
            <div className="grid grid-cols-1 gap-6 xs:pt-0 xs:pb-6 sm:grid-cols-2 sm:gap-6 sm:pb-8 sm:pt-6">
              <span className="text-base font-medium text-blue-700 sm:hidden">
                {message?.masthead_subtitle}
              </span>

              <div className="flex gap-4">
                <GovMY className="size-6 shrink-0 text-dim-500" />
                <div className="space-y-2">
                  <p className="text-base font-semibold text-gray-900">
                    {message?.masthead_official_site_title}{' '}
                    {message?.masthead_official_site_desc_domain}
                  </p>
                  <p className="text-[15px] leading-[22px] text-gray-600">
                    {message?.masthead_official_site_desc_1}
                    <span className="font-semibold">
                      {' '}
                      {message?.masthead_official_site_desc_domain}
                    </span>
                    {message?.masthead_official_site_desc_2}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <EncryptedLock className="size-6 shrink-0 text-dim-500" />
                <div className="space-y-2">
                  <div className="text-base font-semibold text-gray-900">
                    {message?.masthead_ssl_title} HTTPS
                  </div>
                  <div className="text-[15px] leading-[22px] text-gray-600">
                    {message?.masthead_ssl_desc_1}{' '}
                    <SolidLock className="mb-0.5 mr-px inline size-3.5" />{' '}
                    {message?.masthead_ssl_or} <span className="font-semibold">https://</span>{' '}
                    {message?.masthead_ssl_desc_2}
                  </div>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default IdentifyWebsite;
