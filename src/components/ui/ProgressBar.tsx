import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, RADIUS } from '../../theme/designSystem';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
    trackColor?: string;
    height?: number;
    width?: DimensionValue;
}

export function ProgressBar({
    progress,
    color = COLORS.primary,
    trackColor = '#E5E7EB', // Slate-200 default
    height = 6,
    width = '100%'
}: ProgressBarProps) {
    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 1), {
            duration: 1000,
            easing: Easing.out(Easing.exp),
        });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${animatedProgress.value * 100}%`,
    }));

    return (
        <View style={[styles.track, { backgroundColor: trackColor, height, width, borderRadius: height / 2 }]}>
            <Animated.View
                style={[
                    styles.fill,
                    { backgroundColor: color, borderRadius: height / 2 },
                    animatedStyle
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
});
