/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1340px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Indian Tiranga Inspired Tones
        saffron: {
          DEFAULT: 'hsl(var(--saffron))',
          foreground: 'hsl(var(--saffron-foreground))',
          50: 'hsl(34 100% 96%)',
          100: 'hsl(34 100% 90%)',
          400: 'hsl(30 96% 62%)',
          500: 'hsl(28 95% 54%)',
          600: 'hsl(24 90% 48%)',
        },
        indiaGreen: {
          DEFAULT: 'hsl(var(--india-green))',
          foreground: 'hsl(var(--india-green-foreground))',
          50: 'hsl(142 60% 96%)',
          100: 'hsl(142 55% 90%)',
          400: 'hsl(142 70% 50%)',
          500: 'hsl(142 72% 40%)',
          600: 'hsl(142 76% 32%)',
        },
        // Masked token neon accent
        neon: {
          DEFAULT: 'hsl(var(--neon))',
          foreground: 'hsl(var(--neon-foreground))',
          dim: 'hsl(var(--neon-dim))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        headline: ['"Inter Tight"', 'sans-serif'],
        ui: ['"Chakra Petch"', 'monospace'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['"Chakra Petch"', 'JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
      },
      boxShadow: {
        'neon-glow': '0 0 20px -2px hsl(var(--neon) / 0.4), 0 0 8px hsl(var(--neon) / 0.3)',
        'saffron-glow': '0 0 24px -4px hsl(var(--saffron) / 0.35)',
        'green-glow': '0 0 24px -4px hsl(var(--india-green) / 0.35)',
        'security-card': '0 12px 40px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px hsl(var(--border))',
      },
    },
  },
  plugins: [],
};
