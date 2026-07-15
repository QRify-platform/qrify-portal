/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bone: '#f3f4f6',
        chalk: '#e6e8ec',
        soot: '#07080b',
        slate: '#151820',
        steel: '#5c6370',
        acid: '#00f0c8',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulsebar: {
          '0%, 100%': { transform: 'scaleX(0.35)', opacity: '0.45' },
          '50%': { transform: 'scaleX(1)', opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'rise-2': 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'rise-3': 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'rise-4': 'rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        pulsebar: 'pulsebar 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
