
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../theme/designSystem';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface QuickStartGuideProps {
    visible: boolean;
    onClose: () => void;
}

// Reusable Phone Frame Component to match the screenshots
const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.phoneFrame}>
        {/* Dynamic Island / Notch */}
        <View style={styles.dynamicIsland} />
        <View style={styles.phoneInner}>
            {children}
        </View>
    </View>
);

// Slide 1: Transformation Graph
const Slide1Content = () => (
    <View className="flex-1 bg-white items-center p-4 pt-12">
        <View className="bg-green-100 p-4 rounded-full mb-4">
            <Ionicons name="checkmark-circle" size={40} color={COLORS.primary} />
        </View>
        <Text className="text-xl font-bold text-center mb-6" style={{ color: COLORS.secondary }}>You've Got What It Takes</Text>

        {/* Toggle Pills */}
        <View className="flex-row bg-gray-100 p-1 rounded-full mb-8">
            <View className="bg-white rounded-full px-4 py-1 shadow-sm"><Text className="text-emerald-500 font-bold text-xs">7 Days</Text></View>
            <View className="px-4 py-1"><Text className="text-gray-400 text-xs">30 Days</Text></View>
            <View className="px-4 py-1"><Text className="text-gray-400 text-xs">All Time</Text></View>
        </View>

        {/* Graph Line Simulation */}
        <View className="w-full h-40 relative mt-4">
            <View className="absolute left-0 bottom-0 w-full h-[1px] bg-gray-100" />
            <View className="absolute left-0 bottom-10 w-full h-[1px] bg-gray-100 border-dashed" />
            <View className="absolute left-0 bottom-20 w-full h-[1px] bg-gray-100 border-dashed" />

            {/* The Green Line */}
            <View style={{ position: 'absolute', top: 20, left: 20, width: '80%', height: 100 }}>
                <View className="absolute top-0 left-0 w-3 h-3 bg-emerald-500 rounded-full z-10" />
                <View className="absolute top-[40%] left-[30%] w-3 h-3 bg-emerald-500 rounded-full z-10" />
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full z-10" />
                {/* CSS tricks for lines are hard in RN without SVG, using simple layout for mock feel */}
                <View className="absolute top-[20%] left-0 w-[40%] h-[2px] bg-emerald-400 transform rotate-12" />
                <View className="absolute top-[60%] left-[30%] w-[60%] h-[2px] bg-emerald-400 transform rotate-12" />
            </View>
        </View>
        <Text className="text-gray-400 text-[10px] text-center mt-8 px-4">
            Small, consistent choices lead to big changes. We're here to make them easier.
        </Text>
    </View>
);

// Slide 2: Food Logging AI
const Slide2Content = () => (
    <View className="flex-1 bg-white relative">
        <View className="absolute top-0 w-full h-32 bg-emerald-50 rounded-b-[40px]" />
        <View className="mt-12 mx-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Text className="font-bold text-gray-800 mb-2">Meal Analyzer</Text>
            <Text className="text-xs text-gray-500 mb-2">Bacon, Eggs, and Toast</Text>
            <View className="flex-row items-center justify-between mt-2">
                <View className="items-center"><Text className="text-lg">🔥</Text><Text className="text-[10px]">432</Text></View>
                <View className="items-center"><Text className="text-lg">🥩</Text><Text className="text-[10px]">32g</Text></View>
                <View className="items-center"><Text className="text-lg">🍞</Text><Text className="text-[10px]">48g</Text></View>
            </View>
        </View>
        <View className="absolute bottom-10 w-full px-4 items-center">
            <View className="bg-white rounded-full px-6 py-3 shadow-lg flex-row items-center border border-gray-100">
                <Ionicons name="mic" size={20} color={COLORS.text.secondary} />
                <Text className="text-gray-400 text-xs ml-2">Type or speak what you ate</Text>
                <Ionicons name="send" size={16} color={COLORS.primary} style={{ marginLeft: 10 }} />
            </View>
        </View>
    </View>
);

// Slide 3: Plan Customization
const Slide3Content = () => (
    <View className="flex-1 bg-white items-center pt-20">
        <View className="w-[80%] bg-white rounded-2xl shadow-lg border border-gray-100 p-4 absolute top-20 right-[-20] transform rotate-3">
            <Text className="font-bold text-emerald-600 mb-2 text-xs">High-protein chicken burrito bowl 🥗</Text>
            <View className="space-y-1">
                <View className="flex-row justify-between"><Text className="text-[10px] text-gray-500">Grilled Chicken</Text><Text className="text-[10px] font-bold">4oz</Text></View>
                <View className="flex-row justify-between"><Text className="text-[10px] text-gray-500">Brown Rice</Text><Text className="text-[10px] font-bold">3/4 cup</Text></View>
                <View className="flex-row justify-between"><Text className="text-[10px] text-gray-500">Beans</Text><Text className="text-[10px] font-bold">1/4 cup</Text></View>
            </View>
            <View className="flex-row mt-4 space-x-2 justify-center">
                <TouchableOpacity className="bg-red-50 px-3 py-1 rounded-full"><Text className="text-red-500 text-[10px]">Remove</Text></TouchableOpacity>
                <TouchableOpacity className="bg-emerald-500 px-3 py-1 rounded-full"><Text className="text-white text-[10px]">Save</Text></TouchableOpacity>
            </View>
        </View>
    </View>
);

