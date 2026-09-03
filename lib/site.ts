/**
 * The canonical URL of this deployment.
 *
 * Used for `metadataBase`, the canonical link, Open Graph URLs, the sitemap and
 * robots.txt. Getting it wrong is quiet but costly: canonical tags would point
 * search engines at a different site, so the fallback chain matters.
 *
 *   1. NEXT_PUBLIC_SITE_URL          set this once a real domain is attached
 *   2. VERCEL_PROJECT_PRODUCTION_URL Vercel fills this in automatically, so a
 *                                    fresh deploy is already self-consistent
 *   3. the portfolio URL             for local development
 *
 * Note it is deliberately NOT VERCEL_URL: that changes on every deployment and
 * would make every preview claim to be the canonical copy.
 */

const FALLBACK = "https://vedh-s.vercel.app";

function resolve(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return FALLBACK;
}

export const siteUrl = resolve();
