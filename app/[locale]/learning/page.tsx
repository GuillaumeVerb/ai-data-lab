import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro } from "@/components/ui";
import { listLearning } from "@/lib/content";
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
    path: "/learning",
    title: dict.learning.title,
    description: dict.learning.lead,
  });
}

export default async function LearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const items = listLearning(locale);

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.learning.title} lead={dict.learning.lead} />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/learning/${item.content_id}`}
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
