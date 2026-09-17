"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

export interface NavLinkProps
  extends Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      keyof LinkProps | "className" | "children"
    >,
    Omit<LinkProps, "className" | "children"> {
  children?:
    | React.ReactNode
    | ((props: { isActive: boolean }) => React.ReactNode);
  href: string;
  exact?: boolean;
  matchPrefix?: boolean;
  activeMatch?: (pathname: string) => boolean;
  className?: string | ((props: { isActive: boolean }) => string);
  activeClassName?: string;
  inactiveClassName?: string;
}

/**
 * NavLink component that automatically detects whether current route matches its href
 * and applies active styling (e.g. green active state while others stay white/neutral).
 */
export const NavLink = ({
  href,
  exact = false,
  matchPrefix = true,
  activeMatch,
  className,
  activeClassName = "",
  inactiveClassName = "",
  children,
  ...rest
}: NavLinkProps) => {
  const pathname = usePathname() || "/";

  // Clean pathname and href for accurate comparison (strip query & hash)
  const cleanPath = pathname.split("?")[0].split("#")[0] || "/";
  const cleanHref = href.split("?")[0].split("#")[0] || "/";

  const isActive = activeMatch
    ? activeMatch(cleanPath)
    : exact || cleanHref === "/"
    ? cleanPath === cleanHref
    : matchPrefix
    ? cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`)
    : cleanPath === cleanHref;

  let computedClassName = "";
  if (typeof className === "function") {
    computedClassName = className({ isActive });
  } else {
    const base = className || "";
    const extra = isActive ? activeClassName : inactiveClassName;
    computedClassName = `${base} ${extra}`.trim();
  }

  return (
    <Link
      href={href}
      className={computedClassName}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
};
