"use client";

/**
 * TB1 -- the output terminal, where the trace ends.
 * Four screw terminals, each one a way to reach him. This is the only place on
 * the board where the current is allowed to leave.
 */

import { identity } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node from "@/components/board/Node";

const TERMINALS = [
  { label: "Email", value: identity.links.email, href: `mailto:${identity.links.email}` },
  { label: "LinkedIn", value: "vedh-sonawane", href: identity.links.linkedin },
  { label: "GitHub", value: identity.githubLogin, href: identity.links.github },
  { label: "Devpost", value: "sonawane-vedh14", href: identity.links.devpost },
];

export default function ContactTerminal({
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

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label="TB1: output terminal. Contact links."
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${node.w} ${node.h}`}
        aria-hidden="true"
      >
        <rect
          x={4}
          y={4}
          width={node.w - 8}
          height={node.h - 8}
          rx={4}
          fill="var(--color-mask)"
          stroke={hot ? "var(--color-hot)" : "var(--color-silk)"}
          strokeWidth={2.5}
        />
        {/* one screw head per terminal, aligned to its row */}
        {TERMINALS.map((_, i) => {
          const cy = 92 + i * 44;
          return (
            <g key={i}>
              <circle
                cx={34}
                cy={cy}
                r={13}
                fill="none"
                stroke={powered ? "var(--color-hot)" : "var(--color-copper)"}
                strokeWidth={2}
              />
              <line
                x1={26}
                y1={cy}
                x2={42}
                y2={cy}
                stroke={powered ? "var(--color-hot)" : "var(--color-copper)"}
                strokeWidth={2.5}
              />
            </g>
          );
        })}
      </svg>

      <div
        className="relative h-full"
        style={{
          padding: "20px 22px 20px 66px",
          opacity: powered ? 1 : 0,
          transition: "opacity 600ms ease 420ms",
        }}
      >
        <p className="desig m-0" style={{ fontSize: 13 }}>
          TB1 · Open a connection
        </p>
        <ul className="m-0 mt-4 space-y-[21px] p-0">
          {TERMINALS.map((t) => (
            <li key={t.label} className="list-none leading-none">
              <a
                href={t.href}
                target={t.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="group flex items-baseline gap-3"
              >
                <span className="silk w-[84px] shrink-0" style={{ fontSize: 12 }}>
                  {t.label}
                </span>
                <span className="text-[19px] text-ink underline decoration-copper decoration-1 underline-offset-4 group-hover:decoration-hot">
                  {t.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Node>
  );
}
