import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Martian_Mono, Spline_Sans_Mono } from "next/font/google";
import { identity } from "@/data/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

/**
 * Three faces, three jobs, none of them a code-editor default.
 *
 *   Martian Mono      the silkscreen. Wide, mechanical, drawn for labelling
 *                     rather than for reading code. Short uppercase strings
 *                     only: designators, telemetry keys, HUD chrome.
 *   Spline Sans Mono  the telemetry readout. Narrow enough to stay legible at
 *                     11px inside a component body, with more character than
 *                     the usual monospace.
 *   Instrument Serif  the name. A sharp editorial serif is the last thing you
 *                     expect on a circuit board, which is exactly why the
 *                     identity stops reading as a template.
 */
const silk = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-silk-face",
  display: "swap",
  axes: ["wdth"],
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display-face",
  weight: "400",
  display: "swap",
});

const description =
  "Vedh Sonawane builds full-stack software, AI agents and things you can pick up: autonomous rovers, embedded companions, Slack agents and a self-rewriting ARG. A portfolio laid out as a live circuit board.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${identity.name} // ${identity.tagline}`,
    template: `%s // ${identity.name}`,
  },
  description,
  applicationName: "CURRENT",
  authors: [{ name: identity.name, url: identity.links.github }],
  creator: identity.name,
  keywords: [
    "Vedh Sonawane",
    "full-stack developer",
    "AI developer",
    "Arduino",
    "robotics",
    "computer vision",
    "Next.js",
    "TypeScript",
    "Python",
    "hackathons",
    "Toronto",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: identity.name,
    title: `${identity.name} // ${identity.tagline}`,
    description,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: `${identity.name} // ${identity.tagline}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04070a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${mono.variable} ${silk.variable} ${display.variable}`}
    >
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
