import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownBody, ScaffoldNote } from "@/components/MarkdownBody";
import { Container } from "@/components/ui";
import { getObserve, listObserve } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { locales } from "@/lib/i18n";
import { parseLocale } from "@/lib/params";
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
      <ScaffoldNote text={dict.common.scaffold} />
      <MarkdownBody content={item.body} />
    </Container>
  );
}
