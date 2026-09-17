import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import SidebarBusiness from './SidebarBusiness';
import { Menu, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
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

  // Checagem do Paywall (Fim dos 7 dias grátis)
  const isSubscriptionExpired = user?.subscription_valid_until && new Date(user.subscription_valid_until) < new Date();

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
          {isSubscriptionExpired ? (
            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl border border-gray-100">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Seu período de teste grátis terminou</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Esperamos que o Simplific Pro tenha ajudado a organizar suas finanças nestes 7 dias! 
                  Para continuar utilizando a plataforma e a inteligência artificial, escolha um de nossos planos.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-2xl p-6 hover:border-green-500 transition-colors bg-gray-50 flex flex-col h-full relative">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Plano Mensal</h3>
                    <p className="text-gray-500 text-sm mb-4">Acesso total com renovação mensal.</p>
                    <div className="text-3xl font-extrabold text-green-600 mb-6">R$ 29,90<span className="text-sm text-gray-500 font-normal">/mês</span></div>
                    
                    <div className="flex-grow"></div>
                    <Link to="/checkout?plan=monthly" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/30">
                      Assinar Mensal <ArrowRight size={18} />
                    </Link>
                  </div>

                  <div className="border-2 border-emerald-500 rounded-2xl p-6 bg-emerald-50/30 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">MAIS POPULAR</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Plano Anual</h3>
                    <p className="text-gray-500 text-sm mb-4">Economia de 44% no ano (Equivale a R$16,65/mês)</p>
                    <div className="text-3xl font-extrabold text-emerald-600 mb-6">R$ 199,90<span className="text-sm text-gray-500 font-normal">/ano</span></div>
                    
                    <div className="flex-grow"></div>
                    <Link to="/checkout?plan=annual" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30">
                      Assinar Anual <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                   <CheckCircle2 size={16} className="text-green-500" />
                   Pagamento seguro e transparente via Asaas.
                </div>
              </div>
            </div>
          ) : (
            <Outlet /> 
          )}
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