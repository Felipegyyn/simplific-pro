import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-xl border border-white/5 bg-[#09090b]/40 backdrop-blur-sm">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Fundo sutilmente mais escuro para o cabeçalho
        "bg-black/20 [&_tr]:border-b [&_tr]:border-white/10", 
        className
      )}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-white/5 border-t border-white/10 font-medium [&>tr]:last:border-b-0", 
        className
      )}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // BORDA: Muito sutil (border-white/5)
        "border-b border-white/5 transition-colors",
        
        // HOVER: Efeito de vidro ao passar o mouse
        "hover:bg-white/[0.02]", 
        
        // SELECIONADO:
        "data-[state=selected]:bg-white/5",
        
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        // ESTILO "TERMINAL":
        // - h-10: Altura compacta
        // - uppercase: Caixa alta
        // - text-xs: Fonte menor
        // - font-bold: Peso forte
        // - text-zinc-500: Cor discreta (não briga com os dados)
        // - tracking-wider: Espaçamento entre letras
        "h-10 px-4 text-left align-middle text-xs font-bold uppercase tracking-wider text-zinc-500 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        // DADOS:
        // - text-zinc-300: Branco suave para leitura confortável
        // - font-medium: Levemente mais grosso que o normal
        "p-4 align-middle text-zinc-300 font-medium [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-zinc-600 uppercase tracking-widest", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}