import type { Metadata } from "next";
import Link from "next/link";
import { identity } from "@/data/content";

export const metadata: Metadata = {
  title: "Open circuit",
  robots: { index: false, follow: true },
};

/**
 * A 404 in the board's own language: the trace is there, the copper just does
 * not go anywhere. Static, silent, and it offers the two routes back.
 */
export default function NotFound() {
  return (
    <main
      id="content"
      className="grid min-h-screen place-items-center px-6 py-20"
      style={{ background: "var(--color-board)" }}
    >
      <div className="w-full max-w-lg">
        <svg
          viewBox="0 0 420 120"
          className="mb-9 w-full"
          role="img"
          aria-label="A copper trace running from the left ends at a broken gap; the trace on the right side is unpowered."
        >
          {/* incoming, energised */}
          <path
            d="M 0 60 H 150"
            fill="none"
            stroke="var(--color-trace)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <circle cx={150} cy={60} r={9} fill="var(--color-copper-lit)" />
          {/* the break */}
          <path
            d="M 168 44 L 186 60 L 168 76"
            fill="none"
            stroke="var(--color-hot)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 252 44 L 234 60 L 252 76"
            fill="none"
            stroke="var(--color-hot)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* outgoing, dead */}
          <circle cx={270} cy={60} r={9} fill="var(--color-copper)" />
          <path
            d="M 270 60 H 420"
            fill="none"
            stroke="var(--color-copper)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray="10 14"
          />
        </svg>

        <p className="silk m-0" style={{ color: "var(--color-hot)" }}>
          404 · Open circuit
        </p>
        <h1 className="font-display m-0 mt-4 text-4xl leading-tight text-ink sm:text-5xl">
          No continuity to this net.
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-ink-dim">
          The trace runs out here. Nothing is broken on your side; there is
          simply no page soldered to this address.
        </p>

        <nav className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/"
            className="silk border px-4 py-2.5 hover:text-ink"
            style={{ borderColor: "var(--color-hot)", color: "var(--color-hot)" }}
          >
            Back to the board
          </Link>
          <Link
            href="/document"
            className="silk border border-copper px-4 py-2.5 hover:border-hot hover:text-ink"
          >
            Read as document
          </Link>
          <a
            href={identity.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="silk border border-copper px-4 py-2.5 hover:border-hot hover:text-ink"
          >
            GitHub
          </a>
        </nav>
      </div>
    </main>
  );
}
