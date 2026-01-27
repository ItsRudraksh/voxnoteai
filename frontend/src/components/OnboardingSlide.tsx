import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isLast?: boolean;
  onNext: () => void;
  onSkip?: () => void;
  currentIndex: number;
  totalSlides: number;
}

export function OnboardingSlide({
  icon,
  title,
  description,
  isLast,
  onNext,
  onSkip,
  currentIndex,
  totalSlides,
}: OnboardingSlideProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={icon} size={64} color={colors.primary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array(totalSlides)
            .fill(0)
            .map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
        </View>

        <View style={styles.buttons}>
          {!isLast && onSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={onNext}
          >
            <Text style={styles.nextText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingTop: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    marginLeft: 'auto',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
