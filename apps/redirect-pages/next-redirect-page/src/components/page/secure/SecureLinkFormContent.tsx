"use client";

import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ButtonB from "../../ButtonB";
import Input from "../../Input";

export default function SecureLinkFormContent() {
  const t = useTranslations();
  const [password, setPassword] = useState("");

  return (
    <>
      <Input
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder={t("common.placeholders.password")}
        className={cn("shrink-0")}
      />
      <ButtonB
        disabled={!password}
        type="submit"
        variant="primary"
        size="large"
        align="center"
        iconEnd={<IconArrowRight />}
        className={cn("mt-[2rem]", "h-full w-full")}
      >
        <span className="text-center">{t("common.continue")}</span>
      </ButtonB>
    </>
  );
}
