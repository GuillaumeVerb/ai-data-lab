import { LocaleLink } from "@/components/ui";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import type { SignalLabTopicBoard } from "@/lib/signallab";

export function ObserveBoard({
  locale,
  board,
  titles,
  className = "mb-12 max-w-3xl",
}: {
  locale: Locale;
  board: SignalLabTopicBoard;
  titles: Record<string, string>;
  className?: string;
}) {
  const dict = getDictionary(locale);
  return (
    <section className={`border border-line bg-canvas-elevated/40 p-5 ${className}`}>
      <p className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
        {dict.observe.board} · {board.day}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.boardNote}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-t border-line font-mono text-[11px] text-ink">
          <thead>
            <tr className="text-left text-mute">
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.observe.topic}
              </th>
              {board.sources.map((sourceId) => (
                <th
                  key={sourceId}
                  className="py-2 pr-3 font-normal uppercase tracking-wider last:pr-0"
                >
                  {sourceLabel(sourceId, dict)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {board.rows.map((row) => (
              <tr key={row.topicId} className="border-t border-line/70">
                <td className="py-2 pr-3">
                  <LocaleLink
                    locale={locale}
                    href={`/observe/${row.topicId}`}
                    className="text-lab hover:text-ink"
                  >
                    {titles[row.topicId] ?? row.topicId}
                  </LocaleLink>
                </td>
                {row.values.map((value, index) => (
                  <td key={board.sources[index]} className="py-2 pr-3 last:pr-0">
                    {formatVolume(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function sourceLabel(sourceId: string, dict: ReturnType<typeof getDictionary>) {
  if (sourceId === "arxiv") return dict.observe.sourceArxivShort;
  if (sourceId === "github-search") return dict.observe.sourceGithubShort;
  if (sourceId === "hacker-news") return dict.observe.sourceHnShort;
  if (sourceId === "huggingface") return dict.observe.sourceHfShort;
  return sourceId;
}

function formatVolume(value: number | null) {
  if (value === null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
