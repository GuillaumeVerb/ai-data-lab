import { ContentCard, EmptyState } from "@/components/ContentCard";
import { ObserveBoard } from "@/components/ObserveBoard";
import { Container, LocaleLink, SectionHeading } from "@/components/ui";
import {
  listLabs,
  listLearning,
  listObserve,
  listProjects,
  listWriting,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/i18n";
import { projectKicker } from "@/lib/labels";
import { parseLocale } from "@/lib/params";
import { site } from "@/lib/site";
import { topicBoard } from "@/lib/signallab";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  const dict = getDictionary(locale);
  const projects = listProjects(locale);
  const labs = listLabs(locale);
  const writing = listWriting(locale);
  const signals = listObserve(locale);
  const signalBoard = topicBoard(signals.map((item) => item.content_id));
  const signalTitles = Object.fromEntries(
    signals.map((item) => [item.content_id, item.title]),
  );
  const exploring = listLearning(locale)
    .filter((item) => item.stage === "exploring")
    .slice(0, 4);

  return (
    <Container className="py-14 sm:py-20">
      <section className="max-w-3xl border-b border-line pb-14">
        <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">
          {dict.home.eyebrow}
        </p>
        <h1 className="mt-5 font-display text-4xl leading-[1.08] text-ink sm:text-6xl">
          {dict.home.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-mute">
          {dict.home.lead}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LocaleLink
            locale={locale}
            href="/projects"
            className="bg-ink px-5 py-2.5 text-sm text-canvas hover:bg-signal hover:text-canvas"
          >
            {dict.home.ctaPrimary}
          </LocaleLink>
          <LocaleLink
            locale={locale}
            href="/lab"
            className="border border-line px-5 py-2.5 text-sm text-ink hover:border-signal"
          >
            {dict.home.ctaSecondary}
          </LocaleLink>
          <LocaleLink
            locale={locale}
            href="/about"
            className="px-5 py-2.5 text-sm text-lab hover:text-ink"
          >
            {dict.nav.about}
          </LocaleLink>
        </div>
      </section>

      <section className="py-14">
        <SectionHeading index="01" label={dict.home.featured} />
        {projects.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((item) => (
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
        ) : (
          <EmptyState message={dict.home.empty} />
        )}
      </section>

      <section className="py-14">
        <SectionHeading index="02" label={dict.home.labs} />
        {labs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
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
        ) : (
          <EmptyState message={dict.home.empty} />
        )}
      </section>

      <section className="py-14">
        <SectionHeading index="03" label={dict.home.exploring} />
        {exploring.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {exploring.map((item) => (
              <ContentCard
                key={item.content_id}
                locale={locale}
                href={`/learning/${item.content_id}`}
                kicker={dict.learning.exploring}
                title={item.title}
                summary={item.summary}
              />
            ))}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {dict.exploring.map((item) => (
              <li
                key={item}
                className="border border-line px-4 py-3 font-mono text-sm text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="py-14">
        <SectionHeading index="04" label={dict.home.signals} />
        {signalBoard ? (
          <>
            <ObserveBoard
              locale={locale}
              board={signalBoard}
              titles={signalTitles}
              className="mb-6 max-w-3xl"
            />
            <p className="mb-8 font-mono text-xs uppercase tracking-wider">
              <LocaleLink locale={locale} href="/observe" className="text-lab hover:text-ink">
                {dict.home.signalsMore}
              </LocaleLink>
            </p>
          </>
        ) : null}
        {signals.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {signals.map((item) => (
              <ContentCard
                key={item.content_id}
                locale={locale}
                href={`/observe/${item.content_id}`}
                kicker={dict.observe.status[item.status]}
                title={item.title}
                summary={item.summary}
              />
            ))}
          </div>
        ) : (
          <EmptyState message={dict.home.empty} />
        )}
      </section>

      <section className="py-14">
        <SectionHeading index="05" label={dict.home.writing} />
        {writing.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {writing.map((item) => (
              <ContentCard
                key={item.content_id}
                locale={locale}
                href={`/writing/${item.content_id}`}
                kicker={item.kind}
                title={item.title}
                summary={item.summary}
              />
            ))}
          </div>
        ) : (
          <EmptyState message={dict.home.empty} />
        )}
      </section>

      <section className="py-14">
        <SectionHeading index="06" label={dict.home.background} />
        <div className="max-w-2xl">
          <p className="text-base leading-7 text-mute">{dict.home.backgroundBody}</p>
          <div className="mt-6 flex gap-4 font-mono text-xs uppercase tracking-wider">
            <LocaleLink locale={locale} href="/experience" className="text-lab hover:text-ink">
              {dict.nav.experience}
            </LocaleLink>
            <LocaleLink locale={locale} href="/about" className="text-lab hover:text-ink">
              {dict.nav.about}
            </LocaleLink>
            <a href={site.githubProfile} className="text-lab hover:text-ink">
              GitHub
            </a>
            <a href={site.linkedin} className="text-lab hover:text-ink">
              LinkedIn
            </a>
            <a href={site.malt} className="text-lab hover:text-ink">
              Malt
            </a>
          </div>
        </div>
      </section>
    </Container>
  );
}
