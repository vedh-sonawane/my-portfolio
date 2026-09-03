"use client";

/**
 * The email terminal reads as an OPEN CIRCUIT until someone closes it.
 *
 * Before interaction there is no address in the DOM at all, only a masked
 * placeholder, so there is nothing for a harvester to scrape out of the
 * server-rendered HTML. Activating it assembles the address in the browser,
 * copies it, and turns the row into a genuine `mailto:` link.
 *
 * Accessibility, deliberately not sacrificed for the trick:
 *   - it is a real <button>, so Enter and Space already work and it sits in
 *     the tab order where you would expect;
 *   - the button's accessible name says what will happen, not "click here";
 *   - the result is announced through an aria-live region and shown visibly,
 *     so a sighted user and a screen-reader user get the same confirmation;
 *   - once revealed, the address is real selectable text inside a real link.
 */

import { useState } from "react";
import { assembleEmail, copyToClipboard, MASKED, mailtoHref } from "@/lib/email";

type Status = "idle" | "copied" | "revealed";

export default function EmailReveal({
  variant = "terminal",
}: {
  /** "terminal" sits on the board; "inline" is for the document view. */
  variant?: "terminal" | "inline";
}) {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function connect() {
    const value = assembleEmail();
    setAddress(value);
    const ok = await copyToClipboard(value);
    setStatus(ok ? "copied" : "revealed");
  }

  const hot = { color: "var(--color-hot)" };

  if (!address) {
    return (
      <span className="inline-flex items-center gap-2.5">
        <button
          type="button"
          onClick={connect}
          className="silk border px-2 py-1 transition-colors"
          style={{
            borderColor: "var(--color-copper)",
            color: "var(--color-hot)",
            fontSize: variant === "terminal" ? 12 : undefined,
          }}
          aria-label="Reveal the email address and copy it to the clipboard"
        >
          [ Connect ]
        </button>
        <span
          aria-hidden="true"
          className="select-none"
          style={{
            color: "var(--color-silk-dim)",
            fontSize: variant === "terminal" ? 15 : 13,
            letterSpacing: "0.05em",
          }}
        >
          {MASKED}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <a
        href={mailtoHref()}
        className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
        style={{
          ...hot,
          fontSize: variant === "terminal" ? 17 : undefined,
        }}
      >
        {address}
      </a>
      <span className="silk" role="status" aria-live="polite">
        {status === "copied" ? "Circuit closed · copied" : "Circuit closed"}
      </span>
    </span>
  );
}
