'use client'
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
    // get current route
    const pathname = usePathname();
    const router = useRouter()
    const pathWithoutLocale = "/" + pathname.split("/").splice(2).join("/")

    return (
      <div className="text-white">
        <span 
            onClick={()=>router.push(`/bm${pathWithoutLocale}`)}
            className="cursor-pointer border-r-2 border-slate-500 px-2 bg-red-500 rounded-l"
        >
            BM
        </span>
        <span
            onClick={()=>router.push(`/en${pathWithoutLocale}`)}
            className="cursor-pointer px-2 bg-lime-400 rounded-r"
        >
            EN
        </span>
      </div>
    );
}