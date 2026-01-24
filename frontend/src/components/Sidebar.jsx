import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, 
  Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, 
  Settings, BarChart3, Bot, Award, Megaphone
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils"; // Importando utilitário de classes (se disponível)

const Sidebar = ({ user, onLogout, isMobileOpen, closeMobileMenu }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const modules = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Balanço Geral', icon: FileText, path: '/reports' },
    { name: 'Planejamento', icon: Target, path: '/planning' },
    { name: 'Lançamentos', icon: DollarSign, path: '/transactions' },
    { name: 'Cartões', icon: CreditCard, path: '/credit-cards' },
    { name: 'Metas', icon: Target, path: '/goals' },
    { name: 'Investimentos', icon: TrendingUp, path: '/investments' },
    { name: 'Agenda', icon: Calendar, path: '/schedule' },
    { name: 'Simplific IA', icon: Bot, path: '/simplific-ia' },
    { name: 'Análise', icon: BarChart3, path: '/analysis' },
    { name: 'Conquistas', icon: Award, path: '/achievements' },
    { name: 'Admin', icon: Users, path: '/admin', adminOnly: true },
    { name: 'Marketing', icon: Megaphone, path: '/admin/marketing', adminOnly: true }, // <--- NOVO ITEM
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

  const handleLinkClick = () => {
    if (isMobileOpen) closeMobileMenu();
  };

  return (
    <div 
      className={cn(
        // BASE:
        "fixed inset-y-0 left-0 z-30 flex flex-col h-screen border-r transition-all duration-300 ease-in-out md:relative",
        // ESTILO:
        "bg-background/95 backdrop-blur-xl border-border/60", // Efeito de vidro
        // LÓGICA MOBILE/DESKTOP:
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isDesktopOpen ? "md:w-64" : "md:w-20"
      )}
    >
      {/* BOTÃO TOGGLE (Setinha) */}
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className="absolute -right-3 top-9 bg-background border border-border rounded-full p-1.5 z-10 text-muted-foreground hover:text-foreground shadow-sm transition-colors hidden md:block"
      >
        {isDesktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* LOGO */}
      <div className={cn("flex items-center gap-3 mb-6 p-6 h-20", !isDesktopOpen && "justify-center px-2")}>
        <img src={logo} alt="Simplific Pro" className="h-8 w-auto shrink-0" />
        {isDesktopOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent whitespace-nowrap">
                Simplific Pro
            </span>
        )}
      </div>

      {/* MENU DE NAVEGAÇÃO */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
        {visibleModules.map((module) => (
          <NavLink
            key={module.name}
            to={module.path}
            onClick={handleLinkClick}
            className={({ isActive }) => 
              cn(
                "flex items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                !isDesktopOpen && "justify-center",
                isActive 
                  ? "bg-primary/10 text-primary font-medium shadow-sm" // Ativo
                  : "text-muted-foreground hover:bg-accent hover:text-foreground" // Inativo
              )
            }
          >
            <module.icon className={cn("h-5 w-5 shrink-0 transition-colors", isDesktopOpen ? "mr-3" : "")} />
            
            {isDesktopOpen && <span className="whitespace-nowrap text-sm">{module.name}</span>}
            
            {/* Tooltip para quando fechado */}
            {!isDesktopOpen && (
                <span className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap border">
                    {module.name}
                </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* PERFIL DO USUÁRIO (RODAPÉ) */}
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