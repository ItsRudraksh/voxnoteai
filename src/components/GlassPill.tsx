import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

/**
 * Glass pill button for filters/tabs
 * Compact glassmorphism component with optional active state
 */
interface GlassPillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GlassPill({ label, active = false, onPress, style }: GlassPillProps) {
  const { colors, spacing } = useTheme();

  const useBlur = Platform.OS === 'ios';
  const fillOpacity = active ? 0.22 : 0.14;

  if (useBlur) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
        <BlurView
          intensity={active ? 25 : 18}
          tint="dark"
          style={[
            styles.container,
            {
              borderRadius: spacing.borderRadius.sm,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.glassBorder,
              overflow: 'hidden',
            },
          ]}
        >
          {/* Glass fill */}
          <LinearGradient
            colors={
              active
                ? [`${colors.primary}30`, `${colors.primary}20`]
                : [colors.glassFill, 'transparent']
            }
            locations={[0, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          
          {/* Label */}
          <Text
            style={[
              styles.label,
              {
                color: active ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            {label}
          </Text>
        </BlurView>
      </TouchableOpacity>
    );
  }

  // Android fallback
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: active
            ? `${colors.primary}40`
            : `rgba(255, 255, 255, ${fillOpacity})`,
          borderRadius: spacing.borderRadius.sm,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.glassBorder,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: active ? colors.primary : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
