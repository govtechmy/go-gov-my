import { Background } from "@dub/ui";
import { ReactNode } from "react";
import Providers from "./providers";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <Background />
      <div className="relative z-10 flex h-screen w-screen justify-center">
        <Providers>{children}</Providers>
      </div>
    </>
  );
}
