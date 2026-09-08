import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro } from "@/components/ui";
import { listLabs } from "@/lib/content";
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
    path: "/lab",
    title: dict.lab.title,
    description: dict.lab.lead,
  });
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const labs = listLabs(locale);

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.lab.title} lead={dict.lab.lead} />
      {labs.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {labs.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/lab/${item.content_id}`}
              kicker={item.format}
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
