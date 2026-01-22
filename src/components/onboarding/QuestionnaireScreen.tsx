import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { COLORS, SPACING, RADIUS } from '../../theme/designSystem';
import { useCaloriv } from '../../contexts/CalorivContext';
import { useRouter } from 'expo-router';
// Import custom pickers
import VerticalSnapPicker from './VerticalSnapPicker';
import RulerPicker from './RulerPicker';

// Define Step Types
type OnboardingStep =
    | 'GOAL'
    | 'GENDER'
    | 'AGE'
    | 'HEIGHT'
    | 'WEIGHT'
    | 'GOAL_WEIGHT'
    | 'ACTIVITY'
    | 'MEAL_PREF'
    | 'FOOD_PREF'
    | 'FITNESS_LEVEL'
    | 'SCHEDULE';

const STEPS: OnboardingStep[] = [
    'GOAL', 'GENDER', 'AGE', 'HEIGHT', 'WEIGHT', 'GOAL_WEIGHT', 'ACTIVITY', 'MEAL_PREF', 'FOOD_PREF', 'FITNESS_LEVEL', 'SCHEDULE'
];

export default function QuestionnaireScreen() {
    const router = useRouter();
    const { updateProfile } = useCaloriv();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [data, setData] = useState({
        goal: 'lose',
        gender: 'male',
        age: 25,
        height: 170, // cm
        weight: 70, // kg
        goalWeight: 65, // kg
        activityLevel: 'moderate',
        mealsPerDay: 3,
        diet: 'Balanced',
        fitnessLevel: 'Beginner',
        workoutDays: 3
    });

    const currentStep = STEPS[currentStepIndex];

    const nextStep = async () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Finish
            await updateProfile({
                ...data,
                gender: data.gender as "male" | "female" | "other", // Explicit cast
                // map to backend fields if necessary
            });
            router.replace('/(tabs)');
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const updateData = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    // Render Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 'GOAL':
                return (
                    <View className="flex-1 justify-center space-y-4">
                        <Text className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text.primary }}>What is your main goal?</Text>
                        {['Lose Weight', 'Gain Muscle', 'Maintain Weight'].map((goal) => (
                            <TouchableOpacity
                                key={goal}
                                onPress={() => updateData('goal', goal.toLowerCase().split(' ')[0])}
                                style={[
                                    styles.optionButton,
                                    data.goal === goal.toLowerCase().split(' ')[0] && styles.selectedOption
                                ]}
                            >
                                <Text style={[styles.optionText, data.goal === goal.toLowerCase().split(' ')[0] && styles.selectedText]}>{goal}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'GENDER':
                return (
                    <View className="flex-1 justify-center space-y-4">
                        <Text className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text.primary }}>What's your gender?</Text>
                        {['Male', 'Female', 'Other'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                onPress={() => updateData('gender', g.toLowerCase())}
                                style={[
                                    styles.optionButton,
                                    data.gender === g.toLowerCase() && styles.selectedOption
                                ]}
                            >
                                <Text style={[styles.optionText, data.gender === g.toLowerCase() && styles.selectedText]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            case 'AGE':
                return (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text.primary }}>How old are you?</Text>
                        <VerticalSnapPicker
                            items={Array.from({ length: 80 }, (_, i) => (i + 13).toString())}
                            initialIndex={data.age - 13}
                            onValueChange={(val) => updateData('age', parseInt(val))}
                        />
                        <Text className="text-xl mt-8 font-bold text-primary">{data.age} years</Text>
                    </View>
                );
            case 'HEIGHT':
                return (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text.primary }}>How tall are you?</Text>
                        <RulerPicker
                            min={100}
                            max={250}
                            initialValue={data.height}
                            unit="cm"
                            onValueChange={(val) => updateData('height', val)}
                        />
                        <Text className="text-xl mt-8 font-bold text-primary">{data.height} cm</Text>
                    </View>
                );
            case 'WEIGHT':
                return (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text.primary }}>Current Weight?</Text>
                        <RulerPicker
                            min={30}
                            max={200}
                            initialValue={data.weight}
                            unit="kg"
                            onValueChange={(val) => updateData('weight', val)}
                        />
                        <Text className="text-xl mt-8 font-bold text-primary">{data.weight} kg</Text>
                    </View>
                );
            // ... Implement other steps similarly
            default:
                return <Text>Step {currentStep} not implemented yet</Text>;
        }
    };

    return (
        <View className="flex-1 bg-background px-4 py-8">
            {/* Header / Progress */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={prevStep} disabled={currentStepIndex === 0}>
                    <Text className={`text-lg ${currentStepIndex === 0 ? 'text-gray-300' : 'text-primary'}`}>Back</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-500">{currentStepIndex + 1} / {STEPS.length}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={{ height: 4, backgroundColor: COLORS.ui.surface, borderRadius: 2, marginBottom: 20 }}>
                <Animated.View style={{
                    height: '100%',
                    backgroundColor: COLORS.accents.primary,
                    width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`
                }} />
            </View>

            <Animated.View entering={FadeIn} key={currentStepIndex} style={{ flex: 1 }}>
                {renderStepContent()}
            </Animated.View>

            {/* Footer Button */}
            <TouchableOpacity
                onPress={nextStep}
                className="bg-primary py-4 rounded-full items-center mt-4"
                style={{ backgroundColor: COLORS.accents.primary }}
            >
                <Text className="text-white font-bold text-lg">
                    {currentStepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    optionButton: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.ui.border,
        backgroundColor: COLORS.ui.surface,
        marginBottom: SPACING.nm,
        alignItems: 'center'
    },
    selectedOption: {
        borderColor: COLORS.accents.primary,
        backgroundColor: 'rgba(0, 194, 122, 0.1)',
    },
    optionText: {
        fontSize: 18,
        color: COLORS.text.secondary,
        fontWeight: '600'
    },
    selectedText: {
        color: COLORS.accents.primary
    }
});
