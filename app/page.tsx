import type { CSSProperties } from "react";
import Board from "@/components/board/Board";
import { dailyTransmission } from "@/lib/daily";
import { getGithubData, voltageFrom } from "@/lib/github";

/** Live GitHub data is cached for an hour; see lib/github.ts. */
export const revalidate = 3600;

export default async function Home() {
  const github = await getGithubData();
  const transmission = dailyTransmission(github);
  const voltage = voltageFrom(github.totalContributions);

  return (
    <main
      id="content"
      style={
        {
          // Board brightness and current speed are driven by real activity.
          "--voltage": voltage.toFixed(3),
          "--flow": (0.7 + voltage * 0.6).toFixed(3),
        } as CSSProperties
      }
    >
      <Board github={github} transmission={transmission} voltage={voltage} />
    </main>
  );
}
