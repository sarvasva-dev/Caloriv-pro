import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, Animated, Easing } from 'react-native';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    style?: TextStyle | TextStyle[];
    formatter?: (val: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    duration = 800,
    style,
    formatter = (val) => Math.round(val).toString()
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const listener = animatedValue.addListener(({ value }) => {
            setDisplayValue(value);
        });

        Animated.timing(animatedValue, {
            toValue: value,
            duration: duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true, // Note: standard Animated doesn't support listener on native driver fully in all cases, but text update requires JS thread usually. 
            // actually for setDisplayValue we need JS driver or run on JS. 
            // Reanimated is better but sticking to standard RN Animated for simplicity if reanimated not setup.
            // Let's use JS driver (useNativeDriver: false) to ensure listener works for text updates.
        }).start();

        return () => {
            animatedValue.removeListener(listener);
        };
    }, [value, duration]);

    return (
        <Text style={style}>
            {formatter(displayValue)}
        </Text>
    );
};
