'use client';
import { MessagesContext } from '@/ui/switcher/provider';
import { useSession } from 'next-auth/react';
import { useContext, useEffect, useState } from 'react';

export default function AgencyLabel() {
  const { data: session } = useSession();
  const messages = useContext(MessagesContext);
  const locale = messages?.language;

  const [agencyName, setAgencyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgency = async () => {
      if (session && session.user && session.user.agencyCode) {
        try {
          const response = await fetch('/api/agency');
          if (response.ok) {
            const data = await response.json();
            const name = locale === 'ms-MY' ? data.user.names.ms : data.user.names.en;
            setAgencyName(name);
          } else {
            console.error('Failed to fetch agency data');
          }
        } catch (error) {
          console.error('Error fetching agency data:', error);
        }
      }
    };

    fetchAgency();
  }, [session]);

  return (
    <div>
      {agencyName ? (
        <span className="font-poppins me-2 ml-2 hidden rounded-xl bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300 sm:inline">
          {agencyName}
        </span>
      ) : (
        <></>
      )}
    </div>
  );
}
