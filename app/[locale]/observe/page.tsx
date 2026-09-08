import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro } from "@/components/ui";
import { listObserve } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { parseLocale } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";

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

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.observe.title} lead={dict.observe.lead} />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/observe/${item.content_id}`}
              kicker={`${dict.observe.status[item.status]}${item.manual ? ` · ${dict.observe.manual}` : ""}`}
              title={item.title}
              summary={item.summary}
            />
          ))}
        </div>
      ) : (
        <EmptyState message={dict.home.empty} />
      )}
    </Container>
  );
}
