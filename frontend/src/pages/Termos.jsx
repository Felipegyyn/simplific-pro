import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const CLAUSES = [
  {
    title: '1. Aceitação dos Termos',
    body: 'Ao criar uma conta ou utilizar o Simplific Pro ("Plataforma"), você concorda expressamente com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.'
  },
  {
    title: '2. Descrição do Serviço',
    body: 'O Simplific Pro é uma ferramenta de gestão financeira pessoal e empresarial que oferece funcionalidades de controle de fluxo de caixa, dashboards, integração com WhatsApp via Inteligência Artificial e sincronização de agendas. O Simplific Pro não é uma instituição financeira, não realiza empréstimos e não oferece consultoria de investimentos.'
  },
  {
    title: '3. Assinaturas e Pagamentos',
    body: 'Planos: O serviço é oferecido mediante assinatura (mensal ou anual). Processamento: Os pagamentos são processados de forma segura por gateway homologado (Asaas / Mercado Pago). Nós não armazenamos os dados completos do seu cartão de crédito. Renovação Automática: Sua assinatura será renovada automaticamente ao final de cada período, a menos que você a cancele antes da data de renovação.'
  },
  {
    title: '4. Cancelamento e Reembolso',
    body: 'Você pode cancelar sua assinatura a qualquer momento através do painel do usuário. O acesso permanecerá ativo até o fim do ciclo de cobrança vigente. Conforme o Art. 49 do Código de Defesa do Consumidor, oferecemos uma garantia incondicional de 7 dias para reembolso total na primeira assinatura.'
  },
  {
    title: '5. Responsabilidades do Usuário',
    body: 'Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta. Você concorda em fornecer informações verdadeiras e em não utilizar a plataforma para fins ilícitos.'
  },
  {
    title: '6. Integrações de Terceiros (Google e WhatsApp)',
    body: 'Nossa plataforma integra-se com serviços como Google Calendar e WhatsApp. Ao utilizar essas funcionalidades, você nos autoriza a enviar e receber dados necessários para a prestação do serviço (como criar eventos na sua agenda ou responder mensagens), conforme detalhado em nossa Política de Privacidade.'
  },
  {
    title: '7. Integração Bancária e Open Finance',
    body: 'Para oferecer funcionalidades de agregação de contas e categorização automática, o Simplific Pro utiliza APIs de provedores de Open Finance regulamentados pelo Banco Central. Ao conectar sua conta bancária, você autoriza expressamente a leitura dos seus dados transacionais (extrato e saldo) de forma automática. Suas credenciais bancárias (senhas) não são armazenadas pelo Simplific Pro, e o consentimento de acesso pode ser revogado por você a qualquer momento.'
  },
  {
    title: '8. Limitação de Responsabilidade',
    body: 'O Simplific Pro fornece ferramentas para auxiliar na organização financeira, mas as decisões econômicas são de inteira responsabilidade do usuário. Não nos responsabilizamos por prejuízos financeiros decorrentes de decisões tomadas com base nas informações da plataforma.'
  },
  {
    title: '9. Alterações nos Termos',
    body: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações significativas através do e-mail cadastrado ou aviso na plataforma.'
  },
  {
    title: '10. Foro',
    body: 'Fica eleito o foro da comarca de Goiânia/GO para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia a qualquer outro.'
  }
];

const Termos = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="termos-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 4' }}>
                <h1 id="termos-heading" className="sp-h1">
                  <span className="sp-line"><span>Termos</span></span>
                  <span className="sp-line"><span>de Uso.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Regras claras sobre o funcionamento da plataforma, garantia de 7 dias, integrações oficiais e direitos do assinante.
                </p>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link to="/privacidade" className="sp-btn-quiet">
                    <span>Ler Política de Privacidade</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/seguranca" className="sp-btn-quiet">
                    <span>Conhecer Arquitetura de Segurança</span>
                    <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/planos" className="sp-btn-primary" style={{ marginTop: '8px', width: 'fit-content' }}>
                    <span>Ver Planos de Assinatura</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: '5 / span 8' }}>
                <div
                  data-ui="legal-terms-ledger"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #1e2621' }}>
                    <span style={{ fontWeight: 600, color: '#f3f6f4' }}>Contrato de Prestação de Serviços SaaS</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Última atualização: 28 de Novembro de 2025</span>
                  </div>

                  {CLAUSES.map((clause) => (
                    <div key={clause.title} style={{ paddingBottom: '16px', borderBottom: '1px solid #161d19' }}>
                      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', margin: '0 0 8px 0' }}>
                        {clause.title}
                      </h2>
                      <p style={{ margin: 0, color: '#d8e1dc', lineHeight: 1.6 }}>
                        {clause.body}
                      </p>
                    </div>
                  ))}
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

export default Termos;
