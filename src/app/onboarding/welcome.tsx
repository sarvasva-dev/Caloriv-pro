import { View, Text, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCaloriv } from '../../contexts/CalorivContext';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const { isAuthenticated } = useCaloriv();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            router.push('/onboarding/step/1');
        } else {
            router.push('/(auth)/signup');
        }
    };

    return (
        <View className="flex-1 bg-[#050505]">
            <StatusBar barStyle="light-content" />
            
            {/* Background Gradients */}
            <View className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <View className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <View className="absolute bottom-[20%] right-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]" />
            </View>

            <SafeAreaView className="flex-1">
                <View className="flex-1 px-6 justify-between py-6">
                    
                    {/* Header Section */}
                    <View className="mt-6">
                        <View className="flex-row items-center space-x-2 mb-6 px-3 py-1.5 bg-white/10 self-start rounded-full border border-white/10">
                            <Ionicons name="star" size={12} color="#FACC15" />
                            <Text className="text-gray-300 text-xs font-medium tracking-wide">#1 Indian Fitness App Challenge</Text>
                        </View>

                        <Text className="text-5xl font-black text-white leading-[0.9] tracking-tighter">
                            TRANSFORM
                        </Text>
                        <Text className="text-5xl font-black text-emerald-400 leading-[0.9] tracking-tighter">
                             YOUR BODY.
                        </Text>
                        <Text className="text-3xl font-bold text-gray-400 mt-2 tracking-tight">
                            TRANSFORM YOUR LIFE.
                        </Text>

                        <Text className="text-gray-400 text-lg mt-6 leading-relaxed">
                            The native fitness app that respects your time. AI food logging, mandatory warmups, and streak shields. No ads. Just gains.
                        </Text>
                    </View>

                    {/* Image / Mockup Section */}
                    <View className="flex-1 items-center justify-center relative my-4">
                        {/* Glow behind phone */}
                        <View className="absolute w-[200px] h-[200px] bg-emerald-500/20 blur-[60px] rounded-full" />
                        
                        <Image 
                            source={require('../../../assets/images/onboarding/transform.png')}
                            style={{ width: width * 0.9, height: width * 0.9 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Footer / Button */}
                    <View className="mb-4 space-y-4">
                        <TouchableOpacity
                            onPress={handleGetStarted}
                            className="bg-white rounded-full py-4 flex-row items-center justify-center space-x-2 shadow-lg shadow-white/10 active:scale-95 transition-transform"
                        >
                            <Text className="text-black text-lg font-bold">Get Started</Text>
                            <Ionicons name="arrow-forward" size={20} color="black" />
                        </TouchableOpacity>

                        {!isAuthenticated && (
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/login')}
                                className="py-2 items-center"
                            >
                                <Text className="text-gray-400 font-medium text-base">
                                    Already have an account? <Text className="text-emerald-400 font-bold">Log In</Text>
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
