import React from "react";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const RojoLogo = ({ className = "h-7 w-auto", ...props }: LogoProps) => {
  return (
    <svg
      viewBox="0 0 160 36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ROJO Logo"
      {...props}
    >
      {/* Letter 'R' */}
      <g>
        {/* Outer square frame with top cutout / stylized car geometric letter */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0H32V36H24V28H16V36H0V0ZM8 8V20H24V8H8Z"
        />
        {/* Inner geometric dot / element */}
        <rect x="18" y="22" width="6" height="6" />
      </g>

      {/* Letter 'O' */}
      <g transform="translate(42, 0)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM18 9C13.0294 9 9 13.0294 9 18C9 22.9706 13.0294 27 18 27C22.9706 27 27 22.9706 27 18C27 13.0294 22.9706 9 18 9Z"
        />
      </g>

      {/* Letter 'J' */}
      <g transform="translate(86, 0)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 24H8V28H24V0H32V36H0V24Z"
        />
        <rect x="8" y="8" width="6" height="6" />
      </g>

      {/* Letter 'O' */}
      <g transform="translate(124, 0)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 0C27.9411 0 36 8.05887 36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0ZM18 9C13.0294 9 9 13.0294 9 18C9 22.9706 13.0294 27 18 27C22.9706 27 27 22.9706 27 18C27 13.0294 22.9706 9 18 9Z"
        />
      </g>
    </svg>
  );
};
