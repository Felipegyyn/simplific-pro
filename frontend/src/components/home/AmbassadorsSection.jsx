import React from 'react';\n\nconst AmbassadorsSection = () => {\n  return (\n    <><section className="emb-section" id="embaixadores" data-header="claro">
        <svg className="vit-defs" aria-hidden="true" focusable="false">
            <linearGradient id="vitSeloGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#bc85f8"/>
                <stop offset="100%" stop-color="#e27bb7"/>
            </linearGradient>
            <symbol id="vit-ic-selo" viewBox="0 0 24 24">
                <path d="M12.00 2.10 L14.14 4.03 L16.95 3.43 L17.83 6.17 L20.57 7.05 L19.97 9.86 L21.90 12.00 L19.97 14.14 L20.57 16.95 L17.83 17.83 L16.95 20.57 L14.14 19.97 L12.00 21.90 L9.86 19.97 L7.05 20.57 L6.17 17.83 L3.43 16.95 L4.03 14.14 L2.10 12.00 L4.03 9.86 L3.43 7.05 L6.17 6.17 L7.05 3.43 L9.86 4.03 Z" fill="url(#vitSeloGrad)" stroke="none"/>
                <path d="m8.4 12.1 2.6 2.6 4.7-5.1" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </symbol>
        </svg>
        <div className="emb-grade">
            <header className="emb-topo">
                <h2 className="emb-headline">Gente que você conhece já tem uma equipe.</h2>
                <p className="emb-sub">Nossos embaixadores, com as palavras deles.</p>
            </header>

            {/* Uma fala por vez, no BALÃO DA ESTEIRA (o verde de "o que dá para pedir",
                 com hora e visto), e os cinco rostos como abas com o ANEL DE STORY da
                 página de assessores (degradê no ativo, cinza nos "vistos"). O
                 embaixadores.js troca a fala, avança a cada 6s e para no hover, fora
                 da tela e com "reduzir movimento". SEM SCRIPT a classe is-js não
                 existe: o CSS empilha as cinco falas, visíveis, e esconde o trilho. */}
            <div className="emb-palco" id="embPalco">
                <div className="emb-falas" aria-live="polite">
                    <figure className="emb-fala is-ativa">
                        <blockquote className="emb-bolha"><span className="emb-txt">Cara, eu não sou de ficar indicando coisa, mas isso aqui me ajudou demais. Mando um áudio e ele resolve. Simples assim.</span><span className="emb-meta">09:12<svg className="emb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></blockquote>
                        <figcaption className="emb-quem"><span className="emb-nome">Lucas Lucco<svg className="emb-selo" aria-hidden="true"><use href="#vit-ic-selo"></use></svg></span><span className="emb-papel">Embaixador</span></figcaption>
                    </figure>
                    <figure className="emb-fala">
                        <blockquote className="emb-bolha"><span className="emb-txt">Eu tenho mil coisas pra resolver todo dia. Agora mando tudo pro assessor e ele organiza. Mudou meu jogo.</span><span className="emb-meta">09:14<svg className="emb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></blockquote>
                        <figcaption className="emb-quem"><span className="emb-nome">Felipe Titto<svg className="emb-selo" aria-hidden="true"><use href="#vit-ic-selo"></use></svg></span><span className="emb-papel">Fundador do Simplific Pro</span></figcaption>
                    </figure>
                    <figure className="emb-fala">
                        <blockquote className="emb-bolha"><span className="emb-txt">Gente, essa parada é muito boa. Eu mando um áudio e ele já organiza tudo pra mim, não preciso fazer mais nada. Tô viciada.</span><span className="emb-meta">09:17<svg className="emb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></blockquote>
                        <figcaption className="emb-quem"><span className="emb-nome">Carol Bresolin<svg className="emb-selo" aria-hidden="true"><use href="#vit-ic-selo"></use></svg></span><span className="emb-papel">Embaixadora</span></figcaption>
                    </figure>
                    <figure className="emb-fala">
                        <blockquote className="emb-bolha"><span className="emb-txt">Eu vivia esquecendo reunião, compromisso... agora o assessor me lembra de tudo no WhatsApp. Não largo mais.</span><span className="emb-meta">09:21<svg className="emb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></blockquote>
                        <figcaption className="emb-quem"><span className="emb-nome">Jon Vlogs<svg className="emb-selo" aria-hidden="true"><use href="#vit-ic-selo"></use></svg></span><span className="emb-papel">Embaixador</span></figcaption>
                    </figure>
                    <figure className="emb-fala">
                        <blockquote className="emb-bolha"><span className="emb-txt">Ai gente, vocês precisam testar. Eu falo e ele faz! Organiza documento, lembra de tudo... é tipo ter uma assistente de verdade.</span><span className="emb-meta">09:25<svg className="emb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></blockquote>
                        <figcaption className="emb-quem"><span className="emb-nome">Gkay<svg className="emb-selo" aria-hidden="true"><use href="#vit-ic-selo"></use></svg></span><span className="emb-papel">Embaixadora</span></figcaption>
                    </figure>
                </div>
                <div className="emb-trilho" role="tablist" aria-label="Embaixadores">
                    <button className="emb-pessoa is-ativa" type="button" role="tab" aria-selected="true" aria-label="Lucas Lucco">
                        <span className="emb-anel" aria-hidden="true"></span>
                        <img className="emb-foto" src="/meuassessor/images/embaixador-lucas-lucco.webp" alt="" width="60" height="60" loading="lazy" decoding="async" />
                    </button>
                    <button className="emb-pessoa" type="button" role="tab" aria-selected="false" aria-label="Felipe Titto">
                        <span className="emb-anel" aria-hidden="true"></span>
                        <img className="emb-foto" src="/meuassessor/images/embaixador-felipe-titto.webp" alt="" width="60" height="60" loading="lazy" decoding="async" />
                    </button>
                    <button className="emb-pessoa" type="button" role="tab" aria-selected="false" aria-label="Carol Bresolin">
                        <span className="emb-anel" aria-hidden="true"></span>
                        <img className="emb-foto" src="/meuassessor/images/embaixador-carol-bresolin.webp" alt="" width="60" height="60" loading="lazy" decoding="async" />
                    </button>
                    <button className="emb-pessoa" type="button" role="tab" aria-selected="false" aria-label="Jon Vlogs">
                        <span className="emb-anel" aria-hidden="true"></span>
                        <img className="emb-foto" src="/meuassessor/images/embaixador-jon-vlogs.webp" alt="" width="60" height="60" loading="lazy" decoding="async" />
                    </button>
                    <button className="emb-pessoa" type="button" role="tab" aria-selected="false" aria-label="Gkay">
                        <span className="emb-anel" aria-hidden="true"></span>
                        <img className="emb-foto" src="/meuassessor/images/embaixador-gkay.webp" alt="" width="60" height="60" loading="lazy" decoding="async" />
                    </button>
                </div>
            </div>
        </div>
    </section></>\n  );\n};\n\nexport default AmbassadorsSection;\n