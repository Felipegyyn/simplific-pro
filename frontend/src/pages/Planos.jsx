import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const PLAN_INCLUDED = [
  {
    feature: 'Assessor IA no WhatsApp 24/7 (Voz, Texto e Foto)',
    annual: 'Ilimitado · Incluso',
    monthly: 'Ilimitado · Incluso'
  },
  {
    feature: 'Leitura Óptica Vision AI (Cupons, Recibos Pix e Faturas PDF)',
    annual: 'Ilimitado · Incluso',
    monthly: 'Ilimitado · Incluso'
  },
  {
    feature: 'Painel Web Completo (Vision PF + Mini-ERP PJ com DRE)',
    annual: 'Acesso Total',
    monthly: 'Acesso Total'
  },
  {
    feature: 'Cotações da Bolsa (B3), FIIs e Cripto em Tempo Real',
    annual: 'Incluso',
    monthly: 'Incluso'
  },
  {
    feature: 'Sincronização Google Calendar & Links do Google Meet',
    annual: 'Incluso',
    monthly: 'Incluso'
  },
  {
    feature: 'Modo Casal / Sócio (2 números de WhatsApp na mesma conta)',
    annual: 'Incluso sem custo extra',
    monthly: 'Incluso sem custo extra'
  },
  {
    feature: 'Garantia Incondicional de Reembolso (Art. 49 CDC)',
    annual: '7 dias de garantia total',
    monthly: '7 dias de garantia total'
  }
];

