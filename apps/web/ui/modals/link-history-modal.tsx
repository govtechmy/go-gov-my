import type { LinkHistory } from "@/lib/api/links/add-to-history";
import { Modal } from "@dub/ui";
import { X } from "lucide-react";

export default function LinkHistoryModal({
  history,
  show = false,
  setShow,
}: {
  history: LinkHistory[];
  show: boolean;
  setShow: (value: boolean) => void;
}) {
  return (
    <Modal showModal={show} setShowModal={setShow} className="max-w-screen-md">
      <div className="scrollbar-hide  max-h-[95vh] overflow-auto">
        <h2 className="border-gray sticky top-0 z-20 mb-2 h-14 border-b bg-white p-5 text-lg font-medium">
          Link History
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
          {history.length > 0 ? (
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
  return (
    <div>
      {history.map((h, i, arr) => {
        if (h.type === "create") {
          return (
            <div className="flex gap-4 " key={i}>
              {arr.length > 1 && (
                <VerticalTimeline
                  isFirst={i === 0}
                  isLast={i === arr.length - 1}
                />
              )}
              <div className="my-2 flex-1 rounded-lg border p-4">
                <h3 className="mb-4">
                  Created on {h.timestamp.toLocaleDateString()},{" "}
                  {h.timestamp.toLocaleTimeString()}
                </h3>
                <ul className="ml-4 list-disc">
                  <li>{`https://${h.domain}/${h.key} was created`}</li>
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
                Changes on {h.timestamp.toLocaleDateString()},{" "}
                {h.timestamp.toLocaleTimeString()}
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
        className="bg-grey-400 absolute bottom-[50%] left-0 right-0 mx-auto h-3 w-3 rounded-full bg-gray-200"
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
  const messages: React.ReactNode[] = [];

  const keysToInclude: (keyof LinkHistory)[] = [
    "android",
    "archived",
    "description",
    "domain",
    "expiredUrl",
    "expiresAt",
    "externalId",
    "geo",
    "image",
    "ios",
    "key",
    "password",
    "proxy",
    "publicStats",
    "title",
    "trackConversion",
    "url",
  ];

  for (const k of Object.keys(prev)) {
    const key = k as keyof LinkHistory;
    const prevVal = prev[key];
    const currVal = curr[key];

    if (!keysToInclude.includes(key) || prevVal === currVal) {
      continue;
    }

    if (key === "archived") {
      messages.push(
        <li>
          Link was <strong>{currVal ? "archived" : "unarchived"}</strong>
        </li>,
      );
      continue;
    }

    if (typeof prevVal === "boolean" && typeof currVal === "boolean") {
      messages.push(
        <li>
          <strong>{formatKey(key)}</strong> was{" "}
          <strong>{currVal ? "enabled" : "disabled"}</strong>
        </li>,
      );
      continue;
    }

    if (!prevVal && currVal) {
      messages.push(
        <li>
          <strong>{formatKey(key)}</strong> was set to{" "}
          <strong>{currVal.toString()}</strong>
        </li>,
      );
      continue;
    }

    if (prevVal && !currVal) {
      messages.push(
        <li>
          <strong>{formatKey(key)}</strong> was <strong>removed</strong>
        </li>,
      );
      continue;
    }

    if (typeof prevVal === typeof currVal) {
      messages.push(
        <li>
          <strong>{formatKey(key)}</strong> was changed from{" "}
          <strong>{prevVal?.toString()}</strong> to{" "}
          <strong>{currVal?.toString()}</strong>
        </li>,
      );
      continue;
    }

    messages.push(<li>{key} was changed</li>);
  }

  return messages;
}

function formatKey(key: keyof LinkHistory): string {
  switch (key) {
    case "trackConversion":
      return "Conversion tracking";
    case "ios":
      return "URL for iOS devices";
    case "android":
      return "URL for Android devices";
    case "expiredUrl":
      return "Expired URL";
    case "expiresAt":
      return "Expiry date";
    case "publicStats":
      return "Public statistics";
    case "proxy":
      return "Social media cards";
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}
