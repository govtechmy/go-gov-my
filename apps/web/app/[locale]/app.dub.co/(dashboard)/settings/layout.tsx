import SettingsLayout from "@/ui/layout/settings-layout";
import { ReactNode } from "react";
import { useIntlHook } from "@/lib/middleware/utils/useI18n";

export default function PersonalSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { messages } = useIntlHook();
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

  return <SettingsLayout tabs={tabs}>{children}</SettingsLayout>;
}
