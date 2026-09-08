import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function LocaleLink({
  locale,
  href,
  className,
  children,
}: {
  locale: Locale;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={localizedPath(locale, href)} className={className}>
      {children}
    </Link>
  );
}

export function SectionHeading({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className="mb-6 flex items-baseline gap-3 border-b border-line pb-3">
      <span className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase">
        {index}
      </span>
      <h2 className="text-sm font-medium tracking-[0.14em] text-mute uppercase">
        {label}
      </h2>
    </div>
  );
}

export function PageIntro({
  title,
  lead,
}: {
  title: string;
  lead: string;
}) {
  return (
    <header className="mb-12 max-w-2xl">
      <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-mute">{lead}</p>
    </header>
  );
}
