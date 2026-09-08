import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { localizedPath } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
import { isAdminSession } from "@/lib/ingest/auth";
import { requireAdminConfigured } from "@/lib/ingest/guard";
import { Container, PageIntro } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = parseLocale((await params).locale);
  requireAdminConfigured();
  if (await isAdminSession()) {
    redirect(localizedPath(locale, "/admin"));
  }

  const dict = getDictionary(locale);
  const { error } = await searchParams;

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.admin.loginTitle} lead={dict.admin.loginLead} />
      {error ? (
        <p className="mb-6 text-sm text-danger">{dict.admin.errorLogin}</p>
      ) : null}
      <form action="/api/admin/login" method="post" className="max-w-md space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.admin.password}
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full border border-line bg-canvas-elevated px-3 py-2 text-ink outline-none focus:border-signal"
          />
        </label>
        <button
          type="submit"
          className="border border-signal bg-signal/10 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-signal uppercase hover:bg-signal/20"
        >
          {dict.admin.login}
        </button>
      </form>
    </Container>
  );
}
