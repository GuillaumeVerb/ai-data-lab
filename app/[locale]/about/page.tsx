import type { Metadata } from "next";
import { ContentCard } from "@/components/ContentCard";
import { Container, LocaleLink, SectionHeading } from "@/components/ui";
import { listExperience, listLabs, listProjects } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { evidenceLabel, projectKicker } from "@/lib/labels";
import { parseLocale } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  return buildPageMetadata({
    locale,
    path: "/about",
    title: dict.about.title,
    description: dict.about.lead,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const projects = listProjects(locale);
  const labs = listLabs(locale);
  const roles = listExperience(locale)
    .filter((item) => item.evidence_type === "PROFESSIONAL")
    .slice(0, 3);

  const links = [
    { href: site.githubProfile, label: "GitHub" },
    { href: site.linkedin, label: "LinkedIn" },
    { href: site.malt, label: "Malt" },
  ];

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-3xl border-b border-line pb-14">
        <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">
          {dict.about.eyebrow}
        </p>
        <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ink sm:text-6xl">
          {dict.about.name}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-mute">{dict.about.lead}</p>
        <div className="mt-8 max-w-2xl space-y-5 text-base leading-7 text-mute">
          {dict.about.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          {dict.about.links}
        </p>
        <ul className="mt-3 flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-block border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-lab hover:border-signal hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <section className="py-14">
        <SectionHeading index="01" label={dict.about.foundationTitle} />
        <ul className="max-w-2xl space-y-3">
          {dict.about.foundation.map((item) => (
            <li key={item} className="border-l border-signal/50 pl-4 text-sm leading-6 text-mute">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-14">
        <SectionHeading index="02" label={dict.about.professionalTitle} />
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((item) => (
            <article
              key={item.content_id}
              className="border border-line bg-canvas-elevated/40 p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
                {evidenceLabel(item, dict)}
              </p>
              {item.period ? (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-mute">
                  {item.period}
                </p>
              ) : null}
              <h3 className="mt-3 font-display text-2xl leading-tight text-ink">{item.title}</h3>
              {item.org ? (
                <p className="mt-1 font-mono text-[11px] text-mute">{item.org}</p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-mute">{item.summary}</p>
              {item.tools.length ? (
                <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-mute">
                  {item.tools.join(" · ")}
                </p>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-6">
          <LocaleLink
            locale={locale}
            href="/experience"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-lab hover:text-ink"
          >
            {dict.about.professionalCta}
          </LocaleLink>
        </p>
      </section>

      <section className="grid gap-12 border-t border-line py-14 lg:grid-cols-2">
        <div>
          <SectionHeading index="03" label={dict.about.nowTitle} />
          <p className="max-w-xl text-base leading-7 text-mute">{dict.about.now}</p>
        </div>
        <div>
          <SectionHeading index="04" label={dict.about.trajectoryTitle} />
          <ol className="space-y-5">
            {dict.about.trajectory.map((item) => (
              <li key={item.when} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal">
                  {item.when}
                </p>
                <div>
                  {"label" in item && item.label ? (
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                      {item.label}
                    </p>
                  ) : null}
                  <p className="text-sm leading-6 text-mute">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line py-14">
        <SectionHeading index="05" label={dict.about.workTitle} />
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((item) => (
            <ContentCard
              key={item.content_id}
              locale={locale}
              href={`/projects/${item.content_id}`}
              kicker={projectKicker(item, dict)}
              title={item.title}
              summary={item.summary}
            />
          ))}
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
      </section>
    </Container>
  );
}
