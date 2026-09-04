"use client";

import type { Project } from "@/data/content";
import { hackathons, repoUrl } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Footprint, { INSET } from "@/components/board/Footprint";
import Node, { Readout } from "@/components/board/Node";
import PartPhoto from "@/components/board/nodes/PartPhoto";

export default function ProjectPart({
  project,
  node,
  reached,
  active,
  onActivate,
}: {
  project: Project;
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const powered = reached >= node.stop;
  const hot = active === node.id;
  const [t, r, b, l] = INSET[project.footprint];
  const big = Boolean(project.featured);
  const origin = project.origin
    ? hackathons.find((h) => h.id === project.origin)
    : undefined;
  const repos = (project.repos ?? []).map((slug) => ({ slug, url: repoUrl(slug) }));
  // A live build is the more interesting destination when there is one.
  const primary = project.live ?? repos[0]?.url;
  const primaryLabel = project.live
    ? `Open ${project.name}, live build, in a new tab`
    : `Open the ${project.name} repository on GitHub in a new tab`;

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label={`${project.designator}: ${project.name}. ${project.blurb}`}
      href={primary}
      hrefLabel={primaryLabel}
      silk={
        project.status ? `${project.designator} · ${project.status}` : project.designator
      }
      silkSize={big ? 15 : 13}
      readoutWidth={440}
      readout={
        <Readout title={`${project.designator} // datasheet`}>
          {project.image ? (
            <PartPhoto src={project.image.src} alt={project.image.alt} />
          ) : null}
          <h3 className="mb-2 flex flex-wrap items-baseline gap-x-3 text-[19px] leading-tight text-ink">
            {project.name}
            {project.status ? (
              <span className="silk" style={{ color: "var(--color-hot)" }}>
                {project.status}
              </span>
            ) : null}
          </h3>
          <p className="m-0 text-[13px] leading-relaxed text-ink-dim">
            {project.detail}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {project.tech.map((tech) => (
              <li key={tech} className="silk" style={{ color: "var(--color-trace)" }}>
                {tech}
              </li>
            ))}
          </ul>
          {origin ? (
            <p className="silk mt-3 m-0">
              Cross-wired from {origin.designator} · {origin.name}
            </p>
          ) : null}
          <ul className="m-0 mt-3 flex flex-col gap-1.5 p-0">
            {project.live ? (
              <li className="list-none">
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="silk inline-block underline decoration-hot/40 underline-offset-4 hover:decoration-hot"
                  style={{ color: "var(--color-hot)" }}
                >
                  Open live build
                </a>
              </li>
            ) : null}
            {repos.map((r) => (
              <li key={r.slug} className="list-none">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="silk inline-block underline decoration-silk-dim/40 underline-offset-4 hover:decoration-hot"
                >
                  github.com/{r.slug}
                </a>
              </li>
            ))}
          </ul>
        </Readout>
      }
    >
      <Footprint
        kind={project.footprint}
        w={node.w}
        h={node.h}
        lit={powered ? 1 : 0}
        hot={hot}
      />

      {/* Sheen under the body, painted only while the part is active. */}
      {hot ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(62% 62% at 50% 50%, color-mix(in oklab, var(--color-hot) 20%, transparent), transparent 72%)",
          }}
        />
      ) : null}

      <div
        className="relative flex h-full flex-col justify-center"
        style={{
          paddingTop: t,
          paddingRight: r,
          paddingBottom: b,
          paddingLeft: l,
          opacity: powered ? 1 : 0,
          transition: "opacity 600ms ease 480ms",
        }}
      >
        <h3 className="m-0 leading-tight text-ink" style={{ fontSize: big ? 30 : 24 }}>
          {project.name}
        </h3>
        {big ? (
          <p
            className="lod-fine m-0 text-ink-dim"
            style={{ fontSize: 15, lineHeight: 1.4, marginTop: 10 }}
          >
            {project.blurb}
          </p>
        ) : null}
        <p
          className="lod-fine silk m-0"
          style={{ marginTop: big ? 12 : 8, fontSize: 12, letterSpacing: "0.14em" }}
        >
          {project.tech.slice(0, big ? 4 : 2).join(" · ")}
        </p>
      </div>
    </Node>
  );
}
