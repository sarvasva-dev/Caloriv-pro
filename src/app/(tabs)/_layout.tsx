import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/designSystem';
import { View, Platform } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingTop: 0,
                    position: 'absolute',
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.text.tertiary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center justify-center pt-2">
                            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                            {focused && <View className="w-1 h-1 bg-primary rounded-full mt-1" />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="food"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center justify-center pt-2">
                            <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={24} color={color} />
                            {focused && <View className="w-1 h-1 bg-primary rounded-full mt-1" />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="workout"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center justify-center pt-2">
                            <Ionicons name={focused ? "barbell" : "barbell-outline"} size={24} color={color} />
                            {focused && <View className="w-1 h-1 bg-primary rounded-full mt-1" />}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View className="items-center justify-center pt-2">
                            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                            {focused && <View className="w-1 h-1 bg-primary rounded-full mt-1" />}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
