import { LocaleLink } from "@/components/ui";
import { type Locale } from "@/lib/i18n";

export function ContentCard({
  locale,
  href,
  kicker,
  title,
  summary,
  meta,
}: {
  locale: Locale;
  href: string;
  kicker?: string;
  title: string;
  summary: string;
  meta?: string;
}) {
  return (
    <LocaleLink
      locale={locale}
      href={href}
      className="group block border border-line bg-canvas-elevated/40 p-5 transition-colors hover:border-signal/40"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        {kicker ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
            {kicker}
          </span>
        ) : (
          <span />
        )}
        {meta ? (
          <span className="font-mono text-[11px] text-mute">{meta}</span>
        ) : null}
      </div>
      <h3 className="font-display text-2xl leading-tight text-ink group-hover:text-signal">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-mute">{summary}</p>
    </LocaleLink>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="border border-dashed border-line px-4 py-8 text-sm text-mute">
      {message}
    </p>
  );
}
