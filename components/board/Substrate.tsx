"use client";

/**
 * THE SUBSTRATE: two halves of board and the seam that joins them.
 *
 * Left of the seam is perfboard: drilled phenolic, hand-built, physical.
 * Right of it is etched copper: fabricated, precise, digital.
 *
 * There is no empty black anywhere, because a real board floods its unrouted
 * area with a hatched copper GROUND POUR. Each half gets a pour tinted to its
 * own copper, tiled from a 32px SVG so the browser rasterises one small tile
 * instead of evaluating a gradient across sixteen million pixels.
 *
 * The seam is the argument the whole site is making, so it is drawn
 * deliberately: a torn perfboard edge on one side, an etch-resist edge on the
 * other, stitching vias down the middle, and the tagline printed across it.
 */

import { identity } from "@/data/content";
import { SEAM, WORLD } from "@/lib/layout";

export default function Substrate({ reached }: { reached: number }) {
  const powered = reached >= 1;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* ---- physical half: perfboard over a warm copper pour ------------- */}
      <div
        className="tex-pour-physical absolute top-0 left-0 h-full"
        style={{
          width: SEAM.mid,
          opacity: powered ? 1 : 0.5,
          transition: "opacity 1200ms ease",
        }}
      />

      {/* ---- digital half: etched copper over a cross-hatched pour -------- */}
      <div
        className="tex-pour-digital absolute top-0 h-full"
        style={{
          left: SEAM.mid,
          width: WORLD.w - SEAM.mid,
          opacity: powered ? 1 : 0.5,
          transition: "opacity 1200ms ease",
        }}
      />

      {/* ---- the light falling on the board, driven by board voltage ------
           One gradient, not three. It is the sheen of a mask under a lamp,
           not a glow effect. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 95% at 16% 78%, color-mix(in oklab, var(--color-physical) calc(var(--voltage) * 7%), transparent) 0%, transparent 58%)",
          opacity: powered ? 1 : 0.2,
          transition: "opacity 1600ms ease",
        }}
      />

      {/* ---- silkscreen watermark, printed into the pour ------------------ */}
      <p
        className="desig-silk absolute m-0"
        style={{
          left: 2620,
          top: 2200,
          fontSize: 230,
          lineHeight: 1,
          opacity: 0.028,
          letterSpacing: "0.08em",
        }}
      >
        CURRENT
      </p>

      {/* ---- the seam ---------------------------------------------------- */}
      <div
        className="absolute top-0 h-full"
        style={{ left: SEAM.from, width: SEAM.to - SEAM.from }}
      >
        {/* the board is cut here: bare substrate, no copper pour at all */}
        <div className="absolute inset-0" style={{ background: "var(--color-board)" }} />

        {/* torn perfboard edge on the left, etch resist on the right */}
        <div
          className="absolute inset-y-0 -left-1 w-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, color-mix(in oklab, var(--color-physical) 70%, transparent) 0 9px, transparent 9px 22px)",
          }}
        />
        <div
          className="absolute inset-y-0 -right-1 w-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, color-mix(in oklab, var(--color-trace) 55%, transparent) 0 26px, transparent 26px 10px)",
          }}
        />

        {/* stitching vias down the centre of the cut */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-copper) 0 4px, transparent 4.6px)",
            backgroundSize: "100% 96px",
            backgroundPosition: "center top",
            opacity: powered ? 0.8 : 0.35,
            transition: "opacity 1200ms ease",
          }}
        />
      </div>

      {/* ---- the two halves, named, standing either side of the cut ------- */}
      <p
        className="desig-silk absolute m-0 text-center"
        style={{
          left: SEAM.from - 82,
          top: SEAM.crossY - 400,
          width: 60,
          writingMode: "vertical-rl",
          fontSize: 34,
          letterSpacing: "0.2em",
          color: "var(--color-physical)",
          opacity: 0.62,
        }}
      >
        PHYSICAL
      </p>
      <p
        className="desig-silk absolute m-0 text-center"
        style={{
          left: SEAM.to + 24,
          top: SEAM.crossY - 380,
          width: 60,
          writingMode: "vertical-rl",
          fontSize: 34,
          letterSpacing: "0.2em",
          color: "var(--color-trace)",
          opacity: 0.62,
        }}
      >
        DIGITAL
      </p>

      {/* ---- THE TAGLINE, printed across the crossover --------------------
           This is the one place on the board where the sentence and the
           picture say the same thing, so it belongs here and nowhere else. */}
      <p
        className="desig-silk absolute m-0 text-center"
        style={{
          left: SEAM.mid - 300,
          top: SEAM.crossY + 58,
          width: 600,
          fontSize: 19,
          letterSpacing: "0.24em",
          opacity: 0.55,
        }}
      >
        CROSSOVER 01
      </p>

      <div
        className="absolute"
        style={{ left: SEAM.mid - 500, top: SEAM.crossY + 320, width: 1000 }}
      >
        <p
          className="font-display m-0 text-center"
          style={{ fontSize: 44, lineHeight: 1.15, color: "var(--color-silk)" }}
        >
          {identity.tagline}
        </p>
        <p
          className="desig-silk m-0 mt-4 text-center"
          style={{ fontSize: 16, letterSpacing: "0.06em", opacity: 0.5 }}
        >
          the etched copper stops here and a soldered wire carries it across
        </p>
      </div>

      {/* ---- repeated seam silkscreen, for texture ------------------------ */}
      {[-2, -1, 1, 2].map((k) => (
        <div
          key={k}
          className="absolute"
          style={{
            left: SEAM.from,
            top: SEAM.crossY + k * 780 - 180,
            width: SEAM.to - SEAM.from,
          }}
        >
          <p
            className="desig-silk m-0 text-center"
            style={{
              writingMode: "vertical-rl",
              fontSize: 13,
              letterSpacing: "0.3em",
              opacity: 0.24,
            }}
          >
            PHYSICAL // DIGITAL
          </p>
        </div>
      ))}

      {/* ---- board edge -------------------------------------------------- */}
      <div
        className="absolute inset-0"
        style={{
          border: "2px solid color-mix(in oklab, var(--color-copper) 90%, transparent)",
        }}
      />
    </div>
  );
}