// Slide 4: Personalized Plan
const Slide4Content = () => (
    <View className="flex-1 bg-gray-50 pt-16 px-4">
        <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Daily Nutrition</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-4">2119 Calories</Text>

        <View className="flex-row justify-between mb-6">
            <View className="items-center bg-white p-2 rounded-xl w-[30%] shadow-sm">
                <View className="w-10 h-10 border-4 border-blue-400 rounded-full mb-1" />
                <Text className="text-[10px] font-bold">Protein</Text>
            </View>
            <View className="items-center bg-white p-2 rounded-xl w-[30%] shadow-sm">
                <View className="w-10 h-10 border-4 border-pink-400 rounded-full mb-1" />
                <Text className="text-[10px] font-bold">Carbs</Text>
            </View>
            <View className="items-center bg-white p-2 rounded-xl w-[30%] shadow-sm">
                <View className="w-10 h-10 border-4 border-yellow-400 rounded-full mb-1" />
                <Text className="text-[10px] font-bold">Fat</Text>
            </View>
        </View>

        <View className="bg-white p-3 rounded-xl flex-row items-center shadow-sm">
            <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3">
                <Text>🥣</Text>
            </View>
            <View>
                <Text className="font-bold">Meal 1</Text>
                <Text className="text-xs text-gray-400">3 Meals left</Text>
            </View>
        </View>
    </View>
);


// Slide 5: Workouts
const Slide5Content = () => (
    <View className="flex-1 bg-white items-center justify-center p-4">
        <View className="w-full bg-orange-50 rounded-2xl p-6 items-center shadow-sm">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="barbell" size={32} color="#F97316" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2">Smart Workouts</Text>
            <View className="flex-row items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Text className="text-xs font-bold text-gray-600">Sets</Text>
                <Text className="text-xs text-gray-400">3 x 12</Text>
                <Ionicons name="arrow-forward" size={12} color="#F97316" />
                <Text className="text-xs font-bold text-orange-500">Auto-Adjusted</Text>
            </View>
        </View>
    </View>
);

// Slide 6: Progress
const Slide6Content = () => (
    <View className="flex-1 bg-white items-center justify-center p-4">
        <View className="w-full h-48 bg-blue-50 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <Text className="text-lg font-bold text-blue-900 mb-4">Weight Trend</Text>
            {/* Simple Bar Chart */}
            <View className="flex-row items-end justify-between h-24 px-2">
                <View className="w-4 h-12 bg-blue-200 rounded-t-sm" />
                <View className="w-4 h-16 bg-blue-300 rounded-t-sm" />
                <View className="w-4 h-10 bg-blue-200 rounded-t-sm" />
                <View className="w-4 h-20 bg-blue-400 rounded-t-sm" />
                <View className="w-4 h-14 bg-blue-300 rounded-t-sm" />
                <View className="w-4 h-24 bg-blue-500 rounded-t-sm shadow-lg" />
            </View>
        </View>
    </View>
);

// Slide 7: Body Analysis
const Slide7Content = () => (
    <View className="flex-1 bg-white items-center justify-center p-4">
        <View className="w-40 h-40 rounded-full border-8 border-purple-100 items-center justify-center shadow-sm">
            <View className="w-32 h-32 rounded-full border-8 border-purple-200 items-center justify-center">
                <View className="w-24 h-24 rounded-full bg-purple-500 items-center justify-center shadow-lg">
                    <Text className="text-white font-bold text-2xl">A+</Text>
                    <Text className="text-white text-[10px]">Score</Text>
                </View>
            </View>
        </View>
        <Text className="mt-8 font-bold text-purple-900">Body Symmetry Analysis</Text>
    </View>
);

// Slide 8: Streaks & Habits
const Slide8Content = () => (
    <View className="flex-1 bg-white items-center justify-center p-4">
        <View className="items-center">
            <Ionicons name="flame" size={80} color="#EF4444" />
            <Text className="text-4xl font-bold text-gray-800 mt-4">12</Text>
            <Text className="text-gray-400 text-sm uppercase tracking-widest">Day Streak</Text>
            <View className="flex-row mt-6 space-x-2">
                {[1, 2, 3, 4, 5].map(d => (
                    <View key={d} className={`w-8 h-8 rounded-full items-center justify-center ${d === 5 ? 'bg-red-500' : 'bg-red-100'}`}>
                        <Ionicons name="checkmark" size={16} color={d === 5 ? 'white' : '#EF4444'} />
                    </View>
                ))}
            </View>
        </View>
    </View>
);

