import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        // BASE (O Trilho):
        "relative h-3 w-full overflow-hidden rounded-full", // Aumentei levemente a altura (h-3)
        
        // ESTILO DE PROFUNDIDADE (Sulco Escuro):
        "bg-black/40 border border-white/5", // Fundo escuro semi-transparente
        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]", // Sombra interna forte (parece afundado)
        
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          // BARRA (O Preenchimento):
          "h-full w-full flex-1 transition-all duration-500 ease-out", // Animação mais suave (ease-out)
          
          // COR E GRADIENTE:
          "bg-gradient-to-r from-green-700 via-green-500 to-green-400", // Gradiente para dar volume
          
          // EFEITO NEON (Glow):
          // Isso faz a barra "brilhar" nas pontas
          "shadow-[0_0_10px_2px_rgba(74,222,128,0.3)]"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }