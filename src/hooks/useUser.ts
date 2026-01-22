import { useState, useCallback, useEffect } from 'react';
import { UserProfile, loadUserProfile, saveUserProfile, getUserSettings, saveUserSettings } from '../lib/storage';
import { calculateBMR, calculateTDEE, calculateBMI, calculateTimelineWeeks } from '../lib/constants';

export function useUser() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [timelineWeeks, setTimelineWeeks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            setIsLoading(true);
            const profile = await loadUserProfile();
            const settings = await getUserSettings();

            if (profile) { //  && settings?.isOnboarded Check removed for auth persistence. Onboarding status handled by router.
                // We rely on the profile existence as "Authenticated State" loosely, 
                // but real auth check is token based. 
                // If profile exists, we set it.
                setUserProfile(profile);
                setIsOnboarded(!!settings?.isOnboarded);
                recalculateTimeline(profile);
            } else {
                setIsOnboarded(false);
                setUserProfile(null);
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const recalculateTimeline = (profile: UserProfile) => {
        setTimelineWeeks(calculateTimelineWeeks(
            profile.currentWeight ?? 70,
            profile.targetWeight ?? 70,
            profile.fitnessGoal || 'loss',
            profile.tdee || 2000
        ));
    };

    const updateProfile = useCallback(async (partialProfile: Partial<UserProfile>) => {
        if (!userProfile) return;

        const updatedProfile = { ...userProfile, ...partialProfile };

        // Recalculate metrics if bio data changes
        if (partialProfile.age || partialProfile.height || partialProfile.currentWeight) {
            const age = updatedProfile.age ?? 25;
            const height = updatedProfile.height ?? 170;
            const currentWeight = updatedProfile.currentWeight ?? 70;
            const { gender, activityFactor } = updatedProfile;

            const bmr = calculateBMR(currentWeight, height, age, gender);
            const tdee = calculateTDEE(bmr, activityFactor || 1.375);
            const bmi = calculateBMI(currentWeight, height);

            updatedProfile.bmr = bmr;
            updatedProfile.tdee = tdee;
            updatedProfile.bmi = parseFloat(bmi);
        }

        await saveUserProfile(updatedProfile);
        setUserProfile(updatedProfile);
        recalculateTimeline(updatedProfile);

        // Sync settings
        const settings = await getUserSettings();
        if (settings) {
            await saveUserSettings({ ...settings, profile: updatedProfile });
        }
    }, [userProfile]);

    const updateWeight = useCallback(async (weight: number) => {
        await updateProfile({ currentWeight: weight });
    }, [updateProfile]);

    const updateTargetWeight = useCallback(async (weight: number) => {
        await updateProfile({ targetWeight: weight });
    }, [updateProfile]);

    const completeOnboarding = useCallback(async (profile: UserProfile) => {
        // Calculate metrics before saving
        const { age, height, currentWeight, gender, activityFactor } = profile;
        const bmr = calculateBMR(currentWeight ?? 70, height ?? 170, age ?? 25, gender);
        const tdee = calculateTDEE(bmr, activityFactor ?? 1.375);
        const bmi = parseFloat(calculateBMI(currentWeight ?? 70, height ?? 170));

        const mergedProfile = {
            ...profile,
            isGuest: false,
            bmr,
            tdee,
            bmi
        };

        setUserProfile(mergedProfile);
        setIsOnboarded(true);
        await saveUserProfile(mergedProfile);

        // Ensure settings exist
        const existingSettings = await getUserSettings();
        await saveUserSettings({
            id: existingSettings?.id || 'default',
            notifications_enabled: existingSettings?.notifications_enabled ?? true,
            isOnboarded: true,
            currentWeight: mergedProfile.currentWeight ?? 70,
            activityLevel: mergedProfile.activityFactor ?? 1.375,
            profile: mergedProfile
        });

        recalculateTimeline(mergedProfile);
    }, []);

    const resetUser = useCallback(async () => {
        setUserProfile(null);
        setIsOnboarded(false);
        setTimelineWeeks(0);
    }, []);

    return {
        userProfile,
        isOnboarded,
        timelineWeeks,
        isLoading,
        updateProfile,
        updateWeight,
        updateTargetWeight,
        completeOnboarding,
        resetUser,
        setUserProfile // Exposed for sync operations
    };
}
