import type { Metadata } from "next";
import { Container, PageIntro } from "@/components/ui";
import { getDictionary } from "@/lib/dictionary";
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

  return (
    <Container className="py-14 sm:py-20">
      <PageIntro title={dict.about.title} lead={dict.about.lead} />
      <div className="max-w-2xl space-y-8 text-base leading-7 text-mute">
        <p>{dict.about.body}</p>
        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.scope}</h2>
          <p className="mt-3">{dict.about.scopeBody}</p>
        </section>
        <section>
          <h2 className="font-display text-2xl text-ink">{dict.about.links}</h2>
          <ul className="mt-3 space-y-2 font-mono text-sm">
            <li>
              <a className="text-lab hover:text-ink" href={site.github}>
                {site.github}
              </a>
            </li>
            <li>
              <a className="text-lab hover:text-ink" href={site.githubProfile}>
                {site.githubProfile}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </Container>
  );
}
