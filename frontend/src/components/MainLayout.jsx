import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarBusiness from './SidebarBusiness';
import { Menu } from 'lucide-react';
import logo from '../assets/LOGO.png';
import ChatWidget from './ChatWidget';

// Importação do CSS Modular
import styles from './MainLayout.module.css';

const MainLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const location = useLocation();
  const isBusinessRoute = location.pathname.startsWith('/business');

  return (
    <div className={styles.layoutContainer}>
      
      {/* Sidebar Desktop */}
      <div className={styles.sidebarDesktop}>
        {isBusinessRoute ? (
          <SidebarBusiness user={user} onLogout={onLogout} />
        ) : (
          <Sidebar user={user} onLogout={onLogout} />
        )}
      </div>

      {/* Mobile Sidebar com Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className={styles.mobileOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className={styles.sidebarMobile}>
            {isBusinessRoute ? (
              <SidebarBusiness 
                user={user} 
                onLogout={onLogout} 
                isMobileOpen={true}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            ) : (
              <Sidebar 
                user={user} 
                onLogout={onLogout} 
                isMobileOpen={true}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            )}
          </div>
        </>
      )}

      {/* Conteúdo Principal */}
      <div className={styles.mainContentWrapper}>
        
        {/* Header Mobile */}
        <header className={styles.mobileHeader}>
          <button 
            className={styles.menuButton}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir Menu"
          >
            <Menu size={24} />
          </button>
          
          <div className={styles.logoContainer}>
            <img src={logo} alt="Simplific Pro" className={styles.logoIcon} />
            <h1 className={styles.logoText}>
                {isBusinessRoute ? 'Simplific Empresas' : 'Simplific Pro'}
            </h1>
          </div>
          
          <div style={{ width: '24px' }}></div> 
        </header>

        <main className={styles.mainArea}>
          <Outlet /> 
        </main>

        {/* Componente de Mini Chat */}
        <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Botão Flutuante Simplific IA */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={styles.floatingButton}
          title="Falar com Simplific IA"
        >
          <div className={styles.floatingGlow}></div>
          
          <div className={styles.floatingCircle}>
            <img 
                src="/favicon.ico" 
                alt="IA" 
                className={styles.floatingAvatar}
                onError={(e) => { e.target.src = logo }} 
            />
          </div>

          <div className={styles.floatingTooltip}>
              Falar com Simplific IA
              <div className={styles.tooltipArrow}></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MainLayout;