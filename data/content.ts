/**
 * ============================================================================
 *  SOURCE OF TRUTH -- hand-maintained content.
 * ============================================================================
 *
 *  EDIT THIS FILE to change anything about the site's content:
 *    - identity / links / education ......... `identity`
 *    - hardware + software projects ......... `projects`  (set `half` to place
 *                                             them on the PHYSICAL or DIGITAL
 *                                             side of the board)
 *    - hackathons (the bottom power rail) ... `hackathons`
 *    - Code Ninjas + leadership ............. `experience`, `leadership`
 *    - skills (the silkscreen legend) ....... `legend`
 *    - currently exploring / reading ........ `firmware`
 *    - awards / certs / spoken languages .... `credentials`
 *    - daily TRANSMISSION lines ............. `transmissions`
 *
 *  NOTE ON DEVPOST: Devpost has **no public API**. Hackathons and Devpost
 *  project entries are therefore maintained by hand, right here. They change a
 *  few times a year, so this is deliberate -- not a limitation to work around.
 *
 *  NOTE ON GITHUB: everything in `identity.fallbackStats` is only used when the
 *  live GitHub API is unavailable. Live data comes from `lib/github.ts`.
 *
 *  Node POSITIONS are NOT in this file -- they live in `lib/layout.ts`, which
 *  reads these ids. If you add a project here, give it a position there too.
 * ============================================================================
 */

export type Half = "physical" | "digital";

/** Component footprint drawn for a node. The physical half uses real parts. */
export type Footprint =
  | "dip" // through-hole IC, pins down both sides   (digital, featured)
  | "soic" // small surface-mount chip                (digital)
  | "qfp" // square chip, pins on all four sides      (digital, featured)
  | "module" // sensor / breakout board                (physical)
  | "driver" // motor driver + screw terminals         (physical)
  | "fan"; // fan header + thermal part                (physical)

export interface Project {
  id: string;
  /** Silkscreen reference designator, e.g. "U4", "M1". */
  designator: string;
  name: string;
  half: Half;
  footprint: Footprint;
  /** Featured parts are drawn larger and get a fuller readout. */
  featured?: boolean;
  /**
   * Set when a project is not finished, e.g. "In build". Printed as a tag on
   * the silkscreen so nothing on the board overclaims.
   */
  status?: string;
  /** One line. Shown on the board without interaction. */
  blurb: string;
  /** Expanded readout, shown on hover / focus. */
  detail: string;
  tech: string[];
  /**
   * Repository slugs under github.com/<githubLogin>/. repos[0] is what the
   * node itself opens; the rest are listed in the readout. Every slug here was
   * checked against the live GitHub API, so none of these 404.
   */
  repos?: string[];
  /** A deployment a visitor can actually open. Verified reachable. */
  live?: string;
  /**
   * A photograph or screenshot, shown in the readout panel. Put the file in
   * `public/projects/`. If the file is missing the figure simply does not
   * render, so a slot can be declared before the photo exists.
   */
  image?: { src: string; alt: string };
  /** id of the hackathon this was built at -- draws a cross-wire on the board. */
  origin?: string;
}

export interface Hackathon {
  id: string;
  /** Connector pin designator, e.g. "J3". */
  designator: string;
  name: string;
  location: string;
  date: string;
  /** Machine-sortable, for the chronological left-to-right rail. */
  sort: string;
  note?: string;
  /**
   * The event's own page. Devpost has no API, so these are hand-checked.
   * Left undefined where no public page could be confirmed: an absent link is
   * honest, an invented one is a 404.
   */
  url?: string;
}

/* --------------------------------------------------------------------------
   IDENTITY
   -------------------------------------------------------------------------- */

