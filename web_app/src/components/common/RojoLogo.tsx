import React from "react";
import Image from "next/image";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: number;
  variant?: "white" | "color" | "dark" | "black" | "auto";
  priority?: boolean;
}

const CLOUDINARY_LOGO_WHITE_URL =
  "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789702024/carplug/brand/logo_white.avif";
const CLOUDINARY_LOGO_COLOR_URL =
  "https://res.cloudinary.com/cgiq8vwf/image/upload/v1789702513/carplug/brand/logo_color.avif";

/**
 * mycarsNg Official Brand Logo Component
 * Standalone AVIF master asset with integrated brand emblem and name.
 * - variant="white": Pure white for dark headers/navbars.
 * - variant="black" / "dark": Solid black (via brightness-0) for light backgrounds and watermarks.
 * - variant="color": Original full-color brand asset (blue emblem + "mycars" and red "Ng").
 */
export const MyCarsNgLogo = ({
  className = "h-5 sm:h-6 w-auto",
  imageClassName = "",
  variant = "auto",
  priority = true,
  // Accepted for backwards compatibility
  showText,
  textClassName,
  size,
  ...props
}: LogoProps) => {
  const isWhite =
    variant === "white" ||
    (variant === "auto" && className.includes("text-white"));

  const isDark =
    variant === "dark" ||
    variant === "black" ||
    (variant === "auto" &&
      !isWhite &&
      (className.includes("text-neutral-900") ||
        className.includes("text-neutral-800") ||
        className.includes("text-black")));

  const isColor = variant === "color" || (!isWhite && !isDark && variant === "auto");

  const logoSrc = isColor ? CLOUDINARY_LOGO_COLOR_URL : CLOUDINARY_LOGO_WHITE_URL;

  return (
    <div
      className={`inline-flex items-center select-none shrink-0 ${className}`}
      {...props}
    >
      <div className="relative shrink-0 flex items-center justify-center h-full w-auto">
        <Image
          src={logoSrc}
          alt="mycarsNg"
          width={320}
          height={67}
          unoptimized={true}
          priority={priority}
          className={`h-full w-auto aspect-[3200/672] object-contain transition-all duration-200 group-hover:opacity-90 ${
            isDark ? "brightness-0" : ""
          } ${imageClassName}`}
          style={{ imageRendering: "auto" }}
        />
      </div>
    </div>
  );
};

export const RojoLogo = MyCarsNgLogo;
export const VerzaLogo = MyCarsNgLogo;
export default MyCarsNgLogo;
