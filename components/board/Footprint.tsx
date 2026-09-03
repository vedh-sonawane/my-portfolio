"use client";

/**
 * COMPONENT FOOTPRINTS.
 *
 * Nothing on this board is a card. Every project is drawn as the part it would
 * be if you could pick it up: an IC with legs on the digital half, a motor
 * driver with screw terminals or a fan header on the physical half. The pins
 * are where the stub trace lands, so the geometry is not decoration -- it is
 * the reason the wiring looks right.
 */

import type { Footprint as FootprintKind } from "@/data/content";

export interface FootprintProps {
  kind: FootprintKind;
  w: number;
  h: number;
  /** 0 = unpowered silkscreen only, 1 = fully lit. */
  lit: number;
  hot: boolean;
}

/** Text insets per footprint, so labels never sit on top of the leads. */
export const INSET: Record<FootprintKind, [number, number, number, number]> = {
  //          top  right bottom left
  dip: [16, 34, 16, 34],
  soic: [12, 26, 12, 26],
  qfp: [36, 36, 36, 36],
  module: [16, 18, 40, 18],
  driver: [50, 48, 18, 18],
  fan: [16, 18, 18, 18],
};

const pinFill = (lit: number, hot: boolean) =>
  hot ? "var(--color-hot)" : lit > 0.5 ? "var(--color-trace)" : "var(--color-copper)";

function Pins({
  count,
  from,
  to,
  axis,
  at,
  len,
  lit,
  hot,
}: {
  count: number;
  from: number;
  to: number;
  axis: "x" | "y";
  at: number;
  len: number;
  lit: number;
  hot: boolean;
}) {
  const span = to - from;
  const step = span / count;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const c = from + step * (i + 0.5);
        const thick = Math.min(9, Math.max(4, step * 0.42));
        return axis === "y" ? (
          <rect
            key={i}
            x={at}
            y={c - thick / 2}
            width={len}
            height={thick}
            rx={1.5}
            fill={pinFill(lit, hot)}
            opacity={hot ? 1 : 0.55 + lit * 0.45}
          />
        ) : (
          <rect
            key={i}
            x={c - thick / 2}
            y={at}
            width={thick}
            height={len}
            rx={1.5}
            fill={pinFill(lit, hot)}
            opacity={hot ? 1 : 0.55 + lit * 0.45}
          />
        );
      })}
    </>
  );
}

