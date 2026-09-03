/**
 * CAMERA MATHS.
 *
 * The camera is one CSS transform on the world container. Scroll position maps
 * to a point along the rail; the rail is a list of framed rectangles and the
 * camera interpolates between them.
 *
 * Two details do most of the work:
 *   - scale is interpolated in LOG space, so a zoom from 0.2 to 1.0 feels
 *     even rather than accelerating into the close-up;
 *   - long transits DOLLY OUT at the midpoint. Without this, moving from the
 *     digital half back to the physical half is a blur of copper; with it, the
 *     camera lifts, you see the whole board, and it settles again.
 */

import { clamp, easeInOutCubic, lerp } from "@/lib/geometry";
import { activeStops, stopCamera, WORLD, type CameraState } from "@/lib/layout";

export function railLength(isMobile: boolean): number {
  return Math.max(1, activeStops(isMobile).length - 1);
}

export function cameraAtProgress(
  progress: number,
  vw: number,
  vh: number,
  isMobile: boolean,
  reducedMotion: boolean,
): { cam: CameraState; f: number } {
  const stops = activeStops(isMobile);
  const n = stops.length - 1;
  const f = clamp(progress, 0, 1) * n;

  if (reducedMotion) {
    // No scrubbing: the camera sits at a stop and changes stop, full stop.
    const i = clamp(Math.round(f), 0, n);
    return { cam: stopCamera(stops[i], vw, vh, isMobile), f };
  }

  const i = clamp(Math.floor(f), 0, Math.max(0, n - 1));
  const t = n === 0 ? 0 : f - i;
  const a = stopCamera(stops[i], vw, vh, isMobile);
  const b = stopCamera(stops[Math.min(n, i + 1)], vw, vh, isMobile);
  const e = easeInOutCubic(clamp(t, 0, 1));

  // Long transits dolly out at the midpoint. The effect is scaled down when
  // either end is already a wide shot -- pulling further back from the
  // whole-board view at the start of the intro would just read as drifting.
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const closeness = clamp(Math.min(a.s, b.s) / 0.6, 0, 1);
  const dip = clamp(dist / 2400, 0, 1) * 0.4 * closeness;
  const arc = 1 - Math.sin(Math.PI * e) * dip;

  return {
    cam: {
      x: lerp(a.x, b.x, e),
      y: lerp(a.y, b.y, e),
      s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), e)) * arc,
    },
    f,
  };
}

/** Minimum scale that still keeps the whole board roughly on screen. */
export function minScale(vw: number, vh: number): number {
  return Math.min(vw / WORLD.w, vh / WORLD.h) * 0.82;
}

export const MAX_SCALE = 2;

export function clampFree(cam: CameraState, vw: number, vh: number): CameraState {
  const s = clamp(cam.s, minScale(vw, vh), MAX_SCALE);
  return {
    s,
    x: clamp(cam.x, 0, WORLD.w),
    y: clamp(cam.y, 0, WORLD.h),
  };
}

/** Write the camera to the DOM. Deliberately outside React's render path. */
export function applyCamera(
  el: HTMLElement,
  cam: CameraState,
  vw: number,
  vh: number,
): void {
  const tx = vw / 2 - cam.x * cam.s;
  const ty = vh / 2 - cam.y * cam.s;
  el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${cam.s.toFixed(
    4,
  )})`;
  el.style.setProperty("--cam-scale", cam.s.toFixed(4));
}

/** Screen point -> world point, for zoom-about-cursor. */
export function screenToWorld(
  px: number,
  py: number,
  cam: CameraState,
  vw: number,
  vh: number,
): { x: number; y: number } {
  return {
    x: (px - vw / 2) / cam.s + cam.x,
    y: (py - vh / 2) / cam.s + cam.y,
  };
}
