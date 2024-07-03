"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  // get current route
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLocale = "/" + pathname.split("/").splice(2).join("/");

  return (
    <div className="text-white">
      <span
        onClick={() => router.push(`/ms${pathWithoutLocale}`)}
        className="cursor-pointer rounded-l border-r-2 border-slate-500 bg-red-500 px-2"
      >
        BM
      </span>
      <span
        onClick={() => router.push(`/en${pathWithoutLocale}`)}
        className="cursor-pointer rounded-r bg-lime-400 px-2"
      >
        EN
      </span>
    </div>
  );
}
