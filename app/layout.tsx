import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./dashboard-theme.css";

export const metadata: Metadata = {
  title: "Website Health Report",
  description: "Dashboard GSC dan Google Analytics yang mudah dipahami.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#071329",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
