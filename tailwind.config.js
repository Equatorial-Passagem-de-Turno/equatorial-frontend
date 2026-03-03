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
          border: 'var(--border-color)', // Essa é a mágica
          'border-input': 'var(--border-input)',
          accent: 'var(--accent)',
          'accent-fg': 'var(--accent-fg)',
        },
        // Atalho para High Contrast direto se precisar
        hc: {
          DEFAULT: '#ffff00', // Amarelo Neon
          bg: '#000000',
        }
      },
      // Estende a opacidade da borda e cores padrão
      borderColor: {
        DEFAULT: 'var(--border-color)', 
        theme: 'var(--border-color)',
        input: 'var(--border-input)',
      },
    },
  },
  plugins: [],
}