import React, { useEffect, useRef } from 'react';
import { View, Text, Vibration, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    runOnJS,
    useAnimatedRef,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/designSystem';

const { width } = Dimensions.get('window');

const SEGMENT_WIDTH = 10;
const RULER_HEIGHT = 100;
const INDICATOR_COLOR = COLORS.accents.primary;

interface RulerPickerProps {
    min: number;
    max: number;
    initialValue?: number;
    step?: number;
    unit?: string;
    onValueChange: (value: number) => void;
}

export default function RulerPicker({ min, max, initialValue, step = 1, unit = 'kg', onValueChange }: RulerPickerProps) {
    const range = max - min;
    const count = Math.round(range / step);
    
    // Calculate initial pixels
    // initialValue might not be exactly on a step, but we approximate
    const safeInitial = Math.min(Math.max(initialValue || min, min), max);
    const initialOffset = ((safeInitial - min) / step) * SEGMENT_WIDTH;

    // We add padding so the first and last items can reach the center
    const SPACER_WIDTH = width / 2;

    const aref = useAnimatedRef<Animated.ScrollView>();
    const lastValue = useRef(safeInitial);

    const onScroll = useAnimatedScrollHandler({
        onScroll: (event) => {
            const rawOffset = event.contentOffset.x;
            const rawSteps = rawOffset / SEGMENT_WIDTH;
            const val = min + (rawSteps * step);
            
            const clampedValue = Math.min(Math.max(val, min), max);
            const roundedValue = Math.round(clampedValue / step) * step;
            
            if (roundedValue !== lastValue.current) {
                 runOnJS(handleValueChange)(roundedValue);
            }
        },
    });

    function handleValueChange(val: number) {
        lastValue.current = val;
        onValueChange(val);
    }
    
    // We can't easily scroll on mount with Reanimated ScrollView ref in pure JS sometimes without a layout callback.
    // Using simple ContentOffset prop on mount.
    
    return (
        <View style={{ height: RULER_HEIGHT + 50, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ height: RULER_HEIGHT, width: width }}>
                 <Animated.ScrollView
                    ref={aref}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: SPACER_WIDTH - SEGMENT_WIDTH/2 }}
                    snapToInterval={SEGMENT_WIDTH}
                    decelerationRate="fast"
                    scrollEventThrottle={16}
                    onScroll={onScroll}
                    contentOffset={{ x: initialOffset, y: 0 }} 
                >
                    {Array.from({ length: count + 1 }).map((_, i) => {
                        const val = min + (i * step);
                        const isMajor = i % 10 === 0;
                        const isMid = i % 5 === 0 && !isMajor;
                        
                        return (
                            <View key={i} style={{ width: SEGMENT_WIDTH, alignItems: 'center', justifyContent: 'flex-end', height: RULER_HEIGHT }}>
                                {isMajor && (
                                    <Text style={{ position: 'absolute', top: 0, fontSize: 10, color: COLORS.text.secondary, width: 40, textAlign: 'center' }}>
                                        {val}
                                    </Text>
                                )}
                                <View
                                    style={{
                                        width: isMajor ? 2 : 1.5,
                                        height: isMajor ? 40 : (isMid ? 25 : 15),
                                        backgroundColor: isMajor ? COLORS.text.secondary : COLORS.text.muted,
                                        opacity: isMajor ? 0.8 : 0.4,
                                        borderRadius: 2
                                    }}
                                />
                            </View>
                        );
                    })}
                </Animated.ScrollView>
            </View>

             <View style={{ position: 'absolute', bottom: 0, height: 50, width: 4, backgroundColor: INDICATOR_COLOR, borderRadius: 2, pointerEvents: 'none', bottom: 0 }} />
        </View>
    );
}
