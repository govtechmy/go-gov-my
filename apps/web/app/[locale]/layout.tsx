import { inter, satoshi } from "@/styles/fonts";
import "@/styles/globals.css";
import Header from "@/ui/header/header";
import { TooltipProvider } from "@dub/ui/src/tooltip";
import { cn, constructMetadata } from "@dub/utils";
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
        <Header />
        <TooltipProvider>
          <Toaster closeButton className="pointer-events-auto" />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
