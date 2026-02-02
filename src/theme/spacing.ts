/**
 * Spacing system based on design spec
 * All values in pixels matching reference design numerics
 */
export const spacing = {
  // Global spacing
  screen: 24,        // Global horizontal/vertical padding
  card: 16,          // Card internal padding
  section: 32,       // Section spacing
  cardGap: 12,       // Gap between grid cards
  
  // Border radii
  borderRadius: {
    sm: 14,          // Icon container, pill buttons
    md: 20,          // Chat bubbles
    lg: 24,          // Cards
    xl: 28,          // Bottom nav bar
    full: 32,        // Mic button (fully circular)
  },
  
  // Component-specific
  bottomNav: {
    height: 76,
    horizontalMargin: 16,
    bottomOffset: 12,
    radius: 28,
  },
  
  micButton: {
    size: 64,
    radius: 32,
    glowRadius: 28,
  },
  
  iconContainer: {
    size: 28,
    radius: 14,
  },
  
  chatBubble: {
    maxWidth: '78%',
    padding: 14,
    radius: 20,
  },
  
  voiceMessage: {
    height: 44,
    playButtonSize: 28,
  },
} as const;

export type Spacing = typeof spacing;
