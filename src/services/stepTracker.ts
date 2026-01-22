import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
// import { requestWidgetUpdate } from 'react-native-android-widget'; // TODO: Migrate Widget
// import { StepWidget } from '../widgets/StepWidget'; // TODO: Migrate Widget
// import { lightTheme, darkTheme } from '../lib/theme'; // TODO: Migrate Theme
import { logger } from '../utils/logger';
import { storage } from '../lib/storage';

const STEPS_TODAY_KEY = 'STEPS_TODAY';
const STEPS_HISTORY_KEY = 'STEPS_HISTORY';
const LAST_STEP_COUNT_KEY = 'LAST_STEP_COUNT';
const STEP_DATA_DATE_KEY = 'STEP_DATA_DATE';
const BACKGROUND_TASK_NAME = 'step-tracker-background';

export interface DailyStepData {
    date: string; // YYYY-MM-DD
    steps: number;
    timestamp: number;
}

export interface StepTrackerState {
    currentSteps: number;
    todaySteps: number;
    isPedometerAvailable: boolean;
    isTracking: boolean;
    error: string | null;
}

class StepTrackerService {
    private currentStepWatcher: any = null;
    private listeners: Set<(state: StepTrackerState) => void> = new Set();
    private state: StepTrackerState = {
        currentSteps: 0,
        todaySteps: 0,
        isPedometerAvailable: false,
        isTracking: false,
        error: null,
    };

