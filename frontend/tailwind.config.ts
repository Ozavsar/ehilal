import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        xs: "100%",
        sm: "540px",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        "2xl": "1320px",
      },
    },
    extend: {
      screens: {
        "custom-lg": "1135px",
        md: "720px",
        lg: "960px",
        xl: "1140px",
        "2xl": "1320px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "blog-text-color": "hsl(var(--blog-text-color))",
        primary: {
          DEFAULT: "hsl(var(--primary), <alpha-value>)",
          foreground: "hsl(var(--primary-foreground), <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive), <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground), <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted), <alpha-value>)",
          foreground: "hsl(var(--muted-foreground), <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent), <alpha-value>)",
          foreground: "hsl(var(--accent-foreground), <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover), <alpha-value>)",
          foreground: "hsl(var(--popover-foreground), <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card), <alpha-value>)",
          foreground: "hsl(var(--card-foreground), <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-right": {
          from: { opacity: "0", transform: "translateX(32px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-elif": {
          from: {
            opacity: "0",
            transform: "rotate(-10deg) translateX(-100px)",
          },
          to: { opacity: "1", transform: "rotate(0deg) translateX(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-elif": "fade-in-elif 0.7s ease-out forwards 0.3s",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
} satisfies Config;

export default config;
