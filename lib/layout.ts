/**
 * ============================================================================
 *  THE BOARD -- world coordinates for every component, bus and camera stop.
 * ============================================================================
 *
 *  World units are CSS pixels at scale 1. The whole board lives inside
 *  WORLD.w x WORLD.h and the camera is a single CSS transform on top of it.
 *
 *  Reading the board left to right:
 *
 *    PHYSICAL HALF                 SEAM                 DIGITAL HALF
 *    x 0 ......................... 2150 ..................... 4700
 *    perfboard, real part          the crossover            etched copper,
 *    footprints, hardware          PHYSICAL // DIGITAL      IC footprints
 *
 *  Current enters at SW1 (bottom-left), splits at the origin junction, and
 *  reconverges at the output terminal:
 *
 *    SW1 -> BT1 (name) -> left spine -> SEAM CROSSOVER -> digital row bus
 *        -> right spine -> OUT1 (GitHub) -> TB1 (contact)
 *    SW1 -> bottom power rail -> J1..J7 (hackathons) -> TB1
 *
 *  CAMERA STOPS are framed RECTANGLES, not zoom levels, so the same rail works
 *  on a 380px phone and a 27" display. A stop may declare `mobileSplit`, which
 *  expands it into several tighter stops on small screens -- that is how the
 *  guided tour stays readable on a phone without a second layout.
 *
 *  ADDING A PROJECT: add it to `data/content.ts`, then give it a position in
 *  `PROJECT_SLOTS` below. Everything else (traces, stubs, minimap, keyboard
 *  order, document view) follows automatically.
 * ============================================================================
 */

import { hackathons, projects } from "@/data/content";
import type { Pt } from "@/lib/geometry";

export const WORLD = { w: 4700, h: 3560 };

/** The seam band. Left of MID is perfboard; right of it is etched copper. */
export const SEAM = { mid: 2150, from: 2050, to: 2250, crossY: 1420 };

/* -- bus geometry ---------------------------------------------------------- */

const SPINE_L = 1960; // physical-half vertical spine
const SPINE_D = 2360; // digital-half vertical spine
const SPINE_R = 4340; // digital-half right-hand return spine
const ROW_P1 = 1150; // physical row bus, upper
const ROW_P2 = 1900; // physical row bus, lower
const ROW_D1 = 620; // digital row bus, upper
const ROW_D2 = 1420; // digital row bus, lower -- continuous with the crossover
const RAIL_Y = 3250; // bottom power rail
const ORIGIN_X = 380; // the vertical run the ignition switch sits on
const AMP_Y = 2680; // the amplifier feed
const OUT_DROP = 3700; // output -> rail return

export interface Bus {
  id: string;
  pts: Pt[];
  /** "main" carries the primary current: brightest, fastest, always on. */
  weight: "main" | "branch" | "fine";
}

export const BUSES: Bus[] = [
  {
    // The primary artery. Ignition -> name -> up the physical spine ->
    // ACROSS THE SEAM -> along the digital half -> down into the output.
    id: "main",
    weight: "main",
    pts: [
      [ORIGIN_X, RAIL_Y],
      [ORIGIN_X, 2560],
      [SPINE_L, 2560],
      [SPINE_L, ROW_D2],
      [SPINE_D, ROW_D2],
      [SPINE_R, ROW_D2],
      [SPINE_R, 1930],
    ],
  },
  {
    // The bottom power rail: same origin, straight along the floor of the
    // board through every hackathon connector, into the output terminal.
    id: "rail",
    weight: "main",
    pts: [
      [ORIGIN_X, RAIL_Y],
      [3900, RAIL_Y],
    ],
  },
  {
    // Output returns to the rail, so the terminal is fed from both directions.
    id: "out-return",
    weight: "main",
    pts: [
      [OUT_DROP, 2490],
      [OUT_DROP, RAIL_Y],
    ],
  },
  { id: "spine-l-top", weight: "branch", pts: [[SPINE_L, ROW_D2], [SPINE_L, 380]] },
  { id: "row-p1", weight: "branch", pts: [[SPINE_L, ROW_P1], [340, ROW_P1]] },
  { id: "row-p2", weight: "branch", pts: [[SPINE_L, ROW_P2], [340, ROW_P2]] },
  { id: "spine-d", weight: "branch", pts: [[SPINE_D, ROW_D1], [SPINE_D, AMP_Y]] },
  { id: "row-d1", weight: "branch", pts: [[SPINE_D, ROW_D1], [SPINE_R, ROW_D1]] },
  { id: "spine-r", weight: "branch", pts: [[SPINE_R, ROW_D1], [SPINE_R, ROW_D2]] },
  // Amplifier feed: signal comes down the digital spine, through AMP1,
  // and leaves amplified into the output return.
  { id: "amp-in", weight: "branch", pts: [[SPINE_D, AMP_Y], [2540, AMP_Y]] },
  { id: "amp-out", weight: "branch", pts: [[3260, AMP_Y], [OUT_DROP, AMP_Y]] },
];

