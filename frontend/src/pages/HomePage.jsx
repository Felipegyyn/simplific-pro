import React from 'react';
import Header from '../components/home/Header';
import HeroSection from '../components/home/HeroSection';
import PromiseSection from '../components/home/PromiseSection';
import SecuritySection from '../components/home/SecuritySection';
import TeamSection from '../components/home/TeamSection';
import DaySection from '../components/home/DaySection';
import ShowcaseSection from '../components/home/ShowcaseSection';
import GraphsSection from '../components/home/GraphsSection';
import BenefitsSection from '../components/home/BenefitsSection';
import PricingSection from '../components/home/PricingSection';
import FAQSection from '../components/home/FAQSection';
import Footer from '../components/home/Footer';

const HomePage = () => {
  return (
    <div className="clone-wrapper bg-black relative overflow-hidden min-h-screen text-white">
      {/* Efeitos de Fundo (Glow Esmeralda) idênticos ao padrão das rotas não protegidas */}
      <div className="fixed top-0 right-0 w-1/2 h-[100vh] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-1/3 h-[50vh] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Folha de estilos do tema */}
      <link rel="stylesheet" href="/meuassessor/meuassessor.css" />

      {/* Conteúdo da Landing Page */}
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <PromiseSection />
        <SecuritySection />
        <TeamSection />
        <DaySection />
        <ShowcaseSection />
        <GraphsSection />
        <BenefitsSection />
        <PricingSection />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
