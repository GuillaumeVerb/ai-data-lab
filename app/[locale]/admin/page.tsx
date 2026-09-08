import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
import { requireAdmin } from "@/lib/ingest/guard";
import { listJobs } from "@/lib/ingest/store";
import { Container, LocaleLink, PageIntro } from "@/components/ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = parseLocale((await params).locale);
  await requireAdmin(locale);

  const dict = getDictionary(locale);
  const jobs = listJobs();
  const { error } = await searchParams;
  const errorMessage =
    error === "empty" ? dict.admin.errorEmpty : error ? decodeURIComponent(error) : "";

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.admin.title} lead={dict.admin.lead} />
      <p className="mb-8 max-w-2xl text-sm text-mute">{dict.admin.neverPublish}</p>

      {errorMessage ? (
        <p className="mb-6 text-sm text-danger">{errorMessage}</p>
      ) : null}

      <form action="/api/ingest" method="post" className="mb-14 max-w-2xl space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.admin.ingest}
          </span>
          <textarea
            name="input"
            required
            rows={4}
            placeholder={dict.admin.ingestPlaceholder}
            className="w-full border border-line bg-canvas-elevated px-3 py-2 text-sm text-ink outline-none placeholder:text-mute/70 focus:border-signal"
          />
        </label>
        <button
          type="submit"
          className="border border-signal bg-signal/10 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-signal uppercase hover:bg-signal/20"
        >
          {dict.admin.submit}
        </button>
      </form>

      <h2 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
        {dict.admin.jobs}
      </h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-mute">{dict.admin.empty}</p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {jobs.map((job) => (
            <li key={job.id}>
              <LocaleLink
                locale={locale}
                href={`/admin/${job.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-canvas-elevated sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-mono text-xs text-signal">{job.status}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {job.input_type} · {job.input_ref}
                </span>
                <span className="font-mono text-[11px] text-mute">
                  {formatDate(job.created_at, locale)}
                </span>
              </LocaleLink>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
