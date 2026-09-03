"use client";

/**
 * THE SUBSTRATE -- two halves of board and the seam that joins them.
 *
 * Left of the seam is perfboard: drilled phenolic, hand-built, physical.
 * Right of it is etched copper: fabricated, precise, digital.
 *
 * The seam is the whole argument of the site, so it is drawn deliberately: a
 * torn perfboard edge on one side, an etch-resist edge on the other, a column
 * of stitching vias down the middle, and real selectable labels either side of
 * the point where the current crosses.
 */

import { SEAM, WORLD } from "@/lib/layout";

export default function Substrate({ reached }: { reached: number }) {
  const powered = reached >= 1;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* ---- physical half: perfboard ------------------------------------ */}
      <div
        className="tex-perfboard absolute top-0 left-0 h-full"
        style={{
          width: SEAM.mid,
          opacity: powered ? 0.95 : 0.4,
          transition: "opacity 1200ms ease",
        }}
      />

      {/* ---- digital half: etched copper --------------------------------- */}
      <div
        className="tex-etched absolute top-0 h-full"
        style={{
          left: SEAM.mid,
          width: WORLD.w - SEAM.mid,
          opacity: powered ? 0.95 : 0.4,
          transition: "opacity 1200ms ease",
        }}
      />

      {/* ---- ground pour glow, driven by board voltage -------------------- */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 82%, color-mix(in oklab, var(--color-hot) calc(var(--voltage) * 10%), transparent) 0%, transparent 55%), radial-gradient(90% 80% at 84% 55%, color-mix(in oklab, var(--color-trace) calc(var(--voltage) * 11%), transparent) 0%, transparent 60%)",
          opacity: powered ? 1 : 0.15,
          transition: "opacity 1600ms ease",
        }}
      />

      {/* ---- the seam ---------------------------------------------------- */}
      <div
        className="absolute top-0 h-full"
        style={{ left: SEAM.from, width: SEAM.to - SEAM.from }}
      >
        {/* the board is cut here: bare substrate, no copper pour */}
        <div className="absolute inset-0" style={{ background: "var(--color-board)" }} />

        {/* torn perfboard edge on the left, etch resist on the right */}
        <div
          className="absolute inset-y-0 -left-1 w-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, color-mix(in oklab, var(--color-physical) 75%, transparent) 0 9px, transparent 9px 22px)",
          }}
        />
        <div
          className="absolute inset-y-0 -right-1 w-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, color-mix(in oklab, var(--color-trace) 60%, transparent) 0 26px, transparent 26px 10px)",
          }}
        />

        {/* stitching vias down the centre of the cut */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--color-copper) 90%, transparent) 0 4px, transparent 4.6px)",
            backgroundSize: "100% 96px",
            backgroundPosition: "center top",
            opacity: powered ? 0.9 : 0.4,
            transition: "opacity 1200ms ease",
          }}
        />
      </div>

      {/* ---- the two halves, named, standing either side of the cut ------
           Set vertically on the flanks of the seam the way board-edge
           silkscreen actually runs, and clear of every trace and part. */}
      <p
        className="absolute m-0 text-center"
        style={{
          left: SEAM.from - 82,
          top: SEAM.crossY - 420,
          width: 60,
          writingMode: "vertical-rl",
          fontSize: 38,
          letterSpacing: "0.24em",
          color: "color-mix(in oklab, var(--color-physical) 82%, transparent)",
        }}
      >
        PHYSICAL
      </p>
      <p
        className="absolute m-0 text-center"
        style={{
          left: SEAM.to + 24,
          top: SEAM.crossY - 400,
          width: 60,
          writingMode: "vertical-rl",
          fontSize: 38,
          letterSpacing: "0.24em",
          color: "color-mix(in oklab, var(--color-trace) 78%, transparent)",
        }}
      >
        DIGITAL
      </p>

      {/* ---- crossover callout, sitting just under the jumper ------------- */}
      <div
        className="absolute"
        style={{ left: SEAM.mid - 560, top: SEAM.crossY + 62, width: 1120 }}
      >
        <p
          className="m-0 text-center uppercase"
          style={{
            fontSize: 21,
            letterSpacing: "0.3em",
            color: "var(--color-silk)",
          }}
        >
          Crossover 01
        </p>
        <p
          className="m-0 mt-3 text-center"
          style={{ fontSize: 17, letterSpacing: "0.08em", color: "var(--color-silk-dim)" }}
        >
          the copper stops and a wire carries it across
        </p>
      </div>

      {/* ---- repeated silkscreen along the seam, for texture -------------- */}
      {[-2, -1, 1, 2].map((k) => (
        <div
          key={k}
          className="absolute"
          style={{
            left: SEAM.from,
            top: SEAM.crossY + k * 760 - 180,
            width: SEAM.to - SEAM.from,
          }}
        >
          <p
            className="m-0 text-center"
            style={{
              writingMode: "vertical-rl",
              fontSize: 15,
              letterSpacing: "0.5em",
              color: "color-mix(in oklab, var(--color-silk) 34%, transparent)",
            }}
          >
            PHYSICAL // DIGITAL
          </p>
        </div>
      ))}

      {/* ---- board edge and grain ---------------------------------------- */}
      <div
        className="absolute inset-0"
        style={{
          border: "2px solid color-mix(in oklab, var(--color-copper) 80%, transparent)",
          boxShadow: "inset 0 0 90px rgba(0,0,0,.75)",
        }}
      />
      <div className="tex-grain absolute inset-0" style={{ opacity: 0.7 }} />
    </div>
  );
}