/* -- camera stops ---------------------------------------------------------- */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Stop {
  id: string;
  /** Silkscreen label shown in the HUD. */
  label: string;
  /** World rectangle the camera frames. */
  rect: Rect;
  /** Wider framing used at <=768px when the stop is not split. */
  mobileRect?: Rect;
  /** On small screens this stop becomes several tighter stops, in order. */
  mobileSplit?: Rect[];
  /** Skipped on small screens to keep the rail short. */
  desktopOnly?: boolean;
  /** Upper bound on zoom for this stop. */
  maxScale?: number;
}

export const STOPS: Stop[] = [
  {
    id: "boot",
    label: "Board unpowered",
    rect: { x: 0, y: 0, w: WORLD.w, h: WORLD.h },
    maxScale: 0.5,
  },
  {
    id: "ignite",
    label: "Ignition",
    rect: { x: 150, y: 2600, w: 900, h: 620 },
    maxScale: 1.15,
    // On a phone the switch reads clearly during the boot -> hero move; a
    // dedicated stop for it would only make the rail longer.
    desktopOnly: true,
  },
  {
    id: "hero",
    label: "Power source",
    rect: { x: 440, y: 2280, w: 1180, h: 700 },
    mobileRect: { x: 560, y: 2320, w: 720, h: 620 },
    maxScale: 1.05,
  },
  {
    id: "digital-a",
    label: "Digital half · agents",
    rect: { x: 2380, y: 210, w: 1860, h: 760 },
    mobileSplit: [
      // One column of the digital half at a time -- portrait rectangles, so a
      // phone frames a chip and the part wired beneath it together.
      { x: 2400, y: 230, w: 400, h: 730 },
      { x: 2820, y: 230, w: 400, h: 730 },
      { x: 3160, y: 230, w: 550, h: 730 },
      { x: 3540, y: 230, w: 650, h: 730 },
      { x: 3900, y: 690, w: 360, h: 700 },
    ],
    maxScale: 0.85,
  },
  {
    id: "digital-b",
    label: "Digital half · products",
    rect: { x: 2370, y: 1020, w: 1700, h: 780 },
    mobileSplit: [
      { x: 2400, y: 1030, w: 400, h: 730 },
      { x: 2820, y: 1030, w: 600, h: 730 },
      { x: 3570, y: 1030, w: 460, h: 730 },
      { x: 3240, y: 1500, w: 360, h: 700 },
    ],
    maxScale: 0.85,
  },
  {
    id: "physical",
    label: "Physical half · hardware",
    rect: { x: 460, y: 790, w: 1270, h: 1400 },
    mobileSplit: [
      { x: 520, y: 700, w: 440, h: 800 },
      { x: 1180, y: 700, w: 440, h: 800 },
      { x: 680, y: 1400, w: 500, h: 780 },
      { x: 520, y: 1880, w: 400, h: 660 },
      { x: 920, y: 1880, w: 400, h: 660 },
      { x: 1320, y: 1880, w: 400, h: 660 },
    ],
    maxScale: 0.9,
  },
  {
    id: "legend",
    label: "Silkscreen legend",
    rect: { x: 290, y: 275, w: 1610, h: 530 },
    mobileSplit: [
      { x: 320, y: 290, w: 450, h: 470 },
      { x: 760, y: 290, w: 450, h: 470 },
      { x: 1340, y: 280, w: 540, h: 240 },
      { x: 1340, y: 520, w: 540, h: 290 },
    ],
    maxScale: 0.95,
  },
  {
    id: "seam",
    label: "The crossover",
    rect: { x: 1680, y: 980, w: 940, h: 950 },
    mobileRect: { x: 1700, y: 1180, w: 900, h: 760 },
    maxScale: 1.1,
  },
  {
    id: "rail-a",
    label: "Hackathon rail · 2025–26",
    rect: { x: 340, y: 2890, w: 2060, h: 540 },
    mobileSplit: [
      { x: 400, y: 2880, w: 480, h: 560 },
      { x: 900, y: 2880, w: 480, h: 560 },
      { x: 1400, y: 2880, w: 480, h: 560 },
      { x: 1900, y: 2880, w: 480, h: 560 },
    ],
    maxScale: 0.9,
  },
  {
    id: "rail-b",
    label: "Hackathon rail · online",
    rect: { x: 2360, y: 2890, w: 1560, h: 540 },
    mobileSplit: [
      { x: 2400, y: 2880, w: 480, h: 560 },
      { x: 2900, y: 2880, w: 480, h: 560 },
      { x: 3400, y: 2880, w: 480, h: 560 },
    ],
    maxScale: 0.9,
  },
  {
    id: "amp",
    label: "Signal amplifier",
    rect: { x: 2480, y: 2440, w: 880, h: 520 },
    mobileRect: { x: 2530, y: 2420, w: 560, h: 800 },
    maxScale: 1.0,
  },
  {
    id: "output",
    label: "Live output",
    rect: { x: 3610, y: 1900, w: 700, h: 600 },
    mobileRect: { x: 3630, y: 1920, w: 660, h: 540 },
    maxScale: 1.0,
  },
  {
    id: "contact",
    label: "Open a connection",
    rect: { x: 3860, y: 3070, w: 640, h: 360 },
    mobileRect: { x: 3880, y: 3090, w: 620, h: 500 },
    maxScale: 1.2,
  },
];

