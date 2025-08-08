import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react'; // Importe o ícone do menu
import { Button } from '@/components/ui/button'; // Importe o componente de botão

const MainLayout = ({ user, onLogout }) => {
  // Estado para controlar a visibilidade do menu no celular
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* O Sidebar agora recebe classes para controlar sua posição no celular */}
      <Sidebar 
        user={user} 
        onLogout={onLogout} 
        className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      />
      
      {/* Overlay para fechar o menu ao clicar fora (só aparece no celular quando o menu está aberto) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile com o botão "Hamburger" */}
        <header className="md:hidden sticky top-0 bg-white dark:bg-slate-800 z-10 border-b dark:border-slate-700">
          <div className="flex items-center h-16 px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            {/* Você pode adicionar o logo ou o nome da página aqui se quiser */}
          </div>
        </header>

        {/* A área de conteúdo que rola */}
        <main className="flex-1 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
