import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    runOnJS
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { COLORS } from '../../theme/designSystem';

const ITEM_HEIGHT = 60;

interface VerticalSnapPickerProps {
    items: string[];
    initialIndex?: number;
    onValueChange: (value: string, index: number) => void;
}

export default function VerticalSnapPicker({ items, initialIndex = 0, onValueChange }: VerticalSnapPickerProps) {
    const scrollY = useSharedValue(initialIndex * ITEM_HEIGHT);

    // We can use a FlatList or just a ScrollView with snapToInterval
    // But for "Pro" feel, let's use Animated.ScrollView

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
        onMomentumEnd: (event) => {
            const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
            if (index >= 0 && index < items.length) {
                runOnJS(onValueChange)(items[index], index);
            }
        }
    });

    return (
        <View style={{ height: ITEM_HEIGHT * 3, overflow: 'hidden', width: '100%', alignItems: 'center' }}>
            <View style={[StyleSheet.absoluteFill, { top: ITEM_HEIGHT, height: ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.accents.primary, opacity: 0.3 }]} pointerEvents="none" />

            <Animated.ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ paddingTop: ITEM_HEIGHT, paddingBottom: ITEM_HEIGHT, alignItems: 'center' }}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
            >
                {items.map((item, index) => {
                    return (
                        <PickerItem
                            key={index}
                            item={item}
                            index={index}
                            scrollY={scrollY}
                        />
                    );
                })}
            </Animated.ScrollView>
        </View>
    );
}

const PickerItem = ({ item, index, scrollY }: { item: string, index: number, scrollY: SharedValue<number> }) => {
    const inputRange = [
        (index - 1) * ITEM_HEIGHT,
        index * ITEM_HEIGHT,
        (index + 1) * ITEM_HEIGHT
    ];

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            scrollY.value,
            inputRange,
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            inputRange,
            [0.4, 1, 0.4],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity
        };
    });

    return (
        <Animated.View style={[{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }, animatedStyle]}>
            <Text style={{ fontSize: 24, fontWeight: '600', color: COLORS.text.primary }}>{item}</Text>
        </Animated.View>
    );
};
