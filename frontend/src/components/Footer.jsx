import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 text-center">
        <div 
          className="flex items-center justify-center gap-2 mb-6 cursor-pointer"
          onClick={() => handleNav('/')}
        >
            <div className="bg-green-600 text-white p-1 rounded font-bold">SP</div>
            <span className="text-xl font-bold text-white tracking-tight">Simplific Pro</span>
        </div>
        <p className="mb-6">A solução completa para sua vida financeira.</p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
          <button onClick={() => handleNav('/termos')} className="hover:text-white transition-colors">Termos de Uso</button>
          <button onClick={() => handleNav('/privacidade')} className="hover:text-white transition-colors">Privacidade</button>
          <button onClick={() => handleNav('/contato')} className="hover:text-white transition-colors">Contato</button>
        </div>
        
        <p className="text-sm mb-4">
            Dúvidas? Envie um e-mail para <a href="mailto:contato@simplificpro.com" className="text-green-400 hover:underline">contato@simplificpro.com</a>
        </p>
        <p className="text-xs opacity-50">© 2025 Simplific Pro. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;