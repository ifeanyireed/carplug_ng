"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import {
  fetchDealerInventory,
  fetchVehicles,
  fetchLeads,
  fetchConversations,
} from "@/services/api";
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

  const [counts, setCounts] = useState<{
    inventoryCount?: number;
    leadsCount?: string | number;
    unreadMessagesCount?: number;
  }>({});

  useEffect(() => {
    let isMounted = true;
    const dealerId = user?.id || "dealer-001";

    async function loadDealerNavData() {
      try {
        const [inventory, leads, conversations] = await Promise.all([
          fetchDealerInventory(dealerId)
            .then(async (res) => {
              if (res && res.length > 0) return res.length;
              const all = await fetchVehicles().catch(() => []);
              const filtered = all.filter(
                (v) =>
                  (user?.id && (v.sellerId === user.id || v.sellerId === user.id.replace("usr-", ""))) ||
                  v.sellerId === dealerId
              );
              return filtered.length;
            })
            .catch(() => 0),
          fetchLeads().catch(() => []),
          fetchConversations().catch(() => []),
        ]);

        if (!isMounted) return;

        const newLeads = leads.filter((l) => l.status === "new").length;
        const leadsBadge =
          newLeads > 0 ? `${newLeads} New` : leads.length > 0 ? leads.length : undefined;

        const unreadMsgs = conversations.reduce(
          (acc, c) => acc + (c.unreadCount || 0),
          0
        );

        setCounts({
          inventoryCount: inventory > 0 ? inventory : undefined,
          leadsCount: leadsBadge,
          unreadMessagesCount: unreadMsgs > 0 ? unreadMsgs : undefined,
        });
      } catch (err) {
        console.warn("Failed to load dealer nav badge counts:", err);
      }
    }

    loadDealerNavData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const dealerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dealer/dashboard", icon: LayoutDashboard },
    { label: "Active Inventory", href: "/dealer/vehicles", icon: Car, badge: counts.inventoryCount },
    { label: "Add New Vehicle", href: "/dealer/vehicles/new", icon: PlusCircle },
    { label: "Buyer Leads", href: "/dealer/leads", icon: Users, badge: counts.leadsCount },
    { label: "Shop Profile", href: "/dealer/shop", icon: Store },
    { label: "Plan & Subscription", href: "/dealer/subscription", icon: CreditCard },
    { label: "Messages", href: "/dealer/messages", icon: MessageSquare, badge: counts.unreadMessagesCount },
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

