import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rueby • Discord Security & Moderation Bot",
  description: "A powerful security and moderation bot for Discord. Protect your server with anti-nuke, heat-based automod, join gate, and more.",
  keywords: ["discord", "bot", "security", "moderation", "anti-nuke", "automod"],
  openGraph: {
    title: "Rueby Bot",
    description: "Protect your Discord server with Rueby",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
