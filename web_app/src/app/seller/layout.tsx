"use client";

import React from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import {
  LayoutDashboard,
  Car,
  FileCheck,
  DollarSign,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sellerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "My Listings", href: "/seller/listings", icon: Car, badge: 1 },
    { label: "Sell My Car (Valuation)", href: "/seller/sell", icon: DollarSign },
    { label: "Identity Verification (KYC)", href: "/seller/onboard", icon: FileCheck },
    { label: "Messages", href: "/seller/messages", icon: MessageSquare },
  ];

  return (
    <PortalShell
      roleTitle="Private Seller"
      roleType="seller"
      navItems={sellerNavItems}
      userEmail="seller@carplug.ng"
    >
      {children}
    </PortalShell>
  );
}
