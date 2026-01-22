import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// --- STORAGE IMPLEMENTATION (AsyncStorage for Expo Go Compatibility) ---
// Note: We are switching to fully ASYNC storage to support Expo Go without native builds.
// This is "Production Ready" in terms of stability, though MMKV is faster.

const storage = {
    // Get item (Async)
    getString: async (key: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key);
            }
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.error('Storage Get Error:', e);
            return null;
        }
    },
    // Set item (Async)
    set: async (key: string, value: string | boolean | number): Promise<void> => {
        try {
            const val = String(value);
            if (Platform.OS === 'web') {
                localStorage.setItem(key, val);
                return;
            }
            await AsyncStorage.setItem(key, val);
        } catch (e) {
            console.error('Storage Set Error:', e);
        }
    },
    // Get Boolean (Async)
    getBoolean: async (key: string): Promise<boolean> => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key) === 'true';
            }
            const val = await AsyncStorage.getItem(key);
            return val === 'true';
        } catch (e) {
            return false;
        }
    },
    // Get Number (Async)
    getNumber: async (key: string): Promise<number> => {
        try {
            if (Platform.OS === 'web') {
                return Number(localStorage.getItem(key) || 0);
            }
            const val = await AsyncStorage.getItem(key);
            return val ? Number(val) : 0;
        } catch (e) {
            return 0;
        }
    },
    // Delete (Async)
    delete: async (key: string): Promise<void> => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key);
                return;
            }
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Storage Delete Error:', e);
        }
    },
    // Clear All (Async)
    clearAll: async (): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.clear();
            return;
        }
        await AsyncStorage.clear();
    },
    // Get All Keys (Async)
    getAllKeys: async (): Promise<string[]> => {
        if (Platform.OS === 'web') {
            return Object.keys(localStorage);
        }
        return (await AsyncStorage.getAllKeys()) as string[];
    }
};

// Secure Storage Accessors (Already Async)
export const secureStorage = {
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export { storage };

export const StorageKeys = {
    USER_DATA: 'user_data',
    AUTH_TOKEN: 'auth_token',
    THEME: 'theme',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    WIZARD_DATA: 'wizard_data',
    FOOD_CACHE: 'food_cache',
    FOOD_CACHE_TIMESTAMP: 'food_cache_timestamp',
};

// --- LEGACY KEYS ---
const USER_PROFILE_KEY = 'user_profile_v1';
const USER_SETTINGS_KEY = 'user_settings_v1';
const DAILY_LOG_PREFIX = 'daily_log_';
const FOOD_ITEMS_KEY = 'food_items_v1';
const STEP_DATA_PREFIX = 'step_data_';
const STREAK_STATE_KEY = 'streak_state_v1';
const SUBSCRIPTION_KEY = 'subscription_v1';
const ACHIEVEMENTS_KEY = 'achievements_v1';

// --- TYPES ---
export interface UserProfile {
    name: string;
    age: number | null;
    height: number | null;
    weight: number | null;
    gender: 'male' | 'female' | 'other';
    fitnessGoal: 'loss' | 'gain' | 'lean' | 'maintain' | 'recomp' | null;
    startingWeight: number | null;
    currentWeight: number | null;
    targetWeight: number | null;
    activityFactor: number | null;
    stepGoal: number;
    waterGoal: number;
    bmr: number | null;
    tdee: number | null;
    bmi: number | null;
    isGuest?: boolean;
    userId?: string;
    email?: string;
    plan?: 'free' | 'premium';
    premiumExpiresAt?: string;
    streak?: number;
    streakShields?: number;
    availableEquipment?: string[];
    goal?: string;
    activityLevel?: string;
    workoutExperience?: string;
    unitSystem?: 'metric' | 'imperial';
    lastSmartGoalCheck?: string;
    healthConnectEnabled?: boolean;
    hasSeenTutorial?: boolean;
    // Onboarding Extras
    mealsPerDay?: number;
    cuisines?: string[];
    diet?: string;
    likedFoods?: string[];
    dislikedFoods?: string[];
}

export interface UserSettings {
    id: string;
    notifications_enabled: boolean;
    isOnboarded: boolean;
    currentWeight: number;
    activityLevel: number;
    profile: UserProfile;
    hasSeenTutorial?: boolean;
}

export interface DailyLog {
    date: string;
    steps: number;
    water_ml: number;
    calories_eaten: number;
    calories_burned: number;
    workout_done: boolean;
    notes?: string;
    ai_hours?: number;
    mistakes?: string[];
    shield_used?: boolean;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    eatenItems?: Array<{
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        timestamp: number;
    }>;
}

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    emoji?: string;
    qty?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
}

