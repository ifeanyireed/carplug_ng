"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { MyCarsNgLogo } from "@/components/common/MyCarsNgLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F8FA] text-neutral-900 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <MyCarsNgLogo className="h-10 w-auto text-neutral-900" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Application Error
          </h1>
          <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
            A critical error occurred while rendering the application shell. We
            apologize for the inconvenience.
          </p>

          {error?.digest && (
            <p className="mt-2 font-mono text-xs text-neutral-600 bg-neutral-100 rounded-md p-2 inline-block">
              Code: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-sm text-sm"
            >
              Reload Page
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-neutral-300 text-neutral-800 font-medium hover:bg-neutral-50 transition-colors shadow-sm text-sm text-center"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
