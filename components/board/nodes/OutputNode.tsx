"use client";

/**
 * OUT1 -- the live output stage.
 *
 * The contribution calendar is NOT rendered as GitHub's green squares. It is
 * re-drawn in the board's own language: a 53x7 LED matrix soldered to the
 * output node, dark where nothing happened and running hot on the heaviest
 * days. Everything else here is telemetry: totals, a language spectrum read
 * like a resistor band, and the daily TRANSMISSION.
 *
 * When the GitHub API is unavailable the matrix says so plainly rather than
 * inventing data, and the cached totals still render.
 */

import { hackathons, identity, projects } from "@/data/content";
import type { Transmission } from "@/lib/daily";
import type { GithubData } from "@/lib/github";
import type { BoardNode } from "@/lib/layout";
import Node from "@/components/board/Node";

const CELL = 15;
const DOT = 5.2;

const LEVELS = [
  "var(--color-copper-2)",
  "color-mix(in oklab, var(--color-trace) 30%, var(--color-board))",
  "color-mix(in oklab, var(--color-trace) 62%, var(--color-board))",
  "var(--color-trace)",
  "var(--color-hot)",
];

function levelOf(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const r = count / max;
  if (r > 0.66) return 4;
  if (r > 0.38) return 3;
  if (r > 0.15) return 2;
  return 1;
}

