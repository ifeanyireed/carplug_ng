import React from "react";
import Image from "next/image";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: number;
  priority?: boolean;
}

/**
 * mycarsNg Official Brand Logo Component
 * Uses the ultra high-resolution 2790x2791 master asset with unoptimized={true}
 * to prevent any Next.js lossy downsampling, ensuring 100% razor-sharp rendering across all displays.
 */
export const MyCarsNgLogo = ({
  className = "h-9 sm:h-10 w-auto",
  imageClassName = "",
  textClassName = "",
  showText = true,
  size = 48,
  priority = true,
  ...props
}: LogoProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}
      {...props}
    >
      <div className="relative shrink-0 flex items-center justify-center h-full aspect-square">
        <Image
          src="/image.png"
          alt="mycarsNg Official Logo"
          width={size}
          height={size}
          unoptimized={true}
          priority={priority}
          className={`h-full w-auto aspect-square object-contain transition-transform group-hover:scale-105 ${imageClassName}`}
          style={{ imageRendering: "auto" }}
        />
      </div>
      {showText && (
        <span
          className={`font-black tracking-tight flex items-baseline leading-none text-base sm:text-lg ${textClassName}`}
        >
          <span className="font-extrabold tracking-tight">mycars</span>
          <span className="text-red-500 font-black ml-0.5">Ng</span>
        </span>
      )}
    </div>
  );
};

export const RojoLogo = MyCarsNgLogo;
export const VerzaLogo = MyCarsNgLogo;
export default MyCarsNgLogo;
