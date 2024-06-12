import { inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import { TooltipProvider } from "@dub/ui/src/tooltip";
import { cn, constructMetadata } from "@dub/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(satoshi.variable, inter.variable)}>
      <body>
        <TooltipProvider>
          <Toaster closeButton className="pointer-events-auto" />
          {children}
          <SpeedInsights />
        </TooltipProvider>
      </body>
    </html>
  );
}