function Matrix({ github }: { github: GithubData }) {
  const weeks = github.weeks.slice(-53);
  const w = weeks.length * CELL;
  const h = 7 * CELL;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", aspectRatio: `${w} / ${h}`, display: "block" }}
      role="img"
      aria-label={`Contribution matrix: ${github.totalContributions.toLocaleString(
        "en-CA",
      )} contributions in the past year, busiest day ${
        github.busiestDay ? `${github.busiestDay.date} with ${github.busiestDay.count}` : "unknown"
      }.`}
    >
      {weeks.map((week, x) =>
        week.map((day, y) => {
          const lvl = levelOf(day.count, github.maxDay);
          return (
            <circle
              key={day.date}
              cx={x * CELL + CELL / 2}
              cy={y * CELL + CELL / 2}
              r={lvl === 0 ? DOT * 0.72 : DOT}
              fill={LEVELS[lvl]}
              opacity={lvl === 0 ? 0.55 : 0.6 + lvl * 0.1}
            >
              <title>{`${day.date}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}</title>
            </circle>
          );
        }),
      )}
    </svg>
  );
}

function Spectrum({ languages }: { languages: GithubData["languages"] }) {
  const total = languages.reduce((s, l) => s + l.size, 0) || 1;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden" style={{ border: "1px solid var(--color-copper)" }}>
        {languages.map((l, i) => (
          <span
            key={l.name}
            style={{
              width: `${(l.size / total) * 100}%`,
              background:
                i === 0
                  ? "var(--color-hot)"
                  : `color-mix(in oklab, var(--color-trace) ${Math.max(18, 92 - i * 13)}%, var(--color-board))`,
            }}
          />
        ))}
      </div>
      <p className="lod-fine silk m-0 mt-2" style={{ fontSize: 9.5 }}>
        {languages.slice(0, 5).map((l) => l.name).join(" · ")}
      </p>
    </div>
  );
}

export default function OutputNode({
  node,
  reached,
  active,
  onActivate,
  github,
  transmission,
  voltage,
}: {
  node: BoardNode;
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
  github: GithubData;
  transmission: Transmission;
  voltage: number;
}) {
  const powered = reached >= node.stop;
  const hot = active === node.id;

  const inventory: [string, string][] = [
    ["Parts on board", String(projects.length)],
    ["Hardware", String(projects.filter((p) => p.half === "physical").length)],
    ["Software", String(projects.filter((p) => p.half === "digital").length)],
    ["Connectors", String(hackathons.length)],
  ];

  const stats: [string, string][] = [
    ["Contributions", github.totalContributions.toLocaleString("en-CA")],
    ["Repositories", String(github.repositories)],
    ["Followers", String(github.followers)],
    ["Streak", github.live ? `${github.currentStreak}d` : "n/a"],
  ];

  return (
    <Node
      node={node}
      reached={reached}
      active={active}
      onActivate={onActivate}
      label={`OUT1: live GitHub output. ${github.totalContributions.toLocaleString(
        "en-CA",
      )} contributions in the past year across ${github.repositories} public repositories.`}
    >
      <div
        className="relative h-full w-full"
        style={{
          border: `2px solid ${hot ? "var(--color-hot)" : "var(--color-trace)"}`,
          background:
            "linear-gradient(180deg, var(--color-mask), color-mix(in oklab, var(--color-board) 88%, var(--color-trace)))",
          transition: "border-color 300ms ease",
        }}
      >
        {/* corner pin-1 marker */}
        <span
          className="absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--color-hot)" }}
          aria-hidden="true"
        />

        <div
          className="flex h-full flex-col px-7 pt-6 pb-6"
          style={{ opacity: powered ? 1 : 0, transition: "opacity 700ms ease 400ms" }}
        >
          <header className="flex items-baseline justify-between gap-4">
            <p className="desig m-0">OUT1 · Live output</p>
            <p className="silk m-0 flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: github.live ? "var(--color-hot)" : "var(--color-silk-dim)",
                  animation: github.live ? "blink 1.8s steps(1) infinite" : undefined,
                }}
              />
              {github.live ? "Live" : "Cached"} · github.com/{identity.githubLogin}
            </p>
          </header>

          <div className="mt-5">
            <p className="silk m-0 mb-2">Contribution matrix · 53 weeks</p>
            {github.weeks.length > 0 ? (
              <Matrix github={github} />
            ) : (
              <div
                className="px-4 py-5 text-center"
                style={{ border: "1px dashed var(--color-copper)" }}
              >
                <p className="silk m-0">Calendar offline</p>
                <p className="m-0 mt-2 text-[12px] leading-relaxed text-ink-dim">
                  GitHub only exposes the contribution calendar through the
                  authenticated GraphQL API. Set <span className="text-hot">GITHUB_TOKEN</span>{" "}
                  and the matrix energises; until then the totals below are the
                  last known figures.
                </p>
              </div>
            )}
            <div className="mt-2 flex justify-between">
              <span className="silk">−52 weeks</span>
              <span className="silk">
                {github.busiestDay
                  ? `Peak ${github.busiestDay.count} on ${github.busiestDay.date}`
                  : "Peak n/a"}
              </span>
              <span className="silk">Now</span>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-4 gap-4">
            {stats.map(([k, v]) => (
              <div key={k}>
                <dt className="silk m-0">{k}</dt>
                <dd
                  className="m-0 mt-1.5 tabular-nums"
                  style={{ fontSize: 22, color: "var(--color-trace-hi)" }}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="silk m-0">Board voltage</p>
              <p className="silk m-0 tabular-nums" style={{ color: "var(--color-hot)" }}>
                {(voltage * 100).toFixed(0)}%
              </p>
            </div>
            <div
              className="mt-2 h-2 w-full"
              style={{ border: "1px solid var(--color-copper)" }}
            >
              <span
                className="block h-full"
                style={{
                  width: `${voltage * 100}%`,
                  background:
                    "linear-gradient(90deg, var(--color-trace), var(--color-hot))",
                  transition: "width 1200ms cubic-bezier(.2,.7,.3,1)",
                }}
              />
            </div>
          </div>

          {github.languages.length > 0 ? (
            <div className="mt-5">
              <p className="silk m-0 mb-2">Language spectrum</p>
              <Spectrum languages={github.languages} />
            </div>
          ) : (
            <div className="mt-5">
              <p className="silk m-0 mb-2">Feeds</p>
              <p className="m-0 text-[12px] leading-relaxed text-ink-dim">
                Contributions, repositories, languages and the commit pulse are
                pulled live from GitHub and cached for an hour. Hackathons and
                Devpost entries are hand-maintained, because Devpost has no public API.
              </p>
            </div>
          )}

          <div className="mt-5">
            <p className="silk m-0 mb-2">Board inventory · hand-maintained</p>
            <dl className="grid grid-cols-4 gap-4">
              {inventory.map(([k, v]) => (
                <div key={k}>
                  <dt className="silk m-0">{k}</dt>
                  <dd
                    className="m-0 mt-1 tabular-nums"
                    style={{ fontSize: 15, color: "var(--color-silk)" }}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="mt-auto pt-5"
            style={{ borderTop: "1px solid var(--color-copper)" }}
          >
            <p className="silk m-0">Transmission {transmission.stamp}</p>
            {transmission.href ? (
              <a
                href={transmission.href}
                target="_blank"
                rel="noreferrer noopener"
                className="m-0 mt-1.5 block text-[12.5px] underline decoration-hot/30 underline-offset-4 hover:decoration-hot"
                style={{ color: "var(--color-hot)" }}
              >
                {transmission.line}
              </a>
            ) : (
              <p className="m-0 mt-1.5 text-[12.5px]" style={{ color: "var(--color-hot)" }}>
                {transmission.line}
              </p>
            )}
          </div>
        </div>
      </div>
    </Node>
  );
}
