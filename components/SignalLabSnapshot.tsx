import { formatDate, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import {
  observationOnUtcDay,
  seriesCoverage,
  volumeGrid,
  type SignalLabObservation,
  type SignalLabSeries,
} from "@/lib/signallab";

export function SignalLabSnapshot({
  locale,
  series,
}: {
  locale: Locale;
  series: SignalLabSeries[];
}) {
  if (!series.length) return null;
  const dict = getDictionary(locale);
  const coverage = seriesCoverage(series);
  const grid = volumeGrid(series);

  return (
    <aside className="my-10 max-w-3xl space-y-8 border border-line bg-canvas-elevated/40 p-5">
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
          {dict.observe.signallab}
        </p>
        <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.signallabNote}</p>
        <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.breakdownNote}</p>
      </div>
      {coverage.latestDay ? (
        <SameDayBreakdown locale={locale} series={series} day={coverage.latestDay} />
      ) : null}
      {grid.days.length > 1 ? <VolumeByDay locale={locale} grid={grid} /> : null}
      {series.map((item) => (
        <SourceMetrics key={item.source_id} locale={locale} series={item} />
      ))}
    </aside>
  );
}

function sourceLabelFor(
  sourceId: string,
  dict: ReturnType<typeof getDictionary>,
): string {
  if (sourceId === "arxiv") return dict.observe.sourceArxiv;
  if (sourceId === "github-search") return dict.observe.sourceGithub;
  if (sourceId === "hacker-news") return dict.observe.sourceHn;
  if (sourceId === "huggingface") return dict.observe.sourceHf;
  return sourceId;
}

function historyFields(sourceId: string, dict: ReturnType<typeof getDictionary>) {
  if (sourceId === "arxiv") {
    return {
      countLabel: dict.observe.papersCount,
      secondaryLabel: dict.observe.published7,
      secondaryKey: "published_last_7d",
    };
  }
  if (sourceId === "hacker-news") {
    return {
      countLabel: dict.observe.storiesCount,
      secondaryLabel: dict.observe.pointsMedian,
      secondaryKey: "points_median",
    };
  }
  if (sourceId === "huggingface") {
    return {
      countLabel: dict.observe.modelsCount,
      secondaryLabel: dict.observe.downloadsMedian,
      secondaryKey: "downloads_median",
    };
  }
  return {
    countLabel: dict.observe.totalCount,
    secondaryLabel: dict.observe.starsMedian,
    secondaryKey: "stars_median",
  };
}

