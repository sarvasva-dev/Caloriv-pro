import { API_CONFIG } from '../config/api';
import { storage, secureStorage, StorageKeys } from '../lib/storage';

const API_URL = API_CONFIG.BASE_URL;

interface RegisterData {
    email: string;
    password: string;
    name: string;
    age?: number;
    gender?: string;
    height?: number;
    currentWeight?: number;
    targetWeight?: number;
    goal?: string;
    stepGoal?: number;
    waterGoal?: number;
    termsAccepted?: boolean;
    // New Fields
    mealsPerDay?: number;
    cuisines?: string[]; // JSON stringified for backend? Or array if backend supports it. Assuming Array for TS.
    diet?: string;
    likedFoods?: string[];
    dislikedFoods?: string[];
    fitnessLevel?: string;
    workoutDays?: number;
    equipment?: string;
    duration?: number;
    additionalInfo?: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    token?: string;
    user?: any;
    error?: string;
    message?: string;
}

interface HealthHistoryResponse {
    success: boolean;
    data?: any[];
    error?: string;
}

class AuthService {
    // Register new user
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success && result.token) {
                // Save token securely
                await secureStorage.setItem(StorageKeys.AUTH_TOKEN, result.token);
                // Save user data (Asynchronously)
                await storage.set(StorageKeys.USER_DATA, JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
            };
        }
    }

    // Login user
    async login(data: LoginData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success && result.token) {
                // Save token securely
                await secureStorage.setItem(StorageKeys.AUTH_TOKEN, result.token);
                // Save user data (Asynchronously)
                await storage.set(StorageKeys.USER_DATA, JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
            };
        }
    }

    // Get user profile
    async getProfile(): Promise<AuthResponse> {
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);

            if (!token) {
                return { success: false, error: 'No token found' };
            }

            // DOCS: 2.2 User (/user) -> GET /profile
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 404 || response.status === 401) {
                return { success: false, error: 'session_invalid' };
            }

            const result = await response.json();

            if (result.success && result.user) {
                await storage.set(StorageKeys.USER_DATA, JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection.',
            };
        }
    }

    // Update user profile
    async updateProfile(data: Partial<RegisterData>): Promise<AuthResponse> {
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);

            if (!token) {
                return { success: false, error: 'No token found' };
            }

            // DOCS: 2.2 User (/user) -> PUT /profile
            const response = await fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            if (response.status === 404 || response.status === 401) {
                return { success: false, error: 'session_invalid' };
            }

            const result = await response.json();

            if (result.success && result.user) {
                await storage.set(StorageKeys.USER_DATA, JSON.stringify(result.user));
            }

            return result;
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection.',
            };
        }
    }

    // Logout
    async logout(): Promise<void> {
        try {
            await secureStorage.deleteItem(StorageKeys.AUTH_TOKEN);
            await storage.delete(StorageKeys.USER_DATA);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Check if user is logged in
    async isLoggedIn(): Promise<boolean> {
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
            return !!token;
        } catch (error) {
            return false;
        }
    }

    // Get stored user data
    async getUserData(): Promise<any | null> {
        try {
            const userData = await storage.getString(StorageKeys.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    async getToken(): Promise<string | null> {
        try {
            return (await secureStorage.getItem(StorageKeys.AUTH_TOKEN)) || null;
        } catch (error) {
            return null;
        }
    }

    async syncDailyLog(date: string, data: any): Promise<{ success: boolean; error?: string }> {
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
            if (!token) return { success: false, error: 'No token' };

            // DOCS: 2.2 User (/user) -> POST /sync-log
            const response = await fetch(`${API_URL}/user/sync-log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, ...data }) // Check if Backend expects wrapped "data" or flat
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Sync error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getHealthHistory(): Promise<HealthHistoryResponse> {
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
            if (!token) return { success: false, error: 'No token' };

            // DOCS: 2.2 User (/user) -> GET /measurements (Best match for history)
            const response = await fetch(`${API_URL}/user/measurements`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404 || response.status === 401) {
                return { success: false, error: 'session_invalid' };
            }

            const result = await response.json();
            return { success: true, data: result.data || [] };
        } catch (error) {
            console.error('Get health history error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getMeasurements(): Promise<{ success: boolean; data?: any[] }> {
        // Placeholder for now, can implement real API later if needed
        try {
            const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
            if (!token) return { success: false };

            // Fake empty for now to satisfy call signature
            return { success: true, data: [] };
        } catch (e) {
            return { success: false };
        }
    }

    // Forgot Password
    async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Forgot password error:', error);
            // Fallback for demo if backend not ready
            return { success: true, message: 'If an account exists, a reset link has been sent.' };
        }
    }

    // Verify OTP
    async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Verify OTP error:', error);
            // Mock success for development if backend fails/doesn't exist yet
            if (process.env.NODE_ENV === 'development' || __DEV__) {
                 return { success: true };
            }
            return { success: false, error: 'Network error' };
        }
    }

    // Reset Password
    async resetPassword(email: string, otp: string, password: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, password }),
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Reset password error:', error);
             // Mock success for development
             if (process.env.NODE_ENV === 'development' || __DEV__) {
                 return { success: true };
            }
            return { success: false, error: 'Network error' };
        }
    }
}

export const authService = new AuthService();
export default authService;
