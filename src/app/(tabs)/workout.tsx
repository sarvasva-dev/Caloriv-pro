import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCaloriv } from '../../contexts/CalorivContext';
import { COLORS } from '../../theme/designSystem';

// --- Mock Data ---
import { EXERCISE_GIFS, getWorkoutsByDay, ROUTINE_PRESETS, Weekday } from '../../data/workouts';
import { useOnboarding } from '../../contexts/OnboardingContext';

const DAYS: Weekday[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutScreen() {
    const { userProfile, dailyLog, toggleWorkout } = useCaloriv();
    // Mode: 'dashboard' | 'preview' | 'active' | 'completed'
    const [viewMode, setViewMode] = useState<'dashboard' | 'preview' | 'active' | 'completed'>('dashboard');
    const [activeDay, setActiveDay] = useState<any>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [workoutTimer, setWorkoutTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [hasProgram, setHasProgram] = useState(false); // Default to false to show Welcome Flow
    const [showGenerating, setShowGenerating] = useState(false);
    const [showTips, setShowTips] = useState(false);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setWorkoutTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- Sub-Components ---

    const WelcomeView = ({ onStart }: { onStart: () => void }) => (
        <View className="flex-1 bg-gray-50 p-6">
            <View className="bg-emerald-50 p-6 rounded-3xl mb-6 items-center">
                <Text className="text-5xl mb-4">🏋️‍♂️</Text>
                <Text className="font-bold text-teal-900 text-2xl mb-2 text-center">Welcome to Your Workouts</Text>
                <Text className="text-gray-600 text-center leading-6 text-base px-4">
                    Following a structured program designed for you helps you stay consistent and reach your fitness goals faster.
                </Text>
            </View>

            <View className="flex-1 justify-end mb-10">
                <LinearGradient
                    colors={["#06b6d4", "#10B981"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-8 rounded-3xl items-center justify-center shadow-lg shadow-cyan-100"
                >
                    <View className="bg-white/20 p-5 rounded-2xl mb-6 backdrop-blur-sm">
                        <MaterialCommunityIcons name="arm-flex" size={64} color="white" />
                    </View>
                    <Text className="text-white text-center font-bold text-xl mb-8 leading-7">
                        Fully tailored to your body and goals, experience level, and available equipment
                    </Text>
                    <TouchableOpacity
                        onPress={onStart}
                        className="bg-white w-full py-4 rounded-full flex-row items-center justify-center shadow-sm"
                    >
                        <MaterialCommunityIcons name="auto-fix" size={24} color="#0d9488" className="mr-2" />
                        <Text className="text-teal-700 font-bold text-lg">See My Program</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );

    const GeneratingView = ({ onFinish }: { onFinish: () => void }) => {
        useEffect(() => {
            const timer = setTimeout(() => {
                onFinish();
            }, 3000);
            return () => clearTimeout(timer);
        }, []);

        return (
            <View className="flex-1 bg-black/50 absolute inset-0 justify-center items-center z-50">
                <View className="bg-white p-8 rounded-3xl items-center w-[85%] shadow-2xl">
                    <Text className="font-bold text-teal-900 text-xl mb-8">Generating Your Workout Plan</Text>

                    <View className="w-32 h-32 items-center justify-center mb-8">
                        <View className="absolute w-full h-full border-4 border-emerald-100 rounded-full" />
                        <View className="absolute w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent opacity-80" style={{ transform: [{ rotate: '45deg' }] }} />
                        <MaterialCommunityIcons name="dumbbell" size={48} color="#10B981" />
                    </View>

                    <Text className="text-emerald-600 font-bold mb-6 text-lg animate-pulse">Designing your workout split...</Text>

                    <TouchableOpacity onPress={onFinish}>
                        <Text className="text-red-400 font-medium">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const WorkoutTipsModal = () => {
        const [page, setPage] = useState(0);
        const pages = [
            { title: "Warm Up & Cool Down 🧘", content: "Warm up, stretch before workouts, and cool down after to prep muscles, reduce injury risk, and aid recovery." },
            { title: "Progressive Overload 📈", content: "Increase workout difficulty by adding reps, weight, or reducing rest. Start easy, then build up." },
            { title: "Focus on Form 🎯", content: "Proper form is key. Quality reps matter more than quantity. Control movements, especially when lowering." },
            { title: "Hydrate 💧", content: "Aim for 8+ cups of water daily, especially on workout days. Hydration fuels performance and recovery." },
            { title: "Listen to Your Body 👂", content: "Soreness is normal; sharp pain isn't. Discomfort is part of growth, but injury is not. Rest when needed." },
            { title: "Rest & Recover 😴", content: "Muscles grow with rest, not just training. Aim for 7-8 hours of sleep to maximize your results." }
        ];

        return (
            <Modal
                visible={showTips}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTips(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white rounded-3xl p-6 shadow-xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-teal-900">Workout Tips</Text>
                            <TouchableOpacity onPress={() => setShowTips(false)} className="bg-gray-100 p-2 rounded-full">
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
                                    else setShowTips(false);
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

    // --- Dynamic Workout Logic (Deep Copy) ---
    const todayIndex = new Date().getDay();
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

    // Map Onboarding/Profile Goals to Routine Presets
    const GOAL_TO_PRESET_MAP: Record<string, string> = {
        'loss': 'toning_shred',
        'gain': 'muscle_gain',
        'lean': 'toning_shred',
        'maintain': 'strength_builder',
        'recomp': 'strength_builder',
        // Legacy keys mapping
        'weight_loss': 'toning_shred',
        'muscle_gain': 'muscle_gain',
        'flexibility': 'flexibility_flow',
        'fast_loss': 'toning_shred'
    };

    const smartExercises = React.useMemo(() => {
        const selectedDay = DAYS[selectedDayIndex];
        const defaultExercises = getWorkoutsByDay(selectedDay);

        // 1. Determine Base Schedule
        let baseList = defaultExercises;

        // Try to load a Preset based on User Goal
        // Assumption: userProfile.goal uses format 'loss', 'gain' etc from onboarding
        const goalKey = userProfile?.goal || 'loss';
        const presetId = GOAL_TO_PRESET_MAP[goalKey] || GOAL_TO_PRESET_MAP['loss'];
        const preset = ROUTINE_PRESETS.find(p => p.id === presetId);

        if (preset) {
            // Adjust for Sunday=0 vs Presets using 1-6
            // Our data file uses 0 for Sunday, 1-6 Mon-Sat.
            // selectedDayIndex is 0-6 (Sun-Sat). Perfect match.
            const dailyWorkout = preset.schedule[selectedDayIndex];

            if (dailyWorkout && dailyWorkout.exercises) {
                baseList = dailyWorkout.exercises.map((ex, i) => ({
                    id: `preset-${selectedDayIndex}-${i}`,
                    name: ex.name,
                    targetArea: dailyWorkout.type,
                    gif: EXERCISE_GIFS[ex.name] || '',
                    sets: ex.sets,
                    day: DAYS[selectedDayIndex],
                    finisher: dailyWorkout.finisher,
                    tip: 'Preset Routine'
                }));
            }
        }

        // Apply Smart Logic and Adapters
        if (baseList.length > 0) {
            baseList = baseList.map(ex => {
                let newSets = ex.sets;
                let newTip = ex.tip || '';

                // Goal Normalization for Logic
                const goalNormalized = (userProfile?.goal || 'loss').toLowerCase();

                // Logic 1: Goal Adjustments
                if (goalNormalized.includes('loss') || goalNormalized.includes('shred')) {
                    if (ex.sets.includes('5 × 5')) newSets = '4 × 15–20';
                    else if (ex.sets.includes('8–12')) newSets = '3 × 15–20';
                    else newSets = '4 × 15 (High Tempo)';
                    newTip += ' Keep moving!';
                } else if (goalNormalized.includes('muscle') || goalNormalized.includes('gain')) {
                    if (ex.sets.includes('15') || ex.sets.includes('20')) newSets = '4 × 8–12';
                    else newSets = '3 × 8–12 (Control)';
                } else if (goalNormalized.includes('strength')) {
                    newSets = '5 × 5 (Heavy)';
                    newTip = 'Focus on explosive power.';
                }

                // Logic 2: Experience Level Adjustments
                const level = (userProfile?.activityLevel || 'beginner').toLowerCase();
                // Note: userProfile might use 'sedentary' etc. Creating approximate map if needed or assume userProfile has 'experience' field.
                // Assuming we use 'workoutExperience' from onboarding if available, or fallback.
                // Since userProfile type might be limited, we'll check fields loosely.

                // Fallback Logic: If activityLevel is low, assume beginner volume
                if (level.includes('sedentary') || level.includes('beginner')) {
                    if (newSets.includes('4 ×')) newSets = newSets.replace('4 ×', '3 ×');
                    if (newSets.includes('15–20')) newSets = newSets.replace('15–20', '12');
                }

                return { ...ex, sets: newSets, tip: newTip.trim() };
            });
        }

        return baseList;
    }, [selectedDayIndex, userProfile]);

    const activeProgramName = React.useMemo(() => {
        const goalKey = userProfile?.goal || 'loss';
        const presetId = GOAL_TO_PRESET_MAP[goalKey] || 'toning_shred';
        return ROUTINE_PRESETS.find(p => p.id === presetId)?.name || 'Custom Plan';
    }, [userProfile]);

    const activeDayName = smartExercises.length > 0 ? smartExercises[0].targetArea : 'Rest Day';

    const DashboardView = () => (
        <ScrollView className="flex-1 p-5 pt-2">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-2xl font-bold text-gray-900">Workouts</Text>
                    <Text className="text-gray-500">Your Training Plan</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity className="mr-2"><Ionicons name="stats-chart" size={24} color="#10B981" /></TouchableOpacity>
                    <TouchableOpacity><Ionicons name="information-circle-outline" size={24} color="#6B7280" /></TouchableOpacity>
                </View>
            </View>

            {/* Date Strip */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                {DAYS.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const isToday = idx === todayIndex;
                    return (
                        <TouchableOpacity
                            key={day}
                            onPress={() => setSelectedDayIndex(idx)}
                            className={`mr-3 px-4 py-3 rounded-2xl items-center border ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-100'}`}
                        >
                            <Text className={`font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{day.slice(0, 3)}</Text>
                            {isToday && <View className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Text className="font-bold text-lg text-gray-900 mb-4 flex-row items-center">
                <Ionicons name="person-outline" size={18} /> Today's Program
            </Text>

            {/* Program Card */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-100">
                <View className="flex-row items-start mb-3">
                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons name="star" size={20} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-lg text-gray-900">{activeProgramName}</Text>
                        <Text className="text-gray-500">{activeDayName} • {smartExercises.length} Exercises</Text>
                    </View>
                </View>

                {smartExercises.length > 0 ? (
                    <View>
                        <Text className="text-gray-600 mb-6 leading-5">
                            {smartExercises[0].tip || "Complete all exercises with good form."}
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                setActiveDay({ name: activeDayName, exercises: smartExercises });
                                setViewMode('preview');
                            }}
                            className="bg-blue-50 py-3 rounded-xl flex-row justify-center items-center border border-blue-100"
                        >
                            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" className="mr-2" />
                            <Text className="text-blue-600 font-bold ml-2">Start {DAYS[selectedDayIndex]} Workout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="items-center py-4">
                        <Ionicons name="cafe-outline" size={48} color="#9CA3AF" />
                        <Text className="text-gray-400 mt-2">Rest Day</Text>
                        <Text className="text-gray-400 text-xs text-center w-48 mt-1">Take time to recover and hydrate.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );

    const PreviewView = () => (
        <View className="flex-1">
            <View className="flex-row items-center p-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => setViewMode('dashboard')} className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full">
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="flex-1 text-center font-bold text-lg text-gray-900">Workout Preview</Text>
                <TouchableOpacity><Ionicons name="add" size={24} color="#10B981" /></TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-xl font-bold text-teal-800">{activeDay?.name}</Text>
                    <Text className="text-gray-500 mt-1">{activeDay?.exercises.length} exercises</Text>
                </View>

                <Text className="font-bold text-gray-900 mb-3 ml-1">Exercises</Text>

                {activeDay?.exercises.map((ex: any, idx: number) => (
                    <View key={ex.id} className="flex-row items-center bg-white p-3 rounded-xl mb-3 shadow-sm border border-gray-100">
                        <MaterialCommunityIcons name="drag-vertical" size={24} color="#D1D5DB" />
                        <View className="w-12 h-16 bg-gray-100 rounded-lg mx-3" />
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800">{ex.name}</Text>
                            <Text className="text-gray-500 text-xs">{ex.sets} sets × {ex.reps} reps</Text>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="close" size={20} color="#EF4444" opacity={0.5} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity className="bg-gray-50 p-4 rounded-xl flex-row items-center justify-center border border-dashed border-gray-300 mb-8">
                    <Ionicons name="add" size={20} color="gray" />
                    <Text className="ml-2 text-gray-500 font-medium">Add Exercise</Text>
                </TouchableOpacity>
            </ScrollView>

            <View className="p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => {
                        setIsTimerRunning(true);
                        setViewMode('active');
                    }}
                    className="bg-emerald-500 h-14 rounded-full flex-row items-center justify-center shadow-lg shadow-emerald-200"
                >
                    <Text className="text-white font-bold text-lg mr-2">Start Workout</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const ActiveView = () => {
        const exercise = activeDay?.exercises[currentExerciseIndex];

        return (
            <View className="flex-1">
                {/* Active Header */}
                <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
                    <TouchableOpacity onPress={() => setViewMode('preview')}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-2xl font-bold text-emerald-600 font-mono">{formatTime(workoutTimer)}</Text>
                        <Text className="text-xs text-gray-400 uppercase tracking-widest">Workout Time</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsTimerRunning(!isTimerRunning)}>
                        <Ionicons name={isTimerRunning ? "pause-circle" : "play-circle"} size={32} color={isTimerRunning ? "#EF4444" : "#10B981"} />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="px-5 py-3 bg-white">
                    <Text className="text-gray-900 font-bold mb-2">Exercise {currentExerciseIndex + 1} of {activeDay?.exercises.length}</Text>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden flex-row">
                        <View
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${((currentExerciseIndex + 1) / activeDay?.exercises.length) * 100}%` }}
                        />
                    </View>
                </View>

                <ScrollView className="flex-1 bg-gray-50">
                    <Text className="text-xl font-bold text-teal-900 px-5 mt-4 mb-3">{exercise.name}</Text>

                    {/* Visual Placeholder */}
                    <View className="mx-5 bg-white rounded-3xl h-56 items-center justify-center shadow-sm border border-gray-100 mb-4 overflow-hidden relative">
                        {exercise.gif ? (
                            <Image source={{ uri: exercise.gif }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <MaterialCommunityIcons name="dumbbell" size={64} color="#E5E7EB" />
                        )}
                        <View className="absolute bottom-0 w-full bg-black/50 p-2">
                            <Text className="text-white text-center font-bold text-xs">{exercise.tip || 'Control the movement'}</Text>
                        </View>
                    </View>

                    {/* Metadata Row */}
                    <View className="flex-row px-5 justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="bg-indigo-100 px-3 py-1 rounded-md mr-3">
                                <Text className="text-indigo-600 font-bold text-xs">{exercise.muscle}</Text>
                            </View>
                            <Text className="font-bold text-lg">{exercise.sets} × {exercise.reps}</Text>
                        </View>
                        <View className="flex-row">
                            <TouchableOpacity className="flex-row items-center border border-emerald-500 rounded-full px-3 py-1 mr-2">
                                <Ionicons name="sync" size={14} color="#10B981" />
                                <Text className="text-emerald-500 font-bold text-xs ml-1">Swap</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-row items-center border border-emerald-500 rounded-full px-3 py-1">
                                <Ionicons name="information-circle-outline" size={14} color="#10B981" />
                                <Text className="text-emerald-500 font-bold text-xs ml-1">Info</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sets Table */}
                    <View className="mx-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
                        <View className="flex-row mb-3 pb-2 border-b border-gray-100">
                            <Text className="w-8 text-center font-bold text-gray-400">Set</Text>
                            <Text className="flex-1 text-center font-bold text-gray-400">Previous</Text>
                            <Text className="flex-1 text-center font-bold text-gray-400">Reps</Text>
                            <Text className="flex-1 text-center font-bold text-gray-400">kg</Text>
                            <Text className="w-8 text-center font-bold text-gray-400">✔</Text>
                        </View>

                        {[1, 2, 3].map((set) => (
                            <View key={set} className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center">
                                    <Text className="font-bold text-gray-600">{set}</Text>
                                </View>
                                <Text className="flex-1 text-center text-gray-400">-</Text>
                                <TextInput
                                    defaultValue={exercise.reps.toString()}
                                    className="flex-1 bg-emerald-50 h-9 rounded-lg text-center font-bold text-emerald-800 mx-1 border border-emerald-100"
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    placeholder="0"
                                    className="flex-1 bg-gray-50 h-9 rounded-lg text-center font-bold text-gray-800 mx-1 border border-gray-200"
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity className="w-8 h-8 rounded-lg border border-gray-300 items-center justify-center">
                                    <Ionicons name="checkmark" size={18} color="#D1D5DB" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <View className="items-center mt-2">
                            <Text className="text-emerald-600 font-bold text-sm mb-3">Total Volume: 0 kg</Text>
                            <TouchableOpacity className="w-full py-2 bg-gray-50 rounded-xl items-center border border-gray-200">
                                <Text className="font-bold text-gray-600">+ Add Set</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>

                {/* Footer Action */}
                <View className="p-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => {
                            if (currentExerciseIndex < activeDay.exercises.length - 1) {
                                setCurrentExerciseIndex(curr => curr + 1);
                            } else {
                                setViewMode('completed');
                                setIsTimerRunning(false);
                            }
                        }}
                        className="bg-cyan-600 h-14 rounded-full flex-row items-center justify-between px-6 shadow-lg shadow-cyan-200"
                    >
                        <Text className="text-white font-bold text-lg">
                            {currentExerciseIndex < activeDay.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
                        </Text>
                        <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                            <Ionicons name="chevron-forward" size={18} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const CompletedView = () => (
        <View className="flex-1 bg-gray-50 p-6 pt-10">
            <View className="items-center mb-8">
                <View className="w-20 h-20 bg-teal-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="checkmark-sharp" size={40} color="#0D9488" />
                </View>
                <Text className="text-2xl font-bold text-teal-900">Workout Completed!</Text>
                <Text className="text-gray-500 text-center mt-2 px-8">Great job! You've completed your workout.</Text>
            </View>

            {/* Summary Grid */}
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6">
                <Text className="font-bold text-gray-900 mb-4 ml-1">Workout Summary</Text>
                <View className="flex-row flex-wrap justify-between">
                    <View className="w-[48%] bg-blue-50 p-4 rounded-2xl mb-4 items-center">
                        <Ionicons name="time-outline" size={20} color="#3B82F6" className="mb-1" />
                        <Text className="text-gray-500 text-xs">Duration</Text>
                        <Text className="font-bold text-lg text-gray-900">{formatTime(workoutTimer)}</Text>
                    </View>
                    <View className="w-[48%] bg-purple-50 p-4 rounded-2xl mb-4 items-center">
                        <MaterialCommunityIcons name="weight" size={20} color="#8B5CF6" className="mb-1" />
                        <Text className="text-gray-500 text-xs">Total Volume</Text>
                        <Text className="font-bold text-lg text-gray-900">1,250 kg</Text>
                    </View>
                    <View className="w-[48%] bg-orange-50 p-4 rounded-2xl mb-4 items-center">
                        <MaterialCommunityIcons name="dumbbell" size={20} color="#F97316" className="mb-1" />
                        <Text className="text-gray-500 text-xs">Total Sets</Text>
                        <Text className="font-bold text-lg text-gray-900">18</Text>
                    </View>
                    <View className="w-[48%] bg-pink-50 p-4 rounded-2xl mb-4 items-center">
                        <Ionicons name="repeat" size={20} color="#EC4899" className="mb-1" />
                        <Text className="text-gray-500 text-xs">Total Reps</Text>
                        <Text className="font-bold text-lg text-gray-900">210</Text>
                    </View>
                </View>

                <View className="bg-emerald-50 p-4 rounded-2xl flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="flame" size={24} color="#10B981" />
                        <Text className="font-bold text-gray-900 ml-3">Calories Burned</Text>
                    </View>
                    <Text className="font-bold text-xl text-emerald-600">320 kcal</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => {
                    toggleWorkout(); // Mark as done in backend/context
                    setViewMode('dashboard');
                    setWorkoutTimer(0);
                    setCurrentExerciseIndex(0);
                }}
                className="bg-emerald-500 w-full py-4 rounded-full flex-row items-center justify-center shadow-lg shadow-emerald-200"
            >
                <Text className="text-white font-bold text-lg mr-2">Log Workout</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );

    if (!hasProgram) {
        return (
            <View className="flex-1 bg-white pt-10">
                {showGenerating && <GeneratingView onFinish={() => { setShowGenerating(false); setHasProgram(true); }} />}
                <WelcomeView onStart={() => setShowGenerating(true)} />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <WorkoutTipsModal />
            {viewMode === 'dashboard' && <DashboardView />}
            {viewMode === 'preview' && <PreviewView />}
            {viewMode === 'active' && <ActiveView />}
            {viewMode === 'completed' && <CompletedView />}
        </SafeAreaView>
    );
}
