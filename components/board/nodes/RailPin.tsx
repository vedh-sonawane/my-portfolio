"use client";

/**
 * J1..J7 -- the hackathon connectors along the bottom power rail.
 * Chronological left to right, so the rail reads as a timeline without ever
 * announcing itself as one.
 */

import type { Hackathon } from "@/data/content";
import { projects } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node, { Readout } from "@/components/board/Node";

export default function RailPin({
  hackathon,
  node,
  reached,
  active,
  onActivate,
}: {
  hackathon: Hackathon;
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const powered = reached >= node.stop;
  const hot = active === node.id;
  const built = projects.filter((p) => p.origin === hackathon.id);

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      readoutWidth={380}
      href={hackathon.url}
      hrefLabel={`Open ${hackathon.name} in a new tab`}
      label={`${hackathon.designator}: ${hackathon.name}, ${hackathon.location}, ${hackathon.date}`}
      readout={
        built.length > 0 ? (
          <Readout title={`${hackathon.designator} // cross-wired`}>
            <p className="m-0 text-[13px] text-ink-dim">
              This connector feeds{" "}
              <span className="text-hot">
                {built.map((b) => b.name).join(" and ")}
              </span>{" "}
              on the digital half.
            </p>
          </Readout>
        ) : undefined
      }
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${node.w} ${node.h}`}
        aria-hidden="true"
      >
        {/* connector shroud */}
        <rect
          x={node.w / 2 - 46}
          y={node.h - 76}
          width={92}
          height={72}
          rx={3}
          fill="var(--color-mask)"
          stroke={hot ? "var(--color-hot)" : "var(--color-silk)"}
          strokeWidth={2}
        />
        {[-24, 0, 24].map((dx) => (
          <rect
            key={dx}
            x={node.w / 2 + dx - 5}
            y={node.h - 62}
            width={10}
            height={44}
            rx={1.5}
            fill={
              powered
                ? hot
                  ? "var(--color-hot)"
                  : "var(--color-trace)"
                : "var(--color-copper)"
            }
            style={{ transition: "fill 300ms ease" }}
          />
        ))}
        {/* label plate */}
        <line
          x1={26}
          y1={node.h - 92}
          x2={node.w - 26}
          y2={node.h - 92}
          stroke="var(--color-copper)"
          strokeWidth={1.5}
        />
      </svg>

      <div
        className="relative flex h-full flex-col justify-end pb-[86px]"
        style={{
          paddingLeft: 18,
          paddingRight: 18,
          opacity: powered ? 1 : 0,
          transition: "opacity 600ms ease 420ms",
        }}
      >
        <p className="desig m-0" style={{ fontSize: 14 }}>
          {hackathon.designator}
        </p>
        <h3 className="m-0 mt-2 text-[24px] leading-tight text-ink">
          {hackathon.name}
        </h3>
        <p className="silk m-0 mt-2.5" style={{ fontSize: 13 }}>
          {hackathon.location} · {hackathon.date}
        </p>
        {built.length > 0 ? (
          <p
            className="lod-fine m-0 mt-2 text-[14px]"
            style={{ color: "var(--color-hot)" }}
          >
            → {built.map((b) => b.name).join(", ")}
          </p>
        ) : hackathon.note ? (
          <p className="lod-fine silk m-0 mt-2" style={{ fontSize: 13 }}>
            {hackathon.note}
          </p>
        ) : null}
      </div>
    </Node>
  );
}
