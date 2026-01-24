import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // BASE:
  // - rounded-full: Formato Pílula (Padrão moderno de status)
  // - px-2.5: Um pouco mais largo para o texto respirar
  // - font-bold: Texto grosso para leitura rápida
  // - tracking-wide: Leve espaçamento entre letras (visual técnico)
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit whitespace-nowrap shrink-0 gap-1",
  {
    variants: {
      variant: {
        // --- 1. DEFAULT (SUCESSO / BRAND) ---
        // Usado para: "Pago", "Ativo", "Receita", "Lucro"
        // Estilo: Fundo verde translúcido + Texto Verde Neon
        default:
          "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20 shadow-[0_0_10px_-4px_rgba(34,197,94,0.3)]",

        // --- 2. SECONDARY (NEUTRO) ---
        // Usado para: "Rascunho", "Categoria", "Tags"
        // Estilo: Vidro cinza
        secondary:
          "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",

        // --- 3. DESTRUCTIVE (ERRO / ALERTA) ---
        // Usado para: "Vencido", "Cancelado", "Despesa", "Prejuízo"
        // Estilo: Fundo vermelho translúcido + Texto Vermelho Neon
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 shadow-[0_0_10px_-4px_rgba(239,68,68,0.3)]",
        
        // --- 4. WARNING (NOVO - AMARELO) ---
        // Usado para: "Pendente", "Em Análise"
        warning:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",

        // --- 5. OUTLINE (SUTIL) ---
        outline:
          "text-zinc-400 border-zinc-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }