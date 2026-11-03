import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const TOPICS = [
  { id: 'suporte', label: 'Suporte Técnico & WhatsApp' },
  { id: 'comercial', label: 'Dúvidas sobre Planos & Assinatura' },
  { id: 'lgpd', label: 'Privacidade & Direitos LGPD (DPO)' },
  { id: 'parcerias', label: 'Parcerias & Imprensa' }
];

const Contato = () => {
  const [topic, setTopic] = useState('suporte');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [bodyText, setBodyText] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentTopic = TOPICS.find((t) => t.id === topic) || TOPICS[0];

  const handleSendMail = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Simplific Pro] ${currentTopic.label} — ${senderName || 'Contato'}`);
    const body = encodeURIComponent(
      `Nome: ${senderName}\nE-mail: ${senderEmail}\nAssunto: ${currentTopic.label}\n\nMensagem:\n${bodyText}`
    );
    window.location.href = `mailto:contato@simplificpro.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="contato-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }}>
                <h1 id="contato-heading" className="sp-h1">
                  <span className="sp-line"><span>Fale com</span></span>
                  <span className="sp-line"><span>nossa equipe.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Tem alguma dúvida, sugestão ou precisa de suporte técnico? Nossa equipe de especialistas responde em até 24 horas úteis.
                </p>

                <div
                  data-ui="contact-direct-channels"
                  className="sp-ui-fragment"
                  style={{ padding: '20px', backgroundColor: '#0c100e', marginTop: '24px', display: 'grid', gap: '14px' }}
                >
                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid #1e2621' }}>
                    <div style={{ color: '#a8b4ac' }}>Atendimento Oficial via E-mail</div>
                    <a
                      href="mailto:contato@simplificpro.com"
                      style={{ fontSize: '20px', fontWeight: 600, color: '#10b981', textDecoration: 'none', display: 'inline-block', marginTop: '4px' }}
                    >
                      contato@simplificpro.com
                    </a>
                  </div>

                  <div style={{ paddingBottom: '12px', borderBottom: '1px solid #1e2621' }}>
                    <div style={{ color: '#a8b4ac' }}>Assessor IA no WhatsApp Oficial</div>
                    <div style={{ fontWeight: 600, color: '#f3f6f4', marginTop: '4px' }}>
                      +55 11 5199-1373 · Operação 24/7
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#a8b4ac' }}>Encarregado de Dados (DPO / LGPD)</div>
                    <div style={{ color: '#d8e1dc', marginTop: '4px' }}>
                      Tempo médio de resposta humana: até 24 horas úteis.
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                  <Link to="/seguranca" className="sp-btn-quiet">
                    <span>Central de Segurança</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/planos" className="sp-btn-quiet">
                    <span>Ver Planos</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: '6 / span 7' }}>
                <form
                  onSubmit={handleSendMail}
                  data-ui="contact-composer"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '18px' }}
                >
                  <div style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', paddingBottom: '10px', borderBottom: '1px solid #1e2621' }}>
                    Enviar Mensagem Direta
                  </div>

                  <div>
                    <div style={{ color: '#d8e1dc', fontWeight: 500, marginBottom: '8px' }}>Selecione o Assunto</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {TOPICS.map((item) => {
                        const active = item.id === topic;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTopic(item.id)}
                            style={{
                              textAlign: 'left',
                              padding: '10px 12px',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: active ? '#10b981' : '#242e28',
                              backgroundColor: active ? '#10b981' : '#121714',
                              color: active ? '#05120c' : '#f3f6f4',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label htmlFor="cnt-name" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px' }}>
                        Seu Nome
                      </label>
                      <input
                        id="cnt-name"
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Como podemos te chamar?"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '11px 14px',
                          backgroundColor: '#080a09',
                          border: '1px solid #242e28',
                          borderRadius: '4px',
                          color: '#f3f6f4',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="cnt-email" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px' }}>
                        Seu E-mail
                      </label>
                      <input
                        id="cnt-email"
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="seu@email.com"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '11px 14px',
                          backgroundColor: '#080a09',
                          border: '1px solid #242e28',
                          borderRadius: '4px',
                          color: '#f3f6f4',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cnt-msg" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px' }}>
                      Mensagem ou Solicitação
                    </label>
                    <textarea
                      id="cnt-msg"
                      rows={5}
                      required
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Descreva como nossa equipe pode ajudar você..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        backgroundColor: '#080a09',
                        border: '1px solid #242e28',
                        borderRadius: '4px',
                        color: '#f3f6f4',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button type="submit" className="sp-btn-primary">
                      <span>Enviar para contato@simplificpro.com</span>
                      <Send size={15} />
                    </button>

                    <Link to="/login?tab=register" className="sp-btn-quiet">
                      <span>Ou testar 7 dias grátis agora</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;
