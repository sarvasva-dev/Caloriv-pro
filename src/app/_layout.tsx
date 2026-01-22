import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { CalorivProvider, useCaloriv } from '../contexts/CalorivContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import '../../global.css'; // NativeWind

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        // You can add custom fonts here if needed, or rely on system fonts/Tailwind classes
        // 'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'), 
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <CalorivProvider>
            <OnboardingProvider>
                <RootLayoutNav />
            </OnboardingProvider>
        </CalorivProvider>
    );
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();
    const { isAuthenticated, isOnboarded, isLoading } = useCaloriv();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        // Auth Guard Logic
        if (!isAuthenticated) {
            const inOnboarding = segments[0] === 'onboarding';
            if (!inAuthGroup && !inOnboarding) {
                // Not authenticated -> Go to Welcome
                router.replace('/onboarding/welcome');
            }
        } else if (isAuthenticated && !isOnboarded && segments[0] !== 'onboarding') {
            // Authenticated but not onboarded -> Go to Onboarding
            router.replace('/onboarding/welcome');
        } else if (isAuthenticated && isOnboarded && inAuthGroup) {
            // Authenticated and onboarded, but in Auth -> Go to Tabs
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isOnboarded, segments, isLoading]);

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
        </ThemeProvider>
    );
}
