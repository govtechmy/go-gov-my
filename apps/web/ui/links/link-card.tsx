import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useLinkHistory from '@/lib/swr/use-link-history';
import useWorkspace from '@/lib/swr/use-workspace';
import { LinkWithTagsProps, TagProps, UserProps } from '@/lib/types';
import TagBadge from '@/ui/links/tag-badge';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import { useArchiveLinkModal } from '@/ui/modals/archive-link-modal';
import { useDeleteLinkModal } from '@/ui/modals/delete-link-modal';
import LinkHistoryModal from '@/ui/modals/link-history-modal';
import { useLinkQRModal } from '@/ui/modals/link-qr-modal';
import { Chart, CheckCircleFill, Delete, ThreeDots } from '@/ui/shared/icons';
import {
  Avatar,
  BadgeTooltip,
  Button,
  CopyButton,
  IconMenu,
  NumberTooltip,
  Popover,
  SimpleTooltipContent,
  Tooltip,
  useIntersectionObserver,
  useRouterStuff,
} from '@dub/ui';
import { LinkifyTooltipContent } from '@dub/ui/src/tooltip';
import {
  cn,
  getApexDomain,
  isAllowedDomain,
  linkConstructor,
  nFormatter,
  punycode,
  timeAgo,
} from '@dub/utils';
import {
  Archive,
  Ban,
  Copy,
  CopyPlus,
  Edit3,
  FolderInput,
  History,
  Lock,
  Mail,
  MessageCircle,
  QrCode,
  TimerOff,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { useTransferLinkModal } from '../modals/transfer-link-modal';
import LinkLogo from './link-logo';

export default function LinkCard({
  compact = false,
  props,
}: {
  compact?: boolean;
  props: LinkWithTagsProps & {
    user: UserProps;
  };
}) {
  const {
    id,
    key,
    domain,
    url,
    passwordEnabledAt,
    expiresAt,
    createdAt,
    lastClicked,
    archived,
    tags,
    comments,
    user,
    clicks,
    banned,
  } = props;

  const searchParams = useSearchParams();

  const { messages, locale } = useIntlClientHook();
  const message = messages?.menu;

  const [primaryTags, additionalTags] = useMemo(() => {
    const primaryTagsCount = 1;

    const filteredTagIds = searchParams?.get('tagIds')?.split(',')?.filter(Boolean) ?? [];

    /*
      Sort tags so that the filtered tags are first. The most recently selected
      filtered tag (last in array) should be displayed first.
    */
    const sortedTags =
      filteredTagIds.length > 0
        ? [...tags].sort((a, b) => filteredTagIds.indexOf(b.id) - filteredTagIds.indexOf(a.id))
        : tags;

    return [
      sortedTags.filter((_, idx) => idx < primaryTagsCount),
      sortedTags.filter((_, idx) => idx >= primaryTagsCount),
    ];
  }, [tags, searchParams]);

  const apexDomain = getApexDomain(url);

  const params = useParams() as { slug?: string };
  const { slug } = params;

  const { id: workspaceId, exceededClicks } = useWorkspace();

  const linkRef = useRef<any>();
  const entry = useIntersectionObserver(linkRef, {});
  const isVisible = !!entry?.isIntersecting;

  const { setShowLinkQRModal, LinkQRModal } = useLinkQRModal({
    props,
  });
  const { setShowAddEditLinkModal, AddEditLinkModal } = useAddEditLinkModal({
    props,
  });
  const [showHistory, setShowHistory] = useState(false);

  const isGovtechAdmin = !slug;
  const { data: history, isLoading: isLoadingHistory } = useLinkHistory({
    linkId: id,
    enabled: isVisible,
    admin: isGovtechAdmin,
    workspaceId: workspaceId!,
  });

  // Duplicate link Modal
  const { id: _, createdAt: __, updatedAt: ___, userId: ____, ...propsToDuplicate } = props;
  const {
    setShowAddEditLinkModal: setShowDuplicateLinkModal,
    AddEditLinkModal: DuplicateLinkModal,
  } = useAddEditLinkModal({
    // @ts-expect-error
    duplicateProps: {
      ...propsToDuplicate,
      key: `${punycode(key)}-copy`,
      clicks: 0,
    },
  });

  const expired = expiresAt && new Date(expiresAt) < new Date();

  const { setShowArchiveLinkModal, ArchiveLinkModal } = useArchiveLinkModal({
    props,
  });
  const { setShowTransferLinkModal, TransferLinkModal } = useTransferLinkModal({
    props,
  });
  const { setShowDeleteLinkModal, DeleteLinkModal } = useDeleteLinkModal({
    props,
  });
  const [openPopover, setOpenPopover] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    // if there's an existing modal backdrop and the link is selected, unselect it
    const existingModalBackdrop = document.getElementById('modal-backdrop');
    if (existingModalBackdrop && selected) {
      setSelected(false);
    }
  }, [selected]);

  const handlClickOnLinkCard = useCallback(
    (e: any) => {
      // Check if the clicked element is a linkRef or one of its descendants
      const isLinkCardClick = linkRef.current && linkRef.current.contains(e.target);

      // Check if the clicked element is an <a> or <button> element
      const isExcludedElement =
        e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button';

      if (isLinkCardClick && !isExcludedElement) {
        setSelected(!selected);
      } else {
        setSelected(false);
      }
    },
    [selected]
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('click', handlClickOnLinkCard);
    }
    return () => {
      document.removeEventListener('click', handlClickOnLinkCard);
    };
  }, [handlClickOnLinkCard, isVisible]);

  const [copiedLinkId, setCopiedLinkId] = useState(false);

  const copyLinkId = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopiedLinkId(true);
    toast.success('Link ID copied!');
    setTimeout(() => setCopiedLinkId(false), 3000);
  }, [id]);

  const onKeyDown = useCallback(
    (e: any) => {
      const key = e.key.toLowerCase();
      // only run shortcut logic if:
      // - usage is not exceeded
      // - link is selected or the 3 dots menu is open
      // - the key pressed is one of the shortcuts
      // - there is no existing modal backdrop
      if ((selected || openPopover) && ['e', 'd', 'q', 'a', 't', 'i', 'x', 'h'].includes(key)) {
        setSelected(false);
        e.preventDefault();
        switch (key) {
          case 'e':
            setShowAddEditLinkModal(true);
            break;
          case 'd':
            setShowDuplicateLinkModal(true);
            break;
          case 'q':
            setShowLinkQRModal(true);
            break;
          case 'a':
            setShowArchiveLinkModal(true);
            break;
          case 't':
            if (isAllowedDomain(domain)) {
              setShowTransferLinkModal(true);
            }
            break;
          case 'i':
            copyLinkId();
            break;
          case 'x':
            setShowDeleteLinkModal(true);
            break;
          case 'h':
            setShowHistory(true);
            break;
        }
        setOpenPopover(false);
      }
    },
    [
      copyLinkId,
      domain,
      openPopover,
      selected,
      setShowAddEditLinkModal,
      setShowArchiveLinkModal,
      setShowDeleteLinkModal,
      setShowDuplicateLinkModal,
      setShowLinkQRModal,
      setShowTransferLinkModal,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  function onClickBanButton() {
    toast.promise(
      (async () => {
        await fetch(`/api/admin/links/${id}/ban`, {
          method: 'PUT',
          body: JSON.stringify({ ban: !banned }),
        });
        await mutate(
          (key) => typeof key === 'string' && key.startsWith('/api/admin/links'),
          undefined,
          { revalidate: true }
        );
      })(),
      {
        loading: "Updating the link's ban status...",
        success: "Updated the link's ban status!",
        error: "Error updating the link's ban status",
      }
    );
    setOpenPopover(false);
  }

  const { data: session } = useSession();

  return (
    <li
      ref={linkRef}
      className={cn(
        selected ? 'border-black' : 'border-gray-50',
        compact
          ? 'relative border-l border-r border-t border-gray-200 bg-white p-3 transition-all first:rounded-t-lg last:rounded-b-lg last:border-b hover:bg-gray-100'
          : 'relative flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white xs:p-2 md:p-5 shadow-sm transition-all hover:shadow-md font-poppins hover:bg-gray-100'
      )}
    >
      {isVisible && (
        <>
          <LinkQRModal />
          <AddEditLinkModal />
          <DuplicateLinkModal />
          <ArchiveLinkModal />
          <TransferLinkModal />
          <DeleteLinkModal />
          <LinkHistoryModal
            isLoading={isLoadingHistory}
            history={history || []}
            show={showHistory}
            setShow={setShowHistory}
            link={`${domain}/${key}`}
          />
        </>
      )}
      <div className="relative flex items-center justify-between">
        <div className="relative flex shrink items-center">
          {archived || expired ? (
            <Tooltip
              content={
                archived
                  ? "This link is archived. It will still work, but won't be shown in your dashboard."
                  : "This link has expired. It will still show up in your dashboard, but users will get an 'Expired Link' page when they click on it."
              }
            >
              <div
                className={cn(
                  compact
                    ? 'flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 px-0 sm:h-6 sm:w-6'
                    : 'flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 px-0 sm:h-10 sm:w-10'
                )}
              >
                {archived ? (
                  <Archive
                    className={cn(
                      compact
                        ? 'h-2 w-2 text-gray-500 sm:h-3 sm:w-3'
                        : 'h-4 w-4 text-gray-500 sm:h-5 sm:w-5'
                    )}
                  />
                ) : (
                  <TimerOff
                    className={cn(
                      compact
                        ? 'h-2 w-2 text-gray-500 sm:h-3 sm:w-3'
                        : 'h-4 w-4 text-gray-500 sm:h-5 sm:w-5'
                    )}
                  />
                )}
              </div>
            </Tooltip>
          ) : (
            <LinkLogo className={cn(compact && 'h-4 w-4 sm:h-6 sm:w-6')} apexDomain={apexDomain} />
          )}
          {/* 
            Here, we're manually setting ml-* values because if we do space-x-* in the parent div, 
            it messes up the tooltip positioning.
          */}
          <div className={cn('ml-2 sm:ml-4', compact && 'flex gap-3')}>
            <div className="flex max-w-fit flex-wrap items-center gap-x-2">
              {
                <a
                  className={cn(
                    'max-w-[140px] truncate text-sm font-semibold text-blue-800 sm:max-w-[300px] sm:text-base md:max-w-[360px] xl:max-w-[500px]',
                    {
                      'text-gray-500': archived || expired,
                    }
                  )}
                  href={linkConstructor({
                    domain,
                    key,
                  })}
                  target="_blank"
                  rel="noreferrer"
                >
                  {linkConstructor({
                    domain,
                    key,
                    pretty: true,
                  })}
                </a>
              }
              <CopyButton
                value={linkConstructor({
                  domain,
                  key,
                })}
              />
              {comments && (
                <Tooltip content={<LinkifyTooltipContent>{comments}</LinkifyTooltipContent>}>
                  <button
                    onClick={() => {
                      setShowAddEditLinkModal(true);
                    }}
                    className="group rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 active:scale-100"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-gray-700" />
                  </button>
                </Tooltip>
              )}
              {primaryTags.map((tag) => (
                <TagButton key={tag.id} {...tag} />
              ))}
              {additionalTags.length > 0 && (
                <BadgeTooltip
                  content={
                    <div className="flex flex-wrap gap-1.5 p-3">
                      {additionalTags.map((tag) => (
                        <TagButton key={tag.id} {...tag} />
                      ))}
                    </div>
                  }
                  side="top"
                >
                  +{additionalTags.length}
                </BadgeTooltip>
              )}
            </div>
            <div className="flex max-w-fit items-center space-x-1">
              <Tooltip
                content={
                  <div className="w-full p-4">
                    <Avatar user={user} className="h-10 w-10" />
                    <div className="mt-2 flex items-center space-x-1.5">
                      <p className="text-sm font-semibold text-gray-700">
                        {user?.name || user?.email || 'Anonymous User'}
                      </p>
                      {!slug && // this is only shown in admin mode (where there's no slug)
                        user?.email && (
                          <CopyButton
                            value={user.email}
                            icon={Mail}
                            className="[&>*]:h-3 [&>*]:w-3"
                          />
                        )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {messages?.misc?.created}{' '}
                      {new Date(createdAt).toLocaleDateString('en-us', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                }
              >
                {/* Without the wrapping div, the Tooltip won't be triggered for some reason */}
                <div className="w-4">
                  <Avatar user={user} className="h-4 w-4" />
                </div>
              </Tooltip>
              <p>•</p>
              <p className="whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                {timeAgo(createdAt)}
              </p>
              <p className="xs:block hidden">{compact ? '' : '•'}</p>
              {passwordEnabledAt && (
                <Tooltip
                  content={
                    <SimpleTooltipContent
                      title="This link is password-protected."
                      cta="Learn more."
                      href="https://github.com/govtechmy/go-gov-my/discussions"
                    />
                  }
                >
                  <Lock className="xs:block hidden h-4 w-4 text-gray-500" />
                </Tooltip>
              )}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="xs:block hidden max-w-[140px] truncate text-sm font-medium text-gray-700 underline-offset-2 hover:underline sm:max-w-[300px] md:max-w-[360px] xl:max-w-[420px]"
              >
                {compact ? '' : url}
              </a>
              <p>{compact ? '' : '•'}</p>
              {expiresAt && (
                <span className="text-xs text-gray-500">
                  (Expires:{' '}
                  {new Date(expiresAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  )
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <NumberTooltip value={clicks} lastClicked={lastClicked}>
            <Link
              href={`/${locale}/${slug}/analytics?key=${key}`}
              className="flex items-center space-x-1 rounded-md bg-gray-100 px-2 py-0.5 transition-all duration-75 hover:scale-105 active:scale-100"
            >
              <Chart className="h-4 w-4" />
              <p className="whitespace-nowrap text-sm text-gray-500">
                {nFormatter(clicks)}
                <span className="ml-1 hidden sm:inline-block">
                  {clicks <= 1 ? messages?.workspace?.click : messages?.workspace?.clicks}
                </span>
              </p>
            </Link>
          </NumberTooltip>
          <Popover
            content={
              <div className="grid w-full gap-px p-2 sm:w-48">
                <Button
                  text={message?.edit}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowAddEditLinkModal(true);
                  }}
                  icon={<Edit3 className="h-4 w-4" />}
                  shortcut="E"
                  className="h-9 px-2 font-medium"
                />
                <Button
                  text={message?.duplicate}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowDuplicateLinkModal(true);
                  }}
                  icon={<CopyPlus className="h-4 w-4" />}
                  shortcut="D"
                  className="h-9 px-2 font-medium"
                />
                <Button
                  text={message?.qr}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowLinkQRModal(true);
                  }}
                  icon={<QrCode className="h-4 w-4" />}
                  shortcut="Q"
                  className="h-9 px-2 font-medium"
                />
                <Button
                  text={archived ? message?.unarchive : message?.archive}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowArchiveLinkModal(true);
                  }}
                  icon={<Archive className="h-4 w-4" />}
                  shortcut="A"
                  className="h-9 px-2 font-medium"
                />
                <Button
                  text={message?.transfer}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowTransferLinkModal(true);
                  }}
                  icon={<FolderInput className="h-4 w-4" />}
                  shortcut="T"
                  className="h-9 px-2 font-medium"
                  {...(!isAllowedDomain(domain) && {
                    disabledTooltip: (
                      <SimpleTooltipContent
                        title="Since this is a custom domain link, you can only transfer it to another workspace if you transfer the domain as well."
                        cta="Learn more."
                        href="https://github.com/govtechmy/go-gov-my/discussions"
                      />
                    ),
                  })}
                />
                <Button
                  text={message?.copy_link_id}
                  variant="outline"
                  onClick={() => copyLinkId()}
                  icon={
                    copiedLinkId ? (
                      <CheckCircleFill className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )
                  }
                  shortcut="I"
                  className="h-9 px-2 font-medium"
                />
                <Button
                  text={messages.link.history.view_history}
                  variant="outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowHistory(true);
                  }}
                  icon={<History className="h-4 w-4" />}
                  shortcut="H"
                  className="h-9 px-2 font-medium capitalize"
                />
                <Button
                  text={message?.delete}
                  variant="danger-outline"
                  onClick={() => {
                    setOpenPopover(false);
                    setShowDeleteLinkModal(true);
                  }}
                  icon={<Delete className="h-4 w-4" />}
                  shortcut="X"
                  className="h-9 px-2 font-medium"
                />
                {(session?.user?.role === 'super_admin' ||
                  session?.user?.role === 'agency_admin') && (
                  <button
                    className="group flex w-full items-center justify-between rounded-md p-2 text-left text-sm font-medium text-red-600 transition-all duration-75 hover:bg-red-600 hover:text-white"
                    onClick={() => onClickBanButton()}
                  >
                    <IconMenu
                      text={banned ? message.unban : message.ban}
                      icon={<Ban className="h-4 w-4" />}
                    />
                    <kbd className="hidden rounded bg-red-100 px-2 py-0.5 text-xs font-light text-red-600 transition-all duration-75 group-hover:bg-red-500 group-hover:text-white sm:inline-block">
                      B
                    </kbd>
                  </button>
                )}
              </div>
            }
            align="end"
            openPopover={openPopover}
            setOpenPopover={setOpenPopover}
          >
            <button
              type="button"
              onClick={() => {
                setOpenPopover((openPopover) => !openPopover);
              }}
              className="rounded-md px-1 py-2 transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
            >
              <span className="sr-only">{message?.more_options}</span>
              <ThreeDots className="h-5 w-5 text-gray-500" />
            </button>
          </Popover>
        </div>
      </div>
    </li>
  );
}

function TagButton(tag: TagProps) {
  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();

  const selectedTagIds = searchParams?.get('tagIds')?.split(',')?.filter(Boolean) ?? [];

  return (
    <button
      onClick={() => {
        let newTagIds = selectedTagIds.includes(tag.id)
          ? selectedTagIds.filter((id) => id !== tag.id)
          : [...selectedTagIds, tag.id];

        queryParams({
          set: {
            tagIds: newTagIds.join(','),
          },
          del: [...(newTagIds.length ? [] : ['tagIds'])],
        });
      }}
      className="transition-all duration-75 hover:scale-105 active:scale-100"
    >
      <TagBadge {...tag} withIcon />
    </button>
  );
}
