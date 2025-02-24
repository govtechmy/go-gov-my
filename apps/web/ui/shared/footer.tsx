'use client';

import { SOCMED } from '@dub/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { useState, useEffect } from 'react';

type Props = {
  ministry: string;
  copyrightKey: string;
  lastUpdateKey: string;
  descriptionWithNewlines: string;
  disclaimerKey: string;
  privacyPolicyKey: string;
  links: {
    title?: string;
    links: {
      name: string;
      href: string;
    }[];
  }[];
};

function formatDateTime(
  dateInput: string | number | Date | undefined,
  timeZone: string = 'Asia/Kuala_Lumpur'
) {
  if (!dateInput) return '';
  // Convert input to a Date object
  const date = new Date(dateInput || Date.now());

  // Use Intl.DateTimeFormat for localization
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

export default function Footer(props: Props) {
  const { messages, locale } = useIntlClientHook();
  const [releaseDate, setReleaseDate] = useState('');

  type releaseDateJson = {
    app: string;
    releaseDate: string;
    releaseVersion: string;
  };

  async function fetchReleaseDateStats(): Promise<releaseDateJson[]> {
    try {
      const url = process.env.NEXT_PUBLIC_RELEASE_DATE_JSON_URL;
      if (!url) {
        throw new Error('NEXT_PUBLIC_RELEASE_DATE_JSON_URL is not set');
      }

      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      // Ensure the data is typed as an array
      const data: releaseDateJson[] = await response.json();

      // Safely find the entry for the "web" app
      const webEntry = data.find((item) => item.app === 'web');
      if (webEntry && webEntry.releaseDate) {
        setReleaseDate(webEntry.releaseDate);
      } else {
        setReleaseDate('');
      }

      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      setReleaseDate('');
      throw error;
    }
  }

  // Run fetchReleaseDateStats once when the component mounts
  useEffect(() => {
    fetchReleaseDateStats();
  }, []);

  const className = {
    link: 'text-base text-black-700 [text-underline-position:from-font] hover:text-black-900 hover:underline',
  };

  return (
    <div className="border-t border-outline-200 bg-background-50 py-8 lg:py-16 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="flex flex-col gap-6 pb-8 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-4 lg:gap-4.5">
            <div className="flex items-center gap-x-2.5">
              <Image
                src="/jata_logo1.png"
                width={28}
                height={28}
                className={cn('object-contain')}
                alt="Jata Negara"
              />
              <div>
                <h6 className="text-xl whitespace-nowrap font-poppins font-semibold">
                  {props.ministry}
                </h6>
              </div>
            </div>
            <p
              className="text-lg text-black-700"
              dangerouslySetInnerHTML={{
                __html: props.descriptionWithNewlines.replaceAll('\n', '<br/>'),
              }}
            ></p>
            <div className="space-y-2 lg:space-y-3">
              <p className="text-base font-semibold">{messages?.Footer?.follow_us}</p>
              <div className="flex gap-3">
                {SOCMED.map(({ icon, href }) => (
                  <a key={href} href={href} target="_blank" rel="noopenner noreferrer">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Right menu */}
          <div className="flex flex-col gap-6 text-base lg:flex-row">
            {props.links.map((item, index) => (
              <div className="space-y-2" key={index}>
                {item.title && <p className="font-semibold">{item.title}</p>}
                <div className="grid grid-cols-2 flex-col gap-y-2 sm:grid-cols-4 sm:gap-x-6 lg:flex lg:w-[200px] lg:gap-2">
                  {item.links.map(({ name, href }) => (
                    <a
                      key={name}
                      className={className.link}
                      target="_blank"
                      rel="noopenner noreferrer"
                      href={href}
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 pt-8 text-base text-dim-500 lg:flex-row">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <p>
              {props.copyrightKey} © {new Date().getFullYear()}
            </p>
            <span className="hidden h-3 w-px bg-outline-300 lg:block"></span>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-black-700">
              {[
                {
                  key: 'disclaimer',
                  link: 'https://www.pautan.org/disclaimer?locale=en-GB',
                },
                {
                  key: 'privacy-policy',
                  link: 'https://www.pautan.org/privacy-policy?locale=en-GB',
                },
              ].map((link) => (
                <Link
                  key={link.key}
                  className="underline-font text-base text-black-700 hover:text-foreground hover:underline"
                  href={`${link.link}?locale=${locale}`}
                >
                  {link.key === 'disclaimer' ? props.disclaimerKey : props.privacyPolicyKey}
                </Link>
              ))}
            </div>
          </div>
          <span>{props.lastUpdateKey + ': ' + formatDateTime(releaseDate)}</span>
        </div>
      </div>
    </div>
  );
}
