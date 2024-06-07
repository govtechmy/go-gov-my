import SettingsLayout from "@/ui/layout/settings-layout";
import { ReactNode } from "react";

export default function WorkspaceSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tabs = [
    {
      name: "General",
      segment: null,
    },
    {
      name: "People",
      segment: "people",
    },
  ];

  return <SettingsLayout tabs={tabs}>{children}</SettingsLayout>;
}
