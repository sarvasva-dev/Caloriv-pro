import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCaloriv } from '../../contexts/CalorivContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { userProfile, signOut } = useCaloriv();
    const router = useRouter();

    const StatCard = ({ icon, value, label, color, iconColor }: any) => (
        <View className="flex-1 p-4 rounded-3xl mx-1 items-start justify-center" style={{ backgroundColor: color }}>
            <View className="flex-row items-center mb-1">
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
            </View>
            <Text className="text-xl font-bold text-gray-800">{value} <Text className="text-sm font-normal text-gray-600">{label}</Text></Text>
            <Text className="text-xs text-gray-500 mt-1">Current {label === 'yr' ? 'Age' : label === 'kg' ? 'Weight' : 'Height'}</Text>
        </View>
    );

    const SettingsItem = ({ icon, title, subtitle, onPress, isDestructive = false }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center py-4 border-b border-gray-50"
        >
            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4">
                <Ionicons
                    name={icon}
                    size={20}
                    color={isDestructive ? '#EF4444' : '#374151'}
                />
            </View>
            <View className="flex-1">
                <Text className={`font-semibold text-base ${isDestructive ? 'text-red-500' : 'text-gray-900'}`}>{title}</Text>
                {subtitle && <Text className="text-gray-400 text-xs mt-0.5">{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="chevron-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Profile</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                <Text className="font-bold text-gray-900 text-lg mb-1">Your Profile</Text>
                <Text className="text-gray-500 mb-8">Manage your profile here</Text>

                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-full bg-teal-800 items-center justify-center mb-4">
                            <Ionicons name="person" size={48} color="white" />
                        </View>
                        <TouchableOpacity className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
                            <Ionicons name="pencil" size={14} color="#374151" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xl font-bold text-teal-900">{userProfile?.name || 'User'}</Text>
                    <Text className="text-gray-500">{userProfile?.email || 'user@example.com'}</Text>
                </View>

                {/* Stats Row - Matching Screenshot Colors approx */}
                <View className="flex-row mb-8">
                    <StatCard
                        icon="cake-variant"
                        value={userProfile?.age || 25}
                        label="yr"
                        color="#E0F2FE" // Light Blue
                        iconColor="#0EA5E9"
                    />
                    <StatCard
                        icon="scale-bathroom"
                        value={userProfile?.currentWeight || 70}
                        label="kg"
                        color="#FCE7F3" // Light Pink
                        iconColor="#EC4899"
                    />
                    <StatCard
                        icon="ruler"
                        value={userProfile?.height || 170}
                        label="cm"
                        color="#FEF3C7" // Light Yellow
                        iconColor="#F59E0B"
                    />
                </View>

                {/* Settings List */}
                <Text className="font-bold text-lg text-teal-900 mb-4">Settings</Text>

                <View className="mb-10">
                    <SettingsItem
                        icon="person-outline"
                        title="My Details"
                        subtitle="View and edit your details"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Manage your notifications"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="hardware-chip-outline"
                        title="Device and Apps"
                        subtitle="Manage your connected devices"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="call-outline"
                        title="Support"
                        subtitle="Get help and support"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        subtitle="View our privacy policy"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="document-text-outline"
                        title="Terms of Use"
                        subtitle="View our terms of use"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="diamond-outline"
                        title="Subscription"
                        subtitle="Manage your subscription"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="trash-outline"
                        title="Delete account"
                        subtitle="Delete your account"
                        onPress={() => { }}
                    />
                    <SettingsItem
                        icon="log-out-outline"
                        title="Sign Out"
                        subtitle="Sign out from the app"
                        onPress={handleSignOut}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
