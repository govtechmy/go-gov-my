import { Dropdown, type Item as StatDropdownItem } from "@/components/Dropdown";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function StatDropdown(props: { className?: string }) {
  const t = useTranslations();
  const items = [
    {
      id: "daily",
      label: t("pages.Home.Stats.dropdown.items.daily.label"),
    },
    {
      id: "weekly",
      label: t("pages.Home.Stats.dropdown.items.weekly.label"),
    },
    {
      id: "monthly",
      label: t("pages.Home.Stats.dropdown.items.monthly.label"),
    },
    // {
    //   id: "yearly",
    //   label: t("pages.Home.Stats.dropdown.items.yearly.label"),
    // },
  ];

  const [item, setItem] = useState<StatDropdownItem | null>(
    (items.length > 0 && items[0]) || null,
  );

  return (
    <Dropdown
      className={cn(props.className)}
      items={items}
      onSelection={setItem}
    >
      {item?.label}
    </Dropdown>
  );
}
