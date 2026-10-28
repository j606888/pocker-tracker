import type { MetadataRoute } from "next";

// Lets "Add to Home Screen" open the app full-screen with a proper icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "撲克戰績",
    short_name: "撲克戰績",
    description: "記錄你的每一場德州撲克戰績",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
