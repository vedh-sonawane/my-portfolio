import type { Metadata } from "next";
import Link from "next/link";
import DocumentView from "@/components/DocumentView";
import { dailyTransmission } from "@/lib/daily";
import { getGithubData } from "@/lib/github";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Portfolio, read straight down",
  description:
    "Every project, hackathon, skill and link from Vedh Sonawane's portfolio, as a plain linear document.",
  alternates: { canonical: "/document" },
};

export default async function DocumentPage() {
  const github = await getGithubData();
  const transmission = dailyTransmission(github);

  return (
    <main id="content">
      <nav className="border-b border-copper/50 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="silk hover:text-ink"
          style={{ color: "var(--color-hot)" }}
        >
          &larr; Back to the board
        </Link>
      </nav>
      <DocumentView github={github} transmission={transmission} />
    </main>
  );
}
