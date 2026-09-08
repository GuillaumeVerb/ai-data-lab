import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
import { canRunDraftModel } from "@/lib/ingest/draft";
import { requireAdmin } from "@/lib/ingest/guard";
import { getJob } from "@/lib/ingest/store";
import { Container, LocaleLink, PageIntro } from "@/components/ui";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = parseLocale(localeParam);
  await requireAdmin(locale);

  const job = getJob(id);
  if (!job) notFound();

  const dict = getDictionary(locale);
  const { error } = await searchParams;
  const locked = job.status === "approved" || job.status === "rejected";
  const chips = [
    ...job.extracted.key_concepts,
    ...job.extracted.technologies,
    ...job.extracted.tags,
  ].filter(Boolean);

  return (
    <Container className="py-14 sm:py-20">
      <LocaleLink
        locale={locale}
        href="/admin"
        className="mb-8 inline-block font-mono text-[11px] tracking-[0.16em] text-mute uppercase hover:text-ink"
      >
        ← {dict.admin.back}
      </LocaleLink>
      <PageIntro title={job.extracted.title_fr || job.extracted.title_en || job.input_type} lead={job.input_ref} />

      <dl className="mb-8 grid gap-3 font-mono text-[11px] tracking-wider text-mute uppercase sm:grid-cols-2">
        <div>
          status · <span className="text-signal">{job.status}</span>
        </div>
        <div>
          {dict.admin.pipeline} · {job.pipeline_version}
        </div>
        <div>
          {dict.admin.model} · {job.model_used ?? "—"}
        </div>
        <div>
          {formatDate(job.created_at, locale)}
          {job.reviewed_at ? ` · ${dict.admin.reviewed} ${formatDate(job.reviewed_at, locale)}` : ""}
        </div>
      </dl>

      {error ? (
        <p className="mb-6 text-sm text-danger">
          {dict.admin.error}: {decodeURIComponent(error)}
        </p>
      ) : null}
      {job.error ? <p className="mb-6 text-sm text-danger">{job.error}</p> : null}
      {!locked && !canRunDraftModel() ? (
        <p className="mb-6 text-sm text-mute">{dict.admin.noModel}</p>
      ) : null}
      <p className="mb-8 text-sm text-mute">{dict.admin.approvedNote}</p>

      {chips.length ? (
        <p className="mb-8 text-xs text-mute">
          {dict.admin.extracted}: {chips.join(" · ")}
        </p>
      ) : null}

      {job.source_text ? (
        <details className="mb-10 border border-line bg-canvas-elevated/50 px-4 py-3">
          <summary className="cursor-pointer font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.admin.sourceText}
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-mute">
            {job.source_text}
          </pre>
        </details>
      ) : null}

      {!locked ? (
        <form action={`/api/ingest/${job.id}/process`} method="post" className="mb-8">
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="border border-lab bg-lab/10 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-lab uppercase hover:bg-lab/20"
          >
            {dict.admin.process}
          </button>
        </form>
      ) : null}

      <form action={`/api/ingest/${job.id}`} method="post" className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.admin.draftsFr}
          </span>
          <textarea
            name="draft_fr"
            rows={16}
            defaultValue={job.draft_fr}
            readOnly={locked}
            className="w-full border border-line bg-canvas-elevated px-3 py-2 font-mono text-xs leading-5 text-ink outline-none focus:border-signal"
          />
        </label>
        <label className="block">
          <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-mute uppercase">
            {dict.admin.draftsEn}
          </span>
          <textarea
            name="draft_en"
            rows={16}
            defaultValue={job.draft_en}
            readOnly={locked}
            className="w-full border border-line bg-canvas-elevated px-3 py-2 font-mono text-xs leading-5 text-ink outline-none focus:border-signal"
          />
        </label>
        {locked ? (
          <p className="text-sm text-mute">{dict.admin.neverPublish}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save"
              className="border border-line px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-mute uppercase hover:text-ink"
            >
              {dict.admin.save}
            </button>
            <button
              type="submit"
              name="intent"
              value="approve"
              className="border border-signal bg-signal/10 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-signal uppercase hover:bg-signal/20"
            >
              {dict.admin.approve}
            </button>
            <button
              type="submit"
              name="intent"
              value="reject"
              className="border border-danger px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-danger uppercase hover:bg-danger/10"
            >
              {dict.admin.reject}
            </button>
          </div>
        )}
      </form>
    </Container>
  );
}
