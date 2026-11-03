import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimplificMascot from '../components/SimplificMascot';
import './HomePage.css';

const AI_CAPABILITIES = [
  {
    id: 'voz',
    title: 'Registrar receitas e despesas por texto ou áudio',
    prompt: 'Passei 145 na farmácia no cartão Nubank e recebi 3.200 de dividendo hoje',
    reply: 'Registrado! Despesa de R$ 145,00 (Saúde · Nubank) e Receita de R$ 3.200,00 (Investimentos). Seu saldo líquido do mês subiu para +R$ 5.410,00.',
    module: 'Motor NLP & Whisper Audio'
  },
  {
    id: 'saldo',
    title: 'Consultar saldos e status do orçamento em tempo real',
    prompt: 'Como está meu orçamento de restaurantes e meu saldo no Itaú?',
    reply: 'Conta Itaú: R$ 8.920,00 livres. Orçamento de Restaurantes: R$ 410,00 de R$ 600,00 utilizados (restam R$ 190,00 para os próximos 9 dias).',
    module: 'Orçamento em Tempo Real'
  },
  {
    id: 'cartao',
    title: 'Registrar despesas e parcelamentos no cartão de crédito',
    prompt: 'Comprei um monitor por 1.800 em 6x no Itaú Black',
    reply: 'Compra parcelada lançada: 6x de R$ 300,00 no Itaú Black (Tecnologia). A 1ª parcela entra na fatura de Novembro.',
    module: 'Motor de Corte & Parcelas'
  },
  {
    id: 'fatura',
    title: 'Consultar limites disponíveis e faturas do cartão',
    prompt: 'Qual o valor fechado da minha fatura e quanto tenho de limite?',
    reply: 'Fatura Itaú Black aberta: R$ 2.450,00 (fecha dia 03). Limite disponível imediato: R$ 9.550,00 de R$ 12.000,00.',
    module: 'Gestão de Cartões'
  },
  {
    id: 'metas',
    title: 'Adicionar valores nas suas Metas Financeiras',
    prompt: 'Guardei mais 1.500 hoje na minha meta Reserva de Emergência',
    reply: 'Excelente! Meta "Reserva de Emergência" atualizada para R$ 30.300,00 de R$ 36.000,00 (84,1% concluída). Faltam R$ 5.700,00.',
    module: 'Rastreador de Metas'
  },
  {
    id: 'b3',
    title: 'Consultar preços de ativos da Bolsa (B3) em tempo real',
    prompt: 'Quanto está PETR4, WEGE3 e MXRF11 agora?',
    reply: 'Cotação B3 ao vivo: PETR4 R$ 38,90 (+2,41%) · WEGE3 R$ 54,10 (+1,85%) · MXRF11 R$ 10,08 (+0,30%).',
    module: 'Feed B3 & Brapi/Yahoo'
  },
  {
    id: 'carteira',
    title: 'Cadastrar novos investimentos na sua Carteira',
    prompt: 'Comprei 100 ações de ITUB4 a 34,80 hoje',
    reply: 'Ordem registrada na Carteira: +100 ITUB4 a R$ 34,80 (Total R$ 3.480,00). Seu preço médio foi recalculado automaticamente.',
    module: 'Carteira Consolidada'
  },
  {
    id: 'simulacao',
    title: 'Fazer simulações de investimentos e financiamentos',
    prompt: 'Quanto rende 2.000 por mês a 1% ao mês durante 5 anos?',
    reply: 'Simulação de Juros Compostos: Aportando R$ 2.000/mês por 60 meses a 1,0% a.m., você acumula R$ 163.339,34 (R$ 43.339,34 só de juros).',
    module: 'Calculadora Price & Juros'
  },
  {
    id: 'agenda',
    title: 'Adicionar lembretes e eventos na Agenda com Google Meet',
    prompt: 'Agende reunião de fechamento amanhã às 15h com link do Meet',
    reply: 'Evento criado no Google Calendar: "Reunião de Fechamento" amanhã às 15:00. Sala gerada: meet.google.com/kqx-vbnr-pms.',
    module: 'Google Calendar & Meet API'
  },
  {
    id: 'parceiro',
    title: 'Atuar como seu parceiro financeiro no dia a dia',
    prompt: 'Encontre o menor preço de um iPhone 16 Pro 256GB e veja se cabe no meu saldo',
    reply: 'Menor oferta à vista verificada: R$ 7.649,00 no Pix. Com seu saldo livre de R$ 8.920,00, a compra mantém R$ 1.271,00 de folga.',
    module: 'Pesquisa Web & Consultoria 24h'
  }
];

