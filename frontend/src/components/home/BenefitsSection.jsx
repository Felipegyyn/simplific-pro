import React from 'react';
import { Link } from 'react-router-dom';

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10" id="beneficiosSection">

      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
          Pilares Principais
        </span>
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
          Você manda a mensagem. O Pierre cuida do resto.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          Sem abrir dezenas de aplicativos diferentes: comprovantes lidos por OCR, cotações da B3 em tempo real e reuniões no Google Agenda pelo WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

        {/* Card 1: Vision AI OCR */}
        <article className="rounded-3xl bg-zinc-950/80 border border-white/10 p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none rounded-full" />

          <div>
            {/* Visual da Mini-Cena OCR */}
            <div className="rounded-2xl bg-zinc-900/90 border border-white/10 p-4 mb-6 shadow-inner text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Vision AI • Leitor OCR
                </span>
                <span className="text-emerald-400 font-mono">0.8s</span>
              </div>
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 mb-2.5">
                <div className="text-zinc-400 text-[11px]">Cupom Fiscal Extraído:</div>
                <div className="text-lg font-bold text-white my-1 font-mono">R$ 142,50</div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Farmácia & Saúde</span>
                  <span className="text-emerald-400">Classificado</span>
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Lançado no fluxo de caixa
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              Leitura de Comprovantes por Imagem ou PDF
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Fotografe a nota de um restaurante, posto ou cupom da farmácia. O Pierre lê os dados na hora e registra no seu painel com categoria e método de pagamento.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>Adeus digitação manual</span> &rarr;
          </div>
        </article>

        {/* Card 2: Mercado B3 */}
        <article className="rounded-3xl bg-zinc-950/80 border border-white/10 p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none rounded-full" />

          <div>
            {/* Visual da Mini-Cena B3 */}
            <div className="rounded-2xl bg-zinc-900/90 border border-white/10 p-4 mb-6 shadow-inner text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  B3 • Cotação em Tempo Real
                </span>
                <span className="text-emerald-400 font-mono">Ao vivo</span>
              </div>
              <div className="space-y-2 mb-2.5">
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">PETR4</span>
                    <span className="text-[10px] text-zinc-400 block">Petrobras PN</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white font-bold block">R$ 38,42</span>
                    <span className="text-[10px] text-emerald-400 font-medium">+1,82% hoje</span>
                  </div>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">MXRF11</span>
                    <span className="text-[10px] text-zinc-400 block">Fundo Imobiliário</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white font-bold block">R$ 10,25</span>
                    <span className="text-[10px] text-emerald-400 font-medium">+0,49% hoje</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Carteira Consolidada:</span>
                <span className="text-white font-bold font-mono">R$ 24.650,00</span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              Mercado B3 & Cotações Direto no Chat
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Acompanhe suas ações e fundos imobiliários favoritos a qualquer hora do dia. O Pierre consulta a B3 instantaneamente e traz o desempenho da sua carteira.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>Inteligência de mercado</span> &rarr;
          </div>
        </article>

        {/* Card 3: Google Agenda & Meet */}
        <article className="rounded-3xl bg-zinc-950/80 border border-white/10 p-6 md:p-8 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none rounded-full" />

          <div>
            {/* Visual da Mini-Cena Google Meet */}
            <div className="rounded-2xl bg-zinc-900/90 border border-white/10 p-4 mb-6 shadow-inner text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Google Agenda & Meet
                </span>
                <span className="text-emerald-400 font-mono">Sincronizado</span>
              </div>
              <div className="bg-black/50 p-3 rounded-xl border border-white/5 mb-2.5">
                <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1">
                  <span>Quinta-feira, 15:00</span>
                  <span className="text-emerald-400">Confirmado</span>
                </div>
                <div className="text-sm font-semibold text-white mb-2">
                  Reunião Estratégica • Investimentos
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px]">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                  <span>meet.google.com/xyz-abcd</span>
                </div>
              </div>
              <div className="text-[11px] text-zinc-400">
                Convite enviado para os participantes
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              Google Agenda & Reuniões com Link do Meet
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Basta mandar um áudio pedindo para marcar uma conversa. O Simplific Pro agenda no calendário oficial do Google, cria o link do Meet e te lembra no horário.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>Sua rotina no piloto automático</span> &rarr;
          </div>
        </article>

      </div>

      <div className="mt-12 text-center">
        <Link
          to="/beneficios"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>Explorar todos os benefícios em detalhes</span> &rarr;
        </Link>
      </div>

    </section>
  );
};

export default BenefitsSection;
