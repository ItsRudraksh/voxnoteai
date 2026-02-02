import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

/**
 * Premium glassmorphism component
 * Implements 6-layer stack per design spec:
 * 1. Backdrop blur (18-24)
 * 2. Glass fill (opacity 0.12-0.16)
 * 3. Optional noise texture
 * 4. Inner highlight gradient
 * 5. Border stroke (1px, opacity ~0.14)
 * 6. Ambient glow shadow
 */
interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: number;        // Blur intensity (default 20)
  fillOpacity?: number;      // Glass fill opacity (default 0.14)
  borderRadius?: number;     // Border radius (default 24)
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  fillOpacity = 0.14,
  borderRadius = 24,
}: GlassCardProps) {
  const { colors } = useTheme();

  // iOS supports BlurView, Android has limited support
  const useBlur = Platform.OS === 'ios';

  if (useBlur) {
    return (
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.container,
          {
            borderRadius,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        {/* Glass fill layer */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.glassFill,
              borderRadius,
            },
          ]}
        />
        
        {/* Inner highlight gradient */}
        <LinearGradient
          colors={[colors.glassHighlight, 'transparent']}
          locations={[0, 0.5]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              opacity: 0.6,
            },
          ]}
          pointerEvents="none"
        />
        
        {/* Content */}
        <View style={styles.content}>{children}</View>
      </BlurView>
    );
  }

  // Fallback for Android - no blur, heavier fill
  return (
    <View
      style={[
        styles.container,
        styles.shadow,
        {
          backgroundColor: `rgba(255, 255, 255, ${fillOpacity * 1.5})`,
          borderRadius,
          borderWidth: 1,
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      {/* Inner highlight gradient */}
      <LinearGradient
        colors={[colors.glassHighlight, 'transparent']}
        locations={[0, 0.5]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            opacity: 0.5,
          },
        ]}
        pointerEvents="none"
      />
      
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  shadow: {
    shadowColor: 'rgba(139, 92, 246, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 8,
  },
});
