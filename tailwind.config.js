/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          space: ['Space Grotesk', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        colors: {
          purple: {
            500: '#8B5CF6',
            600: '#7C3AED',
          },
          tech: {
            accent: '#00FFB2',
            secondary: '#FF3864',
            dark: '#0A0A0F',
            light: '#E2E8F0'
          }
        },
        backgroundImage: {
          'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
          'gradient-dark': 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.95))',
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
  }