import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import IconRoundMagnifier from "@/icons/round-magnifier";
import { Inter, Poppins } from 'next/font/google'
import IconLinkFill from "@/icons/link-fill";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})

type Props = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function CheckLinkDialog({ children, open, onOpenChange }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showDialog = searchParams.get("dialog") === "true";
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
    router.replace(`?${params.toString()}`);
  };

  const handleCheckLink = () => {
    setIsLoading(true);
    // Simulate API call with setTimeout
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
    }, 1000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>

        <Dialog.Overlay className="fixed inset-0 z-50 bg-gray-950/30" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-[31.25rem] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-50 p-6 shadow-lg duration-200 font-inter data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {!isVerified ? (
            <>
              <div className="flex items-center gap-3">
                <IconLinkFill className="w-8 h-8 stroke-blue-500 fill-blue-500" />
                <Dialog.Title className="text-xl font-semibold leading-6 font-inter">
                  GoGov Link Checker
                </Dialog.Title>
              </div>
              

              
              <div className="mt-6">
                <input 
                  type="text" 
                  placeholder="https://go.gov/example"
                  className={cn(
                    "w-full rounded-lg border shadow-sm border-washed-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                    isLoading && "bg-gray-100 cursor-not-allowed"
                  )}
                  disabled={isLoading}
                />
              </div>
              <Dialog.Description className="mt-4 text-md text-gray-500">
                {loading && <p>Loading token...</p>}
                {error && <p>Error: {error}</p>}
                {token && <p>Token: {token}</p>}
                Check link to verify its authenticity and stay safe from scams.
              </Dialog.Description>

              <div className="mt-6 flex gap-3">
                <Dialog.Close asChild>
                  <button 
                    className="flex-1 rounded-lg px-6 py-3 text-base xl:text-lg font-regular shadow-sm hover:shadow-md text-gray-700 hover:bg-gray-50 border border-washed-300"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button 
                  onClick={handleCheckLink}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 shadow-sm hover:shadow-md rounded-lg px-6 py-3 text-base xl:text-lg font-regular text-neutral-50",
                    isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
                  ) : (
                    "Check Link"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-green-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <Dialog.Title className="text-xl font-semibold font-inter mb-2 text-left">
                Link Verified and Active!
              </Dialog.Title>
              <Dialog.Description className="font-inter text-gray-500 mb-4">
                This link is safe and currently active. You can proceed with confidence.
              </Dialog.Description>
              <span className="text-sm text-red-600 my-2">If without Logo</span>
              <div className="p-3 bg-gray-50 rounded-3xl border border-gray-200 mb-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <IconLinkFill className="w-6 h-6 stroke-blue-500 fill-blue-500" />
                  <span><a href="https://go.gov.my/verifiedlinks" target="_blank" className="text-blue-600 hover:underline">https://go.gov.my/verifiedlinks</a></span>
                </div>
              </div>
              
              <span className="text-sm text-red-600 my-2">If Link expire without Logo</span>
              <div className="p-3 bg-yellow-50 rounded-3xl border border-yellow-400 mb-6">
                <div className="flex items-center gap-2 text-yellow-700">
                  <IconLinkFill className="w-6 h-6 stroke-yellow-700 fill-yellow-700" />
                  <span><a href="https://go.gov.my/verifiedlinks" target="_blank" className="text-yellow-700 hover:underline">https://go.gov.my/verifiedlinks</a></span>
                </div>
              </div>

              <span className="text-sm text-red-600 my-2">If Link not exist</span>
              <div className="p-3 bg-red-50 rounded-3xl border border-red-400 mb-6">
                <div className="flex items-center gap-2 text-red-700">
                  <IconLinkFill className="w-6 h-6 stroke-red-700 fill-red-700" />
                  <span><a href="https://go.gov.my/verifiedlinks" target="_blank" className="text-red-700 hover:underline">https://go.gov.my/verifiedlinks</a></span>
                </div>
              </div>

              <span className="text-sm text-red-600 my-2">If with Logo</span>
              <div className="p-3 bg-white rounded-full border border-gray-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" 
                      alt="Ministry Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Ministry of Digital</span>
                    
                    <a 
                      href="https://go.gov.my/verifiedlinks" 
                      target="_blank" 
                      className="text-blue-600 text-sm hover:underline "
                    >
                      https://go.gov.my/verifiedlinks
                    </a>
                  </div>
                </div>
              </div>

                 <span className="text-sm text-red-600 my-2">If link expire with Logo</span>
                            <div className="p-3 bg-yellow-50 rounded-full border border-yellow-400 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md overflow-hidden">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" 
                      alt="Ministry Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-yellow-700">Ministry of Digital</span>
                    
                    <a 
                      href="https://go.gov.my/verifiedlinks" 
                      target="_blank" 
                      className="text-yellow-700 text-sm hover:underline "
                    >
                      https://go.gov.my/verifiedlinks
                    </a>
                  </div>
                </div>
              </div>
          
              <div className="flex gap-3">
                <Dialog.Close asChild>
                  <button 
                    // onClick={() => setIsVerified(false)}
                    className="flex-1 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-gray-700 hover:bg-gray-50 border border-washed-300"
                  >
                    Done
                  </button>
                </Dialog.Close>
                    <button 
                    // onClick={() => setIsVerified(false)}
                    className="flex items-center gap-2 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md text-red-700 hover:bg-red-50 border border-red-300"
                  >
                    <AlertTriangle className="w-6 h-6" />
                    Report
                  </button>
                <a 
                  href="https://go.gov.my/verifiedlinks"
                  target="_blank"
                  className="flex-1 text-center text-neutral-50 rounded-lg px-6 py-3 text-base font-regular shadow-sm hover:shadow-md hover:bg-blue-700 bg-blue-600 border border-washed-300"
                >
                  Visit Link
                </a>
              </div>
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