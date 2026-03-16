/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#141414',
        surface2: '#1E1E1E',
        border: '#2A2A2A',
        primary: '#C85A1E',
        'primary-light': '#E8784A',
        secondary: '#1A5C47',
        text: '#F5F0E8',
        muted: '#7A7268',
        danger: '#C0392B',
      },
      fontFamily: {
        heading: ['"Outfit"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'opale-gradient': 'radial-gradient(ellipse at 20% 20%, rgba(200,90,30,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(26,92,71,0.12) 0%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
