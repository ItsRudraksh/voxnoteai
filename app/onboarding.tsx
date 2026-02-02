import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../src/theme/useTheme';
import { useApp } from '../src/contexts/AppContext';
import { requestAudioPermission } from '../src/services/audio';
import { AuroraBackground } from '../src/components/AuroraBackground';

interface Slide {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    icon: 'mic-outline',
    title: 'Capture Your Thoughts',
    description: 'Speak naturally and let AI transform your voice into organized notes. No typing required.',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI-Powered Intelligence',
    description: 'Automatic summaries, topics, and sentiment analysis. Understand your thoughts at a glance.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Privacy First',
    description: 'Your notes stay on your device. No accounts, no cloud sync. Your thoughts are yours alone.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  const currentSlide = slides[currentIndex];
  const isLast = currentIndex === slides.length - 1;

  const handleNext = async () => {
    if (isLast) {
      // Request microphone permission on last slide
      const hasPermission = await requestAudioPermission();
      
      if (!hasPermission) {
        Alert.alert(
          'Microphone Access Required',
          'VoxNote needs microphone access to record your voice notes. Please enable it in your device settings.',
          [
            { text: 'Skip for Now', onPress: finishOnboarding },
            { text: 'OK', onPress: finishOnboarding },
          ]
        );
      } else {
        finishOnboarding();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const finishOnboarding = async () => {
    await completeOnboarding();
    router.replace('/home');
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  return (
    <AuroraBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Content */}
        <View style={styles.content}>
          {/* Icon without background - floating on aurora */}
          <View style={styles.iconContainer}>
            <Ionicons name={currentSlide.icon} size={72} color={colors.primary} />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>{currentSlide.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {currentSlide.description}
          </Text>
        </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLast && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.nextButtonWrapper}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.micGradientStart, colors.micGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextText}>
                {isLast ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.75,
  },
  footer: {
    paddingTop: 24,
    paddingBottom: 20,
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
    opacity: 0.55,
  },
  nextButtonWrapper: {
    marginLeft: 'auto',
    borderRadius: 30,
    shadowColor: 'rgba(139, 92, 246, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
