"use client";

import React from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import {
  LayoutDashboard,
  Wrench,
  CheckSquare,
  FileEdit,
  Wallet,
  Award,
} from "lucide-react";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const techNavItems: NavItem[] = [
    { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
    { label: "Inspection Jobs", href: "/technician/inspections", icon: Wrench, badge: "1 Active" },
    { label: "Audit Checklist", href: "/technician/inspections/insp-001/checklist", icon: CheckSquare },
    { label: "Report Composer", href: "/technician/inspections/insp-001/composer", icon: FileEdit },
    { label: "Earnings Wallet", href: "/technician/earnings", icon: Wallet },
    { label: "Certifications & Setup", href: "/technician/onboard", icon: Award },
  ];

  return (
    <PortalShell
      roleTitle="Technician Hub"
      roleType="technician"
      navItems={techNavItems}
      userEmail="tech.musa@carplug.ng"
    >
      {children}
    </PortalShell>
  );
}
