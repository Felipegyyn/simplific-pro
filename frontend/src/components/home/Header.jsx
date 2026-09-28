import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/LOGO.png';

const Header = () => {
  return (
    <><header className="glass-header">
        
        <Link to="/" className="logo-link logo-troca">
            <img src={logo} alt="Simplific Pro Logo" className="header-logo logo-no-escuro" />
            <img src={logo} alt="" aria-hidden="true" className="header-logo logo-no-claro" />
        </Link>
        <nav className="header-nav">
            <Link to="/beneficios">Benefícios</Link>
            <Link to="/inteligencia">Inteligência</Link>
            <Link to="/planos">Planos</Link>
            <Link to="/seguranca">Segurança</Link>
            <Link to="/contato">Contato</Link>
        </nav>
        
        <Link to="/checkout" className="header-cta">Começar agora &rarr;</Link>

        <button className="header-menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-do-celular">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <nav className="menu-movel" id="menu-do-celular" aria-label="Menu do site">
            <Link to="/beneficios">Benefícios</Link>
            <Link to="/inteligencia">Inteligência</Link>
            <Link to="/planos">Planos</Link>
            <Link to="/seguranca">Segurança</Link>
            <Link to="/contato">Contato</Link>
            
            <Link to="/checkout" className="mm-acao">Começar agora &rarr;</Link>
            <Link to="/login" className="mm-login">Fazer login</Link>
        </nav>
    </header></>
  );
};

export default Header;
