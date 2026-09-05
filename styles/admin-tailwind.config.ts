import type { Config } from "tailwindcss";

/**
 * Altrivo Admin — Tailwind Configuration
 * File: tailwind.config.ts
 *
 * Maps every CSS variable from globals.css → Tailwind utility classes.
 * The admin panel is permanently dark — no .dark class toggle needed.
 *
 * Usage examples:
 *   bg-primary-500  text-accent-200  shadow-card  rounded-xl
 *   bg-page  text-heading  border-default  bg-card-elevated
 */

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Primary (Purple) ── */
        primary: {
          50:  "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },

        /* ── Accent (Pink) ── */
        accent: {
          50:  "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
        },

        /* ── Neutrals ── */
        neutral: {
          50:  "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },

        /* ── Semantic ── */
        success: {
          50:  "var(--success-50)",
          100: "var(--success-100)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
        },
        warning: {
          50:  "var(--warning-50)",
          100: "var(--warning-100)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
        },
        error: {
          50:  "var(--error-50)",
          100: "var(--error-100)",
          500: "var(--error-500)",
          600: "var(--error-600)",
          700: "var(--error-700)",
        },
        info: {
          50:  "var(--info-50)",
          100: "var(--info-100)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
        },

        /* ── Semantic Aliases ── */
        page:     "var(--bg-page)",
        card:     {
          DEFAULT:  "var(--bg-card)",
          tint:     "var(--bg-card-tint)",
          elevated: "var(--bg-card-elevated)",
        },
        sidebar:  { DEFAULT: "var(--bg-sidebar)", hover: "var(--bg-sidebar-hover)" },
        input:    "var(--bg-input)",
        muted:    "var(--bg-muted)",
        overlay:  "var(--surface-overlay)",

        heading:  "var(--text-heading)",
        body:     "var(--text-body)",
        subtle:   "var(--text-muted)",
        link:     { DEFAULT: "var(--text-link)", hover: "var(--text-link-hover)" },
        "on-primary": "var(--text-on-primary)",
        "on-accent":  "var(--text-on-accent)",

        /* ── Chart ── */
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
          6: "var(--chart-6)",
        },
      },

      borderColor: {
        DEFAULT:  "var(--border-default)",
        strong:   "var(--border-strong)",
        focus:    "var(--border-focus)",
        accent:   "var(--border-accent)",
      },

      fontFamily: {
        sans:    ["var(--font-sans)"],
        mono:    ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },

      borderRadius: {
        sm:    "var(--radius-sm)",
        md:    "var(--radius-md)",
        lg:    "var(--radius-lg)",
        xl:    "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },

      boxShadow: {
        xs:          "var(--shadow-xs)",
        sm:          "var(--shadow-sm)",
        md:          "var(--shadow-md)",
        lg:          "var(--shadow-lg)",
        xl:          "var(--shadow-xl)",
        "2xl":       "var(--shadow-2xl)",
        card:        "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        float:       "var(--shadow-float)",
        modal:       "var(--shadow-modal)",
      },

      transitionDuration: {
        fast:    "var(--duration-fast)",
        normal:  "var(--duration-normal)",
        slow:    "var(--duration-slow)",
        slower:  "var(--duration-slower)",
      },

      transitionTimingFunction: {
        default: "var(--ease-default)",
        in:      "var(--ease-in)",
        out:     "var(--ease-out)",
        bounce:  "var(--ease-bounce)",
      },

      zIndex: {
        dropdown: "var(--z-dropdown)",
        sticky:   "var(--z-sticky)",
        fixed:    "var(--z-fixed)",
        backdrop: "var(--z-backdrop)",
        modal:    "var(--z-modal)",
        popover:  "var(--z-popover)",
        tooltip:  "var(--z-tooltip)",
        toast:    "var(--z-toast)",
      },

      width: {
        sidebar:            "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width)",
      },

      height: {
        navbar: "var(--navbar-height)",
      },

      backgroundColor: {
        navbar: "var(--navbar-bg)",
      },
    },
  },
  plugins: [],
};

export default config;
