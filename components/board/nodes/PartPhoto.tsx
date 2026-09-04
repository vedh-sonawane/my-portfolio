"use client";

/**
 * The photograph in a part's datasheet.
 *
 * The claim this whole site makes is that the software does not always stay on
 * a screen, and a picture of the actual rig is the only thing that really
 * proves it. So the hardware parts carry one.
 *
 * Served through `next/image`, which resizes and re-encodes on the fly. That
 * matters here because these are camera photographs: a 4MB JPEG dropped into
 * `public/projects/` becomes a ~40KB WebP at the size it is actually drawn,
 * without anyone having to remember to compress it first.
 *
 * If the file is not there yet the figure removes itself rather than leaving a
 * broken image, so a slot can be declared in `data/content.ts` before the
 * photo exists.
 */

import Image from "next/image";
import { useState } from "react";

export default function PartPhoto({
  src,
  alt,
  height = 190,
}: {
  src: string;
  alt: string;
  height?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <figure
      className="relative m-0 mb-3 overflow-hidden"
      style={{
        height,
        border: "1px solid var(--color-copper)",
        background: "var(--color-board)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="440px"
        onError={() => setFailed(true)}
        style={{ objectFit: "cover" }}
      />
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-silk) 14%, transparent)",
        }}
        aria-hidden="true"
      />
    </figure>
  );
}
