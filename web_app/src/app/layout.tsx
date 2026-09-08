import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROJO - Premium Car Marketplace & Auctions",
  description: "Explore, buy, sell, and auction certified luxury and everyday vehicles with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="min-h-screen bg-[#F7F8FA] text-neutral-900 selection:bg-neutral-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
