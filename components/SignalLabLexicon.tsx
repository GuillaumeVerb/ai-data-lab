import { LocaleLink } from "@/components/ui";
import { formatDate, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import type { SignalLabLexicon } from "@/lib/signallab";

export function SignalLabLexicon({
  locale,
  lexicon,
  titles,
}: {
  locale: Locale;
  lexicon: SignalLabLexicon;
  titles: Record<string, string>;
}) {
  const dict = getDictionary(locale);
  const { topic } = lexicon;

  return (
    <aside className="my-10 max-w-3xl border border-line bg-canvas-elevated/40 p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
        {dict.observe.lexicon} · {lexicon.day}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.lexiconNote}</p>
      <p className="mt-2 font-mono text-[11px] text-mute">
        {dict.observe.lexiconDocs.replace("{n}", String(topic.document_count))}
      </p>

      {topic.terms.length ? (
        <section className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
            {dict.observe.lexiconTerms}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {topic.terms.map((item) => (
              <li
                key={item.term}
                className="border border-line px-2 py-1 font-mono text-[11px] text-ink"
              >
                {item.term}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topic.shared.length ? (
        <section className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
            {dict.observe.lexiconShared}
          </p>
          <p className="mt-2 text-sm leading-6 text-mute">{topic.shared.join(" · ")}</p>
        </section>
      ) : null}

      {topic.nearest.length ? (
        <section className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
            {dict.observe.lexiconNearest}
          </p>
          <ul className="mt-2 space-y-1 font-mono text-[11px]">
            {topic.nearest.map((item) => (
              <li key={item.topic_id}>
                <LocaleLink
                  locale={locale}
                  href={`/observe/${item.topic_id}`}
                  className="text-lab hover:text-ink"
                >
                  {titles[item.topic_id] ?? item.topic_id}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topic.clusters.length ? (
        <section className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
            {dict.observe.lexiconClusters}
          </p>
          <p className="mt-1 text-sm leading-6 text-mute">
            {dict.observe.lexiconClustersNote}
          </p>
          <ul className="mt-2 space-y-1 font-mono text-[11px] text-ink">
            {topic.clusters.map((item) => (
              <li key={`${item.label}-${item.size}`}>
                {item.label}
                <span className="text-mute"> · {item.size}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-5 font-mono text-[11px] text-mute">
        {dict.observe.collected} {formatDate(lexicon.computedAt, locale)} ·{" "}
        {lexicon.pipelineVersion}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {dict.observe.method}
        </span>{" "}
        {lexicon.method}
      </p>
    </aside>
  );
}
