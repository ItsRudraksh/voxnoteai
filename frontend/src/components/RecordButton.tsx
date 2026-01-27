import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { Waveform } from './Waveform';
import { formatDuration } from '../utils/formatters';

type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface RecordButtonProps {
  state: RecordingState;
  duration: number;
  onPress: () => void;
  errorMessage?: string;
}

export function RecordButton({ state, duration, onPress, errorMessage }: RecordButtonProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getButtonColor = () => {
    switch (state) {
      case 'recording':
        return colors.recording;
      case 'processing':
        return colors.primary;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (state) {
      case 'recording':
        return 'stop';
      case 'processing':
        return 'hourglass';
      default:
        return 'mic';
    }
  };

  const isDisabled = state === 'processing';

  return (
    <View style={styles.container}>
      {/* Status text above button */}
      <View style={styles.statusContainer}>
        {state === 'recording' && (
          <>
            <View style={[styles.recordingDot, { backgroundColor: colors.recording }]} />
            <Text style={[styles.statusText, { color: colors.recording }]}>
              Recording
            </Text>
          </>
        )}
        {state === 'processing' && (
          <Text style={[styles.statusText, { color: colors.primary }]}>
            Processing...
          </Text>
        )}
        {state === 'error' && errorMessage && (
          <Text style={[styles.statusText, { color: colors.error }]}>
            {errorMessage}
          </Text>
        )}
      </View>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <Waveform isActive={state === 'recording'} barCount={7} />
      </View>

      {/* Timer */}
      {(state === 'recording' || state === 'processing') && (
        <Text style={[styles.timer, { color: colors.text }]}>
          {formatDuration(duration)}
        </Text>
      )}

      {/* Main button with pulse effect */}
      <View style={styles.buttonWrapper}>
        {state === 'recording' && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: colors.recording,
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [0.3, 0],
                }),
              },
            ]}
          />
        )}
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: getButtonColor() },
              isDisabled && styles.buttonDisabled,
            ]}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDisabled}
            activeOpacity={0.9}
          >
            <Ionicons name={getIcon()} size={40} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Hint text */}
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {state === 'idle' && 'Tap to start recording'}
        {state === 'recording' && 'Tap to stop'}
        {state === 'processing' && 'Understanding your thoughts...'}
        {state === 'error' && 'Tap to try again'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    marginBottom: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  waveformContainer: {
    height: 50,
    marginBottom: 16,
  },
  timer: {
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    marginBottom: 32,
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  hint: {
    fontSize: 14,
  },
});
