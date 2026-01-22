import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { logger } from '../utils/logger';

export interface NotificationLog {
    id: string;
    title: string;
    body: string;
    timestamp: number;
    type: 'water' | 'food' | 'workout' | 'general';
    read: boolean;
}

const HISTORY_KEY = 'notification_history';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

export const notificationService = {
    // 1. Setup & Permissions
    async setup() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            logger.info('Failed to get push token for push notification!');
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        return true;
    },

    // 2. Send Local Notification
    async send(title: string, body: string, type: NotificationLog['type'] = 'general') {
        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                data: { type },
            },
            trigger: null, // Instant
        });

        // Save to History
        await this.logNotification(title, body, type);
    },

    // 3. Log to History
    async logNotification(title: string, body: string, type: NotificationLog['type']) {
        try {
            const newLog: NotificationLog = {
                id: Date.now().toString(),
                title,
                body,
                timestamp: Date.now(),
                type,
                read: false,
            };

            const existingJson = await AsyncStorage.getItem(HISTORY_KEY);
            const existing: NotificationLog[] = existingJson ? JSON.parse(existingJson) : [];

            // Keep last 50 notifications
            const updated = [newLog, ...existing].slice(0, 50);

            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (error) {
            logger.error('Failed to save notification history:', error);
        }
    },

    // 4. Get History
    async getHistory(): Promise<NotificationLog[]> {
        try {
            const json = await AsyncStorage.getItem(HISTORY_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            return [];
        }
    },

    // 5. Clear History
    async clearHistory() {
        await AsyncStorage.removeItem(HISTORY_KEY);
    },

    // 6. Schedule Smart Reminder (Example)
    async scheduleReminder(title: string, body: string, seconds: number) {
        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: { seconds, repeats: false } as any
        });
    },

    // 7. Schedule Daily Water Reminders
    async scheduleDailyWaterReminders() {
        // Cancel existing to avoid duplicates
        await Notifications.cancelAllScheduledNotificationsAsync();

        const reminders = [
            { hour: 10, msg: "Morning hydration boost! 💧" },
            { hour: 12, msg: "Have a glass of water before lunch. 🥤" },
            { hour: 14, msg: "Stay sharp, drink water! ⚡" },
            { hour: 16, msg: "Afternoon slump? Water helps. 💧" },
            { hour: 18, msg: "Hydrate before dinner. 🥗" },
            { hour: 20, msg: "One last sip for the day. 🌙" }
        ];

        for (const rem of reminders) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Hydration Reminder",
                    body: rem.msg,
                    sound: true,
                    data: { type: 'water' }
                },
                trigger: {
                    hour: rem.hour,
                    minute: 0,
                    repeats: true
                } as any
            });
        }
        logger.info('✅ Daily Water Reminders Scheduled');
    },

    // 8. Streak Protection Reminder (9 PM)
    async scheduleStreakReminder(currentStreak: number) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔥 Streak Danger!",
                body: `You are on a ${currentStreak}-day streak! Don't let it die. Log your activity now!`,
                sound: true,
                data: { type: 'general' }
            },
            trigger: {
                hour: 21, // 9 PM
                minute: 0,
                repeats: true
            } as any
        });
    }
};
