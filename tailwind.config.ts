import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CSS 변수 기반 컬러 정의 (opacity 변형 지원)
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: {
          1: 'hsl(var(--surface-1) / <alpha-value>)',
          2: 'hsl(var(--surface-2) / <alpha-value>)',
          3: 'hsl(var(--surface-3) / <alpha-value>)',
          4: 'hsl(var(--surface-4) / <alpha-value>)',
        },
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          darker: 'hsl(var(--accent-darker) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          hover: 'hsl(var(--primary-hover) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          darker: 'hsl(var(--success-darker) / <alpha-value>)',
        },
        info: 'hsl(var(--info) / <alpha-value>)',
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          foreground: 'hsl(var(--danger-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          darker: 'hsl(var(--warning-darker) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard Variable', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in': 'slide-in 0.35s ease forwards',
        'slide-out': 'slide-out 0.25s ease forwards',
      },
      boxShadow: {
        soft: '0 10px 40px -15px rgba(15, 23, 42, 0.20)',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant(
        'supports-backdrop',
        '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))',
      )
    }),
    tailwindcssAnimate,
  ],
}

export default config
