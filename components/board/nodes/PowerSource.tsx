"use client";

/**
 * BT1 -- the power source, and SW1 -- the ignition switch.
 *
 * The name is not faded in. It is *soldered* in: a gradient wipe travels left
 * to right across the letterforms as the current arrives, with a bead of hot
 * solder riding the leading edge.
 *
 * The wipe is driven by the `--solder` custom property, which the camera loop
 * writes on the world container every frame. Doing it in CSS rather than React
 * state means the entire intro animation costs zero re-renders.
 */

import type { CSSProperties } from "react";
import { identity } from "@/data/content";
import type { BoardNode } from "@/lib/layout";
import Node from "@/components/board/Node";

/** 0 until the wipe is nearly done, then 1. Used to reveal the supporting copy. */
const REVEALED = "clamp(0, calc((var(--solder, 0) - 0.86) * 9), 1)";

export function Ignition({
  node,
  reached,
  active,
  onActivate,
  armed,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
  armed: boolean;
}) {
  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      dimOpacity={0.9}
      label="SW1 — power switch. The board is energised here."
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${node.w} ${node.h}`}
        aria-hidden="true"
      >
        <rect
          x={6}
          y={6}
          width={node.w - 12}
          height={node.h - 12}
          rx={3}
          fill="var(--color-mask)"
          stroke={armed ? "var(--color-hot)" : "var(--color-silk)"}
          strokeWidth={2}
        />
        <circle cx={node.w * 0.28} cy={node.h * 0.62} r={7} fill="var(--color-copper)" />
        <circle cx={node.w * 0.72} cy={node.h * 0.62} r={7} fill="var(--color-copper)" />
        <line
          x1={node.w * 0.28}
          y1={node.h * 0.62}
          x2={node.w * 0.72}
          y2={armed ? node.h * 0.62 : node.h * 0.3}
          stroke={armed ? "var(--color-hot)" : "var(--color-silk)"}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ transition: "all 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>

      <div className="relative flex h-full flex-col justify-start p-3">
        <p className="desig m-0">SW1</p>
        <p
          className="silk m-0 mt-1"
          style={{ color: armed ? "var(--color-hot)" : undefined }}
        >
          {armed ? "Closed" : "Open"}
        </p>
      </div>

      <div
        className={armed ? "pointer-events-none absolute inset-0" : "pointer-events-none absolute inset-0 reduce-keep"}
        style={{
          background: `radial-gradient(50% 50% at 50% 62%, color-mix(in oklab, var(--color-hot) ${
            armed ? 45 : 26
          }%, transparent), transparent 70%)`,
          // Before the switch closes it breathes: standby, waiting for scroll.
          animation: armed ? undefined : "pulse-soft 2.4s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    </Node>
  );
}

export function PowerSource({
  node,
  reached,
  active,
  onActivate,
  contributions,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
  contributions: number;
}) {
  const revealed = {
    "--rev": REVEALED,
    opacity: "var(--rev)",
    transform: "translateY(calc((1 - var(--rev)) * 7px))",
  } as CSSProperties;

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label={`${identity.name} — ${identity.tagline}`}
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
          stroke="var(--color-hot)"
          strokeWidth={2.5}
          strokeOpacity={0.9}
        />
        {/* battery cell symbol on the left edge */}
        <g transform={`translate(28 ${node.h / 2})`} opacity={0.85}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(0 ${(i - 1) * 26})`}>
              <line x1={-8} y1={0} x2={8} y2={0} stroke="var(--color-hot)" strokeWidth={4} />
              <line x1={-4} y1={11} x2={4} y2={11} stroke="var(--color-hot)" strokeWidth={2.5} />
            </g>
          ))}
        </g>
        {/* + and - terminals on the right edge */}
        <g transform={`translate(${node.w - 34} ${node.h / 2})`}>
          <circle cy={-24} r={10} fill="none" stroke="var(--color-hot)" strokeWidth={2} />
          <circle cy={24} r={10} fill="none" stroke="var(--color-silk)" strokeWidth={2} />
          <line x1={-5} y1={-24} x2={5} y2={-24} stroke="var(--color-hot)" strokeWidth={2} />
          <line x1={0} y1={-29} x2={0} y2={-19} stroke="var(--color-hot)" strokeWidth={2} />
          <line x1={-5} y1={24} x2={5} y2={24} stroke="var(--color-silk)" strokeWidth={2} />
        </g>
      </svg>

      <div
        className="relative flex h-full flex-col justify-center"
        style={{ padding: "26px 52px" }}
      >
        <p className="desig m-0" style={{ fontSize: 15 }}>
          BT1 · Power source
        </p>

        <h1
          className="font-display m-0"
          style={{
            fontSize: 54,
            lineHeight: 1.04,
            marginTop: 12,
            backgroundImage:
              "linear-gradient(90deg, var(--color-ink) 0 calc(var(--solder, 0) * 100%), color-mix(in oklab, var(--color-copper) 65%, transparent) calc(var(--solder, 0) * 100%) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {identity.name}
        </h1>

        <p
          className="font-display m-0"
          style={{
            ...revealed,
            fontSize: 26,
            marginTop: 16,
            color: "var(--color-hot)",
          }}
        >
          {identity.tagline}
        </p>

        <dl className="lod-mid m-0 mt-6 grid gap-y-4" style={revealed}>
          <div>
            <dt className="silk m-0" style={{ fontSize: 12 }}>Role</dt>
            <dd className="m-0 mt-1.5 text-[19px] text-ink-dim">{identity.role}</dd>
          </div>
          <div>
            <dt className="silk m-0" style={{ fontSize: 12 }}>Located</dt>
            <dd className="m-0 mt-1.5 text-[19px] text-ink-dim">{identity.location}</dd>
          </div>
        </dl>
      </div>

      {/* the bead of solder riding the leading edge of the wipe */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "calc(52px + (100% - 104px) * var(--solder, 0))",
          top: 56,
          width: 24,
          height: 68,
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--color-hot-hi), transparent 70%)",
          opacity:
            "clamp(0, calc(min(var(--solder, 0) * 16, (1 - var(--solder, 0)) * 16)), 1)",
        }}
        aria-hidden="true"
      />

      <p
        className="silk absolute right-4 bottom-3 m-0 tabular-nums"
        style={{ fontSize: 12, color: "var(--color-hot)" }}
      >
        Vout {(3 + Math.min(1, contributions / 10000) * 0.6).toFixed(2)}V
      </p>
    </Node>
  );
}
