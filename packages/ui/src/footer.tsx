'use client';

import { APP_NAME, cn, fetcher } from '@dub/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { MaxWidthWrapper } from './max-width-wrapper';

const navigation = {
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'Abuse', href: '/abuse' },
  ],
};

// Disable the status badge for now since we have not deployed Uptime Kuma yet
const ENABLE_STATUS_BADGE = false;

export function Footer() {
  return (
    <footer>
      <MaxWidthWrapper className="relative z-10 overflow-hidden border border-b-0 border-gray-200 bg-white/50 px-8 py-16 backdrop-blur-lg md:rounded-t-2xl">
        <div className="md:flex md:justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="block w-16 md:w-24">
              <span className="sr-only">{process.env.NEXT_PUBLIC_APP_NAME} Logo</span>
              {/* For GoGovMy, footer must use Jata Negara */}
              <Image src="/_static/jata_logo.png" alt="Jata Negara" width={128} height={96} />
            </Link>
            <div className="space-y-4">
              <p className="font-bold uppercase">Government of Malaysia</p>
              <p className="max-w-xs text-sm text-gray-500">
                {APP_NAME} – Malaysia's open-source link management infrastructure.
              </p>
              {ENABLE_STATUS_BADGE && <StatusBadge />}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-12 md:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Legal</h3>
              <ul role="list" className="mt-4 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-gray-500 hover:text-gray-800">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}

function StatusBadge() {
  const { data } = useSWR<{
    ongoing_incidents: {
      name: string;
      current_worst_impact: 'degraded_performance' | 'partial_outage' | 'full_outage';
    }[];
  }>('https://status.dub.co/api/v1/summary', fetcher);

  const [color, setColor] = useState('bg-gray-200');
  const [status, setStatus] = useState('Loading status...');

  useEffect(() => {
    if (!data) return;
    const { ongoing_incidents } = data;
    if (ongoing_incidents.length > 0) {
      const { current_worst_impact, name } = ongoing_incidents[0];
      const color =
        current_worst_impact === 'degraded_performance' ? 'bg-yellow-500' : 'bg-red-500';
      setStatus(name);
      setColor(color);
    } else {
      setStatus('All systems operational');
      setColor('bg-green-500');
    }
  }, [data]);

  return (
    <Link
      href="https://status.dub.co"
      target="_blank"
      className="group flex max-w-fit items-center space-x-2 rounded-md border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-100"
    >
      <div className="relative h-3 w-3">
        <div
          className={cn(
            'absolute inset-0 m-auto h-3 w-3 animate-ping items-center justify-center rounded-full group-hover:animate-none',
            color,
            status === 'Loading status...' && 'animate-none'
          )}
        />
        <div className={cn('absolute inset-0 z-10 m-auto h-3 w-3 rounded-full', color)} />
      </div>
      <p className="text-sm font-medium text-gray-800">{status}</p>
    </Link>
  );
}
