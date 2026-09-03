/**
 * THE DAILY-CHANGING DETAIL.
 *
 * The board should never read identically two days running. Priority:
 *   1. a real commit from the last 36 hours (the board genuinely moved), and
 *      SIGNAL//LOST wins the tie because it rewrites itself daily by design;
 *   2. otherwise a deterministic pick from `transmissions` keyed by the date,
 *      so every visitor on the same day sees the same line and it rotates
 *      at midnight UTC without any storage.
 *
 * Computed on the server and passed down as a prop, so the client never
 * derives a different value and hydration stays clean.
 */

import { transmissions } from "@/data/content";
import type { GithubData } from "@/lib/github";

export interface Transmission {
  line: string;
  source: "live" | "board";
  href?: string;
  /** Day-of-cycle stamp, e.g. "2026.247". */
  stamp: string;
}

function dayNumber(now: Date): { year: number; ordinal: number; index: number } {
  const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const jan1 = Date.UTC(now.getUTCFullYear(), 0, 1);
  const ordinal = Math.floor((utc - jan1) / 86_400_000) + 1;
  return {
    year: now.getUTCFullYear(),
    ordinal,
    index: Math.floor(utc / 86_400_000),
  };
}

export function dailyTransmission(gh: GithubData, now = new Date()): Transmission {
  const { year, ordinal, index } = dayNumber(now);
  const stamp = `${year}.${String(ordinal).padStart(3, "0")}`;

  const cutoff = now.getTime() - 36 * 3_600_000;
  const fresh = gh.recent.filter((c) => Date.parse(c.when) >= cutoff);

  if (fresh.length > 0) {
    const arg = fresh.find((c) => /signal/i.test(c.repo));
    const pick = arg ?? fresh[0];
    return {
      line: `${pick.repo.toUpperCase()} @ ${pick.sha} // ${pick.message}`,
      source: "live",
      href: pick.url,
      stamp,
    };
  }

  // Deterministic, storage-free rotation. Stride is coprime with the list
  // length wherever possible so consecutive days are not adjacent entries.
  const stride = 5;
  const i = ((index * stride) % transmissions.length + transmissions.length) %
    transmissions.length;
  return { line: transmissions[i], source: "board", stamp };
}
