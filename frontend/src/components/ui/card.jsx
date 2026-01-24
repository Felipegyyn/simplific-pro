import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        // --- ESTRUTURA & POSICIONAMENTO ---
        "flex flex-col gap-0 relative group overflow-hidden",
        "rounded-3xl", // Curvatura mais moderna (Apple Style)

        // --- MATERIAL (VIDRO ESCURO) ---
        "bg-[#09090b]/60 backdrop-blur-2xl", // Fundo semi-transparente escuro
        "border border-white/5", // Borda muito sutil (apenas para definição)

        // --- ILUMINAÇÃO & SOMBRA ---
        "shadow-2xl shadow-black/40", // Sombra profunda para destacar do fundo
        // Highlight no topo (O toque de luxo):
        "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",

        // --- INTERAÇÃO (HOVER) ---
        "transition-all duration-500 ease-out",
        "hover:bg-[#09090b]/80 hover:border-white/10", // Escurece um pouco e realça a borda
        "hover:-translate-y-1 hover:shadow-green-900/10", // Levanta e projeta sombra colorida sutil

        className
      )}
      {...props} 
    />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Removemos o grid complexo para flexbox mais limpo, mas mantemos o suporte a ações
        "flex flex-col space-y-1.5 px-6 pt-6 pb-4 md:px-8 md:pt-8",
        className
      )}
      {...props} 
    />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-lg md:text-xl font-bold leading-none tracking-tight text-white/90",
        // O título acende em verde quando passa o mouse no card
        "transition-colors duration-300 group-hover:text-green-400",
        className
      )}
      {...props} 
    />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-zinc-400 font-medium", 
        className
      )}
      {...props} 
    />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "absolute top-6 right-6 md:top-8 md:right-8", // Posicionamento absoluto para não quebrar o fluxo
        className
      )}
      {...props} 
    />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div 
      data-slot="card-content" 
      className={cn(
        "px-6 pb-6 md:px-8 md:pb-8 text-zinc-300", 
        className
      )} 
      {...props} 
    />
  );
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center px-6 pb-6 md:px-8 md:pb-8 pt-0", 
        className
      )}
      {...props} 
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}