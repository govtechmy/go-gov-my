import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, X } from "lucide-react";
import IconLinkFill from "@/icons/link-fill";

type Props = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mainDialog: {
    title: string;
    description: string;
    cancelBtn: string;
    checkLinkBtn: string;
  };
  successDialog: {
    title: string;
    description: string;
    doneBtn: string;
    visitLinkBtn: string;
  };
  expiredDialog: {
    title: string;
    description: string;
    doneBtn: string;
  };
  notFoundDialog: {
    title: string;
    description: string;
    doneBtn: string;
    reportBtn: string;
    failedMsg: string;
  };
  reportDialog: {
    title: string;
    description: string;
    doneBtn: string;
  };
};

export default function CheckLinkDialog({ 
  children, 
  open, 
  onOpenChange,
  mainDialog,
  successDialog,
  expiredDialog,
  notFoundDialog,
  reportDialog
}: Props) {
  const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;
  const searchParams = useSearchParams();
  const router = useRouter();
  const showDialog = searchParams.get("dialog") === "true";
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [linkData, setLinkData] = useState<{
    isValid: boolean;
    isExpired: boolean;
    agency?: {
      code: string;
      names: {
        ms: string;
        en: string;
      };
      logo: string | null;
    } | null;
    validUntil: string | null;
    redirectUrl: string | null;
    shortUrl: string | null;
  } | null>(null);
  const [isReportSuccess, setIsReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

   useEffect(() => {
    const fetchToken = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch token: ${errorData}`);
        }
        
        const data = await response.json();
        setToken(data.token || '');
      } catch (error) {
        console.error('Error fetching token:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (showDialog && onOpenChange) {
      onOpenChange(true);
    }
  }, [showDialog, onOpenChange]);

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
    
    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set("dialog", "true");
    } else {
      params.delete("dialog");
      setUrl('');
      setIsVerified(false);
      setError(null);
      setReportError(null);
    }
    router.replace(`?${params.toString()}`);
  };

  const handleCheckLink = async () => {
    setIsLoading(true);
    try {
      if (!url) {
        throw new Error('Please enter a URL');
      }

      const tokenResponse = await fetch('/api/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get token');
      }

      const { token } = await tokenResponse.json();

      const checkLinkResponse = await fetch('/api/check-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          token
        })
      });

      if (!checkLinkResponse.ok) {
        throw new Error('Failed to check link');
      }

      const linkData = await checkLinkResponse.json();
      
      setLinkData(linkData);
      setIsVerified(true);

    } catch (error) {
      console.error('Error checking link:', error);
      setError(error instanceof Error ? error.message : 'Failed to check link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async () => {
    setIsLoading(true);
    setReportError(null);
    try {
      const response = await fetch('/api/report-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to report link');
      }

      const data = await response.json();
      if (data.status) {
        setIsReportSuccess(true);
      } else {
        throw new Error('Report submission failed');
      }
    } catch (error) {
      setReportError('Report failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-950/30" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[31.25rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-50 p-6 shadow-lg duration-200 font-inter data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {isReportSuccess ? (
            <>
              <div className="flex mb-4 justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-green-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <Dialog.Title className="text-xl font-semibold font-inter mb-2 text-center">
                {reportDialog.title}
              </Dialog.Title>
              <Dialog.Description className="font-inter text-gray-700 mb-4 text-center">
                {reportDialog.description}
              </Dialog.Description>
              <div className="flex justify-center">
                <Dialog.Close asChild>
                  <button 
                    onClick={() => {
                      setIsVerified(false);
                      setIsReportSuccess(false);
                    }}
                    className="flex-1 max-w-[200px] rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-neutral-50 bg-blue-600 hover:bg-blue-700"
                  >
                    {reportDialog.doneBtn}
                  </button>
                </Dialog.Close>
              </div>
            </>
          ) : !isVerified ? (
            <>
              <div className="flex items-center gap-3">
                <IconLinkFill className="w-8 h-8 stroke-blue-500 fill-blue-500" />
                <Dialog.Title className="text-xl font-semibold leading-6 font-inter">
                  GoGovMY {mainDialog.title}
                </Dialog.Title>
              </div>
              
              <div className="mt-6">
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={`${APP_DOMAIN ? APP_DOMAIN : 'https://go.gov.my'}/example`}
                  className={cn(
                    "w-full rounded-lg border shadow-sm border-washed-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    isLoading && "bg-gray-100 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && url.trim()) {
                      handleCheckLink();
                    }
                  }}
                />
              </div>
              <Dialog.Description className="mt-4 text-md text-gray-500">
                {mainDialog.description}
              </Dialog.Description>

              <div className="mt-6 flex gap-3">
                <Dialog.Close asChild>
                  <button 
                    className="flex-1 rounded-lg px-6 py-3 text-base xl:text-base font-regular shadow-sm hover:shadow-md text-gray-700 hover:bg-gray-50 border border-washed-300"
                    disabled={isLoading}
                  >
                    {mainDialog.cancelBtn}
                  </button>
                </Dialog.Close>
                <button 
                  onClick={handleCheckLink}
                  disabled={isLoading || !url.trim()}
                  className={cn(
                    "flex-1 shadow-sm hover:shadow-md rounded-lg px-6 py-3 text-base xl:text-base font-regular text-neutral-50",
                    isLoading || !url.trim() ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          fill="none"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Checking...
                    </span>
                  ) : mainDialog.checkLinkBtn}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex mb-4">
                {linkData?.isValid && !linkData.isExpired ? (
                  <div className="w-12 h-12 rounded-full border-4 border-green-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : linkData?.isValid && linkData.isExpired ? (
                  <AlertCircle className="w-10 h-10 text-yellow-700" />
                ) : (
                   <AlertTriangle className="w-10 h-10 text-red-700" />
                )}
              </div>

              <Dialog.Title className="text-xl font-semibold font-inter mb-2 text-left">
                {!linkData?.isValid ? notFoundDialog.title :
                 linkData?.isExpired ? expiredDialog.title :
                 successDialog.title}
              </Dialog.Title>

              <Dialog.Description className="font-inter text-gray-700 mb-4">
                {!linkData?.isValid ? notFoundDialog.description :
                 linkData?.isExpired ? expiredDialog.description :
                 successDialog.description}
              </Dialog.Description>

              {linkData?.isValid && !linkData.isExpired && !linkData.agency?.logo && (
                <div className="p-3 bg-gray-50 rounded-3xl border border-gray-200 mb-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <IconLinkFill className="w-6 h-6 stroke-blue-500 fill-blue-500" />
                    <span><a href={linkData.shortUrl || "#"} target="_blank" className="text-blue-600 hover:underline">{url}</a></span>
                  </div>
                </div>
              )}

              {linkData?.isValid && !linkData.isExpired && linkData.agency?.logo && (
                <div className="p-3 bg-white rounded-full border border-gray-200 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md overflow-hidden">
                      <img src={linkData.agency.logo} alt="Agency Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">{linkData.agency.names.en}</span>
                      <a href={linkData.shortUrl || "#"} target="_blank" className="text-blue-600 text-sm hover:underline">{url}</a>
                    </div>
                  </div>
                </div>
              )}

              {!linkData?.isValid && (
                <div className="p-3 bg-red-50 rounded-3xl border border-red-400 mb-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <IconLinkFill className="w-6 h-6 stroke-red-700 fill-red-700" />
                    <span>{url}</span>
                  </div>
                </div>
              )}

              {linkData?.isValid && linkData.isExpired && !linkData.agency?.logo && (
                <div className="p-3 bg-yellow-50 rounded-3xl border border-yellow-400 mb-6">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <IconLinkFill className="w-6 h-6 stroke-yellow-700 fill-yellow-700" />
                    <span>{url}</span>
                  </div>
                </div>
              )}

              {linkData?.isValid && linkData.isExpired && linkData.agency?.logo && (
                <div className="p-3 bg-yellow-50 rounded-full border border-yellow-400 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md overflow-hidden">
                      <img src={linkData.agency.logo} alt="Agency Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-yellow-700">{linkData.agency.names.en}</span>
                      <span className="text-yellow-700 text-sm">{url}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!linkData?.isValid ? (
                  <>
                    <button 
                      onClick={handleReport}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-red-700 hover:bg-red-50 border border-red-300"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                              fill="none"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Reporting...
                        </span>
                      ) : (
                        <>
                          <AlertTriangle className="w-6 h-6" />
                          {notFoundDialog.reportBtn}
                        </>
                      )}
                    </button>
                    <Dialog.Close asChild>
                      <button 
                        onClick={() => setIsVerified(false)}
                        className="flex-1 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-neutral-50 bg-blue-600 hover:bg-blue-700"
                      >
                        {notFoundDialog.doneBtn}
                      </button>
                    </Dialog.Close>
                  </>
                ) : linkData.isExpired ? (
                  <Dialog.Close asChild>
                    <button 
                      onClick={() => setIsVerified(false)}
                      className="flex-1 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-neutral-50 bg-blue-600 hover:bg-blue-700"
                    >
                      {expiredDialog.doneBtn}
                    </button>
                  </Dialog.Close>
                ) : (
                  <>
                    <Dialog.Close asChild>
                      <button 
                        onClick={() => setIsVerified(false)}
                        className="flex-1 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-gray-700 hover:bg-gray-50 border border-washed-300"
                      >
                        {successDialog.doneBtn}
                      </button>
                    </Dialog.Close>
                    <a 
                      href={linkData.shortUrl || `${process.env.NEXT_PUBLIC_APP_DOMAIN}`}
                      target="_blank"
                      className="flex-1 text-center text-neutral-50 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md hover:bg-blue-700 bg-blue-600"
                    >
                      {successDialog.visitLinkBtn}
                    </a>
                  </>
                )}
              </div>
              {reportError && (
                <p className="text-red-600 text-sm mt-3 text-center">{notFoundDialog.failedMsg}</p>
              )}
            </>
          )}
          
          <Dialog.Close className="absolute shadow-sm hover:shadow-md border rounded-md hover:bg-washed-100 border-washed-300 px-2 py-2 right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 