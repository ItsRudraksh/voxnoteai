import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/useTheme';
import { useApp } from '../src/contexts/AppContext';
import { RecordButton } from '../src/components/RecordButton';
import {
  startRecording,
  stopRecording,
  cancelRecording,
  checkAudioPermission,
  requestAudioPermission,
  getRecordingStatus,
} from '../src/services/audio';
import { processAudioWithDeepgram } from '../src/services/deepgram';

type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { notes, addNote } = useApp();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = useCallback(() => {
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleRecordPress = async () => {
    if (recordingState === 'recording') {
      // Stop recording
      stopTimer();
      setRecordingState('processing');

      const result = await stopRecording();

      if (!result.success || !result.uri) {
        setError(result.error || 'Failed to save recording');
        setRecordingState('error');
        return;
      }

      // Process with Deepgram
      const processResult = await processAudioWithDeepgram(result.uri);

      if (!processResult.success || !processResult.note) {
        setError(processResult.error || 'Failed to process audio');
        setRecordingState('error');
        return;
      }

      // Save the note
      await addNote(processResult.note);

      // Reset state and navigate to note detail
      setRecordingState('idle');
      setDuration(0);
      router.push(`/note/${processResult.note.id}`);
    } else if (recordingState === 'idle' || recordingState === 'error') {
      // Start recording
      setError(undefined);

      // Check permission
      const hasPermission = await checkAudioPermission();
      if (!hasPermission) {
        const granted = await requestAudioPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Microphone access is needed to record voice notes.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const result = await startRecording();

      if (!result.success) {
        setError(result.error);
        setRecordingState('error');
        return;
      }

      setRecordingState('recording');
      startTimer();
    }
  };

  const handleTimelinePress = () => {
    router.push('/timeline');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.appName, { color: colors.text }]}>VoxNote</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>
            Voice to insight
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.timelineButton, { backgroundColor: colors.surface }]}
          onPress={handleTimelinePress}
        >
          <Ionicons name="list-outline" size={22} color={colors.text} />
          {notes.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{notes.length > 99 ? '99+' : notes.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <RecordButton
          state={recordingState}
          duration={duration}
          onPress={handleRecordPress}
          errorMessage={error}
        />
      </View>

      {/* Footer hint */}
      <View style={styles.footer}>
        {recordingState === 'idle' && notes.length === 0 && (
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Create your first voice note
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 14,
    marginTop: 2,
  },
  timelineButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});
