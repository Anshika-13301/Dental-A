/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        border: '#E4E4E7',
        primary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          light: '#F1F5F9'
        },
        teal: {
          DEFAULT: '#0284C7',
          hover: '#0369A1',
          light: '#F0F9FF'
        },
        success: {
          DEFAULT: '#059669',
          bg: '#ECFDF5',
          border: '#A7F3D0'
        },
        warning: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
          border: '#FDE68A'
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEF2F2',
          border: '#FECACA'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      }
    }
  },
  plugins: []
};
