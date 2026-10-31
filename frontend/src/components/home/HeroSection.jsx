import React from 'react';
import { Link } from 'react-router-dom';
import SimplificMascot from '../SimplificMascot';

const HeroSection = () => {
  return (
    <section className="hero-container relative z-10 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">

      {/* Mascote Oficial Pierre em Destaque */}
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative p-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.25)] transition-transform duration-500 hover:scale-105">
          <SimplificMascot size={110} />
          <span className="absolute -bottom-1 right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
            Pierre IA
          </span>
        </div>
      </div>

      <div className="hero-content max-w-3xl flex flex-col items-center">
        {/* Chip / Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>+ 250 mil lançamentos organizados</span>
        </div>

        {/* Título Principal */}
        <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight">
          Seu dinheiro organizado numa conversa de WhatsApp.
        </h1>

        {/* Subtítulo */}
        <p className="hero-sub text-base sm:text-lg text-zinc-400 mb-8 max-w-2xl leading-relaxed">
          Sem planilhas manuais e sem telas confusas. Mande áudio, foto de comprovante ou texto: a inteligência artificial do Simplific Pro categoriza gastos, gerencia cartões, acompanha a B3 e organiza sua agenda.
        </p>

        {/* Ações / Botões */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14 w-full sm:w-auto">
          <Link
            to="/checkout?plan=annual"
            className="hero-btn cta-forte w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-black font-semibold text-base shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5 text-center"
          >
            <span>Começar agora por R$ 16,58/mês &rarr;</span>
          </Link>
          <Link
            to="/planos"
            className="w-full sm:w-auto px-6 py-4 rounded-full border border-white/15 text-zinc-300 hover:text-white hover:border-white/30 text-sm font-medium transition-colors text-center"
          >
            Conhecer os planos
          </Link>
        </div>
      </div>

      {/* Simulação Interativa e Realista do Chat WhatsApp */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-zinc-950/80 border border-white/10 p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden text-left">
        {/* Glow interno */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header do WhatsApp Mockup */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
              <SimplificMascot size={34} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm">Simplific Pro • Pierre</span>
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="text-xs text-emerald-400">Online 24h • Assessor Pessoal</span>
            </div>
          </div>
          <span className="text-[11px] text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
            Criptografia AES-256
          </span>
        </div>

        {/* Mensagens do Chat */}
        <div className="space-y-3.5 text-xs sm:text-sm">

          {/* Mensagem 1: Usuário (Áudio + Comprovante) */}
          <div className="flex justify-end">
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-zinc-200">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-400 text-xs">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="font-medium">Mensagem de áudio (0:09)</span>
              </div>
              <p className="text-zinc-300">
                "Pierre, almocei no Outback com o cliente, deu R$ 142 no Nubank. E marca uma call com o Felipe amanhã às 15h sobre investimentos!"
              </p>
              <div className="text-[10px] text-zinc-500 text-right mt-1">12:35 ✓✓</div>
            </div>
          </div>

          {/* Resposta 1: Pierre IA */}
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 max-w-[90%] text-zinc-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-semibold text-emerald-400 text-xs">Ações executadas com sucesso:</span>
              </div>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <div>
                    <strong>R$ 142,00</strong> lançado em <span className="text-emerald-400">Alimentação</span> no <strong>Cartão Nubank</strong>. Fatura atual: R$ 1.840 de R$ 5.000 (36% do limite).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <div>
                    Reunião agendada no <strong>Google Agenda</strong> para amanhã às 15:00 com link do <strong>Google Meet</strong> criado. Convite enviado!
                  </div>
                </li>
              </ul>
              <div className="text-[10px] text-zinc-500 text-right mt-1.5">12:35</div>
            </div>
          </div>

          {/* Mensagem 2: Usuário (B3) */}
          <div className="flex justify-end">
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl rounded-tr-sm p-2.5 max-w-[85%] text-zinc-200">
              <p>Quanto tá a PETR4 agora e quanto tenho em ações?</p>
              <div className="text-[10px] text-zinc-500 text-right mt-1">14:12 ✓✓</div>
            </div>
          </div>

          {/* Resposta 2: Pierre IA */}
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 max-w-[90%] text-zinc-200 shadow-sm">
              <p className="text-zinc-300 mb-1.5">
                📊 <strong>PETR4</strong> está cotada a <strong>R$ 38,42 (+1,8%)</strong> hoje.
              </p>
              <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                <span>Carteira B3 Consolidada:</span>
                <span className="text-emerald-400 font-bold">R$ 24.650,00</span>
              </div>
              <div className="text-[10px] text-zinc-500 text-right mt-1.5">14:12</div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};

export default HeroSection;