const Inteligencia = () => {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customOutput, setCustomOutput] = useState(null);

  const activeCap = AI_CAPABILITIES[selectedIdx];

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

  const handleSimulate = (e) => {
    e.preventDefault();
    const text = customQuestion.trim();
    if (!text) return;
    setCustomOutput({
      prompt: text,
      reply: `Comando processado pelo Simplific IA: "${text}" classificado com sucesso e sincronizado em tempo real com seu Painel Vision.`,
      module: 'Simulação em Tempo Real'
    });
    setCustomQuestion('');
  };

  const displayInteraction = customOutput || activeCap;

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        {/* ================= ACT 1: HERO STAGE ================= */}
        <section className="sp-hero" aria-labelledby="ia-heading">
          <div className="sp-frame sp-grid-12" style={{ alignItems: 'start' }}>
            <div className="sp-hero-copy">
              <h1 id="ia-heading" className="sp-h1">
                <span className="sp-line"><span>Assessor IA no</span></span>
                <span className="sp-line"><span>seu WhatsApp.</span></span>
              </h1>

              <p className="sp-hero-lead">
                Mais que um aplicativo, um Assessor Financeiro com Inteligência Artificial disponível 24 horas por dia. Você manda áudio, foto ou texto: ele entende, registra e aconselha.
              </p>

              <div className="sp-hero-actions">
                <Link to="/planos" className="sp-btn-primary">
                  <span>Falar com o Simplific</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/beneficios" className="sp-btn-quiet">
                  <span>Ver todos os recursos</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            <div className="sp-hero-stage-wrap">
              <div className="sp-hero-bg-plate sp-shutter">
                <img
                  src="/assets/landing/simplific-assessor-documentos.jpg"
                  alt="Assessor Financeiro Simplific analisando documentos e comprovantes"
                  width="1200"
                  height="1200"
                />
                <div className="sp-hero-scrim" aria-hidden="true" />
              </div>

              <div className="sp-hero-stage-inner">
                <div
                  data-ui="ai-live-console"
                  className="sp-ui-fragment"
                  style={{ backgroundColor: '#0c100e' }}
                >
                  <div
                    style={{
                      padding: '14px 18px',
                      backgroundColor: '#111714',
                      borderBottom: '1px solid #1e2621',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                        <SimplificMascot size={36} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f3f6f4' }}>Simplific IA · Motor Multimodal</div>
                        <div style={{ color: '#a8b4ac' }}>Voz, Visão Computacional OCR, B3 e Google Calendar</div>
                      </div>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Online 24/7</span>
                  </div>

                  <div style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                      <div
                        style={{
                          backgroundColor: '#10b981',
                          color: '#05120c',
                          padding: '10px 14px',
                          borderRadius: '6px 6px 0 6px',
                          maxWidth: '86%',
                          fontWeight: 500
                        }}
                      >
                        {displayInteraction.prompt}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#121815',
                        border: '1px solid #222b26',
                        borderRadius: '0 6px 6px 6px',
                        padding: '14px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>Resposta Instantânea</span>
                        <span style={{ color: '#a8b4ac' }}>{displayInteraction.module}</span>
                      </div>
                      <p style={{ margin: 0, color: '#f3f6f4', lineHeight: 1.5 }}>
                        {displayInteraction.reply}
                      </p>
                    </div>

                    <form onSubmit={handleSimulate} style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Envie um comando de teste para a IA..."
                        aria-label="Comando de teste para a Inteligência Artificial"
                        style={{
                          flex: 1,
                          backgroundColor: '#080b09',
                          border: '1px solid #253029',
                          borderRadius: '4px',
                          padding: '9px 12px',
                          color: '#f3f6f4',
                          fontSize: '14px',
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
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>Enviar</span>
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 2: REAL VIDEO & MULTIMODAL CAPABILITIES ================= */}
        <section className="sp-showcase" aria-labelledby="capacidades-ia-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 4' }} data-sc-in>
                <h2 id="capacidades-ia-heading" className="sp-h2">
                  Dez capacidades nativas.
                </h2>
                <p className="sp-section-lead">
                  Selecione qualquer habilidade abaixo para testar no console ou veja o vídeo real da conversa acontecendo no WhatsApp.
                </p>

                <div
                  style={{
                    marginTop: '28px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#080908'
                  }}
                >
                  <video
                    src="/assets/mobile_demo.mp4"
                    poster="/assets/landing/simplific-hero.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '5 / span 8' }} data-sc-in>
                <div
                  data-ui="capabilities-interactive-list"
                  className="sp-ui-fragment"
                  style={{ padding: '20px', backgroundColor: '#0c100e', display: 'grid', gap: '8px' }}
                >
                  {AI_CAPABILITIES.map((cap, idx) => {
                    const isSelected = !customOutput && selectedIdx === idx;
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => {
                          setCustomOutput(null);
                          setSelectedIdx(idx);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 16px',
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: isSelected ? '#10b981' : '#1f2823',
                          backgroundColor: isSelected ? '#10b981' : '#111613',
                          color: isSelected ? '#05120c' : '#f3f6f4',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '14px'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{cap.title}</span>
                        <span style={{ color: isSelected ? '#062619' : '#10b981', fontWeight: 500, flexShrink: 0 }}>
                          {cap.module}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACT 3: CTA BOARD ================= */}
        <section className="sp-cta-board" aria-labelledby="ia-cta-heading">
          <div className="sp-frame">
            <div className="sp-cta-row" data-sc-in>
              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-hero-hands.jpg"
                  alt="Conexão humana com a Inteligência Artificial do Simplific Pro"
                  width="600"
                  height="600"
                  loading="lazy"
                />
              </div>

              <div className="sp-cta-center">
                <h2 id="ia-cta-heading" className="sp-h2" style={{ color: '#05120c', margin: '0 0 12px 0' }}>
                  Coloque a IA para trabalhar.
                </h2>
                <p style={{ fontSize: 'var(--step-body)', lineHeight: 1.55, color: '#07281b', maxWidth: '48ch', margin: '0 0 28px 0' }}>
                  Conecte seu número em menos de 1 minuto e tenha seu próprio Assessor Financeiro 24h no WhatsApp.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/planos')}
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
                    <span>Escolher meu plano agora</span>
                    <ArrowRight size={16} />
                  </button>

                  <Link
                    to="/seguranca"
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
                    <span>Ver arquitetura de segurança</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="sp-cta-flank">
                <img
                  src="/assets/landing/simplific-hero.jpg"
                  alt="Interface de inteligência financeira Simplific Pro"
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

export default Inteligencia;
