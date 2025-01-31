/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          purple: {
            500: '#8B5CF6',
            600: '#7C3AED',
          },
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