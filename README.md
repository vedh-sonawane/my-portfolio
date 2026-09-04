# CURRENT: Vedh Sonawane's portfolio

> software that doesn't always stay on a screen.

The whole site is one continuous **circuit board**. A single copper trace carries
**current** from an ignition switch in the bottom-left corner, through every
project, hackathon and piece of experience, and out to a live output terminal.
The board has two halves joined by a seam:

```
PHYSICAL HALF                    SEAM                    DIGITAL HALF
perfboard, hand-built,        the crossover           etched copper, IC
real component footprints    PHYSICAL // DIGITAL      footprints, software
```

At the seam the etched copper **stops** and a hand-soldered jumper carries the
current across. That crossover is the argument the whole site is making, so it
is the one thing the camera stops and looks straight at.

---

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in GITHUB_TOKEN (optional, see below)
npm run dev                    # http://localhost:3000
npm run build && npm start     # production
```

Deploys to Vercel with zero configuration and zero paid services. Import the
repo, leave every build setting on its default, and deploy.

### Environment variables

| Key | Required | What happens if you leave it out |
| --- | --- | --- |
| `GITHUB_TOKEN` | no, but wanted | The output node says "calendar offline" and the totals fall back to `identity.fallbackStats`. Everything else renders. |
| `GITHUB_LOGIN` | no | Falls back to `identity.githubLogin` in `data/content.ts`. Only set it to point the board at a different account. |
| `NEXT_PUBLIC_SITE_URL` | no | Falls back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, so a fresh deploy is already self-consistent. Set it once a custom domain is attached. |

On Vercel these go in Settings, Environment Variables. Environment variables are
read at build time, so a deployment that already exists will not pick up a new
value until you redeploy.

---

## Where to edit things

### Content: `data/content.ts`

This is the single hand-maintained source of truth. Everything you would
normally want to change lives here:

| What | Export |
| --- | --- |
| Name, tagline, links, education, fallback stats | `identity` |
| Every project, hardware and software | `projects` |
| Hackathons (the bottom power rail) | `hackathons` |
| Code Ninjas | `experience` |
| Clubs and volunteering | `leadership` |
| Skills (the silkscreen legend) | `legend` |
| Currently exploring / reading | `firmware` |
| Certification, awards, spoken languages | `credentials` |
| Resume path, contact links, email fragments | `identity` |
| Fallback lines for the daily TRANSMISSION | `transmissions` |

**Adding a project** takes two steps:

1. add it to `projects` in `data/content.ts`: set `half` to `"physical"` or
   `"digital"`, pick a `footprint`, and give it a `designator` (`U17`, `M2`, …);
2. give it a position in `PROJECT_SLOTS` in `lib/layout.ts`.

Everything else follows automatically: the stub trace to the row bus, the
minimap, the document view, the keyboard order and the board inventory count.

Setting `origin: "<hackathon id>"` on a project draws a **cross-wire** from that
hackathon's connector pin up to the chip: "this event produced this build".

### Layout and camera: `lib/layout.ts`

The board lives in a `4700 × 3560` world. World units are CSS pixels at scale 1.

- `BUSES`: the copper. `main` is the primary artery and is drawn with a
  gradient that changes material as it crosses the seam.
- `PROJECT_SLOTS`: where each project sits, and which row bus it stubs to.
- `STOPS`: the camera rail.

**Camera stops are framed rectangles, not zoom levels.** Each stop names a world
rectangle; the scale is derived from the viewport at runtime. That is why the
same rail works on a 380px phone and a 27" display without a second set of
numbers. A stop can declare:

- `mobileRect`: a different framing at ≤768px;
- `mobileSplit`: an array of rectangles that becomes *several* tighter stops on
  a phone, so a portrait screen frames one column of the board at a time;
- `desktopOnly`: skipped on small screens to keep the mobile rail shorter;
- `maxScale`: a ceiling on zoom.

To add a stop, add an entry to `STOPS` and point the relevant nodes at it with
`stop: stopIndex("your-id")`. The scroll driver, the HUD progress readout, the
keyboard navigation and the power-on sequencing all read from that one list.

### Motion and colour: `app/globals.css`

The target is a real board photographed under warm soft light, not an arcade
cabinet. The substrate is matte solder mask, unlit metal is bronze copper, and
energised copper shifts to a muted teal. One accent, `--color-hot` solder
amber, means *current* and appears nowhere else; that scarcity is the only
reason the current reads as alive.

`--voltage` and `--flow` are written onto the page from live GitHub activity,
so a busier year genuinely makes the board brighter and the current faster.
`--cam-scale` is written by the camera loop and drives the `.lod-*` classes, so
fine silkscreen only resolves once you are close enough to read it.

### Type

Three faces, three jobs:

| Face | Used for |
| --- | --- |
| **Martian Mono** | the silkscreen. Wide and mechanical, drawn for labelling rather than for code. Short uppercase strings only, at 75% width. |
| **Spline Sans Mono** | telemetry and body. Narrow enough to stay legible at 11px inside a component body. |
| **Instrument Serif** | the name and the tagline at the crossover, and nothing else. |

All three are self-hosted through `next/font`.

### Fabrication rules

The copper layer enforces the rules a real board obeys, because their absence
is what makes a drawing read as decorative:

- traces run horizontal, vertical or 45 degrees, never at arbitrary angles, and
  corners are chamfered (`orthPath`, `routed45`). The single exception is the
  jumper arcing over the seam, which is a wire, not copper;
- width follows role: power bus thick, distribution medium, signal thin;
- every trace flares into a **teardrop** where it meets a pad (`teardropPath`);
- **vias** punctuate the long runs;
- pads are bare copper, so they sit lighter than the mask-covered trace;
- **fiducials** and mounting holes sit at the board corners;
- reference designators are printed on the silkscreen *beside* each footprint,
  not inside it;
- nothing is empty: the unrouted area of each half is flooded with a hatched
  copper **ground pour**, tinted to that half and tiled from a 32px SVG.

---

## Live data

### GitHub: the one genuinely live source

`lib/github.ts` fetches, in a single GraphQL query, cached for five minutes:

- the contribution calendar and total contributions → **board voltage** and the
  LED matrix on the output node (re-drawn in the board's own language, not as
  GitHub's green squares);
- public repository count and followers → output-node telemetry;
- top languages by bytes → the language spectrum;
- recent commits on recently-pushed repos → the **pulse** feed, and the daily
  **TRANSMISSION**.

The whole query costs about 2 points of GitHub's 5,000-per-hour GraphQL budget,
so a five-minute window uses well under 1% of it.

Next serves cached pages with *stale-while-revalidate*: once the window lapses,
the next request still gets the cached page while a fresh one is built behind
it, and the request after that gets the new numbers. If a figure looks one
commit behind, reload once. A `git push` also triggers a Vercel build, which
regenerates the page immediately.

The contribution calendar is only available through the *authenticated* GraphQL
API, so a token is required for it:

1. create a **classic** personal access token with **no scopes ticked** (public
   data only), or a fine-grained token with read-only access to public
   repositories;
2. set it as `GITHUB_TOKEN` locally in `.env.local` and in the Vercel project's
   environment variables.

Never commit the token. `.env*` is git-ignored and `.env.example` is the
template.

**Without a token the site still builds and renders completely.** The matrix
says so plainly instead of inventing data, and the totals fall back to
`identity.fallbackStats` in `data/content.ts`.

### Devpost: no public API

Devpost does not have an official public API. There is deliberately **no code
here that calls one.** Hackathons and Devpost project entries are maintained by
hand in `data/content.ts`; they change a few times a year, which makes the
hand-maintained file the reliable option rather than the compromise.

### Links

Every project node and hackathon connector opens in a new tab, by click or by
keyboard. The repository slugs in `data/content.ts` were taken from the live
GitHub API rather than guessed, and every live URL was checked, so nothing on
the board is a 404. Three hackathons have no confirmed public event page and
are therefore deliberately not links; they are marked with a TODO in the data
file. An absent link is honest, an invented one is a dead end.

### Photographs

A project can carry an `image` in `data/content.ts`; it appears at the top of
that part's datasheet when you hover or focus it, and again in the document
view. Files live in `public/projects/` (see the README in there for the exact
names). They are served through `next/image`, so a 4MB photo straight off a
phone is resized and re-encoded on demand rather than shipped raw.

A slot whose file is missing simply does not render, so a photo can be declared
before it has been taken.

### The email

The address is never written into the HTML. `identity.emailParts` holds it in
fragments; `lib/email.ts` joins them **in the browser**, in response to a real
interaction, and builds the `mailto:` at that moment. Until then the terminal
shows an open circuit and a masked placeholder, so there is nothing for an
address harvester to scrape.

It is a real `<button>`, so Enter and Space work and it sits in the tab order
where you would expect. Activating it reveals the address, copies it, and
announces the result through an `aria-live` region. It is deliberately not done
with a CSS `::before` trick, which would break copy-paste and give a screen
reader nothing to read.

To change the address, edit the pieces in `data/content.ts` and keep them split.

### The daily detail

`lib/daily.ts` picks the TRANSMISSION line shown on the output node:

1. a real commit from the last 36 hours, if there is one. SIGNAL//LOST wins the
   tie because it rewrites itself daily by design;
2. otherwise a deterministic pick from `transmissions`, keyed by the UTC date,
   so every visitor on a given day sees the same line and it rotates at midnight
   with no storage at all.

It is computed on the server and passed down as a prop, so the client never
derives a different value and hydration stays clean.

---

## Getting around quickly

Not every visitor wants the full rail. There are three ways out of it:

- **Start here** on the name card jumps straight to one hardware build, one
  shipped product and one teaching entry;
- **Sections** in the bottom bar lists every section and jumps to it, which is
  what stops a 32-stop mobile rail from being a trap;
- **Read as document** in the header abandons the board entirely for `/document`.

## The three ways to move

| Mode | What scroll means | How you get there |
| --- | --- | --- |
| **Intro** | pulls the camera in toward the ignition switch, closes it, and solders the name into place | the first screens of the page |
| **Guided** (default, and the mobile default) | rides the current along the rail, pausing at each stop, which powers on as the camera arrives | anywhere after the intro |
| **Free roam** | the page cannot scroll; the wheel is zoom | "Explore the board", or press `E` |

The two modes never both interpret scroll. In free roam the page scroll is
locked and the whole board is energised, so you never end up exploring a dark
section.

**Keyboard**

| Key | Guided | Free roam |
| --- | --- | --- |
| `↑` `↓` `PgUp` `PgDn` `Space` | previous / next stop | n/a |
| `Home` `End` | first / last stop | n/a |
| `Tab` | move to the next component; the camera flies to it | move focus |
| `W A S D`, arrows | n/a | pan |
| `Shift` | n/a | pan faster |
| `+` `-`, wheel, pinch | n/a | zoom |
| `E` | enter free roam | return to the tour |
| `Esc` | n/a | return to the tour |

---

## Accessibility and performance notes

- **Every word on the board is real, selectable DOM text.** Nothing is rendered
  into a canvas. The node order in `components/board/World.tsx` is the narrative
  order, so tabbing through or reading with a screen reader tells the story in
  the same sequence the camera does.
- **`/document`** is the same content read straight down: the no-JavaScript
  rendering, the "read as document" escape hatch, and the linear record for
  search engines. It is in the sitemap.
- **`prefers-reduced-motion`**: the camera stops scrubbing and moves between
  stops discretely, reveals become plain fades, and the current slows from a
  travelling dash to a gentle breath. It never stops entirely, because the board should
  still read as alive.
- **The camera never goes through React.** It is written straight to the DOM
  inside one `requestAnimationFrame` loop, and the write is skipped entirely
  when the camera has not moved. Scrolling triggers no React renders at all.
  The intro's name-solder animation is a CSS custom property for the same
  reason and costs zero re-renders.
- **The current lives in its own layers.** This is the most important
  performance decision on the board. `stroke-dashoffset` is a paint property,
  not a compositor one, so animating it invalidates the whole SVG root it
  belongs to. While the current shared a root with the static copper, every
  frame repainted a 4700×3560 region dense with geometry and the board sat at
  **12fps doing nothing at all**. Each animated trace now has its own `<svg>`
  sized to its own bounding box, and the long main bus is cut into chunks at
  its corners with the dash phase carried across, so a frame repaints one thin
  strip containing one path.
- **Offscreen current stops.** The camera loop flips `data-idle` on traces that
  have left the viewport a few times a second, which pauses their animation and
  their repaint. Animation also pauses when the tab is hidden.
- **Geometry is computed once.** Every path string, bounding box and teardrop is
  built at module scope, so re-renders do no arithmetic and only flip opacities.
- **No blur filters anywhere.** A Gaussian blur over a 4700×3560 region is the
  most expensive thing you can ask a compositor to do. The sheen on a lit trace
  is the trace itself.

Measured on a full sweep of the entire rail (a far harsher motion than any real
scroll), before and after this work:

| Scenario | Before | After |
| --- | --- | --- |
| Idle at a stop | 12fps | 30fps |
| Human-speed scroll | 30fps | **60fps** |
| Full-rail sweep, worst case | 20fps | **60fps** |

Idle sits at 30fps rather than 60 because the ambient current genuinely repaints
while it flows. It is the only thing still animating, nothing the visitor does
waits on it, and the motion is slow enough that 30fps is imperceptible.

One thing deliberately **not** done: baking the static copper to a raster. It is
the textbook fix and it would take idle to 60fps, but the board is examined at
up to 2x zoom in free roam, and a baked layer would be visibly soft at exactly
the close-up stops the site is built around. Cutting the vector work in half
bought the same frames without that cost.
- Body text meets AA contrast on the board black. The amber accent is used for
  glow and emphasis, not for long-form reading.

---

## Project structure

```
app/
  layout.tsx              metadata, fonts, skip link
  page.tsx                fetches GitHub + transmission, renders the board
  document/page.tsx       the linear reading of the same content
  opengraph-image.tsx     the share card: the board in miniature
  globals.css             design tokens, textures, current, LOD, reduced motion
components/
  DocumentView.tsx        the plain record
  board/
    Board.tsx             camera, modes, HUD           (the orchestrator)
    World.tsx             everything in board coordinates
    Substrate.tsx         the two halves and the seam
    Traces.tsx            static copper + the isolated current layers
    Footprint.tsx         DIP / SOIC / QFP / module / driver / fan bodies
    Node.tsx              positioning, power-on, readout panels
    Minimap.tsx           free-roam map
    Pulse.tsx             the live commit heartbeat
    nodes/                one component per circuit role
data/content.ts           <- hand-edited source of truth
  EmailReveal.tsx         the open circuit that closes on interaction
lib/
  layout.ts               world coordinates, buses, camera stops
  email.ts                assembles the address in the browser
  site.ts                 canonical URL resolution
  camera.ts               rail interpolation and the free-roam camera
  geometry.ts             orthogonal trace routing, easing
  github.ts               live data + graceful fallbacks
  daily.ts                the daily TRANSMISSION
```
