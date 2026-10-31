import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  'Pierre (IA Oficial) disponível no seu WhatsApp 24/7',
  'Lançamentos ilimitados por áudio, foto de comprovante ou texto',
  'Leitor OCR inteligente de cupons fiscais e recibos',
  'Controle de cartões, faturas e melhor dia de compra',
  'Acompanhamento de ativos, ações e FIIs da B3 em tempo real',
  'Google Agenda integrada com links de Google Meet automáticos',
  'Painel Web Vision AI completo com gráficos de fluxo de caixa',
  'Conta de casal / compartilhamento com seu parceiro(a)',
  'Criptografia de nível bancário AES-256 e privacidade total'
];

const PricingSection = () => {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10" id="planos">

      {/* Topo da Seção de Preços */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
          Preço Simples e Transparente
        </span>
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
          Tudo liberado. Sem pegadinhas nem limites de uso.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Tenha seu assistente de finanças e rotina no WhatsApp 24 horas por dia, por menos de R$ 0,55 por dia.
        </p>
      </div>

      {/* Grade de 2 Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">

        {/* Plano Anual (Destaque Principal) */}
        <div className="rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-2 border-emerald-500/50 p-8 flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
          {/* Badge de Economia */}
          <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow">
            Mais Escolhido • 44% OFF
          </div>

          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2">
              Plano Anual
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Acesso Completo Anual
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mb-6">
              A escolha mais inteligente. Pague o equivalente a centavos por dia e garanta a organização definitiva da sua rotina.
            </p>

            {/* Preço */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <span className="text-xs text-zinc-500 block mb-1">12x de apenas</span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-xl font-bold text-emerald-400">R$</span>
                <span className="text-5xl font-extrabold tracking-tight">16</span>
                <span className="text-2xl font-bold">,58</span>
                <span className="text-zinc-400 text-sm font-normal">/mês</span>
              </div>
              <span className="text-xs text-zinc-400 block mt-1.5">
                ou R$ 199,90 à vista no PIX / cartão
              </span>
            </div>

            {/* Lista de Recursos */}
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-8">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              to="/checkout?plan=annual"
              className="w-full py-4 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-center text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all block transform hover:-translate-y-0.5"
            >
              Garantir 44% de desconto &rarr;
            </Link>
            <p className="text-[11px] text-zinc-500 text-center mt-3">
              Garantia de 7 dias • Devolução integral sem burocracia
            </p>
          </div>
        </div>

        {/* Plano Mensal */}
        <div className="rounded-3xl bg-zinc-950/80 border border-white/10 p-8 flex flex-col justify-between backdrop-blur-xl relative">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
              Plano Mensal
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Flexibilidade Mês a Mês
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm mb-6">
              Para quem deseja testar no dia a dia. Sem compromisso de longo prazo, cancele com um clique quando quiser.
            </p>

            {/* Preço */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <span className="text-xs text-zinc-500 block mb-1">Assinatura mensal recorrente</span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-xl font-bold text-zinc-400">R$</span>
                <span className="text-5xl font-extrabold tracking-tight">29</span>
                <span className="text-2xl font-bold">,90</span>
                <span className="text-zinc-400 text-sm font-normal">/mês</span>
              </div>
              <span className="text-xs text-zinc-400 block mt-1.5">
                Cobrança mensal no cartão ou PIX
              </span>
            </div>

            {/* Lista de Recursos */}
            <ul className="space-y-3 text-xs sm:text-sm text-zinc-400 mb-8">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link
              to="/checkout"
              className="w-full py-4 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-center text-sm border border-white/15 transition-all block"
            >
              Assinar Plano Mensal &rarr;
            </Link>
            <p className="text-[11px] text-zinc-500 text-center mt-3">
              Sem fidelidade • Cancele a qualquer momento
            </p>
          </div>
        </div>

      </div>

      {/* Selo de Garantia 7 Dias */}
      <div className="max-w-xl mx-auto mt-12 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Garantia Incondicional de 7 Dias</h4>
          <p className="text-xs text-zinc-400">
            Use sem compromisso por 7 dias. Se não se adaptar, devolvemos 100% do seu dinheiro imediatamente com uma simples mensagem.
          </p>
        </div>
      </div>

    </section>
  );
};

export default PricingSection;
