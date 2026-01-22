import { useState, useRef, useCallback, useEffect } from 'react';
import { InteractionManager } from 'react-native';
import { format } from 'date-fns';
import { DailyLog } from '../lib/storage';
import { saveDailyLog, getDailyLog, loadStepData } from '../lib/storage';

export interface DailyLogState {
    date: string;
    steps: number;
    water_ml: number;
    calories_eaten: number;
    calories_burned: number;
    workout_done: boolean;
    ai_hours: number;
    mistakes?: string[];
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
    notes?: string;
}

export function useDailyLog(userProfile: any) {
    const [dailyLog, setDailyLog] = useState<DailyLogState | null>(null);
    const [today, setToday] = useState(() => format(new Date(), 'yyyy-MM-dd'));

    // Convert refs to avoid closures issues in async updates
    const dailyLogRef = useRef(dailyLog);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const userProfileRef = useRef(userProfile);

    // Buffers for food updates
    const pendingCaloriesRef = useRef(0);
    const pendingProteinRef = useRef(0);
    const pendingCarbsRef = useRef(0);
    const pendingFatRef = useRef(0);
    const flushFoodTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        dailyLogRef.current = dailyLog;
    }, [dailyLog]);

    useEffect(() => {
        userProfileRef.current = userProfile;
    }, [userProfile]);

    const loadLog = useCallback(async () => {
        try {
            let log = await getDailyLog(today);

            if (!log) {
                const stepData = await loadStepData(today);
                log = {
                    date: today,
                    steps: stepData?.steps || 0,
                    water_ml: 0,
                    calories_eaten: 0,
                    calories_burned: (stepData?.steps || 0) * 0.04,
                    workout_done: false,
                    notes: '',
                    ai_hours: 0,
                    eatenItems: []
                } as DailyLogState;
                await saveDailyLog(log as DailyLog);
            } else {
                // Sync background steps if needed
                const stepData = await loadStepData(today);
                if (stepData && stepData.steps > log.steps) {
                    log.steps = stepData.steps;
                    log.calories_burned = stepData.steps * 0.04;
                    await saveDailyLog(log);
                }
            }

            setDailyLog({
                ...log,
                ai_hours: 0,
                mistakes: []
            });
        } catch (error) {
            console.error('Failed to load daily log', error);
        }
    }, [today]);

    // Handle date changes
    useEffect(() => {
        const checkDateChange = () => {
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            if (currentDate !== today) {
                setToday(currentDate);
                loadLog();
            }
        };
        const interval = setInterval(checkDateChange, 60000);
        return () => clearInterval(interval);
    }, [today, loadLog]);

    // Initial load
    useEffect(() => {
        loadLog();
    }, [loadLog]);

    // --- Actions ---

    const saveLogDebounced = useCallback((delay = 0) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
                const currentLog = dailyLogRef.current;
                if (!currentLog) return;
                const { ai_hours, mistakes, ...logToSave } = currentLog;
                saveDailyLog(logToSave as DailyLog).catch(console.error);
            });
        }, delay);
    }, []);

    const addSteps = useCallback((count: number) => {
        const safeCount = Number(count) || 0;
        const userWeight = userProfileRef.current?.currentWeight || 70;
        const kcalBurned = safeCount * 0.04 * (userWeight / 70);

        setDailyLog(prev => {
            if (!prev) return null;
            return { ...prev, steps: safeCount, calories_burned: kcalBurned };
        });
        saveLogDebounced(0); // Instant save
    }, [saveLogDebounced]);

    const addWater = useCallback((ml: number) => {
        const safeMl = Number(ml) || 0;
        setDailyLog(prev => {
            if (!prev) return null;
            return { ...prev, water_ml: Math.max(0, safeMl) };
        });
        saveLogDebounced(0);
    }, [saveLogDebounced]);

    const addFood = useCallback((calories: number, protein = 0, carbs = 0, fat = 0, name = 'Food') => {
        const safeCal = Number(calories) || 0;

        // Update buffers
        pendingCaloriesRef.current += safeCal;
        pendingProteinRef.current += (Number(protein) || 0);
        pendingCarbsRef.current += (Number(carbs) || 0);
        pendingFatRef.current += (Number(fat) || 0);

        const newItem = safeCal > 0 ? {
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            name,
            calories: safeCal,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            timestamp: Date.now()
        } : null;

        if (flushFoodTimerRef.current) clearTimeout(flushFoodTimerRef.current);

        flushFoodTimerRef.current = setTimeout(() => {
            setDailyLog(prev => {
                if (!prev) return null;
                const updatedItems = newItem ? [...(prev.eatenItems || []), newItem] : prev.eatenItems;
                return {
                    ...prev,
                    calories_eaten: Math.max(0, prev.calories_eaten + pendingCaloriesRef.current),
                    protein_g: Math.max(0, (prev.protein_g || 0) + pendingProteinRef.current),
                    carbs_g: Math.max(0, (prev.carbs_g || 0) + pendingCarbsRef.current),
                    fat_g: Math.max(0, (prev.fat_g || 0) + pendingFatRef.current),
                    eatenItems: updatedItems
                };
            });

            // Reset buffers
            pendingCaloriesRef.current = 0;
            pendingProteinRef.current = 0;
            pendingCarbsRef.current = 0;
            pendingFatRef.current = 0;

            saveLogDebounced(0);
        }, 500);
    }, [saveLogDebounced]);

    const removeFood = useCallback((id: string) => {
        setDailyLog(prev => {
            if (!prev || !prev.eatenItems) return prev;
            const itemToRemove = prev.eatenItems.find(item => item.id === id);
            if (!itemToRemove) return prev;

            const updatedItems = prev.eatenItems.filter(item => item.id !== id);
            return {
                ...prev,
                calories_eaten: Math.max(0, prev.calories_eaten - itemToRemove.calories),
                protein_g: Math.max(0, (prev.protein_g || 0) - itemToRemove.protein),
                carbs_g: Math.max(0, (prev.carbs_g || 0) - itemToRemove.carbs),
                fat_g: Math.max(0, (prev.fat_g || 0) - itemToRemove.fat),
                eatenItems: updatedItems
            };
        });
        saveLogDebounced(100);
    }, [saveLogDebounced]);

    const toggleWorkout = useCallback(() => {
        setDailyLog(prev => {
            if (!prev) return null;
            return { ...prev, workout_done: !prev.workout_done };
        });
        saveLogDebounced(0);
    }, [saveLogDebounced]);

    return {
        dailyLog,
        setDailyLog, // Exposed for special resets if needed
        addSteps,
        addWater,
        addFood,
        removeFood,
        toggleWorkout,
        today
    };
}
