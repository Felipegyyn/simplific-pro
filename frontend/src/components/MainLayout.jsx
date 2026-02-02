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
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      
      {/* 4. Renderização Condicional do Sidebar */}
      {isBusinessRoute ? (
        <SidebarBusiness 
          user={user} 
          onLogout={onLogout} 
          isMobileOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      ) : (
        <Sidebar 
          user={user} 
          onLogout={onLogout} 
          isMobileOpen={isMobileMenuOpen}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Overlay para celular */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden sticky top-0 bg-white dark:bg-slate-800 z-10 border-b dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center gap-2">
                <img src={logo} alt="Simplific Pro" className="h-7 w-auto" />
                <h1 className="text-lg font-bold text-green-800 dark:text-green-400">
                    {/* Muda o título no mobile também */}
                    {isBusinessRoute ? 'Simplific Empresas' : 'Simplific Pro'}
                </h1>
            </div>
            
            <div className="w-10"></div> 
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;