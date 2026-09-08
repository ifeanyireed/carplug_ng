import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "../fonts/Inter-Variable.ttf",
      style: "normal",
      weight: "100 900",
    },
    {
      path: "../fonts/Inter-Italic-Variable.ttf",
      style: "italic",
      weight: "100 900",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
