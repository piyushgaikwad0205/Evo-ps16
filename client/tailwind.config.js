/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  darkMode: 'class',
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "4rem",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      ringWidth: {
        3: "3px",
      },
      boxShadow: {
        "3xl": "-1px 34px 47px -29px rgb(32 32 32 / 100%)",
        "4xl": " 0vw 0vw 0.5vw 0vw rgb(32 32 32 / 20%)",
        "5xl": " 0vw 0.5vw 0.5vw 0vw rgb(32 32 32 / 16%)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-card": "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
        "card-shadow": "0 10px 40px -10px rgba(0,0,0,0.08)",
        "dark-shadow": "0 10px 40px -10px rgba(0,0,0,0.3)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.5)",
      },

      colors: {
        background: {
          DEFAULT: "#F9FAFB",
          200: "#EDF1F7",
          300: "#E5E7EB",
          dark: "#000000",
          "dark-200": "#121212",
          "dark-300": "#262626",
        },
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#9333EA",
        },
        accent: {
          DEFAULT: "#10B981",
        },
        slate: {
          25: "#F8FAFC",
        },
        dark: {
          bg: "#000000",
          "bg-secondary": "#121212",
          "bg-tertiary": "#262626",
          text: "#F8FAFC",
          "text-secondary": "#94A3B8",
          border: "#262626",
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },

  plugins: [],
};
