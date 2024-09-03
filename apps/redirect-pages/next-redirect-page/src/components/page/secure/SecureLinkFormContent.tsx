"use client";

import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import ButtonB from "../../ButtonB";
import Input from "../../Input";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
};

export default function SecureLinkFormContent(props: Props) {
  const t = useTranslations();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");

  async function onAuth() {
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
      router.push(url);
    }
  }

  return (
    <>
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
        type="button"
        variant="primary"
        size="large"
        align="center"
        iconEnd={<IconArrowRight />}
        className={cn("mt-[2rem]", "h-full w-full")}
        onClick={onAuth}
      >
        <span className="text-center">{t("common.continue")}</span>
      </ButtonB>
    </>
  );
}