// Slide 9: Ready
const Slide9Content = () => (
    <View className="flex-1 bg-emerald-50 items-center justify-center p-4">
        <View className="bg-white p-8 rounded-full shadow-xl mb-6">
            <Ionicons name="rocket" size={60} color={COLORS.primary} />
        </View>
        <Text className="text-2xl font-bold text-emerald-900 text-center">You're All Set!</Text>
        <Text className="text-center text-gray-500 mt-2 px-8">Your personalized plan is ready. Let's make today count.</Text>
    </View>
);

const TOUR_STEPS = [
    {
        title: "Your Transformation Starts Now",
        description: "See Changes in Just 7 Days",
        sub: "Most users notice changes in their body, weight, or energy within the first 7 days simply by following their Calorii plan.",
        component: <Slide1Content />
    },
    {
        title: "Instant Food Logging",
        description: "Snap, Speak, or Type to Log",
        sub: "Not following the meal plan? Snap a photo, speak, or type what you ate—Calorii's AI instantly analyzes your meal.",
        component: <Slide2Content />
    },
    {
        title: "Your Plan, Your Way",
        description: "Eat What You Love",
        sub: "Generate unlimited meal options with recipes for every meal in your plan. Just type the foods you love to eat.",
        component: <Slide3Content />
    },
    {
        title: "Your Personalized Plan",
        description: "Your Plan, Built Just for You",
        sub: "Calorii builds a personalized meal and workout plan tailored to your goals and preferences.",
        component: <Slide4Content />
    },
    {
        title: "Smart Workout Logic",
        description: "Intelligent Training",
        sub: "Workouts adapt to your strength and goals. Sets and reps adjust automatically as you progress.",
        component: <Slide5Content />
    },
    {
        title: "Track Your Progress",
        description: "Visualize Your Success",
        sub: "Watch your weight trend downwards and your consistency go up. Data-driven insights keep you on track.",
        component: <Slide6Content />
    },
    {
        title: "Body Analyzer",
        description: "Understand Your Body",
        sub: "Get deep insights into your body composition and symmetry with our AI-powered analysis tools.",
        component: <Slide7Content />
    },
    {
        title: "Build Healthy Habits",
        description: "Don't Break the Streak",
        sub: "Consistency is key. Earn shields and badges for hitting your daily goals.",
        component: <Slide8Content />
    },
    {
        title: "Ready to Launch?",
        description: "Let's Get Started",
        sub: "Your journey to a better you begins right now. We're with you every step of the way.",
        component: <Slide9Content />
    }
];

export const QuickStartGuide = ({ visible, onClose }: QuickStartGuideProps) => {
    const [stepIndex, setStepIndex] = useState(0);

    const handleNext = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onClose();
        }
    };

    const currentStep = TOUR_STEPS[stepIndex];

    if (!visible) return null;

    return (
        <Modal transparent animationType="slide" visible={visible}>
            <View className="flex-1 bg-white">
                {/* Header Back Button */}
                <View className="pt-12 px-6 pb-2">
                    <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Main Content Area */}
                <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>

                    {/* Title */}
                    <Text className="text-xl font-bold text-emerald-800 mb-8 px-6 text-center">
                        | {currentStep.title}
                    </Text>

                    {/* Phone Mockup Area */}
                    <PhoneMockup>
                        {currentStep.component}
                    </PhoneMockup>

                    {/* Bottom Text Area */}
                    <View className="w-full px-8 mt-8 pb-10">
                        <Text className="text-2xl font-bold text-center text-teal-900 mb-4">
                            {currentStep.description}
                        </Text>
                        <Text className="text-center text-gray-500 mb-8 leading-6">
                            {currentStep.sub}
                        </Text>

                        {/* The Big Green Button */}
                        <TouchableOpacity
                            onPress={handleNext}
                            className="w-full rounded-full py-4 px-6 flex-row items-center justify-between shadow-xl"
                            style={{ backgroundColor: '#00EDA0', shadowColor: '#00EDA0', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { height: 8, width: 0 } }}
                        >
                            <Text className="text-white font-bold text-lg ml-4">
                                {stepIndex === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
                            </Text>
                            <View className="bg-white rounded-full w-10 h-10 items-center justify-center">
                                <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    phoneFrame: {
        width: width * 0.75,
        height: height * 0.5,
        backgroundColor: '#111',
        borderRadius: 45,
        borderWidth: 8,
        borderColor: '#222',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 10,
        overflow: 'hidden'
    },
    phoneInner: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 35,
        overflow: 'hidden'
    },
    dynamicIsland: {
        position: 'absolute',
        top: 15,
        alignSelf: 'center',
        width: 100,
        height: 25,
        backgroundColor: 'black',
        borderRadius: 20,
        zIndex: 100
    }
});

