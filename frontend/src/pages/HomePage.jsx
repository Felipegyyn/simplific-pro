import Header from '../components/home/Header';\nimport HeroSection from '../components/home/HeroSection';\nimport PromiseSection from '../components/home/PromiseSection';\nimport SecuritySection from '../components/home/SecuritySection';\nimport TeamSection from '../components/home/TeamSection';\nimport DaySection from '../components/home/DaySection';\nimport ShowcaseSection from '../components/home/ShowcaseSection';\nimport OpenFinanceSection from '../components/home/OpenFinanceSection';\nimport GraphsSection from '../components/home/GraphsSection';\nimport AgendaSection from '../components/home/AgendaSection';\nimport EnterpriseSection from '../components/home/EnterpriseSection';\nimport BenefitsSection from '../components/home/BenefitsSection';\nimport ExpedientSection from '../components/home/ExpedientSection';\nimport IntegrationsSection from '../components/home/IntegrationsSection';\nimport ClientsSection from '../components/home/ClientsSection';\nimport PricingSection from '../components/home/PricingSection';\nimport AmbassadorsSection from '../components/home/AmbassadorsSection';\nimport FAQSection from '../components/home/FAQSection';\nimport Footer from '../components/home/Footer';\nimport ModalCartao from '../components/home/ModalCartao';\nimport ModalOrg from '../components/home/ModalOrg';\nimport ModalConversa from '../components/home/ModalConversa';\nimport ModalPainel from '../components/home/ModalPainel';\nimport ModalConta from '../components/home/ModalConta';\nimport ModalCobranca from '../components/home/ModalCobranca';\nimport ModalDocumentos from '../components/home/ModalDocumentos';\nimport ModalDrive from '../components/home/ModalDrive';\nimport React, { useEffect } from 'react';
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
    <div className="clone-wrapper">
      <link rel="stylesheet" href={"/meuassessor/meuassessor.css?v=" + Date.now()} />
      
    
    <img src="/meuassessor/images/celular-2.webp" id="global-celular-bg" alt="Celular Background" />
    
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
