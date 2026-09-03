"use client";

/**
 * AMP1 -- Code Ninjas.
 *
 * Teaching is the one thing on this board that takes a small signal in and
 * puts a much larger one out, so it is drawn as an operational amplifier and
 * not as another project. Input on the left, gain in the middle, output right.
 */

import { experience } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node, { Readout } from "@/components/board/Node";

export default function Amplifier({
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
  const hot = active === node.id;
  const stroke = hot ? "var(--color-hot)" : powered ? "var(--color-trace)" : "var(--color-copper)";

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      readoutWidth={430}
      readout={
        <Readout title="AMP1 // gain stage">
          <ul className="m-0 space-y-2 p-0">
            {experience.points.map((p) => (
              <li key={p} className="list-none text-[13px] leading-relaxed text-ink-dim">
                <span className="mr-2 text-hot">—</span>
                {p}
              </li>
            ))}
          </ul>
          <p className="silk mt-3 m-0" style={{ color: "var(--color-trace)" }}>
            {experience.stack.join(" · ")}
          </p>
        </Readout>
      }
      label={`${experience.designator} — ${experience.role} at ${experience.org}. ${experience.summary}`}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${node.w} ${node.h}`}
        aria-hidden="true"
      >
        {/* the op-amp itself sits to the right; the label block sits beside it,
            the way a schematic annotates a stage */}
        <path
          d={`M 470 90 L ${node.w - 30} ${node.h / 2} L 470 ${node.h - 90} Z`}
          fill="var(--color-mask)"
          stroke={stroke}
          strokeWidth={2.5}
          style={{ transition: "stroke 300ms ease" }}
        />
        <line x1={424} y1={140} x2={470} y2={140} stroke={stroke} strokeWidth={2.5} />
        <line x1={424} y1={240} x2={470} y2={240} stroke={stroke} strokeWidth={2.5} />
        <text x={482} y={146} fill="var(--color-silk)" fontSize={19}>
          +
        </text>
        <text x={482} y={248} fill="var(--color-silk)" fontSize={19}>
          &#8722;
        </text>
        <line
          x1={node.w - 30}
          y1={node.h / 2}
          x2={node.w - 6}
          y2={node.h / 2}
          stroke={stroke}
          strokeWidth={2.5}
        />
        {/* small signal in, large signal out */}
        <path
          d="M 428 140 q 7 -6 14 0 t 14 0"
          fill="none"
          stroke="var(--color-hot)"
          strokeWidth={1.8}
          opacity={powered ? 0.85 : 0}
          style={{ transition: "opacity 700ms ease 500ms" }}
        />
        <path
          d={`M ${node.w - 26} ${node.h / 2} q 9 -26 18 0 t 18 0`}
          fill="none"
          stroke="var(--color-hot)"
          strokeWidth={2.6}
          opacity={powered ? 1 : 0}
          style={{ transition: "opacity 700ms ease 600ms" }}
        />
      </svg>

      <div
        className="relative flex h-full flex-col justify-center"
        style={{
          paddingLeft: 30,
          paddingRight: 310,
          opacity: powered ? 1 : 0,
          transition: "opacity 600ms ease 460ms",
        }}
      >
        <p className="desig m-0" style={{ fontSize: 14 }}>
          {experience.designator} · Gain stage
        </p>
        <h3 className="m-0 mt-2.5 text-[24px] leading-tight text-ink">
          {experience.role}
        </h3>
        <p className="m-0 mt-1.5 text-[19px]" style={{ color: "var(--color-hot)" }}>
          {experience.org}
        </p>
        <dl className="lod-mid m-0 mt-4 grid grid-cols-3 gap-3">
          {[
            ["In", experience.input],
            ["Out", experience.output],
            ["Gain", experience.gain],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="silk m-0" style={{ fontSize: 11 }}>
                {k}
              </dt>
              <dd className="m-0 mt-1 text-[14px] leading-tight text-ink-dim">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Node>
  );
}
