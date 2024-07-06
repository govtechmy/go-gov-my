"use client";

import { cn } from "@dub/utils";
import * as Popover from "@radix-ui/react-popover";
import { BoxSelect, Home, LayoutGrid, Type } from "lucide-react";
import { useParams } from "next/navigation";
import { MouseEvent, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { Button, ButtonProps } from "./button";
import { Logo } from "./logo";
import { NavContext } from "./nav";
import { Wordmark } from "./wordmark";

// Copied from apps/web/public/_static/logo.svg
const logoSvg = `
<svg width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" width="28" height="28" rx="8.75" fill="url(#paint0_radial_57_14546)"/>
<path d="M7.96507 14.0968L14.19 7.87188C12.432 7.48627 10.5203 7.97702 9.15323 9.34413L6.18282 12.3145C4.05015 14.4472 4.05015 17.905 6.18282 20.0376C8.31548 22.1703 11.7732 22.1703 13.9059 20.0376L16.8763 17.0672C18.7023 15.2412 18.9649 12.4439 17.6641 10.3386L15.7851 12.2176C16.1539 13.2538 15.9235 14.4555 15.0941 15.285L12.1236 18.2554C12.0272 18.3518 11.9258 18.4401 11.8201 18.5204C10.6676 19.3956 9.01699 19.3073 7.96506 18.2554C6.8167 17.107 6.8167 15.2452 7.96507 14.0968Z" fill="white"/>
<path d="M16.8763 9.93821L13.9059 12.9086C13.0764 13.7381 12.8461 14.9398 13.2149 15.976L11.5296 17.6613C11.4649 17.7259 11.3971 17.7855 11.3266 17.84C10.0363 15.7364 10.302 12.948 12.1236 11.1264L15.0941 8.15596C17.2267 6.02329 20.6845 6.02329 22.8171 8.15596C24.9498 10.2886 24.9498 13.7464 22.8171 15.879L19.8467 18.8495C18.4796 20.2166 16.568 20.7073 14.81 20.3217L21.0349 14.0968C22.1833 12.9484 22.1833 11.0866 21.0349 9.93821C19.8865 8.78985 18.0247 8.78985 16.8763 9.93821Z" fill="white"/>
<defs>
<radialGradient id="paint0_radial_57_14546" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(23.8333 2.91667) rotate(122.196) scale(18.6119 19.4257)">
<stop stopColor="#53DDAB"/>
<stop offset="1" stopColor="#2563EB"/>
</radialGradient>
</defs>
</svg>
`;

// Copied from apps/web/public/_static/wordmark.svg
const wordmarkSvg = `
<svg width="46" height="24" viewBox="0 0 46 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M11 2H14V13.9332L14.0003 13.9731L14.0003 14C14.0003 14.0223 14.0002 14.0445 14 14.0668V21H11V19.7455C9.86619 20.5362 8.48733 21 7.00016 21C3.13408 21 0 17.866 0 14C0 10.134 3.13408 7 7.00016 7C8.48733 7 9.86619 7.46375 11 8.25452V2ZM7 17.9998C9.20914 17.9998 11 16.209 11 13.9999C11 11.7908 9.20914 10 7 10C4.79086 10 3 11.7908 3 13.9999C3 16.209 4.79086 17.9998 7 17.9998ZM32 2H35V8.25474C36.1339 7.46383 37.5128 7 39.0002 7C42.8662 7 46.0003 10.134 46.0003 14C46.0003 17.866 42.8662 21 39.0002 21C35.1341 21 32 17.866 32 14V2ZM39 17.9998C41.2091 17.9998 43 16.209 43 13.9999C43 11.7908 41.2091 10 39 10C36.7909 10 35 11.7908 35 13.9999C35 16.209 36.7909 17.9998 39 17.9998ZM19 7H16V14C16 14.9192 16.1811 15.8295 16.5329 16.6788C16.8846 17.5281 17.4003 18.2997 18.0503 18.9497C18.7003 19.5997 19.472 20.1154 20.3213 20.4671C21.1706 20.8189 22.0809 21 23.0002 21C23.9194 21 24.8297 20.8189 25.679 20.4671C26.5283 20.1154 27.3 19.5997 27.95 18.9497C28.6 18.2997 29.1157 17.5281 29.4675 16.6788C29.8192 15.8295 30.0003 14.9192 30.0003 14H30V7H27V14C27 15.0608 26.5785 16.0782 25.8284 16.8283C25.0783 17.5784 24.0609 17.9998 23 17.9998C21.9391 17.9998 20.9217 17.5784 20.1716 16.8283C19.4215 16.0782 19 15.0608 19 14V7Z" fill="black"/>
</svg>
`;

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  } catch (e) {
    console.error("Failed to copy to clipboard.", e);
    toast.error("Failed to copy to clipboard.");
  }
}

/**
 * The Dub logo with a custom context menu for copying/navigation,
 * for use in the top site nav
 */
export function NavLogo({
  variant = "full",
  isInApp,
  className,
}: {
  variant?: "full" | "symbol";
  isInApp?: boolean;
  className?: string;
}) {
  const { domain = "dub.co" } = useParams() as { domain: string };

  const { theme } = useContext(NavContext);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleContextMenu = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPopoverOpen(true);
  }, []);

  return (
    <Popover.Root open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <Popover.Anchor asChild>
        <div onContextMenu={handleContextMenu} className="max-w-fit">
          {variant === "full" ? (
            <Wordmark className={className} />
          ) : (
            <Logo
              className={cn(
                "h-8 w-8 transition-all duration-75 active:scale-95",
                className,
              )}
            />
          )}
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          sideOffset={14}
          align="start"
          className={cn(
            "z-50 -mt-1.5 -translate-x-10",
            theme === "dark" && "dark",
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsPopoverOpen(false);
          }}
        >
          <div className="grid gap-1 rounded-lg border border-gray-200 bg-white p-2 drop-shadow-sm dark:border-white/[0.15] dark:bg-black sm:min-w-[240px]">
            <ContextMenuButton
              text="Copy Logo as SVG"
              variant="outline"
              onClick={() => copy(logoSvg)}
              icon={<Logo className="h-4 w-4" />}
            />
            <ContextMenuButton
              text="Copy Wordmark as SVG"
              variant="outline"
              onClick={() => copy(wordmarkSvg)}
              icon={<Type strokeWidth={2} className="h-4 w-4" />}
            />
            <ContextMenuButton
              text="Brand Guidelines"
              variant="outline"
              onClick={() => window.open("https://dub.co/brand", "_blank")}
              icon={<BoxSelect strokeWidth={2} className="h-4 w-4" />}
            />
            {/* If it's in the app or it's a domain placeholder page (not dub.co homepage), show the home button */}
            {isInApp || domain != "dub.co" ? (
              <ContextMenuButton
                text="Home Page"
                variant="outline"
                onClick={() => window.open("https://dub.co", "_blank")}
                icon={<Home strokeWidth={2} className="h-4 w-4" />}
              />
            ) : (
              <ContextMenuButton
                text="Dashboard"
                variant="outline"
                onClick={() => window.open("https://app.dub.co", "_blank")}
                icon={<LayoutGrid strokeWidth={2} className="h-4 w-4" />}
              />
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ContextMenuButton({ className, ...rest }: ButtonProps) {
  return (
    <Button
      className={cn(
        "h-9 justify-start px-3 font-medium hover:text-gray-700 dark:text-white/70 dark:hover:bg-white/[0.15] dark:hover:text-white",
        className,
      )}
      {...rest}
    />
  );
}
