import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useApp } from '../src/contexts/AppContext';
import { useTheme } from '../src/theme/useTheme';

export default function Index() {
  const router = useRouter();
  const { isOnboarded, isLoading } = useApp();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on onboarding status
      if (isOnboarded) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, isOnboarded]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
