import React, { createContext, useContext, useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
    getDailyLog,
    saveDailyLog,
    getAllFoodItems,
    saveFoodItem,
    loadStreakState,
    saveStreakState,
    resetAllData,
    DailyLog,
    UserProfile,
    loadStepData,
    loadSubscription,
    saveSubscription,
    SubscriptionData,
    getAllDailyLogs,
    saveUserProfile
} from '../lib/storage';
import { SubscriptionPlan, FeatureAccess } from '../types/subscription';
import { calculateStreak } from '../lib/streak';
import { getGoalConfig, type GoalConfig } from '../lib/goal-utils';
import { authService } from '../services/authService';
import { offlineQueue } from '../services/offlineQueue';
import { stepTracker } from '../services/stepTracker';
import { useDailyLog, DailyLogState } from '../hooks/useDailyLog';
import { useUser } from '../hooks/useUser';
import { logger } from '../utils/logger';

interface CalorivContextType {
    userProfile: UserProfile | null;
    isOnboarded: boolean;
    metrics: { BMR: number; TDEE: number; BMI: string };
    dailyLog: DailyLogState | null;
    timelineWeeks: number;
    streak: number;
    streakShields: number;
    stats: { totalWorkouts: number; totalDays: number };
    goalConfig: GoalConfig | null;
    addSteps: (count: number) => void;
    addWater: (ml: number) => void;
    addFood: (calories: number, protein?: number, carbs?: number, fat?: number, name?: string) => void;
    removeFood: (id: string) => void;
    addFoodToDb: (name: string, calories: number) => Promise<void>;
    toggleWorkout: () => void;
    foodDatabase: { name: string; calories: number; emoji?: string }[];
    refreshData: () => void;
    updateWeight: (weight: number) => Promise<void>;
    updateTargetWeight: (weight: number) => Promise<void>;
    updateGoals: (stepGoal: number, waterGoal: number) => Promise<void>;
    completeOnboarding: (profile: UserProfile) => Promise<void>;
    updateProfile: (partialProfile: Partial<UserProfile>) => Promise<void>;
    resetCaloriv: () => Promise<void>;
    isLoading: boolean;
    // Subscription fields
    plan: SubscriptionPlan;
    featureAccess: FeatureAccess;
    isAuthenticated: boolean;
    userId: string | null;
    setPlan: (plan: SubscriptionPlan) => Promise<void>;
    checkFeatureAccess: (feature: keyof FeatureAccess) => boolean;
    signOut: () => Promise<void>;
    login: (email: string, password?: string) => Promise<void>;

    // Unit Conversion
    convertWeight: (kg: number) => number;
    displayWeight: (kg: number) => string;
    setHasSeenTutorial: (seen: boolean) => Promise<void>;
}

const CalorivContext = createContext<CalorivContextType | undefined>(undefined);

const calculateFeatureAccess = (plan: SubscriptionPlan): FeatureAccess => {
    // FREE PLAN PROMOTION: All features are 100% FREE for Version 2.0.0
    return {
        canUseFood: true,
        canUseWorkoutDetails: true,
        canUseAdvancedStats: true, // Unlocked
        canUseMacros: true,        // Unlocked
        canUseBarcodeScanner: true, // Unlocked
    };
};

