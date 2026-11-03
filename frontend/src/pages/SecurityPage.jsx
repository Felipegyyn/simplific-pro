import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const VERIFIED_PARTNERS = [
  {
    name: 'Meta Business',
    badge: 'Verificação Concluída',
    desc: 'Identidade empresarial validada para operação oficial na WhatsApp Business API.',
    logo: '/assets/logo_meta.png'
  },
  {
    name: 'Twilio Tech',
    badge: 'Parceiro Oficial',
    desc: 'Infraestrutura global de mensageria criptografada com alta disponibilidade.',
    logo: '/assets/logo_twilio.png'
  },
  {
    name: 'Google Cloud',
    badge: 'Ambiente Isolado',
    desc: 'Servidores blindados com backups diários e criptografia em repouso AES-256.',
    logo: '/assets/logo_google.png'
  },
  {
    name: 'Reclame Aqui',
    badge: 'RA Verificada',
    desc: 'Empresa auditada e comprometida com transparência radical no atendimento.',
    logo: '/assets/logo_reclameaqui.png'
  }
];

const DATA_JOURNEY = [
  {
    stage: 'Etapa 1 · Coleta Segura',
    title: 'Canal Oficial WhatsApp API',
    detail:
      'Você envia áudio, texto ou foto pelo WhatsApp. A comunicação trafega sob a criptografia oficial da Meta (WhatsApp Business API) e TLS 1.3.',
    protocol: 'TLS 1.3 + Meta Official Webhook'
  },
  {
    stage: 'Etapa 2 · Anonimização',
    title: 'Separação de Identidade',
    detail:
      'Ao chegar em nossos servidores, dados identificadores (como telefone e e-mail) são desacoplados dos payloads de processamento da Inteligência Artificial.',
    protocol: 'Zero-Training PII Isolation'
  },
  {
    stage: 'Etapa 3 · Armazenamento',
    title: 'Bancos Isolados no Google Cloud',
    detail:
      'Os registros financeiros são persistidos em instâncias isoladas no Google Cloud, criptografados em repouso no padrão militar AES-256.',
    protocol: 'AES-256 Encryption at Rest'
  },
  {
    stage: 'Etapa 4 · Acesso Restrito',
    title: 'Leitura Exclusiva (Read-Only)',
    detail:
      'Nenhum humano tem acesso aos seus dados brutos e o sistema jamais solicita sua senha de transação bancária. Apenas você visualiza seu dashboard.',
    protocol: 'Least-Privilege & Hash Bcrypt'
  }
];

const SECURITY_FAQ = [
  {
    q: 'O Simplific pode movimentar meu dinheiro?',
    a: 'Absolutamente não. Nossa tecnologia opera exclusivamente em modo de leitura e organização (Read-Only). Nós estruturamos as informações que você registra ou consulta, mas não possuímos permissão técnica nem credenciais para realizar TEDs, Pix ou pagamentos em seu nome.'
  },
  {
    q: 'E se eu perder meu celular?',
    a: 'Seu acesso ao Painel Web do Simplific Pro é protegido por autenticação própria criptografada. Mesmo que terceiros tenham acesso temporário ao aparelho, não conseguirão acessar seu painel administrativo nem movimentar qualquer conta bancária.'
  },
  {
    q: 'Como excluo meus dados definitivamente (LGPD)?',
    a: 'Em conformidade rigorosa com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você dispõe do comando de exclusão de conta nas configurações. Seus dados são imediatamente removidos do painel e agendados para exclusão definitiva (Hard Delete) em até 30 dias.'
  },
  {
    q: 'Como reportar uma vulnerabilidade (White Hat)?',
    a: 'Valorizamos pesquisadores de segurança. Caso identifique qualquer anomalia ou oportunidade de reforço em nossa infraestrutura, envie um relatório direto para nossa equipe de engenharia em contato@simplificpro.com.'
  }
];

