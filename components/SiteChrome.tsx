import { getDictionary } from "@/lib/dictionary";
import { navItems, site } from "@/lib/site";
import { type Locale } from "@/lib/i18n";
import { Container, LocaleLink } from "@/components/ui";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="border-b border-line bg-canvas-elevated/80">
        <Container className="flex items-center justify-between py-2">
          <p className="font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.banner}
          </p>
          <LocaleSwitcher locale={locale} label={dict.locale.switchTo} />
        </Container>
      </div>
      <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <LocaleLink locale={locale} href="/" className="group">
          <p className="font-mono text-[10px] tracking-[0.22em] text-signal uppercase">
            {site.shortName}
          </p>
          <p className="font-display text-2xl leading-none text-ink">
            {site.name}
          </p>
        </LocaleLink>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
          {navItems.map((item) => (
            <LocaleLink
              key={item.key}
              locale={locale}
              href={item.href}
              className="tracking-wide uppercase text-[12px] hover:text-ink"
            >
              {dict.nav[item.key]}
            </LocaleLink>
          ))}
        </nav>
      </Container>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="mt-auto border-t border-line">
      <Container className="flex flex-col gap-3 py-8 text-sm text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>{dict.footer.note}</p>
        <a
          href={site.github}
          className="font-mono text-xs uppercase tracking-wider text-lab hover:text-ink"
        >
          {dict.footer.repo}
        </a>
      </Container>
    </footer>
  );
}
