/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border-default))",
        input: "hsl(var(--border-default))",
        ring: "hsl(var(--accent-primary))",
        background: "hsl(var(--bg-app))",
        foreground: "hsl(var(--text-primary))",
        primary: {
          DEFAULT: "hsl(var(--accent-primary))",
          foreground: "hsl(var(--bg-surface))",
        },
        secondary: {
          DEFAULT: "hsl(var(--accent-secondary))",
          foreground: "hsl(var(--bg-surface))",
        },
        destructive: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--bg-surface))",
        },
        muted: {
          DEFAULT: "hsl(var(--bg-elevated))",
          foreground: "hsl(var(--text-secondary))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-primary))",
          foreground: "hsl(var(--bg-surface))",
        },
        card: {
          DEFAULT: "hsl(var(--bg-surface))",
          foreground: "hsl(var(--text-primary))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(var(--accent-primary)) 0%, hsl(var(--accent-secondary)) 100%)',
      },
    },
  },
  plugins: [],
}
