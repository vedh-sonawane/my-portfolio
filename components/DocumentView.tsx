/**
 * DOCUMENT VIEW -- the same content, read straight down.
 *
 * This exists for three reasons and each one matters:
 *   1. it is the no-JavaScript rendering of the site;
 *   2. it is the "read as document" escape hatch offered on the board;
 *   3. it is the honest, complete, linear version of the content, which is
 *      what search engines and screen readers get to keep.
 *
 * It is deliberately plain. The board is the experience; this is the record.
 */

import {
  credentials,
  experience,
  firmware,
  hackathons,
  identity,
  leadership,
  legend,
  projects,
} from "@/data/content";
import type { GithubData } from "@/lib/github";
import type { Transmission } from "@/lib/daily";

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-copper/50 pt-6">
      <h2 className="mb-5 flex items-baseline gap-3">
        <span className="text-silk-dim">{index}</span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Entry({
  designator,
  name,
  meta,
  children,
  href,
}: {
  designator: string;
  name: string;
  meta?: string;
  children?: React.ReactNode;
  href?: string;
}) {
  return (
    <article className="border-l border-copper/60 pl-4">
      <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="desig">{designator}</span>
        {href ? (
          <a
            href={href}
            className="text-ink underline decoration-copper underline-offset-4 hover:decoration-hot"
            target="_blank"
            rel="noreferrer noopener"
          >
            {name}
          </a>
        ) : (
          <span>{name}</span>
        )}
        {meta ? <span className="silk">{meta}</span> : null}
      </h3>
      {children}
    </article>
  );
}

