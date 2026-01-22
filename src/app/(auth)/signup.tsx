import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { useCaloriv } from '../../contexts/CalorivContext';

export default function SignupScreen() {
    const router = useRouter();
    const { login } = useCaloriv();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            setIsSubmitting(true);
            // 1. Register
            const res = await authService.register({
                email,
                password,
                name: email.split('@')[0], // Default name
                termsAccepted: true
            });

            if (res.success) {
                // 2. Auto-Login
                try {
                    await login(email, password);
                    // Explicitly navigate to onboarding welcome after successful login
                    if (router.canGoBack()) {
                        router.dismissAll();
                    }
                    router.replace('/onboarding/welcome');
                } catch (loginError) {
                    console.error("Auto-login failed", loginError);
                    Alert.alert('Registration Successful', 'Please log in with your new account.', [
                        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
                    ]);
                }
            } else {
                Alert.alert('Registration Failed', res.message || res.error || 'Please try again.');
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = () => {
         // Configuration skipped as requested
        Alert.alert('Google Sign In', 'This feature is currently disabled.');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>

                {/* Logo Section */}
                <View className="items-center mb-8">
                    <Image
                        source={require('../../../assets/icon.png')}
                        style={{ width: 80, height: 80, tintColor: '#10B981' }}
                        resizeMode="contain"
                    />
                </View>

                {/* Header */}
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-slate-900 mb-2">Sign Up</Text>
                    <Text className="text-slate-600 text-lg">Your Fitness Journey Starts Here.</Text>
                </View>

                {/* Form */}
                <View className="space-y-4 w-full">
                    {/* Email Input */}
                    <View className="flex-row items-center border border-gray-200 rounded-full px-4 py-3 bg-white">
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Email Address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            className="flex-1 text-base text-gray-800"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Password Input */}
                    <View className="flex-row items-center border border-gray-200 rounded-full px-4 py-3 bg-white">
                        <Ionicons name="key-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            className="flex-1 text-base text-gray-800"
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="flex-row items-center border border-gray-200 rounded-full px-4 py-3 bg-white">
                        <Ionicons name="key-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                        <TextInput
                            placeholder="Confirm Password"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            className="flex-1 text-base text-gray-800"
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isSubmitting}
                        className="bg-emerald-500 rounded-full py-3 px-6 mt-6 flex-row items-center justify-between shadow-lg shadow-emerald-200"
                    >
                        <View className="w-8" />
                        <Text className="text-white text-lg font-bold">Sign Up</Text>
                        <View className="bg-white rounded-full w-8 h-8 items-center justify-center">
                            <Ionicons name="chevron-forward" size={20} color="#10B981" />
                        </View>
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text className="text-xs text-center text-gray-500 mt-4">
                        By signing up, you agree to our <Text className="text-emerald-500 underline">Privacy Policy</Text> and <Text className="text-emerald-500 underline">Terms and Conditions.</Text>
                    </Text>

                    {/* OR Divider */}
                    <View className="flex-row items-center justify-center my-6">
                        <View className="h-[1px] bg-gray-200 w-20" />
                        <Text className="mx-4 text-gray-400 font-medium">OR</Text>
                        <View className="h-[1px] bg-gray-200 w-20" />
                    </View>

                    {/* Google Button */}
                    <TouchableOpacity
                        onPress={handleGoogleLogin}
                        className="border border-gray-200 rounded-full py-3 flex-row items-center justify-center"
                    >
                        <Ionicons name="logo-google" size={24} color="#EA4335" />
                    </TouchableOpacity>

                    {/* Sign In Link */}
                    <View className="flex-row justify-center mt-6">
                        <Text className="text-slate-900 text-base">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text className="text-emerald-500 font-bold text-base underline">Sign In.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
