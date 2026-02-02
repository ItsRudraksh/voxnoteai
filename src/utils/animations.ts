/**
 * Animation configurations based on design spec
 * All values in ms, easing curves specified
 */

export const animations = {
  // Screen entry animation
  screenEntry: {
    translateY: {
      from: 12,
      to: 0,
    },
    opacity: {
      from: 0,
      to: 1,
    },
    duration: 280,
    // React Native Animated easing equivalent to cubic-bezier(0.22, 1, 0.36, 1)
    // This is a custom ease-out curve
    easing: 'easeOut' as const,
  },

  // Press feedback
  press: {
    scale: {
      from: 1,
      to: 0.97,
    },
    duration: 120,
    easing: 'easeInOut' as const,
  },

  // Recording glow pulse
  glowPulse: {
    scale: {
      from: 1,
      to: 1.08,
    },
    opacity: {
      from: 0.3,
      to: 0.6,
    },
    duration: 2400,
    loop: true,
    easing: 'easeInOut' as const,
  },

  // Fade in
  fadeIn: {
    opacity: {
      from: 0,
      to: 1,
    },
    duration: 200,
    easing: 'easeOut' as const,
  },

  // Slide up
  slideUp: {
    translateY: {
      from: 20,
      to: 0,
    },
    opacity: {
      from: 0,
      to: 1,
    },
    duration: 300,
    easing: 'easeOut' as const,
  },
} as const;

export type Animations = typeof animations;
