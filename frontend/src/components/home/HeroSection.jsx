import React from 'react';\n\nconst HeroSection = () => {\n  return (\n    <><section className="hero-container">
        
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
            <p className="hero-chip">+ 250 mil usuários aprovam</p>
            <h1 className="hero-title">Sua vida organizada começa numa conversa.</h1>
            <p className="hero-sub"><span className="hl-so-desktop">Uma equipe de assessores no seu WhatsApp cuida do seu dinheiro, da sua agenda e das suas notas. Você só manda mensagem.</span><span className="hl-so-mobile">Assessores no seu WhatsApp cuidam do dinheiro, da agenda e das notas. Você só manda mensagem.</span></p>
            <a href="#planos" className="hero-btn cta-forte"><span>Contratar minha equipe</span></a>
        </div>

        <div className="chat-simulation-container" id="chatSimulation">
            <div className="chat-messages" id="chatMessages"></div>
        </div>
    </section></>\n  );\n};\n\nexport default HeroSection;\n