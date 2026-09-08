"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname() || `/${locale}`;

  return (
    <nav aria-label={label} className="flex items-center gap-1 font-mono text-xs">
      {locales.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={switchLocalePath(pathname, item)}
            hrefLang={item}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "px-1.5 py-0.5 text-ink"
                : "px-1.5 py-0.5 text-mute transition-colors hover:text-ink"
            }
          >
            {item.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
