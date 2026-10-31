import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/LOGO.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={`glass-header ${isMenuOpen ? 'menu-aberto' : ''}`}>
      <Link to="/" className="logo-link logo-troca" onClick={closeMenu}>
        <img src={logo} alt="Simplific Pro Logo" className="header-logo logo-no-escuro" />
        <img src={logo} alt="Simplific Pro Logo" aria-hidden="true" className="header-logo logo-no-claro" />
      </Link>

      <nav className="header-nav">
        <Link to="/beneficios">Benefícios</Link>
        <Link to="/inteligencia">Inteligência</Link>
        <Link to="/planos">Planos</Link>
        <Link to="/seguranca">Segurança</Link>
        <Link to="/contato">Contato</Link>
      </nav>

      <div className="flex items-center gap-3">
        <Link 
          to="/login" 
          className="hidden md:inline-flex items-center text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
        >
          Entrar
        </Link>
        <Link 
          to="/checkout?plan=annual" 
          className="header-cta shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
        >
          Começar agora &rarr;
        </Link>

        <button 
          className="header-menu" 
          type="button" 
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"} 
          aria-expanded={isMenuOpen} 
          aria-controls="menu-do-celular"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav 
        className={`menu-movel ${isMenuOpen ? 'is-aberto' : ''}`} 
        id="menu-do-celular" 
        aria-label="Menu do site"
      >
        <Link to="/beneficios" onClick={closeMenu}>Benefícios</Link>
        <Link to="/inteligencia" onClick={closeMenu}>Inteligência</Link>
        <Link to="/planos" onClick={closeMenu}>Planos</Link>
        <Link to="/seguranca" onClick={closeMenu}>Segurança</Link>
        <Link to="/contato" onClick={closeMenu}>Contato</Link>
        
        <Link to="/checkout?plan=annual" className="mm-acao" onClick={closeMenu}>Começar agora &rarr;</Link>
        <Link to="/login" className="mm-login" onClick={closeMenu}>Fazer login</Link>
      </nav>
    </header>
  );
};

export default Header;
