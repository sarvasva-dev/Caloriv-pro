export type FitnessGoal = 'loss' | 'gain' | 'lean' | 'maintain' | 'recomp';

export interface GoalConfig {
    type: FitnessGoal;
    targetCalories: number; // Daily calorie target
    calorieRange: { min: number; max: number }; // Acceptable range for streak
    emoji: string;
    label: string;
    color: string;
    description: string;
    notes: string; // Detailed explanation
    weeklyRate: number; // kg per week
}

/**
 * Get goal configuration based on fitness goal and TDEE, adjusted by Weight Logic
 */
export const getGoalConfig = (
    fitnessGoal: FitnessGoal,
    tdee: number,
    currentWeight?: number,
    targetWeight?: number
): GoalConfig => {
    // 1. Base Configs (Metadata)
    const configs = {
        loss: {
            type: 'loss' as const,
            emoji: '🔥',
            label: 'Lose Weight',
            color: '#ef4444',
            description: 'Calorie Deficit',
            notes: 'Eat 500 kcal less than TDEE daily. Lose ~0.8kg per week. Best for reducing body fat.',
            weeklyRate: 0.8
        },
        gain: {
            type: 'gain' as const,
            emoji: '💪',
            label: 'Gain Muscle',
            color: '#10b981',
            description: 'Calorie Surplus',
            notes: 'Eat 500 kcal more than TDEE daily. Gain ~0.5kg per week. Focus on protein & strength training.',
            weeklyRate: 0.5
        },
        lean: {
            type: 'lean' as const,
            emoji: '⚡',
            label: 'Get Lean',
            color: '#f59e0b',
            description: 'Moderate Deficit',
            notes: 'Eat 300 kcal less than TDEE. Slower fat loss, keeps muscle. High protein recommended.',
            weeklyRate: 0.4
        },
        maintain: {
            type: 'maintain' as const,
            emoji: '🏃',
            label: 'Stay Fit',
            color: '#0ea5e9', // Sky-500
            description: 'Maintenance',
            notes: 'Eat around your TDEE (±100 kcal). Maintain current weight & fitness level.',
            weeklyRate: 0
        },
        recomp: {
            type: 'recomp' as const,
            emoji: '🎯',
            label: 'Body Recomp',
            color: '#4338ca', // Indigo-700
            description: 'Recomposition',
            notes: 'Eat at TDEE. Advanced goal: lose fat while building muscle. Requires consistent training.',
            weeklyRate: 0
        }
    };

    const baseConfig = configs[fitnessGoal] || configs['loss'];

    // 2. Weight-Based Calorie Override Logic 🧠
    let targetCalories = tdee;
    let minCal = tdee - 100;
    let maxCal = tdee + 100;

    if (currentWeight !== undefined && targetWeight !== undefined) {
        // If weights are provided, strict logic applies:
        if (currentWeight > targetWeight) {
            // Needs to LOSE weight -> Deficit
            // Use standard 500 kcal deficit
            targetCalories = tdee - 500;
            minCal = 0; // Safety floor handled elsewhere usually, or set reasonable min like 1200
            maxCal = tdee - 200;
        } else if (currentWeight < targetWeight) {
            // Needs to GAIN weight -> Surplus
            targetCalories = tdee + 500;
            minCal = tdee + 200;
            maxCal = tdee + 1000;
        } else {
            // Maintenance
            targetCalories = tdee;
            minCal = tdee - 100;
            maxCal = tdee + 100;
        }
    } else {
        // Fallback to original goal-based logic if weights missing (shouldn't happen with new flows)
        switch (fitnessGoal) {
            case 'loss': targetCalories = tdee - 500; minCal = 0; maxCal = tdee - 300; break;
            case 'gain': targetCalories = tdee + 500; minCal = tdee + 300; maxCal = tdee + 1000; break;
            case 'lean': targetCalories = tdee - 300; minCal = 0; maxCal = tdee - 200; break;
            default: targetCalories = tdee; minCal = tdee - 100; maxCal = tdee + 100; break;
        }
    }

    // Safety Floor (Don't starve)
    if (targetCalories < 1200) targetCalories = 1200;

    // 3. Dynamic UI Overrides based on Weight Direction 🏷️
    // The User wants "Goal" to only be for Workouts. Calories/Strategy is purely Weight based.
    let dynamicConfig = { ...baseConfig };

    if (currentWeight !== undefined && targetWeight !== undefined) {
        if (currentWeight > targetWeight) {
            // Weight Loss (Deficit) is required, regardless of "Muscle Gain" preference
            dynamicConfig.description = 'Calorie Deficit';
            dynamicConfig.notes = `To reach ${targetWeight}kg from ${currentWeight}kg, a deficit is required.`;
            dynamicConfig.color = configs['loss'].color;
            // We keep the Label (e.g. "Gain Muscle") so they know their workout style, 
            // OR we can append the strategy: "Gain Muscle (Cut)"
        } else if (currentWeight < targetWeight) {
            // Weight Gain (Surplus) is required
            dynamicConfig.description = 'Calorie Surplus';
            dynamicConfig.notes = `To reach ${targetWeight}kg from ${currentWeight}kg, a surplus is required.`;
            dynamicConfig.color = configs['gain'].color;
        } else {
            // Maintenance
            dynamicConfig.description = 'Maintenance';
            dynamicConfig.notes = `Maintain current weight at ${currentWeight}kg.`;
            dynamicConfig.color = configs['maintain'].color;
        }
    }

    return {
        ...dynamicConfig,
        targetCalories,
        calorieRange: { min: minCal, max: maxCal }
    };
};

/**
 * Check if calorie intake meets goal requirements
 */
export const isCalorieGoalMet = (caloriesEaten: number, goalConfig: GoalConfig): boolean => {
    const { min, max } = goalConfig.calorieRange;
    return caloriesEaten >= min && caloriesEaten <= max;
};
