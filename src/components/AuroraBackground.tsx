import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/useTheme';

/**
 * Volumetric multi-gradient background component
 * Implements 4 stacked radial gradients forming a central light source
 * Per design spec from reference
 */
interface AuroraBackgroundProps {
  children?: React.ReactNode;
}

const { width, height } = Dimensions.get('window');

export function AuroraBackground({ children }: AuroraBackgroundProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Base Layer - Solid dark indigo */}
      <View style={[styles.baseLayer, { backgroundColor: colors.background }]} />
      
      {/* Gradient A — Core Glow (Cyan → Blue) */}
      <LinearGradient
        colors={[colors.gradientCyan, colors.gradientBlue, 'transparent']}
        locations={[0, 0.4, 1]}
        style={[
          styles.gradient,
          {
            width: 360,
            height: 360,
            borderRadius: 180,
            opacity: 0.35,
            top: height * 0.52 - 180,
            left: width * 0.5 - 180,
          },
        ]}
      />
      
      {/* Gradient B — Mid Halo (Violet) */}
      <LinearGradient
        colors={[colors.gradientViolet, 'transparent']}
        locations={[0, 1]}
        style={[
          styles.gradient,
          {
            width: 460,
            height: 460,
            borderRadius: 230,
            opacity: 0.25,
            top: height * 0.55 - 230,
            left: width * 0.48 - 230,
          },
        ]}
      />
      
      {/* Gradient C — Warm Diffusion (Magenta) */}
      <LinearGradient
        colors={[colors.gradientMagenta, 'transparent']}
        locations={[0, 1]}
        style={[
          styles.gradient,
          {
            width: 560,
            height: 560,
            borderRadius: 280,
            opacity: 0.20,
            top: height * 0.58 - 280,
            left: width * 0.52 - 280,
          },
        ]}
      />
      
      {/* Gradient D — Ambient Fill (Purple) */}
      <LinearGradient
        colors={[colors.gradientPurple, 'transparent']}
        locations={[0, 1]}
        style={[
          styles.gradient,
          {
            width: 700,
            height: 700,
            borderRadius: 350,
            opacity: 0.12,
            top: height * 0.65 - 350,
            left: width * 0.5 - 350,
          },
        ]}
      />
      
      {/* Vignette — Dark edges */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
        locations={[0.3, 1]}
        style={styles.vignette}
      />
      
      {/* Content */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    // Note: React Native doesn't support CSS blur directly
    // The blur effect is approximated through opacity layering
    // For true blur, would need to use react-native-blur on native views
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
});