const SecurityPage = () => {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);

  const activeStep = DATA_JOURNEY[stepIdx];

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
        <section className="sp-hero" aria-labelledby="security-heading">
          <div className="sp-frame sp-grid-12" style={{ alignItems: 'start' }}>
            <div className="sp-hero-copy">
              <h1 id="security-heading" className="sp-h1">
                <span className="sp-line"><span>Defesa total</span></span>
                <span className="sp-line"><span>dos seus dados.</span></span>
              </h1>

              <p className="sp-hero-lead">
                Adotamos uma arquitetura de defesa em profundidade: criptografia AES-256, conformidade integral com a LGPD, operação Read-Only e zero venda de dados.
              </p>

              <div className="sp-hero-actions">
                <Link to="/checkout?plan=annual" className="sp-btn-primary">
                  <span>Começar com proteção total</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/privacidade" className="sp-btn-quiet">
                  <span>Ler Política de Privacidade</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="sp-hero-stage-wrap">
              <div className="sp-hero-bg-plate sp-shutter">
                <img
                  src="/assets/landing/simplific-insight.jpg"
                  alt="Infraestrutura segura do Simplific Pro"
                  width="1600"
                  height="1200"
                />
                <div className="sp-hero-scrim" aria-hidden="true" />
              </div>

              <div className="sp-hero-stage-inner">
                <div
                  data-ui="security-partner-ledger"
                  className="sp-ui-fragment"
                  style={{ padding: '20px', backgroundColor: '#0c100e' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '14px',
                      marginBottom: '14px',
                      borderBottom: '1px solid #1e2621'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#f3f6f4' }}>
                      Ecossistema Auditado & Verificado
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      Sistemas Operacionais · AES-256
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '8px' }}>
                    {VERIFIED_PARTNERS.map((partner) => (
                      <div
                        key={partner.name}
                        style={{
                          padding: '8px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            width="68"
                            height="22"
                            style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#f3f6f4' }}>{partner.name}</span>
                            <span style={{ color: '#a8b4ac', marginLeft: '8px' }}>· {partner.desc}</span>
                          </div>
                        </div>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>{partner.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 2: A JORNADA DO DADO SEGURO ================= */}
        <section className="sp-routine-act" aria-labelledby="jornada-dado-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }} data-sc-in>
                <h2 id="jornada-dado-heading" className="sp-h2">
                  Jornada do dado seguro.
                </h2>
                <p className="sp-section-lead">
                  Acompanhe cada etapa de proteção desde o momento em que você envia uma mensagem no WhatsApp até a visualização no seu painel.
                </p>

                <div
                  role="tablist"
                  aria-label="Etapas da Jornada do Dado Seguro"
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '28px' }}
                >
                  {DATA_JOURNEY.map((item, idx) => {
                    const selected = stepIdx === idx;
                    return (
                      <button
                        key={item.stage}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setStepIdx(idx)}
                        className="sp-routine-step-btn"
                      >
                        <div style={{ fontWeight: 600 }}>{item.stage}</div>
                        <div style={{ fontSize: 'var(--step-small)', marginTop: '4px', color: selected ? '#062619' : 'var(--body-ink)' }}>
                          {item.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ gridColumn: '6 / span 7' }} data-sc-in>
                <div
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-page)',
                    padding: '32px',
                    display: 'grid',
                    gap: '24px'
                  }}
                >
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <h3 className="sp-h2">{activeStep.title}</h3>
                    <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.6, color: 'var(--body-ink)', margin: 0 }}>
                      {activeStep.detail}
                    </p>
                  </div>

                  <div
                    data-ui="security-protocol-box"
                    className="sp-ui-fragment"
                    style={{ padding: '18px 20px', backgroundColor: '#0c100e' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Protocolo Ativo</span>
                      <span style={{ color: '#f3f6f4', fontWeight: 600 }}>{activeStep.protocol}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', paddingTop: '10px', borderTop: '1px solid #1e2621' }}>
                      <div>
                        <div style={{ color: '#a8b4ac' }}>Conformidade</div>
                        <div style={{ fontWeight: 600, color: '#f3f6f4' }}>LGPD 13.709/2018</div>
                      </div>
                      <div>
                        <div style={{ color: '#a8b4ac' }}>Permissão Bancária</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>100% Read-Only</div>
                      </div>
                      <div>
                        <div style={{ color: '#a8b4ac' }}>Venda de Dados</div>
                        <div style={{ fontWeight: 600, color: '#10b981' }}>Zero Terceiros</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 3: PRIVACY BY DESIGN & WHITE HAT ================= */}
        <section className="sp-showcase" aria-labelledby="privacidade-design-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: '1 / span 6' }} data-sc-in>
                <h2 id="privacidade-design-heading" className="sp-h2">
                  Seus dados são seus.
                </h2>
                <p className="sp-section-lead">
                  Diferente de aplicativos gratuitos que monetizam seu perfil para bancos e corretoras, o Simplific Pro é sustentado exclusivamente pela sua assinatura: sem anúncios, sem venda de dados e com princípio de menor privilégio.
                </p>
              </div>

              <div style={{ gridColumn: '7 / span 6' }} data-sc-in>
                <div
                  data-ui="whitehat-card"
                  className="sp-ui-fragment"
                  style={{ padding: '24px', backgroundColor: '#0c100e', display: 'grid', gap: '14px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: '#f3f6f4' }}>Monitoramento 24/7 & White Hat</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Canal de Segurança</span>
                  </div>
                  <p style={{ margin: 0, color: '#d8e1dc', lineHeight: 1.55 }}>
                    Sistemas automatizados vigiam anomalias de tráfego em tempo real e funcionários não possuem acesso aos dados brutos de produção. Pesquisadores de segurança podem reportar achados diretamente à engenharia.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid #1e2621' }}>
                    <a
                      href="mailto:contato@simplificpro.com"
                      style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}
                    >
                      contato@simplificpro.com
                    </a>
                    <Link to="/termos" style={{ color: '#f3f6f4', textDecoration: 'none', fontWeight: 500 }}>
                      Consultar Termos de Uso →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 4: FAQ TÉCNICO DE SEGURANÇA ================= */}
        <section className="sp-faq" aria-labelledby="sec-faq-heading">
          <div className="sp-frame sp-grid-12">
            <div style={{ gridColumn: '1 / span 4' }} data-sc-in>
              <h2 id="sec-faq-heading" className="sp-h2">
                Dúvidas de segurança.
              </h2>
              <p className="sp-section-lead">
                Respostas técnicas sobre permissão de leitura, perda de aparelho e exclusão definitiva de dados.
              </p>
            </div>

            <div style={{ gridColumn: '5 / span 8' }} className="sp-faq-list" data-sc-in>
              {SECURITY_FAQ.map((item, idx) => (
                <details
                  key={item.q}
                  name="security-faq"
                  className="sp-faq-tile"
                  open={idx === 0}
                >
                  <summary className="sp-faq-summary" role="button">
                    <span>{item.q}</span>
                    <span className="sp-faq-plus" aria-hidden="true" />
                  </summary>
                  <div className="sp-faq-answer">{item.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ACT 5: CTA BOARD ================= */}
        <section className="sp-cta-board" aria-labelledby="sec-cta-heading">
          <div className="sp-frame">
            <div className="sp-cta-row" data-sc-in>
              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-assessor-financeiro.jpg"
                  alt="Segurança como premissa no Simplific Pro"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>

              <div className="sp-cta-center">
                <h2 id="sec-cta-heading" className="sp-h2" style={{ color: '#05120c', margin: '0 0 12px 0' }}>
                  Segurança é nossa premissa.
                </h2>
                <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.55, color: '#07281b', maxWidth: '48ch', margin: '0 0 28px 0' }}>
                  Junte-se a milhares de usuários que controlam suas finanças com proteção de nível bancário e garantia de 7 dias.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/checkout?plan=annual')}
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
                    <span>Começar Agora</span>
                    <ArrowRight size={16} />
                  </button>

                  <Link
                    to="/"
                    style={{
                      color: '#05120c',
                      fontSize: 'var(--step-small)',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    Voltar para a Página Inicial →
                  </Link>
                </div>
              </div>

              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-hero.jpg"
                  alt="Infraestrutura criptografada Simplific Pro"
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

export default SecurityPage;
