import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/designSystem';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface QuickStatsRowProps {
    steps: number;
    stepGoal: number;
    water: number;
    waterGoal: number;
    onPressSteps?: () => void;
    onPressWater?: () => void;
}

export const QuickStatsRow: React.FC<QuickStatsRowProps> = ({
    steps,
    stepGoal,
    water,
    waterGoal,
    onPressSteps,
    onPressWater
}) => {
    return (
        <View className="flex-row gap-4 mb-6 mt-6">
            {/* Steps Card */}
            <TouchableOpacity
                onPress={onPressSteps}
                className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
                <View className="flex-row justify-between items-start mb-2">
                    <View className="bg-orange-50 p-2 rounded-xl">
                        <Ionicons name="footsteps" size={20} color={COLORS.warning} />
                    </View>
                </View>
                <AnimatedNumber value={steps} style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary }} />
                <Text className="text-gray-400 text-xs mt-1">
                    / {stepGoal > 1000 ? `${(stepGoal / 1000).toFixed(1)}k` : stepGoal} Steps
                </Text>

                {/* Mini Progress Bar */}
                <View className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                    <View
                        className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${Math.min((steps / stepGoal) * 100, 100)}%` }}
                    />
                </View>
            </TouchableOpacity>

            {/* Water Card */}
            <TouchableOpacity
                onPress={onPressWater}
                className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
                <View className="flex-row justify-between items-start mb-2">
                    <View className="bg-blue-50 p-2 rounded-xl">
                        <Ionicons name="water" size={20} color={COLORS.info} />
                    </View>
                </View>
                <AnimatedNumber value={water} style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary }} />
                <Text className="text-gray-400 text-xs mt-1">
                    / {waterGoal / 1000}L Water
                </Text>

                {/* Mini Progress Bar */}
                <View className="h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
                    <View
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${Math.min((water / waterGoal) * 100, 100)}%` }}
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};
