import type { Metadata, Viewport } from "next";
import { Libre_Caslon_Text, Public_Sans } from "next/font/google";
import "./globals.css";

// Same families as the AGENT FROG app, self-hosted by next/font at build time (no runtime font requests).
const caslon = Libre_Caslon_Text({ variable: "--font-caslon", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], display: "swap" });
const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "AGENT FROG · Product demo",
  description: "An interactive walkthrough of how AGENT FROG tailors an application. Every name, job and document in it is fictional.",
};

export const viewport: Viewport = { themeColor: "#141416", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caslon.variable} ${publicSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