export const identity = {
  name: "Vedh Sonawane",
  pronouns: "he/him",
  tagline: "software that doesn't always stay on a screen.",
  location: "Oakville / Toronto, Ontario, Canada",
  role: "Lead Sensei & Application Developer @ Code Ninjas",
  education: {
    school: "Abbey Park High School, Ontario",
    detail: "Expected graduation 2030",
  },
  links: {
    portfolio: "https://vedh-s.vercel.app/",
    github: "https://github.com/vedh-sonawane",
    devpost: "https://devpost.com/sonawane-vedh14",
    linkedin: "https://www.linkedin.com/in/vedh-sonawane-60a0753bb/",
  },
  /**
   * Served straight from `public/`. Recruiters look for this first, so it gets
   * its own terminal on the contact block rather than being buried.
   */
  resume: "/Vedh-Sonawane-Resume.pdf",
  /**
   * The email, in fragments. Joined only in the browser (see lib/email.ts) so
   * no contiguous copy of the address ever reaches the server-rendered HTML,
   * which is what address harvesters read. Edit the pieces, not a whole
   * string, and keep them split.
   */
  emailParts: ["sonawane", ".vedh14", "@", "gmail", ".com"],
  githubLogin: "vedh-sonawane",
  /** Used verbatim when the live GitHub API is unreachable. */
  fallbackStats: {
    repositories: 30,
    contributions: 9991,
    followers: 8,
  },
};

/* --------------------------------------------------------------------------
   PROJECTS -- half: "physical" = left of the seam, "digital" = right of it
   -------------------------------------------------------------------------- */

/** Full URL for a repository slug. */
export const repoUrl = (slug: string) =>
  `https://github.com/${identity.githubLogin}/${slug}`;

