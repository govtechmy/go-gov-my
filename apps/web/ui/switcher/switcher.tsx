"use client";
import { usePathname, useRouter } from "next/navigation";
import {CustomSelect} from "@dub/ui";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

export default function LocaleSwitcher() {
  // get current route
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useIntlClientHook();
  const pathWithoutLocale = "/" + pathname.split("/").splice(2).join("/");
  const options=[
    {
      label: "Malay",
      value: "ms",
    },
    {
      label: "English",
      value: "en",
    },
  ]

  const handleChangeSelect=(option: { label: string, value: string })=>{
    router.push(`/${option.value}${pathWithoutLocale}`)
  }

  return (
    <div className="text-white">
      <CustomSelect
        options={options}
        onChange={async (e) => handleChangeSelect(e)}
        defaultValue={options.findIndex((value)=>value.value == locale)}
      />
    </div>
  );
}
