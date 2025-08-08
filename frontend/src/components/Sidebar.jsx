import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import logo from '../assets/LOGO.png';

// 1. Aceita as novas propriedades para controlar o menu no celular
const Sidebar = ({ user, onLogout, isMobileOpen, closeMobileMenu }) => {
  // 2. Estado separado para controlar o menu no desktop
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
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
    if (!module.adminOnly) return true;
    return user?.profile === 'admin';
  });

  const handleLogoutClick = () => {
    navigate('/login');
    onLogout();
  };

  // 3. Função para fechar o menu no celular ao clicar em um link
  const handleLinkClick = () => {
    if (isMobileOpen) {
      closeMobileMenu();
    }
  };

  return (
    // 4. Lógica de classes totalmente refeita para separar mobile e desktop
    <div className={`
      fixed inset-y-0 left-0 z-30 
      flex flex-col bg-white dark:bg-slate-800 h-screen p-4 border-r dark:border-slate-700 
      transition-transform duration-300 ease-in-out 
      md:relative md:transition-all 
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0
      md:${isDesktopOpen ? 'w-64' : 'w-20'}
    `}>
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className="absolute -right-3 top-9 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-full p-1.5 z-10 text-gray-600 dark:text-slate-300 hidden md:block"
      >
        {isDesktopOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex items-center gap-3 mb-8">
        <img src={logo} alt="Simplific Pro" className="h-8 w-auto" />
        {isDesktopOpen && <h1 className="text-xl font-bold text-green-800 dark:text-green-400 whitespace-nowrap">Simplific Pro</h1>}
      </div>

      <nav className="flex-1 space-y-2">
        {visibleModules.map((module) => (
          <NavLink
            key={module.name}
            to={module.path}
            onClick={handleLinkClick} // Adicionado para fechar no mobile
            className={({ isActive }) => 
              `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`
            }
          >
            <module.icon className="h-5 w-5" />
            {isDesktopOpen && <span className="ml-4 whitespace-nowrap">{module.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-4 dark:border-slate-700">
        <div className="flex items-center p-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center font-bold text-gray-600 dark:text-slate-300">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {isDesktopOpen && (
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
          {isDesktopOpen && <span className="ml-4 whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
