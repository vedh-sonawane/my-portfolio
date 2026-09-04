"use client";

/**
 * THE WORLD -- everything that lives in board coordinates.
 *
 * Node order in this file is the DOM order, and the DOM order is the narrative
 * order: ignition, name, hardware, the crossover, software, hackathons,
 * teaching, output, contact. A screen reader tabbing straight through gets the
 * story in the same sequence the camera tells it, even though every element is
 * absolutely positioned.
 */

import { forwardRef } from "react";
import { experience, hackathons, identity, projects } from "@/data/content";
import { NODES, WORLD, type BoardNode } from "@/lib/layout";
import type { GithubData } from "@/lib/github";
import type { Transmission } from "@/lib/daily";
import Substrate from "@/components/board/Substrate";
import Traces, { CurrentLayer } from "@/components/board/Traces";
import ProjectPart from "@/components/board/nodes/ProjectPart";
import { Ignition, PowerSource } from "@/components/board/nodes/PowerSource";
import RailPin from "@/components/board/nodes/RailPin";
import Amplifier from "@/components/board/nodes/Amplifier";
import OutputNode from "@/components/board/nodes/OutputNode";
import ContactTerminal from "@/components/board/nodes/ContactTerminal";
import { Beacon, FirmwarePanel, LegendPanel, StampsPanel } from "@/components/board/nodes/Panels";

const byId = (id: string) => NODES.find((n) => n.id === id) as BoardNode;

export interface WorldProps {
  reached: number;
  active: string | null;
  onActivate: (id: string | null) => void;
  github: GithubData;
  transmission: Transmission;
  voltage: number;
  /** Fly the camera to a component by id. */
  onJump: (nodeId: string) => void;
}

const World = forwardRef<HTMLDivElement, WorldProps>(function World(
  { reached, active, onActivate, github, transmission, voltage, onJump },
  ref,
) {
  const shared = { reached, active, onActivate };
  const physical = projects.filter((p) => p.half === "physical");
  const digital = projects.filter((p) => p.half === "digital");

  return (
    <div
      ref={ref}
      id="board-world"
      className="absolute top-0 left-0 origin-top-left"
      style={{ width: WORLD.w, height: WORLD.h, willChange: "transform" }}
    >
      <Substrate reached={reached} />
      <Traces reached={reached} active={active} />
      <CurrentLayer reached={reached} active={active} />

      {/* 01 -- ignition */}
      <Ignition node={byId("ignition")} armed={reached >= 1} {...shared} />

      {/* 02 -- power source / identity */}
      <PowerSource
        node={byId("hero")}
        contributions={github.totalContributions}
        onJump={onJump}
        {...shared}
      />

      {/* 03 -- physical half */}
      <h2 className="sr-only">Physical half: hardware</h2>
      {physical.map((p) => (
        <ProjectPart key={p.id} project={p} node={byId(p.id)} {...shared} />
      ))}

      {/* printed furniture on the physical half */}
      <h2 className="sr-only">Board legend: skills, firmware and stamps</h2>
      <LegendPanel node={byId("legend")} {...shared} />
      <FirmwarePanel node={byId("firmware")} {...shared} />
      <StampsPanel node={byId("stamps")} {...shared} />
      {[0, 1, 2].map((i) => (
        <Beacon key={i} index={i} node={byId(`beacon-${i}`)} {...shared} />
      ))}

      {/* 04 -- digital half */}
      <h2 className="sr-only">Digital half: software</h2>
      {digital.map((p) => (
        <ProjectPart key={p.id} project={p} node={byId(p.id)} {...shared} />
      ))}

      {/* 05 -- hackathon rail */}
      <h2 className="sr-only">Hackathon rail</h2>
      {hackathons.map((h) => (
        <RailPin key={h.id} hackathon={h} node={byId(h.id)} {...shared} />
      ))}

      {/* 06 -- amplifier */}
      <h2 className="sr-only">Experience: Code Ninjas</h2>
      <Amplifier node={byId("amp")} {...shared} />

      {/* 07 -- live output */}
      <h2 className="sr-only">Live output: GitHub telemetry</h2>
      <OutputNode
        node={byId("output")}
        github={github}
        transmission={transmission}
        voltage={voltage}
        {...shared}
      />

      {/* 08 -- contact terminal */}
      <h2 className="sr-only">Open a connection</h2>
      <ContactTerminal node={byId("contact")} {...shared} />

      {/* silkscreen board legend, bottom-left of the substrate */}
      <div
        className="pointer-events-none absolute select-none"
        style={{ left: 430, top: WORLD.h - 200, width: 1600 }}
        aria-hidden="true"
      >
        <p className="silk m-0" style={{ fontSize: 15, letterSpacing: "0.4em" }}>
          CURRENT · REV A · {identity.githubLogin}
        </p>
        <p className="silk m-0 mt-2" style={{ fontSize: 11 }}>
          {experience.org} · {identity.education.school}
        </p>
      </div>
    </div>
  );
});

export default World;
