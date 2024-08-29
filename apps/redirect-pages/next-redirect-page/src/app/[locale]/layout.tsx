import Masthead from "@/components/Masthead";
import { cn } from "@/lib/utils";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateStaticParams() {
  return [{ locale: "en-MY" }, { locale: "ms-MY" }];
}

export default async function Layout({ children, params: { locale } }: Props) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(
          inter.className,
          poppins.variable,
          "flex min-w-[320px] flex-col",
        )}
      >
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider messages={messages}>
            <div className="flex h-[100vh] flex-col">
              <Masthead />
              {/* <Header locale={locale} /> */}
              <div className="flex-1">{children}</div>
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