export const projects: Project[] = [
  /* -- PHYSICAL HALF ----------------------------------------------------- */
  {
    id: "rover",
    designator: "M1",
    name: "Rover",
    half: "physical",
    footprint: "driver",
    featured: true,
    blurb: "Autonomous AI mobile assistant on an RC-car chassis.",
    detail:
      "An RC-car chassis rebuilt into an autonomous assistant: Arduino motor control underneath, computer vision on top, and onboard decision-making that closes the loop between what it sees and where it drives. Sensors feed obstacle and target data back into the control layer in real time.",
    tech: ["Python", "OpenCV", "Arduino"],
    repos: ["rover"],
    image: {
      src: "/projects/rover.jpg",
      alt:
        "Rover on a white bench: a four-wheeled RC chassis carrying a stacked aluminium deck with an Arduino Uno, a 16x2 LCD, a breadboard, a camera module and a pair of ultrasonic sensors at the front, tethered by a coiled cable to a laptop showing a running terminal.",
    },
  },
  {
    id: "kivo",
    designator: "MOD1",
    name: "Kivo",
    half: "physical",
    footprint: "module",
    featured: true,
    blurb: "AI physical desk companion built on an Arduino Uno.",
    detail:
      "A desk companion that is equal parts firmware and intelligence: embedded C++ on an Arduino Uno drives the hardware and motion, while a Python layer handles the reasoning and automation. The two halves talk over serial, which is the clearest small example of software leaving the screen.",
    tech: ["Python", "C++", "Arduino"],
    repos: ["kivo"],
    image: {
      src: "/projects/kivo.jpg",
      alt:
        "Kivo on a desk: an Elegoo Arduino Uno wired across two breadboards to a blue-backlit 16x2 LCD showing a remembered note and a 24 minute focus timer, with a micro servo, a PIR motion sensor, an HC-SR04 ultrasonic rangefinder and a light sensor wired in beside it.",
    },
  },
  {
    id: "breezebrain",
    designator: "FAN1",
    name: "BreezeBrain",
    half: "physical",
    footprint: "fan",
    blurb: "Smart desktop cooling system on an Arduino Uno R3.",
    detail:
      "Continuous temperature monitoring drives automatic fan-speed control, with real-time telemetry on an LCD and interactive controls for overriding the curve. A closed control loop you can hold your hand in front of and watch respond.",
    tech: ["C++", "Arduino"],
    repos: ["breeze_brain"],
    image: {
      src: "/projects/breezebrain.jpg",
      alt:
        "The BreezeBrain rig: an Arduino wired across a breadboard to a 16x2 LCD reading MANUAL SPEED 3200 RPM, an 80mm case fan, a speaker and a row of control buttons, all mounted on a grey panel.",
    },
  },

  {
    id: "penghost",
    designator: "M2",
    name: "PenGhost",
    half: "physical",
    footprint: "driver",
    featured: true,
    status: "In build",
    blurb: "A mini CNC pen plotter built out of dead DVD drives.",
    detail:
      "Two salvaged DVD drive sleds provide the X and Y motion, an old hard drive becomes the base, and a single servo lifts the pen. An Arduino Uno drives the whole thing through an L293D motor shield. Almost every moving part came out of something that was already broken, which is the point: e-waste turned into a machine that draws with precision.",
    tech: ["Arduino", "CNC", "Salvaged hardware"],
    repos: ["penghost"],
    image: {
      src: "/projects/penghost.jpg",
      alt:
        "The PenGhost build laid out on a wooden floor: a stripped optical drive chassis with two discs used as platters, a blue micro servo, a marker pen taped to a cardboard arm, PLACE PAPER written by hand on one disc, and an Elegoo Arduino Uno wired in beside it.",
    },
  },

  /* -- DIGITAL HALF ------------------------------------------------------ */
  {
    id: "destiny",
    designator: "U1",
    name: "Destiny",
    half: "digital",
    footprint: "qfp",
    featured: true,
    blurb: "Local AI command centre for Windows.",
    detail:
      "A single command palette that sits over the whole machine: system monitoring, project management, file search, and persistent memory, with sandboxed AI tool-calling so the model can actually act instead of only answering. Runs locally, so nothing leaves the desk.",
    tech: ["Python", "LLM tool calling"],
    repos: ["destiny"],
  },
  {
    id: "volo",
    designator: "U2",
    name: "Volo",
    half: "digital",
    footprint: "qfp",
    featured: true,
    blurb: "Autonomous task-execution platform.",
    detail:
      "Give it a high-level goal and it produces a finished outcome, not a plan: it researches, decomposes the goal into steps, and executes end-to-end, reporting what it did at each stage.",
    tech: ["TypeScript"],
    repos: ["volo"],
  },
  {
    id: "vibecheck",
    designator: "U3",
    name: "VibeCheck",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb:
      "Slack team-health agent that flags burnout and resignation risk weeks early.",
    detail:
      "Reads behavioural signals only (response timing, participation patterns, thread engagement) and never message content, which is what makes it deployable at all. Surfaces risk weeks before someone hands in notice. Built on the Canvas API, Block Kit and MCP.",
    tech: ["Node.js", "TypeScript", "PostgreSQL", "Slack API"],
    origin: "slack-agent",
    repos: ["vibecheck"],
  },
  {
    id: "neural-flux",
    designator: "U4",
    name: "Neural Flux",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb: "A game where you play as the AI answering humans under time pressure.",
    detail:
      "Role reversal as a game mechanic: you are the model, the requests keep coming, and the clock is running. Scenarios are AI-generated fresh each run, and you are scored on both speed and judgment, which turns out to be a surprisingly good argument about what these systems are actually doing.",
    tech: ["TypeScript"],
    origin: "deltahacks-12",
    repos: ["neural-flux"],
    live: "https://neural-flux-rg5p.vercel.app/",
  },
  {
    id: "promptdeck",
    designator: "U5",
    name: "PromptDeck",
    half: "digital",
    footprint: "soic",
    blurb: "One prompt in, a full Google Slides deck out.",
    detail:
      "Turns a single prompt into a complete presentation: dynamic themes, generated structure, and real sourced images rather than placeholder boxes. Groq handles inference; FastAPI does the slide assembly.",
    tech: ["Next.js", "FastAPI", "Groq"],
    repos: ["prompt-deck"],
  },
  {
    id: "bytee",
    designator: "U6",
    name: "Bytee",
    half: "digital",
    footprint: "soic",
    blurb: "Fridge and pantry tracker that fights food waste.",
    detail:
      "Tracks what you actually have, warns before it expires, suggests recipes from current inventory, and lets neighbours share surplus instead of binning it.",
    tech: ["TypeScript"],
    repos: ["bytee"],
    live: "https://bytee-six.vercel.app/",
  },
  {
    id: "eurekahacks-portal",
    designator: "U7",
    name: "EurekaHACKS Application Portal",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb: "The application portal a real hackathon ran on.",
    detail:
      "Multi-step registration with draft autosave on the applicant side; on the organizer side, a dashboard for scoring applications, making accept/reject decisions, and firing automated decision emails. Built for EurekaHacks after competing there.",
    tech: ["React", "TypeScript", "PostgreSQL", "serverless"],
    origin: "eurekahacks-2026",
    repos: ["eurekawebdev"],
    live: "https://eureka-vedh.vercel.app/",
  },
  {
    id: "vow",
    designator: "U8",
    name: "Vow",
    half: "digital",
    footprint: "qfp",
    featured: true,
    blurb: "Group-habit PWA where the streak belongs to everyone.",
    detail:
      "Small groups make one shared daily commitment. Miss it without spending a wildcard and the whole group's streak resets. The social stake is the product. Google auth, row-level security, realtime sync, and browser-native Web Push fired from a Vercel cron.",
    tech: ["Next.js 15", "TypeScript", "Supabase", "Tailwind v4"],
    live: "https://vow-three.vercel.app",
  },
  {
    id: "ml-from-scratch",
    designator: "U9",
    name: "ML From Scratch",
    half: "digital",
    footprint: "soic",
    blurb: "Linear regression, KNN, SVM and diagnostics, with no scikit-learn.",
    detail:
      "Every algorithm implemented from first principles in NumPy, including the classification diagnostics used to evaluate them. Written to understand the maths rather than to call the library.",
    tech: ["Python", "NumPy"],
    // Four repositories, one per algorithm, built separately.
    repos: [
      "linear-regression",
      "knn-nearest-neighbours",
      "svm-support-vector-machines",
      "classification-model-diagnostic-simulator",
    ],
  },
  {
    id: "fraudgen",
    designator: "U10",
    name: "FraudGen",
    half: "digital",
    footprint: "soic",
    blurb: "Synthetic fraud variants so detection models train ahead of the attack.",
    detail:
      "Generates new fraud patterns that have not appeared in production yet, so detection models see the next attack shape during training instead of after the loss.",
    tech: ["Python"],
    repos: ["fraud-gen"],
  },
  {
    id: "soar",
    designator: "U11",
    name: "Soar",
    half: "digital",
    footprint: "soic",
    blurb: "Turns social-media swipes into a real itinerary.",
    detail:
      "Swipe through travel content the way you already do, and Soar assembles the places you liked into an actual routed itinerary with timings, closing the gap between inspiration and a plan.",
    tech: ["TypeScript"],
    origin: "eurekahacks-2026",
    repos: ["EurekaHacks"],
    live: "https://eureka-hacks.vercel.app",
  },
  {
    id: "signal-lost",
    designator: "U12",
    name: "SIGNAL//LOST",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb: "A self-evolving GitHub ARG that rewrites itself every day.",
    detail:
      "An AI rewrites the repository's README daily with new lore and a new puzzle. The community solves it through pull requests and issues, and the story branches based on what they find. The repo is the game board.",
    tech: ["Python"],
    repos: ["SIGNAL-LOST"],
  },
  {
    id: "forme",
    designator: "U17",
    name: "Forme",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb: "Learns design from real websites, then designs with it.",
    detail:
      "Analyses high-quality websites and screenshots to work out the patterns underneath them: typography, layout, colour, spacing, visual hierarchy. It keeps that as a Design DNA, uses it to generate or redesign a site, critiques the result visually, and iterates on its own output.",
    tech: ["TypeScript", "Vision models"],
    repos: ["forme"],
  },
  {
    id: "sentinel-ai",
    designator: "U18",
    name: "Sentinel AI",
    half: "digital",
    footprint: "dip",
    featured: true,
    blurb: "Multi-agent platform: fraud, health, memory, explainability.",
    detail:
      "A production-ready full-stack platform built on a modular architecture, with separate agents for fraud detection, health, memory and explainability working together behind one interface. Deliberately general enough to compete across very different hackathon tracks.",
    tech: ["Python", "Multi-agent", "Full-stack"],
    repos: ["sentinel-ai"],
  },
  {
    id: "casperguard",
    designator: "U13",
    name: "CasperGuard",
    half: "digital",
    footprint: "soic",
    blurb: "WebAssembly security tooling.",
    detail:
      "Tooling aimed at the WebAssembly attack surface: inspecting and hardening modules that increasingly run untrusted code inside the browser sandbox.",
    tech: ["WebAssembly"],
    repos: ["casperguard"],
    live: "https://casperguard.vercel.app",
  },
  {
    id: "aquapress",
    designator: "U14",
    name: "AquaPress",
    half: "digital",
    footprint: "soic",
    blurb: "Hydraulic waste-compaction concept.",
    detail:
      "A concept build around hydraulic waste compaction, modelling the mechanism and the control software that would run it.",
    tech: ["TypeScript"],
    repos: ["aquapress"],
    live: "https://aquapress.vercel.app",
  },
  {
    id: "typeflow",
    designator: "U15",
    name: "TypeFlow",
    half: "digital",
    footprint: "soic",
    blurb: "Human typing simulator.",
    detail:
      "Reproduces the cadence, hesitation and error-correction of real human typing through PyAutoGUI, instead of the machine-perfect keystroke bursts automation usually produces.",
    tech: ["Python", "PyAutoGUI"],
    repos: ["typeflow"],
  },
  {
    id: "skypulse",
    designator: "U16",
    name: "SkyPulse",
    half: "digital",
    footprint: "soic",
    blurb: "Live weather and air-quality app.",
    detail:
      "Current conditions and air quality pulled live and rendered for a glance rather than a read.",
    tech: ["TypeScript", "REST APIs"],
    repos: ["sky-pulse"],
  },
];

