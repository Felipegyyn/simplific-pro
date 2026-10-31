import React, { useState } from 'react';
import SimplificMascot from '../SimplificMascot';

const specialities = [
  {
    id: 'financeiro',
    title: 'Gestor Financeiro',
    role: 'Fluxo de Caixa & Gastos',
    desc: 'Registra qualquer gasto por áudio ou texto em segundos. Categoriza automaticamente, calcula saldo e prevê o fechamento do mês.',
    badge: 'Despesas & Receitas',
    exampleChat: {
      user: 'Pierre, almoço R$ 89,90 no débito Itaú.',
      reply: 'Lançado em Alimentação (Débito Itaú). Você já usou R$ 680 dos R$ 1.200 orçados para o mês.'
    }
  },
  {
    id: 'cartoes',
    title: 'Controle de Cartões',
    role: 'Faturas & Limites',
    desc: 'Acompanha o fechamento de cada cartão, calcula seu limite disponível e avisa o melhor dia para comprar sem surpresas no fim do mês.',
    badge: 'Cartões & Faturas',
    exampleChat: {
      user: 'Quanto já gastei no cartão esse mês?',
      reply: 'Sua fatura atual está em R$ 1.840 de R$ 5.000 (36% do limite). O fechamento é em 6 dias!'
    }
  },
  {
    id: 'investimentos',
    title: 'Analista B3',
    role: 'Ações & FIIs ao Vivo',
    desc: 'Conectado diretamente ao mercado financeiro para trazer cotações em tempo real, variação do dia e consolidação patrimonial.',
    badge: 'Bolsa B3 & FIIs',
    exampleChat: {
      user: 'Como tá a cotação da PETR4 hoje?',
      reply: 'PETR4 está em R$ 38,42 (+1,8% hoje). Sua posição total na carteira é de R$ 12.800.'
    }
  },
  {
    id: 'agenda',
    title: 'Secretário de Agenda',
    role: 'Google Agenda & Meet',
    desc: 'Cria reuniões direto no seu Google Agenda através de um áudio, gera o link da sala no Google Meet e te avisa 15 minutos antes.',
    badge: 'Agenda & Reuniões',
    exampleChat: {
      user: 'Marca call amanhã às 15h com Felipe sobre planejamento.',
      reply: 'Feito! Evento agendado no Google Agenda e sala do Google Meet gerada. Convite enviado para Felipe.'
    }
  },
  {
    id: 'vision',
    title: 'Auditor Vision AI',
    role: 'Leitura OCR de Fotos e PDF',
    desc: 'Basta enviar a foto do cupom fiscal da farmácia, da maquininha ou o PDF do comprovante. O OCR inteligente extrai os dados na hora.',
    badge: 'OCR & Comprovantes',
    exampleChat: {
      user: '📸 [Foto do cupom da farmácia: R$ 62,50]',
      reply: 'Comprovante lido com sucesso! R$ 62,50 adicionado em Saúde & Farmácia.'
    }
  }
];

const TeamSection = () => {
  const [activeId, setActiveId] = useState('financeiro');
  const current = specialities.find(s => s.id === activeId) || specialities[0];

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10" id="teamSection">

      {/* Cabeçalho da Seção */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
          Mascote Oficial & Especialidades
        </span>
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-4">
          Uma inteligência artificial completa no seu WhatsApp.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          O Pierre reúne as principais disciplinas da sua vida financeira e da sua rotina pessoal num só contato. Escolha uma especialidade para ver como ele age:
        </p>
      </div>

      {/* Navegação de Abas / Especialidades */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
        {specialities.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${isActive
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/80 text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                }`}
            >
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Card Principal Interativo */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-950/90 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">

        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

          {/* Lado Esquerdo: Pierre + Detalhes */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative mb-4 p-3 rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
              <SimplificMascot size={110} />
              <span className="absolute -bottom-2 right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                {current.badge}
              </span>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-1">
              Pierre • {current.title}
            </h3>
            <span className="text-emerald-400 text-xs font-medium mb-3">
              {current.role}
            </span>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6">
              {current.desc}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Resposta média em menos de 3 segundos</span>
            </div>
          </div>

          {/* Lado Direito: Preview Real do WhatsApp */}
          <div className="md:col-span-7 bg-zinc-900/90 rounded-2xl border border-white/10 p-5 shadow-lg flex flex-col gap-3">
            <div className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider pb-2 border-b border-white/5 flex items-center justify-between">
              <span>Como você pede no WhatsApp</span>
              <span className="text-emerald-400 font-normal">Exemplo real</span>
            </div>

            {/* Mensagem do Usuário */}
            <div className="flex justify-end">
              <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl rounded-tr-sm p-3 text-xs sm:text-sm text-zinc-200 max-w-[90%]">
                <p>{current.exampleChat.user}</p>
                <div className="text-[10px] text-zinc-500 text-right mt-1">Agora mesmo ✓✓</div>
              </div>
            </div>

            {/* Resposta do Pierre */}
            <div className="flex justify-start">
              <div className="bg-black/60 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-xs sm:text-sm text-zinc-200 max-w-[95%] shadow">
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 font-semibold text-xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>Simplific Pro Pierre</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {current.exampleChat.reply}
                </p>
                <div className="text-[10px] text-zinc-500 text-right mt-1.5">Agora mesmo</div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default TeamSection;
