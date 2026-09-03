import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { identity } from "@/data/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
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
    <html lang="en" className={`${jetbrains.variable} ${grotesk.variable}`}>
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
