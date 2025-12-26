import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/Navigation";
import { FloatingPlayer } from "@/components/FloatingPlayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "耳读 - 优质听书体验",
  description: "您的私人有声书学习助手",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "耳读",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="no-scrollbar">
      <body className="antialiased selection:bg-amber-100 selection:text-amber-900">
        <main className="min-h-screen bg-background text-foreground">
          <div className="container-tight">
            {children}
          </div>
        </main>
        <FloatingPlayer />
        <Navigation />
      </body>
    </html>
  );
}
