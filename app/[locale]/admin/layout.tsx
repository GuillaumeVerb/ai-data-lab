import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionary";
import { parseLocale } from "@/lib/params";
import { isAdminSession } from "@/lib/ingest/auth";
import { Container, LocaleLink } from "@/components/ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  return {
    title: dict.admin.title,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const authed = await isAdminSession();

  return (
    <>
      {authed ? (
        <div className="border-b border-line bg-canvas-elevated/80">
          <Container className="flex items-center justify-between gap-4 py-3">
            <LocaleLink
              locale={locale}
              href="/admin"
              className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase"
            >
              {dict.admin.title}
            </LocaleLink>
            <form action="/api/admin/logout" method="post">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="font-mono text-[11px] tracking-wider text-mute uppercase hover:text-ink"
              >
                {dict.admin.logout}
              </button>
            </form>
          </Container>
        </div>
      ) : null}
      {children}
    </>
  );
}
