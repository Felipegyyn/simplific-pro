import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, 
  Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, 
  Settings, BarChart3, Bot, Award, Megaphone, Upload
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils";

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
    { name: 'Marketing', icon: Megaphone, path: '/admin/marketing', adminOnly: true },
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
    <>
      {/* OVERLAY MOBILE (Fundo escuro quando menu abre no celular) */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
      />

      <aside 
        className={cn(
          // --- LAYOUT BASE & POSICIONAMENTO ---
          "fixed z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
          
          // --- ESTILO VIDRO (GLASSMORPHISM) ---
          "bg-[#09090b]/80 backdrop-blur-2xl border border-white/10 shadow-2xl",
          
          // --- MOBILE (Gaveta Clássica mas com estilo vidro) ---
          "inset-y-0 left-0 w-[280px] md:w-auto",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",

          // --- DESKTOP (Dock Flutuante) ---
          // No desktop, ele desgruda da borda (m-4) e arredonda os cantos (rounded-3xl)
          "md:top-4 md:bottom-4 md:left-4 md:rounded-3xl",
          
          // Largura dinâmica no Desktop
          isDesktopOpen ? "md:w-[260px]" : "md:w-[90px]"
        )}
      >
        {/* BOTÃO TOGGLE (Apenas Desktop) */}
        <button 
          onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
          className="absolute -right-3 top-10 z-50 hidden md:flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-black shadow-lg shadow-green-500/20 hover:scale-110 transition-transform"
        >
          {isDesktopOpen ? <ChevronLeft size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
        </button>

        {/* --- HEADER / LOGO --- */}
        <div className={cn("flex items-center gap-3 p-6 mb-2", !isDesktopOpen && "md:justify-center md:px-2")}>
          <div className="relative shrink-0">
             {/* Efeito de brilho atrás do logo */}
             <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full opacity-50"></div>
             <img src={logo} alt="SP" className="relative h-9 w-auto z-10" />
          </div>
          
          <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", 
              !isDesktopOpen && "md:w-0 md:opacity-0"
          )}>
            <span className="text-lg font-bold text-white tracking-tight">
              Simplific <span className="text-green-500">Tech</span>
            </span>
          </div>
        </div>

        {/* --- MENU SCROLLÁVEL --- */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {visibleModules.map((module) => (
            <NavLink
              key={module.name}
              to={module.path}
              onClick={handleLinkClick}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                  !isDesktopOpen && "md:justify-center md:px-2",
                  
                  // ESTADOS DO BOTÃO
                  isActive 
                    ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                )
              }
            >
              {/* ÍCONE */}
              <module.icon 
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300", 
                  !isDesktopOpen && "md:h-6 md:w-6",
                  "group-hover:scale-110"
                )} 
              />
              
              {/* NOME (Esconde se fechado) */}
              <span className={cn(
                "font-medium text-sm whitespace-nowrap transition-all duration-300",
                !isDesktopOpen && "md:hidden"
              )}>
                {module.name}
              </span>

              {/* TOOLTIP (Aparece ao passar o mouse quando fechado) */}
              {!isDesktopOpen && (
                <div className="absolute left-[110%] top-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                  {module.name}
                  {/* Setinha do tooltip */}
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 border-l border-b border-gray-700 transform rotate-45"></div>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* --- FOOTER / PERFIL --- */}
        <div className="p-4 mt-auto">
          <div className={cn(
            "rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 p-3 backdrop-blur-md transition-all duration-300",
            !isDesktopOpen && "md:p-2 md:bg-transparent md:border-0"
          )}>
            
            {/* Input File Escondido */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              className="hidden"
              accept="image/png, image/jpeg"
            />

            {/* Avatar & Nome */}
            <div className={cn("flex items-center gap-3", !isDesktopOpen && "justify-center")}>
              
              {/* Foto com indicador de upload */}
              <div 
                className="relative group cursor-pointer shrink-0" 
                onClick={() => !isUploading && fileInputRef.current.click()}
              >
                <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-green-500 to-emerald-700">
                  <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt="User" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-green-500">{user?.name?.charAt(0)}</span>
                    )}
                    
                    {/* Overlay de Upload (Aparece no Hover) */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       {isUploading ? (
                         <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"/>
                       ) : (
                         <Upload size={14} className="text-white" />
                       )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Texto */}
              {isDesktopOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user?.name?.split(' ')[0]}</p>
                  <p className="text-[10px] text-green-400 font-mono tracking-wider truncate uppercase">Premium</p>
                </div>
              )}
            </div>

            {/* Botão Sair */}
            {isDesktopOpen ? (
                <button 
                  onClick={handleLogoutClick}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider border border-transparent hover:border-red-500/50"
                >
                  <LogOut size={14} /> Sair
                </button>
            ) : (
                // Botão Sair Ícone (Quando fechado)
                <button 
                  onClick={handleLogoutClick}
                  className="mt-4 mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;