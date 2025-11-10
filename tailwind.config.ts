import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
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
