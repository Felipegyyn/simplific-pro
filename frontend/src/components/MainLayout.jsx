import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // <--- 1. Importei useLocation
import Sidebar from './Sidebar';
import SidebarBusiness from './SidebarBusiness'; // <--- 2. Importei o novo Sidebar
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '../assets/LOGO.png';

const MainLayout = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 3. Detectar qual contexto estamos
  const location = useLocation();
  const isBusinessRoute = location.pathname.startsWith('/business');

  return (
    <div className="flex h-screen bg-background text-foreground bg-mesh bg-fixed overflow-hidden">
      
      {/* Sidebar Container com Glassmorphism */}
      <div className="hidden md:block">
        {isBusinessRoute ? (
          <SidebarBusiness 
            user={user} 
            onLogout={onLogout} 
          />
        ) : (
          <Sidebar 
            user={user} 
            onLogout={onLogout} 
          />
        )}
      </div>

      {/* Mobile Sidebar com Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 z-50 md:hidden animate-in slide-in-from-left duration-300">
            {isBusinessRoute ? (
              <SidebarBusiness 
                user={user} 
                onLogout={onLogout} 
                isMobileOpen={true}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            ) : (
              <Sidebar 
                user={user} 
                onLogout={onLogout} 
                isMobileOpen={true}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            )}
          </div>
        </>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Mobile - Glassmorphism */}
        <header className="md:hidden sticky top-0 z-30 bg-background/60 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between h-16 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(true)}
              className="hover:bg-white/5"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-2">
                <img src={logo} alt="Simplific Pro" className="h-7 w-auto" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {isBusinessRoute ? 'Simplific Empresas' : 'Simplific Pro'}
                </h1>
            </div>
            
            <div className="w-10"></div> 
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-6 lg:p-8">
          <Outlet /> 
        </main>

        {/* Botão Flutuante Simplific IA */}
        <button
          onClick={() => navigate('/simplific-ia')}
          className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
          title="Falar com Simplific IA"
        >
          {/* Efeito de brilho/halo em volta do ícone */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl group-hover:bg-cyan-500/40 transition-all duration-500 animate-pulse"></div>
          
          {/* Container do Círculo */}
          <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95 overflow-hidden">
            <img 
                src="/favicon.ico" 
                alt="IA" 
                className="w-10 h-10 object-contain brightness-110"
                onError={(e) => { e.target.src = logo }} 
            />
          </div>

          {/* Tooltip moderno que aparece no hover */}
          <div className="absolute right-20 bg-slate-900/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-2xl">
              Falar com Simplific IA
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-l-[6px] border-l-slate-900/90 border-y-[6px] border-y-transparent"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MainLayout;