import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownBody, ScaffoldNote } from "@/components/MarkdownBody";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Container } from "@/components/ui";
import {
  getProject,
  listLabs,
  listLearning,
  listProjects,
  listWriting,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { parseLocale } from "@/lib/params";
import { projectKicker } from "@/lib/labels";
import { buildPageMetadata } from "@/lib/seo";
import { locales } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listProjects(locale).map((item) => ({ locale, slug: item.content_id })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getProject(locale, slug);
  if (!item) return {};
  return buildPageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: item.title,
    description: item.summary,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getProject(locale, slug);
  if (!item) notFound();
  const dict = getDictionary(locale);
  const relatedLabs = listLabs(locale).filter((lab) =>
    item.related_lab_ids.includes(lab.content_id),
  );
  const relatedWriting = listWriting(locale).filter((article) =>
    item.related_writing_ids.includes(article.content_id) ||
    article.related_project_ids.includes(item.content_id),
  );
  const relatedLearning = listLearning(locale).filter((node) =>
    node.related_project_ids.includes(item.content_id),
  );

  return (
    <Container className="py-14 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
        {projectKicker(item, dict)}
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
        {item.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-mute">{item.summary}</p>
      {item.scaffold ? <ScaffoldNote text={dict.common.scaffold} /> : null}
      <dl className="mb-12 grid gap-6 border-y border-line py-8 md:grid-cols-2">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {dict.projects.problem}
          </dt>
          <dd className="mt-2 text-ink">{item.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
            {dict.projects.why}
          </dt>
          <dd className="mt-2 text-ink">{item.why_it_matters}</dd>
        </div>
      </dl>
      {item.stack.length ? (
        <p className="mb-8 font-mono text-xs text-mute">
          {dict.projects.stack}: {item.stack.join(" · ")}
        </p>
      ) : null}
      <MarkdownBody content={item.body} />
      <div className="mt-10 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wider">
        {item.github_url ? (
          <a href={item.github_url} className="text-lab hover:text-ink">
            {dict.projects.github}
          </a>
        ) : null}
        {item.demo_url ? (
          <a href={item.demo_url} className="text-lab hover:text-ink">
            {dict.projects.demo}
          </a>
        ) : null}
      </div>
      <RelatedLinks
        locale={locale}
        label={dict.common.related}
        items={[
          ...relatedLabs.map((lab) => ({
            href: `/lab/${lab.content_id}`,
            title: lab.title,
          })),
          ...relatedWriting.map((article) => ({
            href: `/writing/${article.content_id}`,
            title: article.title,
          })),
          ...relatedLearning.map((node) => ({
            href: `/learning/${node.content_id}`,
            title: node.title,
          })),
        ]}
      />
    </Container>
  );
}
