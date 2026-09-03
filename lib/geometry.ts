export type Pt = [number, number];

/**
 * Build an SVG path from an orthogonal polyline, cutting each corner with a
 * 45-degree chamfer. Real PCB routers do exactly this -- right-angle copper
 * corners are avoided because they etch badly -- so it is also the fastest way
 * to make a drawing read as a board rather than as a flowchart.
 */
export function orthPath(pts: Pt[], radius = 22): string {
  if (pts.length < 2) return "";
  const out: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];

  for (let i = 1; i < pts.length - 1; i += 1) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];

    const d1 = Math.hypot(x - px, y - py);
    const d2 = Math.hypot(nx - x, ny - y);
    if (d1 === 0 || d2 === 0) continue;

    const r1 = Math.min(radius, d1 / 2);
    const r2 = Math.min(radius, d2 / 2);

    out.push(
      `L ${x - ((x - px) / d1) * r1} ${y - ((y - py) / d1) * r1}`,
      `L ${x + ((nx - x) / d2) * r2} ${y + ((ny - y) / d2) * r2}`,
    );
  }

  const last = pts[pts.length - 1];
  out.push(`L ${last[0]} ${last[1]}`);
  return out.join(" ");
}

/**
 * Route between two far-apart points the way a board actually routes: one
 * straight run, then a single 45-degree leg into the target. No arbitrary
 * angles, no freehand curves. Used for the event -> project cross-wires.
 */
export function routed45(a: Pt, b: Pt): Pt[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const run = Math.min(Math.abs(dx), Math.abs(dy));
  if (run === 0) return [a, b];
  const knee: Pt =
    Math.abs(dy) >= Math.abs(dx)
      ? [a[0], b[1] - sy * run]
      : [b[0] - sx * run, a[1]];
  return [a, knee, b];
}

/**
 * A TEARDROP: the flare where a trace enters a pad. Real fabrication adds it
 * so the joint survives drill misalignment, and its absence is the single
 * biggest tell that a drawing is decorative rather than fabricated.
 *
 * Returns the tangent triangle from the incoming trace to the pad circle;
 * filled in copper behind the pad, it reads as one continuous flare.
 */
export function teardropPath(from: Pt, pad: Pt, r: number): string {
  const d = Math.hypot(pad[0] - from[0], pad[1] - from[1]);
  if (d <= r * 1.08) return "";
  const base = Math.atan2(from[1] - pad[1], from[0] - pad[0]);
  const theta = Math.acos(Math.min(1, r / d));
  const t1x = pad[0] + r * Math.cos(base + theta);
  const t1y = pad[1] + r * Math.sin(base + theta);
  const t2x = pad[0] + r * Math.cos(base - theta);
  const t2y = pad[1] + r * Math.sin(base - theta);
  return `M ${from[0]} ${from[1]} L ${t1x} ${t1y} L ${t2x} ${t2y} Z`;
}

/** Walk a polyline and drop a point every `spacing` units. Used to place vias. */
export function pointsAlong(pts: Pt[], spacing: number, offset = 0): Pt[] {
  const out: Pt[] = [];
  let carry = offset;
  for (let i = 1; i < pts.length; i += 1) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const len = Math.hypot(bx - ax, by - ay);
    if (len === 0) continue;
    let t = carry;
    while (t < len) {
      out.push([ax + ((bx - ax) * t) / len, ay + ((by - ay) * t) / len]);
      t += spacing;
    }
    carry = t - len;
  }
  return out;
}

/** Axis-aligned bounding box of a polyline, padded. */
export function bboxOf(pts: Pt[], pad = 0) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
}

export function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Slow in, slow out. Used for every camera move between rail stops. */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
