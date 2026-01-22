import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
    // Step 1: Goal
    goal: string | null;
    // Step 2: Gender
    gender: string | null;
    // Step 3: Age
    age: number | null;
    // Step 4: Height
    height: number | null;
    // Step 5: Current Weight
    currentWeight: number | null;
    // Step 6: Target Weight
    targetWeight: number | null;
    // Step 7: Activity Level
    activityLevel: string | null;

    // Step 8: Meal Plan
    mealCount: number | null;
    cuisines: string[];
    diet: string | null; // specific diet like Keto, Vegan

    // Step 9: Food Preferences
    likedFoods: string[];
    avoidedFoods: string[];

    // Step 10: Workout Experience
    workoutExperience: 'beginner' | 'intermediate' | 'advanced' | null;

    // Step 11: Workout Profile
    workoutDays: number | null;
    workoutPlace: 'gym' | 'home' | null;
    // Equipment
    fullGymAccess: boolean; // Relevant if workoutPlace is gym
    homeEquipment: string[]; // Relevant if workoutPlace is home (Dumbbells, Bands, Bodyweight)

    workoutDuration: number | null; // in minutes
    additionalInstructions: string | null;

    // Legacy/Generic
    weight: number | null;
    dietPreference: string | null;
    allergies: string[]; // Keeping just in case
    weeklyGoal: string | null;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
    resetData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<OnboardingData>({
        goal: null,
        gender: null,
        age: null,
        height: null,
        currentWeight: null,
        targetWeight: null,
        activityLevel: null,
        mealCount: null,
        cuisines: [],
        diet: null,
        likedFoods: [],
        avoidedFoods: [],
        workoutExperience: null,
        workoutDays: null,
        workoutPlace: null,
        fullGymAccess: false,
        homeEquipment: [],
        workoutDuration: 45,
        additionalInstructions: null,
        weight: null,
        dietPreference: null,
        allergies: [],
        weeklyGoal: null,
    });

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const resetData = () => {
        setData({
            goal: null,
            gender: null,
            age: null,
            height: null,
            currentWeight: null,
            targetWeight: null,
            activityLevel: null,
            mealCount: null,
            cuisines: [],
            diet: null,
            likedFoods: [],
            avoidedFoods: [],
            workoutExperience: null,
            workoutDays: null,
            workoutPlace: null,
            fullGymAccess: false,
            homeEquipment: [],
            workoutDuration: 45,
            additionalInstructions: null,
            weight: null,
            dietPreference: null,
            allergies: [],
            weeklyGoal: null,
        });
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData }}>
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
