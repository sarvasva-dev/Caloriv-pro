// Environment Constants
// Note: Replace PROD_URL with your actual domain when ready (e.g. https://api.caloriv.com)
// Priority: 1. EXPO_PUBLIC_API_URL (masked in EAS/env) 2. Hardcoded PROD_URL
const PROD_URL = process.env.EXPO_PUBLIC_API_URL || 'http://20.197.14.33:3000/api';

// Local Development URLs
// 10.0.2.2 is valid for Android Emulator to reach host machine
// localhost is valid for iOS Simulator
const DEV_URL = 'http://20.197.14.33:3000/api'; // Host IP fallback

export const API_CONFIG = {
    BASE_URL: __DEV__ ? DEV_URL : PROD_URL,
    TIMEOUT: 15000,
};

export const getApiUrl = (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};
