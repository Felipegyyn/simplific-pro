import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Menubar({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        // BASE (Barra Principal):
        "flex h-11 items-center gap-1 p-1.5",
        
        // ESTILO CÁPSULA FLUTUANTE:
        "rounded-2xl border border-white/5 bg-[#09090b]/80 backdrop-blur-xl shadow-lg shadow-black/20",
        
        className
      )}
      {...props} />
  );
}

function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}) {
  return (<MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />);
}

function MenubarTrigger({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        // GATILHO (Botão):
        "flex items-center px-3 py-1.5 text-sm font-medium outline-none cursor-default select-none",
        
        // ESTILO INTERATIVO:
        "rounded-xl transition-all duration-200 text-gray-400",
        "hover:bg-white/10 hover:text-white", // Hover de vidro
        "focus:bg-white/10 focus:text-white", 
        "data-[state=open]:bg-white/15 data-[state=open]:text-white", // Estado Aberto
        
        className
      )}
      {...props} />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          // ANIMAÇÕES:
          "z-50 min-w-[12rem] overflow-hidden origin-[var(--radix-menubar-content-transform-origin)] data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          
          // ESTILO DROPDOWN (VIDRO PROFUNDO):
          "rounded-xl border border-white/10 p-1.5 shadow-2xl shadow-black/50",
          "bg-[#09090b]/90 backdrop-blur-2xl text-gray-200",
          
          className
        )}
        {...props} />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        // ITEM INDIVIDUAL:
        "relative flex cursor-default select-none items-center gap-2 px-3 py-2 text-sm outline-none",
        "rounded-lg transition-colors",
        
        // HOVER SUAVE:
        "focus:bg-white/10 focus:text-white", 
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[inset]:pl-8",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-gray-400 focus:text-white",
        
        // VARIANTE DESTRUTIVA (Ex: Sair):
        "data-[variant=destructive]:text-red-400 data-[variant=destructive]:focus:bg-red-500/10 data-[variant=destructive]:focus:text-red-300",
        
        className
      )}
      {...props} />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-lg py-1.5 pr-2 pl-8 text-sm outline-none",
        "focus:bg-white/10 focus:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center text-green-400">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-lg py-1.5 pr-2 pl-8 text-sm outline-none",
        "focus:bg-white/10 focus:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center text-green-400">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-xs font-bold tracking-widest uppercase text-gray-500 data-[inset]:pl-8", className)}
      {...props} />
  );
}

function MenubarSeparator({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-white/10", className)}
      {...props} />
  );
}

function MenubarShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-gray-600", className)}
      {...props} />
  );
}

function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none",
        "focus:bg-white/10 focus:text-white",
        "data-[state=open]:bg-white/10 data-[state=open]:text-white",
        "data-[inset]:pl-8",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4 text-gray-500" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden origin-[var(--radix-menubar-content-transform-origin)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        // ESTILO SUBMENU (Igual ao Dropdown):
        "rounded-xl border border-white/10 p-1 shadow-2xl shadow-black/50",
        "bg-[#09090b]/90 backdrop-blur-2xl text-gray-200",
        className
      )}
      {...props} />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}