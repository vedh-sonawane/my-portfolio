"use client";

/**
 * THE COPPER LAYER.
 *
 * Every trace is drawn three times:
 *   1. a wide, very faint stroke  -- the glow, faked with geometry instead of
 *      an SVG filter because a Gaussian blur over a 4700x3560 region is the
 *      single most expensive thing you can ask a browser to composite;
 *   2. the core stroke            -- unlit copper, or lit cyan once powered;
 *   3. a dashed overlay           -- the CURRENT, animated by stroke-dashoffset.
 *
 * The current never stops. Under prefers-reduced-motion the dash animation is
 * swapped for a slow opacity breath in globals.css, so the board still reads as
 * alive without anything travelling.
 */

import { memo } from "react";
import { BUSES, CROSS_WIRES, NODES, SEAM, WORLD } from "@/lib/layout";
import { jumperPath, orthPath } from "@/lib/geometry";

const WEIGHT = {
  main: { core: 6, halo: 22, dash: "18 30", dur: 3.4 },
  branch: { core: 3.5, halo: 14, dash: "12 26", dur: 4.6 },
  fine: { core: 2, halo: 8, dash: "8 22", dur: 5.8 },
} as const;

function Trace({
  d,
  weight,
  lit,
  delay = 0,
  stroke = "var(--color-trace)",
}: {
  d: string;
  weight: keyof typeof WEIGHT;
  lit: number;
  delay?: number;
  stroke?: string;
}) {
  const w = WEIGHT[weight];
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={w.halo}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.09 * lit}
        style={{ transition: "opacity 900ms ease" }}
      />
      <path
        d={d}
        fill="none"
        stroke="var(--color-copper)"
        strokeWidth={w.core}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={w.core}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6 * lit}
        style={{ transition: "opacity 900ms ease" }}
      />
      {/* the current itself */}
      <path
        className="flowing"
        d={d}
        fill="none"
        stroke="var(--color-hot)"
        strokeWidth={w.core * 0.75}
        strokeLinecap="round"
        strokeDasharray={w.dash}
        opacity={0.9 * lit}
        style={{
          animationDuration: `calc(${w.dur}s / var(--flow))`,
          animationDelay: `${delay}s`,
          transition: "opacity 900ms ease",
        }}
      />
    </g>
  );
}

export interface TracesProps {
  /** Highest camera stop reached so far -- everything at or below is powered. */
  reached: number;
  /** Node currently hovered or focused; its stub and cross-wires go hot. */
  active: string | null;
}

