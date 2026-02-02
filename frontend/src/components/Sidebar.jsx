import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, 
  Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, 
  Settings, BarChart3, Bot, Award, Megaphone, ChevronDown, 
  MessageCircle, Tags, Sparkles, Building2, Briefcase // <--- 1. ÍCONES ADICIONADOS
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

  // --- ESTRUTURA DOS DADOS ---
  const menuStructure = [
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
        "fixed inset-y-0 left-0 z-30 flex flex-col h-screen border-r transition-all duration-300 ease-in-out md:relative",
        "bg-background/95 backdrop-blur-xl border-border/60", 
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isDesktopOpen ? "md:w-64" : "md:w-20"
      )}
    >
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className="absolute -right-3 top-9 bg-background border border-border rounded-full p-1.5 z-10 text-muted-foreground hover:text-foreground shadow-sm transition-colors hidden md:block"
      >
        {isDesktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className={cn("flex items-center gap-3 mb-2 p-6 h-20", !isDesktopOpen && "justify-center px-2")}>
        <img src={logo} alt="Simplific Pro" className="h-8 w-auto shrink-0" />
        {isDesktopOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent whitespace-nowrap">
                Simplific Pro
            </span>
        )}
      </div>

      <nav className="flex-1 space-y-2 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border pb-4">
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
                  (!isOpen && isChildActive) || isOpen ? "bg-accent/50 text-foreground font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
                  <span className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap border">
                    {group.title}
                  </span>
                )}
              </button>

              {isDesktopOpen && isOpen && (
                <div className="space-y-1 ml-4 border-l border-border/50 pl-2 animate-in slide-in-from-top-2 duration-200">
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
                            "text-muted-foreground hover:text-green-600 hover:bg-green-50"
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
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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

      <div className="p-4 border-t border-border/60 bg-muted/20 mt-auto">
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            className="hidden"
            accept="image/png, image/jpeg"
        />
        <div className={cn("flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50 cursor-pointer", !isDesktopOpen && "justify-center")} onClick={() => !isUploading && fileInputRef.current.click()}>
          <div className="relative shrink-0">
            {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Foto" className="h-10 w-10 rounded-full object-cover shadow-sm border border-border" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/20">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            )}
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-[1px]">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                </div>
            )}
          </div>
          {isDesktopOpen && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">Editar foto</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogoutClick}
          className={cn(
            "flex items-center w-full mt-2 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
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