export interface StepData {
    date: string;
    steps: number;
    baseline: number;
}

export interface StreakState {
    currentStreak: number;
    lastUpdated: string;
}

export interface SubscriptionData {
    plan: 'free' | 'premium';
    userId?: string;
    email?: string;
    premiumExpiresAt?: string;
    createdAt: string;
    lastUpdated: string;
}

// --- HELPERS (AsyncStorage Implementation) ---

export const loadUserProfile = async (): Promise<UserProfile | null> => {
    try {
        const data = await storage.getString(USER_PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading user profile:', error);
        return null;
    }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
        await storage.set(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error('Error saving user profile:', error);
    }
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
    try {
        const data = await storage.getString(USER_SETTINGS_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting user settings:', error);
        return null;
    }
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
    try {
        await storage.set(USER_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving user settings:', error);
    }
};

export const loadDailyLog = async (dateString: string): Promise<DailyLog | null> => {
    try {
        const data = await storage.getString(DAILY_LOG_PREFIX + dateString);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading daily log:', error);
        return null;
    }
};

export const saveDailyLog = async (log: DailyLog): Promise<void> => {
    try {
        await storage.set(DAILY_LOG_PREFIX + log.date, JSON.stringify(log));
    } catch (error) {
        console.error('Error saving daily log:', error);
    }
};

export const getDailyLog = async (date: string): Promise<DailyLog | null> => {
    return loadDailyLog(date);
};

export const getAllDailyLogs = async (): Promise<DailyLog[]> => {
    try {
        const keys = await storage.getAllKeys();
        const logKeys = keys.filter((key: string) => key.startsWith(DAILY_LOG_PREFIX));
        const logs: DailyLog[] = [];
        for (const key of logKeys) {
            const val = await storage.getString(key);
            if (val) logs.push(JSON.parse(val));
        }
        return logs;
    } catch (error) {
        console.error('Error getting all daily logs:', error);
        return [];
    }
};

export const loadFoodItems = async (): Promise<FoodItem[]> => {
    try {
        const data = await storage.getString(FOOD_ITEMS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading food items:', error);
        return [];
    }
};

export const saveFoodItems = async (items: FoodItem[]): Promise<void> => {
    try {
        await storage.set(FOOD_ITEMS_KEY, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving food items:', error);
    }
};

export const getAllFoodItems = async (): Promise<FoodItem[]> => {
    return loadFoodItems();
};

export const saveFoodItem = async (item: { name: string; calories: number; emoji?: string }): Promise<void> => {
    const items = await loadFoodItems();
    items.push({ id: Date.now().toString(), ...item });
    await saveFoodItems(items);
};

export const loadStepData = async (dateString: string): Promise<StepData | null> => {
    try {
        // Migration legacy check could be removed for new production, keeping for safety
        const simpleSteps = await storage.getString(`steps:${dateString}`); 
        if (simpleSteps) {
            return {
                date: dateString,
                steps: parseInt(simpleSteps, 10),
                baseline: 0
            };
        }
        const data = await storage.getString(STEP_DATA_PREFIX + dateString);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

export const saveStepData = async (dateString: string, steps: number, baseline: number = 0): Promise<void> => {
    try {
        const data: StepData = { date: dateString, steps, baseline };
        await storage.set(STEP_DATA_PREFIX + dateString, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving step data:', error);
    }
};

export const loadStreakState = async (): Promise<StreakState | null> => {
    try {
        const data = await storage.getString(STREAK_STATE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

export const saveStreakState = async (state: StreakState): Promise<void> => {
    try {
        await storage.set(STREAK_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Error saving streak state:', error);
    }
};

export const resetAllData = async (): Promise<void> => {
    await storage.clearAll();
    // Secure store clearing optional depending on if we want to log out
    // await secureStorage.deleteItem(StorageKeys.AUTH_TOKEN); 
};

export const loadSubscription = async (): Promise<SubscriptionData | null> => {
    try {
        const data = await storage.getString(SUBSCRIPTION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
};

export const saveSubscription = async (subscription: SubscriptionData): Promise<void> => {
    try {
        await storage.set(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    } catch (error) {
        console.error('Error saving subscription:', error);
    }
};

export const loadUnlockedBadges = async (): Promise<string[]> => {
    try {
        const data = await storage.getString(ACHIEVEMENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
};

export const saveUnlockedBadge = async (badgeId: string): Promise<void> => {
    try {
        const current = await loadUnlockedBadges();
        if (!current.includes(badgeId)) {
            const updated = [...current, badgeId];
            await storage.set(ACHIEVEMENTS_KEY, JSON.stringify(updated));
        }
    } catch (error) {
        console.error('Error saving achievement:', error);
    }
};