/* --------------------------------------------------------------------------
   HACKATHONS -- the bottom power rail, drawn chronologically left to right.
   Devpost has no public API; keep this list current by hand.
   -------------------------------------------------------------------------- */

export const hackathons: Hackathon[] = [
  {
    id: "hack-the-ridge-2025",
    designator: "J1",
    name: "Hack The Ridge 2025",
    location: "Oakville, ON",
    date: "Dec 2025",
    sort: "2025-12",
    note: "Submitted",
    url: "https://hacktheridge.devpost.com",
  },
  {
    id: "deltahacks-12",
    designator: "J2",
    name: "DeltaHacks 12",
    location: "Hamilton, ON",
    date: "Jan 2026",
    sort: "2026-01",
    url: "https://deltahacks-12.devpost.com",
  },
  {
    id: "genai-genesis-2026",
    designator: "J3",
    name: "GenAI Genesis 2026",
    location: "Toronto, ON",
    date: "Mar 2026",
    sort: "2026-03",
    url: "https://genai-genesis-2026.devpost.com",
  },
  {
    id: "eurekahacks-2026",
    designator: "J4",
    name: "EurekaHacks 2026",
    location: "Waterloo, ON",
    date: "May 2026",
    sort: "2026-05",
    url: "https://eurekahacks.ca",
  },
  {
    id: "slack-agent",
    designator: "J5",
    name: "Slack Agent Builder Challenge",
    location: "Online",
    date: "2026",
    sort: "2026-06",
    // TODO: no public event page confirmed. Add the Devpost URL here.
  },
  {
    id: "uipath-agenthack",
    designator: "J6",
    name: "UiPath AgentHack",
    location: "Online",
    date: "2026",
    sort: "2026-07",
    // TODO: no public event page confirmed. Add the Devpost URL here.
  },
  {
    id: "h0-zero-stack",
    designator: "J7",
    name: "H0: Hack the Zero Stack",
    location: "Online / Vercel v0 + AWS",
    date: "2026",
    sort: "2026-08",
    // TODO: no public event page confirmed. Add the Devpost URL here.
  },
];

