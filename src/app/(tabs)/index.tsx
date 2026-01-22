import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCaloriv } from '../../contexts/CalorivContext';
import { COLORS } from '../../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
    const { userProfile, dailyLog, goalConfig } = useCaloriv();
    const [refreshing, setRefreshing] = useState(false);
    const [showQuickStart, setShowQuickStart] = useState(false);

    // Mock Data based on screenshots
    const caloriesLeft = 2475;
    const consumed = 0;
    const burned = 0;

    // Quick Start Steps
    const [quickStartProgress, setQuickStartProgress] = useState(0);
    const totalQuickStartSteps = 4;

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const QuickStartModal = () => (
        showQuickStart ? (
            <View className="absolute inset-0 z-50 bg-black/60 justify-center items-center px-6">
                <LinearGradient
                    colors={['#8B5CF6', '#EC4899']} // Purple to Pink gradient as seen in screenshot
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="w-full rounded-3xl p-6"
                >
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="rocket-launch" size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-lg">Quick Start Guide</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowQuickStart(false)}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row mb-6">
                        {[...Array(9)].map((_, i) => (
                            <View key={i} className={`h-1 flex-1 rounded-full mx-0.5 ${i <= 7 ? 'bg-white' : 'bg-white/30'}`} />
                        ))}
                    </View>

                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-2">You've Got This!</Text>
                        <Text className="text-gray-500 mb-4 leading-5">
                            Remember: Progress over perfection.{'\n'}
                            Every meal logged, every workout completed, every small choice adds up to real results.{'\n'}
                            We believe in you – now it's time to believe in yourself.
                        </Text>

                        <View className="bg-purple-50 p-3 rounded-xl flex-row items-center mb-2">
                            <Ionicons name="bulb" size={24} color="#F59E0B" className="mr-3" />
                            <View className="flex-1">
                                <Text className="text-purple-700 font-bold text-xs uppercase mb-1">PRO TIP</Text>
                                <Text className="text-purple-900 text-sm">Revisit this tour anytime from the help menu!</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowQuickStart(false)}
                        className="bg-white/20 p-4 rounded-xl items-center mb-2 border border-white/30"
                    >
                        <Text className="text-white font-bold">Let's Go!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowQuickStart(false)} className="items-center">
                        <Text className="text-white/70 text-sm">Skip tour</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        ) : null
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <QuickStartModal />

            {/* Header */}
            <View className="px-5 py-2 flex-row justify-between items-center bg-white">
                <View className="flex-row items-center">
                    <View className="bg-gray-100 p-2 rounded-full mr-3">
                        <Ionicons name="person" size={20} color="black" />
                    </View>
                    <View>
                        <Text className="text-gray-900 font-bold text-lg">Today, Jan 8</Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <View className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 mr-2">
                        <Ionicons name="flame" size={16} color="#F97316" className="mr-1" />
                        <Text className="text-orange-600 font-bold">0</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="information-circle-outline" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date Strip */}
            <View className="bg-white pb-4 px-4 flex-row justify-between items-center border-b border-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                    const isActive = index === 4; // Mock Logic
                    return (
                        <View key={day} className={`items-center px-3 py-2 rounded-xl ${isActive ? 'bg-emerald-500' : ''}`}>
                            <Text className={`text-xs mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`}>{day}</Text>
                            <Text className={`font-bold ${isActive ? 'text-white' : 'text-gray-900'}`}>{index + 4}</Text>
                        </View>
                    );
                })}
            </View>

            <ScrollView
                className="flex-1 p-5"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Nutrition Goal Card */}
                <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-5 relative overflow-hidden">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Nutrition Goal</Text>
                        <TouchableOpacity>
                            <Ionicons name="pencil" size={18} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    {/* Circular Progress & Mascot */}
                    <View className="items-center justify-center mb-6">
                        <View className="w-48 h-48 rounded-full border-[6px] border-emerald-50 items-center justify-center relative">
                            {/* Mock Progress Arc - In real app use SVG */}
                            <View className="absolute right-0 top-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-lg z-10" />

                            {/* Mascot */}
                            <View className="items-center">
                                {/* Placeholder Mascot */}
                                <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-2 overflow-hidden border-2 border-indigo-50">
                                    <Text className="text-4xl">🫐</Text>
                                </View>
                                <Text className="text-gray-500 text-sm mb-1">Need energy.</Text>
                                <Text className="text-3xl font-bold text-gray-900">{caloriesLeft}</Text>
                                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide">Calories Left</Text>
                            </View>
                        </View>
                    </View>

                    {/* Consumed/Goal Row */}
                    <View className="flex-row justify-center items-center mb-8 border-t border-gray-50 pt-4 mx-4">
                        <Text className="text-gray-400 mr-2">Goal <Text className="font-bold text-gray-900">2475</Text></Text>
                        <View className="h-4 w-[1px] bg-gray-300 mx-2" />
                        <Text className="text-gray-400 ml-2">Consumed <Text className="font-bold text-emerald-500">0</Text></Text>
                    </View>

                    {/* Macro Rows */}
                    <View className="flex-row justify-between">
                        {/* Protein */}
                        <View className="flex-1 mr-2 bg-slate-50 p-3 rounded-2xl items-center">
                            <View className="flex-row items-center mb-2">
                                <Text className="mr-1">🍗</Text>
                                <Text className="text-xs text-slate-500 font-bold">Proteins</Text>
                            </View>
                            <Text className="text-slate-900 font-bold text-lg mb-1">0<Text className="text-gray-400 text-xs">/305g</Text></Text>
                            <View className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <View className="w-0 h-full bg-slate-500" />
                            </View>
                        </View>
                        {/* Carbs */}
                        <View className="flex-1 mx-1 bg-rose-50 p-3 rounded-2xl items-center">
                            <View className="flex-row items-center mb-2">
                                <Text className="mr-1">🍚</Text>
                                <Text className="text-xs text-rose-500 font-bold">Carbs</Text>
                            </View>
                            <Text className="text-rose-900 font-bold text-lg mb-1">0<Text className="text-gray-400 text-xs">/86g</Text></Text>
                            <View className="w-full h-1.5 bg-rose-200 rounded-full overflow-hidden">
                                <View className="w-0 h-full bg-rose-500" />
                            </View>
                        </View>
                        {/* Fat */}
                        <View className="flex-1 ml-2 bg-orange-50 p-3 rounded-2xl items-center">
                            <View className="flex-row items-center mb-2">
                                <Text className="mr-1">🥜</Text>
                                <Text className="text-xs text-orange-500 font-bold">Fat</Text>
                            </View>
                            <Text className="text-orange-900 font-bold text-lg mb-1">0<Text className="text-gray-400 text-xs">/102g</Text></Text>
                            <View className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                                <View className="w-0 h-full bg-orange-500" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Activity Goal Card */}
                <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Activity Goal</Text>
                        <View className="flex-row items-center">
                            <TouchableOpacity className="mr-3"><Ionicons name="pencil" size={16} color="#10B981" /></TouchableOpacity>
                            <Text className="text-cyan-500 font-bold">476 Cal</Text>
                        </View>
                    </View>

                    <View className="h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <View className="h-full bg-cyan-400 w-[1%]" />
                    </View>

                    <View className="flex-row items-center mb-4 pb-4 border-b border-gray-50">
                        <View className="w-10 h-10 rounded-full bg-cyan-50 items-center justify-center mr-3">
                            <MaterialCommunityIcons name="run" size={20} color="#06B6D4" />
                        </View>
                        <Text className="text-gray-500 font-medium">0 Calories Burned</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="shoe-print" size={20} color="#3B82F6" className="mr-3" />
                            <View>
                                <Text className="font-bold text-gray-900">Steps</Text>
                                <Text className="text-gray-400 text-xs">Phone sync</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="font-bold text-gray-900">0</Text>
                            <Text className="text-gray-400 text-xs">0 cal</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="weight-lifter" size={20} color="#F59E0B" className="mr-3" />
                            <View>
                                <Text className="font-bold text-gray-900">Activities</Text>
                                <Text className="text-gray-400 text-xs">Manual logs</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-gray-400 text-xs">0 cal</Text>
                        </View>
                    </View>
                </View>

                {/* Getting Started Widget */}
                <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-5 relative overflow-hidden">
                    <View className="flex-row items-center mb-3">
                        <Text className="text-xl mr-2">🚀</Text>
                        <Text className="font-bold text-teal-900 text-lg">Getting Started</Text>
                    </View>
                    <Text className="text-gray-500 mb-4">{quickStartProgress} of {totalQuickStartSteps} completed</Text>

                    <View className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <View
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${(quickStartProgress / totalQuickStartSteps) * 100}%` }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowQuickStart(true)}
                        className="bg-emerald-50 p-4 rounded-xl border border-emerald-100"
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#10B981" className="mr-2" />
                            <Text className="font-bold text-gray-900">Log Your First Meal</Text>
                        </View>
                        <Text className="text-gray-500 text-xs leading-5 mb-3">
                            See how nutrition adds up to your goal, learn about macros, and watch the mascot react.
                        </Text>
                        <Text className="text-emerald-500 font-bold text-xs uppercase">Get Started {'>'}</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
