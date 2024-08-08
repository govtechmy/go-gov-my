"use client";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { CustomSelect } from "@dub/ui";
import { LanguagesIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  // get current route
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useIntlClientHook();
  const pathWithoutLocale = "/" + pathname.split("/").splice(2).join("/");
  const options = [
    {
      label: "Malay",
      value: "ms",
    },
    {
      label: "English",
      value: "en",
    },
  ];

  const handleChangeSelect = (option: { label: string; value: string }) => {
    router.push(`/${option.value}${pathWithoutLocale}`);
  };

  return (
    <div>
      <CustomSelect
        icon={<LanguagesIcon className="h-4 w-4" />}
        options={options}
        onChange={async (e) => handleChangeSelect(e)}
        defaultValue={options.findIndex((value) => value.value == locale)}
      />
    </div>
  );
}
