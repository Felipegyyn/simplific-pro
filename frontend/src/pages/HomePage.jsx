import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Mic,
  Camera,
  TrendingUp,
  Calendar,
  CreditCard,
  ShieldCheck,
  Lock,
  Server,
  Check,
  Sparkles,
  Send,
  Users,
  FileText
} from 'lucide-react';
import SimplificMascot from '@/components/SimplificMascot';
import './HomePage.css';

const HERO_PRESETS = [
  {
    id: 'voz',
    triggerLabel: 'Áudio · Mercado',
    userMsg: 'Passei 180 no mercado agora no Itaú Black',
    category: 'Alimentação & Casa',
    amount: 180.0,
    account: 'Itaú Personnalité Black',
    remainingBudget: 1120.0,
    budgetPct: 62,
    aiReply: 'Registrado na fatura de Novembro do Itaú Black. Seu orçamento de Alimentação está em 62% (restam R$ 1.120,00).'
  },
  {
    id: 'vision',
    triggerLabel: 'Foto · Cupom Fiscal',
    userMsg: '[Foto] Cupom Restaurante Jardins · CNPJ 48.192.../0001-10',
    category: 'Restaurantes',
    amount: 68.9,
    account: 'Nubank Ultravioleta',
    remainingBudget: 410.0,
    budgetPct: 48,
    aiReply: 'Li o cupom fiscal em 2,1s: R$ 68,90 no Restaurante Jardins. Categoria Restaurantes atualizada.'
  },
  {
    id: 'meet',
    triggerLabel: 'Agenda · Google Meet',
    userMsg: 'Marca revisão tributária com Dr. Henrique amanhã às 15h',
    category: 'Google Agenda + Meet',
    amount: 0,
    account: 'meet.google.com/kqx-vbnr-pms',
    remainingBudget: 1590.9,
    budgetPct: 54,
    aiReply: 'Compromisso criado no Google Agenda para amanhã às 15:00. Sala Google Meet gerada e convite enviado no WhatsApp do Dr. Henrique.'
  }
];

const SHOWCASE_MODES = {
  audio: {
    id: 'audio',
    label: 'Voz Nativa',
    verb: 'Fale uma vez.',
    lead: 'Um áudio de 4 segundos no trânsito vira lançamento categorizado, saldo bancário atualizado e meta recalculada.',
    inputSample: 'Áudio 0:04 · "Paguei 240 de gasolina no Pix do BTG"',
    parsedTitle: 'Posto Ipiranga · Combustível',
    parsedValue: '- R$ 240,00',
    parsedMeta: 'Conta BTG Pactual · Confirmado instantaneamente',
    parsedBadge: 'Transporte · 41% do teto mensal'
  },
  vision: {
    id: 'vision',
    label: 'Vision OCR',
    verb: 'Fotografe o recibo.',
    lead: 'Mande foto de nota fiscal amassada ou PDF de boleto. O motor óptico extrai CNPJ, data, itens e valor exato.',
    inputSample: 'Arquivo comprovante_pix_energia.pdf · 142 KB',
    parsedTitle: 'Enel Distribuição SP · Energia',
    parsedValue: '- R$ 318,45',
    parsedMeta: 'Extraído via Google Cloud Vision · Vencimento 15/11',
    parsedBadge: 'Moradia · Comprovante arquivado'
  },
  b3: {
    id: 'b3',
    label: 'Radar B3',
    verb: 'Consulte sua carteira.',
    lead: 'Pergunte cotação de ações, FIIs, dólar ou cripto e receba rentabilidade consolidada com notícias traduzidas.',
    inputSample: 'Mensagem · "Como fecharam PETR4 e meus FIIs hoje?"',
    parsedTitle: 'Carteira B3 · 6 Ativos Monitorados',
    parsedValue: '+ R$ 1.482,30',
    parsedMeta: 'PETR4 R$ 38,90 (+2,4%) · MXRF11 pagou R$ 142,00',
    parsedBadge: 'Rentabilidade no mês: +1,84% (112% do CDI)'
  }
};

const ROUTINE_24H = [
  {
    time: '08:30',
    period: 'Manhã · Café & Briefing',
    title: 'Resumo matinal antes de abrir o e-mail.',
    call: 'O Simplific verifica vencimentos do dia, saldo das contas e sua agenda de reuniões.',
    aiBubble: 'Bom dia! Hoje vence a fatura do cartão Black (R$ 2.450,00) e você tem reunião às 14h com a equipe. Saldo livre em conta: R$ 8.920,00.',
    metricLabel: 'Fatura monitorada',
    metricValue: 'R$ 2.450,00',
    metricSub: 'Vencimento hoje · Débito pronto em 1 resposta',
    photo: '/assets/landing/simplific-insight.jpg',
    photoAlt: 'Mesa matinal com café expresso, cartões pretos e interface financeira Simplific Pro'
  },
  {
    time: '12:45',
    period: 'Tarde · Almoço & Vision AI',
    title: 'Foto da nota fiscal na mesa do restaurante.',
    call: 'Você fotografa o cupom fiscal pelo WhatsApp sem abrir planilha nem digitar centavos.',
    aiBubble: 'Foto recebida! Extraí R$ 68,90 no Restaurante Jardins. Lancei em Alimentação e seu limite livre para a semana continua em R$ 410,00.',
    metricLabel: 'Leitura Vision OCR',
    metricValue: '2,1 seg',
    metricSub: 'Estabelecimento, data e categoria identificados',
    photo: '/assets/landing/simplific-assessor-documentos.jpg',
    photoAlt: 'Especialista do ecossistema Simplific analisando documentos e comprovantes'
  },
  {
    time: '16:00',
    period: 'Pregão · Bolsa B3 & Google Meet',
    title: 'Ações monitoradas e call criada por voz.',
    call: 'Enquanto o mercado oscila, o assessor acompanha seus ativos na B3 e agenda reuniões com link do Google Meet.',
    aiBubble: 'Mercado em alta: PETR4 subiu +2,4% (R$ 38,90) e seus dividendos de MXRF11 caíram na conta. Sua call das 16h30 já está com link Meet pronto.',
    metricLabel: 'Dividendos + B3',
    metricValue: '+2,40%',
    metricSub: 'Cotação em tempo real direto da B3 e NYSE',
    photo: '/assets/landing/simplific-assessor-financeiro.jpg',
    photoAlt: 'Assessor financeiro acompanhando carteira de investimentos'
  },
  {
    time: '21:00',
    period: 'Noite · Fechamento & Modo Casal',
    title: 'Balanço do casal e meta mais próxima.',
    call: 'Dois números de WhatsApp alimentam a mesma conta familiar com transparência e metas compartilhadas.',
    aiBubble: 'Dia encerrado! Você e sua esposa registraram R$ 142,00 hoje. Sua meta "Viagem Europa" atingiu 78% (R$ 19.500 acumulados).',
    metricLabel: 'Meta Viagem Europa',
    metricValue: '78,0%',
    metricSub: '2 números de WhatsApp sincronizados na mesma conta',
    photo: '/assets/landing/simplific-hero-hands.jpg',
    photoAlt: 'Duas mãos conectadas sobre a interface financeira representando o Modo Casal no WhatsApp'
  }
];

