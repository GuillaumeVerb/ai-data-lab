"use client";

import { Container, LocaleLink } from "@/components/ui";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname() ?? `/${defaultLocale}`;
  const maybeLocale = pathname.split("/")[1];
  const locale = isLocale(maybeLocale) ? maybeLocale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <Container className="py-24">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">404</p>
      <h1 className="mt-4 font-display text-4xl">{dict.notFound.title}</h1>
      <p className="mt-4 max-w-lg text-mute">{dict.notFound.body}</p>
      <LocaleLink
        locale={locale}
        href="/"
        className="mt-8 inline-block text-sm text-lab hover:text-ink"
      >
        {dict.notFound.home}
      </LocaleLink>
    </Container>
  );
}
