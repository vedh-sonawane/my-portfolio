/**
 * ============================================================================
 *  LIVE DATA -- GitHub.
 * ============================================================================
 *
 *  This is the ONLY genuinely live source on the site. Everything else
 *  (hackathons, Devpost entries) is hand-maintained in `data/content.ts`
 *  because Devpost has no public API -- do not add one here.
 *
 *  What comes back live:
 *    - contribution calendar + total contributions  -> board VOLTAGE + LED matrix
 *    - public repository count / followers          -> output-node telemetry
 *    - top languages by bytes                       -> output-node spectrum
 *    - recent commits on recently-pushed repos      -> the PULSE feed
 *
 *  The contribution calendar is only available through the *authenticated*
 *  GraphQL API, so a token is required for it. Set GITHUB_TOKEN (read-only,
 *  no scopes needed for public data). Without it, everything degrades to the
 *  fallback numbers in `data/content.ts` and the site still renders fully.
 *
 *  Cached with `next.revalidate` (see REVALIDATE_SECONDS) so the page stays
 *  static-fast and the API is hit at most once per window.
 *
 *  NOTE: Next uses stale-while-revalidate. Once the window lapses, the next
 *  request still receives the cached page while a fresh one is built behind
 *  it; the request after that gets the new numbers. So a change shows up one
 *  page load after the window, not on the first.
 * ============================================================================
 */

import { identity } from "@/data/content";

export interface ContributionDay {
  date: string;
  count: number;
}

export interface CommitPing {
  repo: string;
  message: string;
  sha: string;
  url: string;
  when: string;
}

export interface LanguageSlice {
  name: string;
  size: number;
  color: string | null;
}

export interface GithubData {
  login: string;
  /** false = the live fetch failed and these are the fallback numbers. */
  live: boolean;
  totalContributions: number;
  repositories: number;
  followers: number;
  /** 53 columns x 7 rows, oldest first. Empty when not live. */
  weeks: ContributionDay[][];
  maxDay: number;
  currentStreak: number;
  busiestDay: ContributionDay | null;
  languages: LanguageSlice[];
  recent: CommitPing[];
  fetchedAt: string;
}

const ENDPOINT = "https://api.github.com/graphql";

/**
 * How stale the board is allowed to get.
 *
 * The whole query costs about 2 points of GitHub's 5,000-per-hour GraphQL
 * budget, so refreshing every five minutes uses well under 1% of it. Next
 * serves the cached page instantly and regenerates behind the request, so a
 * shorter window costs visitors nothing.
 */
const REVALIDATE_SECONDS = 300;

const QUERY = /* GraphQL */ `
  query Board($login: String!) {
    user(login: $login) {
      followers {
        totalCount
      }
      repoCount: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      recentRepos: repositories(
        first: 24
        privacy: PUBLIC
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          languages(first: 6, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 5) {
                  nodes {
                    oid
                    messageHeadline
                    committedDate
                    url
                    author {
                      user {
                        login
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/* -- shapes of the slice of the response we actually read -------------- */

interface RawResponse {
  data?: {
    user?: {
      followers: { totalCount: number };
      repoCount: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
        };
      };
      recentRepos: {
        nodes: ({
          name: string;
          languages: {
            edges: ({ size: number; node: { name: string; color: string | null } } | null)[];
          } | null;
          defaultBranchRef: {
            target: {
              history?: {
                nodes: ({
                  oid: string;
                  messageHeadline: string;
                  committedDate: string;
                  url: string;
                  author: { user: { login: string } | null } | null;
                } | null)[];
              };
            } | null;
          } | null;
        } | null)[];
      };
    } | null;
  };
  errors?: { message: string }[];
}

/** What the board shows when GitHub is unreachable or unauthenticated. */
export function fallbackGithub(reason = "no token"): GithubData {
  return {
    login: identity.githubLogin,
    live: false,
    totalContributions: identity.fallbackStats.contributions,
    repositories: identity.fallbackStats.repositories,
    followers: identity.fallbackStats.followers,
    weeks: [],
    maxDay: 0,
    currentStreak: 0,
    busiestDay: null,
    languages: [],
    recent: [],
    fetchedAt: reason,
  };
}

function streakFrom(days: ContributionDay[]): number {
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    // Today may legitimately be 0 this early in the day -- do not break on it.
    if (days[i].count === 0) {
      if (i === days.length - 1) continue;
      break;
    }
    streak += 1;
  }
  return streak;
}

export async function getGithubData(): Promise<GithubData> {
  const login = process.env.GITHUB_LOGIN || identity.githubLogin;
  const token = process.env.GITHUB_TOKEN;

  if (!token) return fallbackGithub("no GITHUB_TOKEN set");

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "current-portfolio",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return fallbackGithub(`github responded ${res.status}`);

    const json = (await res.json()) as RawResponse;
    const user = json.data?.user;
    if (!user) return fallbackGithub(json.errors?.[0]?.message ?? "empty response");

    const calendar = user.contributionsCollection.contributionCalendar;
    const weeks: ContributionDay[][] = calendar.weeks.map((w) =>
      w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
    );
    const flat = weeks.flat();
    const maxDay = flat.reduce((m, d) => Math.max(m, d.count), 0);
    const busiestDay =
      flat.reduce<ContributionDay | null>(
        (best, d) => (best === null || d.count > best.count ? d : best),
        null,
      ) ?? null;

    /* Languages: sum bytes across recently-pushed repos. */
    const langTotals = new Map<string, LanguageSlice>();
    const pings: CommitPing[] = [];

    for (const repo of user.recentRepos.nodes) {
      if (!repo) continue;
      for (const edge of repo.languages?.edges ?? []) {
        if (!edge) continue;
        const prev = langTotals.get(edge.node.name);
        if (prev) prev.size += edge.size;
        else
          langTotals.set(edge.node.name, {
            name: edge.node.name,
            size: edge.size,
            color: edge.node.color,
          });
      }
      for (const commit of repo.defaultBranchRef?.target?.history?.nodes ?? []) {
        if (!commit) continue;
        if (commit.author?.user?.login && commit.author.user.login !== login) continue;
        pings.push({
          repo: repo.name,
          message: commit.messageHeadline,
          sha: commit.oid.slice(0, 7),
          url: commit.url,
          when: commit.committedDate,
        });
      }
    }

    const languages = [...langTotals.values()]
      .sort((a, b) => b.size - a.size)
      .slice(0, 8);

    const recent = pings
      .sort((a, b) => Date.parse(b.when) - Date.parse(a.when))
      .slice(0, 12);

    return {
      login,
      live: true,
      totalContributions: calendar.totalContributions,
      repositories: user.repoCount.totalCount,
      followers: user.followers.totalCount,
      weeks,
      maxDay,
      currentStreak: streakFrom(flat),
      busiestDay,
      languages,
      recent,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return fallbackGithub(err instanceof Error ? err.message : "fetch failed");
  }
}

/**
 * Board voltage, 0..1 -- how brightly the whole board glows.
 * Anchored so that a quiet year still reads as "on" (0.45) and a very heavy
 * year saturates at 1. Log-scaled: the difference between 200 and 2000
 * contributions should feel bigger than between 8000 and 9800.
 */
export function voltageFrom(totalContributions: number): number {
  const t = Math.max(0, totalContributions);
  const scaled = Math.log10(t + 1) / Math.log10(10001); // 10k contributions -> 1
  return Math.min(1, Math.max(0.45, 0.45 + scaled * 0.55));
}
