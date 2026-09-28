import React from 'react';

const HeroSection = () => {
  return (
    <><section className="hero-container">
        
        {/* O FILME É SÓ DO DESKTOP (30/08/2026). No celular o hero ficou
             preto puro: as duas mãos se encontrando obrigavam o aparelho a
             caber no vão entre as pontas de dedo, e era esse vão que
             mantinha o celular — e a conversa dentro dele — pequeno demais
             para ler. O media aqui não é enfeite de estilo: sem fonte que
             case, o navegador não baixa vídeo nenhum, e o celular economiza
             os 500 KB do hero-mobile.mp4 que ninguém mais vê. Esconder por
             CSS sozinho não faria isso. O arquivo do filme vertical continua
             em images/ caso o desenho volte atrás. */}
        <video className="hero-video-bg" id="heroVideo" autoPlay muted playsInline preload="auto">
            <source src="/meuassessor/images/video-hedo-editado.mp4" media="(min-width: 616px)" type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
        </video>
        
        <div className="hero-content">
            <p className="hero-chip">Sua Vida Financeira Organizada</p>
            <h1 className="hero-title">Mais que um App, um Assessor Inteligente no WhatsApp.</h1>
            <p className="hero-sub"><span className="hl-so-desktop">A Inteligência Artificial do Simplific cuida das suas despesas, limites, investimentos e agenda. Você manda um áudio ou texto, e ela organiza.</span><span className="hl-so-mobile">Uma IA no WhatsApp cuida do seu dinheiro e agenda. Você só manda mensagem.</span></p>
            <a href="#planos" className="hero-btn cta-forte"><span>Falar com o Simplific</span></a>
        </div>

        <div className="chat-simulation-container" id="chatSimulation">
            <div className="chat-messages" id="chatMessages"></div>
        </div>
    </section></>
  );
};

export default HeroSection;
