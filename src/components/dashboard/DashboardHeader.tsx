import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/designSystem';
import { useRouter } from 'expo-router';

interface DashboardHeaderProps {
    name: string;
    streak: number;
    streakShields: number;
    notificationCount?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    name,
    streak,
    streakShields,
    notificationCount = 0
}) => {
    const router = useRouter();

    return (
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-gray-500 text-sm font-medium">Welcome Back,</Text>
                <Text className="text-2xl font-bold text-secondary">{name} 👋</Text>
            </View>

            <View className="flex-row items-center gap-2">
                {/* Streak Pill */}
                <View className="flex-row items-center bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200">
                    <Text className="text-sm mr-1">🔥</Text>
                    <Text className="text-orange-600 font-bold">{streak}</Text>
                    {streakShields > 0 && (
                        <View className="flex-row items-center ml-2 border-l border-orange-200 pl-2">
                            <Ionicons name="shield-checkmark" size={12} color={COLORS.info} />
                            <Text className="text-blue-600 font-bold text-xs ml-1">{streakShields}</Text>
                        </View>
                    )}
                </View>

                {/* Profile/Notification Icon */}
                <TouchableOpacity
                    className="relative p-2 bg-white rounded-full border border-gray-100 shadow-sm"
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
                    {notificationCount > 0 && (
                        <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};
