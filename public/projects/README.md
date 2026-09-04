# Project photographs

Drop image files here using these exact names. They are referenced from
`data/content.ts` (the `image` field on each project).

| File | Project |
| --- | --- |
| `rover.jpg` | Rover |
| `kivo.jpg` | Kivo |
| `breezebrain.jpg` | BreezeBrain |
| `penghost.jpg` | PenGhost |

Any format works (`.jpg`, `.png`, `.webp`); if you use a different extension,
update the `image.src` path in `data/content.ts` to match.

Do not bother compressing them first. They are served through `next/image`,
which resizes and re-encodes on demand, so a 4MB photo straight off a phone
becomes roughly 40KB at the size it is actually drawn.

A slot whose file is missing simply does not render, so it is safe to declare a
photo before you have taken it.

If you add a photo for a software project too, add an `image` field to that
entry in `data/content.ts` and drop the file here under any name you like.