    /**
     * Initialize step tracking
     */
    async init(): Promise<void> {
        try {
            // Check if pedometer is available
            const available = await Pedometer.isAvailableAsync();

            // Explicitly request permissions if available
            if (available) {
                try {
                    const perm = await Pedometer.requestPermissionsAsync();
                    if (!perm.granted) {
                        logger.info('Pedometer permission denied in service init');
                        // Consider setting error state
                    }
                } catch (e) {
                    logger.info('Error requesting pedometer permissions:', { error: e });
                }
            }

            this.setState({ isPedometerAvailable: available });

            if (!available) {
                this.setState({
                    error: 'Pedometer not available on this device',
                });
                return;
            }

            // Load today's step data
            await this.loadTodaySteps();

            // Start watching step count
            this.startWatching();

            // Register background task
            await this.registerBackgroundTask();

            this.setState({ isTracking: true });
        } catch (error) {
            logger.error('[StepTracker] Init error:', error);
            this.setState({
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Start watching step count in real-time (foreground only)
     */
    private startWatching(): void {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Watch step count from midnight today
            this.currentStepWatcher = Pedometer.watchStepCount((result) => {
                this.updateStepCount(result.steps);
            });
        } catch (error) {
            logger.error('[StepTracker] Watch error:', error);
        }
    }

    /**
     * Load today's step data and handle midnight reset
     */
    private async loadTodaySteps(): Promise<void> {
        try {
            const storedDate = await storage.getString(STEP_DATA_DATE_KEY);
            const today = this.getTodayDateString();

            // Check if date changed (midnight reset)
            if (storedDate !== today) {
                // Save yesterday's data to history
                const todaySteps = (await storage.getNumber(STEPS_TODAY_KEY)) || 0;
                if (storedDate) {
                    await this.saveToHistory(storedDate, todaySteps);
                }

                // Reset today's count
                await storage.set(STEPS_TODAY_KEY, 0);
                await storage.set(STEP_DATA_DATE_KEY, today);
                await storage.delete(LAST_STEP_COUNT_KEY);

                this.setState({ todaySteps: 0 });
            } else {
                // Load existing today's count
                const todaySteps = (await storage.getNumber(STEPS_TODAY_KEY)) || 0;
                this.setState({
                    todaySteps: todaySteps,
                });
            }
        } catch (error) {
            logger.error('[StepTracker] Load steps error:', error);
        }
    }

    /**
     * Handle step count update
     */
    private async updateStepCount(newStepCount: number): Promise<void> {
        try {
            const lastStepCount = (await storage.getNumber(LAST_STEP_COUNT_KEY)) || 0;

            // Calculate step difference (handles device reset)
            let stepDifference = newStepCount - lastStepCount;
            if (stepDifference < 0) {
                stepDifference = newStepCount; // Device reset occurred
            }

            // Update today's total
            const currentTotal = this.state.todaySteps + stepDifference;
            await storage.set(STEPS_TODAY_KEY, currentTotal);
            await storage.set(LAST_STEP_COUNT_KEY, newStepCount);

            this.setState({ todaySteps: currentTotal, currentSteps: newStepCount });

            // UPDATE WIDGET (TODO: Restore when widget library is added)
            // if (Platform.OS === 'android') {
            //    ...
            // }
        } catch (error) {
            logger.error('[StepTracker] Update step count error:', error);
        }
    }

    /**
     * Save day's steps to history
     */
    private async saveToHistory(date: string, steps: number): Promise<void> {
        try {
            const historyJson = await storage.getString(STEPS_HISTORY_KEY);
            const history: DailyStepData[] = historyJson ? JSON.parse(historyJson) : [];

            // Update or add entry
            const existingIndex = history.findIndex((item) => item.date === date);
            if (existingIndex >= 0) {
                history[existingIndex].steps = steps;
            } else {
                history.push({
                    date,
                    steps,
                    timestamp: new Date(date).getTime(),
                });
            }

            // Keep last 365 days
            if (history.length > 365) {
                history.shift();
            }

            await storage.set(STEPS_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            logger.error('[StepTracker] Save history error:', error);
        }
    }

    /**
     * Get today's step count
     */
    async getTodaySteps(): Promise<number> {
        return (await storage.getNumber(STEPS_TODAY_KEY)) || 0;
    }

    /**
     * Get step history
     */
    async getStepHistory(): Promise<DailyStepData[]> {
        try {
            const historyJson = await storage.getString(STEPS_HISTORY_KEY);
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (error) {
            logger.error('[StepTracker] Get history error:', error);
            return [];
        }
    }

    /**
     * Get step count for specific date
     */
    async getStepsForDate(date: string): Promise<number> {
        try {
            const history = await this.getStepHistory();
            const dayData = history.find((item) => item.date === date);
            return dayData ? dayData.steps : 0;
        } catch (error) {
            logger.error('[StepTracker] Get steps for date error:', error);
            return 0;
        }
    }

    /**
     * Register background task (runs every ~15 minutes on Android)
     */
    private async registerBackgroundTask(): Promise<void> {
        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);

            if (!isRegistered) {
                await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
                    minimumInterval: 15 * 60, // 15 minutes (minimum enforced by system)
                    stopOnTerminate: false,
                    startOnBoot: true,
                });

                logger.info('[StepTracker] Background task registered');
            }
        } catch (error) {
            logger.error('[StepTracker] Register background task error:', error);
        }
    }

    /**
     * Stop tracking
     */
    async stop(): Promise<void> {
        try {
            if (this.currentStepWatcher) {
                this.currentStepWatcher.remove();
                this.currentStepWatcher = null;
            }

            await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
            this.setState({ isTracking: false });
        } catch (error) {
            logger.error('[StepTracker] Stop error:', error);
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: (state: StepTrackerState) => void): () => void {
        this.listeners.add(listener);
        listener(this.state); // Immediate call with current state

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Update state and notify listeners
     */
    private setState(updates: Partial<StepTrackerState>): void {
        this.state = { ...this.state, ...updates };
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * Get current state
     */
    getState(): StepTrackerState {
        return this.state;
    }

    /**
     * Utility: Get today's date as string (YYYY-MM-DD)
     */
    private getTodayDateString(): string {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }

    /**
     * Manual step count update (for background task)
     */
    async handleBackgroundUpdate(): Promise<void> {
        try {
            // Allow update on Android too now
            const today = this.getTodayDateString();
            const start = new Date(today);
            const end = new Date();

            let steps = 0;

            if (Platform.OS === 'ios') {
                const result = await Pedometer.getStepCountAsync(start, end);
                steps = result.steps;
            } else {
                // ANDROID BACKGROUND FIX: Try to get actual steps first
                const isAvailable = await Pedometer.isAvailableAsync();
                if (isAvailable) {
                    try {
                        const result = await Pedometer.getStepCountAsync(start, end);
                        steps = result.steps;
                        logger.info(`[Background] Android Pedometer read: ${steps}`);
                    } catch (e) {
                        logger.warn('[Background] Android Pedometer failed, falling back to storage', { error: e });
                        steps = (await storage.getNumber(STEPS_TODAY_KEY)) || 0;
                    }
                }
            }

            if (steps > 0 || (steps === 0 && Platform.OS === 'android')) {
                if (steps > 0) await this.updateStepCount(steps);

                // Widget update commented out
            }

        } catch (error) {
            logger.error('[StepTracker] Background update error:', error);
        }
    }
    /**
     * Public wrapper for updateStepCount (for testing/manual override)
     */
    updateSteps(count: number): void {
        if (count < 0) throw new Error('Cannot set negative steps');
        this.updateStepCount(count);
    }

    /**
     * Get weekly steps (last 7 days)
     */
    async getWeeklySteps(): Promise<DailyStepData[]> {
        const history = await this.getStepHistory();
        // Return last 7 entries
        return history.slice(-7);
    }

    /**
     * Calculate calories burned from steps
     */
    calculateCaloriesBurned(steps: number): number {
        return steps * 0.04;
    }
}

// Export singleton
export const stepTracker = new StepTrackerService();

// Define background task
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
        logger.info('[Background Task] Step tracker running...');
        await stepTracker.handleBackgroundUpdate();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        logger.error('[Background Task] Error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});
