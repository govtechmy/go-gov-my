import { inter, poppins } from '@/styles/fonts';
import '@/styles/globals.css';
import { TooltipProvider } from '@dub/ui/src/tooltip';
import { cn, constructMetadata } from '@dub/utils';
import { Toaster } from 'sonner';

export async function generateMetadata({ params }) {
  const { locale } = params;
  return constructMetadata({ locale });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, poppins.variable)}>
      <body>
        <TooltipProvider>
          <Toaster closeButton className="pointer-events-auto" />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
