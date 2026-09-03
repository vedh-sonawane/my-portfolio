"use client";

/**
 * NODE SHELL -- positions one component in world space and handles its
 * power-on. The reveal is sequenced (trace, then body, then text) rather than
 * everything appearing at once, because a board section coming up under load
 * is the single most satisfying thing this metaphor can do.
 */

import type { CSSProperties, ReactNode } from "react";
import type { BoardNode } from "@/lib/layout";

export interface NodeProps {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Accessible label for the whole component. */
  label: string;
  /** Rendered outside the footprint when the part is hovered or focused. */
  readout?: ReactNode;
  /** Readout width in world units. */
  readoutWidth?: number;
  /** Opacity before this node's stop is reached. */
  dimOpacity?: number;
}

export default function Node({
  node,
  reached,
  active,
  onActivate,
  children,
  className = "",
  style,
  label,
  readout,
  readoutWidth = 420,
  dimOpacity = 0.22,
}: NodeProps) {
  const powered = reached >= node.stop;
  const hot = active === node.id;
  const side = node.readout ?? "right";

  return (
    <article
      id={`node-${node.id}`}
      data-node={node.id}
      aria-label={label}
      tabIndex={0}
      onPointerEnter={() => onActivate(node.id)}
      onPointerLeave={() => onActivate(null)}
      onFocus={() => onActivate(node.id)}
      onBlur={(e) => {
        // Keep the readout open while focus moves into it (e.g. onto a link).
        if (!e.currentTarget.contains(e.relatedTarget as globalThis.Node | null))
          onActivate(null);
      }}
      className={`absolute ${className}`}
      style={{
        left: node.x - node.w / 2,
        top: node.y - node.h / 2,
        width: node.w,
        height: node.h,
        zIndex: hot ? 60 : 10,
        opacity: powered ? 1 : dimOpacity,
        filter: powered ? "none" : "saturate(0.2)",
        transform: powered ? "none" : "translateY(6px)",
        transition:
          "opacity 700ms cubic-bezier(.2,.7,.3,1) 220ms, transform 700ms cubic-bezier(.2,.7,.3,1) 220ms, filter 700ms ease 220ms",
        ...style,
      }}
    >
      {children}

      {readout ? (
        <div
          className="absolute top-0"
          style={{
            [side === "right" ? "left" : "right"]: "calc(100% + 42px)",
            width: readoutWidth,
            opacity: hot ? 1 : 0,
            transform: hot
              ? "translateX(0)"
              : `translateX(${side === "right" ? -14 : 14}px)`,
            transition: "opacity 240ms ease, transform 240ms cubic-bezier(.2,.7,.3,1)",
            pointerEvents: hot ? "auto" : "none",
          }}
          aria-hidden={!hot}
        >
          {/* the readout is wired to the part, not floating over it */}
          <div
            className="absolute top-6 h-px"
            style={{
              [side === "right" ? "right" : "left"]: "100%",
              width: 42,
              background: "var(--color-hot)",
            }}
          />
          <div
            className="absolute top-6 h-2 w-2 -translate-y-1/2 rounded-full"
            style={{
              [side === "right" ? "right" : "left"]: "calc(100% + 38px)",
              background: "var(--color-hot)",
            }}
          />
          {readout}
        </div>
      ) : null}
    </article>
  );
}

/** Shared chrome for a readout panel: a probe screen, not a modal. */
export function Readout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="border border-hot/45 bg-board/95 p-4"
      style={{ boxShadow: "0 0 0 1px rgba(255,157,61,.10), 0 18px 60px rgba(0,0,0,.8)" }}
    >
      <p className="silk mb-2" style={{ color: "var(--color-hot)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}
