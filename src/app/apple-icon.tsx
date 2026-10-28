import { renderAppIcon } from "@/lib/app-icon";

// iOS home-screen icon (apple-touch-icon).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderAppIcon(size.width);
}
