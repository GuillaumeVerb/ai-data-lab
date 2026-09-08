import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownBody, ScaffoldNote } from "@/components/MarkdownBody";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SignalLabSnapshot } from "@/components/SignalLabSnapshot";
import { Container } from "@/components/ui";
import {
  getObserve,
  listLabs,
  listLearning,
  listObserve,
  listWriting,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { locales } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
import { getLatestObservation } from "@/lib/signallab";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    listObserve(locale).map((item) => ({ locale, slug: item.content_id })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getObserve(locale, slug);
  if (!item) return {};
  return buildPageMetadata({
    locale,
    path: `/observe/${slug}`,
    title: item.title,
    description: item.summary,
  });
}

export default async function ObserveDetailPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const item = getObserve(locale, slug);
  if (!item) notFound();
  const dict = getDictionary(locale);
  const relatedLabs = listLabs(locale).filter((lab) =>
    item.related_lab_ids.includes(lab.content_id),
  );
  const relatedWriting = listWriting(locale).filter((article) =>
    item.related_writing_ids.includes(article.content_id),
  );
  const relatedLearning = listLearning(locale).filter((node) =>
    item.related_learning_ids.includes(node.content_id),
  );
  const snapshot = getLatestObservation(item.content_id);

  return (
    <Container className="py-14 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
        {dict.observe.status[item.status]}
        {item.manual ? ` · ${dict.observe.manual}` : ""}
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
        {item.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-mute">{item.summary}</p>
      {item.scaffold ? <ScaffoldNote text={dict.common.scaffold} /> : null}
      {snapshot ? <SignalLabSnapshot locale={locale} observation={snapshot} /> : null}
      <MarkdownBody content={item.body} />
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
