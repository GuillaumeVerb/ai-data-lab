import { formatDate, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionary";
import type { LabRun } from "@/lib/labeval";

export function LabRunSnapshot({
  locale,
  run,
}: {
  locale: Locale;
  run: LabRun;
}) {
  const dict = getDictionary(locale);
  return (
    <aside className="my-10 max-w-3xl border border-line bg-canvas-elevated/40 p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-signal uppercase">
        {dict.lab.run} · {run.id}
      </p>
      {run.kind === "profile-ab" ? (
        <ProfileAb locale={locale} run={run} />
      ) : (
        <VisionDigits locale={locale} run={run} />
      )}
      <p className="mt-5 font-mono text-[11px] text-mute">
        {dict.lab.collected} {formatDate(run.computed_at, locale)} ·{" "}
        {run.pipeline_version}
      </p>
      <p className="mt-2 text-sm leading-6 text-mute">
        <span className="font-mono text-[11px] uppercase tracking-wider">
          {dict.lab.method}
        </span>{" "}
        {run.method}
      </p>
    </aside>
  );
}

function ProfileAb({
  locale,
  run,
}: {
  locale: Locale;
  run: Extract<LabRun, { kind: "profile-ab" }>;
}) {
  const dict = getDictionary(locale);
  const labels = dict.lab.stats;
  return (
    <>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.lab.profileNote}</p>
      <p className="mt-3 font-mono text-[11px] text-mute">
        {dict.lab.cappedError
          .replace("{a}", formatNumber(run.summary.a_mean_capped_error))
          .replace("{b}", formatNumber(run.summary.b_mean_capped_error))}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[28rem] border-t border-line font-mono text-[11px] text-ink">
          <thead>
            <tr className="text-left text-mute">
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.lab.stat}
              </th>
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.lab.truth}
              </th>
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.lab.conditionA}
              </th>
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.lab.errorA}
              </th>
              <th className="py-2 pr-3 font-normal uppercase tracking-wider">
                {dict.lab.conditionB}
              </th>
              <th className="py-2 font-normal uppercase tracking-wider">
                {dict.lab.errorB}
              </th>
            </tr>
          </thead>
          <tbody>
            {run.rows.map((row) => (
              <tr key={row.stat} className="border-t border-line/70">
                <td className="py-2 pr-3">
                  {labels[row.stat as keyof typeof labels] ?? row.stat}
                </td>
                <td className="py-2 pr-3">{formatCell(row.truth)}</td>
                <td className="py-2 pr-3">{formatCell(row.a)}</td>
                <td className="py-2 pr-3">{formatNumber(row.a_error)}</td>
                <td className="py-2 pr-3">{formatCell(row.b)}</td>
                <td className="py-2">{formatNumber(row.b_error)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VisionDigits({
  locale,
  run,
}: {
  locale: Locale;
  run: Extract<LabRun, { kind: "vision-digits" }>;
}) {
  const dict = getDictionary(locale);
  const datasetLabel = `${run.dataset.name} · ${run.dataset.n} × ${run.dataset.shape.join("×")}`;
  return (
    <>
      <p className="mt-2 text-sm leading-6 text-mute">{dict.lab.visionNote}</p>
      <p className="mt-3 font-mono text-[11px] text-mute">
        {run.dataset.url ? (
          <a
            href={run.dataset.url}
            className="text-lab hover:text-ink"
            rel="noreferrer"
            target="_blank"
          >
            {datasetLabel}
          </a>
        ) : (
          datasetLabel
        )}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-[11px] sm:grid-cols-4">
        <Metric label={dict.lab.nTrain} value={String(run.split.n_train)} />
        <Metric label={dict.lab.nTest} value={String(run.split.n_test)} />
        <Metric
          label={dict.lab.majority}
          value={formatPercent(run.metrics.majority_accuracy)}
        />
        <Metric
          label={dict.lab.centroid}
          value={formatPercent(run.metrics.centroid_accuracy)}
        />
      </dl>
      <p className="mt-3 font-mono text-[11px] text-mute">
        {dict.lab.visionHits
          .replace("{centroid}", String(run.metrics.centroid_correct))
          .replace("{majority}", String(run.metrics.majority_correct))
          .replaceAll("{n}", String(run.metrics.n_test))}
      </p>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mute uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

function formatCell(value: string | number) {
  return typeof value === "number" ? formatNumber(value) : value;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}
