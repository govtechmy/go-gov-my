'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useUsers from '@/lib/swr/use-users';
import useWorkspace from '@/lib/swr/use-workspace';
import { WorkspaceUserProps } from '@/lib/types';
import { useEditRoleModal } from '@/ui/modals/edit-role-modal';
import { useInviteCodeModal } from '@/ui/modals/invite-code-modal';
import { useInviteTeammateModal } from '@/ui/modals/invite-teammate-modal';
import { useRemoveTeammateModal } from '@/ui/modals/remove-teammate-modal';
import { Link as LinkIcon, ThreeDots } from '@/ui/shared/icons';
import { Avatar, Badge, Button, IconMenu, Popover } from '@dub/ui';
import { cn, timeAgo } from '@dub/utils';
import { UserMinus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const tabs: Array<'Members' | 'Invitations'> = ['Members', 'Invitations'];

export default function WorkspacePeopleClient() {
  const { setShowInviteTeammateModal, InviteTeammateModal } = useInviteTeammateModal();
  const { messages, locale } = useIntlClientHook();
  const message = messages?.people;

  const { setShowInviteCodeModal, InviteCodeModal } = useInviteCodeModal();

  const [currentTab, setCurrentTab] = useState<'Members' | 'Invitations'>('Members');

  const { users } = useUsers({ invites: currentTab === 'Invitations' });

  return (
    <>
      <InviteTeammateModal />
      <InviteCodeModal />
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-between space-y-3 p-5 sm:flex-row sm:space-y-0 sm:p-10">
          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-medium">{message?.people}</h2>
            <p className="text-sm text-gray-500">{message?.teammates}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              text={message?.invite}
              variant="success"
              onClick={() => setShowInviteTeammateModal(true)}
              className="h-9"
            />
            <Button
              icon={<LinkIcon className="h-4 w-4 text-blue-700" />}
              variant="secondary"
              onClick={() => setShowInviteCodeModal(true)}
              className="h-9"
            />
          </div>
        </div>
        <div className="flex space-x-3 border-b border-gray-200 px-3 sm:px-7">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`${
                tab === currentTab ? 'border-black' : 'border-transparent'
              } border-b py-1`}
            >
              <button
                onClick={() => setCurrentTab(tab)}
                className="rounded-md px-3 py-1.5 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
              >
                {message ? message[tab] : tab}
              </button>
            </div>
          ))}
        </div>
        <div className="grid divide-y divide-gray-200">
          {users ? (
            users.length > 0 ? (
              users.map((user) => <UserCard key={user.email} user={user} currentTab={currentTab} />)
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <img
                  src="/_static/illustrations/video-park.svg"
                  alt="No invitations sent"
                  width={300}
                  height={300}
                  className="pointer-events-none -my-8"
                />
                <p className="text-sm text-gray-500">{message?.no_invitations}</p>
              </div>
            )
          ) : (
            Array.from({ length: 5 }).map((_, i) => <UserPlaceholder key={i} />)
          )}
        </div>
      </div>
    </>
  );
}

const UserCard = ({
  user,
  currentTab,
}: {
  user: WorkspaceUserProps;
  currentTab: 'Members' | 'Invitations';
}) => {
  const [openPopover, setOpenPopover] = useState(false);

  const { messages, locale } = useIntlClientHook();
  const message = messages?.people;

  const { plan, isOwner } = useWorkspace();

  const { name, email, createdAt, role: currentRole } = user;

  const [role, setRole] = useState<'owner' | 'member'>(currentRole);

  const { EditRoleModal, setShowEditRoleModal } = useEditRoleModal({
    user,
    role,
  });

  const { RemoveTeammateModal, setShowRemoveTeammateModal } = useRemoveTeammateModal({
    user,
    invite: currentTab === 'Invitations',
  });

  const { data: session } = useSession();

  // invites expire after 14 days of being sent
  const expiredInvite =
    currentTab === 'Invitations' &&
    createdAt &&
    Date.now() - new Date(createdAt).getTime() > 14 * 24 * 60 * 60 * 1000;

  return (
    <>
      <EditRoleModal />
      <RemoveTeammateModal />
      <div key={email} className="flex items-center justify-between space-x-3 px-4 py-3 sm:pl-8">
        <div className="flex items-start space-x-3">
          <div className="flex items-center space-x-3">
            <Avatar user={user} />
            <div className="flex flex-col">
              <h3 className="text-sm font-medium">{name || email}</h3>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>

          {expiredInvite && <Badge variant="gray">{message?.expired}</Badge>}
        </div>
        <div className="flex items-center space-x-3">
          {currentTab === 'Members' ? (
            session?.user?.email === email ? (
              <p className="text-xs capitalize text-gray-500">{role}</p>
            ) : (
              <select
                className={cn(
                  'rounded-md border border-gray-200 text-xs text-gray-500 focus:border-gray-600 focus:ring-gray-600',
                  {
                    'cursor-not-allowed bg-gray-100': !isOwner,
                  }
                )}
                value={role}
                disabled={!isOwner}
                onChange={(e) => {
                  setRole(e.target.value as 'owner' | 'member');
                  setOpenPopover(false);
                  setShowEditRoleModal(true);
                }}
              >
                <option value="owner">{message?.owner}</option>
                <option value="member">{message?.member}</option>
              </select>
            )
          ) : (
            <p className="text-xs text-gray-500" suppressHydrationWarning>
              {message?.invited} {timeAgo(createdAt)}
            </p>
          )}

          <Popover
            content={
              <div className="grid w-full gap-1 p-2 sm:w-48">
                <button
                  onClick={() => {
                    setOpenPopover(false);
                    setShowRemoveTeammateModal(true);
                  }}
                  className="rounded-md p-2 text-left text-sm font-medium text-red-600 transition-all duration-75 hover:bg-red-600 hover:text-white"
                >
                  <IconMenu
                    text={
                      session?.user?.email === email
                        ? messages?.modal?.leave_workspace
                        : currentTab === 'Members'
                          ? messages?.modal?.remove_teammate
                          : messages?.modal?.revoke_invitation
                    }
                    icon={<UserMinus className="h-4 w-4" />}
                  />
                </button>
              </div>
            }
            align="end"
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPopover(!openPopover);
              }}
              className="rounded-md px-1 py-2 transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <span className="sr-only">{message?.edit}</span>
              <ThreeDots className="h-5 w-5 text-gray-500" />
            </button>
          </Popover>
        </div>
      </div>
    </>
  );
};

const UserPlaceholder = () => (
  <div className="flex items-center justify-between space-x-3 px-4 py-3 sm:px-8">
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
      <div className="flex flex-col">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
  </div>
);
