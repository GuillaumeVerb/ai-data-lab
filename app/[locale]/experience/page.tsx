import type { Metadata } from "next";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Container, PageIntro } from "@/components/ui";
import { listExperience, type ExperienceEntry } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { evidenceLabel } from "@/lib/labels";
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
    path: "/experience",
    title: dict.experience.title,
    description: dict.experience.lead,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const items = listExperience(locale);

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.experience.title} lead={dict.experience.lead} />
      <p className="mb-12 max-w-2xl text-sm leading-6 text-mute">{dict.experience.note}</p>
      <div className="max-w-2xl space-y-10">
        {items.map((item) => (
          <ExperienceBlock key={item.content_id} item={item} label={evidenceLabel(item, dict)} />
        ))}
      </div>
    </Container>
  );
}

function ExperienceBlock({
  item,
  label,
}: {
  item: ExperienceEntry;
  label: string;
}) {
  const meta = [item.org, item.context].filter(Boolean).join(" · ");
  return (
    <article className="border-t border-line pt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">{label}</p>
      <h2 className="mt-2 font-display text-2xl text-ink">{item.title}</h2>
      {meta ? <p className="mt-1 font-mono text-[11px] text-mute">{meta}</p> : null}
      <p className="mt-3 text-base leading-7 text-mute">{item.summary}</p>
      {item.tools.length ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mute">
          {item.tools.join(" · ")}
        </p>
      ) : null}
      {item.body ? <MarkdownBody content={item.body} /> : null}
    </article>
  );
}
