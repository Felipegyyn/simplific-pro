import React, { useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Target, DollarSign, CreditCard, TrendingUp, 
  Calendar, FileText, Users, LogOut, ChevronLeft, ChevronRight, 
  Settings, BarChart3, Bot, Award, Megaphone, ChevronDown, 
  MessageCircle, Tags, Sparkles, Building2, Briefcase, Landmark, Home
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils";
import styles from './Sidebar.module.css';

const Sidebar = ({ user, onLogout, isMobileOpen, closeMobileMenu }) => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const menuStructure = [
    {
      title: 'Início',
      icon: Home,
      color: 'var(--primary-accent)',
      items: [
        { name: 'Início', path: '/inicio', icon: Home },
      ]
    },
    {
      title: 'Resumo',
      icon: LayoutDashboard,
      color: '#3b82f6',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Balanço Geral', path: '/reports', icon: FileText },
        { name: 'Análise', path: '/analysis', icon: BarChart3 },
      ]
    },
    {
      title: 'Lançamentos',
      icon: DollarSign,
      color: '#22c55e',
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
      color: '#a855f7',
      items: [
        { name: 'Investimentos', path: '/investments', icon: TrendingUp },
      ]
    },
    {
      title: 'Assessor Simplific',
      icon: Bot,
      color: '#6366f1',
      items: [
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
      color: '#ec4899',
      items: [
        { name: 'Agenda', path: '/schedule', icon: Calendar },
        { name: 'Contatos', path: '/contacts', icon: Users },
      ]
    },
    {
      title: 'Configurações e outros',
      icon: Settings,
      color: '#f97316',
      items: [
        { name: 'Contas Bancárias', path: '/bank-accounts', icon: Landmark },
        { name: 'Categorias', path: '/categories', icon: Tags },
        { name: 'Conquistas', path: '/achievements', icon: Award },
        { name: 'Configurações', path: '/settings', icon: Settings },
        { name: 'Admin', path: '/admin', icon: Users, adminOnly: true },
        { name: 'Marketing', path: '/admin/marketing', icon: Megaphone, adminOnly: true },
      ]
    },
    {
      title: 'Simplific Empresas',
      icon: Building2,
      color: '#06b6d4',
      items: [
        { name: 'Acessar Empresa', path: '/business', icon: Briefcase, adminOnly: true },
      ]
    },
  ];

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
        styles.sidebar,
        isMobileOpen ? styles.sidebarMobile : styles.sidebarMobileHidden,
        isDesktopOpen ? styles.sidebarDesktopOpen : styles.sidebarDesktopClosed
      )}
    >
      <button 
        onClick={() => setIsDesktopOpen(!isDesktopOpen)} 
        className={styles.toggleButton}
      >
        {isDesktopOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className={cn(styles.logoArea, !isDesktopOpen && styles.logoAreaClosed)}>
        <img src={logo} alt="Simplific Pro" className={styles.logoImg} />
        {isDesktopOpen && (
            <span className={styles.logoText}>
                Simplific Pro
            </span>
        )}
      </div>

      <nav className={styles.navContainer}>
        {visibleMenu.map((group) => {
          const isOpen = openMenus[group.title];
          const isChildActive = group.items.some(item => !item.isExternal && location.pathname === item.path);

          return (
            <div key={group.title} className={styles.navGroup}>
              <button
                onClick={() => toggleMenu(group.title)}
                className={cn(
                  styles.groupButton,
                  !isDesktopOpen && styles.groupButtonClosed,
                  ((!isOpen && isChildActive) || isOpen) && styles.groupButtonActive
                )}
              >
                <group.icon 
                    className={cn(
                        styles.groupIcon, 
                        isDesktopOpen && styles.groupIconOpen
                    )} 
                    style={{ color: group.color }}
                />
                
                {isDesktopOpen && (
                  <>
                    <span className={styles.groupTitle}>{group.title}</span>
                    <ChevronDown 
                      className={cn(styles.chevron, isOpen && styles.chevronOpen)} 
                    />
                  </>
                )}

                {!isDesktopOpen && (
                  <span className={styles.tooltip}>
                    {group.title}
                  </span>
                )}
              </button>

              {isDesktopOpen && isOpen && (
                <div className={styles.subItemsContainer}>
                  {group.items.map((item) => {
                    if (item.isExternal) {
                      return (
                        <a
                          key={item.name}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.navLink}
                        >
                          <item.icon className={styles.navLinkIcon} />
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
                          cn(styles.navLink, isActive && styles.navLinkActive)
                        }
                      >
                          <item.icon className={styles.navLinkIcon} /> 
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

      <div className={styles.footer}>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            className="hidden"
            accept="image/png, image/jpeg"
        />
        <div 
          className={cn(styles.profileCard, !isDesktopOpen && styles.profileCardClosed)} 
          onClick={() => !isUploading && fileInputRef.current.click()}
        >
          <div className={styles.avatarContainer}>
            {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Foto" className={styles.avatarImage} />
            ) : (
                <div className={styles.avatarFallback}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            )}
            {isUploading && (
              <div className={styles.uploadIndicator}>
                <div className={styles.spinner}></div>
              </div>
            )}
          </div>
          
          {isDesktopOpen && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.name || 'Usuário'}</p>
              <p className={styles.profileRole}>{user?.profile === 'admin' ? 'Administrador' : 'Membro'}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogoutClick}
          className={cn(styles.logoutButton, !isDesktopOpen && styles.logoutButtonClosed)}
        >
          <LogOut className={styles.logoutIcon} />
          {isDesktopOpen && <span className={styles.logoutText}>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;