export default function DocumentView({
  github,
  transmission,
}: {
  github: GithubData;
  transmission: Transmission;
}) {
  const physical = projects.filter((p) => p.half === "physical");
  const digital = projects.filter((p) => p.half === "digital");

  return (
    <div className="doc mx-auto w-full max-w-4xl px-5 pb-28 pt-14 text-sm sm:px-8">
      <header className="mb-12">
        <p className="silk mb-4">Vedh Sonawane // Portfolio // Document view</p>
        <h1 className="font-display text-3xl leading-tight text-ink sm:text-5xl">
          {identity.name}
        </h1>
        <p
          className="mt-3 max-w-[36ch] font-display text-xl sm:text-2xl"
          style={{ color: "var(--color-hot)" }}
        >
          {identity.tagline}
        </p>
        <dl className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="silk">Role</dt>
            <dd className="mt-1 text-ink-dim">{identity.role}</dd>
          </div>
          <div>
            <dt className="silk">Location</dt>
            <dd className="mt-1 text-ink-dim">{identity.location}</dd>
          </div>
          <div>
            <dt className="silk">Education</dt>
            <dd className="mt-1 text-ink-dim">
              {identity.education.school} — {identity.education.detail}
            </dd>
          </div>
          <div>
            <dt className="silk">Pronouns</dt>
            <dd className="mt-1 text-ink-dim">{identity.pronouns}</dd>
          </div>
        </dl>
        <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {[
            ["GitHub", identity.links.github],
            ["LinkedIn", identity.links.linkedin],
            ["Devpost", identity.links.devpost],
            ["Email", `mailto:${identity.links.email}`],
          ].map(([label, href]) => (
            <li key={label}>
              <a
                className="text-hot underline decoration-hot/40 underline-offset-4 hover:decoration-hot"
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer noopener"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div className="space-y-12">
        <Section index="01" title="Physical half — hardware">
          <div className="space-y-7">
            {physical.map((p) => (
              <Entry
                key={p.id}
                designator={p.designator}
                name={p.name}
                meta={p.tech.join(" · ")}
                href={p.url}
              >
                <p className="mt-2">{p.detail}</p>
              </Entry>
            ))}
          </div>
        </Section>

        <Section index="02" title="Digital half — software">
          <div className="space-y-7">
            {digital.map((p) => (
              <Entry
                key={p.id}
                designator={p.designator}
                name={p.name}
                meta={p.tech.join(" · ")}
                href={p.url}
              >
                <p className="mt-2">{p.detail}</p>
              </Entry>
            ))}
          </div>
        </Section>

        <Section index="03" title="Hackathons — power rail">
          <ol className="space-y-4">
            {hackathons.map((h) => {
              const built = projects.filter((p) => p.origin === h.id);
              return (
                <li key={h.id}>
                  <Entry
                    designator={h.designator}
                    name={h.name}
                    meta={`${h.location} · ${h.date}`}
                  >
                    {built.length > 0 || h.note ? (
                      <p className="mt-1">
                        {built.length > 0
                          ? `Built ${built.map((b) => b.name).join(", ")}.`
                          : h.note}
                      </p>
                    ) : null}
                  </Entry>
                </li>
              );
            })}
          </ol>
        </Section>

        <Section index="04" title="Experience — signal amplifier">
          <Entry
            designator={experience.designator}
            name={`${experience.role} — ${experience.org}`}
            meta={experience.stack.join(" · ")}
          >
            <p className="mt-2">{experience.summary}</p>
            <ul className="mt-3 space-y-1.5 text-ink-dim">
              {experience.points.map((pt) => (
                <li key={pt} className="max-w-[68ch]">
                  <span className="mr-2 text-silk-dim">—</span>
                  {pt}
                </li>
              ))}
            </ul>
          </Entry>
        </Section>

        <Section index="05" title="Leadership & community">
          <div className="space-y-6">
            {leadership.map((l) => (
              <Entry key={l.id} designator={l.designator} name={l.name}>
                <p className="mt-2">{l.detail}</p>
              </Entry>
            ))}
          </div>
        </Section>

        <Section index="06" title="Output — live GitHub telemetry">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["Contributions", github.totalContributions.toLocaleString("en-CA")],
              ["Repositories", String(github.repositories)],
              ["Followers", String(github.followers)],
              ["Source", github.live ? "Live" : "Cached"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="silk">{k}</dt>
                <dd className="mt-1 text-lg text-trace tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6">
            <span className="silk mr-3">Transmission {transmission.stamp}</span>
            <span className="text-hot">{transmission.line}</span>
          </p>
        </Section>

        <Section index="07" title="Legend — skills index">
          <div className="grid gap-7 sm:grid-cols-2">
            {legend.map((group) => (
              <div key={group.key}>
                <h3 className="silk">
                  {group.key} — {group.label}
                </h3>
                <p className="mt-2">{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="08" title={`Firmware ${firmware.version} — currently`}>
          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <h3 className="silk">Exploring</h3>
              <p className="mt-2">{firmware.exploring.join(", ")}</p>
            </div>
            <div>
              <h3 className="silk">Reading</h3>
              <ul className="mt-2 space-y-1 text-ink-dim">
                {firmware.reading.map((b) => (
                  <li key={b.title}>
                    <span className="text-ink">{b.title}</span> — {b.author}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section index="09" title="Stamps — awards, certification, languages">
          <ul className="space-y-2 text-ink-dim">
            <li>
              <span className="desig mr-2">{credentials.certification.stamp}</span>
              {credentials.certification.name} — {credentials.certification.issuer}
            </li>
            {credentials.awards.map((a) => (
              <li key={a.name}>
                {a.name}, {a.year}
              </li>
            ))}
            <li>Spoken: {credentials.spoken.join(", ")}</li>
          </ul>
        </Section>

        <Section index="10" title="Terminal — open a connection">
          <ul className="space-y-2">
            <li>
              <a
                className="text-hot underline decoration-hot/40 underline-offset-4"
                href={`mailto:${identity.links.email}`}
              >
                {identity.links.email}
              </a>
            </li>
            <li>
              <a
                className="text-hot underline decoration-hot/40 underline-offset-4"
                href={identity.links.linkedin}
                target="_blank"
                rel="noreferrer noopener"
              >
                linkedin.com/in/vedh-sonawane
              </a>
            </li>
            <li>
              <a
                className="text-hot underline decoration-hot/40 underline-offset-4"
                href={identity.links.github}
                target="_blank"
                rel="noreferrer noopener"
              >
                github.com/{identity.githubLogin}
              </a>
            </li>
            <li>
              <a
                className="text-hot underline decoration-hot/40 underline-offset-4"
                href={identity.links.devpost}
                target="_blank"
                rel="noreferrer noopener"
              >
                devpost.com/sonawane-vedh14
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
