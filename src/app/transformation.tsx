import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, RADIUS, SPACING } from '../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TransformationScreen = () => {
    const router = useRouter();
    const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | 'all'>('7d');

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center px-4 pt-12 pb-4 bg-background">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                    style={SHADOWS.soft}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Title Section */}
                <View className="px-6 mb-6">
                    <View className="flex-row items-center space-x-2">
                        <View className="w-1 h-8 bg-primary rounded-full" />
                        <Text className="text-2xl font-bold text-secondary tracking-tight">
                            Your Transformation Starts Now
                        </Text>
                    </View>
                </View>

                {/* Phone Mockup Section */}
                <View className="items-center justify-center py-6">
                    <Image
                        source={require('../../assets/transformation-mockup.png')}
                        style={{ width: width * 0.8, height: width * 1.2 }}
                        resizeMode="contain"
                    />
                    {/* Overlay Toggle for interactivity */}
                    <View className="absolute top-[40%] flex-row bg-white rounded-full p-1 border border-gray-100 w-64 shadow-sm">
                        {['7 Days', '30 Days', 'All Time'].map((label, index) => {
                            const key = index === 0 ? '7d' : index === 1 ? '30d' : 'all';
                            const isActive = selectedRange === key;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setSelectedRange(key as any)}
                                    className={`flex-1 py-1.5 items-center justify-center rounded-full ${isActive ? 'border border-green-500/20 bg-green-50/50' : ''}`}
                                >
                                    <Text className={`text-[10px] font-bold ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Bottom Text Section */}
                <View className="px-6 mt-8">
                    <Text className="text-xl font-bold text-secondary text-center mb-4">
                        See Changes in Just 7 Days
                    </Text>
                    <Text className="text-base text-gray-500 text-center leading-6">
                        Most users notice changes in their body, weight, or energy within the first 7 days simply by following their Calorii plan.
                    </Text>
                </View>

            </ScrollView>

            {/* Floating Bottom Button */}
            <View className="absolute bottom-8 left-0 right-0 px-6">
                <TouchableOpacity
                    onPress={() => router.push('/personalized-plan')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="flex-row items-center justify-between px-6 py-4 rounded-full shadow-lg"
                    >
                        <Text className="text-white text-lg font-bold ml-2">Next</Text>
                        <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TransformationScreen;
