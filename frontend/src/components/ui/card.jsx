import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 1. BASE: Removemos o 'gap-6'. O espaçamento será controlado pelo padding dos filhos.
      "rounded-2xl bg-card text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
      
      // 2. BORDA: Mantivemos sem borda como você gostou, mas garantimos overflow hidden
      "border-none overflow-hidden", 
      
      // 3. ANIMAÇÃO: Mantida a sua animação suave
      "transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1",
      
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // FLEXBOX LIMPO: Removemos aquele GRID complexo que causava problemas de alinhamento.
      "flex flex-col space-y-1.5",
      
      // ESPAÇAMENTO: Padding completo (p-6 = 24px) em volta do título
      "p-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // O SEGREDO DO RESPIRO:
      // p-6: Adiciona 24px de respiro nas laterais E EMBAIXO.
      // pt-0: Remove o respiro de cima para não ficar longe demais do Header.
      "p-6 pt-0", 
      className
    )}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }