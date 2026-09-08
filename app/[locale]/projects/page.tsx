import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro } from "@/components/ui";
import { listProjects } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/i18n";
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
    path: "/projects",
    title: dict.projects.title,
    description: dict.projects.lead,
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const projects = listProjects(locale);

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.projects.title} lead={dict.projects.lead} />
      {projects.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/projects/${item.content_id}`}
              kicker={item.flagship ? dict.projects.flagship : item.domain}
              title={item.title}
              summary={item.summary}
              meta={item.published_at ? formatDate(item.published_at, locale) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState message={dict.home.empty} />
      )}
    </Container>
  );
}
