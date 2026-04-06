import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketRuz — Fresh Market Delivery",
  description: "Upload your shopping list and we handle the rest. Fresh market runs, delivered fast.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-ruz-cream antialiased">{children}</body>
    </html>
  );
}