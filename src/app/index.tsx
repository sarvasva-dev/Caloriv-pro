import { Redirect } from 'expo-router';
import { useCaloriv } from '../contexts/CalorivContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { isAuthenticated, isOnboarded, isLoading } = useCaloriv();

    // Show generic loading if verifying auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#00C27A" />
            </View>
        );
    }

    // Routing Logic
    // If not authenticated, start the "Welcome Tour"
    if (!isAuthenticated) return <Redirect href="/transformation" />;

    // If authenticated but not onboarded (if applicable later)
    if (!isOnboarded) return <Redirect href="/onboarding" />;

    // Authenticated and ready
    return <Redirect href="/(tabs)" />;
}
