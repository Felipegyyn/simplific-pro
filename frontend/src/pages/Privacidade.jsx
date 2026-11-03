import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const Privacidade = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="privacidade-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 4' }}>
                <h1 id="privacidade-heading" className="sp-h1">
                  <span className="sp-line"><span>Política de</span></span>
                  <span className="sp-line"><span>Privacidade.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Compromisso integral com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), Política de Dados do Google e segurança Open Finance.
                </p>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/termos" className="sp-btn-quiet">
                    <span>Ler Termos de Uso</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/seguranca" className="sp-btn-quiet">
                    <span>Arquitetura de Segurança</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/contato" className="sp-btn-primary" style={{ marginTop: '8px', width: 'fit-content' }}>
                    <span>Contatar Encarregado (DPO)</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: '5 / span 8' }}>
                <div
                  data-ui="legal-privacy-ledger"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #1e2621' }}>
                    <span style={{ fontWeight: 600, color: '#f3f6f4' }}>Compromisso com a LGPD (Lei nº 13.709/2018)</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Proteção de Dados & Uso Limitado</span>
                  </div>

                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      1. Coleta de Dados
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#d8e1dc', lineHeight: 1.6 }}>
                      Coletamos as seguintes informações estritamente necessárias para o funcionamento do serviço:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#d8e1dc', lineHeight: 1.6 }}>
                      <li><strong>Dados de Cadastro:</strong> Nome, e-mail e número de telefone (WhatsApp).</li>
                      <li><strong>Dados Financeiros:</strong> Informações sobre receitas, despesas, cartões e investimentos inseridos por você manualmente ou via mensagens.</li>
                      <li><strong>Dados de Integração:</strong> Tokens de acesso para sincronização com Google Calendar (quando autorizado).</li>
                    </ul>
                  </div>

                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      2. Uso das Informações
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#d8e1dc', lineHeight: 1.6 }}>
                      Seus dados são utilizados exclusivamente para:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#d8e1dc', lineHeight: 1.6 }}>
                      <li>Fornecer os serviços contratados (gestão financeira e relatórios).</li>
                      <li>Processar pagamentos e assinaturas.</li>
                      <li>Enviar notificações importantes (vencimentos, alertas de orçamento).</li>
                      <li>Melhorar a experiência do usuário e suporte técnico.</li>
                    </ul>
                  </div>

                  {/* SEÇÃO OBRIGATÓRIA PARA O GOOGLE - NÃO REMOVA */}
                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#111815',
                      border: '1px solid #10b981',
                      borderRadius: '6px'
                    }}
                  >
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#10b981', margin: '0 0 8px 0' }}>
                      3. Uso de Dados do Google (Google User Data)
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#f3f6f4', lineHeight: 1.6 }}>
                      O uso e a transferência de informações recebidas das APIs do Google pelo Simplific Pro para qualquer outro aplicativo aderirão à{' '}
                      <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#10b981', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        Política de Dados do Usuário dos Serviços de API do Google
                      </a>
                      , incluindo os requisitos de Uso Limitado (Specifically):
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#d8e1dc', lineHeight: 1.6 }}>
                      <li>Utilizamos o acesso ao <strong>Google Calendar</strong> apenas para <strong>escrever</strong> lembretes financeiros e <strong>ler</strong> eventos para evitar conflitos.</li>
                      <li><strong>Não compartilhamos</strong> seus dados do Google com ferramentas de IA de terceiros para treinamento.</li>
                      <li><strong>Não vendemos</strong> seus dados do Google para anunciantes ou terceiros.</li>
                    </ul>
                  </div>

                  {/* SEÇÃO OBRIGATÓRIA PARA OPEN FINANCE */}
                  <div
                    style={{
                      padding: '18px',
                      backgroundColor: '#111613',
                      border: '1px solid #242e28',
                      borderRadius: '6px'
                    }}
                  >
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      4. Open Finance e Proteção de Dados Bancários
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#d8e1dc', lineHeight: 1.6 }}>
                      Para oferecer a funcionalidade de conexão bancária automática, utilizamos a infraestrutura de <strong>provedores oficiais de Open Finance</strong>. Garantimos que:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#d8e1dc', lineHeight: 1.6 }}>
                      <li><strong>Não armazenamos</strong> em nossos servidores as suas senhas de acesso ao banco (credenciais).</li>
                      <li>O tráfego de dados transacionais é criptografado de ponta a ponta.</li>
                      <li>Os dados bancários coletados (saldos e extratos) são utilizados estritamente para apresentar relatórios e gráficos dentro da nossa plataforma (Gestão Financeira Pessoal).</li>
                      <li>Você pode <strong>revogar o consentimento</strong> de acesso a qualquer momento, interrompendo a sincronização.</li>
                    </ul>
                  </div>

                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      5. Armazenamento e Segurança
                    </h2>
                    <p style={{ margin: 0, color: '#d8e1dc', lineHeight: 1.6 }}>
                      Utilizamos criptografia de ponta a ponta e armazenamos seus dados em servidores seguros (nuvem) com protocolos rígidos de segurança. As senhas da sua conta no Simplific Pro são armazenadas com hash criptográfico e não são acessíveis por nossa equipe.
                    </p>
                  </div>

                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      6. Compartilhamento de Dados
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#d8e1dc', lineHeight: 1.6 }}>
                      Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#d8e1dc', lineHeight: 1.6 }}>
                      <li><strong>Provedores de Open Finance:</strong> Apenas os tokens de acesso necessários para a sincronização segura dos seus extratos bancários, sem acesso às suas senhas.</li>
                      <li><strong>Gateways de Pagamento (Asaas / Mercado Pago):</strong> Apenas os dados necessários para processar o pagamento da assinatura.</li>
                      <li><strong>Twilio / Provedores de IA:</strong> Para processamento das mensagens do Assessor Inteligente (os dados são anonimizados quando possível).</li>
                    </ul>
                  </div>

                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      7. Seus Direitos (LGPD)
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#d8e1dc', lineHeight: 1.6 }}>
                      Você tem o direito de solicitar, a qualquer momento: a confirmação da existência de tratamento de dados, o acesso aos seus dados, a correção de dados incompletos ou desatualizados e a exclusão definitiva dos seus dados de nossos servidores.
                    </p>
                  </div>

                  <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                      8. Contato do Encarregado (DPO)
                    </h2>
                    <p style={{ margin: 0, color: '#d8e1dc', lineHeight: 1.6 }}>
                      Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail:{' '}
                      <a href="mailto:contato@simplificpro.com" style={{ color: '#10b981', fontWeight: 600 }}>
                        contato@simplificpro.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacidade;
