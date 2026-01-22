export const COLORS = {
    // Brand Colors (Inferred from "Pro" Modern Light Theme - NEW APP)
    // This file defines the design tokens for the Caloriv Pro new UI.

    primary: '#10B981',     // Emerald Green (User Requested)
    primaryDark: '#047857', // Emerald 700
    secondary: '#1A202C',   // Dark Heading Text
    accent: '#34D399',      // Emerald 400 (Accents)

    // Backgrounds
    background: '#F4F6F8',  // Light Grey Background
    surface: '#FFFFFF',     // Pure White Cards

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Text
    text: {
        primary: '#1F2937',   // Slate 800
        secondary: '#6B7280', // Slate 500
        tertiary: '#9CA3AF',  // Slate 400
        muted: '#9CA3AF',     // Alias
        inverse: '#FFFFFF'
    },

    // UI Elements
    border: '#E5E7EB',      // Light Border
    icon: '#4B5563',        // Dark Grey Icon

    // Compatibility / Nested
    ui: {
        border: '#E5E7EB',
        surface: '#FFFFFF',
        background: '#F4F6F8',
    },
    accents: {
        primary: '#34D399',
    },
    muted: '#9CA3AF',
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    md: 16, // Alias
    nm: 16, // Alias for typo
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 8,
    m: 16,
    l: 24,
    lg: 24, // Alias
    xl: 32, 
    round: 999,
};

export const SHADOWS = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
    }
};

export const FONTS = {
    // Will use System font for now, can swap for 'Outfit' later
    regular: 'System',
    medium: 'System',
    bold: 'System',
    heavy: 'System',
};
