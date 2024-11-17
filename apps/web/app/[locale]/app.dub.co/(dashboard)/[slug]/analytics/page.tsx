'use client';
import Analytics from '@/ui/analytics';
import LayoutLoader from '@/ui/layout/layout-loader';
import { Suspense, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AnalyticsClient from './client';
import { Button, MaxWidthWrapper } from '@dub/ui';
import PageTitle from '@/ui/typography/page-title';
import { cn } from '@dub/utils';
import { Download, Settings } from 'lucide-react';
import { LinkButton } from '@dub/ui/src/link-button';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/ui/shared/icons';
import { toast } from 'sonner';
import { LoadingSpinner } from '@dub/ui';
import { Tooltip, TooltipContent } from '@dub/ui';
import { VALID_ANALYTICS_FILTERS } from '@/lib/analytics/constants';
import useWorkspace from '@/lib/swr/use-workspace';

export default function WorkspaceAnalytics() {
  const { messages, locale } = useIntlClientHook();
  const { id } = useWorkspace();
  const params = useParams() as { slug: string };
  const { slug } = params;
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const existingModalBackdrop = document.getElementById('modal-backdrop');

      if (
        !e.metaKey &&
        !e.ctrlKey &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !existingModalBackdrop &&
        !loading
      ) {
        const key = e.key.toLowerCase();

        switch (key) {
          case 'l':
            e.preventDefault();
            router.push(`/${locale}/${slug}`);
            break;
          case 'e':
            e.preventDefault();
            exportData();
            break;
          case 's':
            e.preventDefault();
            router.push(`/${locale}/${slug}/settings`);
            break;
        }
      }
    },
    [loading, locale, slug, router]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Construct queryString similar to Analytics component
  const queryString = useMemo(() => {
    const availableFilterParams = VALID_ANALYTICS_FILTERS.reduce((acc, filter) => {
      const value = searchParams?.get(filter);
      return value ? { ...acc, [filter]: value } : acc;
    }, {});

    const params = {
      ...(slug && { workspaceId: id }),
      ...(searchParams?.get('domain') && { domain: searchParams.get('domain')! }),
      ...(searchParams?.get('key') && { key: searchParams.get('key')! }),
      ...(searchParams?.get('interval') && { interval: searchParams.get('interval')! }),
      ...(searchParams?.get('start') && { start: searchParams.get('start')! }),
      ...(searchParams?.get('end') && { end: searchParams.get('end')! }),
      ...(searchParams?.get('tagId') && { tagId: searchParams.get('tagId')! }),
      ...availableFilterParams,
    };

    return new URLSearchParams(params as Record<string, string>).toString();
  }, [searchParams, slug, id]);

  // Add exportData to useCallback
  const exportData = useCallback(async () => {
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
  }, [queryString]); // Add queryString as dependency

  return (
    <Suspense fallback={<LayoutLoader />}>
      <div className="bg-white w-full border-b border-gray-200">
        <MaxWidthWrapper className={cn('flex flex-col bg-white py-6 max-w-7xl')}>
          <AnalyticsClient>
            <div className="flex flex-row items-center justify-between xs:px-4 sm:px-4 md:px-2 lg:px-0">
              <PageTitle text={messages?.dashboard?.analytics} />
              <HeaderButtons
                loading={loading}
                exportData={exportData}
                messages={messages}
                locale={locale}
                slug={slug}
                queryString={queryString}
              />
            </div>
          </AnalyticsClient>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper>
        <AnalyticsClient>
          <Analytics />
        </AnalyticsClient>
      </MaxWidthWrapper>
    </Suspense>
  );
}

function HeaderButtons({ loading, exportData, messages, locale, slug, queryString }) {
  const [totalClicks, setTotalClicks] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalClicks = async () => {
      try {
        const response = await fetch(`/api/analytics/clicks/count?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            credentials: 'include',
          },
        });

        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json();
        setTotalClicks(data.count || 0);
      } catch (error) {
        console.error('Error fetching total clicks:', error);
        setTotalClicks(0);
      }
    };

    if (queryString) {
      fetchTotalClicks();
    }
  }, [queryString]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center space-x-2 z-10 font-poppins">
        <LinkButton
          icon={<Link className="h-4 w-4" />}
          variant="secondary-outline"
          shortcut="L"
          href={`/${locale}/${slug}`}
          text={messages?.dashboard?.Link_Short}
          className="hidden sm:flex items-center gap-2 px-4 py-2"
        />
        <LinkButton
          icon={<Link className="h-4 w-4" />}
          variant="secondary-outline"
          href={`/${locale}/${slug}`}
          className="sm:hidden flex items-center px-3 py-2"
        />

        <>
          <Button
            icon={
              loading ? <LoadingSpinner className="h-4 w-4" /> : <Download className="h-4 w-4" />
            }
            variant="secondary"
            shortcut="E"
            text={messages?.modal?.export}
            className="hidden sm:flex items-center gap-2 px-4 py-2"
            disabled={loading}
            onClick={() => {
              toast.promise(exportData(), {
                loading: messages?.analytics?.export_loading,
                success: messages?.analytics?.export_successfully,
                error: (error) => error,
              });
            }}
          />
          <Button
            icon={
              loading ? <LoadingSpinner className="h-4 w-4" /> : <Download className="h-4 w-4" />
            }
            variant="secondary"
            disabled={loading}
            className="sm:hidden flex items-center px-3 py-2"
            onClick={() => {
              toast.promise(exportData(), {
                loading: messages?.analytics?.export_loading,
                success: messages?.analytics?.export_successfully,
                error: (error) => error,
              });
            }}
          />
        </>
        <LinkButton
          icon={<Settings className="h-4 w-4" />}
          variant="secondary"
          shortcut="S"
          href={`/${locale}/${slug}/settings`}
          className="items-center px-3 py-2"
        />
      </div>
    </div>
  );
}
