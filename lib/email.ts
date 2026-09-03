/**
 * The address is never written into the HTML.
 *
 * `identity.emailParts` holds it in fragments so that no contiguous copy of it
 * exists in the server-rendered markup, which is what address harvesters read.
 * It is joined only in the browser, in response to a real interaction, and the
 * `mailto:` href is built at that moment rather than shipped.
 *
 * This is deliberately NOT done with a CSS `::before` trick: that would break
 * copy and paste and would hand a screen reader nothing to announce.
 */

import { identity } from "@/data/content";

export function assembleEmail(): string {
  return identity.emailParts.join("");
}

export function mailtoHref(): string {
  return `mailto:${assembleEmail()}`;
}

/** What stands in for the address until someone closes the circuit. */
export const MASKED = "•".repeat(9) + "@" + "•".repeat(5) + ".com";

/** Best-effort clipboard write. Returns false rather than throwing. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
