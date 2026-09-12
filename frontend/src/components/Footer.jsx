import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const go = (path) => { navigate(path); window.scrollTo(0, 0); };
  return (
    <footer className="border-t border-white/10 bg-[#080908] py-12 text-white/45">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <button type="button" onClick={() => go('/')} className="flex items-center gap-2.5 text-left"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-[#10130d]">SP</span><span className="text-base font-semibold text-white">Simplific <span className="text-white/40">Pro</span></span></button>
          <p className="mt-4 max-w-xs text-sm leading-6">A inteligência que simplifica sua vida financeira.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm"><button type="button" onClick={() => go('/termos')} className="transition-colors hover:text-lime-300">Termos de uso</button><button type="button" onClick={() => go('/privacidade')} className="transition-colors hover:text-lime-300">Privacidade</button><button type="button" onClick={() => go('/contato')} className="transition-colors hover:text-lime-300">Contato</button><a href="mailto:contato@simplificpro.com" className="transition-colors hover:text-lime-300">Fale com a gente</a></div>
        <div className="flex flex-col gap-4 md:items-end">
          <div id="ra-verified-seal" className="min-h-6" aria-label="Selo de verificação Reclame Aqui" />
          <p className="text-xs text-white/25 md:text-right">© 2026 Simplific Pro<br />41.851.029/0001-64. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