const Planos = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('annual');
  const isAnnual = billingCycle === 'annual';

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

  const handleSubscribe = (cycle = billingCycle) => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: cycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual',
        value: cycle === 'monthly' ? 29.90 : 199.00,
        currency: 'BRL'
      });
    }

    if (cycle === 'monthly') {
      navigate('/checkout');
    } else {
      navigate('/checkout?plan=annual');
    }
  };

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        {/* ================= ACT 1: MONUMENTAL PRICING STAGE ================= */}
        <section className="sp-pricing" style={{ paddingTop: '56px' }} aria-labelledby="planos-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }} data-sc-in>
                <h1 id="planos-heading" className="sp-h1">
                  <span className="sp-line"><span>Escolha seu</span></span>
                  <span className="sp-line"><span>Plano Black.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  A oportunidade de ter um Assessor Financeiro com IA no seu WhatsApp e Painel Web completo pelo menor custo-benefício do mercado.
                </p>

                <div
                  data-ui="planos-billing-toggle"
                  style={{
                    marginTop: '24px',
                    display: 'inline-grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    padding: '6px',
                    backgroundColor: '#111513',
                    border: '1px solid #222b26',
                    borderRadius: '6px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '4px',
                      border: 0,
                      backgroundColor: isAnnual ? '#10b981' : 'transparent',
                      color: isAnnual ? '#05120c' : '#f3f6f4',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Anual · -45% OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '4px',
                      border: 0,
                      backgroundColor: !isAnnual ? '#10b981' : 'transparent',
                      color: !isAnnual ? '#05120c' : '#f3f6f4',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mensal · Flexível
                  </button>
                </div>

                <p style={{ marginTop: '16px', fontSize: 'var(--step-small)', color: 'var(--body-ink)', lineHeight: 1.55 }}>
                  {isAnnual
                    ? 'De R$ 358,80 por apenas R$ 199,00 à vista no ano (ou em até 12x de R$ 16,58). Economia imediata de R$ 159,80.'
                    : 'Assinatura mensal de R$ 29,90 sem fidelidade. Cancele quando quiser em 1 clique.'}
                </p>

                <div style={{ marginTop: '20px', borderRadius: '4px', overflow: 'hidden', maxWidth: '300px', aspectRatio: '16 / 10' }}>
                  <img
                    src="/assets/landing/simplific-hero-hands.jpg"
                    alt="Simplific Pro conectado ao WhatsApp"
                    width="640"
                    height="400"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '6 / span 7' }} data-sc-in>
                <div className="sp-price-numerals">
                  <span className="sp-price-currency">R$</span>
                  <span>{isAnnual ? '16,58' : '29,90'}</span>
                  <span className="sp-price-period">
                    {isAnnual ? '/mês no plano anual (R$ 199/ano)' : '/mês sem fidelidade'}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '32px',
                    display: 'grid',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: 'var(--step-body)', color: 'var(--ink)' }}>
                    Acesso ilimitado à Plataforma Web Vision (PF + PJ) e Assessor IA no WhatsApp
                  </div>
                  <div style={{ fontSize: 'var(--step-body)', color: 'var(--ink)' }}>
                    Sincronização automática de Google Agenda, Cotações B3 e Leitura Vision OCR
                  </div>
                  <div style={{ fontSize: 'var(--step-body)', color: 'var(--ink)' }}>
                    Garantia total de 7 dias e liberdade para cancelar quando quiser
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
                    <button
                      type="button"
                      onClick={() => handleSubscribe(billingCycle)}
                      className="sp-btn-primary"
                    >
                      <span>{isAnnual ? 'Quero o Plano Anual' : 'Assinar Plano Mensal'}</span>
                      <ArrowRight size={16} />
                    </button>

                    <Link to="/login?tab=register" className="sp-btn-quiet">
                      <span>Começar pelos 7 dias de teste grátis</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 2: COMPARATIVO COMPLETO DE RECURSOS ================= */}
        <section className="sp-showcase" aria-labelledby="comparativo-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 4' }} data-sc-in>
                <h2 id="comparativo-heading" className="sp-h2">
                  Tudo liberado desde o dia 1.
                </h2>
                <p className="sp-section-lead">
                  Não cobramos taxas extras por módulo. Tanto no plano Anual quanto no Mensal você recebe 100% da inteligência do Simplific Pro.
                </p>
                <div style={{ marginTop: '24px', borderRadius: '4px', overflow: 'hidden', aspectRatio: '16 / 10' }}>
                  <img
                    src="/assets/landing/simplific-insight.jpg"
                    alt="Mesa executiva com painel Simplific Pro"
                    width="800"
                    height="500"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '5 / span 8' }} data-sc-in>
                <div
                  data-ui="plan-feature-matrix"
                  className="sp-ui-fragment"
                  style={{ padding: '20px', backgroundColor: '#0c100e' }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gap: '12px',
                      paddingBottom: '12px',
                      marginBottom: '12px',
                      borderBottom: '1px solid #1e2621',
                      fontWeight: 600,
                      color: '#a8b4ac'
                    }}
                  >
                    <span>Recurso do Ecossistema</span>
                    <span style={{ color: '#10b981' }}>Plano Anual (-45%)</span>
                    <span>Plano Mensal</span>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {PLAN_INCLUDED.map((row) => (
                      <div
                        key={row.feature}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '10px 12px',
                          backgroundColor: '#111613',
                          borderRadius: '4px'
                        }}
                      >
                        <span style={{ color: '#f3f6f4', fontWeight: 500 }}>{row.feature}</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{row.annual}</span>
                        <span style={{ color: '#d8e1dc' }}>{row.monthly}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 3: CTA BOARD ================= */}
        <section className="sp-cta-board" aria-labelledby="planos-cta">
          <div className="sp-frame">
            <div className="sp-cta-row" data-sc-in>
              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-assessor-financeiro.jpg"
                  alt="Assinatura Simplific Pro com garantia de 7 dias"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>

              <div className="sp-cta-center">
                <h2 id="planos-cta" className="sp-h2" style={{ color: '#05120c', margin: '0 0 12px 0' }}>
                  Garantia blindada de 7 dias.
                </h2>
                <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.55, color: '#07281b', maxWidth: '48ch', margin: '0 0 28px 0' }}>
                  Assine agora com risco zero. Se por qualquer motivo você não amar a experiência na primeira semana, devolvemos 100% do seu investimento.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleSubscribe('annual')}
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
                    <span>Assinar Plano Anual com 45% OFF</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubscribe('monthly')}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#05120c',
                      border: '1px solid #05120c',
                      borderRadius: '4px',
                      padding: '13px 20px',
                      fontSize: 'var(--step-small)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Prefiro o Plano Mensal (R$ 29,90)
                  </button>
                </div>
              </div>

              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-hero.jpg"
                  alt="Painel Simplific Pro liberado em todos os planos"
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

export default Planos;
