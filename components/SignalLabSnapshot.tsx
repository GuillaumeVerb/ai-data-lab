import { formatDate, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import type { SignalLabObservation } from "@/lib/signallab";

export function SignalLabSnapshot({
  locale,
  observation,
}: {
  locale: Locale;
  observation: SignalLabObservation;
}) {
  const dict = getDictionary(locale);
  const metrics = observation.metrics;

  return (
    <aside className="my-10 max-w-2xl border border-line bg-canvas-elevated/40 p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
        {dict.observe.signallab}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.observe.signallabNote}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs text-ink sm:grid-cols-3">
        <Metric label={dict.observe.totalCount} value={metrics.total_count} />
        <Metric label={dict.observe.sampleSize} value={metrics.sample_size} />
        <Metric label={dict.observe.starsMedian} value={metrics.stars_median} />
        <Metric label={dict.observe.starsMax} value={metrics.stars_max} />
        <Metric label={dict.observe.created7} value={metrics.created_last_7d} />
        <Metric label={dict.observe.pushed7} value={metrics.pushed_last_7d} />
      </dl>
      <p className="mt-4 font-mono text-[11px] text-mute">
        {dict.observe.collected} {formatDate(observation.observed_at, locale)} · {observation.pipeline_version}
      </p>
    </aside>
  );
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
