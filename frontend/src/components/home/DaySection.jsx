import React, { useState, useEffect } from 'react';

const daySteps = [
  {
    id: 1,
    time: '07:40',
    title: 'O aviso da fatura chega antes de você terminar o café.',
    desc: 'O Pierre monitora os fechamentos dos seus cartões e te avisa com antecedência o valor consolidado, limites disponíveis e vencimento.',
    badge: 'Cartão de Crédito',
    previewTitle: 'Fatura fechando',
    previewText: 'Pierre: Sua fatura do Nubank fecha em 3 dias! Total acumulado: R$ 1.840,00. Quer ver os maiores gastos?'
  },
  {
    id: 2,
    time: '09:15',
    title: 'Um áudio no caminho, e a reunião com Meet entra na agenda.',
    desc: 'Basta enviar um áudio rápido: o Pierre entende datas, horários e participantes, cria o evento no Google Agenda e gera o link do Google Meet.',
    badge: 'Google Agenda & Meet',
    previewTitle: 'Reunião Agendada',
    previewText: 'Pierre: Call com investidores agendada para quinta às 15:00. Link do Google Meet pronto no seu calendário!'
  },
  {
    id: 3,
    time: '12:30',
    title: 'Pagou o almoço? Foto do cupom ou áudio e já está registrado.',
    desc: 'O Vision AI analisa o cupom fiscal ou interpreta seu áudio na hora, categorizando a despesa em Alimentação sem você precisar digitar.',
    badge: 'Vision AI OCR',
    previewTitle: 'Despesa Registrada',
    previewText: 'Pierre: R$ 142,00 registrado em Alimentação via comprovante fotográfico. Saldo do mês atualizado.'
  },
  {
    id: 4,
    time: '15:30',
    title: 'Curioso com o mercado? Uma pergunta e a B3 responde.',
    desc: 'Pergunte cotações de ações, fundos imobiliários e índices brasileiros em tempo real, diretamente pelo WhatsApp.',
    badge: 'Cotações B3 ao Vivo',
    previewTitle: 'Mercado B3',
    previewText: 'Pierre: PETR4 está a R$ 38,42 (+1,8%) e MXRF11 a R$ 10,25. Sua carteira valorizou 0,94% hoje.'
  },
  {
    id: 5,
    time: '22:00',
    title: 'Antes de dormir, o resumo do dia chega organizado.',
    desc: 'Um resumo claro com tudo o que foi gasto hoje, o saldo disponível até o fim do mês e seus primeiros compromissos de amanhã.',
    badge: 'Fechamento do Dia',
    previewTitle: 'Resumo Diário',
    previewText: 'Pierre: Hoje você realizou 3 lançamentos (total R$ 264,00). Amanhã você tem 2 reuniões no Google Agenda.'
  }
];

const DaySection = () => {
  const [activeId, setActiveId] = useState(1);

  // Troca automática a cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveId(prev => (prev % daySteps.length) + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const current = daySteps.find(s => s.id === activeId) || daySteps[0];

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10" id="diaSection">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

        {/* Coluna da Esquerda: Lista de Horários */}
        <div className="lg:col-span-7">
          <div className="mb-8">
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
              Rotina Real Sem Esforço
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-3">
              Um dia normal. Só que alguém cuidou de tudo.
            </h2>
            <p className="text-zinc-400 text-sm md:text-base">
              Cinco momentos de um dia comum, e o que o Simplific Pro resolve em cada um deles direto pelo WhatsApp.
            </p>
          </div>

          <ol className="space-y-3">
            {daySteps.map((step) => {
              const isActive = step.id === activeId;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(step.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${isActive
                        ? 'bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                        : 'bg-zinc-950/40 border-white/5 hover:border-white/15 text-zinc-400'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-black' : 'bg-white/10 text-zinc-400'
                        }`}>
                        {step.time}
                      </span>
                      <span className={`text-sm md:text-base font-semibold ${isActive ? 'text-white' : 'text-zinc-300'
                        }`}>
                        {step.title}
                      </span>
                    </div>
                    {isActive && (
                      <p className="text-xs md:text-sm text-zinc-400 pl-1 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-400 w-full animate-[shrink_6s_linear]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Coluna da Direita: Palco Visual com Mockup */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-white/10 p-6 shadow-2xl relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <span className="text-2xl font-bold text-white tracking-wider font-mono">
                {current.time}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {current.badge}
              </span>
            </div>

            {/* Simulação da Notificação / Conversa */}
            <div className="bg-zinc-900/90 rounded-2xl border border-white/10 p-5 shadow-lg mb-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WhatsApp • {current.previewTitle}</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {current.previewText}
              </p>
              <div className="text-[10px] text-zinc-500 text-right mt-2">Recebido às {current.time}</div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 flex items-center justify-between">
              <span>Status da automação:</span>
              <span className="text-emerald-400 font-medium">Executado automaticamente</span>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default DaySection;
