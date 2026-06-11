/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--bg-page)',
          panel: 'var(--bg-panel)',
          input: 'var(--bg-input)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          border: 'var(--border-color)',
          'border-input': 'var(--border-input)',
          accent: 'var(--accent)',
          'accent-fg': 'var(--accent-fg)',
        },
        // Atalho para alto contraste
        hc: {
          DEFAULT: '#ffff00', // amarelo neon
          bg: '#000000',
        }
      },
      // Opacidade de borda e cores padrão
      borderColor: {
        DEFAULT: 'var(--border-color)', 
        theme: 'var(--border-color)',
        input: 'var(--border-input)',
      },
    },
  },
  plugins: [],
}