const B3_TICKERS = [
  { symbol: 'PETR4', name: 'Petrobras PN', price: 'R$ 38,90', change: '+2,41%', dividend: 'DY 14,2%' },
  { symbol: 'VALE3', name: 'Vale ON', price: 'R$ 61,45', change: '+1,18%', dividend: 'DY 8,9%' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco PN', price: 'R$ 34,80', change: '+0,95%', dividend: 'DY 7,4%' },
  { symbol: 'WEGE3', name: 'WEG ON', price: 'R$ 52,10', change: '+3,12%', dividend: 'DY 2,1%' },
  { symbol: 'MXRF11', name: 'Maxi Renda FII', price: 'R$ 10,14', change: '+0,40%', dividend: 'DY 11,8%' }
];

const BANK_LOGOS = [
  { name: 'Itaú', src: '/meuassessor/images/bancos/itau.svg' },
  { name: 'Nubank', src: '/meuassessor/images/bancos/nubank.svg' },
  { name: 'BTG Pactual', src: '/meuassessor/images/bancos/btg.svg' },
  { name: 'XP', src: '/meuassessor/images/bancos/xp.svg' },
  { name: 'Inter', src: '/meuassessor/images/bancos/inter.svg' },
  { name: 'Bradesco', src: '/meuassessor/images/bancos/bradesco.svg' },
  { name: 'Santander', src: '/meuassessor/images/bancos/santander.svg' },
  { name: 'Banco do Brasil', src: '/meuassessor/images/bancos/bb.svg' }
];

const FAQ_ITEMS = [
  {
    q: 'Preciso instalar algum aplicativo novo no celular?',
    a: 'Não. O atendimento diário roda 100% dentro do seu WhatsApp oficial (+55 11 5199-1373) e você também recebe acesso imediato ao Painel Web Vision pelo navegador do celular ou computador.'
  },
  {
    q: 'Como funcionam os 7 dias de teste grátis?',
    a: 'Ao criar sua conta, todas as funções ficam liberadas por 7 dias: WhatsApp IA, leitura de comprovantes Vision, alertas de agenda com Google Meet e painel web. Se cancelar dentro dos 7 dias, nada é cobrado.'
  },
  {
    q: 'O Simplific pede a senha de transação do meu banco?',
    a: 'Jamais. Você nunca digita senha de movimentação bancária. A leitura funciona pelos seus comandos de voz, fotos de recibos ou conexão oficial de leitura Open Finance regulamentada.'
  },
  {
    q: 'Posso usar a mesma assinatura com meu cônjuge ou sócio?',
    a: 'Sim. O Modo Casal permite cadastrar um segundo número de WhatsApp nas configurações sem custo extra. Ambos enviam gastos e consultam metas no mesmo orçamento.'
  },
  {
    q: 'Ele realmente cria reuniões com link do Google Meet?',
    a: 'Sim. Basta enviar um áudio como "Marca reunião com João amanhã às 15h". O Simplific agenda no seu Google Calendar, gera a sala do Google Meet e envia o convite no WhatsApp do convidado.'
  },
  {
    q: 'Também serve para minha empresa ou CNPJ?',
    a: 'Sim. Além do controle pessoal e familiar, sua conta inclui o módulo Simplific Empresas para gerenciar fluxo de caixa PJ, DRE, estoque, vendas e contas a pagar e receber.'
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  // Interactive State 1: Hero Live Fragment [data-ui]
  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [customTx, setCustomTx] = useState(null);

  // Interactive State 2: Showcase Blown-Up Control [data-ui]
  const [showcaseMode, setShowcaseMode] = useState('audio');

  // Interactive State 3: 24h Pinned Peak (driven by scroll + click)
  const [routineIdx, setRoutineIdx] = useState(0);
  const routineTrackRef = useRef(null);

  // Interactive State 4: B3 Ticker selector in capability cell
  const [selectedTickerIdx, setSelectedTickerIdx] = useState(0);

  // Interactive State 5: Stats Slider [data-ui]
  const [weeklyEntries, setWeeklyEntries] = useState(28);

  // Interactive State 6: Pricing Plan Switcher [data-ui]
  const [billingPlan, setBillingPlan] = useState('annual');
  const [ctaQuickText, setCtaQuickText] = useState('');

  const currentHeroData = customTx || HERO_PRESETS[activePresetIdx];
  const currentShowcase = SHOWCASE_MODES[showcaseMode];
  const currentRoutine = ROUTINE_24H[routineIdx];
  const currentTicker = B3_TICKERS[selectedTickerIdx];

  // Honest formula for Stats section
  const hoursSavedPerYear = Math.round((weeklyEntries * 52 * 2.4) / 60);
  const annualLeakageSaved = Math.round(weeklyEntries * 52 * 4.65);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const raw = customInput.trim();
    if (!raw) return;
    const numMatch = raw.match(/(\d+(?:[.,]\d{1,2})?)/);
    const parsedVal = numMatch ? parseFloat(numMatch[1].replace(',', '.')) : 85.0;
    setCustomTx({
      id: 'custom',
      triggerLabel: 'Seu comando ao vivo',
      userMsg: raw,
      category: raw.toLowerCase().includes('uber') || raw.toLowerCase().includes('gasolina')
        ? 'Transporte'
        : raw.toLowerCase().includes('farm') || raw.toLowerCase().includes('médic')
          ? 'Saúde'
          : 'Despesa Variável',
      amount: parsedVal,
      account: 'Conta Principal · Via WhatsApp',
      remainingBudget: Math.max(120, Math.round(1300 - parsedVal)),
      budgetPct: Math.min(94, Math.round(52 + parsedVal / 25)),
      aiReply: `Anotado na hora! Lancei R$ ${parsedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a partir da sua mensagem e atualizei o gráfico do mês.`
    });
    setCustomInput('');
  };

  // Scroll-craft runtime: IntersectionObserver for [data-sc-in] + Scroll progress for 24h Pinned Act & Parallax
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const inNodes = Array.from(document.querySelectorAll('.sp-home [data-sc-in]'));

    if (reducedMotion) {
      inNodes.forEach((n) => n.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );

    inNodes.forEach((el) => io.observe(el));

    let rafId = 0;
    const parallaxNodes = Array.from(document.querySelectorAll('.sp-home [data-sc-parallax]'));

    const updateScroll = () => {
      rafId = 0;
      const vh = window.innerHeight || 1;

      // Update parallax planes in Hero
      for (const node of parallaxNodes) {
        const factor = parseFloat(node.getAttribute('data-sc-parallax') || '0');
        const rect = node.getBoundingClientRect();
        const centerOffset = rect.top + rect.height * 0.5 - vh * 0.5;
        const shift = Math.max(-42, Math.min(42, -centerOffset * factor));
        node.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      }

      // Update pinned 24h routine act when in desktop viewport
      if (routineTrackRef.current && window.innerWidth >= 960) {
        const rect = routineTrackRef.current.getBoundingClientRect();
        const scrollable = rect.height - vh;
        if (scrollable > 40 && rect.top <= 80 && rect.bottom >= vh * 0.45) {
          const p = Math.max(0, Math.min(1, -rect.top / scrollable));
          const nextIdx = Math.min(ROUTINE_24H.length - 1, Math.floor(p * ROUTINE_24H.length));
          setRoutineIdx((prev) => (prev !== nextIdx ? nextIdx : prev));
        }
      }
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="sp-home">
      {/* ================= PLAIN NAVIGATION ROW ================= */}
      <header className="sp-nav">
        <div className="sp-frame sp-nav-inner">
          <Link to="/" className="sp-wordmark" aria-label="Simplific Pro Início">
            <span className="sp-wordmark-mark">S</span>
            <span>Simplific Pro</span>
          </Link>

          <nav className="sp-nav-links" aria-label="Navegação Principal">
            <Link to="/beneficios" className="sp-nav-link">Benefícios</Link>
            <Link to="/inteligencia" className="sp-nav-link">Inteligência IA</Link>
            <Link to="/seguranca" className="sp-nav-link">Segurança</Link>
            <Link to="/planos" className="sp-nav-link">Planos</Link>
            <Link to="/contato" className="sp-nav-link">Contato</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" className="sp-nav-link">
              Entrar
            </Link>
            <Link to="/login?tab=register" className="sp-nav-cta">
              Testar 7 dias grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ================= ACT 1: DIMENSIONAL HERO ("Fragment on a shaped stage") ================= */}
        <section className="sp-hero" aria-label="Apresentação do Simplific Pro">
          <div className="sp-frame sp-grid-12" style={{ alignItems: 'start', flex: 1 }}>
            {/* Foreground Plane: Left-aligned 2-line headline + 1 sentence + 1 action */}
            <div className="sp-hero-copy">
              <h1 className="sp-h1">
                <span className="sp-line"><span>Seu dinheiro no</span></span>
                <span className="sp-line"><span>ritmo da voz.</span></span>
              </h1>

              <p className="sp-hero-lead">
                Mande áudio, foto de recibo ou pergunta no WhatsApp. O Simplific registra gastos, monitora a B3, lê faturas e cria reuniões no Google Meet na hora.
              </p>

              <div className="sp-hero-actions">
                <Link to="/login?tab=register" className="sp-btn-primary">
                  <span>Testar 7 dias grátis</span>
                  <ArrowRight size={17} />
                </Link>
                <a href="#rotina-24h" className="sp-btn-quiet">
                  <span>Ver um dia inteiro</span>
                </a>
              </div>
            </div>

            {/* Dimensional Shaped Stage (Columns 5-12) */}
            <div className="sp-hero-stage-wrap">
              {/* Plane 1: Background Photographic Plate + Sibling Scrim */}
              <div className="sp-hero-bg-plate sp-shutter" data-sc-parallax="-0.06">
                <img
                  src="/assets/landing/simplific-insight.jpg"
                  alt="Mesa executiva escura com café, cartões e painel financeiro do Simplific Pro"
                  width="1600"
                  height="1200"
                />
                <div className="sp-hero-scrim" aria-hidden="true" />
              </div>

              {/* Plane 2 & 3: Midground Stage + True-Size Interactive UI Fragment [data-ui] */}
              <div className="sp-hero-stage-inner" data-sc-parallax="0.02">
                <div
                  data-ui="hero-whatsapp-ledger"
                  className="sp-ui-fragment"
                  style={{ maxWidth: '680px', width: '100%' }}
                >
                  {/* Top Bar of the Live Product Fragment */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      backgroundColor: '#121815',
                      borderBottom: '1px solid #222b26',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                        <SimplificMascot
                          size={38}
                          state="idle"
                          reactionKey={activePresetIdx}
                          speechText=""
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f6f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Simplific IA · WhatsApp Oficial</span>
                          <span style={{ width: '7px', height: '7px', borderRadius: '999px', backgroundColor: '#10b981', display: 'inline-block' }} />
                        </div>
                        <div style={{ fontSize: '13px', color: '#8f9b93' }}>
                          +55 11 5199-1373 · Sincronizado com Painel Vision
                        </div>
                      </div>
                    </div>

                    {/* Interactive Preset Switcher inside [data-ui] */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="tablist" aria-label="Exemplos de comandos reais">
                      {HERO_PRESETS.map((preset, idx) => {
                        const isSelected = !customTx && activePresetIdx === idx;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => {
                              setCustomTx(null);
                              setActivePresetIdx(idx);
                            }}
                            style={{
                              padding: '6px 10px',
                              fontSize: '13px',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: isSelected ? '#10b981' : '#26302a',
                              backgroundColor: isSelected ? '#10b981' : '#161d19',
                              color: isSelected ? '#05120c' : '#d2dad5',
                              cursor: 'pointer'
                            }}
                          >
                            {preset.triggerLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conversation & Live Extracted Ledger Body */}
                  <div style={{ padding: '18px', display: 'grid', gap: '14px' }}>
                    {/* Outgoing User WhatsApp Message */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          backgroundColor: '#10b981',
                          color: '#05120c',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 500,
                          maxWidth: '88%'
                        }}
                      >
                        {currentHeroData.userMsg}
                      </div>
                    </div>

                    {/* Incoming Simplific AI Structured Response */}
                    <div
                      style={{
                        backgroundColor: '#141b17',
                        border: '1px solid #242e28',
                        borderRadius: '6px',
                        padding: '14px 16px',
                        display: 'grid',
                        gap: '12px'
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '14px', color: '#e5ece8', lineHeight: 1.5 }}>
                        {currentHeroData.aiReply}
                      </p>

                      {/* Extracted Ledger Row */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                          gap: '10px',
                          padding: '12px',
                          backgroundColor: '#0d120f',
                          borderRadius: '4px',
                          border: '1px solid #1e2722'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', color: '#8f9b93' }}>Categoria</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f6f4', marginTop: '2px' }}>
                            {currentHeroData.category}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#8f9b93' }}>Valor / Sala</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
                            {currentHeroData.amount > 0
                              ? `R$ ${currentHeroData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : 'Sala Meet Ativa'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#8f9b93' }}>Orçamento livre</div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f6f4', marginTop: '2px' }}>
                            R$ {currentHeroData.remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Live Input Bar */}
                      <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder='Teste ao vivo: digite ex. "Gastei 92 na farmácia"'
                          aria-label="Testar comando ao vivo no assessor"
                          style={{
                            flex: 1,
                            backgroundColor: '#090c0a',
                            border: '1px solid #253029',
                            borderRadius: '4px',
                            padding: '9px 12px',
                            color: '#f3f6f4',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#10b981',
                            color: '#05120c',
                            border: 0,
                            borderRadius: '4px',
                            padding: '9px 14px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span>Simular</span>
                          <Send size={13} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Open Finance Bank Strip inside the Fragment */}
                  <div
                    style={{
                      padding: '10px 18px',
                      backgroundColor: '#0a0d0b',
                      borderTop: '1px solid #1e2621',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: '#8f9b93' }}>
                      Compatível com seus bancos e cartões:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {BANK_LOGOS.slice(0, 6).map((bank) => (
                        <img
                          key={bank.name}
                          src={bank.src}
                          alt={bank.name}
                          width="22"
                          height="22"
                          style={{ height: '18px', width: 'auto', opacity: 0.82 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 2: SHOWCASE ("One control, blown up" + Real Video) ================= */}
        <section
          id="demonstracao"
          className="sp-showcase"
          data-mode={showcaseMode}
          aria-labelledby="showcase-heading"
        >
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'end' }}>
              <div style={{ gridColumn: '1 / span 5' }} data-sc-in>
                <h2 id="showcase-heading" className="sp-h2">
                  {currentShowcase.verb}
                </h2>
                <p className="sp-section-lead">
                  {currentShowcase.lead}
                </p>
                <div style={{ marginTop: '20px' }}>
                  <Link to="/inteligencia" className="sp-btn-quiet">
                    <span>Explorar Inteligência IA</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              {/* Blown-up Interactive Control + Real Video Fragment [data-ui] */}
              <div style={{ gridColumn: '6 / span 7' }} data-sc-in>
                <div
                  data-ui="showcase-control-stage"
                  className="sp-ui-fragment"
                  style={{ padding: '24px', backgroundColor: '#0b0f0d' }}
                >
                  {/* Large Poster-Scale Segmented Control */}
                  <div
                    role="group"
                    aria-label="Selecionar motor de entrada do Simplific"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '8px',
                      marginBottom: '20px'
                    }}
                  >
                    {Object.values(SHOWCASE_MODES).map((mode) => {
                      const active = showcaseMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setShowcaseMode(mode.id)}
                          style={{
                            padding: '16px 14px',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: active ? '#10b981' : '#232c27',
                            backgroundColor: active ? '#10b981' : '#131916',
                            color: active ? '#05120c' : '#f3f6f4',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 180ms ease'
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 600, opacity: active ? 0.85 : 0.65 }}>
                            {mode.label}
                          </div>
                          <div style={{ fontSize: '17px', fontWeight: 600, marginTop: '4px', letterSpacing: '-0.02em' }}>
                            {mode.verb}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Split inside the blown-up control: Live parsed output left, Real muted loop video right */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      alignItems: 'stretch'
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#121815',
                        border: '1px solid #222b26',
                        borderRadius: '6px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', color: '#8f9b93', marginBottom: '6px' }}>
                          Entrada recebida no WhatsApp
                        </div>
                        <div
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#090c0a',
                            borderRadius: '4px',
                            fontSize: '14px',
                            color: '#d8e2dc',
                            border: '1px solid #1d2621'
                          }}
                        >
                          {currentShowcase.inputSample}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', color: '#8f9b93' }}>
                          {currentShowcase.parsedTitle}
                        </div>
                        <div
                          style={{
                            fontSize: '34px',
                            fontWeight: 600,
                            color: '#10b981',
                            letterSpacing: '-0.03em',
                            marginTop: '4px'
                          }}
                        >
                          {currentShowcase.parsedValue}
                        </div>
                        <div style={{ fontSize: '13px', color: '#b5c0b9', marginTop: '6px' }}>
                          {currentShowcase.parsedMeta}
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#17231d',
                          color: '#10b981',
                          borderRadius: '4px',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        {currentShowcase.parsedBadge}
                      </div>
                    </div>

                    {/* Real Moving Clip (<video>) required by tasteskill v2 imagery floor */}
                    <div
                      style={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#080908',
                        border: '1px solid #222b26',
                        position: 'relative',
                        minHeight: '240px'
                      }}
                    >
                      <video
                        src="/assets/mobile_demo.mp4"
                        poster="/assets/landing/simplific-hero.jpg"
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          maxHeight: '290px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 3: THE PEAK — 24 HOURS PINNED CHOREOGRAPHY ================= */}
        <section
          id="rotina-24h"
          className="sp-routine-act"
          aria-labelledby="routine-heading"
        >
          <div className="sp-frame">
            <div ref={routineTrackRef} className="sp-routine-pin-track">
              <div className="sp-routine-sticky">
                <div className="sp-grid-12" style={{ alignItems: 'center' }}>
                  {/* Left Column (Columns 1-5): 24h Clock Selector & Narrative */}
                  <div style={{ gridColumn: '1 / span 5' }} data-sc-in>
                    <h2 id="routine-heading" className="sp-h2">
                      Vinte e quatro horas.
                    </h2>
                    <p className="sp-section-lead" style={{ marginBottom: '28px' }}>
                      Role a página ou selecione um horário para acompanhar como o Simplific trabalha por você da manhã à noite.
                    </p>

                    <div style={{ display: 'grid', gap: '8px' }} role="tablist" aria-label="Linha do tempo de 24 horas">
                      {ROUTINE_24H.map((item, idx) => {
                        const selected = routineIdx === idx;
                        return (
                          <button
                            key={item.time}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setRoutineIdx(idx)}
                            className="sp-routine-step-btn"
                          >
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                              <span style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em' }}>
                                {item.time}
                              </span>
                              <span
                                className="sp-routine-sub"
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  color: selected ? '#062619' : '#8f9b93'
                                }}
                              >
                                {item.period}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: 500,
                                marginTop: '6px'
                              }}
                            >
                              {item.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column (Columns 6-12): Custom Photographic Plate + Live Response Fragment */}
                  <div style={{ gridColumn: '6 / span 7' }} data-sc-in>
                    <div
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-page)',
                        padding: 'clamp(20px, 3vw, 36px)',
                        display: 'grid',
                        gap: '20px'
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '20px',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ borderRadius: '4px', overflow: 'hidden', aspectRatio: '4 / 3', backgroundColor: '#080908' }}>
                          <img
                            src={currentRoutine.photo}
                            alt={currentRoutine.photoAlt}
                            width="800"
                            height="600"
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                          <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                            {currentRoutine.call}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                            {currentRoutine.metricLabel}
                          </div>
                          <div
                            style={{
                              fontSize: 'clamp(36px, 4vw, 52px)',
                              fontWeight: 600,
                              letterSpacing: '-0.035em',
                              color: 'var(--accent)',
                              lineHeight: 1
                            }}
                          >
                            {currentRoutine.metricValue}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
                            {currentRoutine.metricSub}
                          </div>
                        </div>
                      </div>

                      {/* True-size WhatsApp Bubble inside [data-ui] */}
                      <div
                        data-ui="routine-whatsapp-card"
                        className="sp-ui-fragment"
                        style={{ padding: '18px 20px', backgroundColor: '#0c100e' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                            Simplific IA · {currentRoutine.time}
                          </span>
                          <span style={{ fontSize: '13px', color: '#8f9b93' }}>
                            Entregue no seu WhatsApp
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '15px', color: '#f3f6f4', lineHeight: 1.55 }}>
                          “{currentRoutine.aiBubble}”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 4: FEATURES — STAGGERED FRAGMENT CELLS (3x2 Checkerboard) ================= */}
        <section id="capacidades" className="sp-features" aria-labelledby="features-heading">
          <div className="sp-frame">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }} data-sc-in>
              <h2 id="features-heading" className="sp-h2">
                Cinco motores vivos.
              </h2>
              <Link to="/beneficios" className="sp-btn-quiet">
                <span>Ver todos os benefícios PF & PJ</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="sp-stagger-grid">
              {/* CELL 1 (Text Top, Fragment Bottom): Despesas, Cartões & Open Finance */}
              <article className="sp-cell" data-sc-in style={{ '--i': 0 }}>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Despesas & Cartões</h3>
                  <p className="sp-cell-desc">
                    Diga “Gastei 45 no Uber” ou “Passei 180 no mercado em 3x”. O Simplific controla limites, datas de fechamento e faturas de todos os seus cartões.
                  </p>
                </div>
                <div className="sp-cell-dock">
                  <div data-ui="cell-cards" className="sp-ui-fragment" style={{ padding: '16px', borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 600 }}>Cartão Black · Fatura Aberta</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>R$ 2.450 / R$ 12.000</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#1a231e', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ width: '24%', height: '100%', backgroundColor: '#10b981' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#b8c4bc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Supermercado Pão de Açúcar</span>
                        <span>R$ 180,00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Uber Trip · Cartão Final 4092</span>
                        <span>R$ 45,90</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* CELL 2 (Fragment Top, Text Bottom): Bolsa B3 & Cripto ao Vivo */}
              <article className="sp-cell" data-sc-in style={{ '--i': 1 }}>
                <div className="sp-cell-dock-top">
                  <div data-ui="cell-b3" className="sp-ui-fragment" style={{ padding: '16px', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {B3_TICKERS.map((tk, i) => (
                        <button
                          key={tk.symbol}
                          type="button"
                          onClick={() => setSelectedTickerIdx(i)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: selectedTickerIdx === i ? '#10b981' : '#253029',
                            backgroundColor: selectedTickerIdx === i ? '#10b981' : '#121815',
                            color: selectedTickerIdx === i ? '#05120c' : '#d8e2dc',
                            cursor: 'pointer'
                          }}
                        >
                          {tk.symbol}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#8f9b93' }}>{currentTicker.name}</div>
                        <div style={{ fontSize: '22px', fontWeight: 600, color: '#f3f6f4' }}>{currentTicker.price}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>{currentTicker.change}</div>
                        <div style={{ fontSize: '13px', color: '#8f9b93' }}>{currentTicker.dividend}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Bolsa B3 ao Vivo</h3>
                  <p className="sp-cell-desc">
                    Cotações em tempo real de ações da B3, FIIs, BDRs, dólar e criptomoedas. Acompanhe dividendos e rentabilidade consolidada pelo WhatsApp.
                  </p>
                </div>
              </article>

              {/* CELL 3 (Text Top, Fragment Bottom): Agenda & Google Meet */}
              <article className="sp-cell" data-sc-in style={{ '--i': 2 }}>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Agenda & Google Meet</h3>
                  <p className="sp-cell-desc">
                    Peça para agendar reuniões por voz. O Simplific sincroniza com seu Google Agenda, gera o link do Google Meet e envia o convite ao convidado.
                  </p>
                </div>
                <div className="sp-cell-dock">
                  <div data-ui="cell-meet" className="sp-ui-fragment" style={{ padding: '16px', borderBottomRightRadius: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>Google Calendar · Amanhã 15:00</span>
                      <Calendar size={15} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#f3f6f4' }}>
                      Revisão de Fluxo & Planejamento
                    </div>
                    <div style={{ fontSize: '13px', color: '#8f9b93', marginTop: '4px' }}>
                      Sala gerada: meet.google.com/kqx-vbnr-pms
                    </div>
                    <div style={{ fontSize: '13px', color: '#10b981', marginTop: '8px' }}>
                      Convite disparado no WhatsApp do convidado
                    </div>
                  </div>
                </div>
              </article>

              {/* CELL 4 (Fragment Top, Text Bottom): Vision AI Comprovantes */}
              <article className="sp-cell" data-sc-in style={{ '--i': 3 }}>
                <div className="sp-cell-dock-top">
                  <div data-ui="cell-vision" className="sp-ui-fragment" style={{ padding: '16px', borderTopLeftRadius: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Extração Óptica Vision AI</span>
                      <span style={{ fontSize: '13px', color: '#10b981' }}>99,4% precisão</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', backgroundColor: '#121815', padding: '10px', borderRadius: '4px' }}>
                      <div>
                        <div style={{ color: '#8f9b93' }}>Documento</div>
                        <div style={{ fontWeight: 600 }}>NFC-e #008419</div>
                      </div>
                      <div>
                        <div style={{ color: '#8f9b93' }}>Total Extraído</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>R$ 68,90</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Vision AI Comprovantes</h3>
                  <p className="sp-cell-desc">
                    Envie fotos de cupons fiscais, recibos de Pix ou faturas em PDF. A visão computacional extrai valor, data e categoria em 3 segundos.
                  </p>
                </div>
              </article>

              {/* CELL 5 (Text Top, Fragment Bottom): Pesquisa Web & Modo Casal */}
              <article className="sp-cell" data-sc-in style={{ '--i': 4 }}>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Pesquisa Web & Casal</h3>
                  <p className="sp-cell-desc">
                    Compare preços de produtos na internet antes de comprar e compartilhe a mesma conta financeira com seu cônjuge em dois números de WhatsApp.
                  </p>
                </div>
                <div className="sp-cell-dock">
                  <div data-ui="cell-couple" className="sp-ui-fragment" style={{ padding: '16px', borderBottomRightRadius: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>Orçamento Compartilhado · Casal</span>
                      <span style={{ color: '#10b981' }}>2 WhatsApps Ativos</span>
                    </div>
                    <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#c4cfc8' }}>
                      <div>• Você: R$ 180,00 (Mercado Itaú)</div>
                      <div>• Cônjuge: R$ 94,00 (Farmácia Pix)</div>
                    </div>
                  </div>
                </div>
              </article>

              {/* CELL 6 (Photo Top, Text Bottom): Painel Web Vision & Simplific Empresas */}
              <article className="sp-cell" data-sc-in style={{ '--i': 5 }}>
                <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#080908' }}>
                  <img
                    src="/assets/landing/simplific-assessor-agenda.jpg"
                    alt="Executiva utilizando o ecossistema web e empresarial do Simplific Pro"
                    width="900"
                    height="900"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 22%', display: 'block' }}
                  />
                </div>
                <div className="sp-cell-copy">
                  <h3 className="sp-cell-title">Painel Web & ERP PJ</h3>
                  <p className="sp-cell-desc">
                    Tudo o que você conversa no WhatsApp alimenta dashboards interativos, DRE, fluxo de caixa, metas e o módulo empresarial completo.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ================= ACT 5: STATS — FIGURE SET BY A SLIDER ================= */}
        <section id="simulador" className="sp-stats" aria-labelledby="stats-heading">
          <div className="sp-frame" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '64px' }}>
            <div style={{ maxWidth: '520px' }} data-sc-in>
              <h2 id="stats-heading" className="sp-h2">
                Quantos gastos na semana?
              </h2>
              <p className="sp-section-lead">
                Arraste o controle para medir o tempo e os vazamentos invisíveis que você recupera ao trocar planilhas manuais por comandos de voz.
              </p>

              {/* True-size Slider Control [data-ui] */}
              <div
                data-ui="stats-slider"
                className="sp-ui-fragment"
                style={{ marginTop: '28px', padding: '18px 20px', maxWidth: '420px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <label htmlFor="weekly-slider" style={{ fontSize: '14px', fontWeight: 500, color: '#d8e2dc' }}>
                    Lançamentos e recibos por semana
                  </label>
                  <span style={{ fontSize: '20px', fontWeight: 600, color: '#10b981' }}>
                    {weeklyEntries} / sem
                  </span>
                </div>
                <input
                  id="weekly-slider"
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={weeklyEntries}
                  onChange={(e) => setWeeklyEntries(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', height: '24px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#8f9b93', marginTop: '4px' }}>
                  <span>5 lançamentos</span>
                  <span>80 lançamentos</span>
                </div>
              </div>
            </div>

            {/* Bottom Baseline: Monumental Figure + Working-Out Explanation */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '24px'
              }}
              data-sc-in
            >
              <p className="sp-giant-figure">
                <span>{hoursSavedPerYear}</span>
                <span className="sp-giant-unit">horas livres/ano</span>
              </p>

              <p style={{ fontSize: '17px', lineHeight: 1.55, color: 'var(--muted)', maxWidth: '34ch', margin: 0 }}>
                Calculado sobre {weeklyEntries * 52} registros anuais a 2,4 minutos poupados por conciliação manual, além de cerca de R$ {annualLeakageSaved.toLocaleString('pt-BR')} em taxas e gastos esquecidos evitados.
              </p>
            </div>
          </div>
        </section>

        {/* ================= ACT 6: PRICING — THE PRICE, VERY LARGE + SECURITY ================= */}
        <section id="planos" className="sp-pricing" aria-labelledby="pricing-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              {/* Left Column (Columns 1-4): Heading + Paragraph + Plan Switcher */}
              <div style={{ gridColumn: '1 / span 4' }} data-sc-in>
                <h2 id="pricing-heading" className="sp-h2">
                  Preço claro, sem letras.
                </h2>
                <p className="sp-section-lead">
                  Todas as ferramentas liberadas desde o primeiro minuto: WhatsApp IA 24h, Vision OCR, Bolsa B3, Google Agenda com Meet, Modo Casal e Painel Web.
                </p>

                {/* Live Plan Switcher [data-ui] */}
                <div
                  data-ui="pricing-switcher"
                  className="sp-ui-fragment"
                  style={{ marginTop: '28px', padding: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}
                >
                  <button
                    type="button"
                    onClick={() => setBillingPlan('annual')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '4px',
                      border: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: billingPlan === 'annual' ? '#10b981' : 'transparent',
                      color: billingPlan === 'annual' ? '#05120c' : '#d8e2dc'
                    }}
                  >
                    Anual · 44% OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPlan('monthly')}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '4px',
                      border: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: billingPlan === 'monthly' ? '#10b981' : 'transparent',
                      color: billingPlan === 'monthly' ? '#05120c' : '#d8e2dc'
                    }}
                  >
                    Mensal · Flexível
                  </button>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '14px' }}>
                  {billingPlan === 'annual'
                    ? 'Equivalente a R$ 199,00 à vista no ano (economia de R$ 159,80 sobre o mensal).'
                    : 'Assinatura mensal de R$ 29,90 sem fidelidade. Cancele quando quiser em 1 clique.'}
                </p>
              </div>

              {/* Right Column (Columns 6-12): Monumental Price Figure Overlapped by Custom Plate */}
              <div style={{ gridColumn: '6 / span 7', position: 'relative' }} data-sc-in>
                <div style={{ position: 'relative', display: 'inline-block', paddingTop: '20px' }}>
                  {/* Overlapping Custom Brand Photo at top-right of the numerals */}
                  <div
                    style={{
                      width: 'clamp(130px, 16vw, 210px)',
                      height: 'clamp(90px, 11vw, 140px)',
                      borderRadius: 'var(--radius-page)',
                      overflow: 'hidden',
                      marginLeft: 'auto',
                      marginBottom: '-22px',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    <img
                      src="/assets/landing/simplific-hero-hands.jpg"
                      alt="Conexão humana e inteligência artificial no Simplific Pro"
                      width="600"
                      height="400"
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>

                  <div className="sp-price-numerals">
                    <span className="sp-price-currency">R$</span>
                    <span>{billingPlan === 'annual' ? '16,58' : '29,90'}</span>
                    <span className="sp-price-period">
                      {billingPlan === 'annual' ? '/mês em 12x (ou R$ 199/ano)' : '/mês sem fidelidade'}
                    </span>
                  </div>
                </div>

                {/* Four Plain Included Lines (without ticks or bullets per blueprint) */}
                <div style={{ marginTop: '36px', display: 'grid', gap: '12px', fontSize: '18px', color: 'var(--ink)' }}>
                  <div>Assessor IA 24h no seu WhatsApp e Painel Web Vision completo</div>
                  <div>Leitura ilimitada de fotos de comprovantes, PDFs e comandos de voz</div>
                  <div>Cotações da Bolsa B3 ao vivo, Google Agenda com Meet e Modo Casal</div>
                  <div>Garantia incondicional de 7 dias grátis com reembolso em 1 clique</div>
                </div>

                <div style={{ marginTop: '36px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <Link
                    to={`/login?tab=register&plan=${billingPlan}`}
                    className="sp-btn-primary"
                  >
                    <span>
                      {billingPlan === 'annual'
                        ? 'Começar 7 dias grátis no Anual'
                        : 'Começar 7 dias grátis no Mensal'}
                    </span>
                    <ArrowRight size={17} />
                  </Link>
                  <Link
                    to={`/checkout?plan=${billingPlan}`}
                    className="sp-btn-quiet"
                  >
                    <span>Ir direto para assinatura</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Security & Verification Band (#seguranca) */}
            <div
              id="seguranca"
              style={{
                marginTop: '96px',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-page)',
                padding: 'clamp(24px, 3.5vw, 40px)'
              }}
              data-sc-in
            >
              <div className="sp-grid-12" style={{ alignItems: 'center' }}>
                <div style={{ gridColumn: '1 / span 5' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 500, margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                    Defesa em profundidade.
                  </h3>
                  <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 16px 0' }}>
                    Criptografia ponta a ponta AES-256, conformidade rigorosa com a LGPD (Lei nº 13.709/2018) e operação sobre infraestrutura oficial verificada.
                  </p>
                  <Link to="/seguranca" className="sp-btn-quiet" style={{ paddingLeft: 0 }}>
                    <span>Conhecer arquitetura de segurança</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>

                <div
                  style={{
                    gridColumn: '6 / span 7',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '10px'
                  }}
                >
                  <div style={{ backgroundColor: 'var(--surface-high)', padding: '18px', borderRadius: 'var(--radius-page)' }}>
                    <img src="/assets/logo_meta.png" alt="Meta Tech Provider" width="90" height="28" loading="lazy" style={{ height: '24px', width: 'auto', objectFit: 'contain', marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Meta Official API</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Canal verificado sem risco</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-high)', padding: '18px', borderRadius: 'var(--radius-page)' }}>
                    <img src="/assets/logo_google.png" alt="Google Cloud" width="90" height="28" loading="lazy" style={{ height: '24px', width: 'auto', objectFit: 'contain', marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Google Cloud</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Isolamento e backups diários</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-high)', padding: '18px', borderRadius: 'var(--radius-page)' }}>
                    <img src="/assets/logo_twilio.png" alt="Twilio Security" width="90" height="28" loading="lazy" style={{ height: '24px', width: 'auto', objectFit: 'contain', marginBottom: '10px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Criptografia TLS 1.3</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>Zero acesso à senha bancária</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 7: FAQ — ACCORDION OF FILLED TILES ================= */}
        <section id="faq" className="sp-faq" aria-labelledby="faq-heading">
          <div className="sp-frame sp-grid-12">
            <div style={{ gridColumn: '1 / span 4' }}>
              <div className="sp-faq-sticky" data-sc-in>
                <h2 id="faq-heading" className="sp-h2">
                  Dúvidas comuns.
                </h2>
                <p className="sp-section-lead">
                  Respostas diretas sobre privacidade, funcionamento no WhatsApp e garantia de reembolso.
                </p>
                <div style={{ marginTop: '20px' }}>
                  <Link to="/contato" className="sp-btn-quiet">
                    <span>Falar com nossa equipe</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: '5 / span 8' }} className="sp-faq-list" data-sc-in>
              {FAQ_ITEMS.map((item, idx) => (
                <details
                  key={item.q}
                  name="simplific-faq"
                  className="sp-faq-tile"
                  open={idx === 0}
                >
                  <summary className="sp-faq-summary">
                    <span>{item.q}</span>
                    <span className="sp-faq-plus" aria-hidden="true" />
                  </summary>
                  <div className="sp-faq-answer">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ACT 8: CTA — THE ACTION TILE ================= */}
        <section className="sp-cta-board" aria-labelledby="cta-heading">
          <div className="sp-frame">
            <div className="sp-cta-row" data-sc-in>
              {/* Left Flanking Tile: Real Custom Photography */}
              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-assessor-financeiro.jpg"
                  alt="Assessor Simplific Pro pronto para atender no WhatsApp"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>

              {/* Center Wide Accent Tile */}
              <div className="sp-cta-center">
                <h2
                  id="cta-heading"
                  style={{
                    fontSize: 'clamp(28px, 3vw, 40px)',
                    fontWeight: 600,
                    lineHeight: 1.06,
                    letterSpacing: '-0.03em',
                    color: '#05120c',
                    margin: '0 0 12px 0'
                  }}
                >
                  Teste sete dias grátis.
                </h2>
                <p
                  style={{
                    fontSize: '17px',
                    lineHeight: 1.55,
                    color: '#07281b',
                    maxWidth: '48ch',
                    margin: '0 0 28px 0'
                  }}
                >
                  Configure seu número em menos de 1 minuto. Se não transformar sua rotina financeira na primeira semana, você cancela com 1 clique sem pagar nada.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate('/login?tab=register');
                  }}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: '#080908',
                    padding: '6px',
                    borderRadius: '4px'
                  }}
                >
                  <input
                    type="email"
                    value={ctaQuickText}
                    onChange={(e) => setCtaQuickText(e.target.value)}
                    placeholder="Seu melhor e-mail para liberar o teste"
                    aria-label="Seu melhor e-mail para liberar os 7 dias grátis"
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      backgroundColor: 'transparent',
                      border: 0,
                      padding: '10px 12px',
                      color: '#f3f6f4',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#10b981',
                      color: '#05120c',
                      border: 0,
                      borderRadius: '4px',
                      padding: '12px 20px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>Liberar acesso</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              {/* Right Flanking Tile: Flat Palette Surface */}
              <div
                className="sp-cta-flank"
                style={{
                  backgroundColor: 'var(--surface-high)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  WhatsApp Oficial 24/7
                </div>
                <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                  7 dias
                </div>
                <div style={{ fontSize: '14px', color: 'var(--ink)' }}>
                  Reembolso integral garantido
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER — A SINGLE QUIET LINE ================= */}
      <footer className="sp-footer-void">
        <div className="sp-frame sp-footer-line">
          <div>Simplific Pro · Assessor Financeiro IA</div>

          <nav className="sp-footer-links" aria-label="Links Institucionais">
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
    </div>
  );
}