export const stopIndex = (id: string) => STOPS.findIndex((s) => s.id === id);

/** A stop as it actually appears on the rail for the current viewport. */
export interface RailStop {
  id: string;
  /** id of the STOPS entry this came from -- what nodes power on against. */
  base: string;
  label: string;
  rect: Rect;
  maxScale?: number;
}

export function activeStops(isMobile: boolean): RailStop[] {
  const out: RailStop[] = [];
  for (const s of STOPS) {
    if (isMobile && s.desktopOnly) continue;
    if (isMobile && s.mobileSplit) {
      s.mobileSplit.forEach((rect, i) => {
        out.push({
          id: `${s.id}-${i}`,
          base: s.id,
          label: s.mobileSplit!.length > 1 ? `${s.label} ${i + 1}/${s.mobileSplit!.length}` : s.label,
          rect,
          maxScale: s.maxScale,
        });
      });
      continue;
    }
    out.push({
      id: s.id,
      base: s.id,
      label: s.label,
      rect: (isMobile && s.mobileRect) || s.rect,
      maxScale: s.maxScale,
    });
  }
  return out;
}

/* -- nodes ----------------------------------------------------------------- */

export type NodeKind =
  | "ignition"
  | "power"
  | "project"
  | "pin"
  | "amp"
  | "output"
  | "contact"
  | "legend"
  | "firmware"
  | "stamps"
  | "beacon";

export interface BoardNode {
  id: string;
  kind: NodeKind;
  /** Centre in world coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Index into STOPS -- powers on when the camera reaches this stop. */
  stop: number;
  /** Stub polyline from the component's pad out to a bus. */
  wire?: Pt[];
  /** Which side of the board the readout panel opens toward. */
  readout?: "left" | "right";
}

interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  bus: number;
  stop: string;
  readout?: "left" | "right";
}

/**
 * Hand-placed slots for every project. Components above a row bus stub down to
 * it, components below stub up. Sizes follow the footprint, and the grid is
 * spaced so no part ever sits on a spine.
 */
