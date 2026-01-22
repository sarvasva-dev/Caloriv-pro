import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCaloriv } from '../../contexts/CalorivContext';
import { COLORS } from '../../theme/designSystem';
import { BlurView } from 'expo-blur';

export default function FoodScreen() {
    const { dailyLog, addFood } = useCaloriv();
    const [showActions, setShowActions] = useState(false);
    const [inputText, setInputText] = useState('');
    const [viewMode, setViewMode] = useState<'log' | 'plan'>('log');

    // --- Components ---

    const QuickActionCard = ({ color, icon, title, subtitle, onPress, large }: any) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className={`${large ? 'w-[48%] h-40' : 'w-[30%] h-24'} rounded-3xl p-4 justify-between mb-4 overflow-hidden shadow-sm`}
            style={{ backgroundColor: color }}
        >
            <View className={`w-10 h-10 rounded-full bg-white/20 items-center justify-center`}>
                <Ionicons name={icon} size={24} color="#FFF" />
            </View>
            <View>
                <Text className="text-white font-bold text-lg leading-6">{title}</Text>
                {subtitle && <Text className="text-white/80 text-xs mt-1">{subtitle}</Text>}
            </View>
        </TouchableOpacity>
    );

    const GridItem = ({ label, icon, color, onPress }: any) => (
        <TouchableOpacity onPress={onPress} className="w-[32%] items-center mb-6">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: color + '20' }}>
                <MaterialCommunityIcons name={icon} size={28} color={color} />
            </View>
            <Text className="text-xs font-medium text-gray-700 text-center">{label}</Text>
        </TouchableOpacity>
    );

    const HeaderToggle = ({ activeTab, onTabChange }: any) => (
        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6 mx-5 mt-2">
            <TouchableOpacity
                onPress={() => onTabChange('log')}
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'log' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'log' ? 'text-gray-900' : 'text-gray-500'}`}>Food Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => onTabChange('plan')}
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'plan' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'plan' ? 'text-gray-900' : 'text-gray-500'}`}>Meal Plan</Text>
            </TouchableOpacity>
        </View>
    );

    const [tipsVisible, setTipsVisible] = useState(false);

    const MealTipsModal = () => {
        const [page, setPage] = useState(0);

        if (!tipsVisible) return null;

        return (
            <Modal
                visible={tipsVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setTipsVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white rounded-3xl p-6 shadow-xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-teal-900">Meal Plan Tips</Text>
                            <TouchableOpacity onPress={() => setTipsVisible(false)} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={20} color="gray" />
                            </TouchableOpacity>
                        </View>

                        <View className="min-h-[160px] justify-center">
                            <Text className="font-bold text-gray-900 mb-3 text-lg">{pages[page].title}</Text>
                            <Text className="text-gray-500 leading-6 text-base">{pages[page].content}</Text>
                        </View>

                        <View className="flex-row justify-between items-center mt-6">
                            <View className="flex-row">
                                {pages.map((_, i) => (
                                    <View key={i} className={`w-2 h-2 rounded-full mx-1 ${i === page ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    if (page < pages.length - 1) setPage(page + 1);
                                    else setTipsVisible(false);
                                }}
                            >
                                <Text className="text-emerald-500 font-bold text-lg">{page < pages.length - 1 ? 'Next' : 'Got it!'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };



    // Define pages for Tips outside or inside (moving array inside component for cleanliness if needed, or keeping it)
    const pages = [
        { title: "Meals Matter 🍎", content: "Nutrition drives progress. We balance macros to support your goals, so you don't have to stress about planning." },
        { title: "Prep Ahead 🍱", content: "Save time and stay consistent by prepping meals for a few days. Store in airtight containers for freshness." },
        { title: "Flavor Smart 🌶️", content: "Add flavor without guilt—use low-calorie dressings, seasonings, and fresh herbs to keep meals tasty." },
        { title: "Stay Hydrated 💧", content: "Drink plenty of water throughout the day to stay energized, support digestion, and manage hunger." },
        { title: "Generate Alternates 🔄", content: "Don't like a meal? Use our AI generator to swap it for something else that fits your macros instantly." },
        { title: "Measure Portions ⚖️", content: "Use a food scale for accurate portions based on our recommendations to ensure you hit your goals." }
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="flex-1">
                {/* Header / Chat Area */}
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <HeaderToggle activeTab={viewMode} onTabChange={setViewMode} />

                    {viewMode === 'log' ? (
                        // ... Log Content ...
                        <View className="px-5">
                            {/* AI Greeting Bubble */}
                            <View className="flex-row items-end mb-6">
                                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3 border-2 border-white shadow-sm">
                                    <MaterialCommunityIcons name="robot-happy" size={24} color="#10B981" />
                                </View>
                                <View className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex-1">
                                    <Text className="text-gray-800 text-base leading-6">
                                        Hi, I'm <Text className="font-bold text-emerald-600">Calorii AI</Text>! 👋{'\n'}
                                        What did you eat today? You can snap a photo, speak, or type it out.
                                    </Text>
                                </View>
                            </View>

                            {/* Today's Stats Summary (Mini) */}
                            <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                                <Text className="font-bold text-gray-900 mb-4">Today's Fuel</Text>
                                <View className="flex-row justify-between">
                                    <View>
                                        <Text className="text-2xl font-bold text-emerald-600">{dailyLog?.calories_eaten || 0}</Text>
                                        <Text className="text-gray-400 text-xs">Eaten</Text>
                                    </View>
                                    <View>
                                        <Text className="text-2xl font-bold text-orange-500">{dailyLog?.calories_burned || 0}</Text>
                                        <Text className="text-gray-400 text-xs">Burned</Text>
                                    </View>
                                    <View>
                                        <Text className="text-2xl font-bold text-blue-500">{2000 - (dailyLog?.calories_eaten || 0)}</Text>
                                        <Text className="text-gray-400 text-xs">Left</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Recent/Logged Meals Placeholder */}
                            <Text className="font-bold text-gray-900 mb-3 text-lg">Your Meals</Text>
                            {[1, 2].map((i) => (
                                <View key={i} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center border border-gray-100 shadow-sm">
                                    <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-4">
                                        <Text className="text-xl">🍳</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-800">Breakfast (Demo)</Text>
                                        <Text className="text-gray-500 text-xs">350 kcal • 20g Protein</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="px-5">
                            <MealTipsModal />
                            {/* Meal Plan Dashboard */}
                            <TouchableOpacity
                                onPress={() => setTipsVisible(true)}
                                activeOpacity={0.9}
                                className="bg-emerald-50 p-6 rounded-3xl mb-4 border border-emerald-100"
                            >
                                <View className="flex-row items-center mb-3">
                                    <MaterialCommunityIcons name="silverware-clean" size={24} color="#10B981" className="mr-3" />
                                    <Text className="font-bold text-teal-900 text-lg">Welcome to Meal Planning</Text>
                                </View>
                                <Text className="text-gray-600 leading-5 mb-0">
                                    Planning meals in advance takes the guesswork out. Tap here for tips to get started!
                                </Text>
                            </TouchableOpacity>

                            <View className="bg-emerald-500 p-8 rounded-3xl mb-6 items-center shadow-lg shadow-emerald-200">
                                <View className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
                                    <MaterialCommunityIcons name="bowl-mix" size={40} color="white" />
                                </View>
                                <Text className="text-white text-center font-medium leading-6 mb-6">
                                    Fully tailored to your goals, dietary preferences, and lifestyle
                                </Text>
                                <TouchableOpacity className="bg-white px-8 py-3 rounded-full flex-row items-center shadow-sm">
                                    <MaterialCommunityIcons name="auto-fix" size={20} color="#0d9488" className="mr-2" />
                                    <Text className="text-emerald-700 font-bold">See My MealPlan</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center mb-6">
                                <View className="h-[1px] bg-gray-200 flex-1" />
                                <Text className="mx-4 text-gray-400 text-xs uppercase">or</Text>
                                <View className="h-[1px] bg-gray-200 flex-1" />
                            </View>

                            <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm items-center">
                                <View className="flex-row items-center mb-3">
                                    <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#374151" className="mr-2" />
                                    <Text className="font-bold text-gray-900 text-lg">Meal Library</Text>
                                </View>
                                <Text className="text-center text-gray-500 mb-6">Create custom meals and browse saved meals</Text>
                                <TouchableOpacity className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl flex-row items-center">
                                    <MaterialCommunityIcons name="bookmark" size={20} color="#374151" className="mr-2" />
                                    <Text className="text-gray-700 font-bold">Browse Saved Meals</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>

                {/* Sticky Logging Bar */}
                <View className="absolute bottom-0 left-0 right-0 p-4 bg-transparent">
                    <BlurView intensity={80} tint="light" className="absolute inset-0" />
                    <View className="flex-row items-center bg-white rounded-full p-2 px-4 border border-gray-200 shadow-lg">
                        <TouchableOpacity onPress={() => setShowActions(true)} className="mr-3">
                            <Ionicons name="camera" size={24} color="#10B981" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowActions(true)} className="mr-3">
                            <Ionicons name="mic" size={24} color="#10B981" />
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Type '2 eggs and toast'..."
                            className="flex-1 h-10 text-gray-800 text-base"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={() => {
                                if (inputText.trim().length > 0) {
                                    // Mock AI parsing for demo
                                    const calories = Math.floor(Math.random() * 400) + 100; // Random 100-500
                                    addFood(calories, 10, 20, 5, inputText);
                                    setInputText('');
                                }
                            }}
                        />
                        <TouchableOpacity
                            className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center shadow-md shadow-emerald-200"
                            onPress={() => {
                                if (inputText.trim().length > 0) {
                                    // Mock AI parsing for demo: Randomly assign macros/calories if simple text
                                    // In production this would hit an NLP endpoint
                                    const calories = Math.floor(Math.random() * 300) + 150;
                                    addFood(calories, 15, 25, 8, inputText);
                                    setInputText('');
                                }
                            }}
                        >
                            <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Quick Action Modal */}
            <Modal
                visible={showActions}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowActions(false)}
            >
                <View className="flex-1 justify-end">
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/40"
                        activeOpacity={1}
                        onPress={() => setShowActions(false)}
                    />
                    <View className="bg-white rounded-t-3xl p-6 min-h-[500px]">
                        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

                        <View className="flex-row justify-between mb-6">
                            <QuickActionCard
                                title="Voice/Text Log"
                                subtitle="Speak or type"
                                icon="mic"
                                color="#8B5CF6"
                                large
                                onPress={() => { }}
                            />
                            <QuickActionCard
                                title="Scan Food"
                                subtitle="Snap a meal"
                                icon="camera"
                                color="#10B981"
                                large
                                onPress={() => { }}
                            />
                        </View>

                        <View className="flex-row flex-wrap justify-between">
                            <GridItem label="Food Database" icon="food-apple" color="#10B981" onPress={() => { }} />
                            <GridItem label="My Meals" icon="bookmark" color="#10B981" onPress={() => { }} />
                            <GridItem label="Log Activity" icon="dumbbell" color="#3B82F6" onPress={() => { }} />
                            <GridItem label="Start Workout" icon="play-circle" color="#3B82F6" onPress={() => { }} />
                            <GridItem label="Body Analyzer" icon="chart-donut" color="#8B5CF6" onPress={() => { }} />
                            <GridItem label="Meal Generator" icon="creation" color="#8B5CF6" onPress={() => { }} />
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowActions(false)}
                            className="bg-gray-100 rounded-full h-14 items-center justify-center mt-4"
                        >
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
