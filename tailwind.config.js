/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan JS/TS files in src for classes
  ],
  darkMode: 'class', // Keep dark mode setting if needed, or remove if handled by CSS vars only
  theme: {
    container: { center: true, padding: { DEFAULT: '1rem', sm: '2rem', lg: '4rem', xl: '5rem' } },
    extend: {
        // Explicitly map CSS variables to Tailwind theme keys
        colors: {
            background: 'var(--background)',
            foreground: 'var(--foreground)',
            card: 'var(--card)',
            'card-foreground': 'var(--card-foreground)',
            primary: {
                DEFAULT: 'var(--primary)',
                foreground: 'var(--primary-foreground)'
            },
            secondary: {
                DEFAULT: 'var(--secondary)',
                foreground: 'var(--secondary-foreground)'
            },
            border: 'var(--border)',
            input: 'var(--input)',
            ring: 'var(--ring)',
        },
        fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
            serif: ['Merriweather', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
            heading: ['"Cinzel Decorative"', 'serif'],
        },
        borderRadius: {
            lg: `var(--radius)`,
            md: `calc(var(--radius) - 2px)`,
            sm: "calc(var(--radius) - 4px)",
        },
    },
  },
  plugins: [],
} 