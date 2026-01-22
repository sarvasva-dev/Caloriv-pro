import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, SPACING } from '../theme/designSystem'; // Reusing design tokens
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PersonalizedPlanScreen = () => {
    const router = useRouter();

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
                            Your Personalized Plan
                        </Text>
                    </View>
                </View>

                {/* Mockup Section */}
                <View className="items-center justify-center py-6">
                    <Image
                        source={require('../../assets/personalized-plan-mockup.png')}
                        style={{ width: width * 0.9, height: width * 1.0 }}
                        resizeMode="contain"
                    />
                </View>

                {/* Bottom Text Section */}
                <View className="px-6 mt-4">
                    <Text className="text-xl font-bold text-secondary text-center mb-4">
                        Your Plan, Built Just for You
                    </Text>
                    <Text className="text-base text-gray-500 text-center leading-6">
                        Calorii builds a personalized meal and workout plan tailored to your goals and preferences. Update your plan anytime to adjust to your lifestyle.
                    </Text>
                </View>

            </ScrollView>

            {/* Floating Bottom Button */}
            <View className="absolute bottom-8 left-0 right-0 px-6">
                <TouchableOpacity
                    onPress={() => router.push('/flexible-plan')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.primary]} // Flat primary color based on feedback
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

export default PersonalizedPlanScreen;
