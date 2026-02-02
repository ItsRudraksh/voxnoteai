import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../theme/useTheme';
import { formatDuration } from '../utils/formatters';

interface AudioPlayerProps {
  uri: string;
  duration: number;
}

export function AudioPlayer({ uri, duration }: AudioPlayerProps) {
  const { colors } = useTheme();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: duration > 0 ? position / duration : 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [position, duration]);

  const handlePlayPause = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis / 1000);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
              }
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: colors.primary }]}
        onPress={handlePlayPause}
        disabled={isLoading}
      >
        <Ionicons
          name={isLoading ? 'hourglass' : isPlaying ? 'pause' : 'play'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: progressWidth },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatDuration(position)}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatDuration(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
  },
});
