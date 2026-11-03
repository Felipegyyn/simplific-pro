import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  return (
    <header className="sp-nav">
      <div className="sp-frame sp-nav-inner">
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" className="sp-nav-link">
            Entrar
          </Link>
          <Link to="/login?tab=register" className="sp-nav-cta">
            Testar 7 dias grátis
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
