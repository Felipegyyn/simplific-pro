import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const COCKPIT_MODES = {
  pf: {
    id: 'pf',
    label: 'Visão PF & Orçamento',
    headline: 'Fluxo Pessoal Consolidado',
    metricLabel: 'Saldo Livre Projetado (Novembro)',
    metricValue: 'R$ 6.840,00',
    rows: [
      { name: 'Orçamento de Lazer', status: '68% utilizado (restam R$ 320)', tone: '#10b981' },
      { name: 'Fatura Itaú Black (Venc. 10/11)', status: 'R$ 2.450,00 provisionado', tone: '#f3f6f4' },
      { name: 'Categorias Personalizadas', status: '14 categorias ativas (PF + Casal)', tone: '#10b981' }
    ]
  },
  b3: {
    id: 'b3',
    label: 'Investimentos & B3',
    headline: 'Carteira 360º em Tempo Real',
    metricLabel: 'Patrimônio Consolidado',
    metricValue: 'R$ 148.920,00',
    rows: [
      { name: 'Ações B3 (PETR4, WEGE3, ITUB4)', status: 'R$ 62.400,00 · +14,2% no ano', tone: '#10b981' },
      { name: 'Fundos Imobiliários (MXRF11, HGLG11)', status: 'Dividendos: R$ 584,00/mês isentos', tone: '#10b981' },
      { name: 'Renda Fixa CDI & Tesouro Selic', status: 'R$ 86.520,00 · Liquidez diária', tone: '#f3f6f4' }
    ]
  },
  pj: {
    id: 'pj',
    label: 'Balanço Mensal & ERP PJ',
    headline: 'Fechamento Mensal Automático',
    metricLabel: 'Resultado Operacional Líquido',
    metricValue: '+ R$ 24.300,00',
    rows: [
      { name: 'Contas a Receber Conciliadas', status: 'R$ 48.900,00 (96% quitado no prazo)', tone: '#10b981' },
      { name: 'Contas a Pagar & Fornecedores', status: 'R$ 24.600,00 (0 atrasos)', tone: '#f3f6f4' },
      { name: 'Relatório DRE & Evolução Patrimonial', status: 'PDF e Dashboard prontos em 1 clique', tone: '#10b981' }
    ]
  }
};

const GOAL_PRESETS = [
  {
    id: 'reserva',
    title: 'Reserva Blindada (6 meses)',
    target: 36000,
    months: 12,
    monthly: '3.000',
    detail: 'Equivalente a R$ 100/dia monitorados automaticamente pelo seu Assessor no WhatsApp.'
  },
  {
    id: 'viagem',
    title: 'Viagem Internacional',
    target: 24000,
    months: 10,
    monthly: '2.400',
    detail: 'O Simplific avisa toda sexta-feira se o ritmo de gastos da semana manteve sua meta intacta.'
  },
  {
    id: 'carro',
    title: 'Troca de Veículo à Vista',
    target: 90000,
    months: 18,
    monthly: '5.000',
    detail: 'Aporte mensal calculado com rendimento líquido do CDI para você fugir dos juros de financiamento.'
  }
];

const EIGHT_BENEFITS = [
  {
    title: 'Praticidade no Dia a Dia',
    description:
      'Esqueça planilhas complexas. Com o Simplific Pro, você registra seus gastos em segundos pelo celular via áudio, texto ou foto, onde estiver.',
    uiTitle: 'Registro Instantâneo WhatsApp',
    uiLeft: 'Áudio 0:03 · "Almoço 64 no Pix"',
    uiRight: 'Lançado em Alimentação'
  },
  {
    title: 'Liberdade Financeira',
    description:
      'Saia do vermelho e construa patrimônio. Nossas ferramentas mostram exatamente onde cortar gastos invisíveis e quanto direcionar para investimentos.',
    uiTitle: 'Raio-X de Vazamentos Mensais',
    uiLeft: 'Assinaturas e taxas ociosas',
    uiRight: 'R$ 480,00/mês recuperados'
  },
  {
    title: 'Investimentos Controlados',
    description:
      'Tenha uma visão 360º da sua carteira. Ações, FIIs, Renda Fixa e Cripto em um único lugar, com atualização automática de cotações.',
    uiTitle: 'Alocação da Carteira',
    uiLeft: 'Renda Fixa 58% · Ações/FIIs 42%',
    uiRight: 'Rentabilidade +1,34% mês'
  },
  {
    title: 'Home Broker Integrado',
    description:
      'Integração inteligente para leitura e acompanhamento de cotações da B3 em tempo real, preço médio proporcional e proventos.',
    uiTitle: 'Cotações B3 em Tempo Real',
    uiLeft: 'PETR4 R$ 38,90 · WEGE3 R$ 54,10',
    uiRight: 'Pregão B3 conectado'
  },
  {
    title: 'Metas Claras',
    description:
      'Defina objetivos (viagem, carro, casa) e o sistema calcula exatamente quanto você precisa poupar por mês para chegar lá no prazo.',
    uiTitle: 'Progresso de Objetivos',
    uiLeft: 'Meta Reserva: R$ 28.800 / R$ 36.000',
    uiRight: '80% concluído'
  },
  {
    title: 'Planejamento Inteligente',
    description:
      'Crie orçamentos para cada categoria (ex: R$ 500 para Lazer) e receba alertas no WhatsApp quando estiver perto do limite.',
    uiTitle: 'Teto por Categoria',
    uiLeft: 'Lazer & Restaurantes: R$ 410 / R$ 500',
    uiRight: 'Alerta preventivo em 80%'
  }
];

