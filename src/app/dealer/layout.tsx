"use client";

import React from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Users,
  Store,
  CreditCard,
  MessageSquare,
} from "lucide-react";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dealerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { label: "Active Inventory", href: "/dealer/vehicles", icon: Car, badge: 18 },
    { label: "Add New Vehicle", href: "/dealer/vehicles/new", icon: PlusCircle },
    { label: "Buyer Leads", href: "/dealer/leads", icon: Users, badge: "3 New" },
    { label: "Shop Profile", href: "/dealer/shop", icon: Store },
    { label: "Plan & Subscription", href: "/dealer/subscription", icon: CreditCard },
    { label: "Messages", href: "/dealer/messages", icon: MessageSquare },
  ];

  return (
    <PortalShell
      roleTitle="Dealer Pro Hub"
      roleType="dealer"
      navItems={dealerNavItems}
      userEmail="dealer@reedmotors.ng"
    >
      {children}
    </PortalShell>
  );
}
