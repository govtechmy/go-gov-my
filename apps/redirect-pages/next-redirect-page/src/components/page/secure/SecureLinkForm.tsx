"use client";

import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import ButtonB from "../../ButtonB";
import Input from "../../Input";

type Props = {
  slug: string;
  onAuthenticated: (url: string) => void;
};

export default function SecureLinkFormContent(props: Props) {
  const t = useTranslations();
  const ref = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  async function authenticate() {
    if (!ref.current) {
      throw new Error("Mis-configured slug");
    }

    const response = await fetch("/auth", {
      method: "POST",
      body: JSON.stringify({
        ["Password"]: password,
        ["Slug"]: ref.current.value,
      }),
    });

    if (!response.ok) {
      setPassword("");
      return;
    }

    const data = await response.json();
    const { ["URL"]: url } = data;

    if (url) {
      props.onAuthenticated(url);
    }
  }

  return (
    <form
      className={cn(
        "mt-[2.25rem] md:mt-[2.5rem]",
        "flex flex-col items-center",
        "h-[2.5rem] w-[20.25rem] md:w-[25rem]",
        "px-[1.125rem] lg:px-0",
      )}
      onSubmit={(e) => {
        e.preventDefault();
        authenticate();
      }}
    >
      <input ref={ref} type="hidden" value={props.slug} />
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
