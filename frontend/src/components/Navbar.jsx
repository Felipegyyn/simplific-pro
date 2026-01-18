import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ShieldCheck } from 'lucide-react'; // <--- 1. ADICIONEI O SHIELDCHECK AQUI

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber em qual página estamos
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Função auxiliar para navegar
  const handleNav = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
    window.scrollTo(0, 0); // Rola para o topo ao mudar de página
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo - Clicar leva para a Home */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => handleNav('/')}
        >
           <div className="bg-green-600 text-white p-1 rounded font-bold text-xl">SP</div>
           <span className="text-xl font-bold text-gray-900 tracking-tight">Simplific Pro</span>
        </div>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => handleNav('/beneficios')} className="text-gray-600 hover:text-green-600 font-medium">Benefícios</button>
          <button onClick={() => handleNav('/inteligencia')} className="text-gray-600 hover:text-green-600 font-medium">Inteligência</button>
          
          {/* --- 2. NOVO BOTÃO SEGURANÇA (DESKTOP) --- */}
          <button 
            onClick={() => handleNav('/seguranca')} 
            className="text-gray-600 hover:text-green-600 font-medium flex items-center gap-1"
          >
            <ShieldCheck size={18} /> Segurança
          </button>
          {/* ----------------------------------------- */}

          <button onClick={() => handleNav('/planos')} className="text-gray-600 hover:text-green-600 font-medium">Planos</button>
          
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Área do Cliente
          </Button>
          <Button onClick={() => handleNav('/planos')} className="bg-green-600 hover:bg-green-700 text-white">
            Quero Assinar
          </Button>
        </div>

        {/* Menu Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 shadow-lg">
          <button onClick={() => handleNav('/beneficios')} className="text-left py-2">Benefícios</button>
          <button onClick={() => handleNav('/inteligencia')} className="text-left py-2">Inteligência</button>
          
          {/* --- 3. NOVO BOTÃO SEGURANÇA (MOBILE) --- */}
          <button onClick={() => handleNav('/seguranca')} className="text-left py-2 flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600"/> Segurança
          </button>
          {/* -------------------------------------- */}

          <button onClick={() => handleNav('/planos')} className="text-left py-2">Planos</button>
          <Button onClick={() => navigate('/login')} variant="outline" className="w-full">Área do Cliente</Button>
          <Button onClick={() => handleNav('/planos')} className="w-full bg-green-600 text-white">Quero Assinar</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;