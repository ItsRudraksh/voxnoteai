import { useColorScheme } from 'react-native';
import { colors, ThemeColors } from './colors';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? colors.dark : colors.light,
    isDark,
  };
}
