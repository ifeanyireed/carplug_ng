"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { MyCarsNgLogo } from "@/components/common/MyCarsNgLogo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client-side exceptions
    console.error("Unhandled client error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-neutral-900 flex flex-col justify-between">
      {/* Top Brand Bar */}
      <header className="w-full px-6 py-4 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <MyCarsNgLogo className="h-8 w-auto text-neutral-900" />
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Return Home &rarr;
          </Link>
        </div>
      </header>

      {/* Error Message Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-600 mb-6 border border-red-100 shadow-sm">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-3 text-base text-neutral-600 leading-relaxed">
            An unexpected error occurred while processing your request. Please
            try again, or return to the marketplace home page.
          </p>

          {error?.digest && (
            <p className="mt-2 font-mono text-xs text-neutral-600 bg-neutral-100 rounded-md p-2 inline-block">
              Error ID: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-sm text-sm"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-800 font-medium hover:bg-neutral-50 transition-colors shadow-sm text-sm"
            >
              Back to Home
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
