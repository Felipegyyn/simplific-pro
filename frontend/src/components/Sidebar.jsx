import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import logo from '../assets/LOGO.png';

// 1. Aceita a propriedade 'className' para ser controlado pelo componente pai
const Sidebar = ({ user, onLogout, className }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Balanço Geral', icon: FileText, path: '/reports' },
    { name: 'Planejamento', icon: Target, path: '/planning' },
    { name: 'Lançamentos', icon: DollarSign, path: '/transactions' },
    { name: 'Cartões', icon: CreditCard, path: '/credit-cards' },
    { name: 'Metas', icon: Target, path: '/goals' },
    { name: 'Investimentos', icon: TrendingUp, path: '/investments' },
    { name: 'Agenda', icon: Calendar, path: '/schedule' },
    { name: 'Admin', icon: Users, path: '/admin', adminOnly: true },
    { name: 'Configurações', icon: Settings, path: '/settings' }
  ];

  const visibleModules = modules.filter(module => {
    if (!module.adminOnly) {
      return true;
    }
    return user?.profile === 'admin';
  });

  const handleLogoutClick = () => {
    navigate('/login');
    onLogout();
  };

  return (
    // 2. As classes foram reestruturadas para o comportamento mobile-first
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 
      flex flex-col bg-white dark:bg-slate-800 h-screen p-4 border-r dark:border-slate-700 
      transition-transform duration-300 ease-in-out 
      md:relative md:transition-all 
      md:${isOpen ? 'w-64' : 'w-20'}
      ${className} 
    `}>
      {/* Botão de expandir/recolher (agora escondido no celular) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute -right-3 top-9 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-full p-1.5 z-10 text-gray-600 dark:text-slate-300 hidden md:block"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Logo e Título */}
      <div className="flex items-center gap-3 mb-8">
        <img src={logo} alt="Simplific Pro" className="h-8 w-auto" />
        {isOpen && <h1 className="text-xl font-bold text-green-800 dark:text-green-400 whitespace-nowrap">Simplific Pro</h1>}
      </div>

      {/* Links de Navegação */}
      <nav className="flex-1 space-y-2">
        {visibleModules.map((module) => (
          <NavLink
            key={module.name}
            to={module.path}
            className={({ isActive }) => 
              `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`
            }
          >
            <module.icon className="h-5 w-5" />
            {isOpen && <span className="ml-4 whitespace-nowrap">{module.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé do Menu */}
      <div className="border-t pt-4 dark:border-slate-700">
        <div className="flex items-center p-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-600 dark:text-slate-300">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {isOpen && (
            <div className="ml-4">
              <p className="font-semibold text-sm whitespace-nowrap text-gray-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">Simplific Pro</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogoutClick}
          className="flex items-center p-2 mt-2 w-full rounded-lg text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
        >
          <LogOut className="h-5 w-5" />
          {isOpen && <span className="ml-4 whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
