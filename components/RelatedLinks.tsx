import { LocaleLink } from "@/components/ui";
import { type Locale } from "@/lib/i18n";

export function RelatedLinks({
  locale,
  label,
  items,
}: {
  locale: Locale;
  label: string;
  items: Array<{ href: string; title: string }>;
}) {
  const unique = items.filter(
    (item, index) => items.findIndex((other) => other.href === item.href) === index,
  );
  if (!unique.length) return null;

  return (
    <aside className="mt-16 border-t border-line pt-8">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        {label}
      </p>
      <ul className="space-y-2 text-sm">
        {unique.map((item) => (
          <li key={item.href}>
            <LocaleLink locale={locale} href={item.href} className="text-lab hover:text-ink">
              {item.title}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