export default function Footprint({ kind, w, h, lit, hot }: FootprintProps) {
  const silk = hot ? "var(--color-hot)" : "var(--color-silk)";
  const bodyFill = "var(--color-mask)";
  const outline = { stroke: silk, strokeWidth: 2, fill: "none" as const };

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ transition: "opacity 500ms ease", opacity: 0.35 + lit * 0.65 }}
    >
      {kind === "dip" ? (
        <>
          <Pins count={8} from={14} to={h - 14} axis="y" at={2} len={26} lit={lit} hot={hot} />
          <Pins count={8} from={14} to={h - 14} axis="y" at={w - 28} len={26} lit={lit} hot={hot} />
          <rect x={28} y={4} width={w - 56} height={h - 8} rx={3} fill={bodyFill} />
          <rect x={28} y={4} width={w - 56} height={h - 8} rx={3} {...outline} />
          {/* pin-1 marker */}
          <circle cx={46} cy={22} r={4} fill={silk} />
        </>
      ) : null}

      {kind === "soic" ? (
        <>
          <Pins count={6} from={10} to={h - 10} axis="y" at={2} len={18} lit={lit} hot={hot} />
          <Pins count={6} from={10} to={h - 10} axis="y" at={w - 20} len={18} lit={lit} hot={hot} />
          <rect x={20} y={4} width={w - 40} height={h - 8} rx={2} fill={bodyFill} />
          <rect x={20} y={4} width={w - 40} height={h - 8} rx={2} {...outline} />
          <circle cx={33} cy={17} r={3.5} fill={silk} />
        </>
      ) : null}

      {kind === "qfp" ? (
        <>
          <Pins count={9} from={30} to={h - 30} axis="y" at={4} len={24} lit={lit} hot={hot} />
          <Pins count={9} from={30} to={h - 30} axis="y" at={w - 28} len={24} lit={lit} hot={hot} />
          <Pins count={9} from={30} to={w - 30} axis="x" at={4} len={24} lit={lit} hot={hot} />
          <Pins count={9} from={30} to={w - 30} axis="x" at={h - 28} len={24} lit={lit} hot={hot} />
          <rect x={28} y={28} width={w - 56} height={h - 56} rx={4} fill={bodyFill} />
          <rect x={28} y={28} width={w - 56} height={h - 56} rx={4} {...outline} />
          <circle cx={48} cy={48} r={7} fill="none" stroke={silk} strokeWidth={2} />
          <circle cx={48} cy={48} r={3} fill={silk} />
        </>
      ) : null}

      {kind === "module" ? (
        <>
          {/* breakout PCB with a header along the bottom */}
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} fill={bodyFill} />
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} {...outline} />
          {[
            [18, 18],
            [w - 18, 18],
            [18, h - 18],
            [w - 18, h - 18],
          ].map(([cx, cy]) => (
            <g key={`${cx}-${cy}`}>
              <circle cx={cx} cy={cy} r={7} fill="none" stroke={silk} strokeWidth={2} />
              <circle cx={cx} cy={cy} r={2.5} fill="var(--color-board)" />
            </g>
          ))}
          {Array.from({ length: 8 }, (_, i) => {
            const x = w / 2 - 4 * 26 + i * 26 + 13;
            return (
              <g key={i}>
                <rect
                  x={x - 8}
                  y={h - 30}
                  width={16}
                  height={16}
                  rx={2}
                  fill="none"
                  stroke={pinFill(lit, hot)}
                  strokeWidth={2}
                />
                <circle cx={x} cy={h - 22} r={3.5} fill={pinFill(lit, hot)} />
              </g>
            );
          })}
        </>
      ) : null}

      {kind === "driver" ? (
        <>
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} fill={bodyFill} />
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} {...outline} />
          {/* screw terminals across the top */}
          {Array.from({ length: 4 }, (_, i) => {
            const bw = (w - 40) / 4;
            const x = 20 + i * bw;
            return (
              <g key={i}>
                <rect
                  x={x + 4}
                  y={12}
                  width={bw - 8}
                  height={26}
                  rx={2}
                  fill="none"
                  stroke={pinFill(lit, hot)}
                  strokeWidth={2}
                />
                <line
                  x1={x + bw / 2 - 6}
                  y1={25}
                  x2={x + bw / 2 + 6}
                  y2={25}
                  stroke={pinFill(lit, hot)}
                  strokeWidth={2.5}
                />
              </g>
            );
          })}
          {/* heatsink hatch down the right edge */}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={i}
              x1={w - 34 + i * 5}
              y1={52}
              x2={w - 34 + i * 5}
              y2={h - 16}
              stroke={silk}
              strokeWidth={1.5}
              opacity={0.5}
            />
          ))}
        </>
      ) : null}

      {kind === "fan" ? (
        <>
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} fill={bodyFill} />
          <rect x={4} y={4} width={w - 8} height={h - 8} rx={3} {...outline} />
          {[
            [20, 20],
            [w - 20, 20],
            [20, h - 20],
            [w - 20, h - 20],
          ].map(([cx, cy]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={6}
              fill="none"
              stroke={silk}
              strokeWidth={2}
            />
          ))}
          {/* rotor, top-right */}
          <g transform={`translate(${w - 62} 62)`}>
            <circle r={44} fill="none" stroke={silk} strokeWidth={2} opacity={0.6} />
            {Array.from({ length: 5 }, (_, i) => (
              <path
                key={i}
                d="M 0 0 Q 26 -10 40 6"
                fill="none"
                stroke={pinFill(lit, hot)}
                strokeWidth={2.5}
                transform={`rotate(${i * 72})`}
                opacity={0.8}
              />
            ))}
            <circle r={9} fill={pinFill(lit, hot)} />
          </g>
        </>
      ) : null}
    </svg>
  );
}
