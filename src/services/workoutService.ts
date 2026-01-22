import { API_CONFIG } from '../config/api';
import { logger } from '../utils/logger';

const API_URL = API_CONFIG.BASE_URL;

export interface Exercise {
    id: string;
    name: string;
    description?: string;
    category: string;
    muscleGroup?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    videoUrl?: string; // If available
    caloriesBurnedPerMinute?: number;
}

export const workoutService = {
    /**
     * Get all exercises
     */
    getExercises: async (): Promise<Exercise[]> => {
        try {
            logger.info('🏋️ Fetching exercises...');
            // DOCS: 2.3 Data & Resources (/data) -> GET /exercises
            const response = await fetch(`${API_URL}/data/exercises`);
            const result = await response.json();

            if (result.success && result.data) {
                logger.info(`✅ Fetched ${result.data.length} exercises`);
                return result.data;
            }
            return [];
        } catch (error) {
            logger.error('Exercise fetch error:', error);
            return [];
        }
    },

    /**
     * Get workout plan (mock or real)
     */
    getWorkoutPlan: async () => {
        // Implement plan fetching if API exists, else return mock or empty
        return {
            dailyRoutine: [],
            weeklyGoal: 3,
        };
    },

    /**
     * Log workout activity
     */
    logWorkout: async (data: { workoutName: string; duration: number; calories: number; exercises?: string[] }): Promise<any> => {
        try {
            const token = await storage.getString(StorageKeys.AUTH_TOKEN);
            
            const today = new Date().toISOString().split('T')[0];

            const response = await fetch(`${API_URL}/logs/workout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type: 'workout',
                    date: today,
                    details: {
                        workoutName: data.workoutName,
                        duration: data.duration,
                        exercises: data.exercises,
                    },
                    calories: data.calories,
                }),
            });
            const result = await response.json();
            if (result.success) {
                logger.info(`✅ Workout logged: ${data.workoutName}`);
            }
            return result;
        } catch (error) {
            logger.error('Workout log error:', error);
            return { success: false, message: 'Failed' };
        }
    }
};

