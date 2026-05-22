import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, 
  Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, 
  Settings, BarChart3, Bot, Award, Megaphone, ChevronDown, 
  MessageCircle, Tags, Sparkles, Building2, Briefcase, Landmark, Home // <--- 1. ÍCONES ADICIONADOS
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils"; 

const Sidebar = ({ user, onLogout, isMobileOpen, closeMobileMenu }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  
  // Controle dos menus abertos
 const [openMenus, setOpenMenus] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- ESTRUTURA DOS DADOS

  const menuStructure = [
    // ▼▼▼ 1. NOVO MENU INÍCIO ▼▼▼
    {
      title: 'Início',
      icon: Home,
      color: 'text-amber-500', // Escolhi uma cor diferente (âmbar/amarelo) para destacar
      items: [
        { name: 'Início', path: '/inicio', icon: Home },
      ]
    },
    // ▲▲▲ FIM DO NOVO MENU ▲▲▲

  
    {
      title: 'Resumo',
      icon: LayoutDashboard,
      color: 'text-blue-500',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Balanço Geral', path: '/reports', icon: FileText },
        { name: 'Análise', path: '/analysis', icon: BarChart3 },
      ]
    },
    {
      title: 'Lançamentos',
      icon: DollarSign,
      color: 'text-green-500',
      items: [
        { name: 'Lançamentos', path: '/transactions', icon: DollarSign },
        { name: 'Planejamento', path: '/planning', icon: Target },
        { name: 'Metas', path: '/goals', icon: Target },
        { name: 'Cartões', path: '/credit-cards', icon: CreditCard },
      ]
    },
    {
      title: 'Investimentos',
      icon: TrendingUp,
      color: 'text-purple-500',
      items: [
        { name: 'Investimentos', path: '/investments', icon: TrendingUp },
      ]
    },

    // ▲▲▲ FIM DO NOVO GRUPO ▲▲▲
    {
      title: 'Assessor Simplific',
      icon: Bot,
      color: 'text-indigo-500',
      items: [
        { name: 'Simplific IA', path: '/simplific-ia', icon: Bot },
        { 
            name: 'Whatsapp Assessor', 
            path: 'https://wa.me/551151991373', 
            icon: MessageCircle,
            isExternal: true 
        },
        { name: 'Funcionalidades Assessor', path: '/advisor-features', icon: Sparkles },
      ]
    },
    {
      title: 'Compromissos',
      icon: Calendar,
      color: 'text-pink-500',
      items: [
        { name: 'Agenda', path: '/schedule', icon: Calendar },
        { name: 'Contatos', path: '/contacts', icon: Users },
      ]
    },
    {
      title: 'Configurações e outros',
      icon: Settings,
      color: 'text-orange-500',
      items: [
        { name: 'Contas Bancárias', path: '/bank-accounts', icon: Landmark },
        { name: 'Categorias', path: '/categories', icon: Tags },
        { name: 'Conquistas', path: '/achievements', icon: Award },
        { name: 'Configurações', path: '/settings', icon: Settings },
        { name: 'Admin', path: '/admin', icon: Users, adminOnly: true },
        { name: 'Marketing', path: '/admin/marketing', icon: Megaphone, adminOnly: true },
      ]
    },

        // ▼▼▼ 3. NOVO GRUPO: SIMPLIFIC EMPRESAS ▼▼▼
    {
      title: 'Simplific Empresas',
      icon: Building2,
      color: 'text-cyan-500', // Cor Ciano
      items: [
        { name: 'Acessar Empresa', path: '/business', icon: Briefcase, adminOnly: true },
      ]
    },
  ];

  // Filtra itens baseados na permissão
  const visibleMenu = menuStructure.map(group => ({
    ...group,
    items: group.items.filter(item => !item.adminOnly || user?.profile === 'admin')
  })).filter(group => group.items.length > 0);

  const toggleMenu = (title) => {
    if (!isDesktopOpen) {
      setIsDesktopOpen(true);
      setOpenMenus(prev => ({ ...prev, [title]: true }));
      return;
    }
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogoutClick = () => {
    navigate('/login');
    onLogout();
  };

  const handleLinkClick = () => {
    if (isMobileOpen) closeMobileMenu();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('profile_picture', file);
    try {
      const token = localStorage.getItem('simplific_token');
      if (!token) throw new Error('Token não encontrado.');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile-picture`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro no servidor.');
      const updatedUser = { ...user, profile_image_url: result.profile_image_url };
      localStorage.setItem('simplific_user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col h-screen transition-all duration-300 ease-in-out md:relative",
        "glass-panel rounded-none border-y-0 border-l-0 border-white/5", 
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isDesktopOpen ? "md:w-64" : "md:w-20"
      )}
    >
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className="absolute -right-3 top-9 bg-slate-900 border border-white/10 rounded-full p-1.5 z-10 text-slate-400 hover:text-white shadow-xl transition-colors hidden md:block"
      >
        {isDesktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className={cn("flex items-center gap-3 mb-2 p-6 h-20", !isDesktopOpen && "justify-center px-2")}>
        <img src={logo} alt="Simplific Pro" className="h-8 w-auto shrink-0 brightness-110" />
        {isDesktopOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                Simplific Pro
            </span>
        )}
      </div>

      <nav className="flex-1 space-y-2 px-3 overflow-y-auto scrollbar-none pb-4">
        {visibleMenu.map((group) => {
          const isOpen = openMenus[group.title];
          const isChildActive = group.items.some(item => !item.isExternal && location.pathname === item.path);

          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleMenu(group.title)}
                className={cn(
                  "w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative select-none",
                  !isDesktopOpen && "justify-center",
                  (!isOpen && isChildActive) || isOpen ? "bg-white/5 text-white font-medium shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <group.icon 
                    className={cn(
                        "h-5 w-5 shrink-0 transition-colors", 
                        isDesktopOpen ? "mr-3" : "",
                        group.color 
                    )} 
                />
                
                {isDesktopOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{group.title}</span>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 opacity-50", 
                        isOpen ? "transform rotate-180" : ""
                      )} 
                    />
                  </>
                )}

                {!isDesktopOpen && (
                  <span className="absolute left-14 glass-panel px-3 py-1.5 rounded-lg text-xs shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap border-white/10">
                    {group.title}
                  </span>
                )}
              </button>

              {isDesktopOpen && isOpen && (
                <div className="space-y-1 ml-4 border-l border-white/5 pl-2 animate-in slide-in-from-top-2 duration-200">
                  {group.items.map((item) => {
                    if (item.isExternal) {
                      return (
                        <a
                          key={item.name}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center p-2 rounded-lg transition-colors text-sm",
                            "text-slate-400 hover:text-cyan-400 hover:bg-white/5"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3 opacity-70" />
                          <span>{item.name}</span>
                        </a>
                      );
                    }

                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={handleLinkClick}
                        className={({ isActive }) => 
                          cn(
                            "flex items-center p-2 rounded-lg transition-colors text-sm",
                            isActive 
                              ? "active-gradient text-cyan-400 font-medium" 
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          )
                        }
                      >
                          <item.icon className="h-4 w-4 mr-3 opacity-70" /> 
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-white/2 mt-auto">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            className="hidden"
            accept="image/png, image/jpeg"
        />
        <div className={cn("flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer", !isDesktopOpen && "justify-center")} onClick={() => !isUploading && fileInputRef.current.click()}>
          <div className="relative shrink-0">
            {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Foto" className="h-10 w-10 rounded-full object-cover shadow-md border border-slate-200 dark:border-white/10" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            )}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                </div>
            )}
          </div>
          {isDesktopOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Editar perfil</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogoutClick}
          className={cn(
            "flex items-center w-full mt-2 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-colors",
            !isDesktopOpen && "justify-center"
          )}
          title="Sair"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {isDesktopOpen && <span className="ml-3 text-sm font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;