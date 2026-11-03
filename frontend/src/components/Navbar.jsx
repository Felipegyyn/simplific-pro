import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../pages/HomePage.css';

const NAV_ROUTES = [
  { to: '/', label: 'Início' },
  { to: '/beneficios', label: 'Benefícios' },
  { to: '/inteligencia', label: 'Inteligência IA' },
  { to: '/seguranca', label: 'Segurança' },
  { to: '/planos', label: 'Planos' },
  { to: '/contato', label: 'Contato' }
];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname === '/home' ? '/' : location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sp-nav">
      <div className="sp-frame">
        <div className="sp-nav-inner">
          <Link to="/" className="sp-wordmark" aria-label="Simplific Pro — Página Inicial">
            <span className="sp-wordmark-mark" aria-hidden="true">S</span>
            <span>Simplific Pro</span>
          </Link>

          <nav className="sp-nav-links" aria-label="Navegação Principal">
            {NAV_ROUTES.map((item) => {
              const isActive = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="sp-nav-link"
                  aria-current={isActive ? 'page' : undefined}
                  style={isActive ? { color: '#10b981' } : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="sp-nav-actions">
            <Link to="/login" className="sp-nav-link">
              Entrar
            </Link>
            <Link to="/login?tab=register" className="sp-nav-cta">
              Testar 7 dias grátis
            </Link>
            <button
              type="button"
              className="sp-mobile-toggle"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="sp-mobile-drawer" aria-label="Navegação Mobile">
            {NAV_ROUTES.map((item) => {
              const isActive = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="sp-mobile-drawer-link"
                  style={isActive ? { color: '#10b981' } : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link to="/login" className="sp-mobile-drawer-link">
              <span>Entrar na minha conta</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
