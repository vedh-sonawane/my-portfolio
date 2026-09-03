import { ImageResponse } from "next/og";
import { identity } from "@/data/content";

export const alt = `${identity.name}: ${identity.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card is the board in miniature: perfboard on the left, etched
 * copper on the right, and the jumper carrying the current across the seam.
 * Drawn as one inline SVG so it renders without any font or asset fetch.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#04070a",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute" }}>
          {/* perfboard drill grid, physical half */}
          {Array.from({ length: 19 }, (_, r) =>
            Array.from({ length: 18 }, (_, c) => (
              <circle
                key={`p${r}-${c}`}
                cx={22 + c * 32}
                cy={20 + r * 34}
                r={2}
                fill="#d3bda0"
                opacity={0.16}
              />
            )),
          )}
          {/* etched grid, digital half */}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={660 + i * 54}
              y1={0}
              x2={660 + i * 54}
              y2={630}
              stroke="#123b46"
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={660}
              y1={i * 54}
              x2={1200}
              y2={i * 54}
              stroke="#123b46"
              strokeWidth={1}
            />
          ))}

          {/* the seam */}
          <rect x={548} y={0} width={96} height={630} fill="#04070a" />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={`s${i}`} cx={596} cy={40 + i * 80} r={4} fill="#1b4c58" />
          ))}

          {/* main bus: tan copper -> hot solder -> etched cyan */}
          <line x1={0} y1={556} x2={548} y2={556} stroke="#d3bda0" strokeWidth={8} opacity={0.9} />
          <line x1={644} y1={556} x2={1200} y2={556} stroke="#2ec9c0" strokeWidth={8} />
          <line x1={700} y1={556} x2={700} y2={140} stroke="#2ec9c0" strokeWidth={5} />
          <line x1={700} y1={140} x2={1160} y2={140} stroke="#2ec9c0" strokeWidth={5} />

          {/* the jumper crossing the seam */}
          <path
            d="M 548 556 C 562 430, 630 430, 644 556"
            fill="none"
            stroke="#ff9d3d"
            strokeWidth={30}
            opacity={0.16}
          />
          <path
            d="M 548 556 C 562 430, 630 430, 644 556"
            fill="none"
            stroke="#ff9d3d"
            strokeWidth={10}
          />
          <circle cx={548} cy={556} r={15} fill="#ff9d3d" />
          <circle cx={644} cy={556} r={15} fill="#ff9d3d" />

          {/* a few component footprints on the digital half */}
          {[
            [740, 232],
            [910, 232],
            [1050, 232],
          ].map(([x, y]) => (
            <g key={`c${x}`}>
              <rect x={x} y={y} width={110} height={78} fill="#0a1016" stroke="#2ec9c0" strokeWidth={2} />
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={i} x={x - 12} y={y + 10 + i * 14} width={12} height={5} fill="#2ec9c0" />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <rect key={`r${i}`} x={x + 110} y={y + 10 + i * 14} width={12} height={5} fill="#2ec9c0" />
              ))}
            </g>
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            left: 64,
            top: 224,
            width: 520,
          }}
        >
          <div style={{ fontSize: 20, letterSpacing: 6, color: "#ff9d3d" }}>BT1 · POWER SOURCE</div>
          <div style={{ fontSize: 56, color: "#dbe7ee", marginTop: 14, lineHeight: 1.05 }}>
            {identity.name}
          </div>
          <div style={{ fontSize: 27, color: "#ff9d3d", marginTop: 18, lineHeight: 1.3 }}>
            {identity.tagline}
          </div>
          <div style={{ fontSize: 19, color: "#8ba3b0", marginTop: 22 }}>
            Full-stack · AI · hardware · Oakville / Toronto
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 56,
            bottom: 44,
            fontSize: 18,
            letterSpacing: 5,
            color: "#7d8f9b",
          }}
        >
          PHYSICAL // DIGITAL
        </div>
      </div>
    ),
    size,
  );
}
