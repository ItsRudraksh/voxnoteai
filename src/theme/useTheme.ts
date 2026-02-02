import { useColorScheme } from 'react-native';
import { colors, ThemeColors } from './colors';
import { spacing, Spacing } from './spacing';
import { typography, Typography } from './typography';

export interface Theme {
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  isDark: boolean;
}

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? colors.dark : colors.light,
    spacing,
    typography,
    isDark,
  };
}
