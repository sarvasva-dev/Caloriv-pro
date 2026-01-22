import { DailyLog } from './storage';
import { format, subDays } from 'date-fns';
import { getGoalConfig, isCalorieGoalMet } from './goal-utils';
import { calculateBMR, calculateTDEE } from './constants';

/**
 * Calculate current streak based on daily logs
 */
export const calculateStreak = (logs: DailyLog[], userProfile: any): number => {
    if (!logs || !logs.length || !userProfile) return 0;

    try {
        const safeNum = (val: any) => Number(val) || 0;
        const bmr = calculateBMR(
            safeNum(userProfile.currentWeight) || 70,
            safeNum(userProfile.height) || 170,
            safeNum(userProfile.age) || 25,
            userProfile.gender || 'male'
        );
        const tdee = calculateTDEE(bmr, safeNum(userProfile.activityFactor) || 1.375);

        const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        let streak = 0;
        const currentDate = new Date();
        const todayStr = format(currentDate, 'yyyy-MM-dd');

        // Check if today's goals are complete
        const todayLog = sortedLogs.find(l => l.date === todayStr);
        let startFromToday = false;

        if (todayLog) {
            const todayDayOfWeek = currentDate.getDay();
            const isTodaySunday = todayDayOfWeek === 0;
            const todayStepsGoalMet = todayLog.steps >= (userProfile.stepGoal || 10000);
            const todayWorkoutDone = todayLog.workout_done === true;
            const todayGoalConfig = getGoalConfig(userProfile.fitnessGoal || 'loss', tdee);
            const todayCalorieGoalMet = isCalorieGoalMet(todayLog.calories_eaten, todayGoalConfig);
            const todayWorkoutRequired = isTodaySunday ? true : todayWorkoutDone;

            startFromToday = todayStepsGoalMet && todayWorkoutRequired && todayCalorieGoalMet;
        }

        const startDay = startFromToday ? 0 : 1;

        for (let i = startDay; i < 365; i++) {
            const dateStr = format(subDays(currentDate, i), 'yyyy-MM-dd');
            const log = sortedLogs.find(l => l.date === dateStr);

            if (!log) break;

            const dayOfWeek = new Date(dateStr).getDay();
            const isSunday = dayOfWeek === 0;

            if (log.shield_used) {
                continue;
            }

            const stepsGoalMet = log.steps >= (userProfile.stepGoal || 10000);
            const workoutDone = log.workout_done === true;

            const goalConfig = getGoalConfig(userProfile.fitnessGoal || 'loss', tdee);
            const calorieGoalMet = isCalorieGoalMet(log.calories_eaten, goalConfig);

            const workoutRequired = isSunday ? true : workoutDone;

            if (stepsGoalMet && workoutRequired && calorieGoalMet) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        console.error('Streak error:', error);
        return 0;
    }
};

export const isTodayStreakEligible = (dailyLog: DailyLog | null, userProfile: any): boolean => {
    if (!dailyLog || !userProfile) return false;

    const today = new Date().getDay();
    const isSunday = today === 0;

    const stepsGoalMet = dailyLog.steps >= (userProfile.stepGoal || 10000);
    const workoutDone = dailyLog.workout_done === true;

    const safeNum = (val: any) => Number(val) || 0;
    const bmr = calculateBMR(
        safeNum(userProfile.currentWeight) || 70,
        safeNum(userProfile.height) || 170,
        safeNum(userProfile.age) || 25,
        userProfile.gender || 'male'
    );
    const tdee = calculateTDEE(bmr, safeNum(userProfile.activityFactor) || 1.375);

    const goalConfig = getGoalConfig(userProfile.fitnessGoal || 'loss', tdee);
    const calorieGoalMet = isCalorieGoalMet(dailyLog.calories_eaten, goalConfig);

    const workoutRequired = isSunday ? true : workoutDone;

    return stepsGoalMet && workoutRequired && calorieGoalMet;
};

export const getStreakProgress = (dailyLog: DailyLog | null, userProfile: any) => {
    if (!dailyLog || !userProfile) {
        return {
            stepsGoalMet: false,
            workoutDone: false,
            calorieGoalMet: false,
            allGoalsMet: false,
            isSunday: false
        };
    }

    const today = new Date().getDay();
    const isSunday = today === 0;

    const stepsGoalMet = dailyLog.steps >= (userProfile.stepGoal || 10000);
    const workoutDone = dailyLog.workout_done === true;

    const safeNum = (val: any) => Number(val) || 0;
    const weight = safeNum(userProfile.currentWeight);
    const height = safeNum(userProfile.height);
    const age = safeNum(userProfile.age);

    const bmr = weight > 0 && height > 0 && age > 0
        ? calculateBMR(weight, height, age, userProfile.gender || 'male')
        : 1800;

    const tdee = calculateTDEE(bmr, safeNum(userProfile.activityFactor) || 1.375);

    const goalConfig = getGoalConfig(userProfile.fitnessGoal || 'loss', tdee);
    const calorieGoalMet = isCalorieGoalMet(dailyLog.calories_eaten, goalConfig);

    const workoutRequired = isSunday ? true : workoutDone;

    return {
        stepsGoalMet,
        workoutDone,
        calorieGoalMet,
        allGoalsMet: stepsGoalMet && workoutRequired && calorieGoalMet,
        isSunday
    };
};

export const getStreakMotivation = (streak: number): string => {
    if (streak === 0) return "Start your journey today! 💪";
    if (streak === 1) return "Great start! Don't break it! 🔥";
    if (streak < 7) return `${streak} days strong! Keep going! 💯`;
    if (streak < 30) return `${streak} days! You're unstoppable! 🚀`;
    if (streak < 100) return `${streak} days! Beast mode activated! 👑`;
    return `${streak} days! LEGENDARY! 🏆`;
};
