import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { localeHtmlLang } from "@/lib/i18n";
import { parseLocale, localeStaticParams } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";
import "../globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return localeStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale: parseLocale(locale) });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);

  return (
    <html
      lang={localeHtmlLang(locale)}
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
