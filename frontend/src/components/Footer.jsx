import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/HomePage.css';

const Footer = () => {
  return (
    <footer className="sp-footer-void">
      <div className="sp-frame sp-footer-line">
        <div>
          <Link to="/" className="sp-footer-link" style={{ fontWeight: 600 }}>
            Simplific Pro · Assessor Financeiro IA
          </Link>
        </div>

        <nav className="sp-footer-links" aria-label="Links Institucionais">
          <Link to="/" className="sp-footer-link">Início</Link>
          <Link to="/beneficios" className="sp-footer-link">Benefícios</Link>
          <Link to="/inteligencia" className="sp-footer-link">Inteligência IA</Link>
          <Link to="/seguranca" className="sp-footer-link">Segurança</Link>
          <Link to="/planos" className="sp-footer-link">Planos</Link>
          <Link to="/checkout?plan=annual" className="sp-footer-link">Assinar</Link>
          <Link to="/contato" className="sp-footer-link">Contato</Link>
          <Link to="/login" className="sp-footer-link">Entrar</Link>
        </nav>

        <div style={{ textAlign: 'right' }}>
          <span>© {new Date().getFullYear()} Simplific · </span>
          <Link to="/termos" className="sp-footer-link">Termos</Link>
          <span> · </span>
          <Link to="/privacidade" className="sp-footer-link">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
