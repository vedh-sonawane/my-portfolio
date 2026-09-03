"use client";

/**
 * THE PULSE -- the board's heartbeat, pinned to a corner of the viewport.
 * Real commits, newest first. Timestamps are rendered in UTC so the server and
 * the client agree on the string and hydration stays quiet.
 */

import type { GithubData } from "@/lib/github";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")} ${String(
    d.getUTCHours(),
  ).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}Z`;
}

export default function Pulse({ github }: { github: GithubData }) {
  const feed = github.recent.slice(0, 4);

  return (
    <section
      className="w-[288px] border border-copper bg-board/88 p-3"
      aria-label="Live commit pulse"
    >
      <h2 className="silk m-0 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: feed.length ? "var(--color-hot)" : "var(--color-silk-dim)",
              animation: feed.length ? "blink 1.4s steps(1) infinite" : undefined,
            }}
            aria-hidden="true"
          />
          Pulse
        </span>
        <span>{github.live ? "GitHub · live" : "Offline"}</span>
      </h2>

      {feed.length === 0 ? (
        <p className="m-0 text-[11px] leading-relaxed text-ink-dim">
          No live feed. Cached telemetry: {github.totalContributions.toLocaleString("en-CA")}{" "}
          contributions across {github.repositories} public repositories.
        </p>
      ) : (
        <ol className="m-0 space-y-2 p-0">
          {feed.map((c) => (
            <li key={`${c.repo}-${c.sha}`} className="list-none leading-tight">
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block hover:opacity-100"
              >
                <span className="silk" style={{ color: "var(--color-trace)" }}>
                  {c.repo}
                </span>
                <span className="silk"> · {stamp(c.when)}</span>
                <span className="mt-0.5 block truncate text-[11px] text-ink-dim">
                  {c.message}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