function TracesImpl({ reached, active }: TracesProps) {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={WORLD.w}
      height={WORLD.h}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
      aria-hidden="true"
      focusable="false"
    >
      {/* ---- ground pour: the faint copper fill under everything ---------- */}
      <defs>
        {/* The material of the copper changes as it crosses the board:
            hand-soldered tan on the physical half, a bead of hot solder at
            the seam, etched cyan on the digital half. Because the main bus
            spans the full width, one user-space gradient does all of it. */}
        <linearGradient
          id="busGrad"
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={WORLD.w}
          y2={0}
        >
          <stop offset="0" stopColor="var(--color-physical)" />
          <stop offset={String((SEAM.from - 260) / WORLD.w)} stopColor="var(--color-physical)" />
          <stop offset={String(SEAM.mid / WORLD.w)} stopColor="var(--color-hot)" />
          <stop offset={String((SEAM.to + 260) / WORLD.w)} stopColor="var(--color-trace)" />
          <stop offset="1" stopColor="var(--color-trace)" />
        </linearGradient>
      </defs>

      {/* ---- buses -------------------------------------------------------- */}
      {BUSES.map((bus, i) => (
        <Trace
          key={bus.id}
          d={orthPath(bus.pts, bus.weight === "main" ? 40 : 26)}
          weight={bus.weight}
          lit={reached >= 1 ? 1 : 0.18}
          delay={-i * 0.4}
          stroke={bus.weight === "main" ? "url(#busGrad)" : "var(--color-trace)"}
        />
      ))}

      {/* ---- THE CROSSOVER ------------------------------------------------
           The etched trace stops at the edge of the perfboard. What carries
           the current across is a jumper: a wire that leaves the surface of
           the board, arcs over the gap, and lands on the other side. This is
           the whole site in one drawing. */}
      <g opacity={reached >= 1 ? 1 : 0.25} style={{ transition: "opacity 900ms" }}>
        {/* cut the copper inside the band */}
        <rect
          x={SEAM.from}
          y={SEAM.crossY - 16}
          width={SEAM.to - SEAM.from}
          height={32}
          fill="var(--color-board)"
        />
        {/* the jumper, arcing off the board */}
        <path
          d={`M ${SEAM.from} ${SEAM.crossY} C ${SEAM.from + 20} ${SEAM.crossY - 118}, ${
            SEAM.to - 20
          } ${SEAM.crossY - 118}, ${SEAM.to} ${SEAM.crossY}`}
          fill="none"
          stroke="var(--color-hot)"
          strokeWidth={26}
          strokeLinecap="round"
          opacity={0.12}
        />
        <path
          d={`M ${SEAM.from} ${SEAM.crossY} C ${SEAM.from + 20} ${SEAM.crossY - 118}, ${
            SEAM.to - 20
          } ${SEAM.crossY - 118}, ${SEAM.to} ${SEAM.crossY}`}
          fill="none"
          stroke="url(#busGrad)"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <path
          className="flowing"
          d={`M ${SEAM.from} ${SEAM.crossY} C ${SEAM.from + 20} ${SEAM.crossY - 118}, ${
            SEAM.to - 20
          } ${SEAM.crossY - 118}, ${SEAM.to} ${SEAM.crossY}`}
          fill="none"
          stroke="var(--color-hot-hi)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="10 26"
          style={{ animationDuration: "calc(2.2s / var(--flow))" }}
        />
        {/* solder joints where the jumper is tacked down */}
        {[SEAM.from, SEAM.to].map((x) => (
          <g key={x}>
            <circle cx={x} cy={SEAM.crossY} r={22} fill="var(--color-hot)" opacity={0.16} />
            <circle cx={x} cy={SEAM.crossY} r={13} fill="var(--color-hot)" />
            <circle cx={x} cy={SEAM.crossY - 3} r={5} fill="var(--color-hot-hi)" />
          </g>
        ))}
      </g>

      {/* ---- component stubs --------------------------------------------- */}
      {NODES.filter((n) => n.wire).map((n) => {
        const on = reached >= n.stop;
        const hot = active === n.id;
        const d = orthPath(n.wire!, 14);
        return (
          <g key={`stub-${n.id}`}>
            <path
              d={d}
              fill="none"
              stroke="var(--color-copper)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <path
              d={d}
              fill="none"
              stroke={hot ? "var(--color-hot)" : "var(--color-trace)"}
              strokeWidth={hot ? 4 : 2.5}
              strokeLinecap="round"
              opacity={on ? (hot ? 1 : 0.6) : 0}
              style={{ transition: "opacity 600ms ease, stroke-width 200ms ease" }}
            />
            {/* current is rerouted through whatever you are looking at */}
            <path
              className="flowing"
              d={d}
              fill="none"
              stroke="var(--color-hot-hi)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="6 18"
              opacity={hot ? 1 : 0}
              style={{
                animationDuration: "1.1s",
                transition: "opacity 220ms ease",
              }}
            />
            {/* solder pad where the stub meets the bus */}
            <circle
              cx={n.wire![n.wire!.length - 1][0]}
              cy={n.wire![n.wire!.length - 1][1]}
              r={hot ? 11 : 8}
              fill={hot ? "var(--color-hot)" : "var(--color-copper)"}
              opacity={on ? 1 : 0.35}
              style={{ transition: "all 260ms ease" }}
            />
          </g>
        );
      })}

      {/* ---- cross-wires: "this event produced this build" ---------------- */}
      {CROSS_WIRES.map((w) => {
        const hot = active === w.from || active === w.to;
        const on = reached >= 3;
        return (
          <g key={w.id}>
            <path
              d={jumperPath(w.a, w.b)}
              fill="none"
              stroke={hot ? "var(--color-hot)" : "var(--color-trace)"}
              strokeWidth={hot ? 3.5 : 2}
              strokeDasharray="3 14"
              strokeLinecap="round"
              opacity={on ? (hot ? 0.95 : 0.16) : 0}
              style={{ transition: "opacity 400ms ease, stroke-width 200ms ease" }}
            />
            {hot ? (
              <path
                className="flowing"
                d={jumperPath(w.a, w.b)}
                fill="none"
                stroke="var(--color-hot-hi)"
                strokeWidth={4}
                strokeDasharray="10 200"
                strokeLinecap="round"
                style={{ animationDuration: "2s" }}
              />
            ) : null}
          </g>
        );
      })}

      {/* ---- board furniture: mounting holes + fiducials ------------------ */}
      {[
        [120, 120],
        [WORLD.w - 120, 120],
        [120, WORLD.h - 120],
        [WORLD.w - 120, WORLD.h - 120],
      ].map(([x, y]) => (
        <g key={`hole-${x}-${y}`} opacity={0.5}>
          <circle cx={x} cy={y} r={34} fill="none" stroke="var(--color-copper)" strokeWidth={10} />
          <circle cx={x} cy={y} r={18} fill="var(--color-board)" />
        </g>
      ))}
    </svg>
  );
}

export default memo(TracesImpl);
