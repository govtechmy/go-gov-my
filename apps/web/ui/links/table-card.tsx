import { LinkHistory } from '@/lib/api/links/add-to-history';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { LinkWithTagsProps, TagProps, UserProps } from '@/lib/types';
import TagBadge from '@/ui/links/tag-badge';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import { useArchiveLinkModal } from '@/ui/modals/archive-link-modal';
import { useDeleteLinkModal } from '@/ui/modals/delete-link-modal';
import LinkHistoryModal from '@/ui/modals/link-history-modal';
import { useLinkQRModal } from '@/ui/modals/link-qr-modal';
import {
  BadgeTooltip,
  CopyButton,
  Tooltip,
  useIntersectionObserver,
  useRouterStuff,
} from '@dub/ui';
import { LinkifyTooltipContent } from '@dub/ui/src/tooltip';
import {
  cn,
  fetcher,
  getApexDomain,
  isAllowedDomain,
  linkConstructor,
  punycode,
  timeAgo,
} from '@dub/utils';
import { Archive, MessageCircle, TimerOff } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useTransferLinkModal } from '../modals/transfer-link-modal';
import LinkLogo from './link-logo';

export default function TableCard({
  props,
}: {
  props: LinkWithTagsProps & {
    user: UserProps;
  };
}) {
  const {
    id,
    key,
    domain,
    url,
    expiresAt,
    createdAt,
    lastClicked,
    archived,
    tags,
    comments,
    user,
  } = props;

  const { messages, locale } = useIntlClientHook();
  const searchParams = useSearchParams();
  const message = messages?.menu;
  const apexDomain = getApexDomain(url);
  const params = useParams() as { slug?: string };
  const { slug } = params;
  const { id: workspaceId, exceededClicks } = useWorkspace();
  const linkRef = useRef<any>();
  const entry = useIntersectionObserver(linkRef, {});
  const isVisible = !!entry?.isIntersecting;
  const clicks = 0;
  const { setShowLinkQRModal, LinkQRModal } = useLinkQRModal({
    props,
  });
  const { setShowAddEditLinkModal, AddEditLinkModal } = useAddEditLinkModal({
    props,
  });
  const [showHistory, setShowHistory] = useState(false);
  const expired = expiresAt && new Date(expiresAt) < new Date();

  const [primaryTags, additionalTags] = useMemo(() => {
    const primaryTagsCount = 1;
    const filteredTagIds = searchParams?.get('tagIds')?.split(',')?.filter(Boolean) ?? [];
    const sortedTags =
      filteredTagIds.length > 0
        ? [...tags].sort((a, b) => filteredTagIds.indexOf(b.id) - filteredTagIds.indexOf(a.id))
        : tags;

    return [
      sortedTags.filter((_, idx) => idx < primaryTagsCount),
      sortedTags.filter((_, idx) => idx >= primaryTagsCount),
    ];
  }, [tags, searchParams]);

  const { data: history, isLoading: isLoadingHistory } = useSWR<LinkHistory[]>(
    isVisible && `/api/links/${id}/history?workspaceId=${workspaceId}`,
    async (input: RequestInfo, init?: RequestInit) => {
      const history = await fetcher<LinkHistory[]>(input, init);
      history.forEach((h) => {
        h.timestamp = new Date(h.timestamp);
        if (h.expiresAt) h.expiresAt = new Date(h.expiresAt);
      });
      return history;
    }
  );

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

  // TODO: Fix analytics API
  // const { data: clicks } = useSWR<number>(
  //   // only fetch clicks if the link is visible and there's a slug and the usage is not exceeded
  //   isVisible &&
  //     workspaceId &&
  //     !exceededClicks &&
  //     `/api/analytics/clicks?workspaceId=${workspaceId}&linkId=${id}&interval=all&`,
  //   (url) =>
  //     fetcher(url, {
  //       headers: {
  //         "Request-Source": process.env.NEXT_PUBLIC_APP_DOMAIN!,
  //       },
  //     }),
  //   {
  //     fallbackData: props.clicks,
  //     dedupingInterval: 60000,
  //   },
  // );

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

  const handlClickOnLinkCard = (e: any) => {
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
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('click', handlClickOnLinkCard);
    }
    return () => {
      document.removeEventListener('click', handlClickOnLinkCard);
    };
  }, [handlClickOnLinkCard]);

  const [copiedLinkId, setCopiedLinkId] = useState(false);

  const copyLinkId = () => {
    navigator.clipboard.writeText(id);
    setCopiedLinkId(true);
    toast.success('Link ID copied!');
    setTimeout(() => setCopiedLinkId(false), 3000);
  };

  const onKeyDown = (e: any) => {
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
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <tr
      ref={linkRef}
      className={`${
        selected ? 'border-black' : 'border-gray-50'
      } border-b bg-transparent dark:border-gray-700`}
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
      {/* Short Link Col */}
      <td className="px-2 py-2">
        <div className="relative flex shrink items-center px-4 py-2">
          {/* Logo */}
          {archived || expired ? (
            <Tooltip
              content={
                archived
                  ? "This link is archived. It will still work, but won't be shown in your dashboard."
                  : "This link has expired. It will still show up in your dashboard, but users will get an 'Expired Link' page when they click on it."
              }
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 px-0 sm:h-10 sm:w-10">
                {archived ? (
                  <Archive className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                ) : (
                  <TimerOff className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                )}
              </div>
            </Tooltip>
          ) : (
            <LinkLogo apexDomain={apexDomain} />
          )}

          {/* Actual Short Links */}
          <div className="ml-2 sm:ml-4">
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
          </div>
        </div>
      </td>

      <td className="px-2 py-2">
        <div className="flex">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="xs:block hidden max-w-[140px] truncate text-sm font-medium text-gray-700 underline-offset-2 hover:underline sm:max-w-[300px] md:max-w-[360px] xl:max-w-[420px]"
          >
            {url}
          </a>
        </div>
      </td>

      <td className="px-2 py-2">
        <div className="flex">
          <p className="whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
            {timeAgo(createdAt)}
            {/* {new Date(createdAt).toLocaleDateString("en-GB")} */}
          </p>
        </div>
      </td>
    </tr>
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
