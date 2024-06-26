import { useIntlHook } from "@/lib/middleware/utils/useI18n";
import SettingsLayout from "@/ui/layout/settings-layout";
import { ReactNode } from "react";

export default function WorkspaceSettingsLayout({
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
      name: messages?.people?.people,
      segment: "people",
    },
  ];

  return <SettingsLayout tabs={tabs}>{children}</SettingsLayout>;
}
