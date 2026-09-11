"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
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
  const pathname = usePathname();
  const { user } = useAuth();
  const isNewVehiclePage = pathname === "/dealer/vehicles/new";
  const allowedRoles = isNewVehiclePage
    ? (["dealer", "seller", "buyer", "admin"] as const)
    : (["dealer", "admin"] as const);

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
    <RoleGuard allowedRoles={[...allowedRoles]} portalName="Dealer Pro Hub">
      <PortalShell
        roleTitle={
          user?.role === "seller"
            ? "Seller Vehicle Manager"
            : user?.role === "buyer"
            ? "Car Listing Wizard"
            : "Dealer Pro Hub"
        }
        roleType={
          user?.role === "seller"
            ? "seller"
            : user?.role === "buyer"
            ? "buyer"
            : "dealer"
        }
        navItems={dealerNavItems}
        userEmail={user?.email || "dealer@reedmotors.ng"}
      >
        {children}
      </PortalShell>
    </RoleGuard>
  );
}

