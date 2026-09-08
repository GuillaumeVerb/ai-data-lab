import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro, SectionHeading } from "@/components/ui";
import { listLearning, type Learning } from "@/lib/content";
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

function LearningGrid({
  locale,
  items,
}: {
  locale: ReturnType<typeof parseLocale>;
  items: Learning[];
}) {
  return (
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
  );
}

export default async function LearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const items = listLearning(locale);
  const evidence = items.filter((item) => item.stage === "evidence");
  const exploring = items.filter((item) => item.stage === "exploring");

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.learning.title} lead={dict.learning.lead} />
      {items.length ? (
        <div className="space-y-14">
          {evidence.length ? (
            <section>
              <SectionHeading index="01" label={dict.learning.evidence} />
              <LearningGrid locale={locale} items={evidence} />
            </section>
          ) : null}
          {exploring.length ? (
            <section>
              <SectionHeading index="02" label={dict.learning.exploring} />
              <LearningGrid locale={locale} items={exploring} />
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState message={dict.home.empty} />
      )}
    </Container>
  );
}