/* --------------------------------------------------------------------------
   EXPERIENCE -- drawn as a signal amplifier: students in, capability out.
   -------------------------------------------------------------------------- */

export const experience = {
  designator: "AMP1",
  role: "Lead Sensei & Application Developer",
  org: "Code Ninjas",
  input: "100+ students",
  output: "shipped projects",
  gain: "20% enrolment growth",
  summary:
    "Teaches and mentors 100+ students in Python, JavaScript, C#, Unity and MakeCode Arcade, from a first block-code lesson through to working projects.",
  points: [
    "Runs project-based bootcamps, coaching debugging and root-cause analysis rather than answers.",
    "Built Python mini-projects and automation scripts now used as teaching material.",
    "Contributed to 20% growth in student enrolment.",
  ],
  stack: ["Python", "JavaScript", "C#", "Unity", "MakeCode Arcade"],
};

/* --------------------------------------------------------------------------
   LEADERSHIP -- small indicator beacons off the main bus.
   -------------------------------------------------------------------------- */

export const leadership = [
  {
    id: "python-club",
    designator: "D1",
    name: "Python Club, Founder",
    detail:
      "Founded the school's Python Club: designed the curriculum and taught every level, from absolute beginners to students shipping their own tools. Recognized by the school.",
  },
  {
    id: "leadership-club",
    designator: "D2",
    name: "Leadership Club",
    detail:
      "Ran school-wide holiday events for kids aged 5 to 12: scheduling, activity design, and day-of coordination.",
  },
  {
    id: "community",
    designator: "D3",
    name: "Community Volunteering",
    detail:
      "Learning Buddies, Wee Walkers and Pizza Helpers, plus ongoing community-centre volunteering.",
  },
];

