import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SavedVehiclesProvider } from "@/context/SavedVehiclesContext";
import { AuthModal } from "@/components/modals/AuthModal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mycars.ng";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "mycarsNg - Nigeria's #1 Verified Car Marketplace & Auto Network",
    template: "%s | mycarsNg",
  },
  description:
    "Explore, buy, sell, swap, and inspect certified Tokunbo and Nigerian-used vehicles with confidence on mycarsNg.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679254/carplug/brand/logo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679254/carplug/brand/logo.png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: "mycarsNg",
    title: "mycarsNg - Nigeria's #1 Verified Car Marketplace & Auto Network",
    description:
      "Explore, buy, sell, swap, and inspect certified Tokunbo and Nigerian-used vehicles with confidence on mycarsNg.",
    images: [
      {
        url: "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679254/carplug/brand/logo.png",
        width: 800,
        height: 800,
        alt: "mycarsNg Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mycarsNg - Nigeria's #1 Verified Car Marketplace & Auto Network",
    description:
      "Explore, buy, sell, swap, and inspect certified Tokunbo and Nigerian-used vehicles with confidence on mycarsNg.",
    images: ["https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679254/carplug/brand/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#F7F8FA] text-neutral-900 selection:bg-neutral-900 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <SavedVehiclesProvider>
            {children}
            <AuthModal />
          </SavedVehiclesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
