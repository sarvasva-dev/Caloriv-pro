import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ScrollView, Dimensions, PanResponder } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { COLORS } from '../../../theme/designSystem';
import VerticalSnapPicker from '../../../components/onboarding/VerticalSnapPicker';
import RulerPicker from '../../../components/onboarding/RulerPicker';

const { width } = Dimensions.get('window');

import { useCaloriv } from '../../../contexts/CalorivContext';

export default function OnboardingStep() {
    const { step } = useLocalSearchParams();
    const router = useRouter();
    const { data, updateData } = useOnboarding();
    const { completeOnboarding, userProfile } = useCaloriv();

    const currentStep = parseInt(step as string) || 1;
    const totalSteps = 11;

    // Unit State (Local for UI toggles)
    const [weightUnit, setWeightUnit] = useState<'lb' | 'kg'>('lb');
    const [heightUnit, setHeightUnit] = useState<'ft' | 'cm'>('ft'); // 'ft' implies ft/in

    const nextStep = async () => {
        if (currentStep < totalSteps) {
            router.push(`/onboarding/step/${currentStep + 1}`);
        } else {
            // Final Step: Submit Data
            try {
                const finalProfile = {
                    ...userProfile, 
                    gender: data.gender || 'male',
                    age: data.age || 25,
                    height: data.height || 170, // cm
                    // Store final weight in kg for consistency in backend
                    // If user was in LB mode, we must assume currentWeight logic stored the raw number
                    // But we don't have access to 'weightUnit' state here easily as it was local to that render step?
                    // actually weightUnit is top level state in this file.
                    currentWeight: weightUnit === 'lb' ? Math.round((data.currentWeight || 150) * 0.453592) : (data.currentWeight || 70),
                    weight: weightUnit === 'lb' ? Math.round((data.currentWeight || 150) * 0.453592) : (data.currentWeight || 70),
                    targetWeight: weightUnit === 'lb' ? Math.round((data.targetWeight || 140) * 0.453592) : (data.targetWeight || 65),
                    fitnessGoal: data.goal || 'loss',
                    activityLevel: data.activityLevel || 'sedentary', // Keep consistency
                    // Extended Data
                    mealsPerDay: data.mealCount,
                    cuisines: data.cuisines,
                    diet: data.diet,
                    likedFoods: data.likedFoods,
                    dislikedFoods: data.avoidedFoods,
                    workoutExperience: data.workoutExperience
                };

                await completeOnboarding(finalProfile as any);
                router.replace('/(tabs)');
            } catch (error) {
                console.error("Onboarding Submit Error", error);
                // Fallback navigation
                router.replace('/(tabs)');
            }
        }
    };

    // --- REUSABLE COMPONENTS ---

    const Header = () => (
        <SafeAreaView className="bg-white">
            <View className="flex-row justify-between items-center mb-6 px-4 pt-2 mt-12">
                <TouchableOpacity onPress={router.back} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                    <Ionicons name="chevron-back" size={24} color="#374151" />
                </TouchableOpacity>

                <Text className="text-lg font-bold text-emerald-900">Your profile</Text>

                <View className="px-3 py-1 bg-white border border-gray-200 rounded-full">
                    <Text className="font-bold text-gray-800">{currentStep}/{totalSteps}</Text>
                </View>
            </View>
        </SafeAreaView>
    );

    const ContinueButton = () => (
        <View className="py-4 pt-2">
            <TouchableOpacity
                onPress={nextStep}
                className="bg-emerald-500 rounded-full py-4 flex-row items-center justify-between px-6 shadow-lg shadow-emerald-200"
            >
                <View className="w-6" />
                <Text className="text-white text-lg font-bold">Continue</Text>
                <View className="bg-white rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="arrow-forward" size={16} color="#10B981" />
                </View>
            </TouchableOpacity>
        </View>
    );

    const OptionCard = ({ label, description, value, selectedValue, onSelect, iconName, iconType = 'Ionicons', iconColor }: any) => {
        const isSelected = selectedValue === value;
        // Logic: specific iconColor overrides default logic, but selected state might force emerald? 
        // Actually for Step 10, the icons are colored even when unselected (Green/Purple/Orange chips).
        // Let's use iconColor if provided, otherwise default logic.

        const finalIconColor = iconColor ? iconColor : (isSelected ? '#10B981' : '#6B7280');
        const iconContainerBg = iconColor ? `${iconColor}20` : (isSelected ? 'bg-emerald-100' : 'bg-gray-100'); // roughly 20% opacity for bg if color provided

        return (
            <TouchableOpacity
                onPress={() => onSelect(value)}
                activeOpacity={0.9}
                className={`p-4 mb-4 rounded-2xl border flex-row items-center ${isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 bg-white'}`}
            >
                <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mr-4`}
                    style={{ backgroundColor: iconColor ? `${iconColor}20` : undefined }} // Use inline style for dynamic hex opacity if needed, or class fallback
                >
                    {/* Fallback View logic roughly matched above, but tailored: */}
                    <View className={`absolute inset-0 rounded-xl opacity-20 ${!iconColor && (isSelected ? 'bg-emerald-500' : 'bg-gray-500')}`} style={{ backgroundColor: iconColor }} />

                    {iconType === 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons name={iconName} size={24} color={finalIconColor} />
                    ) : (
                        <Ionicons name={iconName} size={24} color={finalIconColor} />
                    )}
                </View>

                <View className="flex-1 pr-2">
                    <Text className={`font-bold text-base mb-1 ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>{label}</Text>
                    {description && <Text className="text-gray-500 text-xs leading-4">{description}</Text>}
                </View>

                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-gray-300'}`}>
                    {isSelected && <View className="w-3 h-3 rounded-full bg-emerald-500" />}
                </View>
            </TouchableOpacity>
        );
    };

    // Toggle Button (Pill Shape)
    const UnitToggle = ({ leftLabel, rightLabel, active, onLeft, onRight }: any) => (
        <View className="flex-row bg-gray-100 rounded-lg p-1 self-center mb-6">
            <TouchableOpacity
                onPress={onLeft}
                className={`px-6 py-2 rounded-md ${active === 'left' ? 'bg-emerald-500 shadow-sm' : 'bg-transparent'}`}
            >
                <Text className={`font-bold ${active === 'left' ? 'text-white' : 'text-gray-500'}`}>{leftLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onRight}
                className={`px-6 py-2 rounded-md ${active === 'right' ? 'bg-emerald-500 shadow-sm' : 'bg-transparent'}`}
            >
                <Text className={`font-bold ${active === 'right' ? 'text-white' : 'text-gray-500'}`}>{rightLabel}</Text>
            </TouchableOpacity>
        </View>
    );

    // Visual Ruler Components
    const HorizontalRuler = ({ value }: { value: number }) => (
        <View className="items-center justify-center py-6 h-48 bg-white rounded-3xl border border-gray-100 shadow-sm mb-4">
            <View className="flex-row items-center mb-6">
                <Text className="text-4xl font-bold text-emerald-900">{value.toFixed(1)}</Text>
                <Text className="text-xl text-gray-500 font-bold ml-2">{weightUnit}</Text>
                <Ionicons name="pencil" size={16} color="#10B981" style={{ marginLeft: 10, backgroundColor: '#ECFDF5', padding: 4, borderRadius: 10, overflow: 'hidden' }} />
            </View>

            {/* Ruler Visualization */}
            <View className="h-16 w-full flex-row items-end justify-center space-x-2 overflow-hidden relative">
                {/* Center Indicator */}
                <View className="absolute bottom-0 w-2 h-16 bg-emerald-400 rounded-full z-10 self-center left-[50%] -ml-1" />

                {/* Scale Lines (Mocked for visual fidelity) */}
                {[...Array(15)].map((_, i) => {
                    const isMajor = i % 5 === 2; // Roughly center
                    return (
                        <View key={i} className={`w-1.5 rounded-full bg-gray-200 ${isMajor ? 'h-10' : 'h-6'}`} />
                    )
                })}
            </View>
            {/* Labels under ruler */}
            <View className="flex-row justify-between w-64 mt-2 px-4">
                <Text className="text-gray-400 font-medium">{Math.floor(value - 1)}</Text>
                <Text className="text-gray-400 font-medium">{Math.ceil(value + 1)}</Text>
            </View>
        </View>
    );

    const VerticalRuler = ({ value }: { value: number }) => (
        <View className="items-center justify-center py-6 h-[400px] bg-white rounded-3xl border border-gray-100 shadow-sm mb-4">
            <View className="items-center mb-4">
                <Text className="text-4xl font-bold text-emerald-900">{heightUnit === 'ft' ? `5'0"` : value}</Text>
                <Text className="text-xl text-gray-500 font-bold">{heightUnit === 'ft' ? 'ft' : 'cm'}</Text>
            </View>

            {/* Ruler Visualization */}
            <View className="flex-1 items-center justify-center relative w-20">
                {/* Center Indicator */}
                <View className="absolute w-16 h-2 bg-emerald-400 rounded-full z-10 top-[50%] -mt-1" />

                {/* Scale Lines */}
                <View className="space-y-3 items-center opacity-60">
                    {[...Array(10)].map((_, i) => (
                        <View key={i} className={`h-1 rounded-full bg-gray-200 ${i === 4 ? 'w-10' : 'w-6'}`} />
                    ))}
                </View>
            </View>
        </View>
    );


    // --- CONTENT RENDERER ---
    const renderContent = () => {
        switch (currentStep) {
            case 1: // Goal
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">What's your goal?</Text>
                        <Text className="text-gray-500 mb-6 font-medium">Select your main goal</Text>

                        <OptionCard label="Lose Fat" description="Steady loss of 1–2 lbs per week while preserving muscle mass." value="loss" iconName="walk-outline" selectedValue={data.goal} onSelect={(v: any) => updateData('goal', v)} />
                        <OptionCard label="Fast Weight Loss" description="Lose 2–3 lbs per week for quick results, not recommended for long-term." value="fast_loss" iconName="trending-down" selectedValue={data.goal} onSelect={(v: any) => updateData('goal', v)} />
                        <OptionCard label="Gain Muscle Mass" description="Slow gain while building muscle mass." value="gain_muscle" iconName="dumbbell" iconType="MaterialCommunityIcons" selectedValue={data.goal} onSelect={(v: any) => updateData('goal', v)} />
                        <OptionCard label="Gain Weight" description="Quicker gain for bulking or if underweight." value="gain_weight" iconName="trending-up" selectedValue={data.goal} onSelect={(v: any) => updateData('goal', v)} />
                        <OptionCard label="Maintain Weight" description="Stay at current weight, build healthy habits." value="maintain" iconName="scale-balance" iconType="MaterialCommunityIcons" selectedValue={data.goal} onSelect={(v: any) => updateData('goal', v)} />
                    </View>
                );

            case 2: // Gender
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">What's your gender?</Text>
                        <View className="mt-4 space-y-4">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <TouchableOpacity key={g} onPress={() => updateData('gender', g)} className={`p-4 rounded-full border flex-row items-center justify-between px-6 ${data.gender === g ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200'}`}>
                                    <View className="flex-row items-center">
                                        <Ionicons name={g === 'Male' ? 'male' : g === 'Female' ? 'female' : 'male-female'} size={20} color={data.gender === g ? '#10B981' : '#6B7280'} style={{ marginRight: 12 }} />
                                        <Text className={`font-bold text-lg ${data.gender === g ? 'text-emerald-900' : 'text-gray-700'}`}>{g}</Text>
                                    </View>
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${data.gender === g ? 'border-emerald-500' : 'border-gray-300'}`}>
                                        {data.gender === g && <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 3: // Age
                const ages = Array.from({ length: 85 }, (_, i) => (i + 15).toString()); // 15 to 99
                // Find index of current age
                const currentAgeStr = (data.age || 20).toString();
                const initialAgeIndex = ages.indexOf(currentAgeStr) >= 0 ? ages.indexOf(currentAgeStr) : 5; // Default 20 (15+5)

                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">How old are you?</Text>
                        <View className="bg-sky-50 p-4 rounded-xl flex-row items-start mt-2 border border-sky-100 mb-8">
                            <Ionicons name="bulb-outline" size={20} color="#0EA5E9" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-sky-900 flex-1 leading-5">Your metabolism changes with age, so we factor this into your personalized calorie calculations</Text>
                        </View>

                        {/* Scroller Implementation */}
                        <View className="items-center justify-center py-6 h-[250px] relative">
                             <VerticalSnapPicker 
                                items={ages} 
                                initialIndex={initialAgeIndex}
                                onValueChange={(val) => updateData('age', parseInt(val))}
                             />
                             {/* Overlay to highlight selected */}
                             <View pointerEvents="none" className="absolute top-[50%] -mt-8 h-16 w-full border-t border-b border-emerald-500 bg-emerald-50/10" />
                        </View>
                        
                        <View className="self-center border border-gray-200 px-6 py-2 rounded-full flex-row items-center mt-8">
                            <Ionicons name="person-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                            <Text className="font-bold text-gray-700">{data.age || 20} Years old</Text>
                        </View>
                    </View>
                );

            case 4: // Height
                // Generate items based on unit
                let heightItems: string[] = [];
                let initialHeightIndex = 0;
                
                if (heightUnit === 'ft') {
                    // 4'0" to 7'11"
                    for(let f=4; f<=7; f++) {
                        for(let i=0; i<12; i++) {
                            heightItems.push(`${f}'${i}"`);
                        }
                    }
                    // Current value is in cm mostly, need conversion for initial index if coming from storage
                    // Assumption: data.height is stored in cm as number.
                    // If we need to sync, we do it in useEffect or on fly.
                    // For logic simplicity, let's assume we update data.height in cm always.
                    
                    // Convert current cm to ft'in" string to find index
                    // But simpler: just default to 5'6" index if not sure
                    // 5'6" index: (5-4)*12 + 6 = 18
                   initialHeightIndex = 18; 
                   // TODO: Real conversion logic if needed for persistence
                } else {
                    // 100cm to 250cm
                    heightItems = Array.from({ length: 151 }, (_, i) => (i + 100).toString());
                    const h = data.height || 170;
                    initialHeightIndex = Math.max(0, h - 100);
                }

                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-4 text-center">What is your height?</Text>
                        <UnitToggle leftLabel="ft/in" rightLabel="cm" active={heightUnit === 'ft' ? 'left' : 'right'} onLeft={() => setHeightUnit('ft')} onRight={() => setHeightUnit('cm')} />
                        
                        <View className="items-center justify-center py-6 h-[300px] relative mt-4">
                             {/* Key is crucial to reset component on unit change */}
                             <VerticalSnapPicker 
                                key={`height-${heightUnit}`}
                                items={heightItems}
                                initialIndex={initialHeightIndex}
                                onValueChange={(val, idx) => {
                                    if(heightUnit === 'cm') {
                                        updateData('height', parseInt(val));
                                    } else {
                                        // Parse 5'1" .. 
                                        // We have index, maybe handy? 
                                        // val is string 5'1"
                                        const parts = val.split("'");
                                        const ft = parseInt(parts[0]);
                                        const inch = parseInt(parts[1].replace('"',''));
                                        const cm = Math.round((ft * 30.48) + (inch * 2.54));
                                        updateData('height', cm);
                                    }
                                }}
                             />
                        </View>

                        <View className="self-center border border-gray-200 px-6 py-2 rounded-full flex-row items-center mt-2">
                            <Ionicons name="resize-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                            <Text className="font-bold text-gray-700">
                                {heightUnit === 'ft' 
                                    ? (() => {
                                        const cm = data.height || 170;
                                        const totalInches = cm / 2.54;
                                        const feet = Math.floor(totalInches / 12);
                                        const inches = Math.round(totalInches % 12);
                                        return `${feet}'${inches}" ft tall`;
                                    })()
                                    : `${data.height || 170} cm tall`
                                }
                            </Text>
                        </View>
                    </View>
                );

            case 5: // Weight
                const minW = weightUnit === 'lb' ? 60 : 30;
                const maxW = weightUnit === 'lb' ? 400 : 200;
                // Convert currentWeight to unit for display
                const currentWeightVal = data.currentWeight || (weightUnit === 'lb' ? 150 : 70); 
                // data.currentWeight is likely stored in ONE unit (e.g., kg) or user just sees raw number?
                // Standard: Store in kg, convert for display.
                // Let's assume data.currentWeight is RAW number entered by user in that unit for now to avoid complexity, 
                // OR we standardise on KG.
                // If standard is KG:
                // lb = kg * 2.20462.
                // To support both effortlessly without complex state logic in this snippet:
                // We'll update raw value.

                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-4 text-center">What is your weight?</Text>
                        <UnitToggle leftLabel="lb" rightLabel="kg" active={weightUnit === 'lb' ? 'left' : 'right'} onLeft={() => setWeightUnit('lb')} onRight={() => setWeightUnit('kg')} />
                        
                        <View className="mt-8 mb-8" key={`weight-${weightUnit}`}>
                            <RulerPicker 
                                min={weightUnit === 'lb' ? 60 : 30} 
                                max={weightUnit === 'lb' ? 400 : 200}
                                step={1} 
                                unit={weightUnit}
                                initialValue={currentWeightVal}
                                onValueChange={(val) => {
                                    // Always store just the value relative to the current unit
                                    // The transformation happens in Final Step or we assume the unit state persists
                                    updateData('currentWeight', val);
                                }}
                            />
                        </View>
                        
                        <View className="self-center border border-gray-200 px-6 py-2 rounded-full flex-row items-center mt-2">
                            <Ionicons name="scale-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                            <Text className="font-bold text-gray-700">{data.currentWeight || 150} {weightUnit} weight</Text>
                        </View>
                    </View>
                );

            case 6: // Target Weight
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">What's your goal weight?</Text>

                        {/* Tip Box */}
                        <View className="bg-sky-50 p-4 rounded-xl flex-row items-start mt-2 border border-sky-100 mb-6">
                            <Ionicons name="bulb-outline" size={20} color="#0EA5E9" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-sky-900 flex-1 leading-5">Your goal weight helps us calculate a personalized timeline and daily targets for your journey</Text>
                        </View>

                        <UnitToggle leftLabel="lb" rightLabel="kg" active={weightUnit === 'lb' ? 'left' : 'right'} onLeft={() => setWeightUnit('lb')} onRight={() => setWeightUnit('kg')} />

                        <View className="mt-8 mb-8">
                            <RulerPicker 
                                min={weightUnit === 'lb' ? 60 : 30} 
                                max={weightUnit === 'lb' ? 400 : 200}
                                step={1} 
                                unit={weightUnit}
                                initialValue={data.targetWeight || 140}
                                onValueChange={(val) => updateData('targetWeight', val)}
                            />
                        </View>

                        <View className="self-center border border-gray-200 px-6 py-2 rounded-full flex-row items-center mt-2 mb-8">
                            <Ionicons name="flag-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                            <Text className="font-bold text-gray-700">{data.targetWeight || 140} {weightUnit} goal weight</Text>
                        </View>

                        {/* Achievable Insight Box */}
                        {(() => {
                            const current = data.currentWeight || 150;
                            const target = data.targetWeight || 140;
                            const diff = Math.abs(current - target);
                            // Rate assumptions (kg/week approx): Loss=0.5, Fast=1, Gain=0.25
                            // If lb, rate is double: Loss=1, Fast=2, Gain=0.5
                            const isLb = weightUnit === 'lb';
                            let rate = 0;

                            if (data.goal?.includes('loss')) rate = data.goal === 'fast_loss' ? (isLb ? 2 : 1) : (isLb ? 1 : 0.5);
                            else if (data.goal?.includes('gain')) rate = isLb ? 0.5 : 0.25;

                            const weeks = rate > 0 ? Math.ceil(diff / rate) : 0;

                            return (
                                <View className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                    <Text className="text-emerald-900 font-bold text-lg mb-1">Your goal is achievable</Text>
                                    <Text className="text-emerald-700">Estimated time: {weeks > 0 ? `${weeks} weeks` : 'Calculating...'}</Text>
                                </View>
                            );
                        })()}
                    </View>
                );

            case 7: // Activity Level
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-4">How active are you most days?</Text>
                        <OptionCard label="Sedentary" description="Mostly sitting throughout the day, minimal movement" value="sedentary" iconName="chair-rolling" iconType="MaterialCommunityIcons" selectedValue={data.activityLevel} onSelect={(v: any) => updateData('activityLevel', v)} />
                        <OptionCard label="Lightly Active" description="Some walking or light activity during the day" value="light" iconName="walk" iconType="MaterialCommunityIcons" selectedValue={data.activityLevel} onSelect={(v: any) => updateData('activityLevel', v)} />
                        <OptionCard label="Moderately Active" description="Regular exercise or a job that keeps you moving" value="moderate" iconName="bike" iconType="MaterialCommunityIcons" selectedValue={data.activityLevel} onSelect={(v: any) => updateData('activityLevel', v)} />
                        <OptionCard label="Very Active" description="Physically demanding work or intense daily training" value="very_active" iconName="fire" iconType="MaterialCommunityIcons" selectedValue={data.activityLevel} onSelect={(v: any) => updateData('activityLevel', v)} />
                    </View>
                );
            case 8: // Meal Plan
                return (
                    <View>
                        {/* Tip Box */}
                        <View className="bg-sky-50 p-4 rounded-xl flex-row items-start mt-2 border border-sky-100 mb-6">
                            <Ionicons name="bulb-outline" size={20} color="#0EA5E9" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-sky-900 flex-1 leading-5">Now let's design a meal plan tailored to you. You can create unlimited meals and update them anytime to suit your preferences</Text>
                        </View>

                        {/* Meal Count */}
                        <Text className="text-lg font-bold text-emerald-900 mb-4">How many meals work best for your schedule?</Text>
                        <View className="flex-row space-x-3 mb-4">
                            {[3, 4, 5, 6].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() => updateData('mealCount', num)}
                                    className={`w-14 h-14 rounded-2xl items-center justify-center border ${data.mealCount === num ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-bold text-xl ${data.mealCount === num ? 'text-white' : 'text-gray-600'}`}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="bg-emerald-50 self-start px-4 py-2 rounded-full mb-8">
                            <Text className="text-emerald-700 font-bold">{data.mealCount || 3} Meals + 1 Snack</Text>
                        </View>

                        {/* Cuisines */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-emerald-900 flex-1 pr-2">Which cuisines do you enjoy most?</Text>
                            <Text className="text-gray-400 font-bold">{(data.cuisines || []).length}/3</Text>
                        </View>

                        {/* Cuisines List (Simplified for scroll) */}
                        <View className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
                            <TouchableOpacity className="p-4 border-b border-gray-100 flex-row justify-between">
                                <Text className="text-gray-700 font-medium">Any</Text>
                                <Ionicons name="caret-down" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                            {['Indian', 'Italian', 'Japanese', 'Korean', 'Mediterranean', 'Mexican'].map((cuisine) => (
                                <TouchableOpacity
                                    key={cuisine}
                                    onPress={() => {
                                        const current = data.cuisines || [];
                                        if (current.includes(cuisine)) {
                                            updateData('cuisines', current.filter((c: string) => c !== cuisine));
                                        } else if (current.length < 3) {
                                            updateData('cuisines', [...current, cuisine]);
                                        }
                                    }}
                                    className="p-4 border-b border-gray-50 flex-row items-center"
                                >
                                    <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${(data.cuisines || []).includes(cuisine) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {(data.cuisines || []).includes(cuisine) && <Ionicons name="checkmark" size={14} color="white" />}
                                    </View>
                                    <Text className="text-gray-800">{cuisine}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Diet Preference */}
                        <Text className="text-lg font-bold text-emerald-900 mb-4">Is there a specific diet you would like to follow?</Text>
                        <TouchableOpacity className="p-4 border border-gray-200 rounded-xl flex-row justify-between items-center bg-white mb-8">
                            <Text className="text-gray-700 font-medium">{data.diet || "Any Diet"}</Text>
                            <Ionicons name="caret-down" size={16} color="#9CA3AF" />
                        </TouchableOpacity>

                    </View>
                );

            case 9: // Food Preferences
                const toggleSelection = (list: string[], item: string, key: 'likedFoods' | 'avoidedFoods') => {
                    if (list.includes(item)) {
                        updateData(key, list.filter(i => i !== item));
                    } else {
                        updateData(key, [...list, item]);
                    }
                };

                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">Your profile</Text>
                        {/* Tip Box */}
                        <View className="bg-sky-50 p-4 rounded-xl flex-row items-start mt-2 border border-sky-100 mb-6">
                            <Ionicons name="bulb-outline" size={20} color="#0EA5E9" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-sky-900 flex-1 leading-5">Tell us what you like to eat so we can design meal plans around foods you actually enjoy</Text>
                        </View>

                        {/* Liked Foods */}
                        <Text className="text-lg font-bold text-emerald-900 mb-2">What foods do you like?</Text>
                        <Text className="text-gray-500 mb-4">We'll try to include these in your meal</Text>

                        <TextInput className="p-4 bg-white border border-gray-200 rounded-xl mb-4" placeholder="Type a preference and press Enter..." />

                        <Text className="text-gray-400 text-xs mb-2 uppercase font-bold">Quick Add:</Text>
                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {['Chicken', 'Salmon', 'Eggs', 'Rice', 'Tofu', 'Protein Shake', 'Fruits', 'Vegetables'].map(food => (
                                <TouchableOpacity
                                    key={food}
                                    onPress={() => toggleSelection(data.likedFoods || [], food, 'likedFoods')}
                                    className={`px-4 py-2 rounded-full border ${data.likedFoods?.includes(food) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={data.likedFoods?.includes(food) ? 'text-emerald-700 font-medium' : 'text-gray-600'}>{food}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Avoided Foods */}
                        <Text className="text-lg font-bold text-emerald-900 mb-2">Any foods to avoid?</Text>
                        <Text className="text-gray-500 mb-4">Include allergies, intolerances, or foods you dislike</Text>

                        <TextInput className="p-4 bg-white border border-gray-200 rounded-xl mb-4" placeholder="Type a preference and press Enter..." />

                        <Text className="text-gray-400 text-xs mb-2 uppercase font-bold">Quick Add:</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {['Peanuts', 'Tree Nuts', 'Dairy', 'Gluten'].map(food => (
                                <TouchableOpacity
                                    key={food}
                                    onPress={() => toggleSelection(data.avoidedFoods || [], food, 'avoidedFoods')}
                                    className={`px-4 py-2 rounded-full border ${data.avoidedFoods?.includes(food) ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={data.avoidedFoods?.includes(food) ? 'text-emerald-700 font-medium' : 'text-gray-600'}>{food}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 10: // Workout Experience
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">Your profile</Text>

                        {/* Tip Box */}
                        <View className="bg-sky-50 p-4 rounded-xl flex-row items-start mt-2 border border-sky-100 mb-6">
                            <Ionicons name="bulb-outline" size={20} color="#0EA5E9" style={{ marginTop: 2, marginRight: 8 }} />
                            <Text className="text-sky-900 flex-1 leading-5">Let's build your training foundation. Your experience level helps us match the right workout intensity for you.</Text>
                        </View>

                        <Text className="text-lg font-bold text-emerald-900 mb-4">What's your workout experience?</Text>

                        <OptionCard
                            label="Beginner"
                            description="I'm new to working out"
                            value="beginner"
                            iconName="navigate"
                            selectedValue={data.workoutExperience}
                            onSelect={(v: any) => updateData('workoutExperience', v)}
                            iconColor="#10B981"
                        />
                        <OptionCard
                            label="Intermediate"
                            description="I have some experience working out"
                            value="intermediate"
                            iconName="rocket"
                            selectedValue={data.workoutExperience}
                            onSelect={(v: any) => updateData('workoutExperience', v)}
                            iconColor="#8B5CF6"
                        />
                        <OptionCard
                            label="Advanced"
                            description="I'm an expert and have years of experience working out"
                            value="advanced"
                            iconName="crown"
                            iconType="MaterialCommunityIcons"
                            selectedValue={data.workoutExperience}
                            onSelect={(v: any) => updateData('workoutExperience', v)}
                            iconColor="#F97316"
                        />
                    </View>
                );

            case 11: // Workout Profile
                const toggleHomeEquipment = (item: string) => {
                    const list = data.homeEquipment || [];
                    if (list.includes(item)) {
                        updateData('homeEquipment', list.filter(i => i !== item));
                    } else {
                        updateData('homeEquipment', [...list, item]);
                    }
                };

                return (
                    <View>
                        {/* Workout Days */}
                        <Text className="text-lg font-bold text-emerald-900 mb-4">How many days can you commit to workout?</Text>
                        <View className="flex-row justify-between mb-8">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    onPress={() => updateData('workoutDays', num)}
                                    className={`w-12 h-12 rounded-2xl items-center justify-center border ${data.workoutDays === num ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-bold text-lg ${data.workoutDays === num ? 'text-white' : 'text-gray-600'}`}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Equipment */}
                        <Text className="text-lg font-bold text-emerald-900 mb-4">Available equipment</Text>
                        <View className="flex-row gap-4 mb-4">
                            <TouchableOpacity
                                onPress={() => updateData('workoutPlace', 'gym')}
                                className={`flex-1 py-3 items-center rounded-xl border ${data.workoutPlace === 'gym' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${data.workoutPlace === 'gym' ? 'text-emerald-700' : 'text-gray-600'}`}>Gym Workout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => updateData('workoutPlace', 'home')}
                                className={`flex-1 py-3 items-center rounded-xl border ${data.workoutPlace === 'home' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold ${data.workoutPlace === 'home' ? 'text-emerald-700' : 'text-gray-600'}`}>Home Workout</Text>
                            </TouchableOpacity>
                        </View>

                        {data.workoutPlace === 'home' ? (
                            <View className="mb-8">
                                <TouchableOpacity onPress={() => toggleHomeEquipment('Dumbbells/Kettlebells')} className={`p-4 rounded-xl border flex-row items-center mb-2 ${data.homeEquipment?.includes('Dumbbells/Kettlebells') ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}>
                                    <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${data.homeEquipment?.includes('Dumbbells/Kettlebells') ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {data.homeEquipment?.includes('Dumbbells/Kettlebells') && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                    <Text className="text-gray-700 font-medium">Dumbbells/Kettlebells</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleHomeEquipment('Resistance Bands')} className={`p-4 rounded-xl border flex-row items-center mb-2 ${data.homeEquipment?.includes('Resistance Bands') ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}>
                                    <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${data.homeEquipment?.includes('Resistance Bands') ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {data.homeEquipment?.includes('Resistance Bands') && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                    <Text className="text-gray-700 font-medium">Resistance Bands</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => toggleHomeEquipment('Bodyweight Only')} className={`p-4 rounded-xl border flex-row items-center ${data.homeEquipment?.includes('Bodyweight Only') ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}>
                                    <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${data.homeEquipment?.includes('Bodyweight Only') ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {data.homeEquipment?.includes('Bodyweight Only') && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                    <Text className="text-gray-700 font-medium">Bodyweight Only</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Generic/Gym View (or keep same as previous if not home)
                            <TouchableOpacity
                                onPress={() => updateData('fullGymAccess', !data.fullGymAccess)}
                                className={`p-4 rounded-xl border flex-row items-center mb-8 ${data.fullGymAccess ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'}`}
                            >
                                <View className={`w-6 h-6 rounded border mr-3 items-center justify-center ${data.fullGymAccess ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                    {data.fullGymAccess && <Ionicons name="checkmark" size={16} color="white" />}
                                </View>
                                <Text className={`font-bold ${data.fullGymAccess ? 'text-emerald-900' : 'text-gray-600'}`}>Full Gym Access</Text>
                            </TouchableOpacity>
                        )}

                        {/* Duration */}
                        <Text className="text-lg font-bold text-emerald-900 mb-2">Workout duration</Text>
                        <Text className="text-2xl font-bold text-emerald-500 mb-4">{data.workoutDuration || 45} min</Text>

                        {/* Duration Slider */}
                        <Text className="text-lg font-bold text-emerald-900 mb-2">Workout duration</Text>
                        <Text className="text-2xl font-bold text-emerald-500 mb-4">{data.workoutDuration || 45} min</Text>

                        <View className="h-12 justify-center mb-1"
                            {...PanResponder.create({
                                onStartShouldSetPanResponder: () => true,
                                onMoveShouldSetPanResponder: () => true,
                                onPanResponderGrant: (evt) => {
                                    const locationX = evt.nativeEvent.locationX;
                                    // Assuming width of slide area is approx width - 48 (padding)
                                    // A safer way is to measure, but for now we estimate track width.
                                    const trackWidth = width - 48;
                                    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
                                    // Range 15 to 120
                                    const minutes = Math.round(15 + percentage * (120 - 15));
                                    updateData('workoutDuration', minutes);
                                },
                                onPanResponderMove: (evt, gestureState) => {
                                    const trackWidth = width - 48; // padding-x-6 = 24*2 = 48
                                    // We need visual offset logic if we want perfect dragging, but tapping/simple drag is okay.
                                    // Since gestureState.moveX is absolute page coords, we need relative.
                                    // A simple fallback is using the initial touch + dx. 
                                    // Let's stick to simple implementation: 
                                    // We can't easily get relative coord on move without measurement.
                                    // So we'll update based on velocity or just `moveX - pageOffset`. 
                                    // Simplified: Just use a set of buttons for robustness if PanResponder is flaky without layout measurement.
                                    // usage:
                                }
                            }).panHandlers}
                        // Using a simpler approach: Layout wrapper to get width, then standard Touch.
                        >
                            {/* Improved Slider Logic: 
                                PanResponder on the wrapper view. 
                                We need to ref the view to measure it, or assume width.
                            */}
                            <View className="h-1 bg-emerald-100 rounded-full w-full relative">
                                <View
                                    className="h-1 bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.max(0, Math.min(100, ((data.workoutDuration || 45) - 15) / (120 - 15) * 100))}%` }}
                                />
                                <View
                                    className="absolute -ml-3 -top-2.5 w-6 h-6 bg-emerald-500 rounded-full shadow-md border-2 border-white"
                                    style={{ left: `${Math.max(0, Math.min(100, ((data.workoutDuration || 45) - 15) / (120 - 15) * 100))}%` }}
                                />
                            </View>
                            {/* Overlay transparent touch target for easier hitting */}
                            <View className="absolute inset-0 z-10" />
                        </View>

                        {/* Alternative: Button Chips for robustness if slider feels finicky without native module */}
                        <View className="flex-row flex-wrap gap-2 mb-2 mt-2">
                            {[15, 30, 45, 60, 90, 120].map(min => (
                                <TouchableOpacity
                                    key={min}
                                    onPress={() => updateData('workoutDuration', min)}
                                    className={`px-3 py-1 rounded-full border ${data.workoutDuration === min ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}
                                >
                                    <Text className={`text-xs font-bold ${data.workoutDuration === min ? 'text-white' : 'text-gray-500'}`}>{min} min</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="flex-row justify-between mb-8">
                            <Text className="text-gray-400 text-xs">15 min</Text>
                            <Text className="text-gray-400 text-xs">2 hr</Text>
                        </View>
                    </View>
                );

            // ... Default Fallback
            default:
                return (
                    <View>
                        <Text className="text-2xl font-bold text-emerald-900 mb-2">Step {currentStep} Details</Text>
                        <TextInput className="p-4 bg-gray-50 rounded-xl mt-4 border border-gray-200" placeholder="Enter Value" />
                    </View>
                );
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-4">
                <Header />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
                    {renderContent()}
                </ScrollView>
                <ContinueButton />
            </View>
        </SafeAreaView>
    );
}
