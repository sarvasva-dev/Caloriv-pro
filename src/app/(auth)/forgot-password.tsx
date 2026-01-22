import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendEmail = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(email);
            if (response.success) {
                setStep('otp');
                Alert.alert('Success', 'OTP sent to your email');
            } else {
                Alert.alert('Error', response.error || 'Failed to send OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }
        setIsLoading(true);
        try {
            const response = await authService.verifyOtp(email, otp);
            if (response.success) {
                setStep('password');
            } else {
                Alert.alert('Error', response.error || 'Invalid OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await authService.resetPassword(email, otp, password);
            if (response.success) {
                Alert.alert('Success', 'Password reset successfully', [
                    { text: 'Login', onPress: () => router.replace('/(auth)/login') }
                ]);
            } else {
                Alert.alert('Error', response.error || 'Failed to reset password');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const renderEmailStep = () => (
        <View className="space-y-6">
            <View>
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email Address
                </Text>
                <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-900 dark:text-neutral-100"
                        placeholder="Enter your email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </View>

            <TouchableOpacity
                onPress={handleSendEmail}
                disabled={isLoading}
                className="bg-emerald-500 rounded-full py-3 px-6 mt-6 flex-row items-center justify-between shadow-lg shadow-emerald-200"
            >
                <View className="w-8" />
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">Send OTP</Text>
                )}
                <View className="bg-white rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderOtpStep = () => (
        <View className="space-y-6">
            <View>
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Enter OTP
                </Text>
                <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500">
                    <Ionicons name="key-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-900 dark:text-neutral-100"
                        placeholder="Enter OTP sent to your email"
                        placeholderTextColor="#9CA3AF"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        maxLength={6}
                    />
                </View>
            </View>

            <TouchableOpacity
                onPress={handleVerifyOtp}
                disabled={isLoading}
                className="bg-emerald-500 rounded-full py-3 px-6 mt-6 flex-row items-center justify-between shadow-lg shadow-emerald-200"
            >
                <View className="w-8" />
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">Verify OTP</Text>
                )}
                <View className="bg-white rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('email')} className="items-center">
                <Text className="text-emerald-500 font-medium">Change Email</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPasswordStep = () => (
        <View className="space-y-6">
            <View>
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    New Password
                </Text>
                <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-900 dark:text-neutral-100"
                        placeholder="Enter new password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Confirm Password
                </Text>
                <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-200 dark:border-neutral-700 focus:border-emerald-500">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-neutral-900 dark:text-neutral-100"
                        placeholder="Confirm new password"
                        placeholderTextColor="#9CA3AF"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleResetPassword}
                disabled={isLoading}
                className="bg-emerald-500 rounded-full py-3 px-6 mt-6 flex-row items-center justify-between shadow-lg shadow-emerald-200"
            >
                <View className="w-8" />
                {isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-lg font-bold">Reset Password</Text>
                )}
                <View className="bg-white rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    {/* Header */}
                    <View className="px-6 py-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800"
                        >
                            <Ionicons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 px-8 pt-8">
                        <View className="mb-8">
                            <Text className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                                {step === 'email' && 'Forgot Password?'}
                                {step === 'otp' && 'Enter OTP'}
                                {step === 'password' && 'Reset Password'}
                            </Text>
                            <Text className="text-base text-neutral-500 dark:text-neutral-400">
                                {step === 'email' && "Don't worry! It happens. Please enter the email associated with your account."}
                                {step === 'otp' && `We've sent a code to ${email}. Please enter it below.`}
                                {step === 'password' && 'Create a new password for your account.'}
                            </Text>
                        </View>

                        {step === 'email' && renderEmailStep()}
                        {step === 'otp' && renderOtpStep()}
                        {step === 'password' && renderPasswordStep()}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
