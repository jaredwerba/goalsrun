import { ImageResponse } from "next/og";
import { RUNNER_NAME, TAGLINE } from "@/lib/content";

export const runtime = "edge";
export const alt = RUNNER_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 60%, #2a2a2a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          Boston, MA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 128,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.04em",
            }}
          >
            {RUNNER_NAME}
          </div>
          <div
            style={{
              fontSize: 36,
              marginTop: 28,
              opacity: 0.75,
              maxWidth: 900,
              lineHeight: 1.2,
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
