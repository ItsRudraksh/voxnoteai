/**
 * Typography scale based on design spec
 * Includes size, weight, line height, and opacity per spec
 */
export const typography = {
  hero: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 35,
  },
  
  sectionHeader: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  micro: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  cardTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

export type Typography = typeof typography;
