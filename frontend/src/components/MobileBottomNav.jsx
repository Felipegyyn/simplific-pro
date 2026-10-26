import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Eye, LayoutDashboard, DollarSign, CreditCard, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomNav({ onOpenMenu }) {
  const location = useLocation();

  const navItems = [
    {
      name: 'Vision',
      path: '/vision',
      icon: Eye,
      isSpecial: true,
    },
    {
      name: 'Resumo',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Lançamentos',
      path: '/transactions',
      icon: DollarSign,
    },
    {
      name: 'Cartões',
      path: '/credit-cards',
      icon: CreditCard,
    },
  ];

  return (
    <nav 
      aria-label="Navegação mobile"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.35)]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center h-full relative transition-all duration-200 group touch-manipulation",
                  isActive ? "text-primary dark:text-white" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 relative",
                  isActive 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md shadow-zinc-500/20 scale-105" 
                    : "bg-muted/60 text-foreground group-active:scale-95"
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className={cn(
                  "text-[10px] tracking-tight mt-0.5 font-medium transition-all",
                  isActive ? "font-bold text-foreground" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center h-full relative transition-all duration-200 group touch-manipulation",
                isActive ? "text-primary dark:text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 dark:bg-white/10 text-primary dark:text-white scale-105" 
                  : "text-muted-foreground group-active:scale-95"
              )}>
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className={cn(
                "text-[10px] tracking-tight mt-0.5 transition-all",
                isActive ? "font-bold text-foreground" : "text-muted-foreground font-medium"
              )}>
                {item.name}
              </span>
            </NavLink>
          );
        })}

        {/* Botão Menu / Mais */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu completo"
          className="flex flex-col items-center justify-center h-full relative text-muted-foreground hover:text-foreground transition-all duration-200 group touch-manipulation"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted/40 group-active:scale-95 transition-transform">
            <Menu size={19} strokeWidth={1.8} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-muted-foreground font-medium">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
