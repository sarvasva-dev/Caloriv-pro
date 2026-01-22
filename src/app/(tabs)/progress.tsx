import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCaloriv } from '../../contexts/CalorivContext';
import { COLORS } from '../../theme/designSystem'; // Assuming this exists
import { Svg, Circle, Path, Line, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
    const { userProfile, dailyLog } = useCaloriv();
    const [activeTab, setActiveTab] = useState<'stats' | 'reports'>('stats');

    // --- Components ---

    const TabButton = ({ title, id }: { title: string, id: 'stats' | 'reports' }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(id)}
            className={`flex-1 py-3 items-center border-b-2 ${activeTab === id ? 'border-emerald-500' : 'border-transparent'}`}
        >
            <Text className={`font-bold ${activeTab === id ? 'text-emerald-600' : 'text-gray-400'}`}>{title}</Text>
        </TouchableOpacity>
    );

    const WeightCard = ({ label, value, unit, color }: any) => (
        <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 mx-1 items-center">
            <Text className="text-gray-400 text-xs uppercase mb-1">{label}</Text>
            <Text className="text-xl font-bold" style={{ color: color }}>{value} <Text className="text-sm text-gray-400">{unit}</Text></Text>
        </View>
    );

    const CircularStat = ({ label, value, color, icon }: any) => (
        <View className="items-center mx-2">
            <View className="w-20 h-20 rounded-full border-4 items-center justify-center mb-2" style={{ borderColor: color + '30' }}>
                <View className="absolute w-full h-full rounded-full border-4 border-t-transparent -rotate-45" style={{ borderColor: color }} />
                {icon && <MaterialCommunityIcons name={icon} size={24} color={color} />}
                {!icon && <Text className="font-bold text-lg" style={{ color }}>{value}%</Text>}
            </View>
            <Text className="text-gray-600 font-medium text-xs text-center">{label}</Text>
            {icon && <Text className="font-bold text-gray-800">{value}</Text>}
        </View>
    );

    const BMIGauge = ({ bmi }: { bmi: number }) => {
        // Simple positioning logic: 15 (min) to 40 (max)
        const leftPos = Math.min(Math.max(((bmi - 15) / (40 - 15)) * 100, 0), 100);

        return (
            <View className="mt-4 mb-6">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500">BMI Score</Text>
                    <Text className="font-bold text-gray-900">{bmi.toFixed(1)}</Text>
                </View>
                <View className="h-4 rounded-full overflow-hidden relative">
                    <LinearGradient
                        colors={['#3B82F6', '#10B981', '#EAB308', '#EF4444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </View>
                <View style={{ left: `${leftPos}%` }} className="absolute top-5 -ml-3 items-center">
                    <View className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800 mb-1 rotate-180" />
                    <View className="bg-gray-800 px-2 py-0.5 rounded-md">
                        <Text className="text-white text-[10px] font-bold">You</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mt-6">
                    <Text className="text-[10px] text-blue-500">Underweight</Text>
                    <Text className="text-[10px] text-emerald-500">Normal</Text>
                    <Text className="text-[10px] text-yellow-500">Overweight</Text>
                    <Text className="text-[10px] text-red-500">Obese</Text>
                </View>
            </View>
        );
    };

    const SimpleBarChart = () => (
        <View className="h-48 mt-4 flex-row items-end justify-between px-2">
            {[40, 60, 45, 80, 55, 70, 65].map((h, i) => (
                <View key={i} className="items-center w-8">
                    <View
                        className="w-4 bg-emerald-500 rounded-t-lg"
                        style={{ height: `${h}%`, opacity: i === 6 ? 1 : 0.5 }}
                    />
                    <Text className="text-[10px] text-gray-400 mt-2">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                </View>
            ))}
            {/* Grid Lines */}
            <View className="absolute inset-0 -z-10 flex-col justify-between py-6">
                {[1, 2, 3, 4].map(l => <View key={l} className="h-[1px] bg-gray-100 w-full" />)}
            </View>
        </View>
    );

    // --- Views ---

    const BodyStatsView = () => (
        <ScrollView className="flex-1 p-5 pb-20">
            {/* Weight Cards */}
            <View className="flex-row mb-6">
                <WeightCard label="Start" value={userProfile?.weight || 70} unit="kg" color="#9CA3AF" />
                <WeightCard label="Current" value={userProfile?.currentWeight || 68} unit="kg" color="#10B981" />
                <WeightCard label="Goal" value={userProfile?.targetWeight || 65} unit="kg" color="#3B82F6" />
            </View>

            {/* BMI & Analyzer */}
            <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <Text className="font-bold text-lg text-gray-900 mb-4">Body Analyzer</Text>

                <BMIGauge bmi={(() => {
                    const h = (userProfile?.height || 170) / 100;
                    const w = userProfile?.currentWeight || 70;
                    return w / (h * h);
                })()} />

                <View className="flex-row justify-center mt-4">
                    <CircularStat label="Body Fat" value="18" color="#F59E0B" />
                    <CircularStat label="Muscle Mass" value="34" color="#3B82F6" icon="arm-flex" />
                    <CircularStat label="Symmetry" value="92" color="#8B5CF6" />
                </View>

                <TouchableOpacity className="mt-6 bg-gray-50 py-3 rounded-xl items-center border border-gray-200">
                    <Text className="text-emerald-600 font-bold">View Detailed Analysis</Text>
                </TouchableOpacity>
            </View>

            {/* Visual Check-In */}
            <Text className="font-bold text-lg text-gray-900 mb-4">Visual Check-In</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="mr-4">
                    <View className="w-32 h-44 bg-gray-200 rounded-2xl items-center justify-center mb-2 border-2 border-dashed border-gray-300">
                        <Ionicons name="camera" size={30} color="gray" />
                        <Text className="text-xs text-gray-500 mt-2">Add Photo</Text>
                    </View>
                    <Text className="text-center font-bold text-gray-600">Front</Text>
                </View>
                <View className="mr-4">
                    <View className="w-32 h-44 bg-gray-200 rounded-2xl items-center justify-center mb-2 border-2 border-dashed border-gray-300">
                        <Ionicons name="camera" size={30} color="gray" />
                        <Text className="text-xs text-gray-500 mt-2">Add Photo</Text>
                    </View>
                    <Text className="text-center font-bold text-gray-600">Side</Text>
                </View>
                <View className="mr-4">
                    <View className="w-32 h-44 bg-gray-200 rounded-2xl items-center justify-center mb-2 border-2 border-dashed border-gray-300">
                        <Ionicons name="camera" size={30} color="gray" />
                        <Text className="text-xs text-gray-500 mt-2">Add Photo</Text>
                    </View>
                    <Text className="text-center font-bold text-gray-600">Back</Text>
                </View>
            </ScrollView>
        </ScrollView>
    );

    const ReportsView = () => (
        <ScrollView className="flex-1 p-5 pb-20">
            <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-bold text-lg text-gray-900">Calories Trends</Text>
                    <View className="flex-row bg-gray-100 p-1 rounded-lg">
                        <Text className="px-2 py-1 bg-white rounded-md text-xs font-bold shadow-sm">7D</Text>
                        <Text className="px-2 py-1 text-gray-500 text-xs">1M</Text>
                        <Text className="px-2 py-1 text-gray-500 text-xs">1Y</Text>
                    </View>
                </View>
                <Text className="text-3xl font-bold text-emerald-600">1,850 <Text className="text-sm font-normal text-gray-400">kcal/avg</Text></Text>

                <SimpleBarChart />
            </View>

            <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-bold text-lg text-gray-900">Weight History</Text>
                </View>
                <View className="h-40 items-center justify-center">
                    <Text className="text-gray-400 italic">Not enough data to graph</Text>
                </View>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="bg-white shadow-sm pb-2 z-10">
                <View className="px-6 py-4">
                    <Text className="text-2xl font-bold text-gray-900">Progress</Text>
                </View>
                <View className="flex-row px-6">
                    <TabButton title="Body Stats" id="stats" />
                    <TabButton title="Reports" id="reports" />
                </View>
            </View>

            {activeTab === 'stats' ? <BodyStatsView /> : <ReportsView />}
        </SafeAreaView>
    );
}
