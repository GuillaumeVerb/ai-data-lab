import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { ObserveBoard } from "@/components/ObserveBoard";
import { Container, PageIntro } from "@/components/ui";
import { listObserve } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { parseLocale } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";
import { getTopicSeries, seriesCoverage, topicBoard } from "@/lib/signallab";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/observe",
    title: dict.observe.title,
    description: dict.observe.lead,
  });
}

export default async function ObservePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const items = listObserve(locale);
  const board = topicBoard(items.map((item) => item.content_id));
  const titles = Object.fromEntries(items.map((item) => [item.content_id, item.title]));

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.observe.title} lead={dict.observe.lead} />
      {board ? <ObserveBoard locale={locale} board={board} titles={titles} /> : null}
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const coverage = seriesCoverage(getTopicSeries(item.content_id));
            const meta =
              coverage.sourceCount && coverage.dayCount
                ? dict.observe.cardMeta
                    .replace("{sources}", String(coverage.sourceCount))
                    .replace("{days}", String(coverage.dayCount))
                : undefined;
            return (
              <ContentCard
                key={item.content_id}
                locale={locale}
                href={`/observe/${item.content_id}`}
                kicker={`${dict.observe.status[item.status]}${item.manual ? ` · ${dict.observe.manual}` : ""}`}
                title={item.title}
                summary={item.summary}
                meta={meta}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState message={dict.home.empty} />
      )}
    </Container>
  );
}
