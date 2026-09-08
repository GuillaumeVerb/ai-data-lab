import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro } from "@/components/ui";
import { listWriting } from "@/lib/content";
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
    path: "/writing",
    title: dict.writing.title,
    description: dict.writing.lead,
  });
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const items = listWriting(locale);

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.writing.title} lead={dict.writing.lead} />
      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/writing/${item.content_id}`}
              kicker={item.kind}
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
