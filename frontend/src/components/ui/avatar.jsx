"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        // BASE:
        "relative flex shrink-0 overflow-hidden rounded-full",
        
        // DIMENSÃO PADRÃO (Aumentei para 40px/h-10 para mais presença):
        "h-10 w-10", 
        
        // ESTILO "LENS" (MOLDURA):
        // Cria uma borda interna de vidro e uma sombra para destacar do fundo
        "border-2 border-white/10 shadow-md shadow-black/40",
        
        className
      )}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square h-full w-full object-cover", // Garante preenchimento perfeito
        className
      )}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        // ALINHAMENTO:
        "flex h-full w-full items-center justify-center rounded-full",
        
        // COR DE FUNDO (Gradiente Profundo):
        // Sai do cinza chapado para um gradiente metálico escuro
        "bg-gradient-to-b from-zinc-700 to-zinc-900",
        
        // TIPOGRAFIA:
        // Texto branco, bold e levemente menor para caber bem
        "text-xs font-bold text-white tracking-wider",
        
        className
      )}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }