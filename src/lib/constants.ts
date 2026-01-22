
import { getGoalConfig, type FitnessGoal } from './goal-utils';

export interface UserProfile {
    name: string;
    height: number;
    startingWeight: number;
    currentWeight: number;
    targetWeight: number;
    age: number;
    gender: 'male' | 'female' | 'other';
    activityFactor: number;
    stepGoal: number;
    waterGoal: number;
    bmr?: number;
    tdee?: number;
    bmi?: number;
}

export const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female' | 'other') => {
    // ✅ Safety bounds to prevent extreme values
    const safeWeight = Math.max(30, Math.min(Number(weight) || 70, 300)); // 30-300kg
    const safeHeight = Math.max(100, Math.min(Number(height) || 170, 250)); // 1m-2.5m
    const safeAge = Math.max(10, Math.min(Number(age) || 25, 100)); // 10-100 years

    const base = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge;
    // For 'other', we use 'male' formula as a baseline or average separate logic. 
    // Using male baseline (base + 5) for now as it's the standard BMR fallback often used if unknown.
    const bmr = Math.round(gender === 'female' ? base - 161 : base + 5);

    // ✅ Final safety bounds: 1000-4000 kcal
    return Math.max(1000, Math.min(bmr, 4000));
};

export const calculateTDEE = (bmr: number, activityFactor: number) => {
    const safeBMR = Number(bmr) || 1500;
    const safeActivity = Number(activityFactor) || 1.375;
    return Math.round(safeBMR * safeActivity);
};

export const calculateBMI = (weight: number, height: number) => {
    const safeWeight = Number(weight) || 70;
    const safeHeight = Number(height) || 170;
    const heightM = safeHeight / 100;
    return (safeWeight / (heightM * heightM)).toFixed(1);
};

export const calculateTimelineWeeks = (
    currentWeight: number,
    targetWeight: number,
    fitnessGoal: FitnessGoal = 'loss',
    tdee: number = 2000
) => {
    const safeCurrent = Number(currentWeight) || 70;
    const safeTarget = Number(targetWeight) || 65;
    const goalConfig = getGoalConfig(fitnessGoal, tdee);

    // Safety check - if goalConfig is undefined or weeklyRate is 0
    if (!goalConfig || goalConfig.weeklyRate === 0) {
        return 0;
    }

    const weightDiff = Math.abs(safeCurrent - safeTarget);
    return Math.max(0, Math.ceil(weightDiff / goalConfig.weeklyRate));
};

export const getGreetings = (name: string) => ({
    MORNING: `Good Morning, ${name} 🌅. Time to dominate.`,
    AFTERNOON: `Good Afternoon, ${name} ☀️. Stay focused.`,
    EVENING: `Good Evening, ${name} 🌆. Push harder.`,
    NIGHT: `Good Night, ${name} 🌙. Did you earn it?`,
});
