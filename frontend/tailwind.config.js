/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // Garante que o modo escuro funcione via classe
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // --- 1. FONTES (Preparando para o futuro) ---
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Padrão moderno
        mono: ["JetBrains Mono", "monospace"], // Para números financeiros (fica muito pro)
      },
      
      // --- 2. CORES ESTENDIDAS (A Identidade Simplific) ---
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Nossa cor de marca exclusiva (Neon Green)
        brand: {
          DEFAULT: "#22c55e", // Green-500 (Base)
          glow: "#4ade80",    // Green-400 (Brilho)
          deep: "#14532d",    // Green-900 (Fundo sutil)
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      
      // --- 3. BORDAS (Mais arredondadas e modernas) ---
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': "1rem",
        '2xl': "1.5rem", // Padrão Apple
        '3xl': "2rem",
      },
      
      // --- 4. ANIMAÇÕES EXCLUSIVAS (A alma do app) ---
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Fade In Suave (para entrada de páginas)
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Slide Up (para cards subindo)
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Pulso Neon (para status "Ao Vivo" ou alertas)
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px #22c55e, 0 0 10px #22c55e" },
          "50%": { boxShadow: "0 0 2px #22c55e, 0 0 5px #22c55e" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up-fade 0.6s ease-out",
        "neon": "neon-pulse 2s infinite",
      },
      
      // --- 5. IMAGENS DE FUNDO (Padrões Grid) ---
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}