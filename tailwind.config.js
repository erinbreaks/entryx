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
        background: '#0B0D13',
        surface: '#121622',
        'surface-elevated': '#1A1F30',
        'surface-border': '#262D42',
        brand: {
          gold: '#E5A93C',
          'gold-light': '#F5BE58',
          'gold-dark': '#C98D23',
          'gold-muted': 'rgba(229, 169, 60, 0.15)',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5EDDD',
          300: '#EADBBF',
          muted: '#9CA3AF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ticket-pattern': 'radial-gradient(circle at 10px 10px, rgba(229, 169, 60, 0.05) 2px, transparent 0)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
