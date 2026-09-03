"use client";

/**
 * MINIMAP -- a schematic of the whole board with the current viewport on it.
 * Only shown in free-roam, where it is the difference between exploring and
 * being lost. Click anywhere on it to fly there.
 */

import type { RefObject } from "react";
import { BUSES, NODES, SEAM, WORLD } from "@/lib/layout";
import { orthPath } from "@/lib/geometry";

const MAP_W = 232;
const MAP_H = Math.round((WORLD.h / WORLD.w) * MAP_W);

export default function Minimap({
  viewRef,
  onJump,
  active,
}: {
  viewRef: RefObject<SVGRectElement | null>;
  onJump: (x: number, y: number) => void;
  active: string | null;
}) {
  return (
    <div
      className="border border-copper bg-board/92 p-2"
      style={{ boxShadow: "0 18px 50px rgba(0,0,0,.7)" }}
    >
      <p className="silk m-0 mb-1.5 flex justify-between">
        <span>Board map</span>
        <span style={{ color: "var(--color-hot)" }}>Free roam</span>
      </p>
      <svg
        width={MAP_W}
        height={MAP_H}
        viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
        className="block cursor-crosshair"
        role="img"
        aria-label="Map of the board showing the current viewport. Click to move the camera."
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onJump(
            ((e.clientX - r.left) / r.width) * WORLD.w,
            ((e.clientY - r.top) / r.height) * WORLD.h,
          );
        }}
      >
        <rect width={WORLD.w} height={WORLD.h} fill="var(--color-board-2)" />
        <rect
          x={SEAM.from}
          width={SEAM.to - SEAM.from}
          height={WORLD.h}
          fill="var(--color-hot)"
          opacity={0.28}
        />
        {BUSES.map((b) => (
          <path
            key={b.id}
            d={orthPath(b.pts, 20)}
            fill="none"
            stroke="var(--color-copper)"
            strokeWidth={b.weight === "main" ? 16 : 9}
          />
        ))}
        {NODES.map((n) => (
          <rect
            key={n.id}
            x={n.x - n.w / 2}
            y={n.y - n.h / 2}
            width={n.w}
            height={n.h}
            fill={
              active === n.id
                ? "var(--color-hot)"
                : n.x < SEAM.mid
                  ? "var(--color-physical)"
                  : "var(--color-trace)"
            }
            opacity={active === n.id ? 1 : 0.55}
          />
        ))}
        <rect
          ref={viewRef}
          x={0}
          y={0}
          width={100}
          height={100}
          fill="var(--color-hot)"
          fillOpacity={0.1}
          stroke="var(--color-hot)"
          strokeWidth={22}
        />
      </svg>
    </div>
  );
}
