import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownBody, ScaffoldNote } from "@/components/MarkdownBody";
import { RelatedLinks } from "@/components/RelatedLinks";
import { Container } from "@/components/ui";
import {
  getLab,
  listLabs,
  listLearning,
  listProjects,
  listWriting,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { locales } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listLabs(locale).map((item) => ({ locale, slug: item.content_id })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getLab(locale, slug);
  if (!item) return {};
  return buildPageMetadata({
    locale,
    path: `/lab/${slug}`,
    title: item.title,
    description: item.summary,
  });
}

export default async function LabDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getLab(locale, slug);
  if (!item) notFound();
  const dict = getDictionary(locale);
  const relatedProjects = listProjects(locale).filter(
    (project) =>
      item.related_project_ids.includes(project.content_id) ||
      project.related_lab_ids.includes(item.content_id),
  );
  const relatedWriting = listWriting(locale).filter((article) =>
    article.related_lab_ids.includes(item.content_id),
  );
  const relatedLearning = listLearning(locale).filter((node) =>
    node.related_lab_ids.includes(item.content_id),
  );

  return (
    <Container className="py-14 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
        {item.format}
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
        {item.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-mute">{item.question}</p>
      {item.hypothesis ? (
        <p className="mt-3 max-w-2xl text-sm text-mute">
          {dict.lab.hypothesis}: {item.hypothesis}
        </p>
      ) : null}
      {item.scaffold ? <ScaffoldNote text={dict.common.scaffold} /> : null}
      <MarkdownBody content={item.body} />
      <RelatedLinks
        locale={locale}
        label={dict.common.related}
        items={[
          ...relatedProjects.map((project) => ({
            href: `/projects/${project.content_id}`,
            title: project.title,
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
