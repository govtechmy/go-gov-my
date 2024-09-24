'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useUsers from '@/lib/swr/use-users';
import useWorkspace from '@/lib/swr/use-workspace';
import { ModalContext } from '@/ui/modals/provider';
import { Badge } from '@dub/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useContext, useMemo } from 'react';

export default function NavTabs() {
  const pathname = usePathname();
  const { slug } = useParams() as { slug?: string };
  const { messages, locale } = useIntlClientHook();
  const message = messages?.dashboard;

  const tabs = [
    { name: message?.Links, href: `/${locale}/${slug}` },
    { name: message?.analytics, href: `/${locale}/${slug}/analytics` },
    { name: message?.settings, href: `/${locale}/${slug}/settings` },
  ];

  if (!slug) return null;

  return (
    <div className="scrollbar-hide mb-[-3px] flex h-12 items-center justify-start space-x-2 overflow-x-auto">
      {tabs.map(({ name, href }) => (
        <Link key={href} href={href} className="relative">
          <div className="m-1 rounded-md px-3 py-2 transition-all duration-75 hover:bg-gray-100 active:bg-gray-200">
            <p className="text-sm text-gray-600 hover:text-black">{name}</p>
          </div>
          {(pathname === href ||
            (href.endsWith('/settings') && pathname?.startsWith(href))) && (
            <motion.div
              layoutId="indicator"
              transition={{
                duration: 0.25,
              }}
              className="absolute bottom-0 w-full px-1.5"
            >
              <div className="h-0.5 bg-black" />
            </motion.div>
          )}
        </Link>
      ))}
      <OnboardingChecklist />
    </div>
  );
}
const OnboardingChecklist = () => {
  const { setShowCompleteSetupModal } = useContext(ModalContext);
  const { users } = useUsers();
  const { users: invites } = useUsers({ invites: true });
  const { error, loading, linksUsage = 0 } = useWorkspace();

  const { messages } = useIntlClientHook();
  const message = messages?.layout;

  const remainder = useMemo(() => {
    return (
      (linksUsage > 0 ? 0 : 1) +
      ((users && users.length > 1) || (invites && invites.length > 0) ? 0 : 1)
    );
  }, [linksUsage, invites, users]);

  if (remainder === 0 || error || loading) {
    return null;
  }

  return (
    <button
      onClick={() => setShowCompleteSetupModal(true)}
      className="flex items-center space-x-2 rounded-md border-b-2 border-transparent p-1 px-3 py-2 transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
    >
      <p className="whitespace-nowrap text-sm text-gray-600">
        {message?.onboarding}
      </p>
      <Badge variant="blue">{remainder.toString()}</Badge>
    </button>
  );
};
