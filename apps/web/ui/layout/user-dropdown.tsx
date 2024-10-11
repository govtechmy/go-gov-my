'use client';

import { MessagesContext } from '@/ui/switcher/provider';
import { Avatar, Badge, IconMenu, Popover } from '@dub/ui';
import {
  AppWindow,
  BookText,
  CircleGauge,
  LogOut,
  Settings,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';

export default function UserDropdown() {
  const { data: session } = useSession();
  const [openPopover, setOpenPopover] = useState(false);
  const messages = useContext(MessagesContext);
  const message = messages?.layout;
  const locale = messages?.language;
  const pathname = usePathname();
  const isAdminPath = pathname.includes('/admin');

  return (
    <div className="relative inline-block pt-1.5">
      <Popover
        content={
          <div className="flex w-full flex-col space-y-px rounded-md bg-white p-3 sm:w-56">
            <Link
              href={`/${locale}`}
              className="p-2"
              onClick={() => setOpenPopover(false)}
            >
              {session?.user?.name && (
                <p className="truncate text-sm font-medium text-gray-900">
                  {session?.user?.name}
                </p>
              )}
              <p className="truncate text-sm text-gray-500">
                {session?.user?.email}
              </p>
              {session && (
                <div className="mt-1 flex gap-1">
                  <RoleBadge role={session.user.role} />
                </div>
              )}
            </Link>
            {session?.user?.role === 'super_admin' ||
            session?.user?.role === 'agency_admin' ? (
              <Link
                href={isAdminPath ? `/${locale}` : `/${locale}/admin`}
                onClick={() => setOpenPopover(false)}
                className="block w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
              >
                <IconMenu
                  text={!isAdminPath ? message?.admin : message?.user}
                  icon={
                    isAdminPath ? (
                      <AppWindow className="h-4 w-4" />
                    ) : (
                      <CircleGauge className="h-4 w-4" />
                    )
                  }
                />
              </Link>
            ) : (
              <></>
            )}
            <Link
              href={`/${locale}/settings`}
              onClick={() => setOpenPopover(false)}
              className="block w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <IconMenu
                text={message?.settings}
                icon={<Settings className="h-4 w-4" />}
              />
            </Link>
            <Link
              href={`https://docs.${process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN}`}
              target="_blank"
              className="block w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <IconMenu
                text={message?.documentation}
                icon={<BookText className="h-4 w-4" />}
              />
            </Link>
            {/* <Link
              href={`https://github.com/govtechmy/go-gov-my/discussions`}
              target="_blank"
              className="block w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <IconMenu
                text={message?.help_centre}
                icon={<BadgeHelp className="h-4 w-4" />}
              />
            </Link> */}
            {/* <Link
              href={`https://github.com/govtechmy/go-gov-my/releases`}
              target="_blank"
              className="block w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <IconMenu
                text={message?.changelog}
                icon={<Replace className="h-4 w-4" />}
              />
            </Link> */}
            <button
              className="w-full rounded-md p-2 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
              onClick={() => {
                signOut({
                  callbackUrl: '/login',
                });
              }}
            >
              <IconMenu
                text={message?.logout}
                icon={<LogOut className="h-4 w-4" />}
              />
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="group relative"
        >
          {session?.user ? (
            <Avatar
              user={session.user}
              className="h-9 w-9 transition-all duration-75 group-focus:outline-none group-active:scale-95 sm:h-10 sm:w-10"
            />
          ) : (
            <div className="h-9 w-9 animate-pulse rounded-full border border-gray-300 bg-gray-100 sm:h-10 sm:w-10" />
          )}
        </button>
      </Popover>
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: 'staff' | 'super_admin' | 'agency_admin';
}) {
  const label = {
    staff: 'Staff',
    super_admin: 'Super Admin',
    agency_admin: 'Agency Admin',
  } as const;

  const variant = {
    staff: 'default',
    super_admin: 'blue',
    agency_admin: 'violet',
  } as const;

  return <Badge variant={variant[role]}>{label[role]}</Badge>;
}
