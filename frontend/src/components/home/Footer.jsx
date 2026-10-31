import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/LOGO.png';
import SimplificMascot from '../SimplificMascot';

const Footer = () => {
  return (
    <footer className="site-footer bg-black text-white border-t border-white/10 pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

          {/* Coluna 1: Marca & Pierre */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto" />
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-6">
              Sua vida financeira e sua rotina organizadas numa conversa de WhatsApp. Gastos, cartões, investimentos B3 e agenda no piloto automático com inteligência artificial.
            </p>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/80 border border-white/10">
              <SimplificMascot size={40} />
              <div className="text-xs">
                <span className="font-semibold text-white block">Pierre • Assistente Oficial</span>
                <span className="text-emerald-400">Online 24h via WhatsApp</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Simplific Pro
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link to="/beneficios" className="hover:text-emerald-400 transition-colors">Benefícios</Link></li>
              <li><Link to="/inteligencia" className="hover:text-emerald-400 transition-colors">Inteligência</Link></li>
              <li><Link to="/planos" className="hover:text-emerald-400 transition-colors">Planos & Preços</Link></li>
              <li><Link to="/seguranca" className="hover:text-emerald-400 transition-colors">Segurança LGPD</Link></li>
              <li><Link to="/contato" className="hover:text-emerald-400 transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Conta & Acesso */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Sua Conta
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Acessar Painel</Link></li>
              <li><Link to="/checkout?plan=annual" className="hover:text-emerald-400 transition-colors">Começar no Anual</Link></li>
              <li><Link to="/checkout" className="hover:text-emerald-400 transition-colors">Plano Mensal</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Suporte Humano */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Suporte & Atendimento
            </h4>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Dúvidas sobre pagamentos, planos ou acesso? Fale diretamente com nosso time:
            </p>
            <a
              href="mailto:contato@simplificpro.com"
              className="text-xs text-emerald-400 hover:underline block mb-2 font-mono"
            >
              contato@simplificpro.com
            </a>
            <a
              href="https://wa.me/5547992921005"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.05 2C6.49 2 2 6.49 2 12.05c0 1.95.56 3.77 1.53 5.32L2 22l4.79-1.5a10.02 10.02 0 005.26 1.48c5.56 0 10.05-4.49 10.05-10.05S17.61 2 12.05 2z" />
              </svg>
              <span>Suporte via WhatsApp</span>
            </a>
          </div>

        </div>

        {/* Rodapé Inferior: Copyright & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Simplific Pro LTDA. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacidade" className="hover:text-zinc-300 transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-zinc-300 transition-colors">Termos de Uso</Link>
            <Link to="/seguranca" className="hover:text-zinc-300 transition-colors">Segurança</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
