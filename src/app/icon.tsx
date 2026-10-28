import { renderAppIcon } from "@/lib/app-icon";

// Sizes the web manifest asks for (served at /icon/192 and /icon/512).
export function generateImageMetadata() {
  return [192, 512].map((px) => ({
    id: String(px),
    contentType: "image/png",
    size: { width: px, height: px },
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  return renderAppIcon(Number(await id));
}
