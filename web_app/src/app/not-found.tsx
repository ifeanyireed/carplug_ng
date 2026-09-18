import React from "react";
import Link from "next/link";
import { MyCarsNgLogo } from "@/components/common/MyCarsNgLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-neutral-900 flex flex-col justify-between">
      {/* Top Brand Bar */}
      <header className="w-full px-6 py-4 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <MyCarsNgLogo className="h-8 w-auto text-neutral-900" />
          </Link>
          <Link
            href="/buyer/search"
            className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Browse Inventory &rarr;
          </Link>
        </div>
      </header>

      {/* 404 Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-3xl mb-6 shadow-sm border border-emerald-100">
            404
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            Sorry, the page, vehicle listing, or showroom profile you are
            looking for does not exist or has been relocated.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-sm text-sm"
            >
              Back to Home
            </Link>
            <Link
              href="/buyer/search"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
            >
              Find Verified Cars
            </Link>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 border-t border-neutral-200/70 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} mycarsNg. All rights reserved.
      </footer>
    </div>
  );
}
