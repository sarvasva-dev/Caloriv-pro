import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, FONTS } from '../../theme/designSystem';
import { CircularProgress } from '../ui/CircularProgress'; // We'll reuse/adapt the one we have or imported
import { ProgressBar } from '../ui/ProgressBar';

// Placeholder for Mascot (User can replace asset later)
// Accessing via require if available, or using a text placeholder if not.
// For now, I'll use a specific style to mimic the "blueberry" look if image fails.

interface NutritionGoalCardProps {
    caloriesLeft: number;
    caloriesGoal: number;
    caloriesConsumed: number;
    protein: { current: number; total: number };
    carbs: { current: number; total: number };
    fat: { current: number; total: number };
    onEditPress?: () => void;
}

export function NutritionGoalCard({
    caloriesLeft,
    caloriesGoal,
    caloriesConsumed,
    protein,
    carbs,
    fat,
    onEditPress
}: NutritionGoalCardProps) {

    // Calculate progress for the main ring (inverse: 1 = empty, 0 = full for "left" logic, 
    // but usually user visualizes "consumed". The image shows "Need energy" and "Calories left".
    // Let's assume the ring fills up as you eat.
    const progress = Math.min(caloriesConsumed / caloriesGoal, 1);

    // Mascot Logic
    const getMascotMood = () => {
        if (caloriesLeft <= 0) return 'sad'; // Over budget
        if (caloriesLeft < (caloriesGoal * 0.2)) return 'concerned'; // Low budget (< 20%)
        return 'happy'; // Healthy budget
    };

    const mood = getMascotMood();

    const getMascotText = () => {
        switch (mood) {
            case 'sad': return 'Over Budget!';
            case 'concerned': return 'Watch out!';
            default: return 'Fuel up!';
        }
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Nutrition Goal</Text>
                <TouchableOpacity onPress={onEditPress}>
                    <Ionicons name="pencil" size={16} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Main Circle Area */}
            <View style={styles.ringContainer}>
                <CircularProgress
                    size={220}
                    strokeWidth={8}
                    progress={progress}
                    colors={[COLORS.primary, COLORS.primaryDark]}
                >
                    <View style={styles.innerContent}>
                        {/* Mascot Placeholder (Blueberry style) */}
                        <View style={[styles.mascotPlaceholder, mood === 'sad' && { opacity: 0.8 }]}>
                            <View style={[styles.mascotBody, mood === 'sad' && { backgroundColor: '#EF4444' }]} />
                            <View style={styles.mascotFace}>
                                {mood === 'sad' ? (
                                    <>
                                        <View style={[styles.eye, { transform: [{ rotate: '45deg' }], height: 8 }]} />
                                        <View style={[styles.eye, { transform: [{ rotate: '-45deg' }], height: 8 }]} />
                                    </>
                                ) : (
                                    <>
                                        <View style={[styles.eye, mood === 'concerned' && { height: 8 }]} />
                                        <View style={[styles.eye, mood === 'concerned' && { height: 8 }]} />
                                    </>
                                )}
                            </View>
                            <View style={styles.mascotLeaf} />
                        </View>

                        <Text style={[styles.mascotText, mood === 'sad' && { color: COLORS.error }]}>
                            {getMascotText()}
                        </Text>
                        <Text style={styles.caloriesText}>{caloriesLeft}</Text>
                        <Text style={styles.subText}>Calories left</Text>
                    </View>
                </CircularProgress>
            </View>

            {/* Goal vs Consumed Stats */}
            <View style={styles.midStats}>
                <Text style={styles.midStatText}>
                    Goal <Text style={styles.boldText}>{caloriesGoal}</Text>
                </Text>
                <View style={styles.verticalLine} />
                <Text style={styles.midStatText}>
                    Consumed <Text style={[styles.boldText, { color: COLORS.primary }]}>{caloriesConsumed}</Text>
                </Text>
            </View>

            {/* Macros Row */}
            <View style={styles.macrosRow}>
                {/* Protein */}
                <View style={styles.macroItem}>
                    <View style={styles.macroLabelRow}>
                        <Ionicons name="nutrition" size={12} color="#F59E0B" />
                        <Text style={styles.macroTitle}>Proteins</Text>
                    </View>
                    <Text style={styles.macroValue}>
                        {protein.current}/{protein.total}g
                    </Text>
                    <ProgressBar
                        progress={protein.current / protein.total}
                        color="#A78BFA" // Purpleish
                        trackColor="#F3F4F6"
                        height={6}
                    />
                </View>

                {/* Carbs */}
                <View style={styles.macroItem}>
                    <View style={styles.macroLabelRow}>
                        <Ionicons name="pizza" size={12} color="#EF4444" />
                        <Text style={styles.macroTitle}>Carbs</Text>
                    </View>
                    <Text style={styles.macroValue}>
                        {carbs.current}/{carbs.total}g
                    </Text>
                    <ProgressBar
                        progress={carbs.current / carbs.total}
                        color="#F472B6" // Pinkish
                        trackColor="#F3F4F6"
                        height={6}
                    />
                </View>

                {/* Fat */}
                <View style={styles.macroItem}>
                    <View style={styles.macroLabelRow}>
                        <Ionicons name="water" size={12} color="#3B82F6" />
                        <Text style={styles.macroTitle}>Fat</Text>
                    </View>
                    <Text style={styles.macroValue}>
                        {fat.current}/{fat.total}g
                    </Text>
                    <ProgressBar
                        progress={fat.current / fat.total}
                        color="#FCD34D" // Yellowish
                        trackColor="#F3F4F6"
                        height={6}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        ...SHADOWS.soft,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text.primary,
        fontFamily: FONTS.bold,
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.l,
    },
    innerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Simple drawing of a mascot if no image
    mascotPlaceholder: {
        marginBottom: 8,
        alignItems: 'center',
    },
    mascotBody: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#818CF8', // Blueberry color
    },
    mascotFace: {
        position: 'absolute',
        top: 15,
        flexDirection: 'row',
        gap: 6,
    },
    eye: {
        width: 4,
        height: 6,
        borderRadius: 2,
        backgroundColor: '#1E1B4B',
    },
    mascotLeaf: {
        position: 'absolute',
        top: -6,
        width: 12,
        height: 12,
        borderTopLeftRadius: 10,
        borderBottomRightRadius: 10,
        backgroundColor: '#34D399',
    },
    mascotText: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: 4,
        fontFamily: FONTS.medium,
    },
    caloriesText: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text.primary,
        fontFamily: FONTS.heavy,
        marginBottom: -4,
    },
    subText: {
        fontSize: 12,
        color: COLORS.text.tertiary,
        fontFamily: FONTS.regular,
    },
    midStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        gap: SPACING.m,
    },
    midStatText: {
        fontSize: 14,
        color: COLORS.text.secondary,
        fontFamily: FONTS.medium,
    },
    boldText: {
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    verticalLine: {
        width: 1,
        height: 16,
        backgroundColor: COLORS.border,
    },
    macrosRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: SPACING.s,
    },
    macroItem: {
        flex: 1,
        backgroundColor: '#FAFAFA', // Very light grey bg for macro pill
        borderRadius: RADIUS.m,
        padding: SPACING.s,
    },
    macroLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4,
    },
    macroTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.text.secondary,
    },
    macroValue: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 6,
    },
});
