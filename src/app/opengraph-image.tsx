import { ImageResponse } from "next/og";

export const alt = "Outreach Deck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          padding: 60,
        }}
      >
        {/* Monogram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            backgroundColor: "#18181b",
            borderRadius: 24,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#7c3aed",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            OD
          </span>
        </div>

        {/* App name */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#fafafa",
            fontFamily: "system-ui, sans-serif",
            margin: 0,
            marginBottom: 16,
          }}
        >
          Outreach Deck
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            fontFamily: "system-ui, sans-serif",
            margin: 0,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Daily LinkedIn outreach, AI-drafted messages, and a contact pipeline
        </p>
      </div>
    ),
    { ...size }
  );
}
