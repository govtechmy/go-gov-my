"use client";

import { HIDE_BACKGROUND_SEGMENTS, cn } from "@dub/utils";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { createContext } from "react";
import { useScroll } from "./hooks";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { NavLogo } from "./nav-logo";

export type NavTheme = "light" | "dark";

export const NavContext = createContext<{ theme: NavTheme }>({
  theme: "light",
});

export function Nav({ theme = "light" }: { theme?: NavTheme }) {
  const scrolled = useScroll(80);
  const selectedLayout = useSelectedLayoutSegment();

  return (
    <NavContext.Provider value={{ theme }}>
      <div
        className={cn(
          `sticky inset-x-0 top-0 z-30 w-full transition-all`,
          theme === "dark" && "dark",
        )}
      >
        <div
          className={cn(
            "-z-1 absolute inset-0 border-transparent transition-all",
            {
              "border-b border-black/10 bg-white/75 backdrop-blur-lg dark:border-white/10 dark:bg-black/75":
                scrolled,
              "border-b border-black/10 bg-white dark:border-white/10 dark:bg-black":
                selectedLayout &&
                HIDE_BACKGROUND_SEGMENTS.includes(selectedLayout),
            },
          )}
        />
        <MaxWidthWrapper className="relative">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-12">
              <Link href="/">
                <NavLogo />
              </Link>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </NavContext.Provider>
  );
}
