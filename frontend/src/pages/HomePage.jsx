import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Camera, 
  Search, 
  Users, 
  Sparkles, 
  Lock, 
  MessageSquare,
  Play,
  Pause,
  Clock,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import SimplificMascot from '../components/SimplificMascot';
import logo from '../assets/LOGO.png';

const acts = [
  {
    id: 'despesas',
    label: 'Despesas & Cartões',
    icon: TrendingUp,
    title: 'Controle de gastos e faturas sem abrir aplicativo.',
    description: 'Envie um áudio rápido no trânsito ou uma mensagem de texto. O Simplific categoriza na hora, calcula quanto falta para o limite do cartão e avisa a melhor data de compra.',
    chat: {
      time: '12:34',
      userType: 'audio',
      userContent: 'Áudio (0:07): "Simplific, almoço executivo R$ 142 no Nubank"',
      botStatus: 'Lançamento confirmado',
      botLines: [
        '✅ R$ 142,00 registrado em Alimentação.',
        '💳 Fatura Nubank atual: R$ 1.840,00 de R$ 5.000,00 (36% do limite).',
        '💡 Dica: Seu melhor dia de compra neste cartão é 24 de novembro.'
      ]
    }
  },
  {
    id: 'investimentos',
    label: 'Bolsa B3 ao Vivo',
    icon: Sparkles,
    title: 'Cotações de ações e FIIs direto no chat.',
    description: 'Acompanhe seus ativos e proventos sem precisar ligar o computador ou entrar no Home Broker. O Simplific consulta a B3 instantaneamente e traz a rentabilidade consolidada da sua carteira.',
    chat: {
      time: '14:15',
      userType: 'text',
      userContent: 'Quanto tá a PETR4 e como fecharam meus FIIs hoje?',
      botStatus: 'Mercado B3 • Atualizado',
      botLines: [
        '📊 PETR4: R$ 38,42 (+1,82%) | MXRF11: R$ 10,25 (+0,49%).',
        '📈 Sua carteira consolidada está em R$ 34.620,00 (+1,14% hoje).',
        '💰 Proventos previstos: R$ 210,00 agendados para cair dia 15.'
      ]
    }
  },
  {
    id: 'agenda',
    label: 'Agenda & Google Meet',
    icon: Calendar,
    title: 'Reuniões agendadas por voz com link do Meet.',
    description: 'Diga quando e com quem quer falar. O Simplific cria o compromisso na sua conta oficial do Google Agenda, gera a sala de videoconferência do Google Meet e agenda o lembrete.',
    chat: {
      time: '16:02',
      userType: 'audio',
      userContent: 'Áudio (0:09): "Marca call amanhã às 15h com o Felipe sobre alocação de carteira"',
      botStatus: 'Google Agenda sincronizado',
      botLines: [
        '📅 Reunião agendada: Amanhã às 15:00 no Google Agenda.',
        '🔗 Sala criada: meet.google.com/xyz-simplific',
        '✉️ Convite enviado para Felipe. Lembrete ativo 15 min antes.'
      ]
    }
  },
  {
    id: 'ocr',
    label: 'Vision AI • Comprovantes',
    icon: Camera,
    title: 'Leitura instantânea de cupons e recibos por foto.',
    description: 'Tire uma foto da comanda do restaurante, do cupom da farmácia ou envie o PDF da maquininha. O motor Vision AI lê o valor, a data e o estabelecimento em menos de um segundo.',
    chat: {
      time: '19:48',
      userType: 'image',
      userContent: '📸 [Foto enviada: Cupom Fiscal Drogasil - R$ 68,90]',
      botStatus: 'Vision AI OCR concluído (0.8s)',
      botLines: [
        '🧾 Comprovante identificado: Drogasil São Paulo.',
        '💊 R$ 68,90 categorizado em Saúde & Farmácia.',
        '🔒 Arquivado no seu cofre de documentos na nuvem.'
      ]
    }
  },
  {
    id: 'inteligencia',
    label: 'Pesquisa Web & Casal',
    icon: Users,
    title: 'Pesquisas inteligentes e finanças compartilhadas.',
    description: 'Consulte projeções econômicas e compartilhe a mesma conta com seu parceiro(a). Ambos registram gastos do próprio WhatsApp e os números se somam no mesmo orçamento.',
    chat: {
      time: '21:10',
      userType: 'text',
      userContent: 'Qual a projeção do IPCA deste mês e inclui minha esposa Ana na conta',
      botStatus: 'Assistente Multitarefas',
      botLines: [
        '🌐 Projeção Focus/Mercado: IPCA estimado em 0,42% no mês.',
        '❤️ Ana foi vinculada com sucesso à sua conta conjunta.',
        '📲 Ambos já podem enviar áudios e comprovantes no mesmo fluxo!'
      ]
    }
  }
];

