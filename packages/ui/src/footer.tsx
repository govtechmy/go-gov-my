"use client";

import { APP_NAME, cn, fetcher } from "@dub/utils";
import va from "@vercel/analytics";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { FEATURES_LIST } from "./content";
import { MaxWidthWrapper } from "./max-width-wrapper";

const navigation = {
  features: FEATURES_LIST.map(({ shortTitle, slug }) => ({
    name: shortTitle,
    href: `/${slug}`,
  })),
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Abuse", href: "/abuse" },
  ],
};

export function Footer() {
  const { domain = "dub.co" } = useParams() as { domain: string };

  const createHref = (href: string) =>
    domain === "dub.co" ? href : `https://dub.co${href}`;

  return (
    <footer>
      <MaxWidthWrapper className="relative z-10 overflow-hidden border border-b-0 border-gray-200 bg-white/50 px-8 py-16 backdrop-blur-lg md:rounded-t-2xl">
        <div className="xl:flex xl:justify-between">
          <div className="space-y-6">
            <Link
              href={createHref("/")}
              {...(domain !== "dub.co" && {
                onClick: () => {
                  va.track("Referred from custom domain", {
                    domain,
                    medium: "footer item (logo)",
                  });
                },
              })}
              className="block max-w-fit"
            >
              <span className="sr-only">
                {process.env.NEXT_PUBLIC_APP_NAME} Logo
              </span>
              {/* For GoGovMy, footer must use Jata Negara */}
              <Image
                src="/_static/jata_logo.png"
                alt="Jata Negara"
                width={128}
                height={96}
              />
            </Link>
            <p className="max-w-xs text-sm text-gray-500">
              {APP_NAME} – Malaysia's open-source link management
              infrastructure.
            </p>
            {/* <p className="text-sm leading-5 text-gray-400">
              © {new Date().getFullYear()} Dub Technologies, Inc.
            </p> */}
            <StatusBadge />
          </div>
          <div className="mt-16 grid grid-cols-2 gap-12 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Features</h3>
              <ul role="list" className="mt-4 space-y-4">
                {navigation.features.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={createHref(item.href)}
                      {...(domain !== "dub.co" && {
                        onClick: () => {
                          va.track("Referred from custom domain", {
                            domain,
                            medium: `footer item (${item.name})`,
                          });
                        },
                      })}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Legal</h3>
              <ul role="list" className="mt-4 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={createHref(item.href)}
                      {...(domain !== "dub.co" && {
                        onClick: () => {
                          va.track("Referred from custom domain", {
                            domain,
                            medium: `footer item (${item.name})`,
                          });
                        },
                      })}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
}

function StatusBadge() {
  const { data } = useSWR<{
    ongoing_incidents: {
      name: string;
      current_worst_impact:
        | "degraded_performance"
        | "partial_outage"
        | "full_outage";
    }[];
  }>("https://status.dub.co/api/v1/summary", fetcher);

  const [color, setColor] = useState("bg-gray-200");
  const [status, setStatus] = useState("Loading status...");

  useEffect(() => {
    if (!data) return;
    const { ongoing_incidents } = data;
    if (ongoing_incidents.length > 0) {
      const { current_worst_impact, name } = ongoing_incidents[0];
      const color =
        current_worst_impact === "degraded_performance"
          ? "bg-yellow-500"
          : "bg-red-500";
      setStatus(name);
      setColor(color);
    } else {
      setStatus("All systems operational");
      setColor("bg-green-500");
    }
  }, [data]);

  return (
    <Link
      href="https://status.dub.co"
      target="_blank"
      className="group flex max-w-fit items-center space-x-2 rounded-md border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-100"
    >
      <div className="relative h-3 w-3">
        <div
          className={cn(
            "absolute inset-0 m-auto h-3 w-3 animate-ping items-center justify-center rounded-full group-hover:animate-none",
            color,
            status === "Loading status..." && "animate-none",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 z-10 m-auto h-3 w-3 rounded-full",
            color,
          )}
        />
      </div>
      <p className="text-sm font-medium text-gray-800">{status}</p>
    </Link>
  );
}
