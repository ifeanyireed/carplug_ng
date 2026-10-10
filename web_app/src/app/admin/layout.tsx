"use client";

import React, { useState, useEffect } from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import {
  fetchVerifications,
  fetchCampaigns,
  fetchSwaps,
  fetchFlaggedListings,
  fetchLeads,
} from "@/services/api";
import {
  LayoutDashboard,
  FileCheck,
  GitPullRequest,
  ShieldAlert,
  CreditCard,
  Megaphone,
  ArrowLeftRight,
  Newspaper,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<{
    pendingVerifications?: string;
    flaggedListings?: string | number;
    pendingAds?: string;
    activeSwaps?: string;
    newLeads?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadAdminNavData() {
      try {
        const [verificationsRes, flaggedRes, campaignsRes, swapsRes, leadsRes] =
          await Promise.all([
            fetchVerifications().catch(() => ({ data: [] })),
            fetchFlaggedListings().catch(() => []),
            fetchCampaigns().catch(() => []),
            fetchSwaps().catch(() => []),
            fetchLeads().catch(() => []),
          ]);

        if (!isMounted) return;

        const verifItems = verificationsRes?.data || [];
        const pendingVerif = verifItems.filter(
          (v: { status?: string }) => v.status === "pending"
        ).length;

        const flaggedCount = flaggedRes.length;

        const pendingCampaigns = campaignsRes.filter(
          (c: { status?: string }) => c.status === "Pending Review"
        ).length;

        const activeSwapsCount = swapsRes.filter(
          (s: { status?: string }) => s.status !== "Completed"
        ).length;

        const newLeadsCount = leadsRes.filter(
          (l: { status?: string }) => l.status === "new"
        ).length;

        setCounts({
          pendingVerifications:
            pendingVerif > 0 ? `${pendingVerif} Pending` : undefined,
          flaggedListings: flaggedCount > 0 ? flaggedCount : undefined,
          pendingAds:
            pendingCampaigns > 0 ? `${pendingCampaigns} New` : undefined,
          activeSwaps:
            activeSwapsCount > 0 ? `${activeSwapsCount} Active` : undefined,
          newLeads: newLeadsCount > 0 ? `${newLeadsCount} New` : undefined,
        });
      } catch (err) {
        console.warn("Failed to load admin nav badge counts:", err);
      }
    }

    loadAdminNavData();
    return () => {
      isMounted = false;
    };
  }, []);

  const adminNavItems: NavItem[] = [
    { label: "Overview Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Blog & Editorial CMS", href: "/admin/blog", icon: Newspaper },
    {
      label: "Verification Queue",
      href: "/admin/verifications",
      icon: FileCheck,
      badge: counts.pendingVerifications,
    },
    {
      label: "Lead Routing Board",
      href: "/admin/leads",
      icon: GitPullRequest,
      badge: counts.newLeads,
    },
    {
      label: "Listings Moderation",
      href: "/admin/listings",
      icon: ShieldAlert,
      badge: counts.flaggedListings,
    },
    { label: "Payments & Escrow", href: "/admin/payments", icon: CreditCard },
    {
      label: "Advertising Console",
      href: "/admin/advertising",
      icon: Megaphone,
      badge: counts.pendingAds,
    },
    {
      label: "Car Swap Escrow",
      href: "/admin/swaps",
      icon: ArrowLeftRight,
      badge: counts.activeSwaps,
    },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]} portalName="Super Admin Console">
      <PortalShell
        roleTitle="Super Admin"
        roleType="admin"
        navItems={adminNavItems}
        userEmail="admin@carplug.ng"
      >
        {children}
      </PortalShell>
    </RoleGuard>
  );
}
