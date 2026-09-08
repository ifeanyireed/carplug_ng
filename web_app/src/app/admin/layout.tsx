"use client";

import React from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import {
  LayoutDashboard,
  FileCheck,
  GitPullRequest,
  ShieldAlert,
  CreditCard,
  Megaphone,
  ArrowLeftRight,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminNavItems: NavItem[] = [
    { label: "Overview Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Verification Queue", href: "/admin/verifications", icon: FileCheck, badge: "3 Pending" },
    { label: "Lead Routing Board", href: "/admin/leads", icon: GitPullRequest },
    { label: "Listings Moderation", href: "/admin/listings", icon: ShieldAlert },
    { label: "Payments & Escrow", href: "/admin/payments", icon: CreditCard },
    { label: "Advertising Console", href: "/admin/advertising", icon: Megaphone, badge: "2 New" },
    { label: "Car Swap Escrow", href: "/admin/swaps", icon: ArrowLeftRight, badge: "4 Active" },
  ];

  return (
    <PortalShell
      roleTitle="Super Admin"
      roleType="admin"
      navItems={adminNavItems}
      userEmail="admin@carplug.ng"
    >
      {children}
    </PortalShell>
  );
}
