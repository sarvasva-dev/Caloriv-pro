
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../utils/logger';
import { storage } from '../lib/storage';

const QUEUE_KEY = 'OFFLINE_ACTION_QUEUE';

export interface QueuedAction {
    id: string;
    type: 'SYNC_LOG' | 'UPDATE_PROFILE' | 'SYNC_STREAK';
    payload: any;
    timestamp: number;
    retryCount: number;
}

class OfflineQueueService {
    private queue: QueuedAction[] = [];
    private isProcessing = false;
    private executeActionHandler: ((action: QueuedAction) => Promise<boolean>) | null = null;

    async init() {
        await this.loadQueue();

        // Listen for connection changes
        NetInfo.addEventListener(state => {
            if (state.isConnected && this.queue.length > 0) {
                this.processQueue();
            }
        });
    }

    private async loadQueue() {
        try {
            const stored = await storage.getString(QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
            }
        } catch (e) {
            logger.error('Failed to load offline queue', e);
        }
    }

    private async saveQueue() {
        try {
            await storage.set(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (e) {
            logger.error('Failed to save offline queue', e);
        }
    }

    async enqueue(type: QueuedAction['type'], payload: any) {
        const action: QueuedAction = {
            id: Date.now().toString() + Math.random().toString(),
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0
        };

        this.queue.push(action);
        await this.saveQueue();

        // Try prompt processing if online
        const state = await NetInfo.fetch();
        if (state.isConnected) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        logger.info(`[OfflineQueue] Processing ${this.queue.length} items...`);

        const remainingQueue: QueuedAction[] = [];

        for (const action of this.queue) {
            try {
                const success = await this.executeAction(action);
                if (!success) {
                    action.retryCount++;
                    if (action.retryCount < 5) { // Give up after 5 tries
                        remainingQueue.push(action);
                    }
                }
            } catch (e) {
                logger.error(`[OfflineQueue] Failed action ${action.type}`, e);
                remainingQueue.push(action);
            }
        }

        this.queue = remainingQueue;
        await this.saveQueue();
        this.isProcessing = false;
    }

    private async executeAction(action: QueuedAction): Promise<boolean> {
        if (this.executeActionHandler) {
            return this.executeActionHandler(action);
        }
        return false;
    }

    // Getter for the Context to inject the processor
    setProcessor(processor: (action: QueuedAction) => Promise<boolean>) {
        this.executeActionHandler = processor;
    }
}

export const offlineQueue = new OfflineQueueService();
