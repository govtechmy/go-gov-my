"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  countInSeconds: number;
};

export default function Redirect(props: Props) {
  const t = useTranslations();
  const [count, setCount] = useState(props.countInSeconds);
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (count === 0) {
        router.push(props.url);
        return;
      }

      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [count, props.url, router]);

  return <span>{t("common.seconds", { count })}</span>;
}
