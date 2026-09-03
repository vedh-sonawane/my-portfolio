"use client";

/**
 * THE COPPER LAYER.
 *
 * Split deliberately into two components:
 *
 *   StaticCopper   everything that never changes: unlit trace bodies, pads,
 *                  teardrops, vias, fiducials. Rendered once and memoised
 *                  with no changing props, so React never touches it again.
 *   LiveCopper     only what is actually alive: the energised overlay, the
 *                  flowing current, the active stub, the lit cross-wires.
 *
 * Fabrication rules enforced here, because their absence is what makes a
 * drawing read as decorative rather than manufactured:
 *
 *   - traces run horizontal, vertical or 45 degrees, never at arbitrary
 *     angles, and corners are chamfered (see orthPath). The one exception is
 *     the jumper arcing over the seam, which is a physical wire, not copper;
 *   - width follows role: power bus thick, distribution medium, signal thin;
 *   - every trace flares into a TEARDROP where it meets a pad;
 *   - vias punctuate long runs, because a board with no vias looks fake;
 *   - pads are bare copper, so they sit lighter than mask-covered trace.
 *
 * Glow is faked with a single wide, very faint stroke rather than an SVG
 * blur filter. A Gaussian blur over a 4700x3560 region is the most expensive
 * thing you can ask a compositor to do, and a real trace has a sheen anyway,
 * not a halo.
 */

import { memo } from "react";
import { BUSES, CROSS_WIRES, NODES, SEAM, WORLD } from "@/lib/layout";
import {
  bboxOf,
  orthPath,
  pointsAlong,
  routed45,
  teardropPath,
  type Pt,
} from "@/lib/geometry";

/** Width by role. Uniform width is the giveaway; vary by what it carries. */
const WEIGHT = {
  main: { core: 7, halo: 16, dash: "20 32", dur: 3.4, via: 900 },
  branch: { core: 3.6, halo: 10, dash: "13 27", dur: 4.6, via: 760 },
  fine: { core: 2.2, halo: 7, dash: "8 22", dur: 5.8, via: 700 },
} as const;

const STUB_W = 2.4;
const PAD_R = 8.5;

/**
 * Geometry is fixed for the life of the page, so every path string, bounding
 * box and teardrop is computed ONCE at module scope. Re-renders then do no
 * arithmetic at all; they only flip opacities.
 */
const BUS_GEO = BUSES.map((bus) => ({
  bus,
  d: orthPath(bus.pts, bus.weight === "main" ? 40 : 26),
  vias: pointsAlong(bus.pts, WEIGHT[bus.weight].via, WEIGHT[bus.weight].via * 0.5),
  bb: bboxOf(bus.pts, 60),
}));

const STUB_GEO = NODES.filter((n) => n.wire).map((n) => {
  const wire = n.wire as Pt[];
  const pad = wire[wire.length - 1];
  const prev = wire[wire.length - 2] ?? wire[0];
  // The flare is short: a teardrop reaches about three pad radii back up the
  // trace, not all the way to the component.
  const seg = Math.hypot(prev[0] - pad[0], prev[1] - pad[1]) || 1;
  const reach = Math.min(seg * 0.9, PAD_R * 3.1);
  const from: Pt = [
    pad[0] + ((prev[0] - pad[0]) / seg) * reach,
    pad[1] + ((prev[1] - pad[1]) / seg) * reach,
  ];
  return { n, d: orthPath(wire, 14), pad, teardrop: teardropPath(from, pad, PAD_R) };
});

const CROSS_GEO = CROSS_WIRES.map((wire) => ({
  wire,
  d: orthPath(routed45(wire.a, wire.b), 18),
}));

const SEAM_ARC = `M ${SEAM.from} ${SEAM.crossY} C ${SEAM.from + 20} ${
  SEAM.crossY - 118
}, ${SEAM.to - 20} ${SEAM.crossY - 118}, ${SEAM.to} ${SEAM.crossY}`;

/**
 * The main bus is one long L-shaped run whose bounding box covers most of the
 * board, which would defeat the point of giving the current its own layer. So
 * for animation only it is cut into chunks at its corners: each chunk keeps
 * its own chamfer and gets a thin box of its own.
 *
 * Each chunk's dash phase is offset by the run length before it, so the
 * current still reads as one continuous flow through the corners.
 */
