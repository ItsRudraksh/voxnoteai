import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/useTheme';

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
}

export function Waveform({ isActive, barCount = 5 }: WaveformProps) {
  const { colors } = useTheme();
  const animatedValues = useRef(
    Array(barCount).fill(0).map(() => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      const animations = animatedValues.map((anim, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: 150 + Math.random() * 150,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 150 + Math.random() * 150,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
      });

      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * 50);
      });

      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      animatedValues.forEach(anim => {
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {animatedValues.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: isActive ? colors.recording : colors.waveform,
              transform: [{ scaleY: anim }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 40,
  },
  bar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
});