/* --------------------------------------------------------------------------
   SILKSCREEN LEGEND -- the printed parts index in the corner of the board.
   -------------------------------------------------------------------------- */

export const legend: { key: string; label: string; items: string[] }[] = [
  {
    key: "LANG",
    label: "Languages",
    items: [
      "Python",
      "TypeScript",
      "JavaScript",
      "C#",
      "C++",
      "Rust",
      "SQL",
      "HTML",
      "CSS",
      "Bash",
    ],
  },
  {
    key: "WEB",
    label: "Web & Data",
    items: [
      "Next.js",
      "React",
      "Vue",
      "Tailwind",
      "shadcn/ui",
      "Three.js",
      "Node.js",
      "FastAPI",
      "Supabase",
      "PostgreSQL",
      "REST APIs",
    ],
  },
  {
    key: "AI",
    label: "AI & ML",
    items: [
      "OpenAI API",
      "Groq",
      "Gemini",
      "MCP",
      "Prompt engineering",
      "LLM agents",
      "OpenCV",
      "NumPy",
      "Core ML from scratch",
    ],
  },
  {
    key: "TOOL",
    label: "Tools & Hardware",
    items: [
      "Git/GitHub",
      "Vercel",
      "AWS",
      "Docker",
      "Figma",
      "Unity",
      "Arduino",
      "Slack",
      "Google Workspace",
      "MS Office",
    ],
  },
];

/* --------------------------------------------------------------------------
   FIRMWARE READOUT -- "currently".
   -------------------------------------------------------------------------- */

export const firmware = {
  version: "v2026.09",
  exploring: [
    "Diffusion models",
    "Transformer architectures",
    "Reinforcement learning",
  ],
  reading: [
    { title: "Deep Learning", author: "Goodfellow, Bengio & Courville" },
    { title: "Designing Data-Intensive Applications", author: "Kleppmann" },
  ],
};

/* --------------------------------------------------------------------------
   CREDENTIALS -- etched labels beside the legend. The cert is a chip stamp.
   -------------------------------------------------------------------------- */

export const credentials = {
  certification: {
    stamp: "PCEP",
    name: "Certified Entry-Level Python Programmer",
    issuer: "Python Institute",
  },
  awards: [{ name: "Mathalon Knowledgehook Medal", year: "2023" }],
  spoken: ["English", "French", "Hindi"],
};

/* --------------------------------------------------------------------------
   TRANSMISSION -- the daily-changing detail (see lib/daily.ts).
   A deterministic pick keyed by date, used when no live commit is available.
   -------------------------------------------------------------------------- */

export const transmissions: string[] = [
  "BOARD NOMINAL // all rails within tolerance",
  "TRACE 07 REROUTED // physical half drawing more current than expected",
  "SIGNAL//LOST rewrote its own README again overnight",
  "AMP1 SATURATED // one hundred students is a lot of gain",
  "SEAM INTEGRITY 100% // the crossover is holding",
  "LISTENING ON THE HARDWARE BUS // something is still blinking",
  "COLD SOLDER JOINT SUSPECTED // it works anyway",
  "FIRMWARE FLASHED // diffusion models loaded into working memory",
  "M1 ODOMETRY DRIFTING // the rover thinks it is somewhere it is not",
  "CLOCK STABLE // seven hackathons since the last reset",
  "THERMAL MARGIN OK // BreezeBrain is doing its job",
  "OUTPUT TERMINAL OPEN // connection accepted",
  "SCANNING FOR NEW ATTACK PATTERNS // FraudGen is generating",
  "NEW BUILD DETECTED ON THE DIGITAL HALF",
];
