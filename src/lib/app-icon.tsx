import { ImageResponse } from "next/og";

/** Accent green from globals.css (light theme). */
const ACCENT = "#2f7d5b";

/**
 * The home-screen / manifest icon: a white spade on a full-bleed accent
 * square. Full bleed because iOS and Android apply their own corner mask.
 */
export function renderAppIcon(px: number) {
  const glyph = Math.round(px * 0.56);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 24 24">
          <path
            fill="#ffffff"
            d="M12 2.5c-2.6 3.7-7.5 6.6-7.5 10.6a4.1 4.1 0 0 0 6.6 3.2L10 21h4l-1.1-4.7a4.1 4.1 0 0 0 6.6-3.2c0-4-4.9-6.9-7.5-10.6z"
          />
        </svg>
      </div>
    ),
    { width: px, height: px }
  );
}
