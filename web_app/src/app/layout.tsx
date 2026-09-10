import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SavedVehiclesProvider } from "@/context/SavedVehiclesContext";
import { AuthModal } from "@/components/modals/AuthModal";

// Root layout with dynamic authentication provider and modal
export const metadata: Metadata = {
  title: "Verza - Premium Car Marketplace & Verified Auto Network",
  description: "Explore, buy, sell, and auction certified luxury and everyday vehicles with confidence.",
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
