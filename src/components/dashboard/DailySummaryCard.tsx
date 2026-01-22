import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/designSystem';
import { CircularProgress } from '../ui/CircularProgress';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface DailySummaryCardProps {
    eaten: number;
    burned: number;
    target: number;
    label?: string;
    onPressAdd?: () => void;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
    eaten,
    burned,
    target,
    label = "Calories",
    onPressAdd
}) => {
    const remaining = Math.round(target - eaten + burned);
    const progress = Math.min(eaten / (target || 2000), 1);
    const isSurplus = remaining < 0;

    return (
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xs font-bold text-gray-400 tracking-widest uppercase">Daily Fuel</Text>
                {/* Optional: Add Date or Edit Goal button here */}
            </View>

            <View className="items-center mb-8">
                <CircularProgress
                    size={220}
                    strokeWidth={20}
                    progress={progress}
                    colors={[COLORS.primary, COLORS.primary]}
                >
                    <View className="items-center">
                        <Text className="text-gray-400 text-xs font-medium tracking-widest mb-1 uppercase">
                            {isSurplus ? 'Surplus' : 'Remaining'}
                        </Text>
                        <AnimatedNumber
                            value={Math.abs(remaining)}
                            style={{
                                fontSize: 48,
                                fontWeight: '800',
                                color: isSurplus ? COLORS.warning : COLORS.text.primary,
                                lineHeight: 54
                            }}
                        />
                        <Text className="text-gray-400 text-sm font-medium">kcal</Text>
                    </View>
                </CircularProgress>
            </View>

            <View className="flex-row justify-between items-center px-4 bg-gray-50 rounded-2xl py-4">
                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Eaten</Text>
                    <AnimatedNumber value={Math.round(eaten)} style={{ fontSize: 18, fontWeight: '700', color: COLORS.text.primary }} />
                </View>
                <View className="w-px h-8 bg-gray-200" />
                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Burned</Text>
                    <AnimatedNumber value={Math.round(burned)} style={{ fontSize: 18, fontWeight: '700', color: COLORS.primary }} />
                </View>
                <View className="w-px h-8 bg-gray-200" />
                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Target</Text>
                    <Text className="text-lg font-bold text-gray-800">{Math.round(target)}</Text>
                </View>
            </View>

            {onPressAdd && (
                <TouchableOpacity
                    onPress={onPressAdd}
                    className="absolute -bottom-5 left-1/2 -ml-8 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg shadow-green-200 border-4 border-white"
                >
                    <Ionicons name="add" size={32} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};
