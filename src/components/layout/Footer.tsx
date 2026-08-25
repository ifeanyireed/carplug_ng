"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RojoLogo } from "@/components/common/RojoLogo";

interface MakeCategory {
  title: string;
  models: string[];
}

const VEHICLE_DIRECTORIES: MakeCategory[] = [
  {
    title: "Toyota",
    models: [
      "Toyota Avalon",
      "Toyota Highlander",
      "Toyota Sienna",
      "Toyota 4Runner",
      "Toyota Supra",
    ],
  },
  {
    title: "BMW",
    models: [
      "BMW 3 Series",
      "BMW X5",
      "BMW 7 Series",
      "BMW Z4",
      "BMW X3",
      "BMW i3",
    ],
  },
  {
    title: "Mercedes Benz",
    models: [
      "Mercedes-Benz S-Class",
      "Mercedes-Benz GLE",
      "Mercedes-Benz V-Class",
      "Mercedes-Benz G-Class",
      "Mercedes-Benz AMG GT",
      "Mercedes-Benz GLA",
    ],
  },
  {
    title: "Ford",
    models: [
      "Ford Fusion",
      "Ford Explorer",
      "Ford Escape",
      "Ford Mustang",
      "Ford F-150",
      "Ford Edge",
    ],
  },
  {
    title: "Lexus",
    models: [
      "Lexus ES",
      "Lexus RX",
      "Lexus NX",
      "Lexus GX",
      "Lexus LS",
      "Lexus UX",
    ],
  },
];

interface FooterProps {
  onSelectModel?: (model: string) => void;
}

export const Footer = ({ onSelectModel }: FooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="w-full bg-[#F7F8FA] pt-12 text-gray-900 overflow-hidden">
      {/* 1. Vehicle Models Directory Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-10">
          {VEHICLE_DIRECTORIES.map((category) => (
            <div key={category.title} className="flex flex-col">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 tracking-tight">
                {category.title}
              </h4>
              <ul className="flex flex-col gap-2.5 sm:gap-3">
                {category.models.map((model) => (
                  <li key={model}>
                    <button
                      type="button"
                      onClick={() => onSelectModel?.(model)}
                      className="text-xs sm:text-sm text-gray-600 hover:text-black transition tracking-tight text-left"
                    >
                      {model}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Newsletter, Socials & Watermark Band */}
      <div className="w-full bg-[#EAEDF2] pt-10 pb-6 relative overflow-hidden border-t border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Row: Newsletter Form & Social Links */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8">
            {/* Newsletter Input Form */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2.5 tracking-tight">
                Subscribe Our Newsletter
              </p>
              {subscribed ? (
                <p className="text-xs text-emerald-700 font-medium py-2.5">
                  ✓ Thank you for subscribing to Rojo!
                </p>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex items-center gap-2"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Email"
                    className="w-56 sm:w-72 px-4 py-2.5 bg-white rounded-xl text-xs sm:text-sm border border-gray-200/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-black text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-neutral-800 transition active:scale-95 shadow-sm"
                  >
                    Submit
                  </button>
                </form>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3.5 sm:gap-4 text-gray-800">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-black transition"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-black transition"
              >
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-[1.8]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* X (formerly Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-black transition"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-black transition"
              >
                <svg
                  className="w-4.5 h-4.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Dividing Line */}
          <div className="border-t border-gray-300/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div>
              © 2025 Rojo, Inc. All Rights Reserved
            </div>

            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-black transition">
                Terms & condition
              </Link>
              <Link href="#" className="hover:text-black transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-black transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Repetitive Pattern Watermark ROJO Brand Graphic */}
        <div className="w-full overflow-hidden pointer-events-none select-none opacity-45 mt-8 pb-10 sm:pb-14 flex items-center justify-center gap-6 sm:gap-12 px-4">
          <RojoLogo className="h-14 sm:h-18 md:h-22 lg:h-24 w-auto text-white shrink-0" />
          <RojoLogo className="h-14 sm:h-18 md:h-22 lg:h-24 w-auto text-white shrink-0" />
          <RojoLogo className="h-14 sm:h-18 md:h-22 lg:h-24 w-auto text-white shrink-0 hidden lg:block" />
        </div>
      </div>
    </footer>
  );
};
