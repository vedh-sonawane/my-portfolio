"use client";

/**
 * TB1: the output terminal, where the trace ends.
 *
 * A screw terminal block. Three pins are wired; the fourth, the email, is
 * drawn as an OPEN circuit and stays that way until a visitor closes it. The
 * screw glyph lives inside its own row rather than in the backing SVG, so it
 * stays aligned with its label no matter how the rows reflow.
 */

import { identity } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node from "@/components/board/Node";
import EmailReveal from "@/components/EmailReveal";

const WIRED = [
  { label: "LinkedIn", value: "vedh-sonawane", href: identity.links.linkedin },
  { label: "GitHub", value: identity.githubLogin, href: identity.links.github },
  { label: "Devpost", value: "sonawane-vedh14", href: identity.links.devpost },
];

/** A slotted screw head, sized to sit on a text baseline. */
function Screw({ open = false }: { open?: boolean }) {
  const c = open ? "var(--color-copper-lit)" : "var(--color-trace)";
  return (
    <svg
      width={26}
      height={26}
      viewBox="0 0 26 26"
      className="shrink-0"
      aria-hidden="true"
      style={{ transform: "translateY(4px)" }}
    >
      <circle cx={13} cy={13} r={11} fill="none" stroke={c} strokeWidth={2} />
      <line
        x1={open ? 7 : 6}
        y1={open ? 19 : 13}
        x2={open ? 19 : 20}
        y2={open ? 7 : 13}
        stroke={c}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <div
        className="absolute inset-0"
        style={{
          border: `2.5px solid ${hot ? "var(--color-hot)" : "var(--color-copper-lit)"}`,
          background: "var(--color-mask)",
          transition: "border-color 300ms ease",
        }}
      />

      <div
        className="relative h-full"
        style={{
          padding: "20px 22px",
          opacity: powered ? 1 : 0,
          transition: "opacity 600ms ease 420ms",
        }}
      >
        <p className="desig m-0" style={{ fontSize: 13 }}>
          TB1 · Open a connection
        </p>

        <ul className="m-0 mt-3.5 space-y-3 p-0">
          <li className="flex list-none items-start gap-3">
            <Screw open />
            <span className="silk w-[74px] shrink-0 pt-1" style={{ fontSize: 12 }}>
              Email
            </span>
            <EmailReveal />
          </li>

          {WIRED.map((t) => (
            <li key={t.label} className="flex list-none items-start gap-3">
              <Screw />
              <span className="silk w-[74px] shrink-0 pt-1" style={{ fontSize: 12 }}>
                {t.label}
              </span>
              <a
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-0.5 text-[17px] text-ink underline decoration-copper decoration-1 underline-offset-4 hover:decoration-hot"
              >
                {t.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Node>
  );
}
