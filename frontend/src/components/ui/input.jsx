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
        // BASE:
        // - h-11: Altura maior (padrão mobile moderno)
        // - rounded-xl: Bordas arredondadas suaves
        // - bg-transparent: Mantém fundo transparente (ou mude para bg-gray-50 se quiser fundo cinza)
        // - px-4: Mais espaçamento lateral interno
        "flex h-11 w-full min-w-0 rounded-xl border border-input bg-transparent px-4 py-2 text-base shadow-sm transition-all duration-200 outline-none md:text-sm",
        
        // PLACEHOLDER & ARQUIVO:
        "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
        
        // ESTADO DE FOCO (Onde a mágica acontece):
        // - ring-ring/30: Um anel de foco mais suave e transparente
        // - border-primary: A borda muda de cor para a cor principal
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary",
        
        // ESTADOS DESABILITADOS:
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        // ESTADO DE ERRO:
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        
        className
      )}
      {...props} />
  );
}

export { Input }