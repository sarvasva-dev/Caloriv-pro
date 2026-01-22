import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../../theme/designSystem';
import { useCaloriv } from '../../contexts/CalorivContext';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Transformation',
        description: 'Visualize your journey and track your body transformation perfectly.',
        image: require('../../../assets/images/onboarding/transform.png') // Placeholder
    },
    {
        id: '2',
        title: 'Personalized Plan',
        description: 'Get a diet and workout plan tailored to your unique biology.',
        image: require('../../../assets/images/onboarding/plan.png')
    },
    {
        id: '3',
        title: 'Eat What You Love',
        description: 'No strict diets. Learn to enjoy your favorite foods while losing weight.',
        image: require('../../../assets/images/onboarding/food.png')
    },
    {
        id: '4',
        title: 'Instant Logging',
        description: 'Log meals in seconds with our AI and smart barcode scanner.',
        image: require('../../../assets/images/onboarding/log.png')
    },
    {
        id: '5',
        title: 'Week 1 Check-In',
        description: 'Stay accountable with weekly verify-ins and smart adjustments.',
        image: require('../../../assets/images/onboarding/checkin.png')
    }
];

export default function AppTour() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();
    const { setHasSeenTutorial } = useCaloriv(); // Assuming this exists or we just nav to questionnaire

    const nextSlide = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const finishTour = async () => {
        // Navigate to Questionnaire
        // In a real app we might mark 'hasSeenTutorial' in context
        // For now, just switch the Onboarding Screen view or assume parent handles it
    };

    return (
        <View style={styles.container}>
            <Animated.View
                key={currentSlide}
                entering={SlideInRight}
                exiting={SlideOutLeft}
                style={styles.slide}
            >
                {/* Image Placeholder */}
                <View style={styles.imageContainer}>
                    <Text style={{ color: COLORS.text.muted }}>Image: {SLIDES[currentSlide].title}</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
                    <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
                </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.dots}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentSlide && styles.activeDot
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={nextSlide}
                >
                    <Text style={styles.buttonText}>
                        {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xxl,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl + 20,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.ui.border,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 24,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.round,
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        color: COLORS.text.inverse,
        fontSize: 18,
        fontWeight: 'bold',
    }
});
