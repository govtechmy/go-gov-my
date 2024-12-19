"use client";

import { buttonVariants } from "@/components/Button";
import Locale from "@/components/Locale";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetPortal,
} from "@/components/Sheet";
import Image from "next/image";
import { URL_APP_LOGIN } from "@/constants/urls";
import { Link, usePathname } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { ReactNode, Suspense, useState } from "react";
import ButtonB from "./ButtonB";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  href: string;
  component: ReactNode;
  target?: string;
  sheetOnly?: boolean;
  variant: VariantProps<typeof buttonVariants>["variant"];
  signInKey: string;
};

export function Header(props: { signInKey: string }) {
  const t = useTranslations();
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href) && href !== "/";
  const navItems: NavItem[] = [
    // TODO: Put your nav items here
  ];

  const [showMenu, setMenu] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 bg-background lg:border-b lg:bg-background/80 lg:backdrop-blur-[30px]">
      <div className="container flex w-full items-center justify-between gap-3 bg-background py-3 max-lg:border-b lg:gap-4 lg:bg-transparent xl:px-0">
        <a href="#" className="flex h-full flex-none items-center">
          <Image
            width={32}
            height={32}
            src="/logo.svg"
            alt="Logo"
            className={cn("object-contain")}
          />
          <h1 className="ml-[0.625rem] text-[1.125rem] font-semibold leading-[1.625rem]">
            {t("app.name")}
          </h1>
        </a>

        <Sheet open={showMenu} onOpenChange={setMenu}>
          <SheetContent
            side="top"
            className="absolute top-full -z-10 flex flex-col gap-0 rounded-b-xl p-3 lg:hidden"
          >
            {navItems.map(({ component, href, target, variant }, i) => (
              <SheetClose asChild key={i}>
                <Link
                  href={href}
                  target={target || "self"}
                  data-state={isActive(href) ? "open" : "close"}
                  className={cn(
                    buttonVariants({
                      variant,
                      size: "md",
                    }),
                    "w-full justify-start gap-x-[0.5rem] text-[1rem] leading-[1.5rem] lg:data-[state=open]:bg-washed-100",
                  )}
                >
                  {component}
                </Link>
              </SheetClose>
            ))}
          </SheetContent>
          <SheetPortal>
            <SheetOverlay className="z-40" />
          </SheetPortal>
        </Sheet>

        <NavigationMenu.Root className="z-10 hidden w-full items-center lg:flex">
          <NavigationMenu.List className="group flex list-none items-center justify-center space-x-1">
            {navItems
              .filter((item) => !item.sheetOnly)
              .map(({ component, href }, i) => (
                <NavigationMenu.Item key={i}>
                  <Link
                    href={href}
                    data-state={isActive(href) ? "open" : "close"}
                    className={cn(
                      buttonVariants({ variant: "tertiary" }),
                      "w-max bg-transparent transition-colors data-[state=open]:bg-washed-100",
                    )}
                  >
                    {component}
                  </Link>
                </NavigationMenu.Item>
              ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>

        <div className="flex shrink-0 items-center gap-2">
          <Suspense>
              {/* <ThemeToggle /> */}
            <Locale />
          </Suspense>
          <ButtonB variant="primary" size="small" href={process.env.NEXT_PUBLIC_APP_DOMAIN}>
            {props.signInKey}
          </ButtonB>
        </div>
      </div>
    </header>
  );
}
