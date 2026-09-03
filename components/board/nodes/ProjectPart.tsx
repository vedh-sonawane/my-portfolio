"use client";

import type { Project } from "@/data/content";
import { hackathons } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Footprint, { INSET } from "@/components/board/Footprint";
import Node, { Readout } from "@/components/board/Node";

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

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label={`${project.designator}: ${project.name}. ${project.blurb}`}
      readoutWidth={440}
      readout={
        <Readout title={`${project.designator} // datasheet`}>
          <h3 className="mb-2 text-[19px] leading-tight text-ink">{project.name}</h3>
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
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block text-[12px] tracking-[0.14em] text-hot uppercase underline decoration-hot/40 underline-offset-4"
            >
              Open live build →
            </a>
          ) : null}
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

      {/* glow under the body once the part is drawing current */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: hot
            ? "radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--color-hot) 26%, transparent), transparent 70%)"
            : `radial-gradient(60% 60% at 50% 50%, color-mix(in oklab, var(--color-trace) calc(var(--voltage) * 16%), transparent), transparent 70%)`,
          opacity: powered ? 1 : 0,
          transition: "opacity 700ms ease 380ms, background 260ms ease",
        }}
      />

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
        <p
          className="desig m-0 leading-none"
          style={{ fontSize: big ? 15 : 13, color: hot ? "var(--color-hot-hi)" : undefined }}
        >
          {project.designator}
        </p>
        <h3
          className="m-0 leading-tight text-ink"
          style={{ fontSize: big ? 30 : 24, marginTop: 8 }}
        >
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