const Beneficios = () => {
  const navigate = useNavigate();
  const [cockpitKey, setCockpitKey] = useState('pf');
  const [goalIdx, setGoalIdx] = useState(0);

  const activeCockpit = COCKPIT_MODES[cockpitKey];
  const activeGoal = GOAL_PRESETS[goalIdx];

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = document.querySelectorAll('[data-sc-in]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        {/* ================= ACT 1: HERO STAGE ================= */}
        <section className="sp-hero" aria-labelledby="beneficios-heading">
          <div className="sp-frame sp-grid-12" style={{ alignItems: 'start' }}>
            <div className="sp-hero-copy">
              <h1 id="beneficios-heading" className="sp-h1">
                <span className="sp-line"><span>Recursos que</span></span>
                <span className="sp-line"><span>transformam tudo.</span></span>
              </h1>

              <p className="sp-hero-lead">
                Descubra como cada detalhe do Simplific Pro foi desenhado para te dar controle total sobre gastos, cartões, investimentos na B3 e metas sem abrir planilhas.
              </p>

              <div className="sp-hero-actions">
                <Link to="/login?tab=register" className="sp-btn-primary">
                  <span>Testar 7 dias grátis</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/inteligencia" className="sp-btn-quiet">
                  <span>Ver Inteligência IA</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="sp-hero-stage-wrap">
              <div className="sp-hero-bg-plate sp-shutter">
                <img
                  src="/assets/landing/simplific-insight.jpg"
                  alt="Mesa executiva com painel de controle financeiro do Simplific Pro"
                  width="1600"
                  height="1200"
                />
                <div className="sp-hero-scrim" aria-hidden="true" />
              </div>

              <div className="sp-hero-stage-inner">
                <div
                  data-ui="benefits-cockpit"
                  className="sp-ui-fragment"
                  style={{ padding: '20px', backgroundColor: '#0c100e' }}
                >
                  <div
                    role="tablist"
                    aria-label="Módulos do Ecossistema Simplific Pro"
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}
                  >
                    {Object.values(COCKPIT_MODES).map((item) => {
                      const active = item.id === cockpitKey;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setCockpitKey(item.id)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: active ? '#10b981' : '#242e28',
                            backgroundColor: active ? '#10b981' : '#131916',
                            color: active ? '#05120c' : '#f3f6f4',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#111613',
                      border: '1px solid #1f2823',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: '#a8b4ac' }}>{activeCockpit.metricLabel}</div>
                        <div style={{ fontSize: '28px', fontWeight: 600, color: '#10b981', marginTop: '4px' }}>
                          {activeCockpit.metricValue}
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f3f6f4' }}>
                        {activeCockpit.headline}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gap: '10px', borderTop: '1px solid #1e2621', paddingTop: '14px' }}>
                      {activeCockpit.rows.map((row) => (
                        <div
                          key={row.name}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '14px' }}
                        >
                          <span style={{ color: '#d8e1dc' }}>{row.name}</span>
                          <span style={{ fontWeight: 600, color: row.tone }}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 2: 6 CORE BENEFITS STAGGERED MATRIX ================= */}
        <section className="sp-features" aria-labelledby="pilares-heading">
          <div className="sp-frame">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }} data-sc-in>
              <h2 id="pilares-heading" className="sp-h2">
                Oito pilares de controle.
              </h2>
              <Link to="/planos" className="sp-btn-quiet">
                <span>Ver planos de assinatura</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="sp-stagger-grid">
              {EIGHT_BENEFITS.map((item, idx) => (
                <article key={item.title} className="sp-cell" data-sc-in style={{ '--i': idx % 3 }}>
                  <div className="sp-cell-copy">
                    <h3 className="sp-cell-title">{item.title}</h3>
                    <p className="sp-cell-desc">{item.description}</p>
                  </div>
                  <div className="sp-cell-dock">
                    <div
                      data-ui={`benefit-cell-${idx}`}
                      className="sp-ui-fragment"
                      style={{ padding: '16px', borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#f3f6f4', marginBottom: '6px' }}>
                        {item.uiTitle}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', fontSize: '14px' }}>
                        <span style={{ color: '#a8b4ac' }}>{item.uiLeft}</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{item.uiRight}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pilares 7 e 8: Balanço Geral Mensal & Categorias Personalizadas + Fotografia Autoral */}
            <div
              className="sp-grid-12"
              style={{ marginTop: '24px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-page)', padding: '32px' }}
              data-sc-in
            >
              <div style={{ gridColumn: '1 / span 4', borderRadius: '4px', overflow: 'hidden', maxHeight: '260px' }}>
                <img
                  src="/assets/landing/simplific-assessor-agenda.jpg"
                  alt="Assessor Simplific Pro apresentando balanço mensal e categorias personalizadas"
                  width="640"
                  height="640"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ gridColumn: '5 / span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 className="sp-cell-title">Balanço Geral Mensal</h3>
                <p className="sp-cell-desc">
                  Relatórios automáticos que fecham o seu mês, mostrando sua evolução patrimonial, fluxo de caixa, DRE empresarial e pendências sem esforço manual.
                </p>
              </div>

              <div style={{ gridColumn: '9 / span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 className="sp-cell-title">Categorias Personalizadas</h3>
                <p className="sp-cell-desc">
                  O sistema se adapta a você. Crie, edite e exclua categorias de despesas e receitas conforme a sua realidade pessoal, familiar ou empresarial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 3: GOAL CALCULATOR ("Metas Claras") ================= */}
        <section className="sp-stats" aria-labelledby="metas-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'end' }}>
              <div style={{ gridColumn: '1 / span 6' }} data-sc-in>
                <h2 id="metas-heading" className="sp-h2">
                  Metas claras no prazo.
                </h2>
                <p className="sp-section-lead">
                  Escolha um objetivo para ver como o Simplific calcula a poupança mensal exata e acompanha sua evolução toda semana.
                </p>
              </div>

              <div style={{ gridColumn: '7 / span 6' }} data-sc-in>
                <div
                  data-ui="goal-selector"
                  className="sp-ui-fragment"
                  style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}
                >
                  {GOAL_PRESETS.map((g, i) => {
                    const selected = goalIdx === i;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoalIdx(i)}
                        style={{
                          padding: '12px 10px',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: selected ? '#10b981' : '#242e28',
                          backgroundColor: selected ? '#10b981' : '#121714',
                          color: selected ? '#05120c' : '#f3f6f4',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {g.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="sp-grid-12" style={{ marginTop: '48px', alignItems: 'baseline' }} data-sc-in>
              <div style={{ gridColumn: '1 / span 7', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <span className="sp-giant-figure">{activeGoal.monthly}</span>
                <span className="sp-giant-unit">R$ poupados/mês</span>
              </div>

              <div style={{ gridColumn: '8 / span 5' }}>
                <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.6, color: 'var(--body-ink)', margin: 0 }}>
                  Para atingir R$ {activeGoal.target.toLocaleString('pt-BR')} em {activeGoal.months} meses. {activeGoal.detail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 4: CTA BOARD ================= */}
        <section className="sp-cta-board" aria-labelledby="beneficios-cta">
          <div className="sp-frame">
            <div className="sp-cta-row" data-sc-in>
              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-assessor-financeiro.jpg"
                  alt="Assessor Simplific Pro pronto para organizar suas finanças"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>

              <div className="sp-cta-center">
                <h2 id="beneficios-cta" className="sp-h2" style={{ color: '#05120c', margin: '0 0 12px 0' }}>
                  Assuma o controle hoje.
                </h2>
                <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.55, color: '#07281b', maxWidth: '48ch', margin: '0 0 28px 0' }}>
                  Ative seus 7 dias grátis ou conheça nossos planos com garantia incondicional de reembolso.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/login?tab=register')}
                    style={{
                      backgroundColor: '#080908',
                      color: '#f3f6f4',
                      border: 0,
                      borderRadius: '4px',
                      padding: '14px 24px',
                      fontSize: 'var(--step-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span>Testar 7 dias grátis</span>
                    <ArrowRight size={16} />
                  </button>

                  <Link
                    to="/planos"
                    style={{
                      color: '#05120c',
                      fontSize: 'var(--step-small)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Comparar planos Mensal e Anual</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-hero.jpg"
                  alt="Painel Simplific Pro em operação"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Beneficios;