function SameDayBreakdown({
  locale,
  series,
  day,
}: {
  locale: Locale;
  series: SignalLabSeries[];
  day: string;
}) {
  const dict = getDictionary(locale);
  return (
    <section>
      <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
        {dict.observe.breakdown} · {day}
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-t border-line font-mono text-[11px] text-ink">
          <thead>
            <tr className="text-left text-mute">
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.observe.source}
              </th>
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.observe.volume}
              </th>
              <th className="py-2 font-normal uppercase tracking-wider">
                {dict.observe.secondary}
              </th>
            </tr>
          </thead>
          <tbody>
            {series.map((item) => {
              const observation = observationOnUtcDay(item, day);
              const fields = historyFields(item.source_id, dict);
              return (
                <tr key={item.source_id} className="border-t border-line/70">
                  <td className="py-2 pr-3">{sourceLabelFor(item.source_id, dict)}</td>
                  <td className="py-2 pr-3">
                    {observation
                      ? `${formatMetric(observation.metrics.total_count)} · ${fields.countLabel}`
                      : "—"}
                  </td>
                  <td className="py-2">
                    {observation
                      ? `${formatMetric(observation.metrics[fields.secondaryKey])} · ${fields.secondaryLabel}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function VolumeByDay({
  locale,
  grid,
}: {
  locale: Locale;
  grid: ReturnType<typeof volumeGrid>;
}) {
  const dict = getDictionary(locale);
  return (
    <section>
      <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
        {dict.observe.volumeByDay}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.volumeByDayNote}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-t border-line font-mono text-[11px] text-ink">
          <thead>
            <tr className="text-left text-mute">
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.observe.historyDate}
              </th>
              {grid.sources.map((sourceId) => (
                <th
                  key={sourceId}
                  className="py-2 pr-3 font-normal uppercase tracking-wider last:pr-0"
                >
                  {sourceLabelFor(sourceId, dict)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.days.map((day, dayIndex) => (
              <tr key={day} className="border-t border-line/70">
                <td className="py-2 pr-3">{day}</td>
                {grid.values.map((row, sourceIndex) => (
                  <td key={grid.sources[sourceIndex]} className="py-2 pr-3 last:pr-0">
                    {formatMetric(row[dayIndex] ?? undefined)}
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

function SourceMetrics({
  locale,
  series,
}: {
  locale: Locale;
  series: SignalLabSeries;
}) {
  const dict = getDictionary(locale);
  const observation = series.observations.at(-1);
  if (!observation) return null;
  const metrics = observation.metrics;
  const sourceLabel = sourceLabelFor(observation.source_id, dict);
  const history = historyFields(observation.source_id, dict);

  return (
    <section>
      <p className="font-mono text-[11px] tracking-[0.14em] text-lab uppercase">
        {sourceLabel}
      </p>
      {observation.query ? (
        <p className="mt-2 font-mono text-[11px] text-mute">
          {dict.observe.query}{" "}
          <span className="break-all text-ink">{observation.query}</span>
        </p>
      ) : null}
      <dl className="mt-3 grid grid-cols-2 gap-3 font-mono text-xs text-ink sm:grid-cols-3">
        {observation.source_id === "arxiv" ? (
          <>
            <Metric label={dict.observe.papersCount} value={metrics.total_count} />
            <Metric label={dict.observe.sampleSize} value={metrics.sample_size} />
            <Metric label={dict.observe.authors} value={metrics.unique_authors} />
            <Metric label={dict.observe.published7} value={metrics.published_last_7d} />
            <Metric label={dict.observe.published30} value={metrics.published_last_30d} />
          </>
        ) : observation.source_id === "hacker-news" ? (
          <>
            <Metric label={dict.observe.storiesCount} value={metrics.total_count} />
            <Metric label={dict.observe.sampleSize} value={metrics.sample_size} />
            <Metric label={dict.observe.pointsMedian} value={metrics.points_median} />
            <Metric label={dict.observe.pointsMax} value={metrics.points_max} />
            <Metric label={dict.observe.created7} value={metrics.created_last_7d} />
            <Metric label={dict.observe.authors} value={metrics.unique_authors} />
          </>
        ) : observation.source_id === "huggingface" ? (
          <>
            <Metric label={dict.observe.modelsCount} value={metrics.total_count} />
            <Metric label={dict.observe.sampleSize} value={metrics.sample_size} />
            <Metric label={dict.observe.downloadsMedian} value={metrics.downloads_median} />
            <Metric label={dict.observe.downloadsMax} value={metrics.downloads_max} />
            <Metric label={dict.observe.created7} value={metrics.created_last_7d} />
            <Metric label={dict.observe.updated7} value={metrics.updated_last_7d} />
          </>
        ) : (
          <>
            <Metric label={dict.observe.totalCount} value={metrics.total_count} />
            <Metric label={dict.observe.sampleSize} value={metrics.sample_size} />
            <Metric label={dict.observe.starsMedian} value={metrics.stars_median} />
            <Metric label={dict.observe.starsMax} value={metrics.stars_max} />
            <Metric label={dict.observe.created7} value={metrics.created_last_7d} />
            <Metric label={dict.observe.pushed7} value={metrics.pushed_last_7d} />
          </>
        )}
      </dl>
      <CollectSample urls={observation.sample_urls} dict={dict} />
      {observation.assumptions ? (
        <p className="mt-3 text-sm leading-6 text-mute">
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {dict.observe.method}
          </span>{" "}
          {observation.assumptions}
        </p>
      ) : null}
      <HistoryTable
        locale={locale}
        observations={series.observations}
        countLabel={history.countLabel}
        secondaryLabel={history.secondaryLabel}
        secondaryKey={history.secondaryKey}
      />
      <p className="mt-3 font-mono text-[11px] text-mute">
        {dict.observe.collected} {formatDate(observation.observed_at, locale)} · {observation.pipeline_version}
      </p>
    </section>
  );
}

function HistoryTable({
  locale,
  observations,
  countLabel,
  secondaryLabel,
  secondaryKey,
}: {
  locale: Locale;
  observations: SignalLabObservation[];
  countLabel: string;
  secondaryLabel: string;
  secondaryKey: string;
}) {
  const dict = getDictionary(locale);
  return (
    <div className="mt-4 overflow-x-auto">
      <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
        {dict.observe.history}
      </p>
      <table className="mt-2 w-full min-w-[18rem] border-t border-line font-mono text-[11px] text-ink">
        <thead>
          <tr className="text-left text-mute">
            <th className="py-2 pr-3 font-normal uppercase tracking-wider">{dict.observe.historyDate}</th>
            <th className="py-2 pr-3 font-normal uppercase tracking-wider">{countLabel}</th>
            <th className="py-2 font-normal uppercase tracking-wider">{secondaryLabel}</th>
          </tr>
        </thead>
        <tbody>
          {observations.map((item) => (
            <tr key={item.observed_at} className="border-t border-line/70">
              <td className="py-2 pr-3">{formatDate(item.observed_at, locale)}</td>
              <td className="py-2 pr-3">{formatMetric(item.metrics.total_count)}</td>
              <td className="py-2">{formatMetric(item.metrics[secondaryKey])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SAMPLE_LIMIT = 5;

function CollectSample({
  urls,
  dict,
}: {
  urls: string[];
  dict: ReturnType<typeof getDictionary>;
}) {
  const samples = urls.slice(0, SAMPLE_LIMIT);
  if (!samples.length) return null;
  return (
    <div className="mt-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
        {dict.observe.samples}
      </p>
      <p className="mt-1 text-sm leading-6 text-mute">{dict.observe.samplesNote}</p>
      <ul className="mt-2 space-y-1 font-mono text-[11px]">
        {samples.map((url) => (
          <li key={url}>
            <a
              href={url}
              className="break-all text-lab hover:text-ink"
              rel="noreferrer"
              target="_blank"
            >
              {sampleLabel(url)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sampleLabel(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com") {
      return parsed.pathname.replace(/^\/|\/$/g, "");
    }
    if (parsed.hostname === "arxiv.org") {
      return parsed.pathname.replace(/^\/abs\//, "");
    }
    if (parsed.hostname === "huggingface.co") {
      return parsed.pathname.replace(/^\/|\/$/g, "");
    }
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/$/, "");
    const label = `${host}${path}`;
    return label.length > 56 ? `${label.slice(0, 53)}…` : label;
  } catch {
    return url;
  }
}

function formatMetric(value: number | undefined) {
  if (value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <dt className="text-mute uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{formatMetric(value)}</dd>
    </div>
  );
}
