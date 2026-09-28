import Header from '../components/home/Header';
import HeroSection from '../components/home/HeroSection';
import PromiseSection from '../components/home/PromiseSection';
import SecuritySection from '../components/home/SecuritySection';
import TeamSection from '../components/home/TeamSection';
import DaySection from '../components/home/DaySection';
import ShowcaseSection from '../components/home/ShowcaseSection';
import OpenFinanceSection from '../components/home/OpenFinanceSection';
import GraphsSection from '../components/home/GraphsSection';
import AgendaSection from '../components/home/AgendaSection';
import EnterpriseSection from '../components/home/EnterpriseSection';
import BenefitsSection from '../components/home/BenefitsSection';
import ExpedientSection from '../components/home/ExpedientSection';
import IntegrationsSection from '../components/home/IntegrationsSection';
import ClientsSection from '../components/home/ClientsSection';
import PricingSection from '../components/home/PricingSection';
import AmbassadorsSection from '../components/home/AmbassadorsSection';
import FAQSection from '../components/home/FAQSection';
import Footer from '../components/home/Footer';
import ModalCartao from '../components/home/ModalCartao';
import ModalOrg from '../components/home/ModalOrg';
import ModalConversa from '../components/home/ModalConversa';
import ModalPainel from '../components/home/ModalPainel';
import ModalConta from '../components/home/ModalConta';
import ModalCobranca from '../components/home/ModalCobranca';
import ModalDocumentos from '../components/home/ModalDocumentos';
import ModalDrive from '../components/home/ModalDrive';
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/LOGO.png';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/meuassessor/meuassessor_script.js?v=" + Date.now();
    script.async = true;
    let appended = false;
    const timeoutId = setTimeout(() => {
      document.body.appendChild(script);
      appended = true;
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (appended) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="clone-wrapper bg-black relative overflow-hidden">
      {/* Efeitos de Fundo (Glow) idênticos aos da página Inteligência */}
      <div className="fixed top-0 right-0 w-1/2 h-[100vh] bg-green-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-1/3 h-[50vh] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <link rel="stylesheet" href={"/meuassessor/meuassessor.css?v=" + Date.now()} />
      
    
    <img src="/meuassessor/images/celular-2.webp" id="global-celular-bg" className="relative z-10" alt="Celular Background" />
    
    <Header />

    <HeroSection />

    <PromiseSection />

    {/* Faixa de confiança, no vão entre os dois cartões pretos. Sem
         data-header de propósito: as duas vizinhas são transparentes sobre o
         corpo preto, então o cabeçalho continua no estado escuro aqui.
         A fita é a MESMA mecânica do carrossel de bancos da .of-section: três
         filas idênticas e um translate de -100%/3. Só a PRIMEIRA fila fica
         legível para o leitor de tela; as duas cópias levam aria-hidden — e as
         três TÊM DE SER IDÊNTICAS, caractere a caractere, senão a emenda pula.
         Cada selo é um LOCKUP: a marca à esquerda, a alegação e a linha de
         apoio à direita, no formato das barras "regulated by" de fintech.
         SÃO CINCO SELOS: mexer nesta lista muda a largura da fila, e a largura
         da fila é a conta da duração da animação lá na folha de estilo. */}
    <SecuritySection />

    <TeamSection />

    {/* UM DIA NORMAL, v2 (12/09/2026). A seção deixou de ser cinco telas de
         rolagem (palco sticky + cinco atos de 100vh) e virou UM palco que avança
         sozinho, no mesmo regime da cena da cobrança: à esquerda a lista dos
         cinco momentos (o ativo acende e a linha embaixo dele preenche no tempo
         do momento; clicar salta), à direita a foto do momento com a
         notificação/conversa entrando. As fotos e as peças (.dia-foto,
         .dia-noti, .dia-zap, .zap4-*) são as aprovadas em 08/09 — só o regime
         mudou; o CSS delas foi re-escopado no fim do style.css (bloco "Dia v2 —
         peças"). No celular a lista vira a linha do tempo de cinco horários e a
         legenda do momento ativo. O quadro é aria-hidden: o que ele mostra, a
         lista já diz. Motor: dia2.js. */}
    <DaySection />

    <ShowcaseSection />

    <OpenFinanceSection />

    <GraphsSection />

    <AgendaSection />

    <EnterpriseSection />

    {/* BENEFÍCIOS, v2 (12/09/2026). O palco sticky de três atos (três telas de
         100vh) virou três cards com mini-cenas em loop, no regime do resto do
         site. Vem logo depois da cena da cobrança e mostra o que acontece
         DEPOIS da mensagem: o link pago, a nota emitida com o PDF no WhatsApp e
         a venda no cartão caindo em D+2. Os títulos são os já aprovados. As
         cenas são aria-hidden (título e parágrafo dizem o mesmo). No celular os
         cards deslizam (scroll-snap) com pontos. Motor: ben2.js. */}
    <BenefitsSection />

    <ExpedientSection />

    <IntegrationsSection />

    <ClientsSection />

    <PricingSection />

    <AmbassadorsSection />

    <FAQSection />

    <Footer />

    <ModalCartao />

    <ModalOrg />

    <ModalConversa />

    <ModalPainel />

    <ModalConta />

    <ModalCobranca />

    <ModalDocumentos />

    <ModalDrive />

    <script src="menu.js"></script>
    <script src="script.js"></script>
    
    <script src="agenda.js"></script>
    
    <script src="cobranca.js?v=7" defer></script>
    <script src="embaixadores.js?v=5" defer></script>
    <script src="dia2.js?v=1" defer></script>
    <script src="ben2.js?v=1" defer></script>
    <script src="rastro.js?v=6" defer></script>

    </div>
  );
};

export default HomePage;
