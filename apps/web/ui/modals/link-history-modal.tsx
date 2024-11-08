import type { LinkHistory } from '@/lib/api/links/add-to-history';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LoadingSpinner, Modal } from '@dub/ui';
import { X } from 'lucide-react';

export default function LinkHistoryModal({
  history,
  show = false,
  setShow,
  isLoading,
  link,
}: {
  history: LinkHistory[];
  show: boolean;
  setShow: (value: boolean) => void;
  isLoading?: boolean;
  link: string;
}) {
  const messages = useIntlClientHook();

  return (
    <Modal showModal={show} setShowModal={setShow} className="max-w-screen-md">
      <div className="scrollbar-hide max-h-[95vh] overflow-auto">
        <h2 className="border-gray sticky top-0 z-20 mb-2 h-14 border-b bg-white p-5 text-lg font-medium">
          {messages.messages.link.history.history_for} {link}
        </h2>
        <button
          onClick={() => {
            setShow(false);
          }}
          className="group absolute right-0 top-0 z-20 m-3 hidden rounded-full p-2 text-gray-500 transition-all duration-75 hover:bg-gray-100 focus:outline-none active:bg-gray-200 md:block"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="px-5 pb-5">
          {isLoading ? (
            <LoadingSpinner className="mx-auto my-10" />
          ) : history.length > 0 ? (
            <LinkHistoryTimeline history={history} />
          ) : (
            <p>No history found</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function LinkHistoryTimeline({ history }: { history: LinkHistory[] }) {
  const { messages } = useIntlClientHook();

  return (
    <div>
      {history.map((h, i, arr) => {
        if (h.type === 'create') {
          return (
            <div className="flex gap-4" key={i}>
              {arr.length > 1 && (
                <VerticalTimeline
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                />
              )}
              <div className="my-2 flex-1 rounded-lg border p-4">
                <h3 className="mb-4">
                  {messages.link.history.created_on} {formatDate(h.timestamp)}{' '}
                  by <strong>{h.committedByUser.name}</strong>
                </h3>
                <ul className="ml-4 list-disc">
                  <li>
                    {`https://${h.domain}/${h.key}`}{' '}
                    {messages.link.history.was_created}
                  </li>
                </ul>
              </div>
            </div>
          );
        }

        const prevHistory = arr.at(i + 1);
        // no previous history to compare with
        if (!prevHistory) {
          return null;
        }

        return (
          <div className="flex gap-4" key={i}>
            <VerticalTimeline isFirst={i === 0} isLast={i === arr.length - 1} />
            <div className="my-2 flex-1 rounded-lg border p-4">
              <h3 className="mb-4">
                {messages.link.history.changes_on} {formatDate(h.timestamp)} by{' '}
                <strong>{h.committedByUser.name}</strong>
              </h3>
              <ul className="ml-4 list-disc">
                <UpdateMessages prev={prevHistory} curr={h} />
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VerticalTimeline({
  isFirst,
  isLast,
}: {
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="relative w-8">
      {!isFirst && (
        <div
          aria-hidden
          className="absolute inset-0 bottom-[50%] mx-auto w-0 border-l"
        ></div>
      )}
      <div
        aria-hidden
        className="bg-grey-400 absolute bottom-[50%] left-0 right-0 mx-auto h-3 w-3 rounded-full bg-gray-300"
      ></div>
      {!isLast && (
        <div
          aria-hidden
          className="absolute inset-0 top-[50%] mx-auto w-0 border-l"
        ></div>
      )}
    </div>
  );
}

function UpdateMessages({
  prev,
  curr,
}: {
  prev: LinkHistory;
  curr: LinkHistory;
}) {
  const { messages } = useIntlClientHook();
  const changes: React.ReactNode[] = [];

  const keysToInclude: (keyof LinkHistory)[] = [
    'android',
    'archived',
    'description',
    'domain',
    'expiredUrl',
    'expiresAt',
    'externalId',
    'geo',
    'image',
    'ios',
    'key',
    'proxy',
    'publicStats',
    'title',
    'trackConversion',
    'url',
  ];

  function formatKey(key: keyof LinkHistory): string {
    if (messages.link.history[key]) {
      return messages.link.history[key];
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  for (const k of Object.keys(prev)) {
    const key = k as keyof LinkHistory;
    let prevVal = prev[key];
    let currVal = curr[key];

    if (!keysToInclude.includes(key) || prevVal === currVal) {
      continue;
    }

    if (currVal instanceof Date) currVal = formatDate(currVal);
    if (prevVal instanceof Date) prevVal = formatDate(prevVal);

    if (key === 'archived') {
      changes.push(
        <li>
          Link was{' '}
          <strong>
            {currVal
              ? messages.link.history.archived
              : messages.link.history.unarchived}
          </strong>
        </li>,
      );
      continue;
    }

    if (typeof prevVal === 'boolean' && typeof currVal === 'boolean') {
      changes.push(
        <li>
          <strong>{formatKey(key)}</strong> {messages.link.history.was}{' '}
          <strong>
            {currVal
              ? messages.link.history.enabled
              : messages.link.history.disabled}
          </strong>
        </li>,
      );
      continue;
    }

    if (!prevVal && currVal) {
      changes.push(
        <li>
          <strong>{formatKey(key)}</strong> {messages.link.history.was_set_to}{' '}
          <strong>
            {key === 'geo'
              ? Object.entries(currVal)
                  .map(([k, v]) => `${k} : ${v}`)
                  .join(', ')
              : currVal?.toString()}
          </strong>
        </li>,
      );
      continue;
    }

    if (prevVal && !currVal) {
      changes.push(
        <li>
          <strong>{formatKey(key)}</strong> {messages.link.history.was}{' '}
          <strong>removed</strong>
        </li>,
      );
      continue;
    }

    if (typeof prevVal === typeof currVal) {
      changes.push(
        <li>
          <strong>{formatKey(key)}</strong>{' '}
          {key === 'geo' && typeof prevVal === 'object' && prevVal !== null
            ? messages.link.history.was_set_to + ' '
            : messages.link.history.was_changed_from + ' '}
          <strong>
            {key === 'geo' && typeof prevVal === 'object' && prevVal !== null
              ? ' '
              : prevVal?.toString()}
          </strong>{' '}
          {key === 'geo' && typeof prevVal === 'object' && prevVal !== null
            ? ''
            : messages.link.history.to + ' '}
          <strong>
            {key === 'geo' && typeof currVal === 'object' && currVal !== null
              ? Object.entries(currVal)
                  .map(([k, v]) => `${k} : ${v}`)
                  .join(', ')
              : currVal?.toString()}
          </strong>
        </li>,
      );
      continue;
    }

    changes.push(
      <li>
        {key} {messages.link.history.was_changed}
      </li>,
    );
  }

  return changes;
}

function formatDate(date: Date) {
  return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
}
