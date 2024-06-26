import { useIntlHook } from "@/lib/middleware/utils/useI18n";
import SettingsLayout from "@/ui/layout/settings-layout";
import { ReactNode } from "react";

export default function PersonalSettingsLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { messages } = useIntlHook(locale);
  const tabs = [
    {
      name: messages?.tokens?.general,
      segment: null,
    },
    {
      name: messages?.tokens?.api_key,
      segment: "tokens",
    },
  ];

  return (
    <SettingsLayout tabs={tabs} locale={locale}>
      {children}
    </SettingsLayout>
  );
}
