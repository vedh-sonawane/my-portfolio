"use client";

/**
 * Silkscreen furniture on the physical half: the parts index (skills), the
 * firmware readout (currently), the stamps (certs, awards, languages) and the
 * indicator beacons (leadership and community work).
 *
 * These are printed onto the board rather than mounted on it, so they get
 * hairline outlines and silkscreen type instead of pins and soldermask.
 */

import { credentials, firmware, leadership, legend } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node, { Readout } from "@/components/board/Node";

function Frame({
  title,
  hot,
  children,
}: {
  title: string;
  hot: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative h-full w-full"
      style={{
        border: `1px dashed color-mix(in oklab, ${
          hot ? "var(--color-hot)" : "var(--color-silk)"
        } 55%, transparent)`,
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--color-board-3) 70%, transparent), transparent)",
      }}
    >
      <p
        className="silk absolute -top-[7px] left-4 m-0 px-2"
        style={{
          background: "var(--color-board-2)",
          fontSize: 13,
          color: hot ? "var(--color-hot)" : undefined,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export function LegendPanel({
  node,
  reached,
  active,
  onActivate,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const powered = reached >= node.stop;
  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label="Silkscreen legend: parts index of languages, frameworks, AI tooling and hardware."
    >
      <Frame title="Parts index · Skills" hot={active === node.id}>
        <div
          className="grid h-full grid-cols-2 content-start gap-x-8 gap-y-7 px-6 pt-9 pb-6"
          style={{ opacity: powered ? 1 : 0, transition: "opacity 600ms ease 420ms" }}
        >
          {legend.map((group, i) => (
            <section key={group.key}>
              <h3 className="m-0 flex items-baseline gap-2">
                <span className="desig" style={{ fontSize: 13 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="silk" style={{ fontSize: 13, color: "var(--color-silk)" }}>
                  {group.label}
                </span>
              </h3>
              <p className="m-0 mt-2.5 text-[15px] leading-[1.65] text-ink-dim">
                {group.items.map((item, i) => (
                  <span key={item}>
                    {i > 0 ? <span className="text-silk-dim"> · </span> : null}
                    {item}
                  </span>
                ))}
              </p>
            </section>
          ))}
        </div>
      </Frame>
    </Node>
  );
}

export function FirmwarePanel({
  node,
  reached,
  active,
  onActivate,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const powered = reached >= node.stop;
  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label={`Firmware ${firmware.version}: currently exploring and reading.`}
    >
      <Frame title={`Firmware ${firmware.version}`} hot={active === node.id}>
        <div
          className="px-5 pt-8"
          style={{ opacity: powered ? 1 : 0, transition: "opacity 600ms ease 420ms" }}
        >
          <p className="silk m-0" style={{ fontSize: 12 }}>Exploring</p>
          <p className="m-0 mt-2 text-[15px] leading-relaxed text-ink-dim">
            {firmware.exploring.join(" · ")}
          </p>
          <p className="silk m-0 mt-5" style={{ fontSize: 12 }}>Reading</p>
          <ul className="m-0 mt-1.5 space-y-1 p-0">
            {firmware.reading.map((b) => (
              <li key={b.title} className="list-none text-[14px] text-ink-dim">
                <span className="text-ink">{b.title}</span>
                <span className="text-silk-dim"> by </span>
                {b.author}
              </li>
            ))}
          </ul>
        </div>
      </Frame>
      <span
        className="absolute top-3 right-4 h-2 w-2 rounded-full"
        style={{
          background: "var(--color-hot)",
          animation: "blink 2.6s steps(1) infinite",
        }}
        aria-hidden="true"
      />
    </Node>
  );
}

export function StampsPanel({
  node,
  reached,
  active,
  onActivate,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const powered = reached >= node.stop;
  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label="Stamps: certification, award and spoken languages."
    >
      <Frame title="Stamps" hot={active === node.id}>
        <div
          className="px-5 pt-8"
          style={{ opacity: powered ? 1 : 0, transition: "opacity 600ms ease 420ms" }}
        >
          <div className="flex items-start gap-4">
            {/* the cert, stamped on as a chip */}
            <span
              className="relative grid shrink-0 place-items-center"
              style={{
                width: 84,
                height: 58,
                border: "2px solid var(--color-hot)",
                background: "var(--color-mask)",
                fontSize: 17,
                letterSpacing: "0.1em",
                color: "var(--color-hot)",
              }}
            >
              {credentials.certification.stamp}
              <span
                className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-hot)" }}
              />
            </span>
            <p className="m-0 text-[14px] leading-relaxed text-ink-dim">
              {credentials.certification.name}
              <br />
              <span className="silk" style={{ fontSize: 12 }}>{credentials.certification.issuer}</span>
            </p>
          </div>

          <ul className="m-0 mt-4 space-y-1.5 p-0">
            {credentials.awards.map((a) => (
              <li key={a.name} className="list-none text-[14px] text-ink-dim">
                <span className="text-ink">{a.name}</span>
                <span className="text-silk-dim"> · </span>
                <span className="tabular-nums">{a.year}</span>
              </li>
            ))}
          </ul>

          <p className="silk m-0 mt-5" style={{ fontSize: 12 }}>Spoken</p>
          <p className="m-0 mt-1.5 text-[14px] text-ink-dim">
            {credentials.spoken.join(" · ")}
          </p>
        </div>
      </Frame>
    </Node>
  );
}

export function Beacon({
  index,
  node,
  reached,
  active,
  onActivate,
}: {
  index: number;
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
}) {
  const item = leadership[index];
  const powered = reached >= node.stop;
  const hot = active === node.id;

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      readoutWidth={360}
      readout={
        <Readout title={`${item.designator} // indicator`}>
          <p className="m-0 text-[13px] leading-relaxed text-ink-dim">{item.detail}</p>
        </Readout>
      }
      label={`${item.designator}: ${item.name}. ${item.detail}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${node.w} ${node.h}`}
        aria-hidden="true"
      >
        {/* LED symbol: triangle into a bar, with emission arrows */}
        <g transform="translate(38 40)">
          <path
            d="M 0 -16 L 0 16 L 24 0 Z"
            fill={powered ? (hot ? "var(--color-hot)" : "var(--color-trace)") : "none"}
            stroke={hot ? "var(--color-hot)" : "var(--color-silk)"}
            strokeWidth={2}
            style={{ transition: "fill 300ms ease" }}
          />
          <line x1={24} y1={-16} x2={24} y2={16} stroke={hot ? "var(--color-hot)" : "var(--color-silk)"} strokeWidth={2.5} />
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M ${6 + i * 10} -22 l 10 -10 m 0 0 l -5 1 m 5 -1 l -1 5`}
              fill="none"
              stroke="var(--color-hot)"
              strokeWidth={1.6}
              opacity={powered ? 0.9 : 0}
              style={{ transition: "opacity 600ms ease 500ms" }}
            />
          ))}
        </g>
      </svg>
      <div
        className="relative h-full pt-[70px] pr-4 pl-4"
        style={{ opacity: powered ? 1 : 0, transition: "opacity 600ms ease 460ms" }}
      >
        <p className="desig m-0" style={{ fontSize: 13 }}>{item.designator}</p>
        <h3 className="m-0 mt-2 text-[21px] leading-tight text-ink">{item.name}</h3>
      </div>
    </Node>
  );
}
