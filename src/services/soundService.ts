import { Audio } from 'expo-av';
import { logger } from '../utils/logger';

// Map of sound names to required assets
// Note: These need to be present in assets/sounds/
const SOUND_FILES = {
    // TODO: Add actual MP3 files to assets/sounds/ and uncomment these lines
    // success: require('../../assets/sounds/success.mp3'), // TBD: Add file
    // error: require('../../assets/sounds/error.mp3'),     // TBD: Add file
    // pop: require('../../assets/sounds/pop.mp3'),         // TBD: Add file
    // complete: require('../../assets/sounds/complete.mp3'), // TBD: Add file

    // Placeholders to prevent build errors until files exist
    success: null,
    error: null,
    pop: null,
    complete: null,
};

type SoundName = keyof typeof SOUND_FILES;

class SoundService {
    private sounds: Record<string, Audio.Sound> = {};

    async setup() {
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });
            // We could preload sounds here if we want instant playback
        } catch (e) {
            logger.warn('Error setting up audio', e);
        }
    }

    async play(name: SoundName) {
        try {
            // In a real app with missing assets, we must wrap require in try/catch or check existence
            // Since we are mocking the existence for now, we will add a safety check
            // For now, we will assume assets might be missing and wrap strict logic

            // Dynamic require is tricky in RN. We usually rely on the static map above.
            // If the file doesn't exist, the bundler usually warns/errors. 
            // For this implementation, we assume the user will add the files.
            // To prevent runtime crashes if files are missing, we can try/catch the load.

            const asset = SOUND_FILES[name];
            if (!asset) {
                // logger.debug(`[SoundService] Sound file missing for: ${name}`);
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                asset,
                { shouldPlay: true }
            );

            // Auto-unload after playback to free memory
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.isLoaded && status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });

        } catch (error) {
            // Use this logger to debug if sounds are missing
            // console.log(`[SoundService] Would play: ${name} (File missing or load failed)`); 
        }
    }
}

export const soundService = new SoundService();
