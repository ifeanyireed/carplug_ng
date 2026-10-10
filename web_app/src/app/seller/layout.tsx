"use client";

import React, { useState, useEffect } from "react";
import { PortalShell, NavItem } from "@/components/common/PortalShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import {
  fetchVehicles,
  fetchConversations,
  fetchMyVerifications,
} from "@/services/api";
import {
  LayoutDashboard,
  Car,
  FileCheck,
  DollarSign,
  MessageSquare,
} from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{
    listingsCount?: number;
    unreadMessages?: string | number;
    kycBadge?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadSellerNavData() {
      try {
        const [vehicles, conversations, verificationsRes] = await Promise.all([
          fetchVehicles().catch(() => []),
          fetchConversations().catch(() => []),
          fetchMyVerifications({ entityType: "seller_nin" }).catch(() => ({
            data: [],
          })),
        ]);

        if (!isMounted) return;

        const sellerListings = vehicles.filter(
          (v) =>
            (user?.id &&
              (v.sellerId === user.id ||
                v.sellerId === user.id.replace("usr-", ""))) ||
            v.sellerType === "private"
        );

        const unreadMsgs = conversations.reduce(
          (acc, c) => acc + (c.unreadCount || 0),
          0
        );

        let kyc: string | undefined = undefined;
        const myNIN = verificationsRes?.data?.[0];
        if (myNIN?.status === "pending" || user?.kycStatus === "pending") {
          kyc = "Pending";
        } else if (
          myNIN?.status === "approved" ||
          user?.kycStatus === "approved" ||
          user?.isIdentityVerified
        ) {
          kyc = "Verified";
        }

        setCounts({
          listingsCount:
            sellerListings.length > 0 ? sellerListings.length : undefined,
          unreadMessages: unreadMsgs > 0 ? `${unreadMsgs} New` : undefined,
          kycBadge: kyc,
        });
      } catch (err) {
        console.warn("Failed to load seller nav badge counts:", err);
      }
    }

    loadSellerNavData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.kycStatus, user?.isIdentityVerified]);

  const sellerNavItems: NavItem[] = [
    { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    {
      label: "My Listings",
      href: "/seller/listings",
      icon: Car,
      badge: counts.listingsCount,
    },
    { label: "Sell My Car (Valuation)", href: "/seller/sell", icon: DollarSign },
    {
      label: "Identity Verification (KYC)",
      href: "/seller/onboard",
      icon: FileCheck,
      badge: counts.kycBadge,
    },
    {
      label: "Messages",
      href: "/seller/messages",
      icon: MessageSquare,
      badge: counts.unreadMessages,
    },
  ];

  return (
    <RoleGuard allowedRoles={["seller", "dealer", "admin"]} portalName="Private Seller Hub">
      <PortalShell
        roleTitle="Private Seller"
        roleType="seller"
        navItems={sellerNavItems}
        userEmail="seller@carplug.ng"
      >
        {children}
      </PortalShell>
    </RoleGuard>
  );
}
