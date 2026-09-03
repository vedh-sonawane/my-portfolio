"use client";

/**
 * ============================================================================
 *  BOARD -- camera, modes, and the HUD that sits over the world.
 * ============================================================================
 *
 *  PHASE A  intro      the board is dark and far away; scrolling pulls the
 *                      camera in toward SW1, closes the switch, and solders the
 *                      name into place as current arrives.
 *  PHASE B  guided     scroll rides the current: the camera pans and zooms
 *                      along a rail of framed rectangles, pausing at each
 *                      section, which powers on as it arrives. Mobile default.
 *  PHASE C  free roam  an explicit unlock. Scroll is locked, the camera
 *                      detaches, and drag / WASD / arrows / wheel / pinch take
 *                      over, with a minimap and a way back to the tour.
 *
 *  The two modes never both interpret scroll. In guided mode the page scrolls
 *  and the wheel is left alone; in free roam the page cannot scroll at all and
 *  the wheel is zoom.
 *
 *  The camera itself is written straight to the DOM inside one rAF loop, never
 *  through React state, so panning stays at 60fps no matter how much of the
 *  board is mounted.
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import World from "@/components/board/World";
import Minimap from "@/components/board/Minimap";
import Pulse from "@/components/board/Pulse";
import {
  activeStops,
  nodeById,
  stopCamera,
  STOPS,
  WORLD,
  type CameraState,
} from "@/lib/layout";
import {
  applyCamera,
  cameraAtProgress,
  clampFree,
  MAX_SCALE,
  minScale,
  screenToWorld,
} from "@/lib/camera";
import { clamp } from "@/lib/geometry";
import { identity } from "@/data/content";
import type { GithubData } from "@/lib/github";
import type { Transmission } from "@/lib/daily";

type Mode = "guided" | "free";

export default function Board({
  github,
  transmission,
  voltage,
}: {
  github: GithubData;
  transmission: Transmission;
  voltage: number;
}) {
  const worldRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const driverRef = useRef<HTMLDivElement>(null);
  const viewRectRef = useRef<SVGRectElement>(null);

  const [mode, setMode] = useState<Mode>("guided");
  const [reached, setReached] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [stopI, setStopI] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* refs the animation loop reads without re-rendering anything */
  const camRef = useRef<CameraState>({ x: WORLD.w / 2, y: WORLD.h / 2, s: 0.1 });
  const modeRef = useRef<Mode>("guided");
  const mobileRef = useRef(false);
  const reducedRef = useRef(false);
  const reachedRef = useRef(0);
  const stopRef = useRef(0);
  const keysRef = useRef(new Set<string>());
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  modeRef.current = mode;
  mobileRef.current = isMobile;
  reducedRef.current = reduced;

  /* ---- environment ------------------------------------------------------ */

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 768px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setIsMobile(mqMobile.matches);
      setReduced(mqMotion.matches);
    };
    sync();
    mqMobile.addEventListener("change", sync);
    mqMotion.addEventListener("change", sync);
    return () => {
      mqMobile.removeEventListener("change", sync);
      mqMotion.removeEventListener("change", sync);
    };
  }, []);

  /* Scroll driver height follows the number of stops actually in use. */
  useEffect(() => {
    if (driverRef.current)
      driverRef.current.style.height = `${activeStops(isMobile).length * (isMobile ? 65 : 100)}vh`;
  }, [isMobile]);

  /* ---- smooth scroll (guided only) -------------------------------------- */

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    let raf = 0;
    const run = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (mode === "free") lenis.stop();
    else lenis.start();
  }, [mode]);

  /* ---- scroll lock while free-roaming ----------------------------------- */

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "free") {
      root.style.overflow = "hidden";
      root.style.touchAction = "none";
    } else {
      root.style.overflow = "";
      root.style.touchAction = "";
    }
    return () => {
      root.style.overflow = "";
      root.style.touchAction = "";
    };
  }, [mode]);

  /* ---- the one animation loop ------------------------------------------- */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const el = worldRef.current;
      if (el) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (modeRef.current === "guided") {
          const max = Math.max(1, document.documentElement.scrollHeight - vh);
          const p = window.scrollY / max;
          const { cam, f } = cameraAtProgress(
            p,
            vw,
            vh,
            mobileRef.current,
            reducedRef.current,
          );
          camRef.current = cam;

          const stops = activeStops(mobileRef.current);
          // Power on once the camera is more than halfway into a stop, so the
          // section lights up as you fly in rather than after you land.
          // (The 0.45 is deliberately not 0.5: it keeps float error at exact
          // stop boundaries from leaving an arrived-at section dark.)
          const arrivedLocal = clamp(Math.floor(f + 0.45), 0, stops.length - 1);
          const arrived = STOPS.findIndex((s) => s.id === stops[arrivedLocal].base);
          if (arrived > reachedRef.current) {
            reachedRef.current = arrived;
            setReached(arrived);
          }
          const nowLocal = clamp(Math.round(f), 0, stops.length - 1);
          if (nowLocal !== stopRef.current) {
            stopRef.current = nowLocal;
            setStopI(nowLocal);
          }

          // Name solder-in: a CSS variable, so the intro costs zero renders.
          const gi = stops.findIndex((s) => s.base === "ignite");
          const hi = stops.findIndex((s) => s.base === "hero");
          const from = gi >= 0 ? gi : Math.max(0, hi - 1);
          el.style.setProperty(
            "--solder",
            String(clamp((f - from) / Math.max(0.001, hi - from), 0, 1)),
          );
        } else {
          const k = keysRef.current;
          const boost = k.has("shift") ? 2.2 : 1;
          const step = (dt * 0.95 * boost) / camRef.current.s;
          let { x, y, s } = camRef.current;
          if (k.has("w") || k.has("arrowup")) y -= step;
          if (k.has("s") || k.has("arrowdown")) y += step;
          if (k.has("a") || k.has("arrowleft")) x -= step;
          if (k.has("d") || k.has("arrowright")) x += step;
          if (k.has("=") || k.has("+")) s *= 1 + dt * 0.0022;
          if (k.has("-") || k.has("_")) s /= 1 + dt * 0.0022;
          camRef.current = clampFree({ x, y, s }, vw, vh);
        }

        applyCamera(el, camRef.current, vw, vh);

        const rect = viewRectRef.current;
        if (rect) {
          const { x, y, s } = camRef.current;
          const w = vw / s;
          const h = vh / s;
          rect.setAttribute("x", String(x - w / 2));
          rect.setAttribute("y", String(y - h / 2));
          rect.setAttribute("width", String(w));
          rect.setAttribute("height", String(h));
        }
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- navigation helpers ----------------------------------------------- */

  const scrollToStop = useCallback(
    (index: number, smooth = true) => {
      const stops = activeStops(mobileRef.current);
      const i = clamp(index, 0, stops.length - 1);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const top = (i / Math.max(1, stops.length - 1)) * max;
      const lenis = lenisRef.current;
      if (lenis && smooth && !reducedRef.current) lenis.scrollTo(top, { duration: 1.1 });
      else window.scrollTo({ top, behavior: smooth && !reducedRef.current ? "smooth" : "auto" });
    },
    [],
  );

  /** Free roam energises the whole board: you cannot explore a dark section. */
  const powerAll = useCallback(() => {
    const all = STOPS.length - 1;
    if (reachedRef.current < all) {
      reachedRef.current = all;
      setReached(all);
    }
  }, []);

  const enterFree = useCallback(() => {
    powerAll();
    setMode("free");
  }, [powerAll]);

  const returnToTour = useCallback(() => {
    const stops = activeStops(mobileRef.current);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { x, y } = camRef.current;
    let best = 0;
    let bestD = Infinity;
    stops.forEach((s, i) => {
      const c = stopCamera(s, vw, vh, mobileRef.current);
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setMode("guided");
    requestAnimationFrame(() => scrollToStop(best, false));
  }, [scrollToStop]);

  /* ---- keyboard ---------------------------------------------------------- */

  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);

    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const key = e.key.toLowerCase();

      if (key === "e") {
        e.preventDefault();
        if (modeRef.current === "guided") enterFree();
        else returnToTour();
        return;
      }
      if (key === "escape" && modeRef.current === "free") {
        e.preventDefault();
        returnToTour();
        return;
      }

      if (modeRef.current === "free") {
        if (e.shiftKey) keysRef.current.add("shift");
        keysRef.current.add(key);
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key))
          e.preventDefault();
        return;
      }

      // Guided: a keyboard path through every section.
      const stops = activeStops(mobileRef.current);
      const onControl =
        e.target instanceof HTMLElement &&
        Boolean(e.target.closest("a,button,[role='button']"));
      if (key === " " && onControl) return;
      if (key === "arrowdown" || key === "pagedown" || key === " ") {
        e.preventDefault();
        scrollToStop(stopRef.current + 1);
      } else if (key === "arrowup" || key === "pageup") {
        e.preventDefault();
        scrollToStop(stopRef.current - 1);
      } else if (key === "home") {
        e.preventDefault();
        scrollToStop(0);
      } else if (key === "end") {
        e.preventDefault();
        scrollToStop(stops.length - 1);
      }
    };

    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      if (!e.shiftKey) keysRef.current.delete("shift");
    };
    const blur = () => keysRef.current.clear();

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [enterFree, returnToTour, scrollToStop]);

  /* ---- drag + pinch + wheel (free roam only) ----------------------------- */

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (modeRef.current !== "free") return;
      if ((e.target as HTMLElement)?.closest("a,button")) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (modeRef.current !== "free") return;
      const pts = pointersRef.current;
      const prev = pts.get(e.pointerId);
      if (!prev) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (pts.size >= 2) {
        const [a, b] = [...pts.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (!pinchRef.current) {
          pinchRef.current = { dist, scale: camRef.current.s };
        } else {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const want = clamp(
            (pinchRef.current.scale * dist) / Math.max(1, pinchRef.current.dist),
            minScale(vw, vh),
            MAX_SCALE,
          );
          const w = screenToWorld(midX, midY, camRef.current, vw, vh);
          camRef.current = clampFree(
            { s: want, x: w.x - (midX - vw / 2) / want, y: w.y - (midY - vh / 2) / want },
            vw,
            vh,
          );
        }
        return;
      }

      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      camRef.current = clampFree(
        {
          ...camRef.current,
          x: camRef.current.x - dx / camRef.current.s,
          y: camRef.current.y - dy / camRef.current.s,
        },
        vw,
        vh,
      );
    };

    const onPointerUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size < 2) pinchRef.current = null;
    };

    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== "free") return;
      e.preventDefault();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const factor = Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016));
      const want = clamp(camRef.current.s * factor, minScale(vw, vh), MAX_SCALE);
      const w = screenToWorld(e.clientX, e.clientY, camRef.current, vw, vh);
      camRef.current = clampFree(
        { s: want, x: w.x - (e.clientX - vw / 2) / want, y: w.y - (e.clientY - vh / 2) / want },
        vw,
        vh,
      );
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  /* An `overflow: hidden` box is still programmatically scrollable, and
     focusing a component inside one makes the browser scroll it into view --
     which slides the entire board out from under the camera transform. Pin it
     back to the origin; the camera is the only thing allowed to move it. */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const pin = () => {
      if (el.scrollTop !== 0) el.scrollTop = 0;
      if (el.scrollLeft !== 0) el.scrollLeft = 0;
    };
    el.addEventListener("scroll", pin, { passive: true });
    return () => el.removeEventListener("scroll", pin);
  }, []);

  /* Tabbing to a component brings the camera to it. */
  const onFocusCapture = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (modeRef.current !== "guided") return;
      const host = (e.target as HTMLElement).closest("[data-node]");
      const id = host?.getAttribute("data-node");
      if (!id) return;
      const n = nodeById(id);
      if (!n) return;
      const stops = activeStops(mobileRef.current);
      const target = STOPS[n.stop];
      const local = stops.findIndex((s) => s.base === target?.id);
      if (local >= 0 && local !== stopRef.current) scrollToStop(local);
    },
    [scrollToStop],
  );

  const jumpTo = useCallback((x: number, y: number) => {
    camRef.current = clampFree(
      { ...camRef.current, x, y },
      window.innerWidth,
      window.innerHeight,
    );
  }, []);

  const stops = activeStops(isMobile);
  const current = stops[clamp(stopI, 0, stops.length - 1)];
  const intro = stopI < stops.findIndex((s) => s.base === "hero");

  return (
    <>
      {/* the scroll driver: tall, empty, and the only thing that scrolls */}
      <div ref={driverRef} aria-hidden="true" style={{ height: `${STOPS.length * 100}vh` }} />

      {/* the fixed viewport the world is flown around inside */}
      <div
        ref={viewportRef}
        className="fixed inset-0 overflow-hidden"
        style={{
          // The bench the board is sitting on. Anything outside the substrate
          // should read as "off the board", not as an unpainted region.
          background:
            "radial-gradient(140% 120% at 50% 40%, #070a0e 0%, #030507 70%, #010203 100%)",
          cursor: mode === "free" ? "grab" : "default",
          touchAction: mode === "free" ? "none" : "auto",
        }}
        onFocusCapture={onFocusCapture}
      >
        <World
          ref={worldRef}
          reached={reached}
          active={active}
          onActivate={setActive}
          github={github}
          transmission={transmission}
          voltage={voltage}
        />

        {/* vignette: keeps the eye in the middle of the frame */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 50%, transparent 45%, rgba(2,4,6,.78) 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ---- HUD ----------------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 z-50">
        <header className="pointer-events-auto absolute top-0 right-0 left-0 flex items-start justify-between gap-3 p-3 sm:p-6">
          <p className="silk m-0 bg-board/70 px-2 py-1.5 leading-relaxed">
            <span style={{ color: "var(--color-hot)" }}>CURRENT · Rev A</span>
            <span className="hidden sm:inline"> · {identity.name}</span>
          </p>

          <nav className="flex items-center justify-end gap-2">
            <a
              href="/document"
              className="silk border border-copper px-2.5 py-2 hover:border-hot hover:text-ink sm:px-3"
            >
              <span className="sm:hidden">Document</span>
              <span className="hidden sm:inline">Read as document</span>
            </a>
            <button
              type="button"
              onClick={mode === "guided" ? enterFree : returnToTour}
              className="silk border px-2.5 py-2 sm:px-3"
              style={{
                borderColor: mode === "free" ? "var(--color-hot)" : "var(--color-copper)",
                color: mode === "free" ? "var(--color-hot)" : undefined,
              }}
              aria-pressed={mode === "free"}
              aria-label={
                mode === "guided" ? "Explore the board freely" : "Return to the guided tour"
              }
            >
              {mode === "guided" ? (
                <>
                  <span className="sm:hidden">Explore</span>
                  <span className="hidden sm:inline">Explore the board · E</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Tour</span>
                  <span className="hidden sm:inline">Return to tour · Esc</span>
                </>
              )}
            </button>
          </nav>
        </header>

        {/* mode / position readout */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-end justify-between gap-4 p-4 sm:p-6">
          <div
            className="pointer-events-auto hidden lg:block"
            style={{
              opacity: intro ? 0 : 1,
              transform: intro ? "translateY(10px)" : "none",
              transition: "opacity 600ms ease, transform 600ms ease",
              pointerEvents: intro ? "none" : "auto",
            }}
            aria-hidden={intro}
          >
            <Pulse github={github} />
          </div>

          <div className="pointer-events-auto ml-auto">
            {mode === "free" ? (
              <Minimap viewRef={viewRectRef} onJump={jumpTo} active={active} />
            ) : (
              <div className="border border-copper bg-board/88 px-3 py-2">
                <p className="silk m-0" style={{ color: "var(--color-hot)" }}>
                  {String(stopI + 1).padStart(2, "0")} {"//"} {current?.label}
                </p>
                {stops.length > 16 ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-28" style={{ background: "var(--color-copper)" }}>
                      <span
                        className="block h-full"
                        style={{
                          width: `${((stopI + 1) / stops.length) * 100}%`,
                          background: "var(--color-hot)",
                        }}
                      />
                    </div>
                    <span className="silk tabular-nums">
                      {stopI + 1}/{stops.length}
                    </span>
                  </div>
                ) : (
                <div className="mt-2 flex gap-1" role="presentation">
                  {stops.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      title={s.label}
                      aria-label={`Go to ${s.label}`}
                      aria-current={i === stopI}
                      onClick={() => scrollToStop(i)}
                      className="h-1.5 w-6"
                      style={{
                        background:
                          i === stopI
                            ? "var(--color-hot)"
                            : i < stopI
                              ? "var(--color-trace)"
                              : "var(--color-copper)",
                      }}
                    />
                  ))}
                </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* intro affordances */}
        {mode === "guided" && intro ? (
          <div className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 text-center sm:bottom-28">
            <p className="silk m-0 mb-3">
              {stopI === 0 ? "Scroll to close the switch" : "Current arriving"}
            </p>
            <button
              type="button"
              onClick={() => scrollToStop(stops.findIndex((s) => s.base === "hero"))}
              className="silk border border-copper px-3 py-2 hover:border-hot hover:text-ink"
            >
              Skip intro
            </button>
          </div>
        ) : null}

        {mode === "free" ? (
          <p className="silk pointer-events-none absolute top-16 left-1/2 m-0 max-w-[86vw] -translate-x-1/2 bg-board/80 px-3 py-1.5 text-center sm:top-28">
            Whole board live · drag to pan ·{" "}
            <span className="hidden sm:inline">WASD / arrows · </span>
            {isMobile ? "pinch" : "wheel"} to zoom
          </p>
        ) : null}
      </div>

      <noscript>
        <div className="fixed inset-x-0 bottom-0 z-[100] bg-board p-4 text-center">
          <p className="m-0 text-[13px] text-ink">
            The board needs JavaScript to fly.{" "}
            <a href="/document" className="text-hot underline underline-offset-4">
              Read the full portfolio as a document instead
            </a>
            .
          </p>
        </div>
      </noscript>
    </>
  );
}
