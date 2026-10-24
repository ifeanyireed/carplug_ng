/**
 * SubscriptionService.ts
 *
 * Central service for enforcing, validating, and displaying subscription access
 * and listing limits across the application, overriding any potentially outdated
 * database values for consistency.
 */

import {
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
  normalizePlanKey,
  getSubscriptionTier,
  getTierLimit,
  canAddVehicle,
  formatNairaPrice,
} from "./SubscriptionHelper";
import { DealerSubscriptionResponse, DealerSubscription } from "./api";

export interface QuotaCheckResult {
  canAdd: boolean;
  currentCount: number;
  limit: number;
  planName: string;
  isUnlimited: boolean;
  message?: string;
}

export class SubscriptionService {
  /**
   * Retrieves the centralized tier configuration for a plan string.
   */
  static getTier(plan?: string | null): SubscriptionTier {
    return getSubscriptionTier(plan);
  }

  /**
   * Enforces and returns the canonical listing limit, overriding database values.
   */
  static getListingLimit(plan?: string | null): number {
    return getTierLimit(plan);
  }

  /**
   * Checks whether a dealership has available listing capacity.
   */
  static checkQuota(currentCount: number, plan?: string | null): QuotaCheckResult {
    const tier = this.getTier(plan);
    const limit = tier.listingsLimit;
    const isUnlimited = limit >= 9999;
    const canAdd = isUnlimited || currentCount < limit;

    return {
      canAdd,
      currentCount,
      limit,
      planName: tier.name,
      isUnlimited,
      message: canAdd
        ? undefined
        : `Your dealership has reached the listing limit of ${currentCount}/${limit} vehicles on the ${tier.name} plan. Upgrade to increase your showroom capacity.`,
    };
  }

  /**
   * Overrides incoming database subscription responses with the centralized
   * limits from SubscriptionHelper to guarantee platform-wide consistency.
   */
  static overrideWithCentralLimits(
    subData: DealerSubscriptionResponse | null
  ): DealerSubscriptionResponse | null {
    if (!subData) return null;

    const canonicalLimit = this.getListingLimit(subData.subscription?.plan);

    return {
      ...subData,
      listingsLimit: canonicalLimit,
      subscription: {
        ...subData.subscription,
        listingsLimit: canonicalLimit,
      },
    };
  }

  /**
   * Checks whether a dealership's expired subscription is currently within the
   * official 7-day grace period.
   */
  static isWithinGracePeriod(expiresAt?: string | null): {
    isExpired: boolean;
    isGracePeriod: boolean;
    daysRemainingInGrace: number;
  } {
    if (!expiresAt) {
      return { isExpired: false, isGracePeriod: false, daysRemainingInGrace: 7 };
    }

    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const isExpired = now > expiryTime;

    if (!isExpired) {
      return { isExpired: false, isGracePeriod: false, daysRemainingInGrace: 7 };
    }

    const gracePeriodEnd = expiryTime + 7 * 24 * 60 * 60 * 1000;
    const isGracePeriod = now <= gracePeriodEnd;
    const msRemaining = gracePeriodEnd - now;
    const daysRemainingInGrace = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

    return {
      isExpired,
      isGracePeriod,
      daysRemainingInGrace,
    };
  }

  /**
   * Returns formatted price for display.
   */
  static formatPrice(amount: number): string {
    return formatNairaPrice(amount);
  }
}

export default SubscriptionService;
