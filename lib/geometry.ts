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
 * A long jumper wire between two far-apart points -- used for the
 * event -> project cross-wires. Drawn as a cubic that leaves both ends
 * vertically, the way a hand-soldered flying lead actually hangs.
 */
export function jumperPath([x1, y1]: Pt, [x2, y2]: Pt): string {
  const dy = Math.abs(y2 - y1);
  const lift = Math.min(520, Math.max(180, dy * 0.45));
  return `M ${x1} ${y1} C ${x1} ${y1 - lift}, ${x2} ${y2 + lift}, ${x2} ${y2}`;
}

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Slow in, slow out. Used for every camera move between rail stops. */
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
