export type SubscriptionPlan = 'free' | 'premium';

export interface FeatureAccess {
    canUseFood: boolean;
    canUseWorkoutDetails: boolean;
    canUseAdvancedStats: boolean;
    canUseMacros: boolean;
    canUseBarcodeScanner: boolean;
}

export interface SubscriptionInfo {
    plan: SubscriptionPlan;
    userId?: string;
    email?: string;
    premiumExpiresAt?: string; // ISO date string
    createdAt: string;
    lastUpdated: string;
}
