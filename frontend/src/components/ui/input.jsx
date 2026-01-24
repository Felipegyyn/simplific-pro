import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // --- BASE & DIMENSÕES ---
        "flex h-12 w-full rounded-xl border px-4 py-2 text-base md:text-sm transition-all duration-300",
        
        // --- MATERIAL (DARK GLASS) ---
        // Fundo escuro sutil + borda quase invisível
        "bg-zinc-900/50 border-white/10 text-white shadow-sm",
        "placeholder:text-zinc-500", // Placeholder discreto

        // --- ESTADO DE FOCO (NEON) ---
        "outline-none",
        "focus-visible:border-green-500/50", // A borda fica verde sutil
        "focus-visible:ring-4 focus-visible:ring-green-500/10", // Um anel de luz verde expande
        "focus-visible:bg-zinc-900/80", // O fundo fica um pouco mais sólido para facilitar leitura

        // --- INPUT DE ARQUIVO (FILE) ---
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-400",
        
        // --- DESABILITADO ---
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // --- ESTADO DE ERRO (Vermelho Neon) ---
        "aria-invalid:border-red-500/50 aria-invalid:ring-red-500/10",
        
        className
      )}
      {...props} />
  );
}

export { Input }