const PROJECT_SLOTS: Record<string, Slot> = {
  /* PHYSICAL half -- row P1 */
  breezebrain: { x: 740, y: 950, w: 400, h: 260, bus: ROW_P1, stop: "physical" },
  kivo: { x: 1400, y: 950, w: 400, h: 260, bus: ROW_P1, stop: "physical", readout: "left" },
  /* PHYSICAL half -- row P2 */
  rover: { x: 940, y: 1680, w: 460, h: 300, bus: ROW_P2, stop: "physical" },

  /* DIGITAL half -- row D1, above the bus */
  destiny: { x: 2600, y: 420, w: 340, h: 320, bus: ROW_D1, stop: "digital-a" },
  volo: { x: 3020, y: 420, w: 340, h: 320, bus: ROW_D1, stop: "digital-a" },
  vibecheck: { x: 3480, y: 455, w: 420, h: 250, bus: ROW_D1, stop: "digital-a" },
  "neural-flux": {
    x: 3960, y: 455, w: 420, h: 250, bus: ROW_D1, stop: "digital-a", readout: "left",
  },

  /* DIGITAL half -- row D1, below the bus */
  promptdeck: { x: 2560, y: 830, w: 280, h: 160, bus: ROW_D1, stop: "digital-a" },
  bytee: { x: 2940, y: 830, w: 280, h: 160, bus: ROW_D1, stop: "digital-a" },
  skypulse: { x: 3320, y: 830, w: 280, h: 160, bus: ROW_D1, stop: "digital-a" },
  casperguard: { x: 3700, y: 830, w: 280, h: 160, bus: ROW_D1, stop: "digital-a" },
  typeflow: {
    x: 4080, y: 830, w: 280, h: 160, bus: ROW_D1, stop: "digital-a", readout: "left",
  },

  /* DIGITAL half -- row D2, above the bus */
  vow: { x: 2600, y: 1220, w: 340, h: 320, bus: ROW_D2, stop: "digital-b" },
  "eurekahacks-portal": { x: 3180, y: 1255, w: 440, h: 250, bus: ROW_D2, stop: "digital-b" },
  "signal-lost": {
    x: 3800, y: 1255, w: 420, h: 250, bus: ROW_D2, stop: "digital-b", readout: "left",
  },

  /* DIGITAL half -- row D2, below the bus */
  "ml-from-scratch": { x: 2560, y: 1630, w: 280, h: 160, bus: ROW_D2, stop: "digital-b" },
  fraudgen: { x: 2980, y: 1630, w: 280, h: 160, bus: ROW_D2, stop: "digital-b" },
  soar: { x: 3400, y: 1630, w: 280, h: 160, bus: ROW_D2, stop: "digital-b" },
  aquapress: {
    x: 3820, y: 1630, w: 280, h: 160, bus: ROW_D2, stop: "digital-b", readout: "left",
  },
};

/** Vertical L-stub from a component edge to its row bus. */
function stubToBus(slot: Slot): Pt[] {
  const above = slot.y < slot.bus;
  const edgeY = above ? slot.y + slot.h / 2 : slot.y - slot.h / 2;
  return [
    [slot.x, edgeY],
    [slot.x, slot.bus],
  ];
}

const railPinX = (i: number) => 620 + i * 500;

