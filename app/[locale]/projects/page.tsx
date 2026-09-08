import type { Metadata } from "next";
import { ContentCard, EmptyState } from "@/components/ContentCard";
import { Container, PageIntro, SectionHeading } from "@/components/ui";
import { listProjects } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/i18n";
import { projectKicker } from "@/lib/labels";
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
  const core = projects.filter((item) => item.domain === "core");
  const applied = projects.filter((item) => item.domain === "applied_ai");

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.projects.title} lead={dict.projects.lead} />
      {projects.length ? (
        <div className="space-y-14">
          <section>
            <SectionHeading index="01" label={dict.projects.core} />
            <div className="grid gap-4 md:grid-cols-2">
              {core.map((item) => (
                <ContentCard
                  key={item.content_id}
                  locale={locale}
                  href={`/projects/${item.content_id}`}
                  kicker={projectKicker(item, dict)}
                  title={item.title}
                  summary={item.summary}
                  meta={item.published_at ? formatDate(item.published_at, locale) : undefined}
                />
              ))}
            </div>
          </section>
          {applied.length ? (
            <section>
              <SectionHeading index="02" label={dict.projects.applied} />
              <div className="grid gap-4 md:grid-cols-2">
                {applied.map((item) => (
                  <ContentCard
                    key={item.content_id}
                    locale={locale}
                    href={`/projects/${item.content_id}`}
                    kicker={projectKicker(item, dict)}
                    title={item.title}
                    summary={item.summary}
                    meta={item.published_at ? formatDate(item.published_at, locale) : undefined}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState message={dict.home.empty} />
      )}
    </Container>
  );
}