const MAIN_CHUNKS = (() => {
  const bus = BUSES.find((b) => b.id === "main");
  if (!bus) return [];
  const pts = bus.pts;
  const cuts: Pt[][] = [];
  for (let i = 0; i < pts.length - 1; i += 2) {
    cuts.push(pts.slice(i, Math.min(pts.length, i + 3)));
  }
  let run = 0;
  return cuts.map((chunk) => {
    const phase = run;
    for (let i = 1; i < chunk.length; i += 1) {
      run += Math.hypot(chunk[i][0] - chunk[i - 1][0], chunk[i][1] - chunk[i - 1][1]);
    }
    return { d: orthPath(chunk, 40), bb: bboxOf(chunk, 10), phase };
  });
})();

/* ========================================================================== */
/*  STATIC COPPER                                                             */
/* ========================================================================== */

/** Bare copper, so it sits lighter than the mask-covered trace feeding it. */
function Pad({ x, y, r = PAD_R }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="var(--color-copper-lit)" />;
}

function Via({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--color-copper-lit)" />
      <circle cx={x} cy={y} r={r * 0.42} fill="var(--color-board)" />
    </g>
  );
}

function StaticCopperImpl() {
  return (
    <>
      {/* ---- unlit trace bodies, widest first so joins read cleanly ------- */}
      {BUS_GEO.map(({ bus, d, vias }) => {
        const w = WEIGHT[bus.weight];
        return (
          <g key={`base-${bus.id}`}>
            {/* Only the main bus keeps a separate unlit body, because its lit
                state is a gradient and a gradient cannot be transitioned to
                from a flat colour. Every other run is one path. */}
            {bus.weight === "main" ? (
              <path
                d={d}
                fill="none"
                stroke="var(--color-copper)"
                strokeWidth={w.core}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {vias.map((p, i) => (
              <Via key={i} x={p[0]} y={p[1]} r={bus.weight === "main" ? 7 : 5.5} />
            ))}
          </g>
        );
      })}

      {/* ---- component stubs, their teardrops and their pads -------------- */}
      {STUB_GEO.map(({ n, pad, teardrop }) => (
        <g key={`stub-base-${n.id}`}>
          <path d={teardrop} fill="var(--color-copper)" opacity={0.95} />
          <Pad x={pad[0]} y={pad[1]} />
        </g>
      ))}

      {/* ---- fiducials: the optical targets a pick-and-place machine uses -- */}
      {(
        [
          [210, 210],
          [WORLD.w - 210, 210],
          [210, WORLD.h - 210],
        ] as Pt[]
      ).map(([x, y]) => (
        <g key={`fid-${x}-${y}`} opacity={0.5}>
          <circle cx={x} cy={y} r={16} fill="none" stroke="var(--color-silk)" strokeWidth={2} />
          <circle cx={x} cy={y} r={5} fill="var(--color-copper-lit)" />
          <path
            d={`M ${x - 30} ${y} h 18 M ${x + 12} ${y} h 18 M ${x} ${y - 30} v 18 M ${x} ${
              y + 12
            } v 18`}
            stroke="var(--color-silk)"
            strokeWidth={1.6}
          />
        </g>
      ))}

      {/* ---- mounting holes at the board corners -------------------------- */}
      {(
        [
          [110, 110],
          [WORLD.w - 110, 110],
          [110, WORLD.h - 110],
          [WORLD.w - 110, WORLD.h - 110],
        ] as Pt[]
      ).map(([x, y]) => (
        <g key={`hole-${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r={26}
            fill="none"
            stroke="var(--color-copper-lit)"
            strokeWidth={6}
            opacity={0.4}
          />
          <circle cx={x} cy={y} r={18} fill="var(--color-board)" />
        </g>
      ))}
    </>
  );
}

const StaticCopper = memo(StaticCopperImpl);

/* ========================================================================== */
/*  LIVE COPPER                                                               */
/* ========================================================================== */

export interface TracesProps {
  /** Highest camera stop reached so far; everything at or below is powered. */
  reached: number;
  /** Node currently hovered or focused: its stub and cross-wires go hot. */
  active: string | null;
}

/**
 * Each animated trace carries its bounding box as a data attribute. The camera
 * loop reads those once, then flips `data-idle` on the ones that have left the
 * viewport, so offscreen current stops animating without React ever running.
 */
function TracesImpl({ reached, active }: TracesProps) {
  const powered = reached >= 1;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={WORLD.w}
      height={WORLD.h}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* The copper changes material as it crosses the board: bronze on the
            physical half, a bead of hot solder at the seam, energised teal on
            the digital half. One user-space gradient does all of it. */}
        <linearGradient
          id="busGrad"
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={WORLD.w}
          y2={0}
        >
          <stop offset="0" stopColor="var(--color-physical)" />
          <stop offset={String((SEAM.from - 40) / WORLD.w)} stopColor="var(--color-physical)" />
          <stop offset={String(SEAM.mid / WORLD.w)} stopColor="var(--color-hot)" />
          <stop offset={String((SEAM.to + 40) / WORLD.w)} stopColor="var(--color-trace)" />
          <stop offset="1" stopColor="var(--color-trace)" />
        </linearGradient>
      </defs>

      <StaticCopper />

      {/* ---- energised overlay and the current itself --------------------- */}
      {BUS_GEO.map(({ bus, d }) => {
        const w = WEIGHT[bus.weight];
        const stroke = bus.weight === "main" ? "url(#busGrad)" : "var(--color-trace)";
        return (
          <g key={`live-${bus.id}`}>
            <path
              d={d}
              fill="none"
              stroke={powered ? stroke : "var(--color-copper)"}
              strokeWidth={w.core}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={bus.weight === "main" && powered ? 0.78 : 1}
              style={{ transition: "opacity 900ms ease, stroke 900ms ease" }}
            />
          </g>
        );
      })}

      {/* ---- THE CROSSOVER ------------------------------------------------
           The etched trace stops at the edge of the perfboard. What carries
           the current across is a jumper: a wire that leaves the surface of
           the board, arcs over the gap, and lands on the other side. This is
           the only curve on the board, and it has earned it. */}
      <g opacity={powered ? 1 : 0.28} style={{ transition: "opacity 900ms" }}>
        <rect
          x={SEAM.from}
          y={SEAM.crossY - 16}
          width={SEAM.to - SEAM.from}
          height={32}
          fill="var(--color-board)"
        />
        <path d={SEAM_ARC} fill="none" stroke="url(#busGrad)" strokeWidth={9} strokeLinecap="round" />
        {[SEAM.from, SEAM.to].map((x) => (
          <g key={x}>
            <circle cx={x} cy={SEAM.crossY} r={13} fill="var(--color-hot)" />
            <circle cx={x} cy={SEAM.crossY - 3} r={4.5} fill="var(--color-hot-hi)" />
          </g>
        ))}
      </g>

      {/* ---- energised stubs, and the reroute through whatever is active -- */}
      {STUB_GEO.map(({ n, d, pad }) => {
        const on = reached >= n.stop;
        const hot = active === n.id;
        return (
          <g key={`stub-live-${n.id}`}>
            <path
              d={d}
              fill="none"
              stroke={
                hot
                  ? "var(--color-hot)"
                  : on
                    ? "var(--color-trace)"
                    : "var(--color-copper)"
              }
              strokeWidth={hot ? 3.8 : STUB_W}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={on || !hot ? 1 : 0.6}
              style={{ transition: "stroke 600ms ease, stroke-width 200ms ease" }}
            />
            {hot ? (
              <circle cx={pad[0]} cy={pad[1]} r={PAD_R + 2.5} fill="var(--color-hot)" />
            ) : null}
          </g>
        );
      })}

      {/* ---- cross-wires: "this event produced this build" ----------------
           Routed straight then 45 degrees, like everything else. */}
      {CROSS_GEO.map(({ wire, d }) => {
        const hot = active === wire.from || active === wire.to;
        const on = reached >= 3;
        return (
          <g key={wire.id}>
            <path
              d={d}
              fill="none"
              stroke={hot ? "var(--color-hot)" : "var(--color-copper)"}
              strokeWidth={hot ? 3 : 1.8}
              strokeDasharray={hot ? undefined : "4 12"}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={on ? (hot ? 0.95 : 0.35) : 0}
              style={{ transition: "opacity 400ms ease, stroke-width 200ms ease" }}
            />

          </g>
        );
      })}
    </svg>
  );
}

export default memo(TracesImpl);

/* ========================================================================== */
/*  THE CURRENT                                                               */
/* ========================================================================== */

/**
 * Every animated trace lives in its OWN <svg> root, sized to that trace's
 * bounding box.
 *
 * This is the single most important performance decision on the board.
 * `stroke-dashoffset` is a paint property, not a compositor one, so animating
 * it invalidates the entire SVG root it belongs to. While the current shared a
 * root with the static copper, every frame repainted a 4700x3560 region dense
 * with geometry and the board sat at 12fps doing nothing at all. Split out
 * like this, a frame repaints one thin strip containing one path.
 *
 * The camera loop additionally flips `data-idle` on traces that have left the
 * viewport, which stops them repainting at all.
 */
function CurrentTrace({
  d,
  bb,
  stroke,
  width,
  dash,
  duration,
  delay = 0,
  opacity = 1,
}: {
  d: string;
  bb: { x: number; y: number; w: number; h: number };
  stroke: string;
  width: number;
  dash: string;
  duration: string;
  delay?: number;
  opacity?: number;
}) {
  const pad = width * 2 + 6;
  const x = bb.x - pad;
  const y = bb.y - pad;
  const w = bb.w + pad * 2;
  const h = bb.h + pad * 2;
  return (
    <svg
      className="pointer-events-none absolute"
      style={{ left: x, top: y, width: w, height: h }}
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="flowing"
        data-bbox={`${bb.x},${bb.y},${bb.w},${bb.h}`}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash}
        opacity={opacity}
        style={{ animationDuration: duration, animationDelay: `${delay}s` }}
      />
    </svg>
  );
}

function CurrentLayerImpl({ reached, active }: TracesProps) {
  const stub = active ? STUB_GEO.find((g) => g.n.id === active) : undefined;
  const cross = active
    ? CROSS_GEO.find((c) => c.wire.from === active || c.wire.to === active)
    : undefined;

  if (reached < 1) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {MAIN_CHUNKS.map((chunk, i) => {
        const w = WEIGHT.main;
        // Dash period is 52 world units and one cycle travels 1000 of them,
        // so a chunk starting `phase` units along the run begins that far in.
        const shift = ((chunk.phase % 52) / 1000) * w.dur;
        return (
          <CurrentTrace
            key={`cur-main-${i}`}
            d={chunk.d}
            bb={chunk.bb}
            stroke="var(--color-hot)"
            width={w.core * 0.8}
            dash={w.dash}
            duration={`calc(${w.dur}s / var(--flow))`}
            delay={-shift}
            opacity={0.92}
          />
        );
      })}

      {BUS_GEO.filter(({ bus }) => bus.id !== "main").map(({ bus, d, bb }, i) => {
        const w = WEIGHT[bus.weight];
        return (
          <CurrentTrace
            key={`cur-${bus.id}`}
            d={d}
            bb={bb}
            stroke="var(--color-hot)"
            width={w.core * 0.8}
            dash={w.dash}
            duration={`calc(${w.dur}s / var(--flow))`}
            delay={-i * 0.4}
            opacity={0.92}
          />
        );
      })}

      <CurrentTrace
        d={SEAM_ARC}
        bb={{ x: SEAM.from, y: SEAM.crossY - 120, w: SEAM.to - SEAM.from, h: 120 }}
        stroke="var(--color-hot-hi)"
        width={4.5}
        dash="10 26"
        duration="calc(2.2s / var(--flow))"
      />

      {stub ? (
        <CurrentTrace
          d={stub.d}
          bb={bboxOf(stub.n.wire as Pt[], 8)}
          stroke="var(--color-hot-hi)"
          width={2.8}
          dash="6 18"
          duration="1.1s"
        />
      ) : null}

      {cross ? (
        <CurrentTrace
          d={cross.d}
          bb={bboxOf([cross.wire.a, cross.wire.b], 24)}
          stroke="var(--color-hot-hi)"
          width={3.4}
          dash="10 190"
          duration="2s"
        />
      ) : null}
    </div>
  );
}

export const CurrentLayer = memo(CurrentLayerImpl);

