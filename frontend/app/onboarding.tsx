import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/useTheme';
import { useApp } from '../src/contexts/AppContext';
import { OnboardingSlide } from '../src/components/OnboardingSlide';
import { requestAudioPermission } from '../src/services/audio';

const { width } = Dimensions.get('window');

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
  const scrollRef = useRef<ScrollView>(null);

  const handleNext = async () => {
    if (currentIndex === slides.length - 1) {
      // Request microphone permission
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
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    }
  };

  const finishOnboarding = async () => {
    await completeOnboarding();
    router.replace('/home');
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <OnboardingSlide
            key={index}
            icon={slide.icon}
            title={slide.title}
            description={slide.description}
            isLast={index === slides.length - 1}
            onNext={handleNext}
            onSkip={index < slides.length - 1 ? handleSkip : undefined}
            currentIndex={currentIndex}
            totalSlides={slides.length}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
