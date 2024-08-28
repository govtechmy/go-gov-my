"use client";

import { GOAPP_PARAM_AUTH_URL } from "@/constants/goapp";
import { cn } from "@/lib/utils";
import ButtonB from "../../ButtonB";
import Input from "../../Input";
import IconArrowRight from "@/icons/arrow-right";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function SecureLinkForm() {
  const t = useTranslations();
  const [password, setPassword] = useState("");

  return (
    <form
      method="GET"
      action={"/" + GOAPP_PARAM_AUTH_URL}
      className={cn(
        "mt-[2.25rem] md:mt-[2.5rem]",
        "flex flex-col items-center",
        "h-[2.5rem] w-[20.25rem] md:w-[25rem]",
        "px-[1.125rem] lg:px-0",
      )}
    >
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
    </form>
  );
}
