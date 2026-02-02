export const colors = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceAlt: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',
    accent: '#8b5cf6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    recording: '#ef4444',
    waveform: '#6366f1',
    
    // Volumetric Background Gradients (lighter versions for light mode)
    gradientCyan: 'hsl(195, 80%, 60%)',
    gradientBlue: 'hsl(220, 65%, 55%)',
    gradientViolet: 'hsl(260, 65%, 60%)',
    gradientMagenta: 'hsl(320, 70%, 65%)',
    gradientPurple: 'hsl(280, 60%, 55%)',
    
    // Glassmorphism System
    glassFill: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
    glassHighlight: 'rgba(255, 255, 255, 0.9)',
    glassGlow: 'rgba(139, 92, 246, 0.15)',
    
    // Mic Button Gradient
    micGradientStart: '#8B5CF6',
    micGradientEnd: '#EC4899',
  },
  dark: {
    // Base colors - Deep indigo-violet background
    background: 'hsl(245, 22%, 7%)',        // Deep indigo-violet base
    surface: 'rgba(255, 255, 255, 0.05)',   // Subtle surface
    surfaceAlt: 'rgba(255, 255, 255, 0.08)',
    
    // Text colors - Never pure white
    text: 'rgba(248, 250, 252, 0.92)',      // ~92% white
    textSecondary: 'rgba(248, 250, 252, 0.75)',
    textMuted: 'rgba(248, 250, 252, 0.55)',
    
    // Primary colors
    border: 'rgba(255, 255, 255, 0.1)',
    primary: '#818cf8',
    primaryLight: '#a5b4fc',
    primaryDark: '#6366f1',
    accent: '#a78bfa',
    success: '#34d399',
    error: '#f87171',
    warning: '#fbbf24',
    recording: '#f87171',
    waveform: '#818cf8',
    
    // Volumetric Background Gradients
    gradientCyan: 'hsl(195, 90%, 55%)',     // Core glow center (cyan/teal)
    gradientBlue: 'hsl(220, 70%, 45%)',     // Core glow mid (blue)
    gradientViolet: 'hsl(260, 75%, 50%)',   // Mid halo (violet)
    gradientMagenta: 'hsl(320, 80%, 55%)',  // Warm diffusion (magenta/pink)
    gradientPurple: 'hsl(280, 70%, 45%)',   // Ambient fill (purple)
    
    // Glassmorphism System
    glassFill: 'rgba(255, 255, 255, 0.14)',       // Semi-transparent fill
    glassBorder: 'rgba(255, 255, 255, 0.14)',     // Border stroke
    glassHighlight: 'rgba(255, 255, 255, 0.18)',  // Inner highlight
    glassGlow: 'rgba(139, 92, 246, 0.25)',        // Ambient glow (purple/blue)
    
    // Mic Button Gradient
    micGradientStart: '#8B5CF6',  // Violet
    micGradientEnd: '#EC4899',    // Pink/Magenta
  },
};

export type ColorScheme = keyof typeof colors;
export type ThemeColors = typeof colors.dark; // Use dark as base since it has all tokens