const timelineSteps = [
  { hour: '07:40', tag: 'Cartão', title: 'Aviso da fatura antes do café', detail: 'Simplific avisa o valor acumulado e os 3 dias para o fechamento.' },
  { hour: '09:15', tag: 'Agenda', title: 'Áudio no trânsito vira reunião', detail: 'Evento sincronizado no Google Agenda com sala do Meet criada.' },
  { hour: '12:30', tag: 'Vision AI', title: 'Foto do almoço categorizada', detail: 'Leitura OCR extrai R$ 142 no Nubank e abate do limite mensal.' },
  { hour: '15:30', tag: 'B3', title: 'Cotação da carteira na palma da mão', detail: 'Resumo das ações e FIIs negociados sem abrir corretora.' },
  { hour: '22:00', tag: 'Resumo', title: 'Fechamento executivo do dia', detail: 'Balanço das entradas, saídas e compromissos do dia seguinte.' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [activeActIndex, setActiveActIndex] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Reprodução automática da timeline 24h
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setActiveTimeline((prev) => (prev + 1) % timelineSteps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  const activeAct = acts[activeActIndex];
  const currentStep = timelineSteps[activeTimeline];

  return (
    <div className="min-h-screen bg-[#050605] text-[#f4f4f5] font-sans selection:bg-emerald-400 selection:text-black overflow-x-hidden">
      
      {/* Glow de ambientação no topo */}
      <div 
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full z-0" 
        aria-hidden="true" 
      />

      {/* ========================================================================= */}
      {/* 1. HEADER / NAVEGAÇÃO SUPERIOR                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050605]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo Oficial com o Mascote Simplific */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <span className="text-xs font-black text-black tracking-tight">SP</span>
            </div>
            <span className="text-lg font-semibold tracking-[-0.03em] text-white">
              Simplific <span className="text-emerald-400 font-medium">Pro</span>
            </span>
          </Link>

          {/* Links para Rotas Não Protegidas */}
          <nav className="hidden items-center gap-8 md:flex text-sm text-zinc-400">
            <Link to="/beneficios" className="transition-colors hover:text-white">Recursos</Link>
            <Link to="/inteligencia" className="transition-colors hover:text-white">Inteligência</Link>
            <Link to="/seguranca" className="transition-colors hover:text-white">Segurança</Link>
            <Link to="/planos" className="transition-colors hover:text-white">Planos</Link>
            <Link to="/contato" className="transition-colors hover:text-white">Contato</Link>
          </nav>

          {/* Botões de Ação */}
          <div className="hidden items-center gap-3.5 md:flex">
            <Link 
              to="/login" 
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white px-3 py-2"
            >
              Entrar
            </Link>
            <Link 
              to="/checkout?plan=annual" 
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <span>Testar 7 dias grátis</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Menu Hambúrguer Mobile */}
          <button 
            type="button" 
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:text-white border border-white/10"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#090a09] px-6 py-6 flex flex-col gap-4">
            <Link to="/beneficios" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-emerald-400 py-1">Recursos</Link>
            <Link to="/inteligencia" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-emerald-400 py-1">Inteligência</Link>
            <Link to="/seguranca" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-emerald-400 py-1">Segurança</Link>
            <Link to="/planos" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-emerald-400 py-1">Planos</Link>
            <Link to="/contato" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-emerald-400 py-1">Contato</Link>
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-full border border-white/15 py-2.5 text-center text-sm font-medium text-white">Entrar</Link>
              <Link to="/checkout?plan=annual" onClick={() => setMobileMenuOpen(false)} className="rounded-full bg-emerald-400 py-2.5 text-center text-sm font-semibold text-black">Começar</Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION COM O MASCOTE SIMPLIFIC ORQUESTRANDO                     */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 md:pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Mascote Simplific em Destaque Central */}
          <div className="relative mb-6 flex flex-col items-center">
            <div className="relative p-2.5 rounded-3xl bg-zinc-950/80 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.18)] transition-transform duration-500 hover:scale-105">
              <SimplificMascot size={115} />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-black/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold tracking-wider px-3 py-0.5 rounded-full uppercase flex items-center gap-1.5 whitespace-nowrap shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simplific • Assessor Oficial</span>
              </div>
            </div>
          </div>

          {/* Título Principal de Impacto (2 linhas no desktop) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.035em] text-white leading-[1.08] mb-6 max-w-3xl">
            Seu dinheiro e sua rotina organizados numa conversa de WhatsApp.
          </h1>

          {/* Subtítulo Objetivo (Sem clichês) */}
          <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            Sem planilhas manuais. Mande áudio, foto de comprovante ou mensagem: o Simplific categoriza gastos, gerencia cartões, acompanha a B3 e agenda reuniões no Google Meet.
          </p>

          {/* Chamadas para Ação */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              to="/checkout?plan=annual" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 px-8 py-4 text-base font-semibold text-black transition-all shadow-[0_0_35px_rgba(16,185,129,0.25)] hover:shadow-[0_0_45px_rgba(16,185,129,0.35)] transform hover:-translate-y-0.5"
            >
              <span>Começar no plano anual (R$ 16,58/mês)</span>
              <ArrowRight size={17} />
            </Link>
            <Link 
              to="/beneficios" 
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/30 px-6 py-4 text-sm font-medium text-zinc-300 transition-colors"
            >
              Conhecer todas as funções
            </Link>
          </div>

          {/* Mini-selo de garantia */}
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>7 dias de garantia incondicional • Cancele quando quiser</span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FAIXA DE SEGURANÇA E CONFIANÇA                                         */}
      {/* ========================================================================= */}
      <section className="border-y border-white/5 bg-zinc-950/60 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-14 text-xs font-medium text-zinc-400 tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>WhatsApp Cloud API Oficial</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-emerald-400" />
            <span>Criptografia Bancária AES-256</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Google Cloud Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>100% em Conformidade com a LGPD</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SPLIT STAGE: O CORAÇÃO DO SCROLL-CRAFT & DEMONSTRAÇÃO AO VIVO          */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10" id="recursos">
        <div className="mb-14 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight mb-3">
            O que o Simplific resolve enquanto você vive.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Selecione uma capacidade para ver a inteligência em ação simulada exatamente como você conversa no WhatsApp.
          </p>
        </div>

        {/* Grade Split Stage: Lista de Atos à Esquerda, Terminal Interativo à Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Lado Esquerdo: Atos Interativos */}
          <div className="lg:col-span-6 space-y-3">
            {acts.map((act, index) => {
              const Icon = act.icon;
              const isActive = index === activeActIndex;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setActiveActIndex(index)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isActive 
                      ? 'bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.12)]' 
                      : 'bg-zinc-950/40 border-white/5 hover:border-white/15 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-400'}`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {act.label}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Ativo
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-base font-medium mb-1 ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {act.title}
                  </h3>
                  
                  {isActive && (
                    <p className="text-xs text-zinc-400 leading-relaxed mt-2 pt-2 border-t border-white/5">
                      {act.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lado Direito: Terminal Vivo do WhatsApp com o Mascote Simplific */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-[#090a09] border border-white/10 p-5 md:p-7 shadow-2xl relative overflow-hidden">
              
              {/* Brilho interno suave */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full" />

              {/* Cabeçalho do Chat Simulado */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center overflow-hidden">
                    <SimplificMascot size={36} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white text-sm">Simplific</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] text-emerald-400">{activeAct.chat.botStatus}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {activeAct.chat.time}
                </div>
              </div>

              {/* Corpo da Conversa com Respostas Reais */}
              <div className="space-y-4">
                
                {/* Balão do Usuário */}
                <div className="flex justify-end">
                  <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl rounded-tr-sm p-3.5 max-w-[88%] text-xs sm:text-sm text-zinc-100 shadow-sm">
                    <p className="leading-relaxed font-sans">{activeAct.chat.userContent}</p>
                    <div className="text-[10px] text-zinc-400 text-right mt-1">✓✓ Entregue</div>
                  </div>
                </div>

                {/* Balão do Simplific */}
                <div className="flex justify-start">
                  <div className="bg-[#121412] border border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-[94%] text-xs sm:text-sm text-zinc-200 shadow-md">
                    <div className="flex items-center gap-1.5 mb-2 text-emerald-400 font-medium text-xs">
                      <Sparkles size={13} />
                      <span>Simplific Assessor</span>
                    </div>
                    <ul className="space-y-2 text-zinc-300">
                      {activeAct.chat.botLines.map((line, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {line}
                        </li>
                      ))}
                    </ul>
                    <div className="text-[10px] text-zinc-500 text-right mt-2">{activeAct.chat.time}</div>
                  </div>
                </div>

              </div>

              {/* Footer do Terminal */}
              <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <span>Comando executado via WhatsApp</span>
                <span className="text-emerald-400 font-mono">Sem aplicativo extra</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SIGNATURE MOVE: TIMELINE 24H INTERATIVA COM O SIMPLIFIC               */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 border-y border-white/5 bg-zinc-950/40 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
                Assessor 24 Horas
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white">
                Um dia normal na sua rotina com o Simplific.
              </h2>
            </div>
            
            {/* Controle de Play/Pause */}
            <button
              type="button"
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 w-fit"
            >
              {isPlayingTimeline ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlayingTimeline ? 'Pausar ciclo automático' : 'Reproduzir ciclo'}</span>
            </button>
          </div>

          {/* Marcadores de Horários da Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {timelineSteps.map((step, idx) => {
              const isSelected = idx === activeTimeline;
              return (
                <button
                  key={step.hour}
                  type="button"
                  onClick={() => {
                    setActiveTimeline(idx);
                    setIsPlayingTimeline(false);
                  }}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    isSelected 
                      ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-zinc-950/50 border-white/5 hover:border-white/15 text-zinc-500'
                  }`}
                >
                  <span className={`font-mono text-sm font-bold block mb-1 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {step.hour}
                  </span>
                  <span className={`text-xs font-medium line-clamp-1 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Card Detalhado do Momento Ativo */}
          <div className="rounded-3xl bg-zinc-900/80 border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg flex-shrink-0">
                {currentStep.hour}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1 block">
                  {currentStep.tag}
                </span>
                <h4 className="text-xl font-semibold text-white mb-1">
                  {currentStep.title}
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                  {currentStep.detail}
                </p>
              </div>
            </div>

            <Link 
              to="/checkout?plan=annual" 
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-3 text-xs font-semibold text-emerald-300 transition-colors whitespace-nowrap"
            >
              <span>Experimentar este nível de clareza</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PLANOS DE PREÇOS TRANSPARENTES (MENSAL E ANUAL)                       */}
      {/* ========================================================================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10" id="planos">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
            Preço Claro & Sem Surpresas
          </span>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.035em] text-white mb-4">
            Escolha o plano ideal para você.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Sem limites de mensagens, sem travas de funcionalidades. Tudo liberado desde o primeiro instante.
          </p>
        </div>

        {/* Grade com 2 Cards Principais: Anual e Mensal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          
          {/* Card 1: PLANO ANUAL (Melhor Custo-Benefício) */}
          <div className="rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-2 border-emerald-500/50 p-8 md:p-9 flex flex-col justify-between shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
            
            {/* Tag Superior */}
            <div className="absolute top-0 right-0 bg-emerald-400 text-black text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Economize 44%
            </div>

            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2">
                Plano Anual
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Assinatura Anual
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mb-6 leading-relaxed">
                A opção preferida por quem quer tranquilidade o ano inteiro pelo menor custo por dia.
              </p>

              {/* Preço de Destaque */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="text-xs text-zinc-500 line-through block mb-1">De R$ 358,80 por ano</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-lg font-bold text-emerald-400">12x de R$</span>
                  <span className="text-5xl font-extrabold tracking-tight">16</span>
                  <span className="text-2xl font-bold">,58</span>
                  <span className="text-zinc-400 text-sm font-normal">/mês</span>
                </div>
                <span className="text-xs text-emerald-400/90 block mt-1.5 font-medium">
                  ou R$ 199,00 à vista no PIX / cartão
                </span>
              </div>

              {/* Lista de Vantagens */}
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Simplific disponível 24h no seu WhatsApp oficial</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Registros ilimitados por áudio, texto e fotos de cupom</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Motor Vision AI OCR de alta precisão para recibos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Cotações de ações e FIIs da Bolsa B3 em tempo real</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Integração Google Agenda + Links Google Meet</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Conta compartilhada para casal ou família</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                to="/checkout?plan=annual"
                className="w-full py-4 px-6 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-center text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all block transform hover:-translate-y-0.5"
              >
                Garantir Plano Anual com 44% OFF →
              </Link>
              <p className="text-[11px] text-zinc-500 text-center mt-3">
                Garantia incondicional de 7 dias com devolução 100%
              </p>
            </div>
          </div>

          {/* Card 2: PLANO MENSAL (Flexibilidade Total) */}
          <div className="rounded-3xl bg-zinc-950/80 border border-white/10 p-8 md:p-9 flex flex-col justify-between backdrop-blur-xl relative">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-2">
                Plano Mensal
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Assinatura Mensal
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Ideal para experimentar mês a mês. Cancele com um clique no painel sem multas ou fidelidade.
              </p>

              {/* Preço Mensal */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="text-xs text-zinc-500 block mb-1">Cobrança mês a mês</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-lg font-bold text-zinc-400">R$</span>
                  <span className="text-5xl font-extrabold tracking-tight">29</span>
                  <span className="text-2xl font-bold">,90</span>
                  <span className="text-zinc-400 text-sm font-normal">/mês</span>
                </div>
                <span className="text-xs text-zinc-400 block mt-1.5">
                  Sem contrato ou fidelidade
                </span>
              </div>

              {/* Lista de Vantagens */}
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Simplific disponível 24h no seu WhatsApp oficial</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Registros ilimitados por áudio, texto e fotos de cupom</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Motor Vision AI OCR de alta precisão para recibos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Cotações de ações e FIIs da Bolsa B3 em tempo real</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Integração Google Agenda + Links Google Meet</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Conta compartilhada para casal ou família</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                to="/checkout"
                className="w-full py-4 px-6 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-center text-sm border border-white/15 transition-all block"
              >
                Assinar Plano Mensal →
              </Link>
              <p className="text-[11px] text-zinc-500 text-center mt-3">
                Cancele a qualquer momento direto no painel
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. PERGUNTAS FREQUENTES                                                   */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-t border-white/5 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            Perguntas Frequentes
          </h2>
          <p className="text-zinc-400 text-sm">
            Dúvidas comuns sobre o funcionamento do Simplific.
          </p>
        </div>

        <div className="space-y-3.5">
          <details className="group rounded-2xl bg-zinc-950/70 border border-white/10 p-5 open:bg-zinc-900/60 transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-white text-sm sm:text-base">
              <span>Como o Simplific funciona no meu WhatsApp?</span>
              <ChevronRight size={16} className="text-zinc-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
              Logo após assinar, você recebe uma mensagem do Simplific no seu WhatsApp. A partir daí, é só conversar como falaria com um amigo: mandar um áudio de gasto, pedir a cotação de um fundo da B3 ou agendar uma reunião no Meet.
            </p>
          </details>

          <details className="group rounded-2xl bg-zinc-950/70 border border-white/10 p-5 open:bg-zinc-900/60 transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-white text-sm sm:text-base">
              <span>Preciso instalar algum aplicativo no celular?</span>
              <ChevronRight size={16} className="text-zinc-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
              Não. O Simplific vive no WhatsApp que você já usa todos os dias. Você também tem acesso ao painel Web Vision pelo navegador se quiser ver gráficos em tela grande.
            </p>
          </details>

          <details className="group rounded-2xl bg-zinc-950/70 border border-white/10 p-5 open:bg-zinc-900/60 transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-white text-sm sm:text-base">
              <span>Meus dados e conversas são seguros?</span>
              <ChevronRight size={16} className="text-zinc-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
              Sim. Utilizamos a API Oficial da Meta com criptografia de ponta a ponta AES-256 e servidores no Google Cloud. Nenhum dado é compartilhado ou vendido.
            </p>
          </details>

          <details className="group rounded-2xl bg-zinc-950/70 border border-white/10 p-5 open:bg-zinc-900/60 transition-all">
            <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-white text-sm sm:text-base">
              <span>Como funciona a garantia de 7 dias?</span>
              <ChevronRight size={16} className="text-zinc-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
              Você tem 7 dias para testar tudo. Se não gostar por qualquer motivo, basta solicitar o reembolso com uma mensagem e devolvemos 100% do valor pago.
            </p>
          </details>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER / RODAPÉ OFICIAL                                                */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 bg-[#080908] py-14 px-6 text-zinc-400 text-sm relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          
          {/* Lado Esquerdo: Marca */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400 text-xs font-black text-black">SP</span>
              <span className="text-base font-semibold text-white">Simplific <span className="text-emerald-400">Pro</span></span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              A inteligência artificial que organiza seu dinheiro, seus cartões, seus investimentos e sua agenda no WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Suporte Oficial: contato@simplificpro.com</span>
            </div>
          </div>

          {/* Links para Rotas Públicas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <span className="font-semibold text-white uppercase tracking-wider block mb-3">Plataforma</span>
              <ul className="space-y-2">
                <li><Link to="/beneficios" className="hover:text-emerald-400 transition-colors">Recursos</Link></li>
                <li><Link to="/inteligencia" className="hover:text-emerald-400 transition-colors">Inteligência</Link></li>
                <li><Link to="/seguranca" className="hover:text-emerald-400 transition-colors">Segurança</Link></li>
                <li><Link to="/planos" className="hover:text-emerald-400 transition-colors">Planos & Preços</Link></li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-white uppercase tracking-wider block mb-3">Acesso</span>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Fazer Login</Link></li>
                <li><Link to="/checkout?plan=annual" className="hover:text-emerald-400 transition-colors">Plano Anual</Link></li>
                <li><Link to="/checkout" className="hover:text-emerald-400 transition-colors">Plano Mensal</Link></li>
                <li><Link to="/contato" className="hover:text-emerald-400 transition-colors">Fale Conosco</Link></li>
              </ul>
            </div>

            <div>
              <span className="font-semibold text-white uppercase tracking-wider block mb-3">Legal</span>
              <ul className="space-y-2">
                <li><Link to="/termos" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-emerald-400 transition-colors">Privacidade LGPD</Link></li>
                <li><a href="https://wa.me/5547992921005" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">WhatsApp Suporte</a></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© 2026 Simplific Pro. 41.851.029/0001-64. Todos os direitos reservados.</p>
          <p className="text-zinc-500">Desenvolvido com padrão de precisão e segurança.</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
