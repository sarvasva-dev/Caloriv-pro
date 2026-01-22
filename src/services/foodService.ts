import { API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';
import { storage, StorageKeys } from '../lib/storage';

const API_URL = API_CONFIG.BASE_URL;
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute (Fast Updates)

export interface Food {
    id: string;
    name: string;
    nameHindi: string;
    category: string;
    emoji?: string;
    imageUrl?: string;
    servingSize?: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    searchTerms?: string;
    pairingTags?: string; // Backend returns comma-separated string
    isActive: boolean;
}

export interface FoodLogData {
    foodName: string;
    servingSize: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

export const foodService = {
    /**
     * Get all foods (with caching via MMKV)
     */
    getFoods: async (forceRefresh = false): Promise<Food[]> => {
        try {
            // Check cache first
            if (!forceRefresh) {
                const cached = await storage.getString(StorageKeys.FOOD_CACHE);
                const cacheTime = await storage.getString(StorageKeys.FOOD_CACHE_TIMESTAMP);

                if (cached && cacheTime) {
                    const age = Date.now() - parseInt(cacheTime);
                    if (age < CACHE_DURATION) {
                        logger.info('✅ Using cached foods');
                        return JSON.parse(cached);
                    }
                }
            }

            // Fetch from backend
            logger.info('🔄 Fetching foods from backend...');
            // DOCS: 2.3 Data & Resources (/data) -> GET /foods
            const response = await fetch(`${API_URL}/data/foods`);
            const result = await response.json();

            if (result.success && result.data) {
                // Cache the data (Asynchronously with AsyncStorage)
                await storage.set(StorageKeys.FOOD_CACHE, JSON.stringify(result.data));
                await storage.set(StorageKeys.FOOD_CACHE_TIMESTAMP, Date.now().toString());

                logger.info(`✅ Fetched ${result.data.length} foods`);
                return result.data;
            }

            return [];
        } catch (error) {
            logger.error('Food fetch error:', error);

            // Return cached data if available
            const cached = await storage.getString(StorageKeys.FOOD_CACHE);
            if (cached) {
                logger.info('⚠️ Using cached foods (offline)');
                return JSON.parse(cached);
            }

            return [];
        }
    },

    /**
     * Log food intake
     * @deprecated Use syncDailyLog instead
     */
    logFood: async (data: FoodLogData): Promise<any> => {
        try {
            const token = await storage.getString(StorageKeys.AUTH_TOKEN);
            if (!token) {
                logger.warn('No auth token found');
                return { success: false, message: 'Not authenticated' };
            }

            // The backend 1.0 does not have a dedicated /logs/food endpoint.
            // All logs are synced via /user/sync-log with the daily JSON payload.
            // This method is kept for local-only compatibility or future use.
            logger.warn('⚠️ foodService.logFood is deprecated. Use Context to save locally and authService.syncDailyLog to push.');

            return { success: true }; 
        } catch (error) {
            logger.error('Food log error:', error);
            return { success: false, message: 'Failed' };
        }
    },


    /**
     * Clear food cache
     */
    clearCache: async () => {
        await storage.delete(StorageKeys.FOOD_CACHE);
        await storage.delete(StorageKeys.FOOD_CACHE_TIMESTAMP);
        logger.info('🗑️ Food cache cleared');
    },

    /**
     * Submit new food for admin approval
     */
    submitFood: async (food: any): Promise<boolean> => {
        try {
            // Include auth token if user is logged in (optional but good for tracking)
            const token = await storage.getString(StorageKeys.AUTH_TOKEN);
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_URL}/foods/submit`, {
                method: 'POST',
                headers,
                body: JSON.stringify(food),
            });
            const res = await response.json();
            return res.success;
        } catch (e) {
            logger.error("Food submission error", e);
            return false;
        }
    },

    /**
     * Get smart pairings for a specific food (from backend)
     */
    getPairings: async (foodId: string): Promise<Food[]> => {
        try {
            logger.info(`🔍 Fetching pairings for ${foodId} from backend...`);
            const response = await fetch(`${API_URL}/foods/${foodId}/pairings`);
            const result = await response.json();

            if (result.success && result.data) {
                logger.info(`✅ Found ${result.data.length} pairings`);
                return result.data;
            }
            return [];
        } catch (error) {
            logger.error('Pairing fetch error:', error);
            return [];
        }
    },

    /**
     * Search foods (client-side filter of cached/fetched foods)
     */
    searchFoods: async (query: string): Promise<{ success: boolean; data: Food[] }> => {
        try {
            const allFoods = await foodService.getFoods();
            const lowerQuery = query.toLowerCase();
            const filtered = allFoods.filter(f =>
                f.name.toLowerCase().includes(lowerQuery) ||
                f.nameHindi?.toLowerCase().includes(lowerQuery)
            );
            return { success: true, data: filtered };
        } catch (error) {
            logger.error('Search foods error:', error);
            return { success: false, data: [] };
        }
    }
};
