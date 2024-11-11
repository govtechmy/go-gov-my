import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Button, LoadingSpinner, Tooltip, TooltipContent } from '@dub/ui';
import { Download } from 'lucide-react';
import { useContext, useState } from 'react';
import { toast } from 'sonner';
import { AnalyticsContext } from '.';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const { totalClicks } = useContext(AnalyticsContext);
  const { queryString } = useContext(AnalyticsContext);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.analytics;

  async function exportData() {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/export?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(response.statusText);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${process.env.NEXT_PUBLIC_APP_DOMAIN} Export - ${new Date().toISOString()}.zip`;
      a.click();
    } catch (error) {
      throw new Error(error);
    }
    setLoading(false);
  }

  // show a tooltip to make the user aware that there is no data to export if there is no data
  return totalClicks === 0 || !totalClicks ? (
    <Tooltip
      content={
        <TooltipContent
          title={message?.no_data_download}
          cta={message?.learn_more}
          href="https://github.com/govtechmy/go-gov-my/discussions"
        />
      }
    >
      <Button
        icon={<Download className="h-4 w-4" />}
        variant="secondary"
        shortcut="E"
        disabled={true}
        className="cursor-not-allowed "
      />
    </Tooltip>
  ) : (
    <Button
      disabled={loading}
      variant="secondary"
      shortcut="E"
      onClick={() => {
        toast.promise(exportData(), {
          loading: message?.export_loading,
          success: message?.export_successfully,
          error: (error) => error,
        });
      }}
    >
      {loading ? <LoadingSpinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
    </Button>
  );
}
