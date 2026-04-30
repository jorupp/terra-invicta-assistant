import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Terra Invicta Assistant",
  description: "Game state analysis and planning assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-[1920px] mx-auto px-4 h-10 flex items-center gap-3">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Terra Invicta
              </span>
              <span className="h-3 w-px bg-border/60" />
              <span className="text-xs text-muted-foreground font-medium">
                Assistant
              </span>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
