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
        'wave-slow': {
          '0%, 100%': { transform: 'translateY(-10%) scale(1) rotate(0deg)' },
          '50%': { transform: 'translateY(10%) scale(1.1) rotate(5deg)' },
        },
        'wave-distort': {
          '0%, 100%': { transform: 'translateX(0) scaleX(1) scaleY(1) skewY(0deg)' },
          '25%': { transform: 'translateX(5%) scaleX(1.15) scaleY(0.85) skewY(2deg)' },
          '50%': { transform: 'translateX(0) scaleX(0.85) scaleY(1.15) skewY(0deg)' },
          '75%': { transform: 'translateX(-5%) scaleX(1.15) scaleY(0.85) skewY(-2deg)' },
        },
        'wave-distort-reverse': {
          '0%, 100%': { transform: 'translateX(0) scaleX(1) scaleY(1) skewY(0deg)' },
          '25%': { transform: 'translateX(-5%) scaleX(1.15) scaleY(0.85) skewY(-2deg)' },
          '50%': { transform: 'translateX(0) scaleX(0.85) scaleY(1.15) skewY(0deg)' },
          '75%': { transform: 'translateX(5%) scaleX(1.15) scaleY(0.85) skewY(2deg)' },
        },
        'wave-distort-slow': {
          '0%, 100%': { transform: 'translateX(0) scaleX(1) scaleY(1) skewX(0deg)' },
          '33%': { transform: 'translateX(3%) scaleX(1.08) scaleY(0.92) skewX(1deg)' },
          '66%': { transform: 'translateX(-3%) scaleX(0.92) scaleY(1.08) skewX(-1deg)' },
        },
        'wave-organic': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            borderRadius: '40% 60% 70% 30% / 60% 30% 70% 40%',
          },
          '25%': {
            transform: 'translate(20px, -30px) scale(1.05) rotate(3deg)',
            borderRadius: '50% 50% 60% 40% / 50% 60% 40% 50%',
          },
          '50%': {
            transform: 'translate(0, -50px) scale(0.95) rotate(0deg)',
            borderRadius: '60% 40% 50% 50% / 40% 60% 50% 50%',
          },
          '75%': {
            transform: 'translate(-20px, -30px) scale(1.05) rotate(-3deg)',
            borderRadius: '45% 55% 55% 45% / 55% 45% 55% 45%',
          },
        },
        'wave-organic-reverse': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            borderRadius: '60% 40% 30% 70% / 40% 70% 30% 60%',
          },
          '25%': {
            transform: 'translate(-20px, 30px) scale(1.05) rotate(-3deg)',
            borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%',
          },
          '50%': {
            transform: 'translate(0, 50px) scale(0.95) rotate(0deg)',
            borderRadius: '40% 60% 50% 50% / 60% 40% 50% 50%',
          },
          '75%': {
            transform: 'translate(20px, 30px) scale(1.05) rotate(3deg)',
            borderRadius: '55% 45% 45% 55% / 45% 55% 45% 55%',
          },
        },
        'wave-organic-slow': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          },
          '33%': {
            transform: 'translate(15px, -20px) scale(1.03)',
            borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%',
          },
          '66%': {
            transform: 'translate(-15px, 20px) scale(0.97)',
            borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(-10px) translateX(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        },
        'particle-float': {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-100vh) translateX(20px) scale(0.5)', opacity: '0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in': 'slide-in 0.35s ease forwards',
        'slide-out': 'slide-out 0.25s ease forwards',
        'wave-slow': 'wave-slow 8s ease-in-out infinite',
        'wave-distort': 'wave-distort 10s ease-in-out infinite',
        'wave-distort-reverse': 'wave-distort-reverse 11s ease-in-out infinite',
        'wave-distort-slow': 'wave-distort-slow 15s ease-in-out infinite',
        'wave-organic': 'wave-organic 12s ease-in-out infinite',
        'wave-organic-reverse': 'wave-organic-reverse 14s ease-in-out infinite',
        'wave-organic-slow': 'wave-organic-slow 18s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        'particle-float': 'particle-float 20s linear infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
      animationDelay: {
        1000: '1s',
        2000: '2s',
        3000: '3s',
        4000: '4s',
        5000: '5s',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
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
