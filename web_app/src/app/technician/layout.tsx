"use client";

import React, { useState, useEffect } from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import {
  fetchTechnicianMeInspections,
  fetchInspections,
} from "@/services/api";
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
  const { user } = useAuth();
  const [counts, setCounts] = useState<{
    activeJobsCount?: string;
    activeJobId?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadTechNavData() {
      try {
        let list = await fetchTechnicianMeInspections().catch(() => []);
        if (!list || list.length === 0) {
          list = await fetchInspections().catch(() => []);
        }

        if (!isMounted) return;

        const activeList = list.filter(
          (i: { status?: string }) => i.status !== "completed"
        );
        const activeCount = activeList.length;

        setCounts({
          activeJobsCount: activeCount > 0 ? `${activeCount} Active` : undefined,
          activeJobId: activeList[0]?.id || list[0]?.id || "insp-001",
        });
      } catch (err) {
        console.warn("Failed to load technician nav badge counts:", err);
      }
    }

    loadTechNavData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const targetInspId = counts.activeJobId || "insp-001";

  const techNavItems: NavItem[] = [
    { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
    {
      label: "Inspection Jobs",
      href: "/technician/inspections",
      icon: Wrench,
      badge: counts.activeJobsCount,
    },
    {
      label: "Audit Checklist",
      href: `/technician/inspections/${targetInspId}/checklist`,
      icon: CheckSquare,
    },
    {
      label: "Report Composer",
      href: `/technician/inspections/${targetInspId}/composer`,
      icon: FileEdit,
    },
    { label: "Earnings Wallet", href: "/technician/earnings", icon: Wallet },
    { label: "Certifications & Setup", href: "/technician/onboard", icon: Award },
  ];

  return (
    <RoleGuard allowedRoles={["technician", "admin"]} portalName="Technician Portal">
      <PortalShell
        roleTitle="Technician Hub"
        roleType="technician"
        navItems={techNavItems}
        userEmail="tech.musa@carplug.ng"
      >
        {children}
      </PortalShell>
    </RoleGuard>
  );
}