function buildNodes(): BoardNode[] {
  const out: BoardNode[] = [];

  /* Narrative order matters: this is also the DOM and tab order. */

  out.push({
    id: "ignition",
    kind: "ignition",
    x: ORIGIN_X,
    y: 2900,
    w: 200,
    h: 150,
    stop: stopIndex("ignite"),
  });

  out.push({
    id: "hero",
    kind: "power",
    x: 900,
    y: 2560,
    w: 640,
    h: 420,
    stop: stopIndex("hero"),
    // The name feeds the bottom rail as well as the spine.
    wire: [
      [900, 2770],
      [900, RAIL_Y],
    ],
  });

  for (const p of projects) {
    const slot = PROJECT_SLOTS[p.id];
    if (!slot) continue;
    out.push({
      id: p.id,
      kind: "project",
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      stop: stopIndex(slot.stop),
      wire: stubToBus(slot),
      readout: slot.readout ?? "right",
    });
  }

  hackathons.forEach((h, i) => {
    const x = railPinX(i);
    out.push({
      id: h.id,
      kind: "pin",
      x,
      y: 3050,
      w: 440,
      h: 270,
      stop: stopIndex(i < 4 ? "rail-a" : "rail-b"),
      wire: [
        [x, 3185],
        [x, RAIL_Y],
      ],
    });
  });

  out.push({
    id: "amp",
    kind: "amp",
    x: 2900,
    y: AMP_Y,
    w: 720,
    h: 380,
    stop: stopIndex("amp"),
  });

  out.push({
    id: "legend",
    kind: "legend",
    x: 760,
    y: 530,
    w: 880,
    h: 440,
    stop: stopIndex("legend"),
    // Drops down the far left so the stub never crosses a component.
    wire: [
      [400, 750],
      [400, ROW_P1],
    ],
  });

  out.push({
    id: "firmware",
    kind: "firmware",
    x: 1600,
    y: 395,
    w: 520,
    h: 210,
    stop: stopIndex("legend"),
    wire: [
      [1860, 400],
      [SPINE_L, 400],
    ],
  });

  out.push({
    id: "stamps",
    kind: "stamps",
    x: 1600,
    y: 665,
    w: 520,
    h: 270,
    stop: stopIndex("legend"),
    wire: [
      [1860, 665],
      [SPINE_L, 665],
    ],
  });

  [0, 1, 2].forEach((i) => {
    const x = 700 + i * 400;
    out.push({
      id: `beacon-${i}`,
      kind: "beacon",
      x,
      y: 2060,
      w: 320,
      h: 180,
      stop: stopIndex("physical"),
      wire: [
        [x, 1970],
        [x, ROW_P2],
      ],
    });
  });

  out.push({
    id: "output",
    kind: "output",
    x: 3960,
    y: 2210,
    w: 640,
    h: 560,
    stop: stopIndex("output"),
  });

  out.push({
    id: "contact",
    kind: "contact",
    x: 4180,
    y: RAIL_Y,
    w: 560,
    h: 270,
    stop: stopIndex("contact"),
  });

  return out;
}

export const NODES: BoardNode[] = buildNodes();

export const nodeById = (id: string): BoardNode | undefined =>
  NODES.find((n) => n.id === id);

/* -- cross-wires: "this event produced this build" ------------------------- */

export interface CrossWire {
  id: string;
  from: string;
  to: string;
  a: Pt;
  b: Pt;
}

export const CROSS_WIRES: CrossWire[] = projects
  .filter((p) => p.origin)
  .map((p) => {
    const src = nodeById(p.origin as string);
    const dst = nodeById(p.id);
    if (!src || !dst) return null;
    return {
      id: `${p.origin}--${p.id}`,
      from: p.origin as string,
      to: p.id,
      // Leaves the top of the connector pin, arrives at the bottom of the chip.
      a: [src.x, src.y - src.h / 2] as Pt,
      b: [dst.x, dst.y + dst.h / 2] as Pt,
    };
  })
  .filter((w): w is CrossWire => w !== null);

/* -- camera maths ---------------------------------------------------------- */

export interface CameraState {
  x: number;
  y: number;
  s: number;
}

/**
 * Frame a world rectangle inside a viewport. Because stops are rectangles
 * rather than fixed zoom levels, the same rail reads correctly on a 380px
 * phone and on a 2560px display without a second set of numbers.
 */
export function frame(
  rect: Rect,
  vw: number,
  vh: number,
  maxScale = 1,
  pad = 0.92,
): CameraState {
  const s = Math.min((vw / rect.w) * pad, (vh / rect.h) * pad, maxScale);
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, s: Math.max(s, 0.04) };
}

export function stopCamera(
  stop: RailStop,
  vw: number,
  vh: number,
  isMobile: boolean,
): CameraState {
  return frame(stop.rect, vw, vh, stop.maxScale ?? 1, isMobile ? 0.94 : 0.92);
}
