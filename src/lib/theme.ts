import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme/designSystem';

export const lightTheme = {
    colors: COLORS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
};

// Default export if needed
export default lightTheme;

// Re-export specific tokens for compatibility
export { COLORS as colors, SPACING as spacing, RADIUS as radius, SHADOWS as shadows };

// Mock glass and typography if missing
export const glass = {
    default: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
    }
};

export const typography = {
    h1: { fontSize: 32, fontWeight: 'bold' },
    body: { fontSize: 16 },
};
