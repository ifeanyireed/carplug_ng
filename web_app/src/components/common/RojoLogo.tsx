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

const LOGO_WHITE_PATH = "/mycarNG-white.png";
const LOGO_BLACK_PATH = "/mycarNG-black.png";
const LOGO_COLOR_PATH = "/mycarNG-color.png";

/**
 * mycarsNg Official Brand Logo Component
 * - variant="white": Pure white (/mycarNG-white.png) for dark headers/navbars.
 * - variant="black" / "dark": Solid black (/mycarNG-black.png) for light backgrounds and watermarks.
 * - variant="color": Original full-color brand asset (/mycarNG-color.png).
 */
export const MyCarsNgLogo = ({
  className = "h-9 sm:h-10 w-auto",
  imageClassName = "",
  variant = "auto",
  priority = true,
  // Accepted for backwards compatibility
  showText,
  textClassName,
  size = 40,
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

  const logoSrc = isWhite
    ? LOGO_WHITE_PATH
    : isDark
    ? LOGO_BLACK_PATH
    : LOGO_COLOR_PATH;

  return (
    <div
      className={`inline-flex items-center select-none shrink-0 ${className}`}
      {...props}
    >
      <div className="relative shrink-0 flex items-center justify-center h-full aspect-square">
        <Image
          src={logoSrc}
          alt="mycarsNg"
          width={size || 40}
          height={size || 40}
          unoptimized={true}
          priority={priority}
          className={`h-full w-auto aspect-square object-contain transition-all duration-200 group-hover:scale-105 ${imageClassName}`}
          style={{ imageRendering: "auto" }}
        />
      </div>
    </div>
  );
};

export const RojoLogo = MyCarsNgLogo;
export const VerzaLogo = MyCarsNgLogo;
export default MyCarsNgLogo;
