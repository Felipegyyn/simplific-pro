import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '../assets/LOGO.png';

const MainLayout = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // --- CONTAINER PRINCIPAL (HÍBRIDO) ---
    // Light: Cinza Gelo (bg-gray-50) | Dark: Preto Profundo (bg-[#020203])
    // Light: Texto Escuro | Dark: Texto Branco
    <div className="flex h-screen w-full bg-gray-50 dark:bg-[#020203] text-gray-900 dark:text-white overflow-hidden relative selection:bg-green-500/30">
      
      {/* --- BACKGROUND FX (APENAS MODO ESCURO) --- */}
      {/* O Grid e as Luzes só aparecem se o 'dark' estiver ativo na tag HTML */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden dark:block">
          {/* 1. Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          
          {/* 2. Luz Ambiente Verde (Topo Direito) */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-green-500/5 blur-[120px]" />
          
          {/* 3. Luz Ambiente Azul (Fundo Esquerdo) */}
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      {/* --- SIDEBAR --- */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* --- ÁREA DE CONTEÚDO --- */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden transition-all duration-300">
        
        {/* HEADER MOBILE (HÍBRIDO) */}
        <header className="md:hidden sticky top-0 z-30 border-b shadow-sm backdrop-blur-xl transition-colors duration-300
            bg-white/80 border-gray-200  /* Estilo Light */
            dark:bg-[#09090b]/80 dark:border-white/5 /* Estilo Dark */
        ">
          <div className="flex items-center justify-between h-16 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-2">
                <img src={logo} alt="SP" className="h-6 w-auto" />
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  Simplific <span className="text-green-600 dark:text-green-500">Tech</span>
                </span>
            </div>
            
            <div className="w-10"></div> 
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 lg:p-8
            scrollbar-thumb-gray-300 scrollbar-track-transparent /* Scrollbar Light */
            dark:scrollbar-thumb-zinc-800 dark:scrollbar-track-transparent /* Scrollbar Dark */
        ">
          <div className="mx-auto max-w-[1600px] w-full space-y-6 animate-fade-in">
             <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;