export function CalorivProvider({ children }: { children: React.ReactNode }) {
    // Use Custom Hooks
    const {
        userProfile,
        isOnboarded,
        timelineWeeks,
        isLoading: isUserLoading,
        updateProfile,
        updateWeight,
        updateTargetWeight,
        completeOnboarding: completeOnboardingHook,
        resetUser,
        setUserProfile
    } = useUser();

    const {
        dailyLog,
        setDailyLog,
        addSteps,
        addWater,
        addFood,
        removeFood,
        toggleWorkout,
        today
    } = useDailyLog(userProfile);

    // Old State (Keep for now or refactor later)
    const [foodDatabase, setFoodDatabase] = useState<{ name: string; calories: number; emoji?: string }[]>([]);
    const [streak, setStreak] = useState(0);
    const [streakShields, setStreakShields] = useState(0);
    const [stats, setStats] = useState({ totalWorkouts: 0, totalDays: 0 });

    // Subscription state
    const [plan, setPlanState] = useState<SubscriptionPlan>('free');
    const [userId, setUserId] = useState<string | null>(null);
    const [featureAccess, setFeatureAccess] = useState<FeatureAccess>(calculateFeatureAccess('free'));

    // Combined Loading State
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load Effect - Single Source of Truth
    useEffect(() => {
        const loadState = async () => {
            try {
                // 1. Check for logged-in user
                const isLoggedIn = await authService.isLoggedIn();

                if (isLoggedIn) {
                    const userData = await authService.getUserData();
                    if (userData && userData.id) {
                        setUserId(userData.id);

                        // Try to load full profile from storage first (fastest)
                        // Then fallback to auth data
                        // Then fetch from server (background update)

                        // Construct profile from stored data
                        const restoredProfile: UserProfile = {
                            name: userData.name,
                            email: userData.email,
                            userId: userData.id,
                            age: userData.age || null,
                            gender: userData.gender || 'male',
                            height: userData.height || 170,
                            currentWeight: userData.weight || 70,
                            weight: userData.weight || 70,
                            startingWeight: userData.weight || 70,
                            targetWeight: userData.targetWeight || 70,
                            fitnessGoal: userData.goal || 'loss',
                            activityLevel: userData.activityLevel || 'sedentary',
                            workoutExperience: 'beginner',
                            activityFactor: typeof userData.activityLevel === 'number' ? userData.activityLevel : 1.375,
                            stepGoal: userData.stepGoal || 10000,
                            waterGoal: userData.waterGoal || 2000,
                            bmr: null,
                            tdee: null,
                            bmi: null,
                            isGuest: false,
                            streak: userData.currentStreak || 0,
                            streakShields: userData.streakShields || 0,
                            // Plan data often comes from separate subscription flow, but we can set default
                            plan: 'free'
                        };

                        // Use the hook's setter to update local state immediately
                        // This prevents "flicker" of empty state
                        setUserProfile(restoredProfile);
                        logger.info('✅ Restored user session:', userData.id);
                    } else {
                        // Logged in but no data? Should ideally fetch from server, but for now treat as valid session needing repair
                        logger.warn('⚠️ Logged in but missing local user data');
                    }
                }

                // 2. Load Subscription Data (Independent of Auth, could be device based)
                await loadSubscriptionData(); // This should be defined or imported if not already in file scope (It was missing in original snippet, assuming it exists in component or imports)

                // 3. Load Food Database
                await loadFoods();

            } catch (error) {
                logger.error('❌ Initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadState();
    }, []);

    // Effect to reload streak/history ONLY after userId is set
    useEffect(() => {
        if (userId) {
            loadStreak();
            // restoreHistory(); // If this exists
        }
    }, [userId, today]);

    // 3. Load Food Database
    const loadFoods = async () => {
        const foods = await getAllFoodItems();
        setFoodDatabase(foods);
    };

    // Helper to load subscription
    const loadSubscriptionData = async () => {
        try {
            const sub = await loadSubscription();
            if (sub && sub.plan) {
                setPlanState(sub.plan);
                setFeatureAccess(calculateFeatureAccess(sub.plan));
            } else {
                // Default to free
                setPlanState('free');
                setFeatureAccess(calculateFeatureAccess('free'));
            }
        } catch (e) {
            logger.error('Failed to load subscription:', e);
        }
    };

    // 4. Load Streak
    const loadStreak = async () => {
        // 1. Load Local State
        const streakState = await loadStreakState();
        let currentS = streakState?.currentStreak || 0;

        // 2. Fetch Latest from Backend (Source of Truth)
        if (userId) {
            try {
                const profileRes = await authService.getProfile();
                if (profileRes.success && profileRes.user) {
                    const serverStreak = profileRes.user.currentStreak || 0;
                    const serverShields = profileRes.user.streakShields || 0;

                    // Update Local State if Server is different
                    // We trust server as Admin might have edited it
                    currentS = serverStreak;
                    setStreakShields(serverShields);

                    // Update internal profile reference
                    if (userProfile) {
                        const updated = { ...userProfile, streak: serverStreak, streakShields: serverShields };
                        setUserProfile(updated);
                        await saveUserProfile(updated);
                    }
                }
            } catch (e) {
                // logger.debug('Failed to fetch server streak', e);
            }
        }

        // 3. Fallback to Local Calculation if no server connection or first load
        if (currentS === 0 && userProfile) {
            const allLogs = await getAllDailyLogs();
            currentS = calculateStreak(allLogs, userProfile);
        }

        setStreak(currentS);

        // 4. Check for Streak Freeze / Shield Consumption (If streak was broken yesterday)
        // If calculated streak is 0, but we had a streak yesterday and have shields, use one!
        if (currentS === 0 && userProfile?.streak && userProfile.streak > 0 && (userProfile.streakShields || 0) > 0) {
            // Check if yesterday was the missing link
            const yesterday = format(subDays(today, 1), 'yyyy-MM-dd');

            // We need to check if yesterday was actually the cause.
            // If we are here, it means calculateStreak returned 0.
            // Let's try to "save" it.
            logger.info('🛡️ Streak broken! Attempting to use Shield...');

            // 1. Mark yesterday as shielded in DB
            const yesterdayLog = await getDailyLog(yesterday);
            if (yesterdayLog) { // Must have at least opened app or existing log
                const updatedLog = { ...yesterdayLog, shield_used: true };
                await saveDailyLog(updatedLog);

                // 2. Decrement Shield
                const currentShields = userProfile.streakShields || 0;
                const newShields = Math.max(0, currentShields - 1);
                setStreakShields(newShields);

                // 3. Restore Streak (Keep it same as before, don't increment yet)
                const restoredStreak = userProfile.streak;
                setStreak(restoredStreak);

                // 4. Update Profile
                const updatedProfile = { ...userProfile, streak: restoredStreak, streakShields: newShields };
                setUserProfile(updatedProfile);
                await saveUserProfile(updatedProfile);

                logger.info(`✅ Shield used! Streak saved at ${restoredStreak}. Shields left: ${newShields}`);
            }
        }

        await saveStreakState({ currentStreak: currentS, lastUpdated: today });

        // Calculate Stats
        const allLogs = await getAllDailyLogs();
        const totalWorkouts = allLogs.filter(l => l.workout_done).length;
        const totalDays = allLogs.length;
        setStats({ totalWorkouts, totalDays });
    };

    useEffect(() => {
        loadStreak();
    }, [today, userId]); // Reload on userId change

    // --- SYNC ENGINE ---
    // Sync local changes to backend using Offline Queue
    useEffect(() => {
        offlineQueue.init();

        // Inject the Processor (How to actually sync when online)
        offlineQueue.setProcessor(async (action) => {
            if (action.type === 'SYNC_LOG') {
                try {
                    const res = await authService.syncDailyLog(action.payload.date, action.payload.data);
                    return res.success;
                } catch (e) {
                    return false;
                }
            }
            return true;
        });
    }, []);

    // Step Tracker Subscription
    useEffect(() => {
        // Initialize tracker
        stepTracker.init();

        // Subscribe to updates
        const unsubscribe = stepTracker.subscribe((state) => {
            if (state.todaySteps > 0) {
                // Only update if we have valid steps
                // We use addSteps which handles correct saving/logic
                addSteps(state.todaySteps);
            }
        });

        return () => {
            unsubscribe();
            // We don't stop tracking on unmount of context usually as it's global
            // but if we did: stepTracker.stop();
        };
    }, [addSteps]);

    useEffect(() => {
        if (!userId || !dailyLog) return;

        const syncParams = {
            steps: dailyLog.steps,
            water_ml: dailyLog.water_ml,
            calories_eaten: dailyLog.calories_eaten,
            calories_burned: dailyLog.calories_burned,
            workout_done: dailyLog.workout_done,
            protein_g: dailyLog.protein_g,
            carbs_g: dailyLog.carbs_g,
            fat_g: dailyLog.fat_g,
            eatenItems: dailyLog.eatenItems,
            ai_hours: dailyLog.ai_hours,
            mistakes: dailyLog.mistakes
        };

        const timeout = setTimeout(() => {
            // Use Offline Queue instead of direct call
            logger.info('Queueing sync action...');
            offlineQueue.enqueue('SYNC_LOG', { date: dailyLog.date, data: syncParams });
        }, 3000); // 3-second debounce to batch rapid changes

        return () => clearTimeout(timeout);
    }, [dailyLog, userId]);

    // Restore History on Login
    useEffect(() => {
        if (userId) {
            logger.info('🔄 Restoring health history from backend...');
            authService.getHealthHistory().then(async (res) => {
                if (res.success && res.data && Array.isArray(res.data)) {
                    // Merge / Save to local storage
                    for (const log of res.data) {
                        const existing = await getDailyLog(log.date);
                        // Simple strategy: Backend wins if local is empty, or merge max
                        // For now, we'll just ensure we have *something*
                        if (!existing) {
                            await saveDailyLog(log);
                        }
                    }
                    loadStreak(); // Recalculate streak with new data
                    logger.info(`✅ Restored ${res.data.length} days of history`);
                }
            });
        }
    }, [userId]);

    const addFoodToDb = React.useCallback(async (name: string, calories: number) => {
        await saveFoodItem({ name, calories, emoji: '🍽️' });
        loadFoods(); // Refresh list
    }, []);

    const resetCaloriv = React.useCallback(async () => {
        await resetUser();
        await resetAllData();
        setDailyLog(null);
        setStreak(0);
        setFoodDatabase([]);
        setPlanState('free');
        setUserId(null);
        setFeatureAccess(calculateFeatureAccess('free'));
    }, [resetUser, setDailyLog]);

    // Subscription Methods
    const setPlan = React.useCallback(async (newPlan: SubscriptionPlan) => {
        try {
            setPlanState(newPlan);
            setFeatureAccess(calculateFeatureAccess(newPlan));

            const subscription: SubscriptionData = {
                plan: newPlan,
                userId: userId || undefined,
                createdAt: today,
                lastUpdated: today
            };
            await saveSubscription(subscription);

            // Update user profile
            if (userProfile) {
                const updatedProfile = { ...userProfile, plan: newPlan };
                setUserProfile(updatedProfile);
                await saveUserProfile(updatedProfile);
            }
        } catch (error) {
            logger.error('Failed to update plan:', error);
        }
    }, [userId, userProfile, today, setUserProfile]);

    const checkFeatureAccess = React.useCallback((feature: keyof FeatureAccess) => {
        return featureAccess[feature];
    }, [featureAccess]);

    const signOut = React.useCallback(async () => {
        try {
            await authService.logout(); // Clear Auth Token
            setUserId(null);
            setPlanState('free');
            setFeatureAccess(calculateFeatureAccess('free'));
            await resetCaloriv();
        } catch (error) {
            logger.error('Failed to sign out:', error);
        }
    }, [today, userProfile, resetCaloriv]);

    const login = React.useCallback(async (email: string, password?: string) => {
        try {
            setIsLoading(true);
            // 1. Call Backend
            // If password is provided, it's a real login. If not, it's a "quick" login (not recommended for prod but legacy support)
            // Ideally we force password.

            if (!password) {
                logger.warn('Login called without password - using legacy/dummy mode');
                const simpleUserId = email.split('@')[0] + '_' + Date.now();
                setUserId(simpleUserId);
                setPlanState('free');
                return;
            }

            const response = await authService.login({ email, password });

            if (response.success && response.user) {
                const user = response.user;
                setUserId(user.id);
                // Plan might come from user data or subscription API, defaulting to free/premium logic if available
                // For now, assuming free defaults unless backend sends plan
                setPlanState('free');
                setFeatureAccess(calculateFeatureAccess('free'));

                // Set User Profile from backend data
                const restoredProfile: UserProfile = {
                    name: user.name,
                    email: user.email,
                    userId: user.id,
                    age: user.age || null,
                    gender: user.gender || 'male',
                    height: user.height || 170,
                    currentWeight: user.weight || 70,
                    weight: user.weight || 70, // Legacy field
                    startingWeight: user.weight || 70,
                    targetWeight: user.targetWeight || 70,
                    fitnessGoal: user.goal || 'loss',
                    activityFactor: user.activityLevel || 1.375,
                    stepGoal: user.stepGoal || 10000,
                    waterGoal: user.waterGoal || 2000,
                    bmr: null,
                    tdee: null,
                    bmi: null,
                    isGuest: false,
                    streak: user.currentStreak || 0,
                    streakShields: user.streakShields || 0
                };

                setUserProfile(restoredProfile);
                await saveUserProfile(restoredProfile);

                logger.info('✅ Logged in successfully via Backend');
            } else {
                throw new Error(response.message || 'Login failed');
            }

        } catch (error) {
            logger.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update Goals Wrapper
    const updateGoals = async (stepGoal: number, waterGoal: number) => {
        await updateProfile({ stepGoal, waterGoal });
    };

    // Onboarding Wrapper
    const completeOnboarding = React.useCallback(async (profile: UserProfile) => {
        // 1. Sync bio data to backend
        try {
            const syncResult = await authService.updateProfile({
                age: profile.age ?? undefined,
                gender: profile.gender,
                height: profile.height ?? undefined,
                currentWeight: profile.currentWeight ?? undefined,
                targetWeight: profile.targetWeight ?? undefined,
                goal: profile.fitnessGoal ?? undefined,
                mealsPerDay: profile.mealsPerDay,
                cuisines: profile.cuisines,
                diet: profile.diet,
                likedFoods: profile.likedFoods,
                dislikedFoods: profile.dislikedFoods,
                fitnessLevel: profile.workoutExperience,
            });

            if (!syncResult.success && syncResult.error === 'session_invalid') {
                logger.warn('⚠️ Sync failed during onboarding due to invalid session. Ignoring logout to keep user flow.');
                // await signOut(); // DON'T SIGN OUT HERE
                // return;
            }
            logger.info('✅ Bio data synced to backend');
        } catch (error) {
            logger.error('⚠️ Failed to sync bio data to backend:', error);
        }

        // 2. Call Hook (handles local state & persistence)
        await completeOnboardingHook(profile);

        // 3. Restore measurements if available
        if (profile.userId) {
            try {
                // Not supported in storage yet
                // const measurements = await authService.getMeasurements();
                // if (measurements.success && measurements.data && Array.isArray(measurements.data)) {
                //     await AsyncStorage.setItem('body_measurements', JSON.stringify(measurements.data));
                // }
            } catch (e) {
                logger.error('Failed to restore measurements', e);
            }
        }
    }, [completeOnboardingHook]); // cancel dependency on signOut to avoid loop

    // Unit Helper Implementation
    const convertWeight = React.useCallback((kg: number) => {
        if (userProfile?.unitSystem === 'imperial') {
            return parseFloat((kg * 2.20462).toFixed(1));
        }
        return parseFloat(kg.toFixed(1));
    }, [userProfile?.unitSystem]);

    const displayWeight = React.useCallback((kg: number) => {
        if (userProfile?.unitSystem === 'imperial') {
            const lbs = (kg * 2.20462).toFixed(1);
            return `${lbs} lbs`;
        }
        return `${kg.toFixed(1)} kg`;
    }, [userProfile?.unitSystem]);

    const setHasSeenTutorial = React.useCallback(async (seen: boolean) => {
        if (userProfile) {
            await updateProfile({ hasSeenTutorial: seen });
        }
    }, [userProfile, updateProfile]);

    return (
        <CalorivContext.Provider value={{
            userProfile,
            isOnboarded,
            metrics: {
                BMR: userProfile?.bmr || 0,
                TDEE: userProfile?.tdee || 0,
                BMI: String(userProfile?.bmi || 0)
            },
            dailyLog,
            timelineWeeks,
            streak,
            streakShields,
            stats,
            goalConfig: (() => {
                const config = getGoalConfig(
                    userProfile?.fitnessGoal || 'loss',
                    userProfile?.tdee || 2000,
                    userProfile?.currentWeight ?? undefined,
                    userProfile?.targetWeight ?? undefined
                );
                return config;
            })(),
            addSteps,
            addWater,
            addFood,
            removeFood,
            addFoodToDb,
            toggleWorkout,
            foodDatabase,
            refreshData: () => { },
            updateWeight,
            updateTargetWeight,
            updateGoals,
            completeOnboarding,
            updateProfile,
            resetCaloriv,
            isLoading,
            plan,
            featureAccess,
            isAuthenticated: !!userId,
            userId,
            setPlan,
            checkFeatureAccess,
            signOut,
            login,
            convertWeight,
            displayWeight,
            setHasSeenTutorial
        }}>
            {children}
        </CalorivContext.Provider>
    );
}

export function useCaloriv() {
    const context = useContext(CalorivContext);
    if (!context) {
        throw new Error('useCaloriv must be used within a CalorivProvider');
    }
    return context;
}
