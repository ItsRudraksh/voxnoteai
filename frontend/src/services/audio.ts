import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

/** Unique ID for local filenames (RN doesn't have crypto.getRandomValues). */
function uniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export interface RecordingResult {
  success: boolean;
  uri?: string;
  duration?: number;
  error?: string;
}

let recording: Audio.Recording | null = null;

export async function requestAudioPermission(): Promise<boolean> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  } catch (error) {
    console.error('Error requesting audio permission:', error);
    return false;
  }
}

export async function checkAudioPermission(): Promise<boolean> {
  try {
    const permission = await Audio.getPermissionsAsync();
    return permission.granted;
  } catch (error) {
    console.error('Error checking audio permission:', error);
    return false;
  }
}

export async function startRecording(): Promise<{ success: boolean; error?: string }> {
  try {
    // Check permission
    const hasPermission = await checkAudioPermission();
    if (!hasPermission) {
      const granted = await requestAudioPermission();
      if (!granted) {
        return { success: false, error: 'Microphone permission denied' };
      }
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create and start recording
    // createAsync(options, onRecordingStatusUpdate?, progressUpdateIntervalMillis?)
    const { recording: newRecording } = await Audio.Recording.createAsync(
      {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      },
      null, // onRecordingStatusUpdate (optional callback)
      100   // progressUpdateIntervalMillis
    );

    recording = newRecording;
    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to start recording' };
  }
}

export async function stopRecording(): Promise<RecordingResult> {
  try {
    if (!recording) {
      return { success: false, error: 'No active recording' };
    }

    const status = await recording.getStatusAsync();
    const duration = status.durationMillis ? status.durationMillis / 1000 : 0;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (!uri) {
      return { success: false, error: 'Failed to get recording URI' };
    }

    // Move to permanent storage
    const audioDir = `${FileSystem.documentDirectory}audio/`;
    const dirInfo = await FileSystem.getInfoAsync(audioDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(audioDir, { intermediates: true });
    }

    const fileName = `${uniqueId()}.wav`;
    const newUri = `${audioDir}${fileName}`;
    await FileSystem.moveAsync({ from: uri, to: newUri });

    return { success: true, uri: newUri, duration };
  } catch (error) {
    console.error('Error stopping recording:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to stop recording' };
  }
}

export async function cancelRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recording = null;
      
      // Delete the temporary file
      if (uri) {
        try {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch {}
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    }
  } catch (error) {
    console.error('Error canceling recording:', error);
  }
}

export function getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
  if (!recording) return Promise.resolve(null);
  return recording.getStatusAsync();
}

export async function playAudio(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    return sound;
  } catch (error) {
    console.error('Error playing audio:', error);
    return null;
  }
}

export async function deleteAudioFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
}
