import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Copy, IconMenu, Popover, Tick, useOptimisticUpdate } from '@dub/ui';
import { linkConstructor } from '@dub/utils';
import { Share2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { AnalyticsContext } from '.';

export default function SharePopover() {
  const [openSharePopover, setopenSharePopoverPopover] = useState(false);
  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString, domain, key } = useContext(AnalyticsContext) as {
    baseApiPath: string;
    queryString: string;
    domain: string;
    key: string; // coerce to string since <SharePopover is not shown if key is undefined)
  };

  const { data, isLoading, update } = useOptimisticUpdate<{
    publicStats: boolean;
  }>(`/api/analytics?${queryString}`, {
    loading: message?.updating,
    success: message?.success,
    error: message?.error,
  });

  const handleUpdate = async (checked: boolean) => {
    const res = await fetch(`/api/analytics?${queryString}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicStats: checked,
      }),
    });
    if (!res.ok) {
      throw new Error(message?.fail_to_update);
    }
    if (res.status === 200) {
      checked &&
        navigator.clipboard.writeText(`https://${domain}/stats/${encodeURIComponent(key)}`);
    }
    return { publicStats: checked };
  };

  const [copied, setCopied] = useState(false);

  if (!data) return null;

  return (
    <Popover
      content={
        <div className="w-full divide-y divide-gray-200 text-sm md:w-60">
          <div className="p-4">
            <p className="text-gray-500">{message?.share_stat}</p>
            <p className="truncate font-semibold text-gray-800">
              {linkConstructor({ key, domain, pretty: true })}
            </p>
          </div>
          {/* <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-gray-800">
                {message?.public_stat}
              </p>
              <Switch
                checked={data?.publicStats}
                loading={isLoading}
                fn={(checked: boolean) => {
                  update(() => handleUpdate(checked), { publicStats: checked });
                }}
              />
            </div>
            <p className="text-gray-500">{message?.stat_desc}</p>
          </div> */}
          <div className="p-4">
            <p className="font-semibold text-gray-800">{message?.share_link}</p>
            <p className="text-gray-500">{message?.stat_desc}</p>
            <div className="divide-x-200 mt-2 flex items-center justify-between divide-x overflow-hidden rounded-md border border-gray-200 bg-gray-100">
              <div className="scrollbar-hide overflow-scroll pl-2">
                <p className="whitespace-nowrap text-gray-600">
                  https://{domain}/stats/{encodeURIComponent(key)}
                </p>
              </div>
              <button
                className="h-8 flex-none border-l bg-white px-2 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://${domain}/stats/${encodeURIComponent(key)}`
                  );
                  setCopied(true);
                  toast.success('Copied to clipboard');
                  setTimeout(() => setCopied(false), 3000);
                }}
              >
                {copied ? (
                  <Tick className="h-4 w-4 text-gray-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      }
      align="end"
      openPopover={openSharePopover}
      setOpenPopover={setopenSharePopoverPopover}
    >
      <button
        onClick={() => setopenSharePopoverPopover(!openSharePopover)}
        className="flex w-24 items-center justify-center space-x-2 rounded-md bg-white px-3 py-2.5 shadow transition-all hover:shadow-md"
      >
        <IconMenu text="Share" icon={<Share2 className="h-4 w-4" />} />
      </button>
    </Popover>
  );
}
