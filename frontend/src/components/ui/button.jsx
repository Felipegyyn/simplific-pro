import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // --- BASE ---
  // - rounded-xl: Combina com os Inputs e Cards (Visual Coeso)
  // - font-bold: Texto firme e legível
  // - ring-offset-background: Foco acessível e bonito
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        // --- 1. O BOTÃO PRINCIPAL (NEON TECH) ---
        default: [
          "bg-gradient-to-r from-green-600 to-green-500", // Gradiente sutil
          "text-white shadow-lg",
          "border border-white/10", // Borda interna sutil para definição
          // Efeito de Luz (Glow Verde):
          "shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]", 
          // Hover:
          "hover:brightness-110 hover:shadow-[0_0_25px_-5px_rgba(34,197,94,0.6)] hover:-translate-y-0.5",
        ].join(" "),

        // --- 2. DESTRUTIVO (ERRO/PERIGO) ---
        destructive:
          "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-red-500/20",

        // --- 3. OUTLINE (GLASS BORDER) ---
        outline: [
          "border border-white/10 bg-transparent", // Borda de vidro
          "text-gray-300",
          "hover:bg-white/5 hover:text-white hover:border-white/20", // Acende ao passar o mouse
        ].join(" "),

        // --- 4. SECUNDÁRIO (DARK SOLID) ---
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 shadow-sm border border-white/5",

        // --- 5. GHOST (TEXTO PURO) ---
        ghost:
          "hover:bg-white/5 hover:text-white text-gray-400",

        // --- 6. LINK ---
        link: "text-green-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2", // Altura 12 (48px) para igualar ao Input
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base", // Botãozão de destaque
        icon: "h-12 w-12", // Quadrado perfeito
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }