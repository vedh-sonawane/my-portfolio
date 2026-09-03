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

One accent (`--color-hot`, solder amber) means *current* and nothing else.
`--voltage` and `--flow` are written onto the page from live GitHub activity, so
a busier year genuinely makes the board brighter and the current faster.
`--cam-scale` is written by the camera loop and drives the `.lod-*` classes, so
fine silkscreen only resolves once you are close enough to read it.

---

## Live data

### GitHub: the one genuinely live source

`lib/github.ts` fetches, in a single GraphQL query, cached for one hour:

- the contribution calendar and total contributions → **board voltage** and the
  LED matrix on the output node (re-drawn in the board's own language, not as
  GitHub's green squares);
- public repository count and followers → output-node telemetry;
- top languages by bytes → the language spectrum;
- recent commits on recently-pushed repos → the **pulse** feed, and the daily
  **TRANSMISSION**.

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
  inside one `requestAnimationFrame` loop, so panning stays smooth no matter how
  much of the board is mounted. The intro's name-solder animation is a CSS
  custom property for the same reason and costs zero re-renders.
- **Glow is geometry, not filters.** Every "glowing" trace is a wide faint
  stroke under a narrow bright one; a Gaussian blur over a 4700×3560 region
  would be the single most expensive thing to composite.
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
    Traces.tsx            the copper layer and the crossover
    Footprint.tsx         DIP / SOIC / QFP / module / driver / fan bodies
    Node.tsx              positioning, power-on, readout panels
    Minimap.tsx           free-roam map
    Pulse.tsx             the live commit heartbeat
    nodes/                one component per circuit role
data/content.ts           ← hand-edited source of truth
lib/
  layout.ts               world coordinates, buses, camera stops
  camera.ts               rail interpolation and the free-roam camera
  geometry.ts             orthogonal trace routing, easing
  github.ts               live data + graceful fallbacks
  daily.ts                the daily TRANSMISSION
```
