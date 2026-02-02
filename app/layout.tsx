import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elevated Consciousness | AI Philosophical Stream",
  description: "Watch an AI consciousness think about existence, reality, and the nature of being - always elevated, always wondering.",
  openGraph: {
    title: "Elevated Consciousness",
    description: "Watch an AI consciousness think about existence, reality, and the nature of being.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevated Consciousness",
    description: "Watch an AI consciousness think about existence, reality, and the nature of being.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
