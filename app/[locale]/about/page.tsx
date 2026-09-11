import type { Metadata } from "next";
import { listLabs, listProjects } from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { parseLocale } from "@/lib/params";
import { buildPageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Container, LocaleLink, PageIntro } from "@/components/ui";

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

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.about.title} lead={dict.about.lead} />
      <div className="max-w-2xl space-y-12 text-base leading-7 text-mute">
        <p>{dict.about.intro}</p>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.professionalTitle}</h2>
          <p className="mt-3">
            <LocaleLink locale={locale} href="/experience" className="text-lab hover:text-ink">
              {dict.nav.experience}
            </LocaleLink>
          </p>
          <ul className="mt-4 space-y-3">
            {dict.about.professional.map((item) => (
              <li key={item} className="border-l border-line pl-4">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.trajectoryTitle}</h2>
          <ol className="mt-4 space-y-3">
            {dict.about.trajectory.map((item) => (
              <li key={item} className="border-l border-line pl-4">
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.nowTitle}</h2>
          <p className="mt-3">{dict.about.now}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.notTitle}</h2>
          <p className="mt-3">{dict.about.not}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.evidenceTitle}</h2>
          <ul className="mt-4 space-y-2">
            {projects.map((item) => (
              <li key={item.content_id}>
                <LocaleLink
                  locale={locale}
                  href={`/projects/${item.content_id}`}
                  className="text-lab hover:text-ink"
                >
                  {item.title}
                </LocaleLink>
                <span className="text-mute"> — {item.summary}</span>
              </li>
            ))}
            {labs.map((item) => (
              <li key={item.content_id}>
                <LocaleLink
                  locale={locale}
                  href={`/lab/${item.content_id}`}
                  className="text-lab hover:text-ink"
                >
                  {item.title}
                </LocaleLink>
                <span className="text-mute"> — {item.summary}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.scope}</h2>
          <p className="mt-3">{dict.about.scopeBody}</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.links}</h2>
          <ul className="mt-3 space-y-2 font-mono text-sm">
            <li>
              <a className="text-lab hover:text-ink" href={site.githubProfile}>
                GitHub
              </a>
            </li>
            <li>
              <a className="text-lab hover:text-ink" href={site.linkedin}>
                LinkedIn
              </a>
            </li>
            <li>
              <a className="text-lab hover:text-ink" href={site.github}>
                {site.github}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
