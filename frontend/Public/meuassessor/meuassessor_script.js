

/* --- menu.js --- */

/* ============================================================
   O MENU DO CELULAR (o interruptor das três linhas)
   ============================================================
   Criado em 22/08/2026, e é o primeiro arquivo de JavaScript que as
   OITO páginas carregam. Isso é de propósito: o desenho da bandeja
   mora num bloco só do style.css, e o comportamento dela mora num
   arquivo só aqui. Página nova só precisa carregar os dois e repetir
   o botão e a bandeja dentro do header, sem uma linha nova de código.

   EM 26/08/2026 A BANDEJA VIROU TOMADA DE TELA, por ordem do dono e com
   o mesmo print do Jota na mão: o painel ocupa o aparelho inteiro, a
   pílula vira barra chapada no topo e a lista corre debaixo dela. O
   arquivo mudou em três coisas por causa disso, e as três estão
   comentadas no corpo: o painel troca de endereço no carregamento, o
   estado dele é uma classe própria, e o toque fora passou a contar o
   painel.

   O ESTADO É UMA CLASSE NO HEADER, .menu-aberto, e não uma no body ou
   um atributo hidden na bandeja. Os três motivos, na ordem em que
   apareceram:

     · o CSS precisa vestir três peças ao mesmo tempo (as linhas viram
       X, a bandeja aparece, o botão fica marcado), e uma classe no pai
       comum alcança as três sem o JavaScript tocar em estilo nenhum.

     · o atributo hidden apaga a bandeja na hora, e transição em coisa
       apagada não acontece. Quem esconde é visibility no CSS, que sabe
       esperar o fade terminar.

     · a rolagem NÃO é travada. O painel é fixo e cobre a tela inteira,
       então não há o que ver rolando atrás dele; travar o body na home
       custaria caro, porque lá a página inteira é uma máquina de
       animação por rolagem, e o preço de destravar (o pulo do scroll no
       iOS) é pior que o problema. Quem impede o painel de empurrar a
       página quando termina de rolar é o overscroll-behavior: contain,
       no style.css.

   O QUE FECHA A BANDEJA: o próprio botão, um toque fora do cabeçalho,
   a tecla Esc, um item do menu e a janela crescendo além do degrau de
   1080px. O último importa mais do que parece: sem ele quem gira o
   aparelho ou arrasta a janela para o tamanho de mesa fica com o menu
   aberto num lugar onde a bandeja não existe mais, e o X continuaria
   desenhado no lugar das três linhas quando ela voltasse a existir.
   ============================================================ */
setTimeout( () => {
    const header = document.querySelector('.glass-header');
    if (!header) return;

    const botao = header.querySelector('.header-menu');
    const bandeja = header.querySelector('.menu-movel');
    if (!botao || !bandeja) return;

    /* O PAINEL SAI DE DENTRO DO CABEÇALHO, e é isto que torna a tomada
       de tela possível. O .glass-header termina a animação de entrada
       com um transform, e elemento com transform vira bloco de contenção
       para filho com position fixed: por mais 100% que se peça, o painel
       ficaria preso dentro dos 60px da pílula.

       Ele vai para LOGO DEPOIS do cabeçalho, e não para o fim do body,
       porque a ordem do Tab importa: quem sai do X com o teclado tem que
       cair no primeiro item do menu, e não no fim da página.

       O HTML das treze páginas não muda por causa disso. O painel
       continua escrito dentro do <header>, que é onde ele se lê, e a
       mudança de endereço acontece aqui, uma vez, no carregamento. */
    if (bandeja.parentElement === header) header.after(bandeja);

    /* O mesmo 1080 do style.css, escrito de novo porque JavaScript não
       lê media query de folha alheia. Se um dia o degrau mudar, mudam
       os dois juntos: aqui e no bloco "O MENU DO CELULAR". */
    const degrau = window.matchMedia('(max-width: 1080px)');

    let aberta = false;

    function aplicar(novo) {
        if (novo === aberta) return;
        aberta = novo;
        header.classList.toggle('menu-aberto', aberta);
        /* O painel tem classe PRÓPRIA porque deixou de ser filho do
           cabeçalho: o CSS dele não alcança mais o .menu-aberto do pai. */
        bandeja.classList.toggle('is-aberto', aberta);
        botao.setAttribute('aria-expanded', aberta ? 'true' : 'false');
        /* O rótulo diz o que o botão FAZ, e não o que ele mostra: com a
           bandeja aberta o próximo toque fecha. */
        botao.setAttribute('aria-label', aberta ? 'Fechar menu' : 'Abrir menu');
    }

    function fechar(devolverFoco) {
        if (!aberta) return;
        aplicar(false);
        /* Quem fechou pelo teclado precisa achar o foco onde o deixou.
           Quem fechou pelo dedo não quer o anel de foco aparecendo do
           nada, então o retorno é pedido e não automático. */
        if (devolverFoco) botao.focus();
    }

    botao.addEventListener('click', (e) => {
        e.stopPropagation();
        aplicar(!aberta);
    });

    /* Toque fora. Ele mede contra o cabeçalho E contra o painel: desde
       que o painel virou tomada de tela, um toque no vazio dele é um
       toque DENTRO do menu, e fechar ali seria fechar sem querer. Sobrou
       pouca coisa de fora, mas a regra continua de pé para o que houver.
       O cabeçalho entra na conta pelo motivo de sempre: tocar no
       logotipo ou na ação com o menu aberto não pode fechar o menu e
       navegar na mesma batida. */
    document.addEventListener('click', (e) => {
        if (!aberta) return;
        if (!header.contains(e.target) && !bandeja.contains(e.target)) fechar(false);
    });

    bandeja.addEventListener('click', (e) => {
        if (e.target.closest('a')) fechar(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fechar(true);
    });

    /* O degrau. addEventListener('change') é o jeito atual e
       addListener é o que o Safari antigo entende, então os dois
       entram e o navegador usa o que tiver. */
    function conferirDegrau(ev) {
        if (!ev.matches) fechar(false);
    }

    if (degrau.addEventListener) degrau.addEventListener('change', conferirDegrau);
    else if (degrau.addListener) degrau.addListener(conferirDegrau);
});


/* --- script.js --- */

setTimeout( () => {
    const video = document.getElementById('heroVideo');
    
    if (video) {
        // Tenta forçar o play imediato caso o navegador atrase o autoplay
        video.play().catch(e => console.warn("Video play prevented", e)).catch(() => {});

        /* O FILME ENTRA QUANDO A JANELA PASSA O DEGRAU (30/08/2026).

           A partir daqui o <source> do hero tem media de 616px para cima:
           abaixo disso nenhuma fonte casa, o navegador não baixa nada e o
           celular fica com o hero preto que o desenho pede. O preço é que
           a escolha da fonte acontece UMA VEZ, na carga — quem abriu a
           página estreita e depois alargou a janela ficaria com o hero
           preto no desktop, sem filme nenhum.

           Este load() é essa segunda chance, e ele só existe para a
           janela de quem redimensiona no computador; no celular de
           verdade a régua nunca muda e este trecho nunca roda. O
           currentSrc vazio é a prova de que a carga não achou fonte: se
           já houver filme carregado, mexer aqui reiniciaria o vídeo.
           E o play espera o canplay: chamado colado no load() ele é
           abortado pela própria carga que acabou de começar, e o filme
           fica parado no primeiro quadro. */
        const reguaDoFilme = window.matchMedia('(min-width: 616px)');
        reguaDoFilme.addEventListener('change', () => {
            if (reguaDoFilme.matches && !video.currentSrc) {
                video.addEventListener('canplay', () => {
                    video.play().catch(e => console.warn("Video play prevented", e)).catch(() => {});
                }, { once: true });
                video.load();
            }
        });
        
        let maskShown = false;

        // Mostrar a máscara no segundo 2
        video.addEventListener('timeupdate', () => {
            if (!maskShown && video.currentTime >= 2) {
                const tracker = document.querySelector(".image-tracker");
                if (tracker) tracker.style.opacity = "1";
                maskShown = true;
            }
        });

        // Garantir que o vídeo não repita e pare no último frame
        video.addEventListener('ended', () => {
            video.pause();
            
            // Garantia caso a internet/browser pule frames e o timeupdate não pegue exatamente
            if (!maskShown) {
                const tracker = document.querySelector(".image-tracker");
                if (tracker) tracker.style.opacity = "1";
                maskShown = true;
            }
        });
    }

    /* A ENTRADA DA IMAGEM CELULAR 2.

       A CLASSE É O GATILHO DA SUBIDA (27/08/2026). No celular o
       aparelho não só acende: ele sobe 40px enquanto revela, em 1,5s. O
       desenho desse gesto mora inteiro na folha
       (#global-celular-bg.is-revelado, no degrau de 615px) — aqui só se
       diz QUANDO. Fora do celular nenhuma regra pega nesta classe e o
       desenho segue bit a bit o que sempre foi.

       O RELÓGIO TAMBÉM VEIO DA FOLHA (27/08/2026, segunda volta). Os
       1200ms cravados aqui viraram --celular-espera: o desktop guarda
       esse mesmo valor na regra base e o celular zera, porque lá o
       dono pediu para o gesto largar "no exato momento que a página
       carrega". Um número só, no arquivo onde mora o resto do gesto.

       E A ESPERA ZERO PRECISA DE UMA GARANTIA QUE OS 1,2s DAVAM DE
       GRAÇA: que a arte já chegou. A altura da imagem é auto e o
       translate do desenho é PORCENTAGEM DELA, então enquanto o PNG
       não decodifica a peça tem altura zero e a pose de partida aponta
       para o lugar errado — o gesto sairia de um ponto que não é o
       dele. Por isso, quando a espera é zero, quem larga é o load da
       imagem (ou o próprio instante, se ela já veio do cache). Com
       espera positiva nada disso entra em cena e o desktop segue no
       caminho de origem, inclusive na ordem das coisas.

       O offsetHeight lido antes da classe é de propósito: ele força o
       navegador a resolver a POSE DE PARTIDA antes de a classe mudar a
       declaração. Sem essa leitura, acender no mesmo quadro em que o
       estilo inicial se assenta faz o motor pular a transição e a peça
       aparece já no lugar, sem subir. */
    const celularBg = document.getElementById('global-celular-bg');
    if (celularBg) {
        const espera = parseFloat(
            getComputedStyle(celularBg).getPropertyValue('--celular-espera')
        ) || 0;

        const revelar = () => {
            void celularBg.offsetHeight;
            celularBg.style.opacity = "1";
            celularBg.classList.add('is-revelado');
        };

        if (espera > 0) {
            setTimeout(revelar, espera);
        } else if (celularBg.complete && celularBg.naturalHeight) {
            revelar();
        } else {
            celularBg.addEventListener('load', revelar, { once: true });
        }
    }
});

/* A CONVERSA ACOMPANHA O TAMANHO DO APARELHO (22/08/2026).

   O vídeo do hero tem 1910x1080 e entra com object-fit: cover, então o
   quadro é ampliado até cobrir a tela, e o celular, que é desenho dentro
   desse quadro, cresce junto. A janela da conversa era pixel cravado
   (361x385 com scale de 0,95) e ficava do mesmo tamanho em todo monitor:
   quanto maior a tela, menor a conversa dentro do aparelho.

   A RÉGUA DE CALIBRAÇÃO É A TELA DO DONO, 1512 de largura, e o desenho
   dela não pode mudar: foi ditado assim depois que uma primeira versão
   desta conta engordou a conversa 6% no notebook dele. Naquela largura o
   quadro sai em s = 1512/1910 = 0,791623, e é ali que valem os dois
   valores aprovados que estavam escritos na folha, o scale de 0,95 e o
   desvio de -5px. Tudo aqui é a regra de três a partir deles: telas
   maiores que 1512 crescem na proporção do quadro, menores encolhem na
   mesma proporção, e a de 1512 fica exatamente onde estava.

   A escala do cover é s = max(largura/1910, altura/1080), medida na
   caixa do próprio hero, que é a caixa do vídeo (largura real da página
   em vez de 100vw, que contaria a barra de rolagem). Com r = s dividido
   pela régua:

     escala = 0,95 x r

     desvio = (-5 + 192,5 x 0,05) x r + 192,5 x (escala - 1)
       o 192,5 é meia janela: o scale parte do centro dela, então o que
       ela cresce para cima precisa ser devolvido para a conversa não
       subir junto. A primeira parcela é o desvio original devolvido à
       escala do quadro. Em r = 1 a conta fecha em -5,00px, e a janela
       fica onde o desenho aprovado a deixou.

   A folha guarda 0,95 e -5px como fallback do var(), então uma falha
   aqui devolve o desenho de origem em vez de quebrar a cena.

   NO CELULAR O r SAI DA IMAGEM DO APARELHO (26/08/2026). Abaixo de 615px
   o aparelho deixou de seguir o quadro deitado: ele passou a valer o vão
   entre as duas pontas de dedo do filme EM PÉ, que é outro quadro e
   outra escala. Recalcular essa conta aqui seria repetir os números da
   folha em dois arquivos, e eles se separariam no primeiro ajuste.

   Então a conversa não recalcula nada: ela MEDE a largura que a imagem
   do aparelho tem na tela e tira o r dali. A conta é a mesma de sempre,
   só que lida em vez de deduzida — a folha desenha o aparelho, e a
   conversa acompanha o que a folha desenhou.

   E ISSO NÃO É UMA REGRA NOVA, É A MESMA ESCRITA DE OUTRO JEITO: no
   desktop a folha declara a imagem como max(100%, 176.8519vh), que é
   1910 x s exatos, então largura/1910 devolve o próprio s e as duas
   fórmulas dão o mesmo número. A troca fica presa ao celular assim
   mesmo, por --conversa-segue-aparelho, só para o desktop continuar
   passando pelo caminho de origem, bit a bit: medir o rect traz
   arredondamento de sub-pixel do layout, e em 1440 isso mexia na quinta
   casa do scale. Régua do dono é régua.

   Como a leitura acontece dentro da função, o resize atravessa o degrau
   nos dois sentidos sem precisar recarregar. */
setTimeout( () => {
    const hero = document.querySelector('.hero-container');
    const conversa = document.getElementById('chatSimulation');
    if (!hero || !conversa) return;

    const QUADRO_LARGURA = 1910;
    const QUADRO_ALTURA = 1080;

    /* a régua: a tela do dono, e o desenho aprovado nela */
    const REGUA = 1512 / QUADRO_LARGURA;
    const ESCALA_APROVADA = 0.95;
    const DESVIO_APROVADO = -5;
    const JANELA_APROVADA = 385;

    /* ONDE A BORDA DE CIMA DA JANELA POUSA, em pixel abaixo do meio do
       hero, no desenho aprovado. É constante e vale para qualquer
       altura de janela, e é por isso que ela existe.

       A conta: o scale parte do CENTRO da janela, então a borda de cima
       sobe meia janela vezes o quanto ela encolheu. Somando isso ao
       desvio aprovado dá -5 + 192,5 x 0,05 = 4,625.

       Escrever a regra assim é o que permite ESTICAR A JANELA PARA
       BAIXO sem mexer no topo: o desvio passa a ser calculado DE VOLTA
       a partir deste 4,625, com a meia janela que a folha estiver
       pedindo naquele momento. Com os 385 de origem a conta devolve
       exatamente o que a fórmula antiga devolvia (as duas se reduzem a
       187,5r - 192,5, conferido); com uma janela mais alta, o topo fica
       onde estava e só a base desce. */
    const TOPO_APROVADO = DESVIO_APROVADO
                        + (JANELA_APROVADA / 2) * (1 - ESCALA_APROVADA);

    function encaixarConversa() {
        const quadro = hero.getBoundingClientRect();
        const s = Math.max(quadro.width / QUADRO_LARGURA, quadro.height / QUADRO_ALTURA);

        /* no celular a folha marca o degrau e o r sai da largura real da
           imagem do aparelho; fora dele, a conta de origem */
        const segueAparelho = getComputedStyle(conversa)
            .getPropertyValue('--conversa-segue-aparelho').trim() === '1';
        const aparelho = document.getElementById('global-celular-bg');
        const noAparelho = segueAparelho && aparelho;

        const r = noAparelho
            ? aparelho.getBoundingClientRect().width / QUADRO_LARGURA / REGUA
            : s / REGUA;

        const escala = ESCALA_APROVADA * r;

        /* A DESCIDA DO CONJUNTO vem da folha, no mesmo --hero-descida que
           desce a headline, o aparelho e o cartão. A conversa lê o mesmo
           número para as quatro peças andarem juntas; fora do celular a
           variável não existe e isto vale zero. */
        const descida = parseFloat(
            getComputedStyle(conversa).getPropertyValue('--hero-descida')
        ) || 0;

        /* O TOPO DA JANELA, EM PX ABAIXO DO TOPO DO HERO.

           NO CELULAR ELE SAI DO APARELHO, E NÃO DO MEIO DO HERO
           (30/08/2026). A conta de origem pendura a conversa no meio do
           hero porque no desktop o aparelho É o filme, que cobre o hero
           inteiro e nasce centrado nele. No celular quem desenha o
           aparelho é a #global-celular-bg, pregada por cima, e a conta
           acertava por COINCIDÊNCIA: metade de 700 dá 350, que era
           exatamente o top da imagem. Dois números diferentes com o
           mesmo valor — e no dia em que o filme saiu do celular e o hero
           passou a crescer junto com o aparelho, os dois se separaram e
           a conversa desceu sozinha, para longe da tela do aparelho.

           Agora ela lê o prego da própria imagem. O offsetTop DELA é o
           prego: a folha põe o topo da imagem no top e o translate de
           -31,9% sobe exatas 423 linhas da arte, então o que sobra
           parado na marca do top é a linha 423 — a mesma origem que o
           desenho aprovado usa. Por isso não há 423 nenhum nesta conta:
           ele já foi pago pelo translate.

           E é offsetTop, não rect.top, pelo motivo de sempre nesta casa:
           nos primeiros 1,5s a imagem carrega o translate de entrada,
           que o rect enxerga e o offset não.

           A --hero-descida não entra nesta perna: ela já está dentro do
           top que a folha escreve, e somar de novo desceria a conversa
           duas vezes. */
        const topo = noAparelho
            ? aparelho.offsetTop - hero.offsetTop + TOPO_APROVADO * r
            : quadro.height / 2 + TOPO_APROVADO * r + descida;

        /* A JANELA VAI ATÉ ONDE O HERO CORTA, E NEM UM PIXEL ALÉM.

           Esta é a medida que faltava. O .hero-container tem
           overflow: hidden e altura cravada, então TUDO que a máscara
           desenha abaixo da base dele é invisível — não é o cartão da
           equipe que corta a conversa, é o hero, e ele corta mais em
           cima do que o cartão. Uma máscara mais alta que isso não
           mostra mais conversa: só empurra a última mensagem para
           dentro da faixa cega e a entrega cortada.

           Como a janela é desenhada com scale(), a altura em pixel de
           folha é a altura na tela dividida pela escala. Ela muda com a
           largura de propósito, e continua mudando depois que o hero
           passou a crescer junto com o aparelho (30/08/2026): a fatia na
           TELA cresce com o aparelho, mas a escala cresce junto, então em
           pixel de folha a janela quase não anda — o que muda é o tamanho
           de cada letra dentro dela, que é exatamente o que se queria.
           Número fixo não serviria para largura nenhuma.

           Fora do celular nada disso vale e a janela segue com os 385 de
           origem, que é o desenho aprovado pelo dono. */
        const alturaJanela = noAparelho
            ? (quadro.height - topo) / escala
            : JANELA_APROVADA;

        if (noAparelho) {
            conversa.style.setProperty('--conversa-altura', alturaJanela.toFixed(2) + 'px');
        } else {
            conversa.style.removeProperty('--conversa-altura');
        }

        /* O DESVIO SE MEDE DO MEIO DO HERO, que é onde o top: 50% da
           folha larga a janela. A perna do desktop está escrita à mão, e
           não como topo - metade, para a conta de origem continuar
           passando pelas mesmas operações na mesma ordem: régua do dono
           é régua, e ela vale até a última casa. */
        const desvio = noAparelho
            ? topo - quadro.height / 2 - (alturaJanela / 2) * (1 - escala)
            : TOPO_APROVADO * r + descida - (alturaJanela / 2) * (1 - escala);

        conversa.style.setProperty('--conversa-escala', escala.toFixed(5));
        conversa.style.setProperty('--conversa-desvio', desvio.toFixed(2) + 'px');
    }

    encaixarConversa();
    window.addEventListener('resize', encaixarConversa);
});

/* O BLOCO DO TÍTULO FICA NO MEIO DO VÃO, EM QUALQUER TELA (08/09/2026).

   O vão é o espaço livre entre a base do header e o topo do aparelho, e a
   regra é uma só, por ordem do dono: chip, título e CTA centrados NELE —
   a mesma regra que o celular já seguia desde 30/08, agora valendo também
   no desktop. Até esta rodada o desktop usava outra composição, herdada
   da régua de 1280x742 (o bloco ficava com 0,4381 do vão acima e o resto
   abaixo), com um Math.max de "só sobe, nunca desce" travando a correção
   em zero nas janelas baixas. Os dois saíram juntos: com o alvo sendo a
   POSIÇÃO FINAL, e não um teto, a subida pode ser negativa — a trava
   amarraria a centragem à margem da folha ser sempre maior que o alvo, e
   ela deixaria de valer em silêncio no dia em que alguém mexesse na
   margem (o degrau do celular já dizia isso desde 30/08).

   A medida da posição natural do bloco usa offsetTop de propósito, e não
   o getBoundingClientRect: nos primeiros 1,7s a animação de entrada
   carrega um translateY de 40px, que o rect enxerga e o offsetTop não. A
   subida é zerada antes de medir para o offsetTop não devolver a posição
   já corrigida da vez anterior. */
setTimeout( () => {
    const hero = document.querySelector('.hero-container');
    const bloco = document.querySelector('.hero-content');
    if (!hero || !bloco) return;

    const QUADRO_LARGURA = 1910;
    const QUADRO_ALTURA = 1080;
    const LINHA_DO_APARELHO = 455;
    const BASE_DO_HEADER = 84;

    /* Do degrau do celular: quantas linhas do arquivo da
       #global-celular-bg separam o prego dela (linha 423) do topo visível
       do aparelho (linha 339). */
    const LINHA_DO_APARELHO_NA_ARTE = 84;

    function equilibrarBloco() {
        bloco.style.setProperty('--hero-subida', '0px');

        const quadro = hero.getBoundingClientRect();
        const natural = bloco.offsetTop;

        /* A BASE DO HEADER É MEDIDA, e não os 84 da tabela: no degrau de
           900px a folha baixa o top do header de 24 para 14 e a base vira
           74 — o número fixo desequilibrava a centragem em exatos 5px,
           que é metade da diferença (medido: 87,7 de respiro em cima
           contra 77,6 embaixo). O 84 fica só de rede, para a página sem
           header.

           offsetTop e offsetHeight, e não o rect, pelo mesmo motivo do
           header.js: nos primeiros 1,7s o header carrega o translateY da
           animação de entrada, que o rect enxerga e o offset não. */
        const cabecalho = document.querySelector('.glass-header');
        const baseHeader = cabecalho
            ? cabecalho.offsetTop + cabecalho.offsetHeight
            : BASE_DO_HEADER;

        /* NO CELULAR o degrau vem marcado na folha com --hero-equilibra:
           0, e o que muda é DE ONDE SAI O TOPO DO APARELHO. A conta de
           baixo mede pela linha 455 do quadro DEITADO, e no celular o
           filme é outro, em pé, e nem tem aparelho dentro: quem desenha o
           aparelho lá é a #global-celular-bg. A conta devolvia 294,9
           quando o aparelho de verdade estava em 342,4.

           O topo do aparelho sai do CSS e não do rect, de propósito: o
           rect depende da imagem já ter carregado (a altura é auto, e o
           translate é porcentagem dela), o top e a largura não. */
        if (getComputedStyle(bloco).getPropertyValue('--hero-equilibra').trim() === '0') {
            const img = document.getElementById('global-celular-bg');
            if (!img) return;

            const k = img.getBoundingClientRect().width / QUADRO_LARGURA;
            const topoDoAparelho = parseFloat(getComputedStyle(img).top)
                                 - LINHA_DO_APARELHO_NA_ARTE * k;

            /* meio do vão livre entre a base do header e o aparelho */
            const alvo = baseHeader
                       + (topoDoAparelho - baseHeader - bloco.offsetHeight) / 2;

            bloco.style.setProperty('--hero-subida', (natural - alvo).toFixed(2) + 'px');
            return;
        }

        /* No desktop o aparelho É o filme: cover sobre o hero, aparelho
           nascendo na linha 455 da arte de 1910x1080. */
        const s = Math.max(quadro.width / QUADRO_LARGURA, quadro.height / QUADRO_ALTURA);
        const topoDoAparelho = (quadro.height - QUADRO_ALTURA * s) / 2 + LINHA_DO_APARELHO * s;

        /* meio do vão livre, mesma regra do degrau do celular */
        const alvo = baseHeader
                   + (topoDoAparelho - baseHeader - bloco.offsetHeight) / 2;

        bloco.style.setProperty('--hero-subida', (natural - alvo).toFixed(2) + 'px');
    }

    equilibrarBloco();
    window.addEventListener('resize', equilibrarBloco);

    /* A Poppins chega DEPOIS do DOMContentLoaded, e o título medido na
       fonte de sistema erra a altura do bloco por uma fração de linha —
       medido, o pouso saía 0,6px fora do centro. Uma rodada a mais quando
       a fonte assenta fecha a conta. */
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(equilibrarBloco);
    }
});

// Chat Simulation Animation
setTimeout( () => {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    const verifiedSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#53bdeb"/><path d="M7 12.5L10 15.5L17 8.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const doubleCheckSvg = `<svg viewBox="0 0 16 11" width="16" height="11" fill="none" class="chat-msg-checks"><path d="M1.5 5.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 5.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    const chatData = [
        {
            type: 'user',
            text: 'gastei 62 na farmácia',
            time: '09:10'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: 'Anotado ✅ <b>R$ 62 em Saúde</b>. Esse mês: R$ 214.',
            time: '09:10'
        },
        {
            type: 'user',
            text: 'marca dentista quinta às 15h',
            time: '09:12'
        },
        {
            type: 'bot',
            name: 'Sofi',
            role: 'Secretária executiva',
            avatar: 'images/sofi.jpg',
            nameColor: '#1E88E5',
            text: 'Marcado 📅 Já está no seu <b>Google Agenda</b>. Te lembro 1h antes.',
            time: '09:12'
        },
        {
            type: 'user',
            text: 'me lembra de pagar o IPTU sexta',
            time: '09:14'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Organização & Docs',
            avatar: 'images/luna.jpg',
            nameColor: '#E91E63',
            text: 'Deixa comigo ✅ Sexta, <b>9h</b>, eu te lembro.',
            time: '09:14'
        },
        {
            type: 'user',
            text: 'cobra R$ 450 do Diego pela consultoria',
            time: '09:16'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: 'Link enviado 🔗 <b>Eu aviso o Diego</b> e te falo quando cair.',
            time: '09:16'
        },
        {
            type: 'user',
            text: 'agora emite a nota dessa cobrança',
            time: '09:18'
        },
        {
            type: 'bot',
            name: 'Rita',
            role: 'Assistente fiscal',
            avatar: 'images/rita.jpg',
            nameColor: '#5E35B1',
            text: 'Nota emitida 🧾 <b>PDF aqui na conversa</b> e cópia pro seu contador.',
            time: '09:18'
        },
        {
            type: 'user',
            text: 'pesquisa o menor preço do monitor LG de 27',
            time: '09:20'
        },
        {
            type: 'bot',
            name: 'Ítalo',
            role: 'Estagiário de pesquisas',
            avatar: 'images/italo_otim.jpg',
            nameColor: '#FB8C00',
            text: 'Menor preço: <b>R$ 1.149</b> 🔎 Te mandei os 3 links, com fonte.',
            time: '09:20'
        },
        {
            type: 'user',
            text: 'marca reunião com a Ana e o Lucas terça 10h',
            time: '09:22'
        },
        {
            type: 'bot',
            name: 'Sofi',
            role: 'Secretária executiva',
            avatar: 'images/sofi.jpg',
            nameColor: '#1E88E5',
            text: 'Reunião criada 📅 <b>Link do Meet</b> enviado pros dois. No fim, mando a ata.',
            time: '09:22'
        },
        {
            type: 'user',
            text: 'adiciona minha esposa na conta',
            time: '09:24'
        },
        {
            type: 'bot',
            name: 'Theo',
            role: 'Diretor de operações',
            avatar: 'images/theo.jpg',
            nameColor: '#8E24AA',
            text: 'Feito! A <b>Bia</b> já pode chamar a equipe do WhatsApp dela 👋',
            time: '09:24'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: '⚠️ Sua assinatura de streaming subiu: <b>R$ 34,90 → R$ 44,90</b>.',
            time: '09:26'
        },
        {
            type: 'user',
            text: 'acha o contrato do apartamento',
            time: '09:26'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Organização & Docs',
            avatar: 'images/luna.jpg',
            nameColor: '#E91E63',
            text: '📄 <b>Contrato_Apartamento.pdf</b> — guardado desde março.',
            time: '09:28'
        },
        {
            type: 'user',
            text: 'quanto gastei de mercado esse mês?',
            time: '09:28'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: '<b>R$ 1.240</b> em 11 compras 🛒 15% acima de julho.',
            time: '09:30'
        },
        {
            type: 'user',
            text: 'me manda um gráfico do fluxo de caixa',
            time: '09:30'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: 'Pronto 📊 Entradas R$ 8.430, saídas R$ 6.957 — <b>sobra de R$ 1.473</b>.',
            time: '09:32'
        },
        {
            type: 'user',
            text: 'o Outback de ontem foi jantar com cliente',
            time: '09:32'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Gerente financeiro',
            avatar: 'images/martin.jpg',
            nameColor: '#00897B',
            text: 'Movi pra <b>Despesas do trabalho</b> ✅ Da próxima, o Outback já entra certo.',
            time: '09:34'
        },
        {
            type: 'user',
            text: 'me lembra do remédio todo dia às 20h',
            time: '09:34'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Organização & Docs',
            avatar: 'images/luna.jpg',
            nameColor: '#E91E63',
            text: 'Todo dia às <b>20h</b> ⏰ Eu não esqueço.',
            time: '09:36'
        },
        {
            type: 'user',
            text: 'manda meu link de agenda pro cliente marcar sozinho',
            time: '09:36'
        },
        {
            type: 'bot',
            name: 'Sofi',
            role: 'Secretária executiva',
            avatar: 'images/sofi.jpg',
            nameColor: '#1E88E5',
            text: 'Enviado 🗓️ Quando marcarem, <b>eu confirmo com a pessoa</b> e te aviso.',
            time: '09:38'
        },
        {
            type: 'user',
            text: 'emite a nota da mentoria todo dia 1º',
            time: '09:38'
        },
        {
            type: 'bot',
            name: 'Rita',
            role: 'Assistente fiscal',
            avatar: 'images/rita.jpg',
            nameColor: '#5E35B1',
            text: 'Combinado 🧾 Todo dia 1º ela <b>sai sozinha</b>.',
            time: '09:40'
        },
        {
            type: 'user',
            text: 'guarda essa foto da nota do posto',
            time: '09:40'
        },
        {
            type: 'bot',
            name: 'Simplific',
            role: 'Organização & Docs',
            avatar: 'images/luna.jpg',
            nameColor: '#E91E63',
            text: 'Guardei em <b>Notas fiscais</b> 📁 Quando precisar, é só pedir.',
            time: '09:42'
        },
        {
            type: 'bot',
            name: 'Sofi',
            role: 'Secretária executiva',
            avatar: 'images/sofi.jpg',
            nameColor: '#1E88E5',
            text: 'Amanhã: <b>3 compromissos</b> ☀️ O primeiro é às 9h, com a Carla.',
            time: '09:42'
        },
        {
            type: 'bot',
            name: 'Theo',
            role: 'Diretor de operações',
            avatar: 'images/theo.jpg',
            nameColor: '#8E24AA',
            text: 'Fechando o dia: <b>12 pedidos resolvidos</b>, nada esquecido ✅',
            time: '09:44'
        }
    ];

    let currentMsgIndex = 0;

    function renderMessage(msg) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${msg.type}`;
        
        let innerHTML = '';
        
        if (msg.type === 'bot') {
            innerHTML += `
                <div class="chat-msg-header">
                    <img src="${msg.avatar}" alt="${msg.name}" class="chat-msg-avatar">
                    <span class="chat-msg-name" style="color: ${msg.nameColor};">${msg.name}</span>
                    <div class="chat-msg-verified">${verifiedSvg}</div>
                    <span class="chat-msg-role">· ${msg.role}</span>
                </div>
            `;
        }
        
        innerHTML += `<div class="chat-msg-text">${msg.text}</div>`;
        
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        innerHTML += `
            <div class="chat-msg-time">
                ${currentTime}
                ${msg.type === 'user' ? doubleCheckSvg : ''}
            </div>
        `;
        
        msgDiv.innerHTML = innerHTML;
        chatContainer.appendChild(msgDiv);
        
        // Scroll to bottom gently
        const simulationContainer = document.getElementById('chatSimulation');
        simulationContainer.scrollTop = simulationContainer.scrollHeight;
    }

    function playNextMessage() {
        /* ABA EM SEGUNDO PLANO NAO CONSOME A CONVERSA. O navegador estrangula
           os timers da aba escondida e depois solta tudo de uma vez: quem
           volta pega a conversa em rajada, com a impressao de que ela
           acelerou. Aqui cada tique so re-pergunta, sem gastar mensagem, e o
           ritmo normal volta junto com a pessoa. */
        if (document.hidden) { setTimeout(playNextMessage, 800); return; }

        if (currentMsgIndex >= chatData.length) {
            // Loop or stop. Let's restart after a delay
            setTimeout(() => {
                chatContainer.innerHTML = '';
                currentMsgIndex = 0;
                playNextMessage();
            }, 5000);
            return;
        }

        const msg = chatData[currentMsgIndex];
        currentMsgIndex++;
        
        // Exibir indicador de "digitando"
        const typingDiv = document.createElement('div');
        typingDiv.className = `chat-msg ${msg.type} typing-indicator`;
        
        let innerHTML = '';
        if (msg.type === 'bot') {
            innerHTML += `
                <div class="chat-msg-header">
                    <img src="${msg.avatar}" alt="${msg.name}" class="chat-msg-avatar">
                    <span class="chat-msg-name" style="color: ${msg.nameColor};">${msg.name}</span>
                    <div class="chat-msg-verified">${verifiedSvg}</div>
                    <span class="chat-msg-role">· ${msg.role}</span>
                </div>
            `;
        }
        
        innerHTML += `
            <div class="chat-typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        
        typingDiv.innerHTML = innerHTML;
        chatContainer.appendChild(typingDiv);
        
        const simulationContainer = document.getElementById('chatSimulation');
        simulationContainer.scrollTop = simulationContainer.scrollHeight;
        
        // Tempo de "digitando": quem pede escreve depressa, quem responde
        // pensa um pouco mais. Antes os dois usavam a mesma faixa e o pedido
        // do usuario demorava tanto quanto a resposta da equipe.
        // Faixas afrouxadas ~25% na 8a rodada, para tirar a impressao de pressa.
        const typingTime = msg.type === 'user'
            ? Math.random() * 300 + 550
            : Math.random() * 600 + 1100;

        setTimeout(() => {
            if(chatContainer.contains(typingDiv)) {
                chatContainer.removeChild(typingDiv);
            }
            renderMessage(msg);

            const delay = Math.random() * 500 + 900;
            setTimeout(playNextMessage, delay);
        }, typingTime);
    }

    // Start animation 2s after load
    setTimeout(playNextMessage, 2000);
});

// ============================================================
// SEÇÃO 2 — EQUIPE DE ASSESSORES: Interações + Canvas Mesh
// ============================================================
setTimeout( () => {
    // --- Assessor Data ---
    const assessors = {
        theo: {
            name: 'Theo',
            role: 'Diretor de operações',
            portrait: 'images/theo_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Sua manhã foi organizada! Separei 3 prioridades.'
        },
        martin: {
            name: 'Simplific',
            role: 'Gerente financeiro',
            portrait: 'images/martin_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Sua fatura vence em 3 dias. Saldo sob controle!'
        },
        sofi: {
            name: 'Sofi',
            role: 'Secretária executiva',
            portrait: 'images/sofi_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Você tem uma reunião hoje das 14h às 16h'
        },
        luna: {
            name: 'Simplific',
            role: 'Organização & Docs',
            portrait: 'images/luna_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Salvei 2 documentos na sua pasta de contratos'
        },
        italo: {
            name: 'Ítalo',
            role: 'Estagiário de pesquisas',
            portrait: 'images/italo_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Achei 3 preços do monitor. O menor: R$ 1.149, com fonte.'
        },
        rita: {
            name: 'Rita',
            role: 'Assistente fiscal',
            portrait: 'images/rita_large_otim.jpg',
            avatar: 'images/perfi-fundo-preto.png',
            message: 'Nota emitida! O PDF já está na sua conversa.'
        }
    };

    const selectorCards = document.querySelectorAll('.team-selector-card');
    const carouselCards = document.querySelectorAll('.team-carousel-card');
    const notifMsg = document.getElementById('notifMsg');
    const notifTime = document.getElementById('notifTime');
    const teamNotification = document.getElementById('teamNotification');

    // O carimbo do balão é a hora de agora, como no chat do herói: bolha
    // de mensagem tem relógio, não autor.
    function stampNotifTime() {
        if (!notifTime) return;
        const now = new Date();
        notifTime.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    }
    stampNotifTime();
    const dashPanels = document.querySelectorAll('.dash-panel');

    if (!selectorCards.length || !carouselCards.length) return;

    /* ---- Painel de vidro sobre a esfera --------------------------------
       Os gráficos crescem por CSS (a classe .is-active destrava as
       transições). Aqui só cuidamos dos números, que precisam contar. */
    function countUp(el) {
        const target = parseFloat(el.dataset.count);
        if (!isFinite(target)) return;

        const asInt = el.dataset.fmt === 'int';
        const fmt = (v) => asInt
            ? Math.round(v).toLocaleString('pt-BR')
            : String(Math.round(v));

        const DUR = 1100;
        const start = performance.now();

        if (el._countRaf) cancelAnimationFrame(el._countRaf);
        el.textContent = fmt(0);

        const step = (now) => {
            const p = Math.min(1, (now - start) / DUR);
            // easeOutCubic: chega rápido e assenta, sem parecer contador de posto
            el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) el._countRaf = requestAnimationFrame(step);
            else el._countRaf = null;
        };
        el._countRaf = requestAnimationFrame(step);
    }

    function activateDash(key) {
        dashPanels.forEach(panel => {
            const on = panel.dataset.assessor === key;
            panel.classList.toggle('is-active', on);
            if (on) panel.querySelectorAll('[data-count]').forEach(countUp);
        });
    }

    function hideDash() {
        dashPanels.forEach(panel => panel.classList.remove('is-active'));
    }

    let isTransitioning = false;
    let autoRotateInterval;
    let dashTimer;
    /* A ORDEM AQUI E O data-index DOS CARDS SAO A MESMA REGUA. O carrossel
       nasceu com 4 e passou a 6 (Italo e Rita) sem tocar na rotacao: as
       posicoes ja saem de (indice +-1) modulo o tamanho da lista, e quem nao
       e centro, direita ou esquerda cai no else e vira pos-back -- que e
       opacity:0 e pointer-events:none, entao os tres de tras empilhados no
       mesmo ponto nao aparecem nem roubam clique. */
    const assessorKeys = ['theo', 'martin', 'sofi', 'luna', 'italo', 'rita'];

    /* A TIRA DE MINIATURAS GIRA, E O ATIVO MORA SEMPRE NO MEIO DELA.
       A folha faz a tira ser uma janela de 5 miniaturas com as pontas se
       apagando num degrade; aqui só decidimos QUEM senta em cada assento,
       pela distancia circular ate o ativo:

           d = (indice do card - indice do ativo) mod 6      -> 0..5
           assento = (d + 2) mod 6                           -> ativo em 2

       Com dois assentos antes dele, o ativo cai no centro exato dos 5
       visiveis, e o sexto (o antipoda, d=3) fica no assento 5, fora da
       janela. Como e a distancia CIRCULAR, a rotacao automatica anda
       sempre para o mesmo lado e nunca volta correndo do fim para o
       comeco: a cada troca a fila inteira desliza um assento e so um card
       da a volta, justamente na ponta onde o degrade ja apagou tudo.

       Mexemos em `order`, e nao em transform: a ordem do DOM continua
       theo..rita, entao tabulacao, aria-pressed e clique seguem intactos
       nos seis -- so o desenho muda de lugar. */
    function centrarSeletor(indiceAtivo) {
        const N = assessorKeys.length;
        selectorCards.forEach(card => {
            const d = (assessorKeys.indexOf(card.dataset.assessor) - indiceAtivo + N) % N;
            card.style.order = String((d + 2) % N);
        });
    }

    function selectAssessor(key, isAuto = false) {
        if (isTransitioning) return;
        const data = assessors[key];
        if (!data) return;

        isTransitioning = true;

        const currentIndex = assessorKeys.indexOf(key);
        const rightIndex = (currentIndex + 1) % assessorKeys.length;
        const backIndex = (currentIndex + 2) % assessorKeys.length;
        const leftIndex = (currentIndex - 1 + assessorKeys.length) % assessorKeys.length;

        // Update selector active states
        // O aria-pressed anda junto com a classe: a moldura conta pelo olho
        // qual está na vez, e o leitor de tela precisa da mesma notícia.
        selectorCards.forEach(card => {
            const naVez = card.dataset.assessor === key;
            card.classList.toggle('active', naVez);
            card.setAttribute('aria-pressed', naVez ? 'true' : 'false');
        });
        centrarSeletor(currentIndex);

        // Animate out notification
        if (teamNotification) teamNotification.classList.add('notif-hidden');

        // O painel de vidro sai junto e volta um pouco antes da notificação:
        // entrando em 620ms ele cruza com o fim do fade do anterior, e o
        // núcleo da esfera nunca fica vazio no meio da troca.
        hideDash();
        clearTimeout(dashTimer);
        dashTimer = setTimeout(() => activateDash(key), 620);

        // Update positions of the 4 cards
        carouselCards.forEach(card => {
            const cardIndex = parseInt(card.dataset.index);
            // Remove old pos classes
            card.classList.remove('pos-center', 'pos-right', 'pos-left', 'pos-back');
            
            // Assign new pos class
            if (cardIndex === currentIndex) card.classList.add('pos-center');
            else if (cardIndex === rightIndex) card.classList.add('pos-right');
            else if (cardIndex === leftIndex) card.classList.add('pos-left');
            else card.classList.add('pos-back');
        });

        setTimeout(() => {
            // Update notification
            notifMsg.textContent = data.message;
            stampNotifTime();

            // Animate in notification
            if (teamNotification) teamNotification.classList.remove('notif-hidden');

            isTransitioning = false;
        }, 1000); // 1000ms syncs with the slower 1.45s css transition

        // Reset interval se ativado manualmente
        if (!isAuto) {
            startAutoRotate();
        }
    }

    function rotateNext() {
        const currentActive = document.querySelector('.team-selector-card.active');
        const currentKey = currentActive ? currentActive.dataset.assessor : assessorKeys[0];
        const currentIndex = assessorKeys.indexOf(currentKey);
        const nextIndex = (currentIndex + 1) % assessorKeys.length;
        selectAssessor(assessorKeys[nextIndex], true);
    }

    function startAutoRotate() {
        clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(rotateNext, 8000);
    }

    // Eventos de clique nos seletores laterais
    selectorCards.forEach(card => {
        card.addEventListener('click', () => {
            selectAssessor(card.dataset.assessor);
        });

        // O TECLADO FAZ O MESMO QUE O CLIQUE. Como a fotinha é <div> com
        // papel de botão, o navegador não dá o Enter e o Espaço de graça,
        // que é o que um <button> traria pronto. O Espaço pede
        // preventDefault senão a página rola um tela inteira embaixo do
        // dedo de quem só queria trocar de assessor.
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                selectAssessor(card.dataset.assessor);
            }
        });
    });

    // Eventos de clique nos próprios cards do carrossel
    carouselCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!card.classList.contains('pos-center')) {
                selectAssessor(card.dataset.assessor);
            }
        });
    });

    // O painel já nasce marcado no HTML, então suas animações rodariam com a
    // seção ainda fora da tela. Ao entrar em vista a gente rearma tudo — é o
    // primeiro olhar do visitante que precisa ver os gráficos crescerem.
    const teamSectionEl = document.getElementById('teamSection');
    if (dashPanels.length && teamSectionEl && 'IntersectionObserver' in window) {
        hideDash();
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const active = document.querySelector('.team-selector-card.active');
                const key = active ? active.dataset.assessor : assessorKeys[0];
                // A rotação automática pode ter passado por aqui antes da
                // seção aparecer. Tirar e recolocar a classe (com um reflow no
                // meio) rearma as animações do painel que estiver na vez.
                hideDash();
                void document.body.offsetHeight;
                activateDash(key);
                io.disconnect();
            });
        }, { threshold: 0.3 });
        io.observe(teamSectionEl);
    }

    // A tira ja nasce centrada no que o HTML marcou como ativo, senao os
    // primeiros 8 segundos (ate a primeira rotacao) mostrariam a fila na
    // ordem crua do DOM, com o ativo na ponta.
    const seletorInicial = document.querySelector('.team-selector-card.active');
    const chaveInicial = seletorInicial ? seletorInicial.dataset.assessor : assessorKeys[0];
    centrarSeletor(Math.max(0, assessorKeys.indexOf(chaveInicial)));

    // Iniciar rotação automática
    startAutoRotate();
});

// ============================================================
// SEÇÃO 2 — ESFERA DE ENERGIA (núcleo de IA)
//
// Casca de anéis concêntricos de partículas com o miolo vazio.
// A luz não é desenhada: cada partícula deposita energia num alvo
// HDR e o tonemap só entra no fim — é isso que faz as cristas dos
// polos saturarem em branco sozinhas.
//
// Caminho principal em WebGL2 (animado). Se a GPU não der conta do
// alvo de ponto flutuante, cai no renderizador em Canvas2D lá
// embaixo, que desenha um único quadro estático.
// ============================================================
/* A montagem recebe o canvas e um punhado de ajustes, porque agora existem
   duas esferas na página: a da seção 2, branca e aberta atrás do painel de
   vidro, e a estacionada no fim, que segue com as cores da marca. Cada uma
   tem seu próprio CFG, seu próprio contexto e seu próprio laço. */
const montaEsfera = (canvas, ajustes) => {
    /* ---- Ajuste fino da estética (vale pros dois renderizadores) ----
       Distâncias em pixels de dispositivo, pra densidade — e portanto o
       brilho, que vem do acúmulo — não mudar com o tamanho do canvas. */
    const CFG = Object.assign({
        RING_STEP:   1.45,   // distância radial entre anéis (fios individuais)
        DOT_SPACING: 1.55,   // distância entre partículas ao longo do anel
        R_JITTER:    0.26,   // dispersão radial: baixa, senão o fio engorda
        RING_BIAS:   1.0,    // 1 = anéis espaçados por igual; >1 aglomera por dentro

        /* Piso de partículas por anel. Ele existe pro anel do fundo do poço
           não ficar com meia dúzia de pontos quando o raio interno é grande.
           Mas quando a faixa chega perto do centro ele vira problema: abaixo
           de RING_MIN_DOTS * DOT_SPACING / 2π pixels de raio, o anel passa a
           ter mais pontos do que a circunferência comporta, a densidade por
           área dispara e o miolo desenha um disco denso com contorno — que é
           forma geométrica onde deveria haver campo uniforme. Numa faixa que
           vai até o centro, este valor tem que ser baixo. */
        RING_MIN_DOTS: 120,
        JITTER_FILL: 0,      // quanto do vão até o anel seguinte cada um preenche

        /* Abertura do splat ao longo da espessura. Em MAX 1 nada abre e o
           splat é o bilinear de sempre. */
        SPLAT_FROM:  0.0,    // a partir de que ponto da espessura ele começa a abrir
        SPLAT_MIN:   1.0,    // raio, em px, antes de abrir (1 = o bilinear de sempre)
        SPLAT_MAX:   1.0,    // raio, em px, na borda externa

        R_OUT:       0.300,  // raio externo, fração do lado do canvas
        R_IN:        0.745,  // raio interno, fração do externo (o "buraco negro")
        WAVE_AMP:    0.42,   // ondulação máxima, fração da espessura da casca
        WAVE_SIDES:  0.14,   // quanto dessa ondulação sobra nas laterais
        RING_MIX:    14.0,   // defasagem entre anéis vizinhos: dá profundidade
        FIL_MULT:    0.9,    // quantos fios aparecem ao longo da espessura
        FIL_DEPTH:   0.26,   // contraste entre crista e vale da frente de onda
        FIL_POW:     1.0,    // <1 espaça as frentes conforme elas saem
        FIL_SPEED:   0,      // rad/s de propagação; 0 deixa a frente parada
        // A casca não tem espessura constante: engorda nos polos e afina nas
        // laterais, com o meio da faixa parado no lugar.
        THIN_SIDES:  0.55,   // espessura nas laterais, fração da dos polos

        POLE_EXP:    1.55,   // o quão rápido a luz morre indo pras laterais
        SIDE_FLOOR:  0.085,  // brilho residual nas laterais frias
        CORE_SIGMA:  0.095,  // largura angular do estouro de luz nos polos
        CORE_MIX:    0.40,   // quanto do brilho depende desse estouro (0 = nada)
        CRACKLE_POLE: 1.0,   // 1 = o crepitar só nos polos; 0 = igual em toda volta
        CREST_T:     0.78,   // onde o estouro mora na espessura da casca
        CREST_SIGMA: 0.13,   // espessura radial desse estouro
        CREST_BOOST: 15.0,   // exagero de energia na crista dos polos
        RIM_FLOOR:   0,      // quanto da crista sobra fora dos polos (0 = só neles)

        HOLE_WOBBLE: 0.16,   // o quanto a borda do buraco foge do círculo
        FADE_POWER:  1.55,   // curva do apagamento rumo ao centro
        INNER_TO:    0.72,   // até onde, na espessura, a casca termina de subir

        /* ---- O miolo ----
           Onde a subida de dentro já apagou a casca, estes valores decidem o
           que sobra. KEEP é a fração de partículas que escapa do sorteio,
           GAIN o brilho delas e EXP a curva rumo ao centro (>1 concentra no
           meio, <1 espalha até encostar na casca). Em KEEP/GAIN 0 o miolo é
           vazio absoluto, que é o desenho da esfera original; em valores
           altos ele vira um núcleo cheio. */
        DUST_KEEP:   0.0,
        DUST_GAIN:   0.0,
        DUST_EXP:    1.0,

        /* ---- Faíscas ----
           Uma minoria de partículas, sorteada em toda a nuvem, brilha muito
           acima das vizinhas e pulsa em ritmo próprio. É o que separa uma
           malha de pontos de um campo de energia: sem elas a superfície tem
           brilho uniforme e lê como textura impressa; com elas, a luz parece
           circular por dentro da malha. FRAC baixo e GAIN alto de propósito
           — poucos pontos, bem acesos. */
        SPARK_FRAC:  0.0,    // fração das partículas que vira faísca
        SPARK_GAIN:  0.0,    // quantas vezes ela brilha acima do normal
        SPARK_SPEED: 2.3,    // velocidade do pulso de cada uma

        /* Veios: modulação lenta do brilho ao longo do ângulo, pra malha não
           ficar com energia uniforme em toda a volta. Em 0 não existe. */
        ANG_AMP:     0.0,
        // Sem isto a poeira começaria de estalo no raio interno e o vazio
        // ganharia de volta uma borda circular, só que menor: a rampa faz
        // os pontos rarearem e apagarem indo pro centro.
        DUST_FROM:   0.05,

        /* A queda pra fora. Nos valores abaixo a casca só perde 80% no
           último trecho e morre numa borda — que é o desenho original. Numa
           casca grossa, começar cedo e cair em curva transforma essa borda
           num degradê que se estende pra fora. */
        OUTER_FROM:  0.86,   // onde a queda começa, fração da espessura
        OUTER_DROP:  0.80,   // quanto ela tira até a borda externa
        OUTER_EXP:   1.00,   // curva da queda: >1 apaga rápido e deixa cauda longa

        GAIN:        4.30,   // energia depositada por partícula
        EXPOSURE:    1.50,   // ganho do tonemap
        CEIL:        1.0,    // teto de luminância: <1 impede o branco puro

        /* Teto de densidade do buffer. O custo por quadro cresce com o
           quadrado disto, e a cadeia de brilho passa no alvo inteiro. */
        DPR_MAX:     2,

        /* Movimento.
           TIME_SCALE é o andamento geral: ele multiplica o relógio que vai
           pro shader, então SPIN, FLOW, crepitar, frentes de onda, respiro,
           piscar das faíscas e pulsar do miolo desaceleram todos na mesma
           proporção. É por isso que ele existe em vez de sete ajustes
           separados — mexer em cada velocidade à mão desbalanceia o
           conjunto, e o que se lê como "rápido demais" nunca é um mecanismo
           só, é a soma deles. */
        TIME_SCALE:  1.0,

        SPIN:        0.075,  // rad/s de deriva do padrão ao redor do anel
        FLOW:        0.95,   // velocidade das ondas percorrendo a malha
        BREATH:      0.014,  // amplitude do respiro do raio
        // Vibração rápida e curta concentrada nos polos: é o que dá o
        // crepitar de alta tensão em cima do movimento lento de fundo.
        CRACKLE:     0.10,   // amplitude, fração da espessura da casca
        CRACKLE_F:   23.0,   // ciclos ao redor do anel
        CRACKLE_S:   2.60,   // velocidade

        /* ---- Cursor ----
           O efeito é LOCAL: cada partícula mede em pixels a distância até o
           ponteiro. A versão anterior media o ÂNGULO dela no anel, e por
           isso um setor inteiro da casca era arrastado até o raio do cursor
           de uma vez — daí a deformação pesada. Aqui o que acontece na
           vizinhança do ponteiro fica na vizinhança do ponteiro.

           O deslocamento é deliberadamente mínimo: o efeito é de LUZ. O giro
           existe só pra malha não ficar rígida embaixo do ponteiro — em 0,09
           rad uma partícula a 200px do cursor anda ~18px no total, o
           bastante pra se perceber vida e pouco o bastante pra ninguém ver
           "algo sendo puxado". Quem carrega o efeito é o GLOW. */
        MOUSE_REACH:   0.60,  // raio de influência, fração do raio externo
        MOUSE_SWIRL:   0.09,  // giro máximo em torno do cursor, em radianos
        MOUSE_DRIFT:   0.015, // afastamento radial: quase nada, só um respiro
        MOUSE_GLOW:    1.50,  // ganho de brilho no que está perto
        MOUSE_SHIMMER: 0.28,  // fração do brilho que cintila no tempo
        MOUSE_EASE:    0.14,  // suavização do rastro (por frame a 60fps)

        /* Brilho. A cadeia de mips faz o alcance curto pesar muito mais que
           o longo — é isso que faz a luz parecer sair do fio, e não de um
           holofote atrás dele. */
        BLOOM_LEVELS:   6,
        BLOOM_FALLOFF:  0.62, // quanto cada nível mais largo ainda contribui
        BLOOM_STRENGTH: 0.85,

        /* Identidade da marca: rosa #e27bb7 em cima, roxo #bc85f8 embaixo.
           Estes valores NÃO são esses hex — são a cor de emissão, mais
           saturada. O tonemap comprime tudo em direção ao branco, então
           emitir o hex puro devolveria um pastel lavado; emitindo saturado,
           o resultado na tela cai em cima da cor da marca e o núcleo ainda
           tem pra onde estourar. */
        TOP: [255,  70, 130],
        MID: [180,  58, 226],
        BOT: [110,  45, 255]
    }, ajustes);

    // PRNG determinístico: a nuvem precisa ser idêntica a cada rebuild
    function mulberry32(a) {
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function geometry(W, H) {
        const rOut = Math.min(W, H) * CFG.R_OUT;
        const rIn  = rOut * CFG.R_IN;
        return { rOut, rIn, band: rOut - rIn };
    }

    // Posição de cada partícula na casca: anel, ângulo, tremor radial e um
    // sorteio próprio (usado pra rarear as partículas perto do centro).
    function buildParticles(W, H) {
        const { rOut, rIn, band } = geometry(W, H);
        const rings = Math.max(24, Math.round(band / CFG.RING_STEP));
        const TAU = Math.PI * 2;

        /* Os anéis não são espaçados por igual quando a casca é grossa: o
           viés aglomera a maioria deles junto da borda de dentro, onde mora
           o fio, e vai rarefazendo pra fora. É metade do degradê radial — a
           outra metade é o brilho caindo — e, de quebra, é o que segura a
           contagem de partículas, porque anel longe do centro custa muito
           mais que anel perto. Com viés 1 volta ao espaçamento uniforme. */
        const vies = CFG.RING_BIAS;
        const tDoAnel = (i) => Math.pow(i / (rings - 1), vies);

        let total = 0;
        for (let i = 0; i < rings; i++) {
            const baseR = rIn + band * tDoAnel(i);
            total += Math.max(CFG.RING_MIN_DOTS, Math.round((TAU * baseR) / CFG.DOT_SPACING));
        }

        const data = new Float32Array(total * 4);
        const rnd = mulberry32(0x9E3779B9);
        let p = 0;

        for (let i = 0; i < rings; i++) {
            const t = tDoAnel(i);
            const baseR = rIn + band * t;
            const steps = Math.max(CFG.RING_MIN_DOTS, Math.round((TAU * baseR) / CFG.DOT_SPACING));
            const dA = TAU / steps;

            /* O viés afasta os anéis conforme eles saem, e um vão de 60px
               entre dois anéis se lê como círculo concêntrico — o moiré que
               suja a periferia. Espalhando cada partícula dentro do vão até
               o anel seguinte, a casca fica radialmente contínua e os
               círculos somem. Junto do fio os anéis são densos, o vão é
               mínimo e ele continua fino. */
            const vao = band * (tDoAnel(Math.min(i + 1, rings - 1)) - t);
            const espalha = CFG.R_JITTER + vao * CFG.JITTER_FILL;

            for (let s = 0; s < steps; s++) {
                data[p++] = t;
                data[p++] = (s + rnd() - 0.5) * dA;      // quebra o alinhamento em grade
                data[p++] = (rnd() - 0.5) * espalha;
                data[p++] = rnd();
            }
        }
        return { data, count: total, rings };
    }

    // ========================================================
    // Renderizador WebGL2 — o caminho animado
    // ========================================================

    // Trechos de GLSL repetidos entre CPU e GPU. Mantidos idênticos ao
    // que o fallback faz em JS, senão os dois divergem visualmente.
    const GLSL_NOISE = `
        float turbulence(float a, float seed) {
            return (
                0.55 * sin( 2.0*a + 1.3 + seed*0.83) +
                0.75 * sin( 4.0*a - 2.7 + seed*1.19) +
                0.85 * sin( 7.0*a + 0.6 + seed*1.71) +
                0.60 * sin(11.0*a + 4.1 - seed*0.94) +
                0.40 * sin(17.0*a + 2.2 + seed*1.47) +
                0.26 * sin(27.0*a - 0.9 + seed*2.06) +
                0.16 * sin(41.0*a + 3.3 - seed*1.28)
            ) / 3.57;
        }
        float holeShape(float a) {
            return (
                0.55 * sin(1.0*a + 0.90) +
                1.00 * sin(2.0*a - 1.70) +
                0.62 * sin(3.0*a + 2.40) +
                0.34 * sin(5.0*a - 0.40)
            ) / 2.51;
        }`;

    const VS_PARTICLE = `#version 300 es
        precision highp float;
        in vec4 aP;                 // t, ângulo, tremor radial, sorteio

        uniform vec2  uRes;
        uniform float uTime;
        uniform float uROut, uRIn, uFilFreq;
        uniform float uWaveAmp, uWaveSides, uPoleExp, uSideFloor;
        uniform float uCoreSigma, uCoreMix, uCrestT, uCrestSigma, uCrestBoost;
        uniform float uCracklePole;
        uniform float uHoleWobble, uFadePower, uGain, uRingMix, uThinSides;
        uniform float uDustKeep, uDustGain, uDustFrom, uDustExp;
        uniform float uSparkFrac, uSparkGain, uSparkSpeed, uAngAmp;
        uniform float uInnerTo, uOuterFrom, uOuterDrop, uOuterExp;
        uniform float uSplatFrom, uSplatMin, uSplatMax, uRimFloor;
        uniform float uFilDepth, uFilPow, uFilSpeed;
        uniform float uSpin, uFlow, uBreath;
        uniform float uCrackle, uCrackleF, uCrackleS;
        uniform vec3  uMouse;    // xy em px do framebuffer, z = intensidade 0..1
        uniform float uMouseReach, uMouseSwirl, uMouseDrift, uMouseGlow, uMouseShimmer;
        uniform vec3  uTop, uMid, uBot;

        out vec3 vColor;
        out vec2 vCenter;
        out float vRad;
        ${GLSL_NOISE}

        const float PI  = 3.14159265;
        const float TAU = 6.28318531;

        void main() {
            float t   = aP.x;
            float ang = aP.y;               // ângulo na tela: fixo
            float sa  = sin(ang), ca = cos(ang);
            float pole = abs(sa);
            float band = uROut - uRIn;

            // O ruído lê um ângulo que gira devagar e uma semente que anda no
            // tempo: as ondas viajam pela malha em vez de só piscar no lugar.
            float na   = ang + uTime * uSpin;
            float seed = t * uRingMix + uTime * uFlow;

            // Espessura variável, medida a partir do meio da faixa pra as duas
            // bordas fecharem juntas nas laterais em vez de a casca escorregar.
            float thick = uThinSides + (1.0 - uThinSides) * pow(pole, 0.9);

            float r = uRIn + band * (0.5 + (t - 0.5) * thick)
                    + turbulence(na, seed) * band * uWaveAmp
                      * (uWaveSides + (1.0 - uWaveSides) * pow(pole, 1.4))
                      * (0.30 + 0.70 * t)
                    + aP.z;

            // Crepitar: onda curta e veloz, só onde a energia se concentra
            r += band * uCrackle * mix(1.0, pole * pole, uCracklePole)
                 * sin(ang * uCrackleF - uTime * uCrackleS + t * 4.0);

            r *= 1.0 + uBreath * (0.62 * sin(uTime * 0.53)
                                + 0.38 * sin(uTime * 0.31 + 1.1));

            // y negativo: sa > 0 é a base, que em NDC fica embaixo
            vec2 pos = uRes * 0.5 + vec2(ca, -sa) * r;

            /* ---- O cursor ----
               Um redemoinho local em vez de um puxão. Cada partícula mede a
               distância EM PIXELS até o ponteiro; dentro do alcance ela gira
               um pouco em torno dele e deriva de leve pra fora, e os dois
               efeitos morrem em curva antes da borda do alcance — não existe
               fronteira onde a coisa acabe.

               Girar (e não puxar) é o que muda a leitura: o giro preserva a
               distância ao cursor, então a malha se torce como um véu e os
               fios continuam fios. Puxar rumo a um raio, como antes,
               empilhava as partículas todas na mesma linha e o resultado
               era um bico. A deriva pra fora é pequena de propósito: só o
               bastante pra abrir um respiro no meio do redemoinho.

               Quem mais move não é quem está debaixo do cursor — é quem
               está a meio caminho: bem em cima o deslocamento tende a zero,
               porque não há distância pra girar. É assim que o efeito não
               "gruda" no ponteiro. */
            float mAmt = 0.0;
            if (uMouse.z > 0.001) {
                vec2  d    = pos - uMouse.xy;
                float dist = length(d);
                float f    = 1.0 - smoothstep(0.0, uROut * uMouseReach, dist);
                f = f * f * uMouse.z;        // ao quadrado: concentra perto

                if (f > 0.002) {
                    float th = uMouseSwirl * f;
                    float cs = cos(th), sn = sin(th);
                    pos = uMouse.xy
                        + vec2(d.x * cs - d.y * sn, d.x * sn + d.y * cs)
                          * (1.0 + uMouseDrift * f);
                    mAmt = f;
                }
            }

            // Apagamento longo rumo ao centro, com a fronteira torta e em
            // deriva — cada ângulo enxerga o buraco num raio diferente.
            // Pra fora, a queda é o degradê da própria casca: quanto mais
            // longe do fio, mais fraca a partícula — e, como o sorteio logo
            // abaixo usa este mesmo peso, ela também vai rareando. É isso
            // que faz a energia se expandir num corpo só, em vez de um arco
            // com um brilho separado em volta.
            float outerW  = 1.0 - uOuterDrop * smoothstep(uOuterFrom, 1.0, t);
            outerW = pow(max(outerW, 0.0), uOuterExp);
            float tEff    = t + holeShape(ang + uTime * 0.04) * uHoleWobble;
            float innerW  = pow(smoothstep(0.0, uInnerTo, tEff), uFadePower);
            float radialW = innerW * outerW;

            /* O miolo é o complemento da subida de dentro: onde a casca já
               apagou (innerW baixo) é onde ele existe. O expoente decide a
               curva — perto de 1 ele desce igual à casca sobe e sobra um
               vale escuro entre os dois; bem abaixo de 1 ele se mantém alto
               até encostar na casca, e a energia fica contínua do centro
               até o aro. Multiplica pela queda de fora só pra não
               reaparecer lá na borda externa. */
            float dustP   = pow(max(1.0 - innerW, 0.0), uDustExp) * outerW
                          * smoothstep(0.0, max(uDustFrom, 0.0001), t);
            float dustK   = uDustKeep * dustP;
            /* Cada partícula do miolo tem magnitude própria e cintila no seu
               próprio ritmo. Sem isso o núcleo sai num brilho chapado e lê
               como neblina; com a variação, continua lendo como partícula —
               umas se destacam, outras ficam no limiar. As duas fases saem
               do sorteio da partícula, que é fixo, então cada uma mantém a
               sua identidade entre um quadro e outro. */
            float dustMag = 0.55 + 0.90 * fract(aP.w * 97.13);
            float dustPis = 0.78 + 0.22 * sin(uTime * 0.85 + aP.w * 63.0);
            float dustW   = uDustGain * dustP * dustMag * dustPis;

            // Perto do centro as partículas rareiam, não só escurecem. É isso
            // que dissolve a borda em vez de recortá-la — e o piso da poeira
            // é justamente quantas escapam desse sorteio lá dentro.
            float keepW = max(radialW * 1.18, dustK);
            if (keepW < 0.0015 || aP.w > clamp(keepW, 0.0, 1.0)) {
                gl_Position  = vec4(-2.0, -2.0, 0.0, 1.0);
                gl_PointSize = 0.0;
                return;
            }

            // ---- As frentes de onda ----
            // É daqui que sai a leitura de energia se propagando, e não de
            // fumaça. Três coisas acontecem nesta conta:
            //
            //   uFilPow  < 1 espaça as frentes conforme elas saem, como as
            //            ondas de uma explosão, em vez de deixá-las a
            //            distâncias iguais feito um alvo de tiro;
            //   uFilSpeed faz a fase andar no tempo — a frente viaja pra
            //            fora de verdade, não fica piscando no lugar;
            //   uFilDepth é o contraste entre a crista e o vale. Raso, o
            //            campo vira um borrão uniforme; fundo, a onda tem
            //            corpo e se lê à distância.
            float fase = pow(max(t, 0.0), uFilPow) * uFilFreq + 0.7 - uTime * uFilSpeed;
            float ringGain = (1.0 - uFilDepth) + uFilDepth * (0.5 + 0.5 * sin(fase));

            float core   = exp(-(ca*ca) / (2.0 * uCoreSigma * uCoreSigma));
            float dt     = t - uCrestT;
            float crestR = exp(-(dt*dt) / (2.0 * uCrestSigma * uCrestSigma));

            // Os dois polos pulsam em períodos diferentes: batendo juntos
            // soaria mecânico.
            float pulse = sa < 0.0 ? 0.82 + 0.30 * sin(uTime * 0.90)
                                   : 0.82 + 0.30 * sin(uTime * 0.67 + 2.1);
            // O piso do aro: sem ele a crista só existe nos polos e o miolo
            // fica sem borda — a casca começa do nada. Com piso, o fio
            // acende em volta do buraco inteiro e os polos seguem estourando
            // por cima.
            float crest = mix(uRimFloor, 1.0, core) * crestR * pulse;

            float polar = uSideFloor + (1.0 - uSideFloor) * pow(pole, uPoleExp);

            float inten = radialW * ringGain * polar;
            inten *= mix(1.0, core, uCoreMix);
            inten *= 1.0 + crest * uCrestBoost;

            /* A poeira entra SOMANDO, e quase sem o fator polar. Ela chegou
               a passar pela mesma conta da casca, e o resultado era o miolo
               escuro de volta em forma de amêndoa: nas laterais o fator
               polar derruba o brilho pra menos de um quarto, então a poeira
               sumia justo à esquerda e à direita e o vazio voltava a ter
               contorno. Sendo quase igual em toda a volta, ela preenche o
               miolo por inteiro — e como são poucos pontos, isso não vira
               uma mancha: continua leitura de partícula solta. */
            inten += dustW * ringGain * mix(0.62, 1.0, pole);

            /* Veios: uma modulação lenta e de baixa frequência no brilho,
               ao longo do ângulo e defasada com o raio. Sem ela a malha tem
               energia igual em toda a volta e a regularidade lê como textura
               impressa — a "digital". Com ela nascem regiões mais e menos
               acesas que derivam devagar, e a mesma malha passa a parecer
               alimentada de forma desigual, como um campo real. Amplitude
               baixa: forte, isso vira braço de galáxia. */
            inten *= 1.0 - uAngAmp
                   + 2.0 * uAngAmp * (0.5 + 0.5 * sin(ang * 3.0 + t * 7.0 + uTime * 0.25));

            /* A faísca. O sorteio sai de outro embaralhamento do mesmo
               número da partícula — usar aP.w cru amarraria "ser faísca" a
               "ter sobrevivido ao corte", e as faíscas só apareceriam na
               periferia rala. Cada uma pulsa numa fase própria, então elas
               acendem e apagam fora de compasso. */
            float sSorteio = fract(aP.w * 331.73);
            if (sSorteio > 1.0 - uSparkFrac) {
                inten *= 1.0 + uSparkGain
                       * (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * uSparkSpeed + aP.w * 121.0)));
            }
            /* O brilho do cursor cintila: a mesma partícula pisca em ritmo
               próprio (a fase sai do t dela e do ângulo), então o que se vê
               é um formigamento de brasa, não uma lanterna acesa em cima do
               ponteiro. */
            float mFlick = 1.0 - uMouseShimmer
                         + uMouseShimmer * (0.5 + 0.5 * sin(uTime * 5.5 + t * 47.0 + ang * 3.0));
            inten *= 1.0 + mAmt * uMouseGlow * mFlick;

            float v = (sa + 1.0) * 0.5;
            vec3 col = v < 0.5 ? mix(uTop, uMid, v * 2.0)
                               : mix(uMid, uBot, (v - 0.5) * 2.0);
            // O branco do núcleo vem quase todo da saturação do tonemap;
            // aqui só um empurrãozinho.
            col = mix(col, vec3(1.0), min(1.0, crest * 0.45 + mAmt * 0.35));

            // O splat abre conforme a partícula se afasta do fio. Junto da
            // borda de dentro ele tem 1px e o fio sai com espessura de fio
            // de cabelo; lá fora ele abre e as partículas, que ali já estão
            // ralas, se sobrepõem e viram névoa em vez de poeira ponto a
            // ponto. É também o que dissolve o moiré dos anéis concêntricos:
            // onde eles ficariam visíveis como listras, o splat já é largo
            // o bastante pra fundi-los.
            // A divisão pelo raio ao quadrado conserva a energia — a
            // partícula espalha a mesma luz numa área maior, em vez de
            // ganhar brilho de graça.
            float aber = clamp((t - uSplatFrom) / max(1.0 - uSplatFrom, 0.001), 0.0, 1.0);
            float rad  = uSplatMin + (uSplatMax - uSplatMin) * aber * aber;

            vColor  = col * inten * uGain / (rad * rad);
            vCenter = pos;
            vRad    = rad;

            gl_PointSize = 2.0 * rad + 1.0;
            gl_Position  = vec4((pos / uRes) * 2.0 - 1.0, 0.0, 1.0);
        }`;

    // Splat de tenda separável, de raio variável. Em raio 1 é exatamente o
    // splat bilinear de antes — os 4 pixels vizinhos — que é o que mantém o
    // fio com espessura de sub-pixel e aspecto de fio de cabelo.
    const FS_PARTICLE = `#version 300 es
        precision highp float;
        in vec3 vColor;
        in vec2 vCenter;
        in float vRad;
        out vec4 outColor;
        void main() {
            vec2 d = abs(gl_FragCoord.xy - vCenter) / vRad;
            float w = max(0.0, 1.0 - d.x) * max(0.0, 1.0 - d.y);
            if (w <= 0.0) discard;
            outColor = vec4(vColor * w, 1.0);
        }`;

    // Triângulo que cobre a tela inteira, sem buffer de vértices
    const VS_QUAD = `#version 300 es
        out vec2 vUv;
        void main() {
            vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
            vUv = p;
            gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
        }`;

    const FS_DOWN = `#version 300 es
        precision highp float;
        in vec2 vUv;
        uniform sampler2D uSrc;
        uniform vec2 uTexel;
        out vec4 outColor;
        void main() {
            vec3 c = texture(uSrc, vUv).rgb * 4.0;
            c += texture(uSrc, vUv + vec2(-uTexel.x, -uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2( uTexel.x, -uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2(-uTexel.x,  uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2( uTexel.x,  uTexel.y)).rgb;
            outColor = vec4(c / 8.0, 1.0);
        }`;

    const FS_UP = `#version 300 es
        precision highp float;
        in vec2 vUv;
        uniform sampler2D uSrc;
        uniform vec2 uTexel;
        uniform float uW;
        out vec4 outColor;
        void main() {
            vec3 c = texture(uSrc, vUv + vec2(-uTexel.x,  uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2( 0.0,       uTexel.y)).rgb * 2.0;
            c += texture(uSrc, vUv + vec2( uTexel.x,  uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2(-uTexel.x,  0.0)).rgb * 2.0;
            c += texture(uSrc, vUv).rgb * 4.0;
            c += texture(uSrc, vUv + vec2( uTexel.x,  0.0)).rgb * 2.0;
            c += texture(uSrc, vUv + vec2(-uTexel.x, -uTexel.y)).rgb;
            c += texture(uSrc, vUv + vec2( 0.0,      -uTexel.y)).rgb * 2.0;
            c += texture(uSrc, vUv + vec2( uTexel.x, -uTexel.y)).rgb;
            outColor = vec4(c / 16.0 * uW, 1.0);
        }`;

    // Alpha = canal máximo, RGB já pré-multiplicado: sobre o fundo escuro da
    // seção isso compõe como soma, e o canvas segue transparente fora da esfera.
    const FS_COMP = `#version 300 es
        precision highp float;
        in vec2 vUv;
        uniform sampler2D uScene, uBloom;
        uniform float uExposure, uBloomS, uCeil;
        out vec4 outColor;
        void main() {
            vec3 hdr = texture(uScene, vUv).rgb + texture(uBloom, vUv).rgb * uBloomS;
            /* O tonemap fecha em 1,0, então tudo que satura vira branco puro.
               O teto reescala a curva inteira: com uCeil em 0,62 o topo da
               escala passa a ser um cinza de ~158, e nenhum ponto da peça
               consegue chegar a branco por mais energia que receba. É
               diferente de baixar o ganho — ali o pico continua existindo,
               só é preciso mais energia pra alcançá-lo. */
            vec3 c = (1.0 - exp(-hdr * uExposure)) * uCeil;
            outColor = vec4(c, max(c.r, max(c.g, c.b)));
        }`;

    function createGLRenderer() {
        const gl = canvas.getContext('webgl2', {
            alpha: true,
            premultipliedAlpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            powerPreference: 'low-power'
        });
        if (!gl) return null;
        // Sem alvo de ponto flutuante não há HDR, e sem HDR não há o estouro
        // branco no núcleo — melhor cair pro fallback do que degradar.
        if (!gl.getExtension('EXT_color_buffer_float') &&
            !gl.getExtension('EXT_color_buffer_half_float')) return null;

        function compile(type, src) {
            const sh = gl.createShader(type);
            gl.shaderSource(sh, src.trim());
            gl.compileShader(sh);
            if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
                console.warn('esfera: shader falhou —', gl.getShaderInfoLog(sh));
                return null;
            }
            return sh;
        }

        function program(vsSrc, fsSrc) {
            const vs = compile(gl.VERTEX_SHADER, vsSrc);
            const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
            if (!vs || !fs) return null;
            const pr = gl.createProgram();
            gl.attachShader(pr, vs);
            gl.attachShader(pr, fs);
            gl.bindAttribLocation(pr, 0, 'aP');
            gl.linkProgram(pr);
            if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
                console.warn('esfera: link falhou —', gl.getProgramInfoLog(pr));
                return null;
            }
            const u = {};
            const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < n; i++) {
                const name = gl.getActiveUniform(pr, i).name;
                u[name] = gl.getUniformLocation(pr, name);
            }
            return { pr, u };
        }

        const pParticle = program(VS_PARTICLE, FS_PARTICLE);
        const pDown     = program(VS_QUAD, FS_DOWN);
        const pUp       = program(VS_QUAD, FS_UP);
        const pComp     = program(VS_QUAD, FS_COMP);
        if (!pParticle || !pDown || !pUp || !pComp) return null;

        const vao = gl.createVertexArray();
        const vbo = gl.createBuffer();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);

        const emptyVao = gl.createVertexArray();

        let scene = null, mips = [], count = 0, W = 0, H = 0;

        function makeTarget(w, h) {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return ok ? { tex, fbo, w, h } : null;
        }

        function dispose(t) {
            if (!t) return;
            gl.deleteTexture(t.tex);
            gl.deleteFramebuffer(t.fbo);
        }

        function resize(w, h) {
            W = w; H = h;
            canvas.width = w;
            canvas.height = h;

            dispose(scene);
            mips.forEach(dispose);
            mips = [];

            scene = makeTarget(w, h);
            if (!scene) return false;

            let mw = w, mh = h;
            for (let i = 0; i < CFG.BLOOM_LEVELS; i++) {
                mw = Math.max(1, mw >> 1);
                mh = Math.max(1, mh >> 1);
                const t = makeTarget(mw, mh);
                if (!t) return false;
                mips.push(t);
                if (mw === 1 || mh === 1) break;
            }

            const parts = buildParticles(w, h);
            count = parts.count;
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, parts.data, gl.STATIC_DRAW);
            return true;
        }

        function quad() { gl.drawArrays(gl.TRIANGLES, 0, 3); }

        // Posição do cursor em px do framebuffer, já suavizada, e o quanto ele
        // pesa (0..1). Quem alimenta isso é o rastreador lá no bootstrap.
        const mouse = { x: 0, y: 0, amt: 0 };

        function draw(time) {
            if (!scene) return;
            const { rOut, rIn, band } = geometry(W, H);
            const u = pParticle.u;

            gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
            gl.viewport(0, 0, W, H);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);

            gl.useProgram(pParticle.pr);
            gl.uniform2f(u.uRes, W, H);
            gl.uniform1f(u.uTime, time);
            gl.uniform1f(u.uROut, rOut);
            gl.uniform1f(u.uRIn, rIn);
            gl.uniform1f(u.uFilFreq, band * CFG.FIL_MULT);
            gl.uniform1f(u.uWaveAmp, CFG.WAVE_AMP);
            gl.uniform1f(u.uWaveSides, CFG.WAVE_SIDES);
            gl.uniform1f(u.uPoleExp, CFG.POLE_EXP);
            gl.uniform1f(u.uSideFloor, CFG.SIDE_FLOOR);
            gl.uniform1f(u.uCoreSigma, CFG.CORE_SIGMA);
            gl.uniform1f(u.uCoreMix, CFG.CORE_MIX);
            gl.uniform1f(u.uCracklePole, CFG.CRACKLE_POLE);
            gl.uniform1f(u.uCrestT, CFG.CREST_T);
            gl.uniform1f(u.uCrestSigma, CFG.CREST_SIGMA);
            gl.uniform1f(u.uCrestBoost, CFG.CREST_BOOST);
            gl.uniform1f(u.uHoleWobble, CFG.HOLE_WOBBLE);
            gl.uniform1f(u.uFadePower, CFG.FADE_POWER);
            gl.uniform1f(u.uInnerTo, CFG.INNER_TO);
            gl.uniform1f(u.uDustKeep, CFG.DUST_KEEP);
            gl.uniform1f(u.uDustGain, CFG.DUST_GAIN);
            gl.uniform1f(u.uDustFrom, CFG.DUST_FROM);
            gl.uniform1f(u.uDustExp, CFG.DUST_EXP);
            gl.uniform1f(u.uSparkFrac, CFG.SPARK_FRAC);
            gl.uniform1f(u.uSparkGain, CFG.SPARK_GAIN);
            gl.uniform1f(u.uSparkSpeed, CFG.SPARK_SPEED);
            gl.uniform1f(u.uAngAmp, CFG.ANG_AMP);
            gl.uniform1f(u.uOuterFrom, CFG.OUTER_FROM);
            gl.uniform1f(u.uOuterDrop, CFG.OUTER_DROP);
            gl.uniform1f(u.uOuterExp, CFG.OUTER_EXP);
            gl.uniform1f(u.uSplatFrom, CFG.SPLAT_FROM);
            gl.uniform1f(u.uSplatMin, CFG.SPLAT_MIN);
            gl.uniform1f(u.uSplatMax, CFG.SPLAT_MAX);
            gl.uniform1f(u.uRimFloor, CFG.RIM_FLOOR);
            gl.uniform1f(u.uFilDepth, CFG.FIL_DEPTH);
            gl.uniform1f(u.uFilPow, CFG.FIL_POW);
            gl.uniform1f(u.uFilSpeed, CFG.FIL_SPEED);
            gl.uniform1f(u.uGain, CFG.GAIN);
            gl.uniform1f(u.uRingMix, CFG.RING_MIX);
            gl.uniform1f(u.uThinSides, CFG.THIN_SIDES);
            gl.uniform1f(u.uSpin, CFG.SPIN);
            gl.uniform1f(u.uFlow, CFG.FLOW);
            gl.uniform1f(u.uBreath, CFG.BREATH);
            gl.uniform1f(u.uCrackle, CFG.CRACKLE);
            gl.uniform1f(u.uCrackleF, CFG.CRACKLE_F);
            gl.uniform1f(u.uCrackleS, CFG.CRACKLE_S);
            gl.uniform3f(u.uMouse, mouse.x, mouse.y, mouse.amt);
            gl.uniform1f(u.uMouseReach, CFG.MOUSE_REACH);
            gl.uniform1f(u.uMouseSwirl, CFG.MOUSE_SWIRL);
            gl.uniform1f(u.uMouseDrift, CFG.MOUSE_DRIFT);
            gl.uniform1f(u.uMouseGlow, CFG.MOUSE_GLOW);
            gl.uniform1f(u.uMouseShimmer, CFG.MOUSE_SHIMMER);
            gl.uniform3f(u.uTop, CFG.TOP[0] / 255, CFG.TOP[1] / 255, CFG.TOP[2] / 255);
            gl.uniform3f(u.uMid, CFG.MID[0] / 255, CFG.MID[1] / 255, CFG.MID[2] / 255);
            gl.uniform3f(u.uBot, CFG.BOT[0] / 255, CFG.BOT[1] / 255, CFG.BOT[2] / 255);

            gl.bindVertexArray(vao);
            gl.drawArrays(gl.POINTS, 0, count);

            gl.bindVertexArray(emptyVao);

            // Cadeia de mips: desce reduzindo pela metade...
            gl.disable(gl.BLEND);
            gl.useProgram(pDown.pr);
            gl.uniform1i(pDown.u.uSrc, 0);
            gl.activeTexture(gl.TEXTURE0);
            let src = scene;
            for (const m of mips) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, m.fbo);
                gl.viewport(0, 0, m.w, m.h);
                gl.bindTexture(gl.TEXTURE_2D, src.tex);
                gl.uniform2f(pDown.u.uTexel, 1 / src.w, 1 / src.h);
                quad();
                src = m;
            }

            // ...e volta somando. Cada nível mais largo entra atenuado, então
            // o alcance curto domina e a luz gruda no fio.
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.useProgram(pUp.pr);
            gl.uniform1i(pUp.u.uSrc, 0);
            gl.uniform1f(pUp.u.uW, CFG.BLOOM_FALLOFF);
            for (let i = mips.length - 2; i >= 0; i--) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, mips[i].fbo);
                gl.viewport(0, 0, mips[i].w, mips[i].h);
                gl.bindTexture(gl.TEXTURE_2D, mips[i + 1].tex);
                gl.uniform2f(pUp.u.uTexel, 1 / mips[i + 1].w, 1 / mips[i + 1].h);
                quad();
            }

            gl.disable(gl.BLEND);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, W, H);
            gl.useProgram(pComp.pr);
            gl.uniform1i(pComp.u.uScene, 0);
            gl.uniform1i(pComp.u.uBloom, 1);
            gl.uniform1f(pComp.u.uExposure, CFG.EXPOSURE);
            gl.uniform1f(pComp.u.uBloomS, CFG.BLOOM_STRENGTH);
            gl.uniform1f(pComp.u.uCeil, CFG.CEIL);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, scene.tex);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, mips[0].tex);
            quad();
            gl.activeTexture(gl.TEXTURE0);
        }

        return { resize, draw, animated: true, mouse };
    }

    // ========================================================
    // Fallback em Canvas2D — um quadro estático, sem animação
    // ========================================================
    function create2DRenderer() {
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        const layer = document.createElement('canvas');
        const layerCtx = layer.getContext('2d');
        const DS = 6;
        let W = 0, H = 0;

        function smoothstep(e0, e1, x) {
            const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
            return t * t * (3 - 2 * t);
        }
        function turbulence(a, seed) {
            return (
                0.55 * Math.sin( 2 * a + 1.3 + seed * 0.83) +
                0.75 * Math.sin( 4 * a - 2.7 + seed * 1.19) +
                0.85 * Math.sin( 7 * a + 0.6 + seed * 1.71) +
                0.60 * Math.sin(11 * a + 4.1 - seed * 0.94) +
                0.40 * Math.sin(17 * a + 2.2 + seed * 1.47) +
                0.26 * Math.sin(27 * a - 0.9 + seed * 2.06) +
                0.16 * Math.sin(41 * a + 3.3 - seed * 1.28)
            ) / 3.57;
        }
        function holeShape(a) {
            return (
                0.55 * Math.sin(1 * a + 0.90) +
                1.00 * Math.sin(2 * a - 1.70) +
                0.62 * Math.sin(3 * a + 2.40) +
                0.34 * Math.sin(5 * a - 0.40)
            ) / 2.51;
        }

        // Fora da imagem vale zero, não a cópia do pixel da borda: replicar
        // borda espalharia o brilho até o canto e desenharia um retângulo.
        function boxBlur(src, dst, w, h, r, vertical) {
            const norm = 1 / (2 * r + 1);
            const outer = vertical ? w : h;
            const inner = vertical ? h : w;
            const stepIn = (vertical ? w : 1) * 3;
            for (let o = 0; o < outer; o++) {
                const base = (vertical ? o : o * w) * 3;
                let s0 = 0, s1 = 0, s2 = 0;
                for (let k = 0; k <= r && k < inner; k++) {
                    const i = base + k * stepIn;
                    s0 += src[i]; s1 += src[i + 1]; s2 += src[i + 2];
                }
                for (let n = 0; n < inner; n++) {
                    const i = base + n * stepIn;
                    dst[i] = s0 * norm; dst[i + 1] = s1 * norm; dst[i + 2] = s2 * norm;
                    const na = n + r + 1;
                    if (na < inner) {
                        const j = base + na * stepIn;
                        s0 += src[j]; s1 += src[j + 1]; s2 += src[j + 2];
                    }
                    const nb = n - r;
                    if (nb >= 0) {
                        const j = base + nb * stepIn;
                        s0 -= src[j]; s1 -= src[j + 1]; s2 -= src[j + 2];
                    }
                }
            }
        }

        function buildGlow(buf, rTight, rWide) {
            const w = Math.ceil(W / DS), h = Math.ceil(H / DS);
            const small = new Float32Array(w * h * 3);
            const tmp   = new Float32Array(w * h * 3);
            const glow  = new Float32Array(w * h * 3);
            const inv = 1 / (DS * DS);

            for (let y = 0; y < H; y++) {
                const sy = (y / DS) | 0;
                for (let x = 0; x < W; x++) {
                    const p = (y * W + x) * 3;
                    const q = (sy * w + ((x / DS) | 0)) * 3;
                    small[q]     += buf[p]     * inv;
                    small[q + 1] += buf[p + 1] * inv;
                    small[q + 2] += buf[p + 2] * inv;
                }
            }
            const pass = (r) => {
                for (let i = 0; i < 3; i++) {
                    boxBlur(small, tmp, w, h, r, false);
                    boxBlur(tmp, small, w, h, r, true);
                }
            };
            pass(Math.max(1, Math.round(rTight / DS)));
            for (let i = 0; i < glow.length; i++) glow[i] = small[i] * 0.35;
            pass(Math.max(1, Math.round(rWide / DS)));
            for (let i = 0; i < glow.length; i++) glow[i] += small[i] * 0.30;
            return { data: glow, w, h };
        }

        function resize(w, h) {
            W = w; H = h;
            canvas.width = w; canvas.height = h;
            layer.width = w; layer.height = h;
            return true;
        }

        function draw(time) {
            const { rOut, rIn, band } = geometry(W, H);
            const cx = W * 0.5, cy = H * 0.5;
            const amp = band * CFG.WAVE_AMP;
            const buf = new Float32Array(W * H * 3);
            const parts = buildParticles(W, H);
            const d = parts.data;
            const filFreq = band * CFG.FIL_MULT;

            const top = CFG.TOP, mid = CFG.MID, bot = CFG.BOT;

            for (let k = 0; k < parts.count; k++) {
                const o = k * 4;
                const t = d[o], a = d[o + 1], jit = d[o + 2], pick = d[o + 3];
                const sa = Math.sin(a), ca = Math.cos(a);
                const pole = sa < 0 ? -sa : sa;

                const outerW = Math.pow(
                    Math.max(0, 1 - CFG.OUTER_DROP * smoothstep(CFG.OUTER_FROM, 1, t)),
                    CFG.OUTER_EXP);
                const tEff = t + holeShape(a) * CFG.HOLE_WOBBLE;
                const innerW = Math.pow(smoothstep(0, CFG.INNER_TO, tEff), CFG.FADE_POWER);
                const radialW = innerW * outerW;
                // Mesma poeira do shader: minoria sorteada, brilho fixo
                const dustP = Math.pow(Math.max(1 - innerW, 0), CFG.DUST_EXP) * outerW
                    * smoothstep(0, Math.max(CFG.DUST_FROM, 0.0001), t);
                const dustK = CFG.DUST_KEEP * dustP;
                // Mesma magnitude por ponto do shader (aqui sem o piscar,
                // que num quadro estático não teria como aparecer)
                const dustMag = 0.55 + 0.90 * ((pick * 97.13) % 1);
                const dustW = CFG.DUST_GAIN * dustP * dustMag;
                const keepW = Math.max(radialW * 1.18, dustK);
                if (keepW < 0.0015) continue;
                if (pick > Math.min(1, keepW)) continue;

                const thick = CFG.THIN_SIDES + (1 - CFG.THIN_SIDES) * Math.pow(pole, 0.9);
                const r = rIn + band * (0.5 + (t - 0.5) * thick)
                    + turbulence(a, t * CFG.RING_MIX) * amp
                      * (CFG.WAVE_SIDES + (1 - CFG.WAVE_SIDES) * Math.pow(pole, 1.4))
                      * (0.30 + 0.70 * t)
                    + band * CFG.CRACKLE * (1 + (pole * pole - 1) * CFG.CRACKLE_POLE)
                      * Math.sin(a * CFG.CRACKLE_F + t * 4)
                    + jit;

                const x = cx + ca * r, y = cy + sa * r;
                if (x < 1 || y < 1 || x >= W - 2 || y >= H - 2) continue;

                const fase = Math.pow(Math.max(t, 0), CFG.FIL_POW) * filFreq + 0.7 - time * CFG.FIL_SPEED;
                const ringGain = (1 - CFG.FIL_DEPTH) + CFG.FIL_DEPTH * (0.5 + 0.5 * Math.sin(fase));
                const core  = Math.exp(-(ca * ca) / (2 * CFG.CORE_SIGMA * CFG.CORE_SIGMA));
                const dt    = t - CFG.CREST_T;
                const crest = (CFG.RIM_FLOOR + (1 - CFG.RIM_FLOOR) * core)
                    * Math.exp(-(dt * dt) / (2 * CFG.CREST_SIGMA * CFG.CREST_SIGMA));

                const polar = CFG.SIDE_FLOOR + (1 - CFG.SIDE_FLOOR) * Math.pow(pole, CFG.POLE_EXP);
                let inten = radialW * ringGain * polar;
                inten *= 1 + (core - 1) * CFG.CORE_MIX;
                inten *= 1 + crest * CFG.CREST_BOOST;
                inten += dustW * ringGain * (0.62 + 0.38 * pole);   // miolo quase isotrópico
                inten *= 1 - CFG.ANG_AMP
                       + 2 * CFG.ANG_AMP * (0.5 + 0.5 * Math.sin(a * 3 + t * 7));
                const sSorteio = (pick * 331.73) % 1;
                if (sSorteio > 1 - CFG.SPARK_FRAC) inten *= 1 + CFG.SPARK_GAIN * 0.68;

                const aber = Math.min(1, Math.max(0,
                    (t - CFG.SPLAT_FROM) / Math.max(1 - CFG.SPLAT_FROM, 0.001)));
                const rad = CFG.SPLAT_MIN + (CFG.SPLAT_MAX - CFG.SPLAT_MIN) * aber * aber;

                const w = inten * CFG.GAIN;
                if (w < 0.0005) continue;

                const v = (sa + 1) * 0.5;
                const s0 = v < 0.5 ? top : mid, s1 = v < 0.5 ? mid : bot;
                const kk = v < 0.5 ? v * 2 : (v - 0.5) * 2;
                const white = Math.min(1, crest * 0.45);
                const mixc = (i) => {
                    const c = (s0[i] + (s1[i] - s0[i]) * kk) / 255;
                    return (c + (1 - c) * white) * w;
                };
                const cr = mixc(0), cg = mixc(1), cb = mixc(2);

                /* Mesma tenda separável do shader: em raio 1 isto é o splat
                   bilinear nos 4 vizinhos, e a divisão pelo raio ao quadrado
                   conserva a energia quando ele abre. */
                const x0 = x | 0, y0 = y | 0;
                const alcanceSplat = Math.ceil(rad);
                const inv = 1 / (rad * rad);
                for (let dy = -alcanceSplat + 1; dy <= alcanceSplat; dy++) {
                    const yy = y0 + dy;
                    if (yy < 0 || yy >= H) continue;
                    const wy = 1 - Math.abs(y - yy) / rad;
                    if (wy <= 0) continue;
                    for (let dx = -alcanceSplat + 1; dx <= alcanceSplat; dx++) {
                        const xx = x0 + dx;
                        if (xx < 0 || xx >= W) continue;
                        const wx = 1 - Math.abs(x - xx) / rad;
                        if (wx <= 0) continue;
                        const ww = wx * wy * inv;
                        const p = (yy * W + xx) * 3;
                        buf[p] += cr * ww; buf[p + 1] += cg * ww; buf[p + 2] += cb * ww;
                    }
                }
            }

            const glow = buildGlow(buf, rOut * 0.030, rOut * 0.130);
            const gd = glow.data, gw = glow.w, gh = glow.h;

            const gxa = new Int32Array(W), gxb = new Int32Array(W);
            const gtx = new Float32Array(W);
            for (let x = 0; x < W; x++) {
                const fx = x / DS - 0.5, x0 = Math.floor(fx);
                gtx[x] = fx - x0;
                gxa[x] = Math.min(gw - 1, Math.max(0, x0));
                gxb[x] = Math.min(gw - 1, Math.max(0, x0 + 1));
            }

            const img = layerCtx.createImageData(W, H);
            const px = img.data;
            let p = 0, q = 0;
            for (let y = 0; y < H; y++) {
                const fy = y / DS - 0.5, y0 = Math.floor(fy);
                const ty = fy - y0, ity = 1 - ty;
                const ya = Math.min(gh - 1, Math.max(0, y0)) * gw;
                const yb = Math.min(gh - 1, Math.max(0, y0 + 1)) * gw;
                for (let x = 0; x < W; x++, p += 3, q += 4) {
                    const tx = gtx[x], itx = 1 - tx;
                    const w00 = itx * ity, w10 = tx * ity, w01 = itx * ty, w11 = tx * ty;
                    const i00 = (ya + gxa[x]) * 3, i10 = (ya + gxb[x]) * 3;
                    const i01 = (yb + gxa[x]) * 3, i11 = (yb + gxb[x]) * 3;
                    const br = buf[p]     + gd[i00]     * w00 + gd[i10]     * w10 + gd[i01]     * w01 + gd[i11]     * w11;
                    const bg = buf[p + 1] + gd[i00 + 1] * w00 + gd[i10 + 1] * w10 + gd[i01 + 1] * w01 + gd[i11 + 1] * w11;
                    const bb = buf[p + 2] + gd[i00 + 2] * w00 + gd[i10 + 2] * w10 + gd[i01 + 2] * w01 + gd[i11 + 2] * w11;
                    if (br < 0.0016 && bg < 0.0016 && bb < 0.0016) continue;

                    const rr = 255 * (1 - Math.exp(-br * CFG.EXPOSURE));
                    const gg = 255 * (1 - Math.exp(-bg * CFG.EXPOSURE));
                    const bbv = 255 * (1 - Math.exp(-bb * CFG.EXPOSURE));
                    const m = rr > gg ? (rr > bbv ? rr : bbv) : (gg > bbv ? gg : bbv);
                    if (m < 0.6) continue;
                    const kk = 255 / m;
                    px[q] = rr * kk; px[q + 1] = gg * kk; px[q + 2] = bbv * kk;
                    px[q + 3] = m * CFG.CEIL;
                }
            }
            layerCtx.putImageData(img, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(layer, 0, 0);
        }

        return { resize, draw, animated: false };
    }

    // ========================================================
    // Bootstrap
    // ========================================================
    let renderer = null;
    try {
        renderer = createGLRenderer();
    } catch (err) {
        console.warn('esfera: WebGL indisponível, usando o fallback —', err);
    }
    if (!renderer) renderer = create2DRenderer();
    if (!renderer) return;

    const calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    const animate = renderer.animated && !(calm && calm.matches);

    /* Teto de resolução separado para o celular (27/08/2026). A caixa da
       esfera da equipe dobrou lá por ordem do dono, e resolução é o único
       lugar de onde tirar o custo: o quadro cresce com o quadrado do lado
       do buffer, e a cadeia de brilho passa nele inteiro. Com o teto pela
       metade o buffer volta ao número de pixels de antes, esticado no dobro
       da área — a MESMA imagem de hoje, ampliada, que é o que a ordem pede.
       Quem não declara DPR_MAX_CELULAR (a esfera estacionada) segue no
       DPR_MAX de sempre em qualquer largura. */
    const estreito = window.matchMedia && window.matchMedia('(max-width: 600px)');

    let sized = '';
    let visible = false;
    let raf = 0;
    let t0 = 0;

    function fitToLayout() {
        const rect = canvas.getBoundingClientRect();
        if (Math.min(rect.width, rect.height) < 40) return false;
        const teto = (estreito && estreito.matches && CFG.DPR_MAX_CELULAR) || CFG.DPR_MAX;
        const dpr = Math.min(window.devicePixelRatio || 1, teto);
        const key = Math.round(rect.width) + 'x' + Math.round(rect.height) + '@' + dpr;
        if (key === sized) return true;
        if (!renderer.resize(Math.round(rect.width * dpr), Math.round(rect.height * dpr))) {
            return false;
        }
        sized = key;
        return true;
    }

    /* ---- Cursor ----------------------------------------------------------
       O canvas tem pointer-events: none (senão engoliria cliques da seção),
       então o rastreio é na janela e a conversão pra coordenada do canvas é
       feita na mão. A posição é suavizada a cada frame: sem isso a deformação
       salta junto com o ponteiro em vez de escorrer atrás dele. */
    const mouse = renderer.mouse;
    let pointer = null;          // última posição bruta, em coords de viewport

    /* Suavização em XY, direta. A versão polar que existia aqui era exigência
       do efeito antigo: como ele deformava um setor do anel, o ponto
       suavizado precisava CONTORNAR a esfera, senão o bulge se teleportava
       ao cruzar o centro. O redemoinho é local — ele acompanha o ponteiro
       pelo caminho reto, que é justamente o que se espera de um rastro. */
    let smX = 0, smY = 0;

    if (mouse) {
        window.addEventListener('pointermove', (e) => {
            pointer = { x: e.clientX, y: e.clientY };
        }, { passive: true });

        // Ponteiro que sai da janela (ou toque que termina) solta a deformação
        const release = () => { pointer = null; };
        window.addEventListener('pointerleave', release, { passive: true });
        window.addEventListener('pointercancel', release, { passive: true });
        window.addEventListener('pointerup', (e) => {
            if (e.pointerType !== 'mouse') release();
        }, { passive: true });
        window.addEventListener('blur', release);
    }

    function trackPointer(dt) {
        if (!mouse) return;
        const rect = canvas.getBoundingClientRect();
        const scale = rect.width ? canvas.width / rect.width : 1;
        const cx = canvas.width * 0.5, cy = canvas.height * 0.5;
        const rOut = Math.min(canvas.width, canvas.height) * CFG.R_OUT;

        // Parados por padrão: com o ponteiro fora, só a intensidade cai — a
        // posição fica onde estava, senão o redemoinho atravessaria a esfera
        // enquanto some.
        let tX = smX, tY = smY, tAmt = 0;

        if (pointer) {
            tX = (pointer.x - rect.left) * scale;
            tY = canvas.height - (pointer.y - rect.top) * scale;  // gl_FragCoord: y pra cima
            const dist = Math.hypot(tX - cx, tY - cy);

            // Só reage por perto: a esfera não deve responder ao cursor do
            // outro lado da página. Sem o antigo corte no meio — o efeito
            // agora é local e funciona igual de bem no centro.
            const near = 1 - Math.min(1, Math.max(0, (dist - rOut * 1.15) / (rOut * 0.9)));
            tAmt = near * near;
        }

        // suavização independente da taxa de quadros
        const k = 1 - Math.pow(1 - CFG.MOUSE_EASE, Math.min(4, dt * 60));

        // Reengajando depois de apagar: aparece já no lugar, sem varrer até lá
        if (tAmt > 0 && mouse.amt < 0.02) { smX = tX; smY = tY; }

        smX += (tX - smX) * k;
        smY += (tY - smY) * k;
        mouse.amt += (tAmt - mouse.amt) * k;

        mouse.x = smX;
        mouse.y = smY;
    }

    let last = 0;
    function frame(now) {
        raf = 0;
        if (!visible) return;
        if (!t0) { t0 = now; last = now; }
        trackPointer(Math.min(0.1, (now - last) * 0.001));
        last = now;
        renderer.draw((now - t0) * 0.001 * CFG.TIME_SCALE);
        if (animate) raf = requestAnimationFrame(frame);
    }

    function kick() {
        if (!visible || raf) return;
        raf = requestAnimationFrame(frame);
    }

    function onResize() {
        if (!visible) { sized = ''; return; }
        if (fitToLayout()) kick();
    }

    if (window.ResizeObserver) {
        new ResizeObserver(onResize).observe(canvas);
    } else {
        window.addEventListener('resize', onResize);
    }

    // Só desenha com a seção à vista: fora dela o loop para e devolve a GPU.
    if (window.IntersectionObserver) {
        new IntersectionObserver((entries) => {
            visible = entries.some(e => e.isIntersecting);
            if (visible) {
                if (fitToLayout()) kick();
            } else if (raf) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        }, { rootMargin: '200px' }).observe(canvas);
    } else {
        visible = true;
        if (fitToLayout()) kick();
    }
};

/* ---- As esferas da página ----
   "equipe" é a da seção 2: branca, maior e com a casca mais fina, porque
   ali ela não é o assunto — é a luz que o painel de vidro recebe por trás.
   "parada" é a original, guardada no fim do site pra ser reaproveitada. */
const ESFERAS = {
    equipe: {
        /* Emissão fria e sem estouro. A versão anterior emitia branco puro e
           a peça chamava atenção demais — virava o assunto do bloco, e o
           assunto são os assessores. Baixando os três valores e puxando o
           azul, o tonemap para de saturar em branco e entrega cinza-prata;
           o fio de lilás na base sobrou pra escala não morrer em cinza de
           fumaça. Quem faz o brilho existir agora são as faíscas, que são
           poucas — o resto do campo fica discreto. */
        TOP: [196, 202, 214],
        MID: [178, 184, 206],
        BOT: [160, 164, 198],

        /* ---- A faixa ----
           Aqui está a diferença de fundo pra esfera original, e a razão de
           ela ser assim. Lá a casca é uma faixa fina: sobe, acende no fio e
           termina numa borda — quem quisesse expansão teria que pintar um
           brilho em volta, e aí a peça se parte em duas coisas, o arco e o
           halo. Aqui é uma só, e ela ocupa o canvas quase inteiro: vai de
           0,005 a 0,460 do lado (7px a 690px, num canvas de 1500). Dentro
           dela mora tudo — o núcleo cheio no meio, o aro aceso em ~170px, e
           daí pra fora um degradê que cai em curva, com as partículas
           rareando junto, até dissolver perto da borda.

           Quase todo o resto do CFG é medido em FRAÇÃO da espessura, não em
           pixels. Então mexer em R_OUT/R_IN reescala onda, crepitar e a
           posição do aro de uma vez. Os valores abaixo já saíram dessa
           conta. Mexendo na faixa de novo, refaça a divisão. */
        R_OUT:       0.460,  // a energia alcança ~690px num canvas de 1500
        R_IN:        0.006,  // e sobram 7px de vazio geométrico: invisível
        /* ---- Por que estas linhas serpenteiam ----
           A ondulação já valia ~20px aqui, exatamente como na esfera
           estacionada. Só que lá isso é 40% da espessura da casca e aqui era
           3% da faixa, então saía uma linha praticamente circular: a mesma
           conta, lida como geometria em vez de energia. Em 0,07 a amplitude
           vira ~48px e a linha volta a ter caminho próprio.

           O RING_MIX subiu junto, e é ele que evita o efeito colateral.
           Amplitude alta com anéis em fase faz todos ondularem no mesmo
           compasso, as cristas se alinham entre anéis vizinhos e o conjunto
           forma braços — vira galáxia espiral, que é outra coisa. Com a
           defasagem alta cada anel encontra a onda num ponto diferente, e o
           que se vê é uma malha viva, sem desenho global por cima.

           O crepitar quase dobrou pelo mesmo motivo: é a textura fina que
           impede a linha de parecer traçada com compasso. */
        WAVE_AMP:    0.0700,
        RING_MIX:    36.0,
        CRACKLE:     0.0110,
        HOLE_WOBBLE: 0.0060, // baixo: a fronteira do miolo não é mais um assunto

        /* ---- O aro, sem os dois faróis ----
           A crista continua sendo o fio de luz da peça, mas mudou de forma.
           Antes ela era modulada pelo `core`, que é uma gaussiana no cosseno
           do ângulo — ou seja, só existia no topo e na base, e era isso que
           desenhava os dois pontos de luz. Com RIM_FLOOR em 1 ela vale o
           mesmo em toda a volta: vira um aro contínuo. CORE_MIX em 0 tira o
           resto da influência polar do brilho, e o aro fica largo e discreto
           (sigma alto, boost baixo) — presença de estrutura, não estouro. */
        RIM_FLOOR:   1.00,
        CORE_MIX:    0.00,
        CREST_T:     0.330,
        CREST_SIGMA: 0.080,
        CREST_BOOST: 2.20,
        INNER_TO:    0.280,
        FADE_POWER:  2.60,

        /* ---- O núcleo ----
           ATENÇÃO ao mexer nos quatro valores abaixo: o centro desta esfera
           cai praticamente em cima do .dash-panel (medido: 14px entre os
           dois centros), e aquele painel é vidro de verdade —
           backdrop-filter: blur(20px) sobre um véu de 4,5% de branco. Tudo
           que brilhar dentro de ~190px do centro passa por trás dele e o
           deixa leitoso, e aí o dashboard perde contraste. Já aconteceu:
           uma versão com o núcleo estourado apagou a leitura do painel
           inteiro. O miolo pode (e deve) ter energia, mas discreta.

           O que era vazio virou a parte mais clara da peça. A subida da
           casca (INNER_TO/FADE_POWER) continua apagando a casca rumo ao
           centro; o núcleo é o complemento dela, e por isso os dois se
           encaixam sem costura.

           O EXP baixo é o valor decisivo: perto de 1 o núcleo desce na mesma
           medida em que a casca sobe, e sobra um anel escuro entre os dois —
           era ele, e não o vazio geométrico, que se lia como buraco. Em 0,25
           o núcleo se segura alto até encostar no aro, e o brilho fica
           contínuo do centro até lá. KEEP alto porque agora é corpo, não
           poeira: quase toda partícula do miolo acende. */
        DUST_KEEP:   0.700,
        DUST_GAIN:   3.500,
        DUST_EXP:    0.200,
        /* A rampa existia pra segurar a energia extra que a superdensidade
           dos anéis internos criava — e ela mesma acabava desenhando uma
           borda circular no brilho. Com RING_MIN_DOTS corrigido lá embaixo,
           não há mais o que compensar, e ela volta a ser só o que devia
           ser: os últimos 3px, pra não existir uma descontinuidade exata
           no pixel do centro. */
        DUST_FROM:   0.004,

        OUTER_FROM:  0.360,  // a queda começa logo depois do aro
        OUTER_DROP:  1.00,   // até zerar: nenhuma borda externa
        OUTER_EXP:   0.90,   // rápida no começo, com cauda bem longa

        /* ---- Densidade uniforme ----
           O viés alto que existia aqui (2,55) empilhava a maioria dos anéis
           na beira de dentro. Isso funcionava quando o miolo era vazio: a
           densidade toda ia pro fio. Com o miolo cheio ele passou a ser o
           problema — a densidade despencava logo depois do centro e abria um
           vale escuro no meio do caminho, mesmo com o brilho constante. Em
           1,40 a nuvem fica quase uniforme por área, e o que desenha o
           degradê é só o brilho, que é o que dá pra controlar. Passo e
           espaçamento subiram junto pra conta não crescer. */
        RING_BIAS:   1.00,
        RING_STEP:   7.50,
        DOT_SPACING: 4.20,

        /* E o piso de partículas por anel tinha que cair junto. Com os 120
           do padrão, todo anel de raio menor que ~64px recebia mais pontos
           do que a circunferência dele comporta: a densidade por área
           disparava e o miolo desenhava um disco denso com contorno — a
           bolinha. Em 10 o anel interno recebe a mesma densidade por área
           que o externo, e a malha simplesmente rareia rumo ao centro, sem
           formar nada. É a mesma ideia do RING_BIAS acima: o que desenha o
           degradê tem que ser o brilho, nunca a densidade. */
        RING_MIN_DOTS: 10,

        /* Espessura constante em toda a volta. Cada ponto que THIN_SIDES
           tira das laterais empurra a borda INTERNA da faixa pra fora ali —
           com a faixa larga de hoje, 0,85 abria uma amêndoa deitada de ~80px
           no meio. Em 1,0 o miolo fecha redondo. */
        THIN_SIDES:  1.00,
        SIDE_FLOOR:  0.850,  // quase sem laterais frias: a peça é radial agora

        /* ---- O nível de fundo ----
           Estes quatro decidem o quanto a peça pesa na composição, e é aqui
           que se mexe pra ela avançar ou recuar — não na opacidade do
           canvas. A diferença importa: opacidade rebaixa tudo por igual e
           deixa um cinza chapado, enquanto baixar a energia tira primeiro o
           que estava SATURADO. Como o tonemap é 1 - e^(-x), o topo da escala
           é o que mais anda: nesta última descida (0,50 pra 0,32) o brilho
           médio caiu 31% e o pico do aro caiu 32%, mas os pontos acima de 40
           caíram 87% e o valor mais alto da peça saiu de 102 pra 71. É o
           branco que chamava atenção, e é ele que sai primeiro.

           Escurecer tem um efeito colateral: a cauda externa é a parte mais
           fraca, então é a primeira a cair abaixo do limiar de visibilidade
           — a peça ENCOLHE em vez de recuar, e o contorno volta a aparecer.
           Escurecer pela emissão (TOP/MID/BOT) não escapa disso: cor e GAIN
           entram no mesmo ponto da cadeia e são o mesmo multiplicador.

           Quem resolve é o OUTER_EXP, que muda a FORMA da queda em vez da
           escala: ele não toca no aro (o pico ficou em 8,4 com 1,35 e com
           0,90) e só levanta a cauda. Baixando-o junto, a razão entre a 500px
           do centro e o aro se mantém — 0,132 antes, 0,129 depois — e a peça
           escurece parada no mesmo tamanho. A conta desta vez foi 0,50/1,35
           pra 0,32/0,90. Mexendo no ganho de novo, mexa nele junto: só o
           ganho, a mesma cauda cairia pra 0,071 e a esfera encolheria. */
        GAIN:        0.32,
        EXPOSURE:    1.05,
        /* O teto é o que troca branco por cinza. Sem ele, todo ponto que
           acumulasse energia suficiente saturava o tonemap e virava #fff —
           e baixar o ganho não resolvia, só exigia mais energia pra chegar
           ao mesmo branco. Com 0,55 o topo da escala é um cinza de ~140 e
           não existe branco na peça, por mais que uma faísca acenda.
           A EXPOSURE subiu junto pra compensar: o teto multiplica a curva
           inteira, então sem isso as partes fracas sumiriam junto. */
        CEIL:        0.55,
        BLOOM_LEVELS:   7,
        BLOOM_FALLOFF:  0.74,
        BLOOM_STRENGTH: 0.45,

        /* ---- O que dá a leitura de energia, e não de nuvem ----
           Três mecanismos discretos, todos de amplitude baixa. Fortes, cada
           um descaracteriza a peça: as frentes viram alvo de tiro, o
           crepitar vira chiado e a turbulência vira galáxia espiral. Baixos,
           é a soma deles que faz o campo parecer alimentado por dentro.

           FIL_*: frentes de onda saindo do núcleo. DEPTH é o contraste entre
           crista e vale (0,12 mal aparece parado — só se lê em movimento),
           POW < 1 espaça as frentes conforme elas saem, como as ondas de uma
           explosão, e SPEED faz a fase viajar de verdade em vez de piscar no
           lugar. */
        FIL_DEPTH:   0.12,
        FIL_POW:     0.65,
        FIL_SPEED:   0.30,

        /* O crepitar era exclusivo dos polos (CRACKLE_POLE 1) porque ali é
           que a energia se concentrava. Sem os polos acesos, ele passa a
           valer quase igual em toda a volta — é a vibração de alta
           frequência que impede a superfície de parecer lisa. */
        CRACKLE_POLE: 0.20,

        /* ---- O andamento ----
           Um terço da velocidade original. O que chamava atenção não era um
           mecanismo específico e sim a soma: as faíscas piscando, o crepitar
           de alta frequência e o fluxo das ondas, todos no mesmo ritmo de
           uma peça que era pra ser assistida. Como fundo, ela tem que se
           mover devagar o bastante pra ninguém reparar quando está olhando
           outra coisa — mas não parar, senão vira imagem. */
        TIME_SCALE:  0.34,

        /* As faíscas. Com o campo todo rebaixado pra cinza, são elas que
           carregam a leitura de energia: 2% das partículas acendem seis
           vezes acima das vizinhas e piscam cada uma no seu tempo. É o que
           tira a peça do registro de "textura impressa" — que era o que a
           fazia parecer uma digital — e devolve a de campo alimentado por
           dentro. Subir o FRAC acaba com o efeito: quando muitas acendem, o
           que se vê é de novo um brilho médio uniforme. */
        SPARK_FRAC:  0.020,
        SPARK_GAIN:  2.00,
        SPARK_SPEED: 2.30,

        /* E os veios, que resolvem a outra metade do mesmo problema: as
           faíscas tiram a uniformidade ponto a ponto, os veios tiram a
           uniformidade em escala grande. */
        ANG_AMP:     0.22,

        /* Ficam de fora, no padrão neutro: splat de raio variável (SPLAT_*)
           e preenchimento do vão entre anéis (JITTER_FILL). Os dois foram
           testados aqui e apagam o granulado — o splat largo transforma a
           peça em fumaça e o JITTER_FILL dissolve os arcos, que são a
           textura da coisa. São de uma linha, caso valha retomar. */

        /* O canvas aqui tem 1650 de lado — em DPR 2 seriam 11 megapixels por
           quadro, com a cadeia de brilho passando em todos. Como esta esfera
           é um clarão de fundo, e não uma peça pra olhar de perto, vale
           trocar nitidez por custo: em 1,25 o quadro cai pra um terço e a
           densidade de partículas acompanha, porque ela é medida em pixels
           de dispositivo. */
        DPR_MAX: 1.25,

        /* No celular a caixa passou de 924 a 1848 (a esfera dobrou por ordem
           do dono, em 27/08/2026). Metade do teto devolve o buffer de antes
           — ~1155 de lado, os mesmos 1,3 megapixel por quadro — e o desenho
           sai idêntico ao de hoje, só ampliado. */
        DPR_MAX_CELULAR: 0.625
    }
};

document.querySelectorAll('[data-esfera]').forEach((c) => {
    montaEsfera(c, ESFERAS[c.dataset.esfera] || {});
});

// ============================================================
// SEÇÃO 2 — A ILUSTRAÇÃO: de uma mensagem a um painel
//
// A cena é uma frase só: você registra uma coisa e ela vira sistema.
//
// São TRÊS ATOS em fila no mesmo palco, e A FILA DÁ A VOLTA: terminado o
// ato 3, a cena vira pro ato 1 de novo, pela mesma virada que liga
// qualquer par. O ato 1 é um gasto — a lata, a categoria, o gráfico do
// mês. O ato 2 é um compromisso — a semana, o encaixe das 15h, a lista do
// que foi feito sozinho. O ato 3 é uma tarefa — a fila cheia, o lugar que
// se abre no topo, o prazo. Dinheiro, tempo e trabalho: a seção promete
// que você registra o que quiser, e um exemplo só entregava um terço
// disso.
//
// A VOLTA PRO ATO 1 É A ÚNICA QUE PRECISA DE CUIDADO, e ela já derrubou o
// looping uma vez. O objeto do ato 1 é uma foto, e uma foto que passa dois
// atos inteiros fora do layout (display:none) tem o bitmap decodificado
// descartado pelo navegador. Os primeiros quadros do retorno saíam com a
// lata pela metade dentro do clarão, com o fundo quase preto do cartão à
// mostra — o retângulo preto atrás da barra.
//
// O que existia antes era um pedido de decode disparado no começo da
// virada, pra dar vantagem pro navegador. Vantagem não é garantia: era
// uma corrida entre o decode e o relógio, e quando a máquina estava
// ocupada o relógio ganhava. Agora o objeto do ato que entra NÃO É
// REVELADO até a promessa do decode resolver — quem tem foto declara
// 'foto: true' na fila, e é só esse ato que espera. O tempo da espera
// acontece com a peça já trocada e ainda em opacidade zero, dentro do
// clarão: no pior caso o borrão se forma até 600ms mais tarde, no lugar
// onde ele ia se formar de todo jeito. Trocar meio segundo de atraso num
// borrão por um retângulo preto é a troca certa, e a abertura fria
// sempre fez exatamente isso.
//
// O que troca entre os atos é o data-ato do .flow, e mais nada: o CSS
// tira de cena tudo que é do outro ato. A troca acontece com o palco
// vazio, dentro da janela muda, então ela não tem quadro nenhum.
//
// O que o CSS faz é desenhar estados; o tempo mora todo aqui. Cada marca
// abaixo é o instante em que a cena troca de fase, contado do começo do
// ato. As fases se acumulam — a cena nunca volta atrás no meio de um ato
// —, e quem zera tudo é a abertura fria, que agora só acontece quando a
// seção entra na tela.
// ============================================================
setTimeout( () => {
    const flow = document.getElementById('promiseFlow');
    const alvo = document.getElementById('flowText');
    if (!flow || !alvo) return;

    /* Os três casos. A frase de cada ato é curta de propósito: o ponto da
       peça é a distância entre o que você diz e o que aparece pronto, e
       essa distância só é visível se o que você diz for pouco.

       'marca' é o instante, contado da saída da mensagem, em que a coisa
       registrada TOMA LUGAR: no ato 2 o compromisso se encaixa no vão das
       15h, no ato 3 a tarefa nova é preenchida no topo da fila. O ato 1
       não tem, porque um gasto não ocupa lugar nenhum.

       'fim' é quanto tempo o painel daquele ato leva pra terminar de se
       escrever, contado de 'is-info'. O ato 1 fecha na última barra do
       gráfico (0,68 de espera mais 1s de corrida); os atos 2 e 3 fecham
       na leitura do assessor, que só entra depois dos vistos (1,38 mais
       1s) — o painel dos dois é o mesmo, então o número também é. Com a
       fila dando a volta, TODOS OS TRÊS são lidos: é o 'fim' que garante
       que a cena fique montada o tempo de ser lida antes de se recolher.
       Mexeu na coreografia do painel, confere estes números.

       'foto' marca o ato cujo objeto é uma imagem, e não desenho. É a
       bandeira que faz a virada esperar o decode antes de revelar o
       objeto — explicado no cabeçalho. Só o ato 1 tem. */
    const ATOS = [
        { ato: '1', msg: 'Paguei 7,50 numa Coca-Cola',     fim: 1680, foto: true },
        { ato: '2', msg: 'Reunião com a Ana quinta 15h',   fim: 2380, marca: 720 },
        { ato: '3', msg: 'Preciso pagar o IPVA até sexta', fim: 2380, marca: 720 }
    ];

    /* Quanto tempo um ato fica montado e imóvel antes de virar o
       seguinte. O painel não chega pronto: ele se escreve em três
       batidas e o olho vai lendo enquanto isso — são 1,7s de leitura no
       ato 1 ANTES desta conta começar. Por isso a parada é releitura, e
       não leitura, e 2s bastam. Vale pros três, inclusive pro ato 3, que
       agora também vira. */
    const PARADA = 2000;

    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Toda classe que a cena acende precisa estar aqui — é esta lista
       que zera o palco na abertura fria. */
    const FASES = ['is-in', 'is-open', 'is-typing', 'is-armed', 'is-aiming',
                   'is-clicking', 'is-sent', 'is-mark', 'is-phone', 'is-info',
                   'is-saindo', 'is-luz', 'is-virando', 'is-descendo',
                   'is-apagando'];

    let timers = [];
    const daqui = (ms, fn) => timers.push(setTimeout(fn, ms));
    const limpa = () => { timers.forEach(clearTimeout); timers = []; };
    const liga  = (...cs) => cs.forEach((c) => flow.classList.add(c));
    const apaga = (...cs) => cs.forEach((c) => flow.classList.remove(c));

    const POR_LETRA = 27;

    /* Apagar é mais rápido que escrever, como é na mão de qualquer um:
       ninguém apaga uma frase letra por letra no mesmo ritmo em que a
       escreveu — segura o backspace. */
    const POR_LETRA_VOLTA = 13;

    /* Só uma coisa escreve no campo por vez. Apagar e digitar são
       vizinhos de 250ms na virada, e os dois andam em passos de
       cronômetro: basta a aba ser estrangulada, ou a máquina engasgar,
       pra que o apagamento da frase velha ainda esteja rodando quando a
       nova começar a ser escrita — e aí os dois comem letra um do outro.
       Cada escrita pega um número; quem não tem o número da vez para. */
    let escrita = 0;

    function digita(texto, fim) {
        const meu = ++escrita;
        let i = 0;
        const passo = () => {
            if (meu !== escrita) return;
            i += 1;
            alvo.textContent = texto.slice(0, i);
            if (i < texto.length) daqui(POR_LETRA, passo);
            else fim();
        };
        passo();
    }

    function desdigita(fim) {
        const meu = ++escrita;
        const passo = () => {
            if (meu !== escrita) return;
            const t = alvo.textContent;
            if (!t) { fim(); return; }
            alvo.textContent = t.slice(0, -1);
            daqui(POR_LETRA_VOLTA, passo);
        };
        passo();
    }

    let rodando = false;
    let visivel = false;
    let atual = 0;

    /* ABERTURA FRIA. Só acontece duas vezes: no primeiro ciclo e quando a
       seção volta pra tela depois de ter saído. Aqui a barra NASCE — o
       ponto que cresce e se estica pros dois lados. Entre um ato e outro
       ela não nasce de novo, porque não morre: a virada devolve o balão
       ao formato de barra e a frase seguinte é escrita na mesma peça. O
       nascimento é a abertura da peça, não uma batida que se repete. */
    function abre(i) {
        limpa();

        /* Rearma o palco num quadro mudo. Tirar as classes do ciclo
           anterior devolve barra, lata e legenda ao estado inicial — e
           com as transições ligadas isso seria uma rebobinada de 850ms
           antes de a cena começar. A janela muda aplica o estado inicial
           de uma vez; as transições voltam antes de 'is-in', que é o que
           precisa animar. */
        flow.classList.add('is-mudo');
        FASES.forEach((c) => flow.classList.remove(c));
        flow.dataset.ato = ATOS[i].ato;
        alvo.textContent = '';
        void flow.offsetWidth;          // assenta o estado inicial sem animar
        flow.classList.remove('is-mudo');
        void flow.offsetWidth;          // e devolve as transições

        liga('is-in');                                  // o objeto e a barra nascem
        daqui(240,  () => liga('is-open'));             // a barra se estica pros dois lados
        daqui(1120, () => escreve(i));
    }

    /* A frase. É por aqui que a virada entra no ato seguinte — sem
       rearmar nada, com a barra já aberta de onde ela parou. */
    function escreve(i) {
        atual = i;

        /* O 'is-apagando' morre AQUI, e não no fim do desdigita. Quem
           apaga a frase velha pode ser cancelado no meio pelo token de
           escrita — é justamente pra isso que o token existe — e um
           passo cancelado não chama o callback dele. Numa aba
           estrangulada dava pra ver o resultado: o cursor piscando pelo
           ato inteiro seguinte. Começar a escrever é a definição de não
           estar mais apagando; então é a escrita que desliga. */
        apaga('is-apagando');
        liga('is-typing');
        daqui(40, () => digita(ATOS[i].msg, () => corpo(i)));
    }

    function corpo(i) {
        const cena = ATOS[i];

        // Escrita a mensagem, o botão acende e o cursor vem buscá-lo.
        apaga('is-typing');
        liga('is-armed');
        daqui(140,  () => liga('is-aiming'));
        daqui(1000, () => liga('is-clicking'));

        daqui(1230, () => {
            apaga('is-clicking');
            liga('is-sent');       // vira balão e a lata entra em foco
        });

        /* O lugar sendo tomado: o encaixe das 15h no ato 2, a tarefa
           preenchida no topo da fila no ato 3. Vem 720ms depois da
           mensagem sair, no meio do caminho entre o lugar ser riscado em
           pontilhado (is-sent + 350) e o aparelho começar a subir (2350):
           é o único momento da volta em que o objeto está nítido, grande
           e sozinho no quadro. Depois disso ele vira o topo de uma tela
           de celular. */
        if (cena.marca) daqui(1230 + cena.marca, () => liga('is-mark'));

        /* O painel começa a se abrir antes de o aparelho terminar de
           subir: em fila indiana sobrava meio segundo de tela vazia
           justo onde o olho está esperando a resposta. */
        daqui(2350, () => liga('is-phone'));   // o aparelho sobe por trás
        daqui(3000, () => liga('is-info'));    // e o painel se abre

        /* A cena fica montada, e então se recolhe pra virar o próximo ato.
           O RESTO DA DIVISÃO É O LOOPING: depois do último a fila volta
           pro primeiro, e a peça roda enquanto a seção estiver na tela.

           Não existe caso especial pra volta ao ato 1 aqui. Ela é uma
           virada como as outras — quem cuida da foto é a espera pelo
           decode dentro do vira(), e é lá que ela mora justamente pra
           esta linha não precisar saber de nada disso. */
        daqui(3000 + cena.fim + PARADA, () => vira((i + 1) % ATOS.length));
    }

    /* A VIRADA. DOIS VETORES QUE SE CRUZAM DENTRO DA LUZ.

       A cena não cai mais. Ela se esvazia PRA CIMA — o painel se apaga de
       baixo pra cima e o registro sobe atrás dele, recuando pra dentro da
       tela — enquanto o balão DESCE pro meio do quadro e vira campo de
       comando outra vez. Sobe o assunto, desce a causa, e os dois se
       cruzam na altura do clarão, que é onde o assunto é trocado.

       O CLARÃO É O MECANISMO, e não mais um efeito de fundo. Ele chega
       120ms antes de qualquer peça se mexer, acende um miolo quente e
       cobre as duas coisas que ninguém precisa ver: a saída do aparelho e
       a emenda dos atos. Depois assenta devagar e vai revelando o objeto
       do ato novo, que a essa altura já está lá. É a mesma coisa que a
       abertura fria faz — lá o objeto nasce dentro da luz, aqui ele é
       trocado dentro dela.

       O APARELHO NÃO É MAIS UM ACONTECIMENTO. Ele continua descendo os
       580px, porque é lá embaixo que ele precisa estar pra subir de novo,
       mas a opacidade morre no primeiro terço do curso: some por volta
       dos 90px, debaixo do pico da luz, e faz o resto da viagem
       invisível. A versão anterior descia com ele opaco e inteiro, e o
       quadro virava um celular afundando num palco vazio.

       É a MESMA virada pros três pares, inclusive pro que fecha a volta.
       Só uma coisa distingue a chegada no ato 1: o objeto dele é uma foto,
       e a revelação dela espera o decode. O resto da coreografia é igual,
       o que é o ponto — se a volta pro começo precisasse de um caminho
       próprio, ela seria outra animação colada no fim desta. */
    function vira(prox) {
        /* AQUECIMENTO. Pedido solto, sem ninguém esperando por ele, só pra
           o navegador começar a decodificar enquanto a cena ainda está se
           recolhendo. Quem garante é o pedido lá embaixo, aos 680. */
        if (ATOS[prox].foto) fotoPronta();

        /* UMA CLASSE SÓ E TRÊS COISAS COMEÇAM. O 'is-saindo' dispara o
           painel se apagando de baixo pra cima, a legenda fechando pelo
           corte que a abriu (aos 80, porque ela precisa sumir antes de o
           objeto virar borrão) e os 8px de antecipação do balão. As três
           são escalonadas dentro do CSS, e não aqui: são gestos de uma
           mesma batida, e separá-los em cronômetros só criaria a chance
           de eles se desencontrarem numa aba estrangulada.

           O cursor e o botão precisam ser desarmados JÁ: enquanto
           'is-sent' segurava o cursor fora do quadro, 'is-aiming' ficava
           pendurado sem efeito — na hora em que o balão soltar o
           'is-sent', ele traria a seta de volta pro meio da tela. */
        liga('is-saindo');
        apaga('is-info', 'is-armed', 'is-aiming');

        /* A LUZ CHEGA PRIMEIRO, e essa ordem é a coisa toda. Se ela
           acendesse junto com a saída das peças, seria um brilho
           acompanhando uma transição; chegando antes, é ela que causa a
           transição — o quadro clareia e o que estava lá se desfaz dentro
           dela.

           120ms é o quanto o painel precisa pra ter começado a se fechar.
           Antes disso a luz sobe em cima de uma cena ainda inteira e lê
           como um flash sem motivo. */
        daqui(120, () => liga('is-luz'));

        /* A PARTIDA DOS DOIS VETORES, no mesmo instante e em direções
           opostas: o registro recua pra cima e se dissolve, o aparelho se
           dissolve e desce, o balão desce pro centro alargando na viagem.

           200 e não 420: a partida entra DEBAIXO do apagamento do painel,
           que termina aos ~540. Com 420 a cena tinha três tempos — apaga,
           espera, sai — e a espera lia como hesitação. Aos 200 o fim do
           apagamento acontece numa cena que já está cedendo, e as duas
           coisas viram um gesto só.

           O 'is-mark' NÃO cai aqui, e isso mudou. Ele acende o encaixe das
           15h e a tarefa nova, e derrubá-lo no meio da saída fazia as duas
           peças voltarem pro estado pontilhado enquanto se dissolviam — um
           movimento a mais dentro de uma peça que já está indo embora.
           Agora ele só cai na troca, com a peça velha já em display:none.
           O que sai, sai do jeito que estava. */
        daqui(200, () => {
            apaga('is-sent', 'is-phone');
            liga('is-virando', 'is-descendo');
        });

        // A frase é apagada dentro da barra, enquanto ela ainda desce.
        daqui(430, () => {
            liga('is-apagando');
            desdigita(() => apaga('is-apagando'));
        });

        /* A TROCA, DENTRO DO PICO DA LUZ. Aos 620 o registro terminou de
           se dissolver há uns 20ms e o miolo do clarão está no alto há
           mais de 200: não existe quadro em que dê pra ver a emenda, e
           dessa vez não é porque o palco está vazio — é porque está
           coberto.

           O 'is-saindo' cai NESTA MESMA TAREFA, e não é coincidência: é
           ele que carrega a saída da peça que sai, e é aqui que essa peça
           vira display:none. As duas coisas acontecem no mesmo quadro,
           então a peça do ato novo nasce sem deslocamento nenhum. */
        daqui(620, () => {
            flow.dataset.ato = ATOS[prox].ato;
            atual = prox;
            apaga('is-saindo', 'is-mark');
        });

        /* O novo objeto se forma no clarão. Quem é desenho se forma na
           hora; quem é FOTO se forma quando o navegador garantir que tem
           bitmap pra desenhar.

           O PEDIDO QUE MANDA É ESTE, aos 680, e não o aquecimento lá em
           cima. A diferença entre os dois é o instante: aos 620 a troca de
           data-ato já aconteceu, então aqui a imagem voltou pra árvore de
           pintura, e o que o navegador decodificar agora é o que ele vai
           usar pra desenhar. O de cima é pedido com a peça ainda em
           display:none — ele adianta trabalho, mas não dá pra cobrar dele
           um bitmap guardado.

           A cena continua andando durante a espera: a barra pousa, abre e
           a frase seguinte é escrita no horário de sempre. O que atrasa é
           só a opacidade do borrão dentro do clarão, e agora ele atrasa
           dentro de uma luz forte, e não de uma névoa — o teto de 600ms do
           fotoPronta() cai bem no meio do assentamento da luz. */
        daqui(680, () => {
            if (!ATOS[prox].foto) { apaga('is-virando'); return; }
            fotoPronta().then(() => { if (rodando) apaga('is-virando'); });
        });

        /* A LUZ SÓ COMEÇA A BAIXAR DEPOIS DO OBJETO TER NASCIDO. São 40ms
           de folga, e eles são o que separa "a luz apagou e apareceu uma
           coisa" de "a luz saiu de cima de uma coisa que já estava lá". A
           segunda leitura é a que a cena quer, e ela custa esses 40ms.

           A descida é lenta de propósito: a volta ao repouso usa a
           transição base do clarão, de 0,7s e 0,9s, contra os 0,28 da
           subida. Estalo rápido, assentamento longo. */
        daqui(720, () => apaga('is-luz'));

        /* A curva de saída só vale pra esta descida. Solta depois que o
           aparelho terminou de descer (200 + 880) e muito antes de o
           próximo 'is-phone' subir ele de novo, que é quem precisa da
           curva de chegada de volta. Nesse intervalo a opacidade dele
           volta pra 1 com o aparelho já fora da máscara. */
        daqui(1120, () => apaga('is-descendo'));

        /* A frase seguinte espera a barra TERMINAR de abrir: a largura
           fecha aos 920 (200 + 100 de espera + 620) e digitar em cima de
           uma barra crescendo empurraria o texto pro lado letra por letra.

           Os 220ms que sobram entre uma coisa e outra são de propósito, e
           são o único lugar da virada em que a cena fica parada: a barra
           aberta e vazia, com o assunto novo emergindo do clarão que
           assenta. É a respiração entre um ato e outro. Antes esse lugar
           tinha 600ms de névoa cinza sem nada dentro, que é uma coisa bem
           diferente de uma pausa. */
        daqui(1140, () => escreve(prox));
    }

    /* Sem animação: a cena fica montada no fim, que é o estado que ela
       existe pra mostrar. Fica no ato 1 — sem movimento não há como
       alternar sem que a troca vire um piscar de conteúdo. */
    if (calmo) {
        flow.dataset.ato = ATOS[0].ato;
        alvo.textContent = ATOS[0].msg;
        liga('is-in', 'is-open', 'is-sent', 'is-mark', 'is-phone', 'is-info');
        return;
    }

    /* A cena não começa antes da foto estar decodificada. Sem isso, numa
       conexão lenta a lata entra em cena no meio da viagem dela — ou não
       entra: o primeiro quadro em que ela aparece já é o da miniatura,
       reduzida a 43%, e o navegador simplesmente não desenha nada ali.
       Custa uma promessa e tira uma classe inteira de falha.

       MAS COM UM PRAZO. decode() não promete resolver rápido: ele resolve
       quando o navegador decodifica, e navegador nenhum decodifica
       imagem de aba que não está sendo pintada. Numa aba escondida a
       promessa fica pendurada mesmo com a imagem inteira baixada
       (complete=true, naturalWidth=440) — dá pra reproduzir. E como
       'rodando' já foi marcado antes do then, a cena não só não começa:
       ela não começa mais nunca, porque acorda() passa a sair na
       primeira linha. A seção fica preta pra sempre.

       600ms é o teto. Se o decode não veio até lá, a cena começa assim
       mesmo — um primeiro quadro sem a lata é um problema pequeno perto
       de uma ilustração que nunca toca.

       E ELE É UMA FUNÇÃO, e não um pedido único na carga, porque É
       CHAMADO EM DOIS LUGARES: em toda abertura fria e em toda virada que
       entra num ato com foto. O objeto do ato dormente sai do layout
       inteiro (display:none), e uma imagem que passa um tempo fora da
       árvore de pintura tem o bitmap decodificado descartado pelo
       navegador. Sem o pedido sobra o fundo do .reg-photo, que é quase
       preto, desfocado dentro do clarão, e lê como um retângulo preto por
       cima da foto. Era esse descarte que tinha levado o looping embora, e
       é ele que os dois chamadores existem pra cobrir: a abertura cobre
       quem volta pra seção, a virada cobre a volta da fila. */
    const foto = flow.querySelector('.reg-photo img');

    function fotoPronta() {
        if (!foto || !foto.decode) return Promise.resolve();
        return Promise.race([
            foto.decode().catch(() => {}),
            new Promise((pronto) => setTimeout(pronto, 600))
        ]);
    }

    /* Retoma do ato em que parou, e não do começo: quem sai da seção no
       meio do ato 2 e volta não deveria ver o ato 1 de novo como se
       nunca tivesse chegado até ali. Aqui é abertura fria — o palco
       ficou parado num quadro qualquer e precisa ser rearmado.

       O 'ciclo' É O QUE IMPEDE DUAS ABERTURAS DE SE ATROPELAREM. Entre o
       acorda() e o abre() existe uma promessa — o decode da foto, com teto
       de 600ms — e 'rodando' sozinho não distingue QUEM ligou a cena. Duas
       entradas seguidas na tela (um scroll que sobe e desce, uma aba que
       volta em cima do observador disparando) deixam duas promessas
       pendentes; a primeira abre o ato, e a segunda abre de novo meio
       segundo depois, com o palco rearmado no meio da frase sendo escrita.
       Dá pra ver: a barra volta a nascer do ponto. Cada chamada leva um
       número, e quem não tem o número da vez desiste — a mesma trava que a
       escrita já usava. */
    let ciclo = 0;

    function acorda() {
        if (rodando || !visivel || document.hidden) return;
        rodando = true;
        const meu = ++ciclo;
        fotoPronta().then(() => { if (rodando && meu === ciclo) abre(atual); });
    }

    function dorme() {
        if (!rodando) return;
        rodando = false;
        ciclo += 1;
        limpa();
    }

    /* O gatilho é O PALCO, não a seção inteira. No celular a seção tem
       ~936px e 35% dela é só o título: a volta começava com o aparelho
       ainda abaixo da dobra e o usuário chegava nela pelo meio, sem ter
       visto o que estava sendo registrado.

       E o observador fica de pé em vez de se desconectar no primeiro
       disparo: fora da tela a volta PARA. Antes ela rodava pra sempre a
       partir do primeiro encontro — cronômetros, transições, o vaivém de
       26s e um backdrop-filter sendo reamostrado — mesmo com a seção a
       três telas de distância.

       Dois limiares: entra em 0,4 (tem ilustração suficiente na tela pra
       cena valer a pena) e só para quando sai inteiro, pra não congelar
       um quadro no meio com o aparelho ainda à vista. */
    const palco = document.querySelector('.promise-stage');
    if (palco && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.intersectionRatio >= 0.4) { visivel = true;  acorda(); }
                else if (!entry.isIntersecting)     { visivel = false; dorme();  }
            });
        }, { threshold: [0, 0.4] });
        io.observe(palco);
    } else {
        visivel = true;
        acorda();
    }

    // Aba escondida não precisa de ciclo rodando; ao voltar, recomeça a
    // volta atual do zero em vez de emendar no meio dela.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) dorme();
        else acorda();
    });
});

/* =========================================================
   SEÇÃO 4 — O CARTÃO BLACK (card 1 do Open Finance)
   =========================================================
   O balanço de repouso é todo CSS. Aqui moram só as duas partes
   que CSS não faz:

   1. O OBSERVADOR. A animação nasce pausada na folha e este
      observador liga a classe .of-vivo quando o card entra na
      tela — fora dela o cartão para, o mesmo contrato de custo
      das esferas e do aparelho da seção 3.
   2. A MÃO NO CARTÃO. Só desktop com ponteiro fino, nunca com
      prefers-reduced-motion. São duas coisas no mesmo gesto: o
      balanço automático para e a inclinação passa a ser do
      ponteiro. A mão move a POSE, e só ela: nenhuma luz acende
      debaixo do ponteiro, porque o cartão já tem a luz que tem e
      acender mais em cima dela é efeito, não objeto. A inclinação
      mora no invólucro .ofc-tilt, separado do balanço: o alvo segue
      o ponteiro e o cartão persegue o alvo com lerp em rAF — sem
      transition de CSS, que brigaria com a soma dos transforms.
      O rAF só roda enquanto há distância a percorrer; parado no
      alvo, o loop se desliga sozinho.

   Uma regra atravessa tudo aqui: o quadro a quadro só escreve
   TRANSFORM, nunca cor, posição ou tamanho. É o que mantém o rosto
   do cartão rasterizado uma vez só — a mesma disciplina que tirou o
   chuvisco de repintura da superfície. */
setTimeout( () => {
    const card = document.getElementById('ofCardCartao');
    if (!card) return;

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => card.classList.toggle('of-vivo', e.isIntersecting));
        }, { threshold: 0.15 });
        io.observe(card);
    } else {
        card.classList.add('of-vivo');
    }

    const tilt   = card.querySelector('.ofc-tilt');
    const palco  = card.querySelector('.of-stage-cartao');
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!tilt || !palco || calmo || !fino) return;

    let alvoX = 0, alvoY = 0;
    let rx = 0, ry = 0, raf = 0, t0 = 0;

    /* A perseguição é por TEMPO, não por quadro. Com o fator fixo de
       0,08 por quadro a mesma inclinação chegava ao alvo no dobro da
       velocidade num monitor de 120Hz — o gesto mudava de mão conforme
       a tela. Aqui o fator se converte para quantos quadros de 60Hz
       couberam no intervalo real, e o movimento fica igual em qualquer
       taxa. O teto de 4 evita o salto quando a aba volta do segundo
       plano com um intervalo enorme acumulado. */
    function passo(agora) {
        const quadros = t0 ? Math.min((agora - t0) / 16.667, 4) : 1;
        t0 = agora;
        const k = 1 - Math.pow(1 - 0.08, quadros);
        rx += (alvoX - rx) * k;
        ry += (alvoY - ry) * k;
        tilt.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        const resta = Math.abs(alvoX - rx) + Math.abs(alvoY - ry);
        if (resta > 0.05) {
            raf = requestAnimationFrame(passo);
        } else {
            raf = 0;
            t0 = 0;
        }
    }
    const acorda = () => { if (!raf) { t0 = 0; raf = requestAnimationFrame(passo); } };

    /* QUEM ESCUTA E CONTRA O QUE SE MEDE são coisas diferentes, e é essa
       separação que faz o gesto responder. Escuta o card inteiro, para a
       inclinação já existir antes de o ponteiro chegar no cartão. Mas
       mede contra o PALCO, que é a área da ilustração: medir contra o
       card inteiro diluía o gesto num retângulo alto demais, e o cartão
       mal saía do lugar bem em cima dele. Fora do palco o valor satura
       no máximo em vez de continuar crescendo.

       ±22° em Y e ±15° em X somam com o balanço congelado (até 24°) no
       pior caso ~46°, que a perspectiva de 1300px ainda segura sem
       entortar as bordas retas. */
    const trava = (v) => (v < -1 ? -1 : v > 1 ? 1 : v);

    /* O retângulo fica guardado. Medi-lo dentro do pointermove obrigava
       o navegador a recalcular o layout dezenas de vezes por segundo, e
       no mesmo quadro em que o rAF escrevia o transform — ler logo
       depois de escrever é o que engasga. Ele só se remede quando
       rolagem ou redimensionamento realmente o moveram. */
    let ret = null;
    const invalida = () => { ret = null; };
    window.addEventListener('resize', invalida, { passive: true });
    window.addEventListener('scroll', invalida, { passive: true });

    card.addEventListener('pointerenter', () => card.classList.add('of-namao'));

    card.addEventListener('pointermove', (ev) => {
        if (!ret) ret = palco.getBoundingClientRect();
        const nx = trava(((ev.clientX - ret.left) / ret.width  - 0.5) * 2);
        const ny = trava(((ev.clientY - ret.top)  / ret.height - 0.5) * 2);
        alvoY  =  nx * 22;
        alvoX  = -ny * 15;
        acorda();
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
        card.classList.remove('of-namao');
        alvoX = 0; alvoY = 0;
        acorda();
    });
});

/* =========================================================
   O CAMINHO DO GASTO (card 2 do Open Finance)
   =========================================================
   O desenho todo é CSS; aqui mora só o RELÓGIO. Cada marca abaixo é o
   instante em que a cena troca de fase, contado do começo do ciclo, e
   as fases SE ACUMULAM: a cena nunca volta atrás no meio de uma volta.
   Quem zera tudo é o religamento, num quadro mudo, e ele só acontece
   quando o card está na tela.

   Onde os números foram escolhidos, e não chutados:

   • REGISTRO → PAINEL são 1,4s porque é o tempo de LER a notificação.
     Ela só termina de se montar 640ms depois de nascer (a moldura
     leva 660ms, o texto entra 260ms atrasado), e o que sobra depois
     disso é a leitura de verdade. Encurtar aqui apaga o ato 2
     inteiro: a linha do banco passa e ninguém vê o lixo em caixa alta
     que é o assunto dela.
   • DEPOIS DO PAINEL NÃO EXISTE MAIS COREOGRAFIA DE PEÇAS, e isso é
     decisão do dono do site, não preguiça: a notificação entra na
     fatura DO JEITO QUE ESTÁ, sem rolar lista, sem derreter moldura,
     sem acender fio. O corte descobre um painel onde tudo já mora no
     lugar — o encaixe é de layout, não de movimento — e o que resta
     de vida na cena são as três fitas de texto.
   • PAINEL → TOTAL são 740ms: o corte termina AOS OLHOS aos ~465 da
     abertura (95% da curva de 620) e o total espera mais uma
     respiração antes de rolar. A fatura reconhece o que tem dentro
     depois de terminar de aparecer, nunca enquanto ainda se abre.
   • TOTAL → NOME → CATEGORIA mantêm a cascata de 360/240ms: a ordem é
     a da causa — o gasto pesou no total, o nome se resolveu, a
     categoria arquivou.
   • A PARADA de 2,6s no fim é releitura, não leitura. O painel se
     escreveu em cascata e o olho foi lendo enquanto isso.
   ========================================================= */
setTimeout( () => {
    const cena = document.getElementById('ofgCena');
    const card = document.getElementById('ofCardOrg');
    if (!cena || !card) return;

    /* Toda classe que a cena acende precisa estar aqui — é esta lista
       que zera o palco no religamento. */
    const FASES = ['is-in', 'is-perto', 'is-tap', 'is-ok', 'is-registro',
                   'is-painel', 'is-total', 'is-nome', 'is-cat', 'is-saindo'];

    /* A linha do tempo de uma volta, em ms desde o começo dela. */
    const MARCAS = [
        [   0, 'is-in'],        // a maquininha sobe e o cartão desce
        [ 700, 'is-perto'],     // o cartão desce os 22px do toque
        [1000, 'is-tap'],       // as ondas disparam e a tela estala
        [1300, 'is-ok'],        // aprovado, e o cartão recua
        [2200, 'is-registro'],  // a maquininha afunda; a notificação nasce dela
        [3600, 'is-painel'],    // o dashboard se abre em volta da notificação
        [4340, 'is-total'],     // o total da fatura rola
        [4700, 'is-nome'],      // o descritor cru vira "Sephora"
        [4940, 'is-cat'],       // e embaixo entra "Beleza"
        [7560, 'is-saindo']     // a fatura desce e leva o gasto junto
    ];

    const VOLTA = 8360;         // quando a próxima volta começa

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let relogios = [];
    let rodando = false;

    const limpa = () => { relogios.forEach(clearTimeout); relogios = []; };
    const daqui = (ms, fn) => relogios.push(setTimeout(fn, ms));

    function volta() {
        limpa();

        /* O religamento num quadro mudo. Tirar as classes da volta
           anterior devolve cartão, maquininha, fatura e comprovante ao
           estado inicial — e com as transições ligadas isso seria uma
           rebobinada de quase um segundo antes de a cena começar. */
        cena.classList.add('is-mudo');
        FASES.forEach((c) => cena.classList.remove(c));
        void cena.offsetWidth;              // assenta o estado inicial sem animar
        cena.classList.remove('is-mudo');
        void cena.offsetWidth;              // e devolve as transições

        MARCAS.forEach(([ms, classe]) => {
            if (ms === 0) { cena.classList.add(classe); return; }
            daqui(ms, () => cena.classList.add(classe));
        });

        daqui(VOLTA, volta);
    }

    function dorme() {
        rodando = false;
        limpa();
    }

    function acorda() {
        if (rodando || document.hidden) return;
        rodando = true;
        /* A cena não começa no instante em que aparece: o card entra,
           assenta, e só então a compra acontece. */
        cena.classList.add('is-mudo');
        FASES.forEach((c) => cena.classList.remove(c));
        void cena.offsetWidth;
        cena.classList.remove('is-mudo');
        daqui(700, volta);
    }

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? acorda() : dorme()));
        }, { threshold: 0.25 });
        io.observe(card);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { dorme(); return; }
        // Voltando para a aba, o observador não dispara de novo sozinho:
        // quem decide se a cena volta a rodar é a posição do card agora.
        const r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) acorda();
    });
});

/* =========================================================
   O CAMINHO DA PERGUNTA (card 3 do Open Finance)
   =========================================================
   O desenho todo é CSS; aqui mora o RELÓGIO e a máquina de escrever.
   Cada marca é o instante em que a cena troca de fase e as fases SE
   ACUMULAM — a cena nunca volta atrás no meio de uma volta. Quem zera
   tudo é o religamento, num quadro mudo, e ele só acontece com o card
   na tela.

   A LINHA DO TEMPO TEM DOIS TRECHOS, e essa divisão importa. O primeiro
   vai até a frase estar escrita e é medido em LETRAS, não em
   milissegundos: quem chama o resto é o fim da digitação, porque a
   frase pode mudar de tamanho e nenhum número abaixo deveria depender
   disso. O segundo é a volta inteira, contada do instante em que a
   frase ficou pronta.

   Onde os números foram escolhidos, e não chutados:

   • MIRA → TOQUE são 860ms, e não os 620 de antes: com a tela centrada
     a barra vazia descansa no meio do quadro e a subida do polegar
     passou de 76px pra 188. São os 740 da viagem (a duração é por
     distância, escrita no CSS) mais os 120 de folga entre chegar e
     bater.
   • ENVIO → DIGITANDO são 740ms, que são os 560 de nada de sempre mais
     os 180 que o balão agora leva pra pousar no vão. Os 560 são o
     assunto: é o tempo em que a mensagem já saiu e ninguém respondeu
     ainda. Zerado, a resposta parece automática, que é exatamente o que
     o card não quer dizer.
   • DIGITANDO → RESPOSTA são 820ms de pontinhos. Menos que isso e a
     pastilha some antes de ser lida como "digitando"; mais e a espera
     vira travamento.
   • RESPOSTA → VAGA são 700ms porque a frase tem que ser LIDA antes de
     o anexo chegar. Ela é o que explica o documento.
   • VAGA → RELATÓRIO são 460ms, que é a transição da vaga INTEIRA, e
     esse é o ponto: o documento pousa num vão que já parou de abrir.
     Nos 220 de antes o anexo chegava com a tela ainda se recentrando
     embaixo dele e o chip escorregava alguns pixels dentro da própria
     vaga. É a regra do card 2 — quando a peça pousa, o lugar dela já
     está no lugar.
   • TOQUE → ABERTO são 200ms: o corte só começa a crescer depois de o
     anel do toque ter saído do lugar. É a batida que faz a abertura ser
     consequência do dedo, e não coincidência com ele.
   • ABERTO → CONTEÚDO são 240ms, e não os 520 de antes. O corte leva
     640ms para chegar na moldura, e esperar ele terminar deixava meio
     segundo de painel vazio bem onde o olho foi buscar a resposta. Aos
     240 o cabeçalho do relatório já está entrando com a tela ainda
     crescendo, e a abertura passa a ser uma coisa só. É a mesma lição do
     painel da seção 3, que também começa a se escrever antes de o
     aparelho terminar de subir.
   • A PARADA de 3s no fim é releitura, não leitura: o relatório se
     escreveu em cascata e o olho foi lendo enquanto isso. Da abertura
     até a saída são ~3,8s de relatório em cena, que é o que quatro
     linhas e um gráfico pedem. A volta inteira fecha em ~12,6s, contra
     os 9,6 do card 2 — são quatro atos em vez de quatro batidas, e
     cortar aqui é cortar leitura.
   • A MÃO ANDA POR DISTÂNCIA, e é o CSS que cuida disso: 740ms nos
     188px até o botão, 640 nos 140px até o documento. O que este
     arquivo garante é a folga entre chegar e bater — 120ms na primeira,
     100 na segunda. Sem ela o anel dispara com o dedo ainda viajando.
   ========================================================= */
setTimeout( () => {
    const cena  = document.getElementById('ofrCena');
    const campo = document.getElementById('ofrTexto');
    const card  = document.getElementById('ofCardConversa');
    if (!cena || !campo || !card) return;

    const MSG = 'Quanto que eu tenho de gasto parcelado esse mês?';

    /* Toda classe que a cena acende precisa estar aqui — é esta lista
       que zera o palco no religamento. */
    const FASES = ['is-in', 'is-typing', 'is-armed', 'is-mira', 'is-toque',
                   'is-enviado', 'is-digitando', 'is-resposta', 'is-vaga',
                   'is-relatorio', 'is-mira2', 'is-toque2', 'is-aberto',
                   'is-conteudo', 'is-saindo'];

    /* As marcas do segundo trecho, contadas do fim da digitação. */
    const MARCAS = [
        [   0, 'is-armed'],      // o botão acende
        [ 140, 'is-mira'],       // o polegar sobe até ele
        [1000, 'is-toque'],      // a batida, com anel
        [1160, 'is-enviado'],    // a frase sai da barra e vira balão
        [1900, 'is-digitando'],  // a pastilha do Martin
        [2720, 'is-resposta'],   // a pastilha cresce e vira a resposta
        [3420, 'is-vaga'],       // a conversa abre lugar
        [3880, 'is-relatorio'],  // o documento pousa na vaga
        [4560, 'is-mira2'],      // o polegar volta, agora pro documento
        [5360, 'is-toque2'],     // a batida
        [5560, 'is-aberto'],     // o corte cresce até a tela inteira
        [5800, 'is-conteudo'],   // e o relatório se escreve em cascata
        [9360, 'is-saindo']      // a cena desce e se dissolve
    ];

    /* A saída leva 560ms, então isto deixa ~240ms de palco vazio entre
       uma volta e a outra. É respiro, e não pausa: passando muito disso
       o card fica um retângulo preto no meio de dois vizinhos animados,
       e lê como se tivesse desligado. */
    const VOLTA = 10160;         // quando a próxima volta começa

    const POR_LETRA = 26;        // o centro do compasso; cada tecla treme ±8 em volta dele
    const ANTES = 620;           // o ar entre a tela assentar e a frase

    /* Sem animação a cena fica montada na conversa inteira com o
       documento anexado, que é o que o título do card promete. O
       relatório aberto seria mais vistoso e diria outra coisa. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        campo.textContent = '';
        ['is-in', 'is-enviado', 'is-digitando', 'is-resposta',
         'is-vaga', 'is-relatorio'].forEach((c) => cena.classList.add(c));
        return;
    }

    let relogios = [];
    let rodando = false;

    const limpa = () => { relogios.forEach(clearTimeout); relogios = []; };
    const daqui = (ms, fn) => relogios.push(setTimeout(fn, ms));

    /* Só uma escrita por vez. A volta pode ser cortada no meio da frase
       por uma rolagem ou por uma aba que dorme, e sem o número da vez a
       digitação velha continuaria comendo letra da nova. */
    let escrita = 0;

    /* O CAMPO ROLA, e isso não é enfeite: a frase mede 264px e a caixa
       tem 251, então as duas últimas palavras ficariam fora. Encolher o
       tipo até caber resolveria hoje e quebraria na próxima frase — e
       campo de verdade não encolhe letra, ele empurra o texto pra
       esquerda e mantém o cursor à vista. É o que esta linha faz. */
    const caixa = campo.parentElement;

    function digita(fim) {
        const meu = ++escrita;
        let i = 0;
        const passo = () => {
            if (meu !== escrita) return;
            i += 1;
            campo.textContent = MSG.slice(0, i);
            caixa.scrollLeft = caixa.scrollWidth;
            /* 18 a 34ms, com média nos 26 do compasso: tecla em
               intervalo cravado lê como máquina, e o tremor de poucos
               ms é o que a mão acrescenta. Nenhuma marca depende
               disso — o segundo trecho conta a partir do fim. */
            if (i < MSG.length) daqui(POR_LETRA - 8 + Math.random() * 16, passo);
            else fim();
        };
        passo();
    }

    function corpo() {
        cena.classList.remove('is-typing');
        MARCAS.forEach(([ms, classe]) => {
            if (ms === 0) { cena.classList.add(classe); return; }
            daqui(ms, () => cena.classList.add(classe));
        });

        /* A barra fica vazia DEPOIS de a frase ter subido, nunca
           durante: quem apaga o texto no mesmo quadro do envio mostra a
           frase desaparecendo no lugar em vez de sair com a mensagem.
           220ms é o fim da subida de 'is-enviado'. */
        daqui(1380, () => { campo.textContent = ''; });

        /* Os dois toques ficariam pendurados pro resto da volta: o
           primeiro segura o botão branco e o dedo encolhido, o segundo
           segura o dedo encolhido em cima do relatório. */
        daqui(1160, () => cena.classList.remove('is-toque'));
        daqui(5560, () => cena.classList.remove('is-toque2'));

        daqui(VOLTA, volta);
    }

    function volta() {
        limpa();

        /* O religamento num quadro mudo. Tirar as classes da volta
           anterior devolve balões, documento e dedo ao estado inicial, e
           com as transições ligadas isso seria uma rebobinada de quase
           um segundo antes de a cena começar. */
        cena.classList.add('is-mudo');
        FASES.forEach((c) => cena.classList.remove(c));
        campo.textContent = '';
        escrita += 1;
        void cena.offsetWidth;              // assenta o estado inicial sem animar
        cena.classList.remove('is-mudo');
        void cena.offsetWidth;              // e devolve as transições

        cena.classList.add('is-in');
        daqui(ANTES, () => {
            cena.classList.add('is-typing');
            digita(corpo);
        });
    }

    function dorme() {
        rodando = false;
        escrita += 1;
        limpa();
    }

    function acorda() {
        if (rodando || document.hidden) return;
        rodando = true;
        /* A cena não começa no instante em que aparece: a tela entra,
           assenta, e só então a pessoa começa a escrever. */
        cena.classList.add('is-mudo');
        FASES.forEach((c) => cena.classList.remove(c));
        campo.textContent = '';
        void cena.offsetWidth;
        cena.classList.remove('is-mudo');
        daqui(300, volta);
    }

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? acorda() : dorme()));
        }, { threshold: 0.25 });
        io.observe(card);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { dorme(); return; }
        // Voltando pra aba, o observador não dispara de novo sozinho:
        // quem decide se a cena volta a rodar é a posição do card agora.
        const r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) acorda();
    });
});

/* =========================================================
   AS JANELAS DOS CARDS (detalhes do Open Finance)
   =========================================================
   Abrir e fechar é a parte fácil. O que exige cuidado é o teclado e o
   foco, porque uma janela que rouba a tela e deixa o foco na página
   atrás é uma armadilha para quem não usa mouse:

   1. AO ABRIR o foco vai para a caixa e a página atrás para de rolar.
   2. ENQUANTO ABERTA o Tab circula dentro da caixa. Sem isso o foco
      escapa para os links do rodapé, que estão invisíveis atrás do véu.
   3. AO FECHAR o foco VOLTA para o botão que abriu, para a pessoa não
      ser jogada de volta no topo do documento.

   Fecha de três jeitos, e os três precisam existir: o X, o véu e o Esc.

   A abertura acontece em dois tempos de propósito. Tirar o hidden e
   ligar a classe no mesmo quadro não anima nada, porque o elemento
   nasce já no estado final. O requestAnimationFrame separa os dois.

   O COMPORTAMENTO É UM SÓ E VALE PARA QUALQUER CARD QUE ABRA JANELA. O
   par botão/janela deixou de ser escrito à mão aqui dentro: quem diz
   qual janela um botão abre é o aria-controls dele, que já precisava
   existir para o leitor de tela. Card novo com porta no canto passa a
   funcionar sem tocar neste arquivo.

   A BUSCA É PELO CONTRATO DE ACESSIBILIDADE E NÃO PELA CLASSE, e ela
   mudou em 20/08/2026 para a frase acima virar verdade. O seletor era
   .of-abrir[aria-controls], ou seja, prometia funcionar com qualquer
   card novo mas só reconhecia porta que se chamasse como as do Open
   Finance. A porta da seção do expediente é .exp-abrir, porque a régua
   da casa manda peça nova nascer com prefixo próprio, e ela ficaria de
   fora por causa do nome.
   O par aria-haspopup mais aria-controls é o que TODA porta de janela
   precisa ter de qualquer jeito, por acessibilidade, então ele é a
   marca mais honesta de "isto abre uma janela" que existe no documento.
   Procurar por ele resolve o caso de hoje e o dos próximos prefixos.
   E ELE TAMBÉM É O INTERRUPTOR DAS PORTAS SEM DESTINO: porta que nasce
   sem aria-controls não é ligada aqui nem ganha cursor lá no CSS, e no
   dia em que a janela dela nascer o atributo entra no HTML e as duas
   coisas acendem juntas.
   FOI EXATAMENTE ISSO QUE ACONTECEU com os quatro cards restantes do
   expediente em 20/08/2026. As janelas deles nasceram, os quatro <span>
   viraram <button> com o par de atributos, e este arquivo não recebeu
   uma linha. É a prova de que a busca pelo contrato de acessibilidade
   valeu a pena: cinco cards, cinco janelas, um seletor. */
setTimeout( () => {
    document.querySelectorAll('[aria-haspopup="dialog"][aria-controls]').forEach((botao) => {
        const modal = document.getElementById(botao.getAttribute('aria-controls'));
        if (modal) ligaJanela(botao, modal);
    });
});

function ligaJanela(botao, modal) {
    const caixa = modal.querySelector('.of-modal-caixa');
    const corpo = modal.querySelector('.of-modal-corpo');
    const topo  = modal.querySelector('.of-modal-topo');
    const pe    = modal.querySelector('.of-modal-pe');
    const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let abertoPor = null;

    /* Os dois degradês das bordas do corpo são desenhados na caixa, que
       é quem não rola. Para saberem onde parar precisam da altura do
       topo e do pé, e essas alturas mudam com a quebra do título. Medir
       na abertura resolve os dois casos, o de janela redimensionada e o
       da fonte que chegou depois. */
    function mede() {
        if (!topo || !pe) return;
        caixa.style.setProperty('--of-modal-topo-h', topo.offsetHeight + 'px');
        caixa.style.setProperty('--of-modal-pe-h', pe.offsetHeight + 'px');
    }

    /* Só aparece o degradê do lado que tem conteúdo escondido. Os 2px de
       folga são para o arredondamento do zoom do navegador não deixar o
       degradê de baixo aceso numa janela que já chegou ao fim. */
    function bordas() {
        if (!corpo) return;
        const sobra = corpo.scrollHeight - corpo.clientHeight;
        caixa.classList.toggle('tem-acima', corpo.scrollTop > 2);
        caixa.classList.toggle('tem-abaixo', sobra > 2 && corpo.scrollTop < sobra - 2);
    }

    /* Quem abriu chega por parâmetro, não por document.activeElement:
       clique em botão nem sempre dá foco (o Safari no macOS não dá), e
       aí o foco não tinha para onde voltar no fechamento. */
    function abre(disparador) {
        abertoPor = disparador;
        modal.hidden = false;

        /* Travar a rolagem some com a barra da página, e o conteúdo de
           trás pula essa largura para o lado. Nos sistemas de barra
           sobreposta a conta dá zero e nada acontece. */
        const barra = window.innerWidth - document.documentElement.clientWidth;
        if (barra > 0) document.body.style.paddingRight = barra + 'px';
        document.body.classList.add('sem-rolagem');

        /* A janela sempre abre pelo começo da leitura, mesmo que a
           última visita tenha parado no meio. */
        if (corpo) corpo.scrollTop = 0;

        requestAnimationFrame(() => {
            modal.classList.add('of-modal-aberto');
            mede();
            bordas();
        });
        caixa.focus();
    }

    function fecha() {
        modal.classList.remove('of-modal-aberto');
        document.body.classList.remove('sem-rolagem');
        document.body.style.paddingRight = '';
        /* O hidden espera a saída terminar, senão a janela some de
           estalo em vez de se apagar. */
        const some = () => { modal.hidden = true; };
        const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (calmo) some(); else setTimeout(some, 280);
        if (abertoPor) abertoPor.focus();
        abertoPor = null;
    }

    if (corpo) corpo.addEventListener('scroll', bordas, { passive: true });

    window.addEventListener('resize', () => {
        if (modal.hidden) return;
        mede();
        bordas();
    }, { passive: true });

    botao.addEventListener('click', () => abre(botao));

    modal.querySelectorAll('[data-fechar]').forEach((el) => {
        el.addEventListener('click', fecha);
    });

    document.addEventListener('keydown', (ev) => {
        if (modal.hidden) return;

        if (ev.key === 'Escape') {
            fecha();
            return;
        }

        if (ev.key !== 'Tab') return;

        const lista = [...caixa.querySelectorAll(FOCAVEIS)].filter((el) => el.offsetParent !== null);
        if (!lista.length) return;
        const primeiro = lista[0];
        const ultimo = lista[lista.length - 1];

        /* Vindo da caixa (que tem tabindex -1) o Tab cairia fora dela,
           então o primeiro salto é forçado para dentro. */
        if (document.activeElement === caixa && !ev.shiftKey) {
            ev.preventDefault();
            primeiro.focus();
        } else if (ev.shiftKey && document.activeElement === primeiro) {
            ev.preventDefault();
            ultimo.focus();
        } else if (!ev.shiftKey && document.activeElement === ultimo) {
            ev.preventDefault();
            primeiro.focus();
        }
    });
}


/* ============================================================
   CABEÇALHO SOBRE SEÇÃO CLARA
   ============================================================
   O QUE ISTO RESOLVE. A home é preta e o cabeçalho foi desenhado para
   ela: vidro escuro, tinta clara, ação de borda vazada. A home tem uma
   banda branca de ponta a ponta (a seção da agenda), e quando a rolagem
   leva a faixa do header para cima dela o cabeçalho lava, com texto
   branco sobre branco. Este bloco só liga e desliga a classe
   .is-sobre-claro no header. O desenho do estado claro está no
   style.css, no bloco "O CABEÇALHO SOBRE UMA SEÇÃO CLARA", e é copiado
   das subpáginas claras do site em vez de inventado aqui.

   A REGRA DO INTERRUPTOR, em uma frase: escurece cedo e volta tarde.
   O header é um vidro de branco a 72%, então o estado claro se sustenta
   até mesmo com preto por baixo (o vidro clareia o fundo o suficiente
   para a tinta escura ler). O contrário é que não existe: tinta branca
   em cima de branco não tem salvação. Então o estado claro entra assim
   que a faixa do header encosta no branco e só sai quando o branco
   deixa a faixa por inteiro. O momento ruim da troca fica sempre do
   lado que ainda dá para ler.

   POR QUE NÃO IntersectionObserver. O gatilho não é "a seção apareceu
   na tela", é "a seção está debaixo da FAIXA do header", que vai de
   24px a 84px do topo da janela. Para um observer ler essa faixa o
   rootMargin precisaria ser -24px em cima e -(altura da janela - 84px)
   embaixo, que é um valor que muda a cada redimensionamento e obriga a
   destruir e recriar o observer. E mesmo com ele montado, saber de que
   lado a fronteira foi cruzada exige medir o retângulo de novo. Então
   medir direto sai mais curto e mais exato: um getBoundingClientRect
   por seção marcada, uma vez por quadro, com pedido de quadro agrupado.

   COMO SE ESTENDE. O script observa QUALQUER elemento com
   data-header="claro". A próxima seção clara da home só precisa do
   atributo na raiz dela e herda o comportamento sem uma linha nova
   aqui. É por isso que a marca é atributo e não o nome da classe da
   seção: o interruptor não precisa saber que seção é essa.
   ============================================================ */
setTimeout( () => {
    const header = document.querySelector('.glass-header');
    const claras = [...document.querySelectorAll('[data-header="claro"]')];
    if (!header || !claras.length) return;

    /* A FAIXA DO HEADER, em coordenadas de janela. Ele é fixo, então
       offsetTop devolve o próprio top do CSS (24px na home) e
       offsetHeight a altura (60px), os dois imunes ao translate que a
       animação de entrada aplica e ao translateX(-50%) permanente. Ler
       do elemento em vez de escrever 24 e 84 na mão é o que faz a conta
       continuar certa se um dia um breakpoint baixar o header. */
    let faixaTopo = 0;
    let faixaBase = 0;

    function medirFaixa() {
        faixaTopo = header.offsetTop;
        faixaBase = faixaTopo + header.offsetHeight;
    }

    /* HISTERESE. Dois limites em vez de um, porque um só faz o estado
       tremer quando a rolagem para exatamente na fronteira (rolagem por
       trackpad chega a oscilar meio pixel parada). Liga com 6px de
       branco debaixo da faixa e desliga quando não sobra nenhum. A zona
       morta de 6px é curta de propósito: ela existe contra a tremida,
       não para atrasar a troca. */
    const LIGA = 6;
    const DESLIGA = 0;

    let claro = false;

    function avaliar() {
        medirFaixa();

        /* Quanto de seção clara há debaixo da faixa do header. Vale a
           maior sobreposição entre as seções marcadas, porque duas
           bandas claras podem se encontrar embaixo do header em algum
           layout futuro. */
        let sobreposicao = 0;
        for (const secao of claras) {
            const r = secao.getBoundingClientRect();
            const alto = Math.min(faixaBase, r.bottom) - Math.max(faixaTopo, r.top);
            if (alto > sobreposicao) sobreposicao = alto;
        }

        if (!claro && sobreposicao >= LIGA) claro = true;
        else if (claro && sobreposicao <= DESLIGA) claro = false;
        else return;

        header.classList.toggle('is-sobre-claro', claro);
    }

    /* Um pedido de quadro por rajada de eventos: a rolagem dispara
       dezenas de vezes por quadro e a medição só precisa acontecer uma
       vez, no momento em que o navegador vai pintar. */
    let agendado = false;

    function pedir() {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(() => {
            agendado = false;
            avaliar();
        });
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir, { passive: true });

    /* A primeira leitura é síncrona e antes da primeira pintura: quem
       recarrega a página no meio da banda branca (o navegador devolve a
       rolagem onde estava) vê o header já claro em vez de ver a troca
       acontecer sozinha. O load é a segunda passada, para o caso de
       imagem ou fonte ainda ter mexido na altura da página. */
    avaliar();
    setTimeout( pedir);
});



/* O REVEZAMENTO DOS ATOS DO PAINEL (card 1 da grade bento).
   Duas mesas, finanças e tarefas, empilhadas na mesma célula do
   .pn-corpo. Trocar de ato não é trocar de opacidade: a mesa que
   entra SE MONTA, e este bloco dispara os dois lados dessa montagem.

   O DESENHO DA MONTAGEM É DO CSS (fileiras subindo, barra crescendo,
   linha se traçando). O que sobra para cá são as duas coisas que o
   CSS não faz: reiniciar a animação de uma cena que já esteve em
   cartaz, e contar os números.

   A CONTAGEM SEGUE A CONVENÇÃO QUE O CARROSSEL DA EQUIPE JÁ USA:
   data-count com o alvo e data-fmt="int" quando o número tem
   separador de milhar, com a mesma easeOutCubic, que chega rápido e
   assenta em vez de rodar feito contador de posto. O que muda aqui é
   o ATRASO EM FILA, para os números não subirem todos de uma vez.

   Regras da casa aplicadas: pausa fora do viewport e nada de rodar
   sob reduced-motion, caso em que finanças fica em cena parada e
   inteira, com os números no valor final. */
(function () {
    var app = document.querySelector('#expedienteSection .pn-app');
    if (!app) return;

    var paginas = Array.prototype.slice.call(app.querySelectorAll('.pn-pagina'));
    var abas = Array.prototype.slice.call(app.querySelectorAll('.pn-aba[data-aba]'));
    if (paginas.length < 2) return;

    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
    var atual = 0;
    var timer = null;

    /* Um número sobe do zero até o alvo. O prefixo e os centavos não
       entram aqui: eles moram fora do span, no HTML, justamente para
       o R$ não virar conta. */
    function contar(el, atraso) {
        var alvo = parseFloat(el.dataset.count);
        if (!isFinite(alvo)) return;

        var inteiro = el.dataset.fmt === 'int';
        var escrever = function (v) {
            return inteiro
                ? Math.round(v).toLocaleString('pt-BR')
                : String(Math.round(v));
        };

        if (el._pnRaf) cancelAnimationFrame(el._pnRaf);
        el.textContent = escrever(0);

        var inicio = performance.now() + atraso;
        var passo = function (agora) {
            var p = Math.min(1, Math.max(0, agora - inicio) / 1000);
            el.textContent = escrever(alvo * (1 - Math.pow(1 - p, 3)));
            if (p < 1) { el._pnRaf = requestAnimationFrame(passo); }
            else { el._pnRaf = null; }
        };
        el._pnRaf = requestAnimationFrame(passo);
    }

    function entrar(indice) {
        atual = indice;
        var cena = paginas[indice];
        var nome = cena.getAttribute('data-pagina');

        paginas.forEach(function (p) { p.classList.remove('is-ativa'); });
        /* O reflow é o que faz uma cena repetida montar de novo. Sem
           ele, voltar para a mesma mesa não reiniciaria animação
           nenhuma, porque a classe já teria estado lá. */
        void cena.offsetWidth;
        cena.classList.add('is-ativa');

        abas.forEach(function (a) {
            a.classList.toggle('is-ativa', a.getAttribute('data-aba') === nome);
        });

        if (reduz.matches) return;

        Array.prototype.forEach.call(
            cena.querySelectorAll('[data-count]'),
            function (el, i) { contar(el, 180 + i * 80); }
        );
    }

    function ligar() {
        if (timer || reduz.matches) return;
        /* 5s por ato, por decisão do dono. A montagem mais demorada
           das quatro é a do Theo, que termina de contar por volta de
           1,9s, então ainda sobram uns 3s de cena parada antes da
           próxima troca. Descer muito abaixo disso começaria a cortar
           a leitura no meio. */
        timer = setInterval(function () {
            entrar((atual + 1) % paginas.length);
        }, 5000);
    }

    function desligar() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    /* Chamar uma mesa pelo nome. O relógio reinicia junto, senão o
       revezamento poderia trocar de ato meio segundo depois do
       clique e a escolha do visitante duraria menos que a vontade
       dele. */
    abas.forEach(function (aba) {
        aba.addEventListener('click', function () {
            var nome = aba.getAttribute('data-aba');
            var destino = -1;
            paginas.forEach(function (p, i) {
                if (p.getAttribute('data-pagina') === nome) { destino = i; }
            });
            if (destino < 0 || destino === atual) return;

            entrar(destino);
            if (timer) { desligar(); ligar(); }
        });
    });

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                /* Chegar na seção é o que dá a deixa da primeira
                   montagem, e não o carregamento da página: senão a
                   cena aconteceria longe dos olhos e o visitante
                   encontraria tudo já parado. */
                if (!timer) { entrar(atual); ligar(); }
            } else {
                desligar();
            }
        });
    }, { threshold: 0.25 });

    io.observe(app);
})();

/* =========================================================
   O GESTO DE APERTAR DA ARTE DO CARD 2
   =========================================================
   UMA RECEITA SÓ PARA OS CINCO ALVOS, e ela nasceu de um pedido do
   dono em 23/08/2026: "deixa todos os botões iguais". Até aqui a mesma
   arte respondia de dois jeitos ao mesmo dedo. As portas dos desvios
   apertavam por script, e a folha subia no FUNDO do gesto; os três
   alvos do roteiro apertavam por keyframe, dentro do relógio de 16s, e
   a cena só trocava com as quatro batidas inteiras cumpridas.

   AS QUATRO BATIDAS SÃO AS DA CASA e não mudaram um milissegundo:
   120ms afundando na curva de chegada, 80 parado embaixo, 200 subindo
   e passando de leve do ponto e 160 assentando. Os números daqui são
   TRANSCRIÇÃO e não invenção: saíram de cvFilaAlvo, cvToqueBotao e
   cvToqueZap, que continuam na folha de estilo servindo ao navegador
   que não alcança o roteiro guiado e vê a peça em laço.

   PELA API E NÃO PELA FOLHA porque o alvo tem transform PRESO pela
   animação do ciclo, e animação de script ganha de animação de CSS na
   cascata de animações. O fill: none devolve a peça ao relógio no fim
   do gesto, sem deixar resto.

   SÃO TRÊS DEGRAUS E NÃO UM porque a fileira e os botões nunca
   afundaram igual: peça menor precisa de mais degrau para andar a
   mesma distância no olho de quem está a um braço da tela, e o verde
   do WhatsApp escurece em vez de acinzentar. Igual, aqui, quer dizer
   mesmo tempo e mesma curva, não mesmo tamanho de queda.
   ========================================================= */
var CV_ALTA  = '0 0.06em 0.12em rgba(12, 12, 13, 0.1), 0 0.5em 1.2em rgba(12, 12, 13, 0.08), inset 0 0 0 rgba(12, 12, 13, 0)';
var CV_BAIXA = '0 0.02em 0.05em rgba(12, 12, 13, 0.14), 0 0.1em 0.26em rgba(12, 12, 13, 0.07), inset 0 0.16em 0.34em rgba(12, 12, 13, 0.15)';
var CV_VOLTA = '0 0.08em 0.16em rgba(12, 12, 13, 0.11), 0 0.62em 1.34em rgba(12, 12, 13, 0.1), inset 0 0 0 rgba(12, 12, 13, 0)';

/* O FUNDO DO GESTO, em milissegundos: é onde o botão encosta embaixo,
   e é lá que a cena troca nos cinco alvos da peça. Esperar os 560ms do
   gesto inteiro pela resposta de um clique PRÓPRIO é o que faz
   interface parecer lenta, e foi exatamente isso que o dono viu. */
var CV_FUNDO = 120;

var CV_GESTOS = {
    fila:  { fundo: 'translateY(0.14em) scale(0.94)',  passa: 'translateY(-0.02em) scale(1.012)',  clara: '#ffffff', escura: '#f2f2f4' },
    botao: { fundo: 'translateY(0.16em) scale(0.925)', passa: 'translateY(-0.025em) scale(1.014)', clara: '#ffffff', escura: '#f2f2f4' },
    zap:   { fundo: 'translateY(0.16em) scale(0.925)', passa: 'translateY(-0.025em) scale(1.014)', clara: '#12a05a', escura: '#0f7a52' }
};

function cvBater(el, nome) {
    var g = CV_GESTOS[nome];
    if (!el || !g || !el.animate) return;
    /* Quem pede tela parada não ganha gesto nenhum: o clique dele troca
       a cena a seco, e é o único dos cinco alvos que não afunda. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.animate([
        { offset: 0,         transform: 'none',  backgroundColor: g.clara,  boxShadow: CV_ALTA,  easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        { offset: 120 / 560, transform: g.fundo, backgroundColor: g.escura, boxShadow: CV_BAIXA },
        { offset: 200 / 560, transform: g.fundo, backgroundColor: g.escura, boxShadow: CV_BAIXA, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { offset: 400 / 560, transform: g.passa, backgroundColor: g.clara,  boxShadow: CV_VOLTA, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { offset: 1,         transform: 'none',  backgroundColor: g.clara,  boxShadow: CV_ALTA }
    ], { duration: 560, fill: 'none' });
}

/* =========================================================
   O ROTEIRO GUIADO DA ARTE DO CARD 2
   =========================================================
   MUDANÇA DE CONCEITO DE 23/08/2026, por ordem do dono: as artes dos
   cards 2 e 5 deixaram de rodar em laço e passaram a andar no clique
   de quem está olhando.

   O CARD 5 SAIU DAQUI NA MESMA TARDE, no pedido seguinte do dono:
   "deixa ela toda clicável". Roteiro guiado é uma ORDEM de paradas, e
   um drive que se navega não tem ordem, tem lugares; a arte do drive
   virou máquina de telas e mora no bloco logo abaixo. Este continua
   sendo o certo para o card 2, que conta UMA história do começo ao
   fim, e a função `guiar` continua escrita para dois porque o custo de
   generalizar já foi pago e o dia em que nascer outra peça de roteiro
   ela entra com uma linha. A peça acende, toca a entrada do ato 1 e PARA no
   primeiro quadro. Dali em diante cada trecho só corre quando a pessoa
   toca no alvo daquele passo, e o alvo é o mesmo que o roteiro antigo
   apertava sozinho.

   O DESENHO DO MOVIMENTO NÃO MUDOU UM QUADRO, e essa foi a régua da
   obra inteira. Os dois relógios continuam morando em keyframes de
   porcentagem no style.css, com os mesmos atos, as mesmas curvas e as
   mesmas trocas; o que este bloco faz é segurá-los pela API de
   animações e levá-los de parada em parada. A folha diz O QUE
   acontece, este script passou a dizer QUANDO.

   POR QUE PELA API E NÃO POR CLASSE DE CSS. Reescrever o roteiro em
   animações curtas, uma por passo, custaria refazer quadro por quadro
   um movimento que já está calibrado e aprovado, e cada número
   recopiado à mão é um número que pode sair errado. Segurando o
   relógio de fora, o risco de estragar o desenho é zero: as paradas
   abaixo são as únicas linhas novas que o movimento ganhou.

   AS PARADAS SÃO ONDE A CENA JÁ ESTÁ QUIETA. Cada uma cai depois que a
   última peça do ato pousou e antes de qualquer coisa começar a sair,
   e o salto de uma parada para o começo do toque seguinte atravessa só
   tempo morto, em que nada se mexe. É isso que deixa o corte ser
   invisível.

   O RELÓGIO É UM SÓ POR PEÇA, e por isso todas as animações do ciclo
   são movidas juntas, pelo mesmo currentTime. O pulso dos pontinhos do
   card 2 fica de fora do bando, e a peneira que o exclui é a duração:
   ele roda em 0,96s e o ciclo em 16s. Ele nunca esteve no roteiro.

   O NAVEGADOR SEM getAnimations OU SEM IntersectionObserver não perde
   a peça: ela volta a ser o laço de sempre, que é o comportamento
   certo para o navegador antigo. Melhor uma animação que roda sozinha
   do que um card parado que ninguém consegue destravar.
   ========================================================= */
(function () {
    /* AS PARADAS DE CADA PEÇA, em milissegundos do relógio dela. O
       primeiro passo não tem alvo: é a entrada do ato 1, que corre
       sozinha quando o card chega na tela e termina no quadro em que a
       peça fica esperando.

       O `de` DE CADA PASSO ANDOU PARA FRENTE EM 23/08/2026, por ordem
       do dono: "ele clica, faz todo o movimento do botão, aí ele troca
       de página; eu quero igual ao Convites". Ele estava certo e o
       defeito tinha nome: o `de` apontava para o primeiro quadro do
       CLIQUE desenhado, e a troca de cena só vinha 600ms depois, com o
       gesto inteiro cumprido na frente de quem já tinha apertado. Aquilo
       é NARRAÇÃO, e narração era o que a cena automática precisava
       quando ninguém tinha apertado nada; num clique de gente, é atraso.

       AGORA O `de` É O PRIMEIRO QUADRO DA TROCA DE CENA, e o gesto saiu
       do relógio para correr por fora, junto com ela, do mesmo jeito que
       as portas dos desvios sempre fizeram. Os três números novos são
       keyframes que JÁ EXISTIAM, e nenhum quadro foi reescrito: 18,375%
       é o ato 1 começando a apagar, 37,75% é o ato 2 e 59,25% é o ato 3.

       O QUE FICOU PARA TRÁS É SÓ O CLIQUE, e isso foi conferido
       animação por animação antes de os números mudarem: entre o `de`
       velho e o novo, os atos estão chapados, as fileiras paradas, os
       dois botões em repouso e a conversa apagada. Pular um trecho de
       relógio COMPARTILHADO é pular ele para todo mundo que está
       pendurado nele, e por isso a conferência é a linha inteira e não
       só a peça que se aperta. */
    var CONVITE = [
        { ate: 1200,                                                    ato: '.cv-ato--menu' },
        { alvo: '.cv-fila--alvo', gesto: 'fila',  de: 2940, ate: 3480,  ato: '.cv-ato--gente',  fecho: '.cv-fechar' },
        { alvo: '.cv-btn--largo', gesto: 'botao', de: 6040, ate: 6580,  ato: '.cv-ato--codigo', fecho: '.cv-fechar' },
        { alvo: '.cv-btn--zap',   gesto: 'zap',   de: 9480, ate: 13350, ato: '.cv-ato--zap' }
    ];

    /* O `ato` E O `fecho` ENTRARAM EM 23/08/2026, no pedido do dono:
       "o botão fechar tem que ser funcional, e voltar para o início".
       Cada passo passou a dizer QUE CENA ele põe no palco e se essa
       cena tem porta de saída, e é só isso que o `guiar()` precisa
       saber para desfazer o caminho sem conhecer a peça.

       O ATO 4 NÃO TEM `fecho` de propósito: a conversa do WhatsApp é o
       fim da história, não tem "fechar ×" desenhado nela e uma porta de
       saída ali seria inventar um controle que a tela citada não tem. */

    function guiar(seletorVao, ciclo, passos) {
        var vao = document.querySelector(seletorVao);
        if (!vao) return;

        var card = vao.closest('.exp-card');
        var peca = vao.querySelector('.cv-peca, .dv-peca');
        if (!card || !peca) return;

        if (!('IntersectionObserver' in window) || !vao.getAnimations) {
            card.classList.add('is-vivo');
            return;
        }

        var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

        /* AS DUAS CURVAS DA TROCA DE CENA, copiadas dos keyframes dos
           atos: a de saída apaga o que vai embora, porque coisa que sai
           não desacelera na frente de quem olha, e a de chegada acende o
           que entra. Os três números da volta também são de lá: 220ms
           para o ato sair, 400 para o ato 1 entrar e 140 de atraso entre
           um e outro, que é a mesma sobreposição que o relógio pratica
           quando um ato passa a vez para o seguinte. */
        var CV_SAI   = 'cubic-bezier(0.5, 0, 0.9, 0.35)';
        var CV_CHEGA = 'cubic-bezier(0.22, 1, 0.36, 1)';

        var linha = [];
        var guiado = false;
        var acendeu = false;
        var passo = 0;
        var correndo = false;
        var destino = 0;
        var quadro = 0;
        var espera = 0;
        var voltando = 0;
        var fades = [];

        /* Acender é o que CRIA as animações, porque elas nascem da
           classe. Por isso a lista só pode ser lida depois, e ler a
           lista é o que força o cálculo de estilo na mesma tarefa: as
           animações são pausadas e postas no lugar antes de o navegador
           desenhar o primeiro quadro delas.

           A LISTA VAZIA TEM DOIS SIGNIFICADOS OPOSTOS, e por isso quem
           decide não é ela sozinha. Para quem pede TELA PARADA ela é o
           esperado, porque a folha desliga as animações no
           prefers-reduced-motion e não sobra nada para segurar: ali o
           roteiro anda igual, trocando de cena a seco pelo atributo. Em
           qualquer outro caso, lista vazia é navegador que não entregou
           o que devia, e a peça volta a ser o laço de sempre. */
        function acender() {
            card.classList.add('is-vivo');
            var todas = vao.getAnimations({ subtree: true });
            for (var i = 0; i < todas.length; i++) {
                var t = todas[i].effect && todas[i].effect.getTiming();
                if (t && Math.round(t.duration) === ciclo) linha.push(todas[i]);
            }
            return linha.length > 0 || semMovimento.matches;
        }

        function irPara(ms) { for (var i = 0; i < linha.length; i++) linha[i].currentTime = ms; }
        function pausar()   { for (var i = 0; i < linha.length; i++) linha[i].pause(); }
        function tocar()    { for (var i = 0; i < linha.length; i++) linha[i].play().catch(e => console.warn("Video play prevented", e)); }

        /* A VEZ MUDA DE DONO E NUNCA TEM DOIS DONOS. A classe não
           desenha nada desde que o dono mandou tirar o anel: o que ela
           carrega é o ponteiro de mãozinha, a permissão de receber
           clique (os atos inteiros estão fechados) e, nos dois alvos
           pequenos do drive, a vaga de dedo invisível. */
        function armar() {
            var velho = vao.querySelector('.is-vez');
            if (velho) velho.classList.remove('is-vez');

            var p = passos[passo];
            if (!p || !p.alvo) return;

            var alvo = vao.querySelector(p.alvo);
            if (alvo) alvo.classList.add('is-vez');
        }

        /* Fechar o trecho é pausar e CRAVAR o tempo na parada. O quadro
           do vigia pode chegar alguns milissegundos depois dela, e sem
           esta linha cada passo deixaria um resto acumulado no relógio. */
        function assentar() {
            correndo = false;
            if (quadro) { cancelAnimationFrame(quadro); quadro = 0; }
            pausar();
            irPara(destino);
            peca.setAttribute('data-ato', String(passo + 1));
            passo++;
            armar();
        }

        function vigia() {
            quadro = 0;
            if (!correndo) return;

            var t = linha[0].currentTime;
            if (t === null || t >= destino) { assentar(); return; }

            quadro = requestAnimationFrame(vigia);
        }

        /* A ESPERA DO FUNDO DO GESTO tem nome próprio porque ela pode
           ser interrompida: são 120ms entre o clique e a troca de cena,
           e sair da tela ou trocar de aba dentro deles não pode deixar
           um passo viajando para chegar depois, em cima de outra cena. */
        function soltarEspera() {
            if (espera) { clearTimeout(espera); espera = 0; }
        }

        /* DESMANCHAR A VOLTA é cancelar as duas travessias e o relógio
           que segura a guarda. Cancelar devolve cada ato ao valor do
           keyframe no quadro em que a peça está parada, que é justamente
           o estado de repouso da volta: o ato que saiu apagado e o ato 1
           aceso. Não existe quadro feio no meio do caminho. */
        function soltarVolta() {
            if (voltando) { clearTimeout(voltando); voltando = 0; }
            for (var i = 0; i < fades.length; i++) fades[i].cancel();
            fades = [];
        }

        function tocarPasso() {
            var p = passos[passo];
            if (!p) return;

            soltarEspera();
            soltarVolta();
            destino = p.ate;
            correndo = true;
            pausar();
            irPara(p.de || 0);

            /* Quem pede tela parada anda na história do mesmo jeito, e
               só não vê o percurso: o trecho inteiro é pulado de uma
               vez e a cena troca a seco. Trocar de cena no clique não é
               movimento involuntário, é a resposta a um gesto pedido.

               A ABA ESCONDIDA CAI NA MESMA PORTA, e por um motivo de
               mecânica: o vigia anda em requestAnimationFrame, que não
               bate em aba escondida, então o trecho ficaria correndo
               sem ninguém para fechá-lo na parada. */
            if (semMovimento.matches || document.hidden) { assentar(); return; }

            tocar();
            quadro = requestAnimationFrame(vigia);
        }

        /* REBOBINAR NÃO VOLTA PARA O ZERO DO RELÓGIO, e não é detalhe: o
           zero é o ato 4 ainda aceso, saindo de cena. Voltar para lá
           mostraria a conversa do WhatsApp piscando num card que devia
           estar mostrando o menu. A peça volta direto para a parada da
           entrada, que é o primeiro quadro de espera, e a entrada em si
           só corre uma vez por carregamento.

           ELE GANHOU UM SEGUNDO CLIENTE em 23/08/2026: sair da tela
           continua rebobinando a seco, e o "fechar ×" rebobina para o
           mesmo lugar com as duas travessias por cima. O estado de
           chegada é UM SÓ nos dois casos, e é isso que faz o botão
           devolver exatamente a cena em que a história começa. */
        function rebobinar() {
            correndo = false;
            soltarEspera();
            soltarVolta();
            if (quadro) { cancelAnimationFrame(quadro); quadro = 0; }
            passo = 1;
            pausar();
            irPara(passos[0].ate);
            peca.setAttribute('data-ato', '1');
            armar();
        }

        /* ------------------------------------------------------------
           O "FECHAR ×" DOS ATOS DO ROTEIRO
           ------------------------------------------------------------
           Pedido do dono em 23/08/2026: "o botão fechar tem que ser
           funcional, e voltar para o início". Até aqui ele era cenário
           nas duas folhas do relógio, e só as folhas dos desvios
           fechavam de verdade. Uma folha com "fechar ×" que não fecha é
           a peça desmentindo o próprio desenho.

           A VOLTA NÃO É A IDA REBOBINADA, que é a régua de movimento da
           casa: nada roda para trás aqui. O relógio é CRAVADO na parada
           da entrada, que é o estado de chegada de sempre, e por cima
           dele correm duas travessias curtas, o ato saindo e o ato 1
           chegando, com as mesmas curvas e as mesmas durações que o
           relógio usa quando um ato passa a vez para o seguinte.

           PELA API, DE NOVO, porque a opacidade dos atos é PRESA pela
           animação do ciclo e regra de animação vence declaração normal
           em qualquer peso. E o `backwards` do ato que chega não é
           enfeite: sem ele, os 140ms de atraso mostrariam o menu inteiro
           aceso pelo valor do keyframe antes de ele começar a nascer.
           `both` seria pior ainda, porque prenderia o menu no fim da
           travessia e o relógio nunca mais mandaria nele.

           O MENU VOLTA INTEIRO E NÃO EM FILA. A parada da entrada é o
           quadro em que as três fileiras já pousaram, então o que
           atravessa é o ato como bloco. Reencenar a entrada escalonada a
           cada fechada seria cobrar 1,2s de quem só quis dar um passo
           para trás.
           ------------------------------------------------------------ */
        function voltar(atoSaindo) {
            var comeco = passos[0].ato ? vao.querySelector(passos[0].ato) : null;

            rebobinar();

            /* Quem pede tela parada volta a seco, pelo mesmo motivo que
               anda a seco: o que se corta é o percurso, não o destino. */
            if (semMovimento.matches || !comeco || !atoSaindo || !atoSaindo.animate) return;

            fades = [
                atoSaindo.animate([{ opacity: 1 }, { opacity: 0 }],
                    { duration: 220, easing: CV_SAI }),
                comeco.animate([{ opacity: 0 }, { opacity: 1 }],
                    { duration: 400, delay: 140, easing: CV_CHEGA, fill: 'backwards' })
            ];

            voltando = setTimeout(function () { voltando = 0; fades = []; }, 540);
        }

        var io = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (e.isIntersecting) {
                    card.classList.remove('is-parado');
                    if (acendeu) return;
                    acendeu = true;
                    guiado = acender();
                    if (guiado) tocarPasso();
                    return;
                }

                if (!acendeu) return;
                card.classList.add('is-parado');
                /* Sair da tela rebobina, e é o que devolve a história
                   para quem rolar de volta depois de tê-la visto até o
                   fim. Sem isso o card ficaria preso no último quadro
                   pelo resto da visita. */
                if (guiado) rebobinar();
            });
        }, { threshold: 0.25 });

        io.observe(card);

        /* O CLIQUE APERTA E A CENA VAI JUNTO, no fundo do gesto. Quem
           apertou foi a pessoa, ela já sabe que apertou, e ver o botão
           cumprir as quatro batidas inteiras antes de a cena andar é o
           que o dono chamou de delay grande em 23/08/2026. Os 120ms
           daqui são os mesmos das portas dos desvios, e é isso que faz
           os cinco alvos da peça responderem igual ao mesmo dedo.

           A ESPERA CONTA COMO TRECHO EM CURSO na guarda de cima. Sem
           ela, dois cliques dentro da mesma janela de 120ms disparariam
           dois gestos e dois passos, e o segundo passaria por cima do
           primeiro antes de ele ter começado. */
        vao.addEventListener('click', function (e) {
            if (!guiado || correndo || espera || voltando) return;
            if (!e.target || !e.target.closest) return;

            /* A PORTA DE SAÍDA DA CENA EM CARTAZ, e ela é lida antes do
               alvo do passo porque quem fecha desfaz o caminho em vez de
               continuar por ele. A cena em cartaz é a do passo ANTERIOR:
               o `passo` já apontava para o próximo desde que a parada
               assentou.

               O `closest` DO ATO É A GUARDA QUE FALTARIA. Os atos moram
               empilhados na mesma célula e os dois "fechar ×" caem
               exatamente um em cima do outro, então sem esta linha o
               clique poderia ser creditado à folha errada. Ela exige que
               o fechar apertado seja o da cena que está em cartaz. */
            var cartaz = passos[passo - 1];
            if (cartaz && cartaz.fecho && cartaz.ato) {
                var porta = e.target.closest(cartaz.fecho);
                if (porta && vao.contains(porta) && porta.closest(cartaz.ato)) {
                    voltar(vao.querySelector(cartaz.ato));
                    return;
                }
            }

            var p = passos[passo];
            if (!p || !p.alvo) return;

            var alvo = e.target.closest(p.alvo);
            if (!alvo || !vao.contains(alvo)) return;

            cvBater(alvo, p.gesto);

            /* Sem gesto não há fundo de gesto para esperar: quem pede
               tela parada troca de cena no mesmo quadro do clique. */
            if (semMovimento.matches) { tocarPasso(); return; }

            espera = setTimeout(function () { espera = 0; tocarPasso(); }, CV_FUNDO);
        });

        /* Trocar de aba no meio de um trecho fecha o trecho na parada
           dele. O relógio do documento não para junto com a aba, então
           sem isto a peça voltaria adiantada e o vigia teria que cortar
           o movimento no meio, na frente de quem está olhando. Quem
           esconder a aba dentro do fundo do gesto cai na mesma regra: o
           passo é tocado na hora e já assenta a seco lá dentro. */
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) return;
            if (espera) { tocarPasso(); return; }
            if (correndo) assentar();
        });
    }

    guiar('.exp-vao--convite', 16000, CONVITE);
})();

/* =========================================================
   O DRIVE NAVEGÁVEL DO CARD 5
   =========================================================
   PEDIDO DO DONO DE 23/08/2026, na tarde do mesmo dia em que esta arte
   tinha virado guiada: "eu quero que ela fique literalmente toda
   clicável, seguindo o mesmo padrão de criação que a gente já criou".
   De manhã a peça tinha três alvos e uma ordem só, a fileira Boletos,
   o botão do histórico e a palavra da migalha. Agora ela tem todos, em
   qualquer ordem: entra em qualquer pasta, volta pela migalha, abre o
   histórico do lugar onde está, troca lista por grade e abre um
   arquivo para ver o que a Luna escreveu nele.

   POR QUE ELA SAIU DO ROTEIRO GUIADO. Aquele bloco segura um relógio
   de keyframes e o leva de parada em parada, e ele continua certo para
   o card 2, que conta UMA história do começo ao fim. Um drive não é
   uma história, é um lugar: de qualquer tela dá para ir para qualquer
   outra, e uma linha do tempo linear só sabe contar de trás para a
   frente. Segurar o relógio velho aqui exigiria uma parada para cada
   par de telas possíveis, o que dá centenas.

   O DESENHO DO MOVIMENTO NÃO MUDOU UM QUADRO, e essa foi a régua da
   obra inteira, a mesma que a versão guiada tinha usado de manhã. As
   curvas e as formas do ciclo de 21,6s foram convertidas para
   milissegundos e mudaram de casa, do keyframe de porcentagem para a
   declaração de animação de cada peça.

   OS TEMPOS, ESSES ENCOLHERAM no fim do mesmo dia, quando o dono achou
   a peça demorosa e mandou deixar a interatividade fluida. A conversão
   tinha trazido junto os atrasos de uma cena que ninguém pediu para
   ver, e numa peça que se navega quem pediu a tela é a pessoa. A conta
   inteira está escrita na folha de estilo, com o que o relógio velho
   praticava de um lado e o que a peça pratica hoje do outro.

   E O SCRIPT VOLTOU A SER PEQUENO. A versão guiada precisava da API de
   animações, de um vigia de quadro e de um relógio compartilhado
   porque estava segurando um filme; aqui não existe nem um
   requestAnimationFrame. A folha diz o que acontece quando uma tela
   entra, o script diz QUAL tela entra, e mais nada.

   ---------------------------------------------------------
   O MODELO, E POR QUE ELE EXISTE
   ---------------------------------------------------------
   O drive tem quatro pastas, três arquivos desenhados em cada uma, um
   histórico por lugar e uma ficha por arquivo. Isso dá vinte e duas
   telas. Escritas à mão no HTML, seriam vinte e dois lugares onde a
   contagem de itens de uma pasta pode discordar da lista dela, e a
   régua desta arte, escrita desde o primeiro dia, é que "se a pasta
   dissesse 42 e a lista mostrasse três, o olho pegaria a mentira no
   primeiro quadro".

   ENTÃO A CONTAGEM NÃO É ESCRITA, ELA É CONTADA. O rótulo de cada
   pasta sai dos arquivos que ela tem mais os que ela guarda fora de
   cena, o histórico sai dos mesmos arquivos ordenados ao contrário, o
   rodapé "mais N nesta pasta" sai da mesma subtração e a fileira da
   raiz sai de tudo isso junto. Quando o quarto boleto chega, a pasta
   Boletos passa a dizer quatro itens na raiz sem ninguém escrever
   quatro em lugar nenhum.

   O QUE FICA DE FORA DE CENA É DECLARADO E NÃO INVENTADO. Cada pasta
   diz quantos arquivos tem além dos três desenhados (o `fora`), e a
   soma tem que bater com os números do print que o dono mandou: 42
   notas fiscais, 8 contratos, 17 papéis de casa. Os três desenhados
   são sempre os três MAIS RECENTES da pasta, e é isso que deixa o
   histórico dela listar esses três sem mentir por omissão.

   OS ARQUIVOS SÃO DE GENTE DE VERDADE MAS NÃO SÃO DE NINGUÉM, que é a
   mesma regra da primeira montagem: boleto de condomínio, de luz, de
   internet e de plano de saúde é o que um brasileiro manda no
   WhatsApp, e nenhum deles carrega nome, telefone ou valor de pessoa
   nenhuma.

   E UM ARQUIVO ATRAVESSA PARA OUTRO CARD: o documento-4471.pdf da
   pasta Contratos é o mesmo que a Luna devolve na arte do card 4, o
   contrato do apartamento assinado em março. A ficha dele diz março e
   diz 12 páginas, que é o que a barra de anexo de lá escreve. Dois
   cards da mesma seção contando o mesmo arquivo com dados diferentes
   seria o defeito que a rodada 2 caçou no saldo das contas.

   ---------------------------------------------------------
   O QUE A TELA DE ARQUIVO MOSTRA, E O QUE ELA NÃO MOSTRA
   ---------------------------------------------------------
   Ela mostra as etiquetas e a descrição que a Luna escreveu, e o
   lastro é o artigo 16141091 da central de ajuda, que publica com
   estas palavras que ela lê o conteúdo e grava junto do arquivo as
   etiquetas, a descrição e os termos de busca.

   OS TERMOS DE BUSCA FICARAM DE FORA de propósito, e é a mesma poda
   que tirou o campo de busca do print quando esta arte nasceu: achar é
   o assunto do card ao lado, não deste. Aqui mora o ARRUMAR. Uma tela
   desta peça falando em busca puxaria para cá a promessa que o card 4
   já faz melhor, com uma conversa inteira.
   ========================================================= */
(function () {
    /* ------------------------------------------------------
       OS GLIFOS
       ------------------------------------------------------
       Os mesmos cinco desenhos da primeira montagem, agora numa
       tabela, porque cada um aparece em três ou quatro telas. O da
       pasta com o mais é exclusivo da linha de nascimento do
       histórico. */
    var GLIFO = {
        pasta:  '<svg viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>',
        nasceu: '<svg viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/><path d="M10 8.1v3.4"/><path d="M8.3 9.8h3.4"/></svg>',
        doc:    '<svg viewBox="0 0 16 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M2.3 2.7A1.6 1.6 0 0 1 3.9 1.1h5.2l4.6 4.6v11.6a1.6 1.6 0 0 1-1.6 1.6H3.9a1.6 1.6 0 0 1-1.6-1.6Z"/><path d="M9.1 1.1v4.6h4.6"/></svg>',
        img:    '<svg viewBox="0 0 20 18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="1.5" y="2.7" width="17" height="13.2" rx="2.2"/><circle cx="6.7" cy="7.5" r="1.6"/><path d="M2.3 13.3 7.2 9.2l4 3.3 3-2.3 4 3.5"/></svg>',
        boleto: '<svg viewBox="0 0 22 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.7 6.5h18.6v9.9a1.9 1.9 0 0 1-1.9 1.9H3.6a1.9 1.9 0 0 1-1.9-1.9Z"/><rect x="1.7" y="1.7" width="18.6" height="4.8" rx="1.4"/><path d="M8.5 10.5h5"/></svg>',
        grade:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="3.6" y="3.6" width="7" height="7" rx="1.8"/><rect x="13.4" y="3.6" width="7" height="7" rx="1.8"/><rect x="3.6" y="13.4" width="7" height="7" rx="1.8"/><rect x="13.4" y="13.4" width="7" height="7" rx="1.8"/></svg>',
        hist:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.7 12a8.3 8.3 0 1 0 2.6-6"/><path d="M3.5 3.4v3.4h3.4"/><path d="M12 7.7V12l2.9 1.7"/></svg>'
    };

    /* A NATUREZA DE CADA ARQUIVO decide duas coisas ao mesmo tempo: o
       glifo que ele leva na linha do histórico e a frase que a Luna
       assina ali. Na lista de arquivos quem manda é a EXTENSÃO, e a
       diferença é de propósito: numa lista de pasta o olho procura o
       tipo do arquivo, e num registro ele procura o que aconteceu.
       É por isso que um boleto em PDF leva o glifo de documento na
       pasta e o de comprovante no histórico. */
    var NATUREZA = {
        boleto:    { glifo: 'boleto', frase: 'Luna guardou um boleto' },
        nota:      { glifo: 'boleto', frase: 'Luna guardou uma nota fiscal' },
        contrato:  { glifo: 'doc',    frase: 'Luna guardou um contrato' },
        documento: { glifo: 'doc',    frase: 'Luna guardou um documento' },
        foto:      { glifo: 'img',    frase: 'Luna guardou uma foto' }
    };

    /* A ORDEM é um inteiro comparável e não uma data, porque a peça
       escreve dia e mês e não escreve ano: "18/08" e "12/03" não se
       comparam como texto. Ela só serve para ordenar o histórico do
       drive, que mistura arquivos de quatro pastas. */
    var PASTAS = [
        {
            id: 'boletos', nome: 'Boletos', fora: 0,
            peso: '1,3 MB', pesoDepois: '1,4 MB',
            nasceu: 'quando o primeiro boleto chegou', nasceuEm: '12/08',
            pe: 'Pasta criada pela Luna em 12 de agosto.',
            arquivos: [
                { nome: 'boleto-condominio.pdf', tipo: 'PDF', peso: '84 KB', data: '18/08', ordem: 818, natureza: 'boleto',
                  tags: ['boleto', 'condomínio', 'agosto'],
                  desc: 'Cobrança mensal do condomínio do apartamento.' },
                { nome: 'boleto-internet.jpg', tipo: 'JPG', peso: '1,2 MB', data: '12/08', ordem: 812, natureza: 'foto',
                  tags: ['boleto', 'internet', 'agosto'],
                  desc: 'Foto do boleto da internet, tirada do papel.' },
                { nome: 'boleto-luz.pdf', tipo: 'PDF', peso: '61 KB', data: '15/08', ordem: 815, natureza: 'boleto',
                  tags: ['boleto', 'energia', 'agosto'],
                  desc: 'Conta de energia elétrica do mês de agosto.' },
                { nome: 'boleto-plano-saude.pdf', tipo: 'PDF', peso: '96 KB', data: 'hoje', ordem: 999, natureza: 'boleto',
                  novo: true,
                  tags: ['boleto', 'saúde', 'agosto'],
                  desc: 'Mensalidade do plano de saúde deste mês.' }
            ]
        },
        {
            id: 'notas', nome: 'Notas fiscais', fora: 39,
            peso: '26 MB',
            nasceu: 'quando a primeira nota chegou', nasceuEm: '02/03',
            arquivos: [
                { nome: 'nf-2418.pdf', tipo: 'PDF', peso: '210 KB', data: '04/08', ordem: 804, natureza: 'nota',
                  tags: ['nota fiscal', 'serviço', 'agosto'],
                  desc: 'Nota fiscal de prestação de serviço.' },
                { nome: 'nf-2436.pdf', tipo: 'PDF', peso: '198 KB', data: '11/08', ordem: 811, natureza: 'nota',
                  tags: ['nota fiscal', 'produto', 'agosto'],
                  desc: 'Nota fiscal de compra de material.' },
                { nome: 'nf-2451.pdf', tipo: 'PDF', peso: '224 KB', data: '19/08', ordem: 819, natureza: 'nota',
                  tags: ['nota fiscal', 'serviço', 'agosto'],
                  desc: 'Nota fiscal de prestação de serviço.' }
            ]
        },
        {
            id: 'contratos', nome: 'Contratos', fora: 5,
            peso: '11 MB',
            nasceu: 'quando o primeiro contrato chegou', nasceuEm: '09/11',
            arquivos: [
                { nome: 'contrato-academia.pdf', tipo: 'PDF', peso: '320 KB', data: '04/02', ordem: 204, natureza: 'contrato',
                  tags: ['contrato', 'academia'],
                  desc: 'Contrato de matrícula na academia.' },
                { nome: 'contrato-internet.pdf', tipo: 'PDF', peso: '380 KB', data: '26/06', ordem: 626, natureza: 'contrato',
                  tags: ['contrato', 'internet'],
                  desc: 'Contrato do serviço de internet do apartamento.' },
                { nome: 'documento-4471.pdf', tipo: 'PDF', peso: '2,4 MB', data: '12/03', ordem: 312, natureza: 'contrato',
                  tags: ['contrato', 'apartamento', 'assinado'],
                  desc: 'Contrato do apartamento, assinado em março, com 12 páginas.' }
            ]
        },
        {
            id: 'casa', nome: 'Casa', fora: 14,
            peso: '9,4 MB',
            nasceu: 'quando o primeiro papel da casa chegou', nasceuEm: '21/04',
            arquivos: [
                { nome: 'manual-geladeira.pdf', tipo: 'PDF', peso: '3,2 MB', data: '06/08', ordem: 806, natureza: 'documento',
                  tags: ['manual', 'geladeira'],
                  desc: 'Manual de instruções da geladeira.' },
                { nome: 'nota-da-geladeira.jpg', tipo: 'JPG', peso: '1,4 MB', data: '06/08', ordem: 807, natureza: 'foto',
                  tags: ['nota', 'geladeira', 'garantia'],
                  desc: 'Foto da nota da geladeira, que vale como garantia.' },
                { nome: 'seguro-residencial.pdf', tipo: 'PDF', peso: '640 KB', data: '13/08', ordem: 813, natureza: 'documento',
                  tags: ['seguro', 'casa'],
                  desc: 'Apólice do seguro residencial do apartamento.' }
            ]
        }
    ];

    var peca = document.querySelector('.exp-vao--drive .dv-peca');
    if (!peca) return;

    var palco = peca.querySelector('.dv-palco');
    var card = peca.closest('.exp-card');
    if (!palco || !card) return;

    /* O VÃO ENTRE O CLIQUE E A VIRADA, e ele encolheu de 610 para 120ms
       em 23/08/2026 por ordem do dono: "quando você clica em um botão,
       por exemplo, boletos, ele faz uma animação muito grande,
       demorosa... e tem um delay pra trocar para o outro ato".

       OS 610ms ERAM HERANÇA DO RELÓGIO VELHO, que esperava o gesto de
       560ms acabar inteiro antes de virar a tela. Fazia sentido numa
       cena automática, onde o clique é narração e alguém precisa ver
       que apertaram; num clique de verdade a pessoa já sabe que
       apertou, e esperar meio segundo pela resposta é exatamente o que
       faz interface parecer lenta. A folha de Convites do card da conta
       compartilhada já tinha aprendido isso e sobe no FUNDO do gesto,
       que é este mesmo número, e é a peça que o dono citou como a
       rápida.

       120ms É O FUNDO DA BATIDA: o alvo desce em 120, e é no quadro em
       que ele está afundado que a tela começa a trocar. O gesto não é
       cortado, ele continua correndo no elemento que está saindo. */
    var ESPERA = 120;
    /* Os 120ms do apagar mais 40 de folga, que é quando a tela velha
       sai do documento. */
    var SAIDA = 160;

    var estado = { tela: 'raiz', grade: false, chegou: false, esteveEm: {} };
    var travado = false;
    var acendeu = false;
    /* O CONTADOR DE GERAÇÃO existe por causa da espera entre o clique e
       a virada: um clique dado um instante antes de a página rolar para
       longe teria o temporizador dele disparando DEPOIS do rebobinar, e
       montaria a tela clicada por cima da raiz recém-devolvida. Com a
       espera em 120ms a janela ficou estreita, e é justamente por isso
       que o contador continua: janela estreita não é janela fechada. */
    var geracao = 0;

    function pastaPor(id) {
        for (var i = 0; i < PASTAS.length; i++) if (PASTAS[i].id === id) return PASTAS[i];
        return null;
    }

    /* O QUARTO BOLETO SÓ EXISTE DEPOIS QUE ELE CHEGA, e é esta função
       que faz a peça inteira concordar sobre isso de uma vez: a lista
       da pasta, a contagem do rótulo, o peso da fileira da raiz e o
       histórico saem todos daqui. */
    function arquivosDe(pasta) {
        return pasta.arquivos.filter(function (a) { return !a.novo || estado.chegou; });
    }

    function itensDe(pasta) { return arquivosDe(pasta).length + pasta.fora; }

    function pesoDe(pasta) {
        return (estado.chegou && pasta.pesoDepois) ? pasta.pesoDepois : pasta.peso;
    }

    function esc(t) {
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /* ------------------------------------------------------
       AS PEÇAS DE UMA TELA
       ------------------------------------------------------
       Cabeçalho, rótulo e fileira, que são as três formas que a
       primeira montagem desenhou. Toda tela é feita destas três, e é
       por isso que uma tela nova não custa desenho novo.

       O DESTINO VIAJA NO PRÓPRIO ELEMENTO, no data-ir, e é ele que faz
       a peça inteira ser clicável com um ouvinte só. O data-toque diz
       QUAL das três batidas o elemento leva, porque superfície, botão
       redondo e palavra de migalha afundam de jeitos diferentes. */
    function alvo(destino, batida) {
        return destino ? ' data-ir="' + destino + '" data-toque="' + batida + '"' : '';
    }

    /* OS DOIS BOTÕES ACENDEM PELA MESMA REGRA, e o cargo dela é dizer
       qual das ações está aberta na tela: o do histórico acende no
       histórico, o da grade acende com a grade ligada. Sem isso a
       grade seria a única troca da peça que acontece sem o controle
       que a fez mudar de aparência. */
    function topo(migalha, destinoGrade, destinoHist, histAceso) {
        return '<div class="dv-topo">' +
            '<p class="dv-migalha">' + migalha + '</p>' +
            '<div class="dv-botoes">' +
                '<span class="dv-bt' + (destinoGrade && estado.grade ? ' is-aceso' : '') + '"' + alvo(destinoGrade, 'bt') + '>' + GLIFO.grade + '</span>' +
                '<span class="dv-bt' + (histAceso ? ' is-aceso' : '') + '"' + alvo(destinoHist, 'bt') + '>' + GLIFO.hist + '</span>' +
            '</div>' +
        '</div>';
    }

    function volta(rotulo, destino) {
        return '<span class="dv-volta"' + alvo(destino, 'texto') + '>' + esc(rotulo) + '</span><em>/</em>';
    }

    function rotulo(texto) {
        return '<p class="dv-rot"><span>' + texto + '</span></p>';
    }

    /* O ARQUIVO É ROXO E O RESTO É CINZA, e a decisão é de CONTEXTO e
       não de desenho: o roxo diz "isto é um arquivo" numa LISTA DE
       ARQUIVOS, que é onde ele paga o próprio preço, porque é ele que
       faz a tela de dentro de uma pasta se ler como outra tela antes
       mesmo de a migalha ser lida. Numa lista de PASTAS e num REGISTRO
       o glifo volta ao cinza, que é o que a primeira montagem já
       desenhava: lá o assunto é o lugar e o acontecimento, não o tipo
       do papel. */
    function fila(classe, i, glifo, roxo, nome, meta, destino, extra) {
        return '<li class="' + classe + '" style="--i:' + i + '"' + alvo(destino, 'fila') + '>' +
            '<span class="dv-glifo' + (roxo ? ' dv-glifo--doc' : '') + '">' + GLIFO[glifo] + '</span>' +
            '<span class="dv-txt"><b>' + esc(nome) + '</b>' + meta + '</span>' +
            (extra || '') +
        '</li>';
    }

    function meta(t) { return '<i class="dv-meta">' + esc(t) + '</i>'; }
    function sub(t)  { return '<i class="dv-sub">' + esc(t) + '</i>'; }

    /* ------------------------------------------------------
       AS CINCO TELAS
       ------------------------------------------------------ */
    function telaRaiz() {
        var linhas = PASTAS.map(function (p, i) {
            return fila('dv-fila', i, 'pasta', false, p.nome,
                meta('PASTA · ' + itensDe(p) + ' ITENS · ' + pesoDe(p)),
                'pasta:' + p.id,
                '<span class="dv-chev">›</span>');
        }).join('');

        return topo('<b>Meu Drive</b>', 'grade', 'hist', false) +
            rotulo('PASTAS · ' + PASTAS.length) +
            '<ul class="dv-lista">' + linhas + '</ul>';
    }

    /* A CONTAGEM QUE CRUZA DE 3 PARA 4 é a única peça do rótulo que
       tem dois inquilinos no mesmo vão, e ela só é montada no quadro
       em que o quarto boleto chega. Nas outras vezes o rótulo é um
       número parado, porque um número que não muda não precisa de
       dois andares. */
    function telaPasta(pasta, comChegada) {
        var lista = arquivosDe(pasta);
        var linhas = lista.map(function (a, i) {
            var classe = 'dv-arq ' + (comChegada ? (a.novo ? 'dv-arq--novo' : 'dv-arq--velho') : 'dv-arq--pasta');
            return fila(classe, i, a.tipo === 'JPG' ? 'img' : 'doc', true, a.nome,
                meta(a.tipo + ' · ' + a.peso + ' · ' + a.data),
                'arq:' + pasta.id + ':' + a.nome,
                a.novo && comChegada ? '<span class="dv-carimbo">agora</span>' : '');
        }).join('');

        var conta = comChegada
            ? '<span class="dv-conta"><i class="dv-conta-a">ARQUIVOS · ' + (itensDe(pasta) - 1) + '</i>' +
              '<i class="dv-conta-b">ARQUIVOS · ' + itensDe(pasta) + '</i></span>'
            : 'ARQUIVOS · ' + itensDe(pasta);

        var pe = pasta.fora
            ? '<p class="dv-pe">Mais ' + pasta.fora + ' arquivos nesta pasta.</p>'
            : (pasta.pe && !estado.chegou ? '<p class="dv-pe">' + pasta.pe + '</p>' : '');

        return topo(volta('Meu Drive', 'raiz') + '<b>' + esc(pasta.nome) + '</b>', 'grade', 'hist:' + pasta.id, false) +
            rotulo(conta) +
            '<ul class="dv-lista">' + linhas + '</ul>' + pe;
    }

    /* O HISTÓRICO DE UMA PASTA são os três últimos movimentos dela e o
       nascimento, que é a linha que fecha o argumento do card: quatro
       linhas seguidas, todas assinadas pela Luna, nenhuma pedida por
       ninguém. Quando o quarto boleto chega, ele entra no topo e a
       lista continua com quatro, porque o nascimento é fixo e quem
       cai fora é o movimento mais velho. */
    function telaHistPasta(pasta) {
        var eventos = arquivosDe(pasta).slice().sort(function (a, b) { return b.ordem - a.ordem; }).slice(0, 3);
        var linhas = eventos.map(function (a, i) {
            var n = NATUREZA[a.natureza];
            return fila('dv-log', i, n.glifo, false, n.frase, sub(a.nome + ' · ' + a.data), null);
        }).join('');

        linhas += fila('dv-log', eventos.length, 'nasceu', false, 'Luna criou esta pasta',
            sub(pasta.nasceu + ' · ' + pasta.nasceuEm), null);

        return topo(volta(pasta.nome, 'pasta:' + pasta.id) + '<b>Histórico</b>', null, 'pasta:' + pasta.id, true) +
            rotulo('HISTÓRICO DA PASTA') +
            '<ul class="dv-lista">' + linhas + '</ul>';
    }

    /* O HISTÓRICO DO DRIVE é o mesmo registro visto de cima, e é a
       tela que o botão do cabeçalho da raiz abre. A sublinha ganha um
       campo a mais, a pasta em que o arquivo foi parar, porque é
       exatamente isso que ele tem a dizer: quatro papéis chegaram e
       cada um foi para o lugar certo sem ninguém mandar. */
    function telaHistDrive() {
        var tudo = [];
        PASTAS.forEach(function (p) {
            arquivosDe(p).forEach(function (a) { tudo.push({ a: a, p: p }); });
        });
        tudo.sort(function (x, y) { return y.a.ordem - x.a.ordem; });

        var linhas = tudo.slice(0, 4).map(function (e, i) {
            var n = NATUREZA[e.a.natureza];
            return fila('dv-log', i, n.glifo, false, n.frase, sub(e.a.nome + ' · ' + e.p.nome + ' · ' + e.a.data), null);
        }).join('');

        return topo(volta('Meu Drive', 'raiz') + '<b>Histórico</b>', null, 'raiz', true) +
            rotulo('HISTÓRICO DO DRIVE') +
            '<ul class="dv-lista">' + linhas + '</ul>';
    }

    /* A FICHA DO ARQUIVO. A fileira de cima é IDÊNTICA à da lista de
       onde se veio, na mesma largura, com o mesmo nome e o mesmo
       metadado, e é essa igualdade que diz "é o mesmo arquivo" sem
       nenhuma palavra. */
    function telaArquivo(pasta, arq) {
        var linha = fila('dv-arq dv-arq--pasta', 0, arq.tipo === 'JPG' ? 'img' : 'doc', true, arq.nome,
            meta(arq.tipo + ' · ' + arq.peso + ' · ' + arq.data), null);

        var tags = arq.tags.map(function (t) { return '<li class="dv-tag">' + esc(t) + '</li>'; }).join('');

        return topo(volta(pasta.nome, 'pasta:' + pasta.id) + '<b>Arquivo</b>', null, 'hist:' + pasta.id, false) +
            '<ul class="dv-lista dv-lista--ficha">' + linha + '</ul>' +
            rotulo('O QUE A LUNA ESCREVEU') +
            '<ul class="dv-tags">' + tags + '</ul>' +
            '<p class="dv-desc">' + esc(arq.desc) + '</p>';
    }

    /* A GRADE SÓ VALE ONDE EXISTE LISTA DE ITENS. Histórico é registro
       e ficha é ficha, e nenhum dos dois tem forma de ladrilho; a
       preferência continua guardada, então voltar para uma pasta
       devolve a grade que a pessoa tinha escolhido. */
    function temGrade(tela) {
        return tela === 'raiz' || tela.indexOf('pasta:') === 0;
    }

    function corpo(tela, comChegada) {
        if (tela === 'raiz') return telaRaiz();
        if (tela === 'hist') return telaHistDrive();

        var partes = tela.split(':');
        var pasta = pastaPor(partes[1]);
        if (!pasta) return telaRaiz();

        if (partes[0] === 'pasta') return telaPasta(pasta, comChegada);
        if (partes[0] === 'hist')  return telaHistPasta(pasta);

        if (partes[0] === 'arq') {
            var arq = null;
            arquivosDe(pasta).forEach(function (a) { if (a.nome === partes[2]) arq = a; });
            if (!arq) return telaPasta(pasta, false);
            return telaArquivo(pasta, arq);
        }

        return telaRaiz();
    }

    function montar(tela, animar, comChegada) {
        var velho = palco.querySelector('.dv-ato:not(.is-sai)');
        var novo = document.createElement('div');

        novo.className = 'dv-ato' + (temGrade(tela) && estado.grade ? ' is-grade' : '') + (animar ? '' : ' is-pousado');
        novo.setAttribute('data-tela', tela);
        novo.innerHTML = corpo(tela, comChegada);

        if (velho) {
            velho.classList.add('is-sai');
            setTimeout(function () {
                if (velho.parentNode) velho.parentNode.removeChild(velho);
            }, SAIDA);
        }

        palco.appendChild(novo);
        estado.tela = tela;
    }

    /* ------------------------------------------------------
       O CLIQUE
       ------------------------------------------------------
       Um ouvinte só na peça inteira. Ele acha o alvo pelo data-ir,
       pendura a batida que o data-toque nomeia e conta os 120ms até a
       tela virar. Enquanto a virada está a caminho a peça fica
       travada, senão dois cliques seguidos montariam duas telas por
       cima uma da outra. A trava dura o que a espera dura, então hoje
       ela solta em 120ms: quem quiser atravessar o drive depressa
       atravessa, e é isso que o dono pediu. */
    peca.addEventListener('click', function (e) {
        if (travado || !e.target.closest) return;

        var el = e.target.closest('[data-ir]');
        if (!el || !peca.contains(el)) return;

        var destino = el.getAttribute('data-ir');
        var minha = geracao;
        travado = true;
        el.classList.add('is-tocado');

        setTimeout(function () {
            if (minha !== geracao) return;
            travado = false;

            if (destino === 'grade') {
                estado.grade = !estado.grade;
                montar(estado.tela, true, false);
                return;
            }

            /* A CHEGADA DO QUARTO BOLETO acontece na SEGUNDA vez que
               alguém entra em Boletos, e uma vez só por visita. É o
               mesmo lugar da história em que ela acontecia no roteiro
               guiado: lá era a volta do histórico para a pasta, que é
               justamente uma segunda entrada. O que mudou é que agora
               ela também acontece para quem sai pela raiz e volta,
               porque agora existe esse caminho. */
            var comChegada = false;
            if (destino.indexOf('pasta:') === 0) {
                var id = destino.slice(6);
                if (id === 'boletos' && estado.esteveEm[id] && !estado.chegou) {
                    estado.chegou = true;
                    comChegada = true;
                }
                estado.esteveEm[id] = true;
            }

            montar(destino, true, comChegada);
        }, ESPERA);
    });

    /* ------------------------------------------------------
       ACENDER E REBOBINAR
       ------------------------------------------------------
       A ENTRADA SÓ CORRE UMA VEZ POR CARREGAMENTO, e a deixa dela é a
       peça chegar na tela e não a página carregar: senão a cena
       aconteceria longe dos olhos e o visitante encontraria tudo já
       parado. A raiz já está no HTML e nasce pousada, então acender é
       só tirar a classe que segura as animações dela.

       SAIR DA TELA REBOBINA, e é o que devolve o drive inteiro para
       quem rolar de volta depois de ter andado nele: volta para a
       raiz, em lista, com os três boletos de sempre. Sem isso o card
       ficaria preso na última tela pelo resto da visita. A raiz volta
       POUSADA, sem reentrada, pelo mesmo motivo que a entrada só corre
       uma vez. */
    function rebobinar() {
        geracao++;
        estado.tela = 'raiz';
        estado.grade = false;
        estado.chegou = false;
        estado.esteveEm = {};
        travado = false;
        palco.innerHTML = '';
        montar('raiz', false, false);
    }

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                if (acendeu) return;
                acendeu = true;
                var atual = palco.querySelector('.dv-ato');
                if (atual) atual.classList.remove('is-pousado');
                return;
            }

            if (!acendeu) return;
            rebobinar();
        });
    }, { threshold: 0.25 });

    io.observe(card);
})();

/* =========================================================
   A LUZ DA ARTE DO CARD 3 (a cobrança que atravessa duas conversas)
   =========================================================
   Mesmo interruptor do bloco acima, e o raciocínio inteiro está
   escrito lá: o roteiro mora em keyframes, aqui não existe
   temporizador, a is-vivo entra uma vez e quem vai e vem é a
   is-parado. O que muda é só o vão que ele procura e o ciclo que ele
   acende, que aqui tem 25,44s.

   NÃO DÁ PARA OS DOIS CARDS DIVIDIREM UM BLOCO SÓ, e a razão é o
   estado: cada card guarda o ponto do ciclo dele no
   animation-play-state, e um observador só, com uma lista de cards,
   teria que decidir por todos ao mesmo tempo. Dois observadores
   independentes é o que deixa o card 2 continuar rodando enquanto o
   card 3 está fora da tela, que é o caso comum no celular. */
(function () {
    var card = document.querySelector('.exp-vao--cobranca');
    if (!card) return;
    card = card.closest('.exp-card');
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
        card.classList.add('is-vivo');
        return;
    }

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                card.classList.add('is-vivo');
                card.classList.remove('is-parado');
            } else if (card.classList.contains('is-vivo')) {
                card.classList.add('is-parado');
            }
        });
    }, { threshold: 0.25 });

    io.observe(card);

    document.addEventListener('visibilitychange', function () {
        if (!card.classList.contains('is-vivo')) return;
        if (document.hidden) {
            card.classList.add('is-parado');
            return;
        }
        var r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) card.classList.remove('is-parado');
    });
})();

/* =========================================================
   A LUZ DA ARTE DO CARD 4 (o arquivo que sai e volta)
   =========================================================
   Terceiro interruptor igual aos dois de cima, e o raciocínio inteiro
   está escrito no primeiro deles: o roteiro mora em keyframes, aqui
   não existe temporizador, a is-vivo entra uma vez e quem vai e vem é
   a is-parado. O que muda é só o vão que ele procura e o ciclo que ele
   acende, que aqui tem 17,83s.

   E CONTINUA SENDO UM BLOCO POR CARD pelo mesmo motivo de sempre: cada
   card guarda o ponto do ciclo dele no animation-play-state, e um
   observador só, com uma lista de cards, teria que decidir por todos
   ao mesmo tempo. Este card e o da cobrança são vizinhos na mesma
   linha no desktop, mas no empilhado do celular eles quase nunca
   dividem a tela. */
(function () {
    var card = document.querySelector('.exp-vao--docs');
    if (!card) return;
    card = card.closest('.exp-card');
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
        card.classList.add('is-vivo');
        return;
    }

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                card.classList.add('is-vivo');
                card.classList.remove('is-parado');
            } else if (card.classList.contains('is-vivo')) {
                card.classList.add('is-parado');
            }
        });
    }, { threshold: 0.25 });

    io.observe(card);

    document.addEventListener('visibilitychange', function () {
        if (!card.classList.contains('is-vivo')) return;
        if (document.hidden) {
            card.classList.add('is-parado');
            return;
        }
        var r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) card.classList.remove('is-parado');
    });
})();
/* =========================================================
   A LUZ DA ARTE DO CARD 5 (o drive que se organiza sozinho)
   =========================================================
   O interruptor deste card saiu daqui em 23/08/2026 e foi morar no
   bloco do ROTEIRO GUIADO, lá em cima, junto com o do card 2. As duas
   artes pararam de rodar em laço no mesmo dia e passaram a andar no
   clique, e as duas usam a mesma função: o que muda entre elas é o
   ciclo (21,6s aqui, 16s lá) e a lista de paradas.
   ========================================================= */


/* =========================================================
   A LUZ DA ARTE DA PÁGINA DE HORÁRIOS (card 1 da seção 4C)
   =========================================================
   Quinto interruptor igual aos quatro do expediente, e o raciocínio
   inteiro está escrito no primeiro deles: o roteiro mora em keyframes,
   aqui não existe temporizador, a is-vivo entra uma vez e quem vai e
   vem é a is-parado. O que muda é só o vão que ele procura e o ciclo
   que ele acende, que aqui tem 19,2s.

   E CONTINUA SENDO UM BLOCO POR CARD pelo mesmo motivo de sempre: cada
   card guarda o ponto do ciclo dele no animation-play-state, e um
   observador só, com uma lista de cards, teria que decidir por todos
   ao mesmo tempo. Este é o primeiro que vive fora do expediente, e o
   `closest` aponta para .cli-card e não para .exp-card por isso.

   ACENDER NÃO PRODUZ SALTO: a peça parada descansa no ato 3 completo,
   com o dia 26 já escolhido, que é exatamente o quadro que o ciclo
   mostra em 0%. */
(function () {
    var card = document.querySelector('.cli-vao--horarios');
    if (!card) return;
    card = card.closest('.cli-card');
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
        card.classList.add('is-vivo');
        return;
    }

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                card.classList.add('is-vivo');
                card.classList.remove('is-parado');
            } else if (card.classList.contains('is-vivo')) {
                card.classList.add('is-parado');
            }
        });
    }, { threshold: 0.25 });

    io.observe(card);

    /* Trocar de aba do navegador também congela. Sem isto o ciclo
       continua correndo numa aba escondida, e a pessoa volta no meio de
       um ato que ela não viu começar. */
    document.addEventListener('visibilitychange', function () {
        if (!card.classList.contains('is-vivo')) return;
        if (document.hidden) {
            card.classList.add('is-parado');
            return;
        }
        var r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) card.classList.remove('is-parado');
    });
})();

/* =========================================================
   A LUZ DA ARTE DO CELULAR DA SOFI (card 3 da seção 4C)
   =========================================================
   Sexto interruptor da mesma família. Ele acende duas coisas de uma vez:
   a TRANSIÇÃO de entrada do aparelho, que sobe uma vez e fica de pé, e a
   FILA DE ATRASOS da conversa que mora dentro dele, que é uma cena
   one-shot de 11,82s escrita inteira em animation-delay no style.css.

   A is-parado E O visibilitychange VOLTARAM EM 24/08/2026, com a
   conversa. Até ali este bloco era o mais simples da família e dizia,
   por escrito, que as duas peças voltariam "no dia em que a conversa
   ganhar atos": era verdade que não havia nada para segurar enquanto a
   tela estava vazia. Hoje há. Sem elas, quem passa rolando rápido pelo
   card encontra, na volta, a cena inteira já rodada e nunca vê o ato 1;
   com elas a fila congela no ponto em que estava, pelo
   animation-play-state, e continua de onde parou.

   ISSO NÃO FAZ DA CENA UM CICLO, e a diferença está no is-vivo: ele
   entra UMA vez e não sai nunca, então o aparelho não repete a subida e
   a conversa não recomeça. A is-parado só segura o relógio, não o
   rebobina. É por isso que o observador NÃO se desliga mais depois da
   primeira entrada, e é a única linha que a volta das duas peças custou.

   ACENDER NÃO PRODUZ SALTO porque a pose de largada é a de repouso da
   folha: opacidade 0 e o aparelho encostado por fora da borda de baixo
   do palco. O IntersectionObserver só troca a classe; quem desenha o
   movimento é a transição do .sf-fone e a fila de atrasos da cena. */
(function () {
    var card = document.querySelector('.cli-vao-sofi');
    if (!card) return;
    card = card.closest('.cli-card');
    if (!card) return;

    if (!('IntersectionObserver' in window)) {
        card.classList.add('is-vivo');
        return;
    }

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) {
                card.classList.add('is-vivo');
                card.classList.remove('is-parado');
            } else if (card.classList.contains('is-vivo')) {
                card.classList.add('is-parado');
            }
        });
    }, { threshold: 0.25 });

    io.observe(card);

    /* Trocar de aba do navegador também congela. Sem isto a fila
       continua correndo numa aba escondida, e a pessoa volta no meio de
       um ato que ela não viu começar. */
    document.addEventListener('visibilitychange', function () {
        if (!card.classList.contains('is-vivo')) return;
        if (document.hidden) {
            card.classList.add('is-parado');
            return;
        }
        var r = card.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) card.classList.remove('is-parado');
    });
})();

/* A LUZ DA ARTE DA NOTA FISCAL saiu em 24/08/2026 com o card dela (o
   interruptor inteiro está arquivado em arquivo-nf/nf-luz.js, e a
   história, na lápide do style.css). */

/* =========================================================
   OS DESVIOS DA ARTE DO CARD 2 (convites e área do contador)
   =========================================================
   Pedido do dono em 23/08/2026, logo depois do roteiro guiado: "quero
   que todos os botões sejam clicáveis". As fileiras do menu que eram
   cenário viraram portas, e cada uma abre uma FOLHA própria.

   ESTE BLOCO É SEPARADO DO ROTEIRO GUIADO de propósito, e a divisão é
   de responsabilidade: lá o assunto é segurar um relógio de keyframes
   pela API e levá-lo de parada em parada; aqui não existe relógio
   nenhum. As folhas sobem e descem por transição de CSS, e o que o
   script faz é trocar um atributo e cuidar do que cada folha guarda
   entre uma abertura e outra.

   POR QUE FORA DO RELÓGIO. Pôr uma quinta e uma sexta cena dentro do
   ciclo de 16s obrigaria a remontar quadro a quadro uma partitura
   calibrada e aprovada, e o contrato da obra guiada foi não mexer num
   quadro do desenho. Enquanto uma folha está em pé, o roteiro fica
   parado na parada em que estava e volta para o mesmo quadro quando
   ela desce. O desvio não gasta um milissegundo do ciclo.

   A PORTA SÓ ABRE NO ATO 1, e essa linha vale um parágrafo. O roteiro
   escreve no data-ato da peça o número do ato que acabou de assentar,
   então "data-ato = 1" quer dizer exatamente o que precisamos: o menu
   está em cena E parado. Sem essa guarda, um clique no meio da
   travessia entre dois atos abriria a folha por cima do ato SEGUINTE, e
   fechá-la devolveria a pessoa a uma tela que ela não escolheu.

   O BOTÃO DE COPIAR NÃO COPIA NADA para a área de transferência, e é
   de propósito: o código é inventado, a peça é ilustração, e escrever
   na área de transferência de quem só passou o mouse por uma home é
   mexer numa coisa que não é nossa. O que ele faz é o que a tela faz:
   dizer que copiou.

   SEM getAnimations OU SEM IntersectionObserver o roteiro guiado
   desiste e devolve a peça ao laço de 16s. Nesse caso o data-ato nunca
   é escrito e nenhuma porta abre, que é o certo: em laço o menu só
   está em cena um quinto do tempo, e uma folha subindo por cima de uma
   cena que anda sozinha seria duas coisas disputando o mesmo palco. */
(function () {
    var vao = document.querySelector('.exp-vao--convite');
    if (!vao) return;

    var peca  = vao.querySelector('.cv-peca');
    var lista = vao.querySelector('.cv-lista');
    var card  = vao.closest('.exp-card');
    if (!peca || !lista || !card) return;

    var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* AS DUAS PORTAS E OS DESTINOS DELAS. Acrescentar uma terceira é
       acrescentar uma linha aqui mais a folha no HTML: nada mais deste
       bloco sabe quantas folhas existem. */
    var PORTAS = [
        { porta: '.cv-fila--convites', desvio: 'convites' },
        { porta: '.cv-fila--contador', desvio: 'contador' }
    ];

    /* A lista de partida guardada inteira. Apagar fileira e gerar
       convite são destrutivos por natureza, e a peça precisa voltar ao
       estado de fábrica toda vez que a folha desce, senão quem rolar de
       volta encontra uma conta com dois convites porque alguém apagou
       três. */
    var original = lista.innerHTML;

    var aberta = null;
    var relogios = [];

    function marcar(id) { relogios.push(id); return id; }
    function limpar() {
        for (var i = 0; i < relogios.length; i++) clearTimeout(relogios[i]);
        relogios = [];
    }

    /* AS QUATRO BATIDAS SAÍRAM DAQUI EM 23/08/2026 e viraram cvBater,
       em cima do bloco do roteiro guiado. Elas eram as mesmas do clique
       caricato dos keyframes e nasceram nesta função, quando os desvios
       eram o único lugar da peça que apertava por script; agora os três
       alvos do roteiro apertam pela mesma receita, e receita calibrada
       escrita em dois lugares é receita que um dia diverge.

       O PEDIDO QUE MOVEU A FUNÇÃO foi "deixa todos os botões iguais", e
       essas duas portas são o lado da peça que já estava certo: era o
       roteiro que precisava vir para cá, e não o contrário. */

    /* A FOLHA SOBE NO FUNDO DO GESTO e não depois dele. Na cena
       automática o ato troca 40ms depois de o clique fechar, porque lá
       o gesto é NARRAÇÃO: alguém precisa ver que apertaram. Aqui quem
       apertou foi a pessoa, ela já sabe, e esperar 600ms pela resposta
       de um clique próprio é o que faz interface parecer lenta. */
    function abrir(nome, botao) {
        if (aberta || peca.getAttribute('data-ato') !== '1') return;
        aberta = nome;
        limpar();
        if (botao) cvBater(botao, 'fila');
        if (semMovimento.matches) { peca.setAttribute('data-desvio', nome); return; }
        marcar(setTimeout(function () { peca.setAttribute('data-desvio', nome); }, CV_FUNDO));
    }

    function fechar() {
        if (!aberta) return;
        aberta = null;
        limpar();
        peca.removeAttribute('data-desvio');
        /* O estado só volta ao de fábrica depois que a folha saiu de
           cena. Devolver antes é mostrar as fileiras apagadas
           ressuscitando na frente de quem apagou. */
        marcar(setTimeout(restaurar, semMovimento.matches ? 0 : 300));
    }

    /* Fechar a seco é para quando ninguém está olhando (a peça saiu da
       tela): sem transição para esperar, o estado volta no mesmo quadro. */
    function fecharSeco() {
        if (!aberta) return;
        aberta = null;
        limpar();
        peca.removeAttribute('data-desvio');
        restaurar();
    }

    function restaurar() {
        lista.innerHTML = original;
        var ct = vao.querySelector('.cv-ato--contador');
        if (ct) {
            ct.classList.remove('is-gerado');
            porMes(0);
        }
    }

    /* ---------- a folha de convites ---------- */

    function copiar(fila) {
        fila.classList.add('is-copiado');
        marcar(setTimeout(function () { fila.classList.remove('is-copiado'); }, 1500));
    }

    /* O COLAPSO PRECISA DE UMA ALTURA ESCRITA, porque altura automática
       não interpola. O script mede a fileira, crava a medida, força o
       cálculo de estilo na mesma tarefa (é o que a leitura do
       offsetHeight faz) e só então manda para zero: sem esse empurrão o
       navegador junta as duas escritas e a fileira some sem andar. */
    function apagar(fila) {
        if (fila.classList.contains('is-saindo')) return;

        fila.style.height = fila.getBoundingClientRect().height + 'px';
        void fila.offsetHeight;

        fila.classList.add('is-saindo');
        fila.style.height = '0px';
        fila.style.paddingTop = '0px';
        fila.style.paddingBottom = '0px';

        marcar(setTimeout(function () {
            if (fila.parentNode) fila.parentNode.removeChild(fila);
        }, semMovimento.matches ? 0 : 280));
    }

    /* ---------- a folha da área do contador ---------- */

    /* O DOSSIÊ É DO MÊS, e andar para trás é a única coisa que aquela
       tela faz que não é promessa nova. Os 236 lançamentos de agosto
       não são número inventado aqui: é o mesmo "236 movimentos
       registrados este mês" que o painel do card 1 mostra nesta home. */
    var MESES = [
        { nome: 'Agosto de 2026', n1: '236 lançamentos', n2: '18 arquivos' },
        { nome: 'Julho de 2026',  n1: '291 lançamentos', n2: '24 arquivos' },
        { nome: 'Junho de 2026',  n1: '268 lançamentos', n2: '21 arquivos' },
        { nome: 'Maio de 2026',   n1: '247 lançamentos', n2: '19 arquivos' }
    ];
    var mes = 0;

    function porMes(i) {
        mes = Math.max(0, Math.min(MESES.length - 1, i));
        var m = MESES[mes];
        var nome = vao.querySelector('.cv-ct-nome');
        var n1 = vao.querySelector('.cv-ct-n1');
        var n2 = vao.querySelector('.cv-ct-n2');
        var tras = vao.querySelector('.cv-ct-seta--tras');
        var frente = vao.querySelector('.cv-ct-seta--frente');
        if (nome) nome.textContent = m.nome;
        if (n1) n1.textContent = m.n1;
        if (n2) n2.textContent = m.n2;
        /* Seta que não leva a lugar nenhum não finge que leva: agosto é
           o mês corrente e maio é onde o dossiê começa. */
        if (frente) frente.classList.toggle('is-off', mes === 0);
        if (tras) tras.classList.toggle('is-off', mes === MESES.length - 1);
    }

    /* O CÓDIGO INVENTADO TEM A FORMA DO DE VERDADE e nada mais: seis
       caracteres, sem as quatro figuras que se confundem lidas em voz
       alta (I e 1, O e 0). É a mesma régua da entreletra do código no
       CSS, escrita do outro lado. */
    var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    function codigoNovo() {
        var c = '';
        for (var i = 0; i < 6; i++) c += ALFABETO.charAt(Math.floor(Math.random() * ALFABETO.length));
        return 'COD-CONVITE-' + c;
    }

    /* O CONVITE NASCE NAS DUAS TELAS AO MESMO TEMPO, e é o que impede
       as duas de discordarem sobre a mesma conta: o código aparece no pé
       da área do contador e a fileira dele entra no topo da lista de
       convites, com a data de hoje. Quem gerar e depois abrir Convites
       encontra o convite lá, que é o que a janela do card promete por
       escrito. */
    function gerarConvite(folha) {
        if (folha.classList.contains('is-gerado')) return;

        var codigo = codigoNovo();
        var alvo = vao.querySelector('.cv-ct-cod');
        if (alvo) alvo.textContent = codigo;
        folha.classList.add('is-gerado');

        var modelo = lista.querySelector('.cv-conv');
        if (!modelo) return;
        var nova = modelo.cloneNode(true);
        nova.classList.add('is-nova');
        nova.classList.remove('is-copiado', 'is-saindo');
        var cod = nova.querySelector('.cv-conv-cod');
        var meta = nova.querySelector('.cv-conv-meta');
        if (cod) cod.textContent = codigo;
        if (meta) meta.textContent = 'Convite pendente · 23/08/2026';
        lista.insertBefore(nova, lista.firstElementChild);
    }

    /* ---------- as ligações ---------- */

    PORTAS.forEach(function (p) {
        var el = vao.querySelector(p.porta);
        if (!el) return;
        el.addEventListener('click', function () { abrir(p.desvio, el); });
    });

    vao.addEventListener('click', function (e) {
        if (!aberta || !e.target || !e.target.closest) return;

        var folha = e.target.closest('.cv-ato--desvio');
        if (!folha) return;

        if (e.target.closest('.cv-fechar--vez')) { fechar(); return; }

        var seta = e.target.closest('.cv-ct-seta');
        if (seta) {
            porMes(mes + (seta.classList.contains('cv-ct-seta--tras') ? 1 : -1));
            return;
        }

        if (e.target.closest('.cv-ct-btn')) { gerarConvite(folha); return; }

        var mini = e.target.closest('.cv-mini');
        if (!mini) return;
        var fila = mini.closest('.cv-conv');
        if (!fila) return;

        if (mini.classList.contains('cv-mini--copiar')) { copiar(fila); return; }
        if (mini.classList.contains('cv-mini--apagar')) { apagar(fila); }
    });

    /* Sair da tela devolve a peça inteira, do mesmo jeito que o roteiro
       guiado rebobina. Sem isto, quem abriu uma folha, rolou a página e
       voltou encontraria o card mostrando uma lista de convites em vez
       do menu, que é o quadro em que a história começa. */
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) { if (!e.isIntersecting) fecharSeco(); });
        }, { threshold: 0.25 }).observe(card);
    }
})();

/* =========================================================
   PARA EMPRESÁRIOS (seção 4D da home)
   =========================================================
   24/08/2026. A OITAVA peça da família de interruptores desta página,
   e a segunda com relógio próprio: o desenho inteiro mora no
   style.css, em fase e em keyframe, e aqui só acontece o que o CSS
   não sabe fazer sozinho — escrever letra a letra e trocar o
   data-fase e o data-ciclo do palco.

   ELA HERDOU O RELÓGIO INTEIRO da seção do Ítalo, que morava nesta
   mesma vaga até hoje de manhã e está guardada em
   _removido_secao_italo_24-08-2026.html. Nenhum número foi mexido: o
   que mudou foram as três frases, o que a cena responde e o endereço
   da barra, que agora é fixo.

   A ARQUITETURA É A DO CARD 3 DO OPEN FINANCE, e vale ler o bloco
   dele antes de mexer neste: as fases se acumulam dentro de um ciclo,
   o religamento zera tudo num quadro mudo, e a linha do tempo tem
   dois trechos. O primeiro é medido em LETRAS e não em
   milissegundos, porque as três frases têm tamanhos diferentes (40,
   40 e 41 desde o ditado de 24/08/2026) e nenhuma marca abaixo pode
   depender disso: quem chama o resto é o FIM da digitação. O segundo
   é contado a partir dele. É por causa dessa arquitetura que a troca
   das três frases não custou um número: elas eram 54, 40 e 34 e
   passaram a 40, 40 e 41 sem ninguém tocar no relógio.

   A ÂNCORA DO SEGUNDO TRECHO MUDOU na noite de 24/08/2026, e a lista
   completa das marcas novas, com a justificativa de cada número, está
   no bloco delas mais abaixo, junto das constantes. O resumo do que
   mudou de ideia: as marcas do PALCO passaram a contar do COMEÇO da
   digitação e não mais do fim dela, por ordem do dono ("quero que a
   página comece a se revelar enquanto ela está escrevendo ainda o
   pedido"), e a única que ainda conta do fim é o floreio da pílula.

   O EFEITO COLATERAL BONITO DISSO é que a volta parou de depender do
   tamanho da frase. Enquanto tudo pendia do fim da digitação, uma frase
   de 54 letras esticava o ciclo inteiro; agora os três ciclos medem
   exatamente 4,78s e a volta fecha em 14,34s, com a frase correndo
   dentro do compasso em vez de mandar nele. A arquitetura medida em
   LETRAS continua valendo onde ainda importa: é ela que mantém o
   floreio colado na última tecla, seja qual for o tamanho do pedido.

   CORREÇÃO DATADA, 31/08/2026: "PAROU DE DEPENDER" ERA FORTE DEMAIS, e a
   conta acima é a do caminho limpo e não a lei da peça. O que o
   reancoramento de 24/08 fez foi tirar a digitação do caminho crítico
   enquanto ela cabe no compasso; o que ele deixou para trás foi um
   avanço de ciclo em RELÓGIO DE PAREDE correndo em paralelo com ela, sem
   olhar uma vez sequer se a frase acabou. Na mesa a folga é de 2,78s e
   nada aparece. No CELULAR o WebKit e o Chrome represam os timers curtos
   durante rolagem com inércia, em low power mode e nas trocas rápidas de
   aplicativo; a digitação é feita toda de timers curtos e escorrega
   inteira junto, e o timer único de 4,48s não escorrega com ela — ele
   ATROPELAVA a frase, começando o ciclo seguinte com a anterior pela
   metade, apagando o toco 300ms depois e escrevendo a nova por cima.
   HOJE O AVANÇO ESPERA O QUE VIER POR ÚLTIMO: o prazo de parede OU o fim
   de verdade da digitação com o floreio dela. Em relógio limpo o último
   é sempre o prazo, e por isso os 4,78s e os 14,34s de cima continuam
   valendo palavra por palavra e caindo no mesmo instante de antes. Sob
   timer represado a volta estica, que é o preço certo por não deixar a
   pílula engolir a própria frase. A mesma correção foi feita na mesma
   data na seção gd-, que herdou este defeito junto com este relógio.

   A MARCA DO "monta" GANHOU TRABALHO NOVO na mesma noite: além de
   acender o brilho do esqueleto, é nela que a esteira faz a TROCA
   SILENCIOSA, devolvendo as seis janelas à vaga de origem sem transição.
   O lugar é este e não outro porque é aqui que a janela que chegou ao
   centro é esqueleto puro, ou seja, indistinguível da janela de verdade
   em esqueleto. Um instante antes ela ainda estaria assentando; um
   instante depois a varredura já teria começado a pintar em cima dela.

   Histórico dos números da volta, para quem for mexer: ~20,2s com 48ms
   por letra de manhã, 18,03s com 30ms à tarde, 14,34s com o relógio
   reancorado no começo da digitação à noite. E 14,34s ainda em
   31/08/2026, quando o avanço do ciclo passou a esperar a digitação:
   aquela data não mexeu em número nenhum, só pôs um piso embaixo de um
   deles.

   O PRIMEIRO ARRANQUE É FRIO: quando a seção aparece pela primeira
   vez a cena começa direto na digitação do pedido 1, com o esqueleto
   já no lugar e a barra de endereço vazia. Não existe resposta
   anterior para recuar, e fingir uma seria mostrar um resultado que
   ninguém pediu ainda.

   AS TRÊS VOLTAS SÃO UMA HISTÓRIA SÓ. É o mesmo dinheiro passando por
   três pedidos: um link de R$ 850 em 10x, a nota fiscal daqueles
   R$ 850, e a antecipação das vendas do mês, que são cinco daquelas.
   Quem mexer nos pedidos mexe nos três, ou a história se quebra no
   meio.
   ========================================================= */
(function () {
    var secao = document.getElementById('empSection');
    var palco = document.getElementById('empPalco');
    var campo = document.getElementById('empTexto');
    var barra = document.getElementById('empUrl');
    if (!secao || !palco || !campo || !barra) return;

    /* O ENDEREÇO É UM SÓ E NÃO TROCA, e esta constante existe para
       dizer isso em voz alta. Na peça antiga cada volta tinha o seu
       domínio, porque cada volta era um site de terceiro; aqui a cena
       é sempre o painel da casa respondendo, e um domínio trocando
       diria que o dinheiro passeia por três serviços. Ele só tem
       trabalho quando a barra chega vazia, o que desde a espera de 1s
       não acontece mais: dali em diante a atribuição é repetição inofensiva,
       e mantê-la é mais barato que uma condição que alguém teria de
       entender depois. */
    var ENDERECO = 'meuassessor.com';

    /* Os três pedidos, na ordem em que entram, com a tela que cada um
       revela. Os dois lados ficam juntos aqui para ninguém trocar um
       sem o outro: pílula pedindo a nota e viewport mostrando a
       antecipação é o tipo de erro que passa despercebido por
       semanas.

       AS TRÊS FRASES SÃO DITADO DO DONO, de 24/08/2026, e estão aqui
       como ele escreveu (só o "R$850" virou "R$ 850", que é o padrão da
       casa). Elas trocaram as três da manhã e mudaram duas coisas de
       fundo. A primeira é que NINGUÉM ASSINA "Martin," no começo: quem
       nomeia o assessor é o cabeçalho da seção, e o pedido virou o que
       uma pessoa digita de verdade num campo, sem vocativo. A segunda é
       que o pedido 1 passou a dizer O PARCELAMENTO, e é dele que sai a
       conta de taxa que a tela do ato 1 mostra.

       QUEM MEXER AQUI MEXE NA TELA JUNTO. As três frases e as três
       telas são a mesma peça vista de dois lados: a frase pede link em
       10x e a tela mostra a taxa de 10x, a frase pede nota de R$ 1.450
       e a nota é de R$ 1.450, a frase fala de VENDAS no plural e a tela
       soma cinco delas. Arte não desmente a copy.
       A HISTÓRIA DESTA SEÇÃO MUDOU EM 27/08/2026, e mudou para deixar
       de ser a da ben-. As duas contavam a MESMA venda com os mesmos
       adereços (João Almeida, R$ 850, nota 142, consultoria de agosto),
       uma logo depois da outra na mesma rolagem, e duas seções
       contando o mesmo caso lêem como a mesma seção repetida. A ben-
       ficou intocada porque os props dela atravessam três atos já
       revisados; quem trocou de caso foi esta. Aqui a cliente é a
       Carla Nunes, o serviço é mentoria, o valor é R$ 1.450 e a nota é
       a 157. Os 1.450 dividem por 10 sem sobra (145,00 na tela 1) e
       cinco deles dão os 7.250 da tela 3, que é a mesma continuidade
       discreta que os 850 tinham. */
    var CICLOS = [
        { pedido: 'Gerar link de pagamento de R$ 1.450 em 10x', tela: '.emp-tela--cobranca' },
        { pedido: 'Emita uma nota fiscal no valor de R$ 1.450', tela: '.emp-tela--nota' },
        { pedido: 'Quero antecipar o valor das minhas vendas', tela: '.emp-tela--antecipa' }
    ];

    /* QUEM PEDE MENOS MOVIMENTO NÃO É ATENDIDO AQUI, é atendido pelo
       HTML: o palco nasce em repouso/1 com a primeira tela marcada, o
       pedido inteiro escrito na pílula e o endereço na barra, que é
       exatamente a pose parada. Este relógio só devolve sem ligar
       nada, e o gate do style.css desliga o que pisca. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var telas = CICLOS.map(function (c) { return palco.querySelector(c.tela); });
    if (telas.some(function (t) { return !t; })) return;

    /* O CAMPO ROLA, e é a mesma lição do campo do card 3: no celular a
       frase mais longa não cabe na caixa, e campo de verdade não
       encolhe letra, empurra o texto para a esquerda e mantém o
       cursor à vista. */
    var caixa = campo.parentElement;

    /* OS 30ms POR LETRA SÃO ORDEM DO DONO, de 24/08/2026 à noite, com o
       vídeo de referência na mão: lá 11 letras entram em 250ms, ou seja
       ~25ms por tecla, e ele mandou trazer a máquina de escrever daqui
       para essa casa. Eram 48.
       O NÚMERO SE ESCOLHEU NO RENDER e não na conta. Em 25 as frases
       longas desta seção (40 letras) leem como texto colado: o olho não
       chega a ver letra entrando, vê a linha crescendo. Em 30 elas
       levam 1,20s e ainda se lê tecla a tecla, que é o que a pílula
       precisa dizer — alguém está escrevendo isto agora. É o teto de
       velocidade que ainda é digitação, e a ordem pedia a casa de 25 a
       35.
       O TREMOR DESCEU JUNTO, de ±9 para ±6, e a proporção é a razão:
       ±9 em cima de 30 é um terço de variação por tecla, o que faz a
       mão parecer gaga em vez de humana. ±6 devolve os mesmos 20% de
       oscilação que ±9 tinha em cima de 48. */
    /* AS MARCAS MUDARAM DE ÂNCORA na noite de 24/08/2026, e esta é a
       mudança de fundo desta rodada. Ordem do dono: "quero que a página
       comece a se revelar enquanto ela está escrevendo ainda o pedido
       dentro da caixa de texto. Eu não quero que só apareça a página
       depois que ele mande a mensagem, eu quero que isso tudo aconteça
       de uma maneira mais fluida".

       ANTES: o segundo trecho contava do FIM da digitação, e a cena era
       uma fila indiana — escrever, enviar, montar, revelar. A frase mais
       longa empurrava a resposta inteira para depois.
       AGORA: as marcas do palco contam do COMEÇO da digitação, e só o
       floreio da pílula continua contando do fim. As duas trilhas correm
       juntas, e a volta inteira deixou de depender do tamanho da frase:
       os três ciclos passaram a medir exatamente o mesmo.

       E ANTES DE TODAS ELAS ESTÁ A ESPERA DE 1s, que é o zero desta
       lista: o ciclo não começa quando a seção aparece, começa um segundo
       depois. Ela está documentada na constante ESPERA, mais acima.

       AS MARCAS, todas do começo da digitação:
       • ASSENTA, 700ms. É a duração do deslize, e não uma escolha
         independente: a fila só para quando termina de andar. Aqui
         acontece a TROCA SILENCIOSA e nasce o brilho do esqueleto.
       • VARRE, 780ms. Os 80ms depois do assentamento são a batida que
         faz a luz ser CONSEQUÊNCIA de a janela ter chegado, e não
         coincidência com ela. E a ORDEM É INEGOCIÁVEL: a varredura
         nascendo antes da troca revelaria a janela FANTASMA, que é a que
         ainda vai embora. Quem mexer em ASSENTA mexe nesta junto.
       • FIM DA VARREDURA, 1680ms, que são os 780 mais os 900 que a luz
         leva para atravessar o viewport. O 900 é o --emp-varre do CSS, e
         os dois andam juntos por contrato.
         O NÚMERO ATRAVESSOU DUAS REFORMAS DA PEÇA SEM SE MEXER, na noite
         de 24/08/2026: a revelação virou superfície mais cascata e depois
         voltou a ser cortina, agora com máscara em rampa e a luz correndo
         no lado escuro, e nas duas vezes o envelope continuou sendo estes
         900ms. Quem for mexer na revelação mexe DENTRO dele.
       • REPOUSO, 2800ms de leitura, começando quando a revelação E a
         frase já fecharam. A tela tem um número, um estado e uma data, e
         é a única parte da peça que tem informação.

       E A ÚNICA MARCA QUE AINDA CONTA DO FIM DA DIGITAÇÃO:
       • FLOREIO, 200ms depois da última letra. É a folga entre terminar
         de escrever e apertar o botão. Ele já foi o gatilho da cena e
         agora é só um gesto de fecho: quando ele acontece, a luz já
         passou dos dois terços da janela. O TETO DE FRASE mora aqui —
         o aperto dura 240ms, então 30·letras + 440 tem de caber nos 1680
         da varredura,
         o que dá 41 letras. As três do dono medem 40, 40 e 41, e a
         terceira fecha em 1670, dez milissegundos antes. Frase mais
         longa que isso não quebra nada, só deixa o botão apertar já
         dentro do repouso.
         ONDE ESSE TETO REALMENTE DOÍA, corrigido em 31/08/2026: o de 41
         letras é só cosmético, e a linha acima está certa sobre ele. O
         teto DURO era outro, e ninguém tinha escrito: 30·letras + 440
         precisava caber nos 4480 do prazo do ciclo, ou seja 134 letras,
         senão o avanço vinha em cima da frase inacabada e a apagava pela
         metade. E com os timers represados do celular esse teto de 134
         desabava para uma dúzia de letras, que é como o defeito
         aparecia na mão do dono. Hoje não há teto duro nenhum: passar do
         prazo só ESTICA o ciclo.

       Com os 300ms de esvaziamento na frente, cada ciclo fecha em 4,78s
       e a volta inteira em 14,34s. Eram 6,00s e 18,03s com o relógio
       ancorado no fim da digitação. Desde 31/08/2026 esses 4,78s são o
       PISO do ciclo e não mais a lei dele: em relógio limpo caem no mesmo
       instante de sempre, e com timer represado o ciclo espera a frase
       fechar antes de virar. */
    var POR_LETRA  = 30;    // o centro do compasso; cada tecla treme ±6 em volta dele
    var ESVAI      = 300;   // do começo do ciclo até a digitação começar
    /* A ESPERA DO ARRANQUE, ordem do dono de 24/08/2026: "Quero que demore
       um pouquinho mais para começar a animação, comece depois de 1 segundo
       de visualizar ela." Ela conta da VISIBILIDADE (o observador acender)
       até o primeiro "apaga", e o que se vê durante ela é a POSE DE
       NASCENÇA: o ato 1 revelado, o pedido 1 inteiro na pílula e o endereço
       na barra. É por isso que o segundo parado é um quadro digno e não um
       vazio — é a mesma pose que a página entrega a quem chega sem
       JavaScript e a quem pede menos movimento.
       ELA SUBSTITUIU OS 280ms DE "ANTES", que eram o ar entre a seção
       aparecer e a primeira letra. O nome mudou junto com o sentido: aquilo
       era respiro, isto é um QUADRO em cartaz. */
    var ESPERA     = 1000;  // da visibilidade até o primeiro "apaga"
    var ASSENTA    = 700;   // as quatro marcas abaixo contam do COMEÇO da digitação
    var VARRE      = 780;
    var FIM_VARRE  = 1680;
    var REPOUSO    = 2800;
    var FLOREIO    = 200;   // e só esta conta do FIM dela

    /* A LEITURA MÍNIMA É A ÚNICA CONSTANTE NOVA DE 31/08/2026, e é a
       única desta lista SEM contrato com o style.css: nenhum keyframe de
       lá conta com ela, e por isso ela pode ser escolhida pelo olho e
       mais nada. Ela só aparece no caso em que a digitação estourou o
       prazo de parede, ou seja, com os timers represados. Aí o avanço já
       está atrasado e a tentação é emendar o ciclo seguinte na última
       letra — o que faria a frase que custou tanto a sair aparecer
       inteira por um quadro e sumir, que é o mesmo desrespeito do bug de
       trás para frente.
       SÃO 600ms E SÃO POUCOS DE PROPÓSITO, e é o mesmo número da gd-:
       quem está com o aparelho represando timer já esperou demais para
       ler esta frase, e o que se deve a ele é ver a frase pronta, não o
       REPOUSO inteiro de novo por cima do atraso. */
    var LEITURA_MIN = 600;  // frase pronta em cartaz quando o prazo já venceu

    /* =====================================================
       A ESTEIRA
       =====================================================
       24/08/2026, à noite. Ordem do dono: "esse carrossel de telas tem
       que mudar quando for mudar a mensagem dentro da caixa de texto,
       essa animação de carrossel tem que acontecer em conjunto com a
       caixa de texto digitando, para ser algo fluido (seguindo
       exatamente a referência de vídeo)".

       O DESENHO INTEIRO MORA NO style.css, em classe de vaga, e este
       trecho só GIRA a fila. É a mesma divisão de trabalho do resto da
       seção: o CSS sabe onde cada vaga fica, com que escala, que véu e
       que profundidade; o JavaScript sabe quem está em qual vaga.

       SÃO SETE VAGAS E SEIS JANELAS, e a matemática fecha assim: cinco
       vagas aparecem (o centro, o par de dentro e o par de fora) e duas
       ficam fora do quadro, uma de cada lado. Em repouso as seis janelas
       ocupam as vagas 1 a 6, e a vaga 0 fica vazia esperando quem morrer.
       Deslizar é subtrair 1 de todo mundo. Assentar é devolver quem caiu
       na 0 para a 6 (as duas são invisíveis, então ninguém vê) e trocar
       a janela de verdade com o fantasma que chegou ao centro.

       A TROCA SILENCIOSA é a peça que faz a ilusão fechar, e ela só é
       possível porque as seis janelas são a MESMA CAIXA com o mesmo
       conteúdo de esqueleto: na batida do "monta" o fantasma que chegou
       ao centro é indistinguível da janela de verdade em esqueleto, e
       nesse quadro elas trocam de lugar com as transições desligadas. É
       o truque clássico de carrossel, e o quadro em que ele acontece foi
       fotografado antes e depois para provar que não pisca.

       A VAGA DE NASCENÇA É LIDA DO HTML e não escrita aqui, e isso não é
       elegância: a classe de vaga no HTML é a POSE PARADA da seção, a
       que vale sem JavaScript e para quem pede menos movimento. Ler dali
       garante que o repouso desta função e o repouso da página sejam a
       mesma coisa por construção, e não por duas listas que alguém tem
       de manter iguais. */
    var VAGAS = ['saida', 'longe-esq', 'perto-esq', 'centro', 'perto-dir', 'longe-dir', 'entrada'];
    var janela = palco.querySelector('.emp-janela:not(.emp-fundo)');
    if (!janela) return;

    /* A ordem aqui não importa para o desenho (quem manda é o z-index de
       cada vaga), mas a janela de verdade entra na lista como uma
       qualquer: durante o deslize ela é só mais um vagão. */
    var vagoes = [janela].concat([].slice.call(palco.querySelectorAll('.emp-fundo')));

    function lerVaga(el) {
        for (var i = 0; i < VAGAS.length; i++) {
            if (el.classList.contains('emp-vaga--' + VAGAS[i])) return i;
        }
        return -1;
    }

    var berco = vagoes.map(lerVaga);
    if (berco.some(function (v) { return v < 0; })) return;

    var onde = berco.slice();

    function escreveVagas() {
        vagoes.forEach(function (el, n) {
            VAGAS.forEach(function (v, i) {
                el.classList.toggle('emp-vaga--' + v, i === onde[n]);
            });
        });
    }

    /* Toda a fila anda uma vaga para a esquerda. Quem estava na 1 cai na
       0, que é a vaga de fora do quadro à esquerda, e some andando. */
    function desliza() {
        onde = onde.map(function (p) { return p - 1; });
        escreveVagas();
    }

    /* O QUADRO CEGO. Três mexidas de uma vez, todas invisíveis:
       • quem caiu na vaga 0 renasce na 6, e as duas estão fora do quadro
       • a janela de verdade, que estava na perto-esquerda, volta ao
         centro já em esqueleto, pronta para a varredura
       • o fantasma que tinha chegado ao centro assume a perto-esquerda,
         que é de onde a de verdade acabou de sair
       As duas últimas são uma troca de lugar entre duas peças idênticas,
       e é por isso que ela não se vê. */
    function assenta() {
        onde = onde.map(function (p, n) {
            if (p === 0) return 6;
            if (vagoes[n] === janela) return 3;
            if (p === 3) return 2;
            return p;
        });
        escreveVagas();
    }

    var relogios = [];
    var escrita  = 0;
    var rodando  = false;

    function limpa() {
        relogios.forEach(clearTimeout);
        relogios = [];
    }

    function daqui(ms, fn) {
        relogios.push(setTimeout(fn, ms));
    }

    /* Só uma escrita por vez. A volta pode ser cortada no meio da
       frase por uma rolagem ou por uma aba que dorme, e sem o número
       da vez a digitação velha continuaria comendo letra da nova. */
    function digita(txt, fim) {
        var meu = ++escrita;
        var i = 0;

        function passo() {
            if (meu !== escrita) return;
            i += 1;
            campo.textContent = txt.slice(0, i);
            caixa.scrollLeft = caixa.scrollWidth;
            /* 24 a 36ms, com média nos 30 do compasso. Tecla em
               intervalo cravado lê como máquina, e o tremor de poucos
               ms é o que a mão acrescenta.
               DAS MARCAS DO PALCO NENHUMA DEPENDE DISSO, porque desde
               24/08/2026 elas contam do COMEÇO da digitação. Do FIM dela
               dependem duas: o floreio da pílula, que sempre dependeu, e
               o AVANÇO DO CICLO, que passou a depender em 31/08/2026 —
               e é este reagendamento por letra, que escorrega inteiro
               quando o celular represa os timers, que o avanço agora
               espera em vez de atropelar. */
            if (i < txt.length) daqui(POR_LETRA - 6 + Math.random() * 12, passo);
            else fim();
        }

        passo();
    }

    /* A TROCA SILENCIOSA, no quadro do "monta". Ela é a única parte
       desta peça que existe para não ser vista, e o roteiro é o mesmo do
       religamento: pôr o palco em silêncio, mexer, forçar o assentamento
       e devolver as transições. Sem a .is-mudo, a janela de verdade
       voltaria da perto-esquerda para o centro deslizando 268px, ou
       seja, a peça faria o caminho de volta na frente de quem lê.

       O ENDEREÇO ENTRA AQUI DESDE 24/08/2026, e ele morava na varredura.
       A mudança é obrigação da esteira e não gosto: a janela que chega
       ao centro é um dos fantasmas, e o endereço dela já acendeu no
       caminho. Se a de verdade só recebesse o texto na varredura, o
       quadro da troca teria domínio escrito de um lado e barra vazia do
       outro, que é exatamente o pisca que a troca existe para evitar.
       Ele só tem trabalho de verdade uma vez, na primeira volta depois
       antes de a espera de 1s existir; hoje a barra já chega escrita da
       pose de nascença e isto é repetição inofensiva, e mantê-la é mais
       barato que uma condição para alguém entender depois. */
    function troca() {
        palco.classList.add('is-mudo');
        assenta();
        barra.textContent = ENDERECO;
        void palco.offsetWidth;
        palco.classList.remove('is-mudo');
    }

    /* Uma volta inteira, e desde 24/08/2026 à noite existe UM SÓ TIPO DE
       VOLTA. O parâmetro 'frio' morreu aqui junto com o arranque frio, e
       vale contar por que, porque ele era peça antiga desta máquina:
       ENQUANTO A CENA COMEÇAVA DO ZERO, o primeiro arranque tinha de pular
       o esvaziamento — não havia nada escrito para esvaziar nem tela
       nenhuma para recuar, e fingir uma seria mostrar um resultado que
       ninguém pediu. Com a espera de 1s, a cena passou a começar da POSE DE
       NASCENÇA, que é o ato 1 revelado com o pedido 1 na pílula. Existe
       resposta anterior, existe frase para apagar, e a primeira volta é uma
       volta como as outras: a pílula esvazia, a fila anda e a janela parte
       mostrando o conteúdo, que é exatamente o que a esteira foi desenhada
       para fazer. O arranque frio era o único lugar em que ela partia
       mostrando esqueleto.
       E É POR ISSO QUE A PRIMEIRA VOLTA CHAMADA É A DO ATO 2, lá no
       acorda(): o ato 1 já está em cartaz durante a espera, e retomar nele
       faria a pílula apagar a frase 1 para escrever a frase 1 de novo. A
       ordem que o visitante vê é a ordem da história — o link já está
       pronto, agora vem a nota, depois a antecipação, e aí o link se
       refaz. */
    function ciclo(i) {
        palco.dataset.fase = 'apaga';
        palco.dataset.pilula = 'vazia';

        daqui(ESVAI, function () {
            campo.textContent = '';
            caixa.scrollLeft = 0;
            /* A BARRA DE ENDEREÇO NÃO ESVAZIA JUNTO COM A PÍLULA, e
               isso mudou em 24/08/2026 com a troca de assunto da
               seção. Enquanto cada volta abria um site diferente, o
               domínio velho parado em cima de um esqueleto dizia que a
               página sendo montada era a anterior, e por isso ele saía
               aqui. Agora o endereço é o mesmo nos três atos: a pessoa
               não navegou para lugar nenhum, ela mandou outra mensagem
               dentro do mesmo painel, e navegador de verdade não pisca
               o endereço quando nada navega. */
            palco.dataset.fase = 'esteira';
            palco.dataset.pilula = 'escrevendo';

            /* A FILA ANDA NO MESMO QUADRO DA PRIMEIRA LETRA, e o "no
               mesmo quadro" é a ordem do dono: "em conjunto com a caixa
               de texto digitando, para ser algo fluido". A alternativa
               de dar uns 100ms de atraso, para a causa vir antes do
               efeito, foi medida no render e descartada: com a curva de
               entrada e saída da esteira, os primeiros 100ms já são
               quase parados, e o atraso lê como fila lerda em vez de
               fila obediente. O deslize inteiro é CSS, em transição de
               transform; aqui só se gira a lista. */
            desliza();

            /* AS QUATRO MARCAS DO PALCO SÃO IRMÃS DA DIGITAÇÃO e não
               filhas dela, e esta indentação é a mudança de 24/08/2026 à
               noite. Elas eram disparadas DENTRO do fim da digitação, o
               que fazia a resposta esperar a última letra; agora são
               agendadas aqui, no mesmo quadro em que a primeira letra
               cai, e correm em paralelo com quem escreve. É literalmente
               isto que o dono pediu: o escritório começa a trabalhar
               enquanto você ainda está escrevendo.
               SÃO QUATRO E NÃO CINCO, e em 31/08/2026 isso ficou verdade
               de fato. O avanço do ciclo morava nesta mesma indentação,
               fingindo-se de quinta irmã, e era o único intruso: as
               quatro só ACENDEM coisas em cima do que a digitação vai
               escrevendo, e por isso podem correr ao lado dela; ele
               APAGA, e por isso nunca pôde. Ele desceu para o fim da
               digitação, que é onde o floreio já morava. */
            daqui(ASSENTA, function () { troca(); palco.dataset.fase = 'monta'; });

            /* O PRIMEIRO QUADRO DA VARREDURA faz duas coisas de uma vez:
               a alça da tela em cartaz passa adiante e a fase muda.
               (O endereço saiu daqui e foi para a troca, e o scrollLeft
               foi para o fim da digitação; o porquê está em cada um.)
               ELA NASCE 80ms DEPOIS DA TROCA e nunca antes: a janela que
               está no centro até o assentamento é a FANTASMA, a que
               ainda vai embora, e a luz atravessando ela revelaria a
               tela dentro de uma peça que some no quadro seguinte. */
            daqui(VARRE, function () {
                telas.forEach(function (t, n) { t.classList.toggle('is-vez', n === i); });
                palco.dataset.ciclo = String(i + 1);
                palco.dataset.fase = 'varre';
            });

            daqui(FIM_VARRE, function () { palco.dataset.fase = 'repouso'; });

            /* O PRAZO DE PAREDE DO CICLO É ANOTADO AQUI E COBRADO LÁ
               EMBAIXO, no fim da digitação. É o mesmo instante de sempre
               — FIM_VARRE mais REPOUSO contados deste quadro —, só deixou
               de ser um setTimeout solto.
               31/08/2026: nesta linha morava um
               `daqui(FIM_VARRE + REPOUSO, function () { ciclo(...) })`, e
               era ele que atropelava a frase no celular. O `fase =
               'repouso'` da linha de cima PODE continuar no relógio de
               parede, e continua: ele é contrato com os keyframes do CSS,
               que correm no compositor e não esperam ninguém, e a
               varredura fechar com a pílula ainda escrevendo é a cena que
               o dono pediu em 24/08. Quem nunca podia ter corrido solto
               era só o AVANÇO. */
            var prazo = performance.now() + FIM_VARRE + REPOUSO;

            /* E O FLOREIO DA PÍLULA, que é a única coisa que ainda conta
               do FIM da digitação, porque é a única que fala da frase.

               O SCROLLLEFT VOLTA A ZERO AQUI, e o lugar mudou junto com
               a âncora. Ele só tem trabalho no celular, onde a frase não
               cabe na caixa: durante a digitação o campo empurra o texto
               para a esquerda para o cursor ficar à vista (certo), mas
               depois ele ficaria parado no fim, e o repouso inteiro
               mostraria o complemento em número sem o verbo que diz o
               que foi pedido. Ele morava no primeiro quadro da
               varredura, com o argumento de que ali o olho está na
               janela; o argumento sobreviveu à mudança de âncora, porque
               este instante cai no MEIO da varredura, que é quando o
               olho está ainda mais lá em cima. Salto seco, sem rolagem
               suave, pelo mesmo motivo. */
            digita(CICLOS[i].pedido, function () {
                daqui(FLOREIO, function () {
                    caixa.scrollLeft = 0;
                    palco.dataset.pilula = 'envio';
                });
                daqui(FLOREIO + 240, function () { palco.dataset.pilula = 'cheia'; });

                /* E O AVANÇO DO CICLO NASCE AQUI DESDE 31/08/2026, no fim
                   da digitação, e não mais no quadro da primeira letra. A
                   conta é "o que vier por último": ou o que ainda falta
                   do prazo de parede, ou o floreio inteiro mais a leitura
                   mínima — o maior dos dois.
                   NO CAMINHO NORMAL O PRAZO GANHA SEMPRE, e por muito: a
                   frase mais longa fecha em 1,70s e o prazo vence aos
                   4,48s, então o `falta` vale uns 2,8s contra os 1,04s do
                   piso, e o ciclo vira no mesmo milissegundo em que virava
                   antes desta mudança. O piso só entra em cena com timer
                   represado, que é justamente quando ele é o que impede a
                   pílula de engolir a própria frase.
                   E ISTO MATA DE GRAÇA UM SEGUNDO DEFEITO do arranjo
                   antigo. Os dois floreios são agendados nas linhas de
                   cima, e agora o avanço vem DEPOIS deles por construção,
                   nunca mais em paralelo: acabou a chance de um 'envio' ou
                   um 'cheia' atrasado cair em cima de um ciclo que já
                   recomeçou, ressuscitando a frase velha no meio do fade
                   ou tirando o cursor de uma digitação em curso. */
                var falta = prazo - performance.now();
                daqui(Math.max(falta, FLOREIO + 240 + LEITURA_MIN), function () {
                    ciclo((i + 1) % CICLOS.length);
                });
            });
        });
    }

    function dorme() {
        if (!rodando) return;
        rodando = false;
        escrita += 1;
        limpa();
        /* A .is-parado congela os keyframes pelo
           animation-play-state; o relógio já parou na linha de cima.
           As duas metades são necessárias: sem a classe, uma
           varredura começada terminaria de atravessar o viewport com
           a seção fora da tela. */
        palco.classList.add('is-parado');
    }

    function acorda() {
        if (rodando || document.hidden) return;
        rodando = true;
        palco.classList.add('is-vivo');
        palco.classList.remove('is-parado');

        /* O QUADRO MUDO devolve a POSE DE NASCENÇA, e ela mudou de conteúdo
           em 24/08/2026 com a ordem da espera de 1 segundo. Antes daqui saía
           o estado do ARRANQUE FRIO — fila na vaga de nascença, esqueleto no
           lugar, pílula vazia, barra de endereço vazia e nenhuma tela em
           cartaz — porque a digitação começava 280ms depois e ninguém via
           aquilo. Com um segundo inteiro de cena parada, aquele estado
           viraria o que a ordem do dono veio evitar: um segundo de janela
           vazia.
           O QUE SAI DAQUI AGORA é repouso/cheia/1, que é LETRA POR LETRA a
           pose com que o HTML nasce: ato 1 revelado, pedido 1 inteiro na
           pílula e o endereço na barra. A mesma pose que a página entrega a
           quem chega sem JavaScript e a quem pede menos movimento, o que faz
           o começo da cena e o repouso da página serem a mesma coisa por
           construção, e não por duas listas que alguém tem de manter iguais.

           O QUADRO CONTINUA MUDO pelo motivo de sempre: zerar a cena com as
           transições ligadas seria uma rebobinada de quase um segundo antes
           de a peça começar, e ela tem de começar no primeiro quadro em que
           aparece.

           A FILA VOLTA À VAGA DE NASCENÇA AQUI, e esta linha é a
           contrapartida do corte de transição que a .is-parado faz: quem
           sai da tela no meio de um deslize assenta na vaga de destino e
           fica lá, com a lista dizendo uma coisa e o desenho outra. O
           religamento é o lugar certo de acertar as duas, e ele já
           acontece em silêncio. */
        palco.classList.add('is-mudo');
        onde = berco.slice();
        escreveVagas();
        telas.forEach(function (t, n) { t.classList.toggle('is-vez', n === 0); });
        campo.textContent = CICLOS[0].pedido;
        caixa.scrollLeft = 0;
        barra.textContent = ENDERECO;
        palco.dataset.ciclo = '1';
        palco.dataset.fase = 'repouso';
        palco.dataset.pilula = 'cheia';
        void palco.offsetWidth;              // assenta o estado sem animar
        palco.classList.remove('is-mudo');
        void palco.offsetWidth;              // e devolve as transições

        /* A ESPERA DE 1s, e ela entra pelo daqui() de propósito: assim o
           timer mora na lista de relógios que o dorme() limpa. Se a seção
           sair de cena antes de a espera vencer, ela é CANCELADA junto com
           todo o resto, e a cena não arranca fora da tela para o visitante
           voltar no meio de uma volta que ele não viu começar.
           A VOLTA CHAMADA É A DO ATO 2 (índice 1), e o porquê está na regra
           do ciclo(): o ato 1 é o que fica em cartaz durante a espera. */
        daqui(ESPERA, function () { ciclo(1); });
    }

    if ('IntersectionObserver' in window) {
        /* O 0,35 é mais alto que os 0,25 dos irmãos porque a peça é
           mais alta que um card: com um quarto dela na tela, o que
           apareceu é o cabeçalho e a pílula, e a digitação começaria
           com a janela ainda fora do quadro. */
        var io = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (e.isIntersecting) acorda();
                else dorme();
            });
        }, { threshold: 0.35 });
        io.observe(secao);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { dorme(); return; }
        /* Voltando para a aba o observador não dispara sozinho, então
           a conta de "está na tela" é feita à mão, com a mesma fração
           de 0,35 do limiar. */
        var r = secao.getBoundingClientRect();
        var visivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (visivel > 0 && visivel / r.height >= 0.35) acorda();
    });
})();

/* ============================================================
   SEÇÃO 3B-bis: OS BENEFÍCIOS (ben-), O DISPARADOR DE ATO
   24/08/2026, noite
   ============================================================

   O QUE ESTE BLOCO FAZ, E É SÓ ISSO: ele responde uma pergunta, "qual
   dos blocos de texto está na faixa do meio da tela agora?", e
   escreve a resposta no data-ato da seção. O CSS faz todo o resto. Não
   há aqui uma linha de posicionamento, de opacidade ou de tempo.

   O SCROLL DISPARA, NÃO ESFREGA, e essa é a decisão que separa a
   referência da Shopify de um scrubbing barato. A posição da barra não é
   um cursor dentro de uma linha do tempo: ela só troca um atributo, e a
   partir daí a transição do CSS roda no tempo dela, com a curva dela,
   inteira, independente de o visitante rolar devagar, depressa ou parar
   no meio. Peça que só existe enquanto o dedo se mexe é peça que ninguém
   vê inteira. Quando as artes chegarem, cada uma com a cascata
   dela pendurada nos mesmos seletores [data-ato="N"], é essa
   independência que vai deixar as cascatas rodarem do começo ao fim.

   E POR ISSO NÃO HÁ LISTENER DE SCROLL AQUI. Nada de onscroll, nada de
   requestAnimationFrame, nada de conta por quadro. Um IntersectionObserver
   com a faixa do meio recortada por rootMargin resolve a mesma pergunta
   sem custo por quadro e sem thrash de layout: o navegador já sabe onde
   os elementos estão, e perguntar a ele é mais barato e mais correto do
   que remedir tudo a 60 vezes por segundo enquanto a página anda.

   OS -45% DE CIMA E DE BAIXO deixam viva uma tira de 10% da altura da
   janela, bem no meio. É estreita de propósito: cada .ben-bloco tem uma
   tela de altura, então uma tira fina garante que exatamente UM bloco a
   ocupe por vez. Numa faixa larga dois blocos vizinhos entrariam juntos
   no fim de um e no começo do outro, as duas entradas chegariam no mesmo
   lote e o data-ato piscaria entre dois valores dentro da mesma rolagem.
   Com 10% isso não acontece nem no limite entre dois blocos.

   O ESTADO INICIAL JÁ VEM DO HTML, e desde 26/08/2026 ele é data-ato="2"
   e não "1": o dono mandou excluir o bloco do ato 1 e o primeiro ato da
   seção passou a ser o 2, sem renumerar os que ficaram. O observador é
   confirmação, não fundação: antes de a seção chegar perto da tela nenhuma
   entrada disparou, e se o JS falhar ou demorar a página ainda mostra o
   primeiro ato com a cena dele acesa em vez de um palco vazio.
   QUEM MEXER NO PRIMEIRO ATO DA SEÇÃO mexe nesse atributo do HTML junto,
   ou a página nasce com um data-ato que não corresponde a bloco nenhum e o
   palco fica vazio até a primeira rolagem. A mesma linha resolve o pouso com âncora e a volta de aba.

   A GUARDA DE EXISTÊNCIA no topo protege qualquer documento que carregue
   este arquivo sem ter a seção dentro. Hoje são dois os documentos com
   <script src="script.js">: a home, que tem a seção, e o bancável
   _medida_cli.html, que não tem. As outras sete páginas do site NÃO
   carregam este arquivo, e a primeira redação deste comentário, na noite
   de 24/08/2026, dizia que carregavam. Era falso e a auditoria pegou.
   A guarda continua obrigatória pelos dois motivos que sobraram, que são
   suficientes: o bancável já é um caso real de documento sem a seção, e
   qualquer página futura que venha a incluir este arquivo entra na mesma
   situação. Sem ela o observador nasceria vigiando uma lista vazia.
   ============================================================ */
(function () {
    var sec = document.querySelector('.ben-section');
    if (!sec) return;

    var blocos = sec.querySelectorAll('.ben-bloco');
    if (!blocos.length) return;

    /* Sem IntersectionObserver a seção não quebra: os textos continuam
       empilhados e legíveis, e o palco fica no ato que o HTML já carimbou,
       que desde 26/08/2026 é o 2. Degradar para uma cena parada é melhor do que
       degradar para um listener de scroll que ninguém vai manter. */
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            /* Só a ENTRADA na faixa manda. A saída não é lida de
               propósito: quem sai da tira do meio está sendo substituído
               por quem entra, e apagar o ato na saída deixaria o palco
               vazio no intervalo de um quadro entre as duas leituras.
               O ato só troca quando existe um ato novo para valer. */
            if (!e.isIntersecting) return;
            var ato = e.target.dataset.ato;
            if (ato && sec.dataset.ato !== ato) sec.dataset.ato = ato;
        });
    }, {
        /* A tira de 10% no meio da janela. Ver o cabeçalho para a conta
           de por que ela é fina. */
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
    });

    blocos.forEach(function (b) { io.observe(b); });
})();


/* ============================================================
   SEÇÃO 3B-bis: O INTERRUPTOR DOS FUNDOS POR ATO
   25/08/2026
   ============================================================

   TRÊS LINHAS DE JS PARA UM ATRIBUTO, e vale explicar por que elas
   existem em vez de a folha resolver sozinha.

   O CSS já sabe QUAL fundo mostrar: os quatro motivos se penduram no
   mesmo data-ato das cenas e trocam com o mesmo crossfade. O que ele
   não sabe é QUANDO A SEÇÃO CHEGOU. O data-ato já vale um número desde o
   HTML (era "1" e é "2" desde a exclusão do ato 1, em 26/08/2026),
   então o motivo do ato 1 estaria com o estado final aplicado desde o
   primeiro quadro da página, muito antes de alguém rolar até lá: quando
   o visitante finalmente chegasse, as ondas já estariam abertas e a
   entrada que o dono pediu nunca teria acontecido. Entrada que acontece
   com ninguém olhando não é entrada.

   ENTÃO O ATRIBUTO É UM INTERRUPTOR DE PRESENÇA, e ele liga na entrada e
   DESLIGA na saída. Desligar é o que faz a re-entrada rearmar: quem sai
   da seção e volta vê os quatro motivos nascerem de novo, do mesmo jeito
   que sair do ato 1 e voltar rearma a cascata do celular. É a mesma
   mecânica das cenas, na moeda da seção inteira.

   E ELE NÃO DUPLICA O OBSERVADOR DE ATO. São perguntas diferentes: o
   bloco de cima responde "qual ato está no meio da tela", este responde
   "a seção está na tela". Duas respostas para a MESMA pergunta é como um
   palco passa a piscar, e é por isso que não há um segundo observador de
   scroll em lugar nenhum desta seção.

   O threshold é 0 e não uma faixa: o palco é sticky e ocupa a tela
   inteira assim que a seção encosta na dobra, então qualquer pedaço de
   seção visível já significa fundo em cena.
   ============================================================ */
(function () {
    var sec = document.querySelector('.ben-section');
    if (!sec || !('IntersectionObserver' in window)) {
        /* Sem observador, os fundos ficam ligados e sem entrada. Degradar
           para um motivo parado é melhor que degradar para nenhum. */
        if (sec) sec.dataset.fundo = 'on';
        return;
    }

    new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
            if (e.isIntersecting) sec.dataset.fundo = 'on';
            else delete sec.dataset.fundo;
        });
    }, { threshold: 0 }).observe(sec);
})();


/* ============================================================
   SEÇÃO 3B-ter: O RELÓGIO DAS ARTES DOS ATOS
   (bmq-, blk-, bnf- e bnff-, bcx- e bcxf-)
   24/08/2026, noite · generalizado em 25/08/2026, madrugada
   ============================================================

   O DESENHO TODO É CSS; aqui mora só o RELÓGIO. Cada marca é o instante
   em que a arte troca de fase, e as fases SE ACUMULAM: a cena nunca volta
   atrás no meio de uma volta. Quem zera tudo é o religamento, num quadro
   mudo, e é a mesma mecânica da ofg- do Open Finance, de onde esta arte
   herdou o vocabulário inteiro.

   ================= ELE VIROU UMA TABELA, 25/08/2026 =================
   O BLOCO NASCEU PARA UMA CENA SÓ e agora toca AS QUATRO, e nenhuma delas
   ganhou um irmão copiado: o condutor virou uma TABELA DE CENAS e o corpo
   dele passou a ser uma função que se monta uma vez por linha da tabela.
   Cada linha diz quatro coisas e nada mais: em que ATO ela toca, qual é o
   ELEMENTO da arte, quais são as FASES dela e onde caem as MARCAS do
   relógio. Tudo o mais é comum e continua escrito uma vez só: o quadro
   mudo, a espera de meio segundo, a porta única, o pouso do movimento
   reduzido e as três coisas que contam como ativação.

   A GENERALIZAÇÃO FOI DE PARCIMÔNIA, e vale escrever o que ela NÃO fez.
   Não virou um motor de animação, não ganhou opções, não ganhou um jeito
   de uma cena declarar curva ou duração (isso é assunto da folha, e é onde
   tem que continuar sendo). O que ela evitou é o contrário disso: sem a
   tabela, a arte do ato 3 teria virado um segundo bloco de sessenta linhas
   com a mesma mecânica e um erro de cópia esperando acontecer. As artes
   dos atos 2, 3 e 4 entraram como uma linha cada, sem tocar no corpo.

   E OS OBSERVADORES CONTINUAM SENDO DOIS, um de atributo e um de tela,
   para a seção INTEIRA, e não dois por cena. Isso é a mesma disciplina
   escrita nos blocos de cima: duas respostas para a mesma pergunta é como
   um palco passa a piscar. Cada cena montada devolve a porta dela
   (confere), e os dois observadores chamam todas as portas de uma vez; a
   variável naTela é única e mora fora das cenas porque a pergunta que ela
   responde ("a seção está na tela") também é uma só.
   A CONSEQUÊNCIA DE MUNDO é que sair do ato 1 já para o relógio da cena 1
   no mesmo instante em que a porta da cena 3 é consultada, sem nenhum
   estado compartilhado entre as duas além dessa resposta.

   A DIFERENÇA PARA A ofg- É QUE ESTA NÃO DÁ VOLTA. Lá a cena roda em
   loop de 8,36s enquanto o card estiver na tela, porque o card é um
   quadro parado numa grade e a repetição é o que o mantém vivo. Aqui a
   arte é uma CENA DE ATO: ela roda uma vez por ativação e descansa no
   quadro final, que é o estado que o texto ao lado está sendo lido
   contra. Repetir seria uma segunda cobrança acontecendo enquanto alguém
   lê sobre a primeira.

   O QUE CONTA COMO ATIVAÇÃO são três coisas ao mesmo tempo: o data-ato
   da seção vale "1", a seção está na tela e a aba está visível. Qualquer
   uma delas virando falsa desliga o relógio; as três voltando a ser
   verdadeiras tocam a cascata DO ZERO. Na prática isso quer dizer que
   descer para o ato 2 e voltar reinicia a cena, que foi o pedido, e que
   trocar de aba no meio dela não deixa metade da cascata acontecendo às
   escuras.

   E O GATILHO É O MESMO data-ato QUE O CSS LÊ, por MutationObserver no
   atributo. Não há um segundo observador de scroll aqui e não pode
   haver: o bloco de cima já respondeu a pergunta de qual ato está no
   meio da tela, e duas respostas para a mesma pergunta é como um palco
   passa a piscar.

   A CENA NÃO REAGE A CLIQUE, e isto é ordem do dono de 25/08/2026, de
   madrugada. O replay no clique existiu da v1 até aqui e morreu inteiro;
   a lápide dele está lá embaixo, no lugar onde o listener morava. O único
   replay que sobrou é a RE-ENTRADA no ato, que é mecanismo do
   scrollytelling e não interação: sair para o ato 2 e voltar rearma a
   cena com a espera de 500ms, igual à primeira vez.

   O MOVIMENTO REDUZIDO POUSA NO QUADRO FINAL, e este é o ponto em que
   este bloco diverge da ofg-. Lá o condutor simplesmente desiste
   (`if matches return`), e a cena fica no primeiro quadro, que naquela
   peça é uma maquininha vazia. Aqui o primeiro quadro é uma cobrança que
   nunca foi aprovada, ou seja, o contrário do que o texto ao lado
   afirma. Então as OITO fases entram DE UMA VEZ e o gate da folha zera as
   durações: o resultado é o descanso, com o aparelho vertical e crescido,
   o selo desenhado e a notificação pousada em cima dele. Quem pediu menos
   movimento pediu menos movimento, não menos conteúdo.

   A LINHA DO TEMPO, e de onde cada número saiu. A régua da casa é
   distância manda na curva, consequência pede atraso, e a volta não é a
   ida rebobinada.

   ELA FOI REESCRITA TRÊS VEZES. Primeiro em 24/08/2026, à noite, quando o
   dono reditou a coreografia depois de ver a v1: nasceram a vida do
   aparelho e o palco, e a ordem da saída do cartão e da notificação se
   inverteu. Depois em 25/08/2026, quando ele mandou a entrada contar o
   TÍTULO DA SEÇÃO em duas batidas em vez de uma: a abertura virou
   is-corpo mais is-acorda, o cartão passou a esperar a tela existir, e o
   total foi de 5,78 para 6,48s. E de novo em 25/08, mais tarde, quando ele
   viu a coisa rodando e disse que estava demorando: a abertura foi
   comprimida e o total voltou para 5,78s, com uma batida a mais do que
   tinha quando media isso da primeira vez. A arqueologia por extenso está
   no fim desta tabela.

   O PRINCÍPIO DA SEGUNDA REESCRITA, e ele vale mais que os números: onde
   faltou tempo, ENCAVALOU-SE batida em vez de esticar o fim, porque a
   ignição da tela invade a entrada do cartão, o cartão sai enquanto o
   palco se prepara e a notificação parte antes de o palco terminar. Fim
   esticado é fim morto. O PRINCÍPIO DA TERCEIRA é o irmão dele: onde
   sobrou tempo, CORTOU-SE NA BATIDA COM MENOS INFORMAÇÃO NOVA, e não um
   tanto igual em cada uma. Encurtar tudo na mesma proporção teria levado
   junto a pausa que separa "chegou" de "acordou", que é a única coisa ali
   que não é enfeite.

     0     is-corpo    "SEU CELULAR". O aparelho sobe 96px em 560ms de
                       expo-out e assenta na inclinação de 6 graus, com a
                       TELA MORTA: vidro preto, sem glifo, sem valor, sem
                       linha. É o objeto de todo dia. O halo acende junto,
                       em 620.
     760   is-acorda   "VIROU MAQUININHA". 200ms depois de o aparelho
                       assentar, a tela ACORDA em cascata, e é aqui que a
                       arte cumpre o verbo do título. Três degraus com 120
                       de intervalo: o glifo acende em 360 e emenda direto
                       no pulso de espera, o valor sobe 8px aparecendo em
                       320 (atraso 120) e a instrução aparece em 300
                       (atraso 240). A cascata fecha em 1300.
     1200  is-cartao   Ele só pode partir DEPOIS de a tela existir, que é
                       ordem de direção e faz sentido de mundo: a
                       maquininha está pronta antes de o cliente chegar. Os
                       100ms de encavalamento com o fim da cascata são
                       deliberados, e caem sobre o degrau menos importante
                       dela (a instrução), nunca sobre o valor. A viagem
                       são 408px em 1000ms, e não os 1160 da v2: o percurso
                       é o mesmo, a expo-out aguenta, e os 160 economizados
                       são o que paga a batida nova sem esticar o fim.
     2280  is-perto    80ms depois de o cartão assentar, ele desce os
                       30px do toque em 480ms.
     2820  is-tap      As ondas disparam (três, escalonadas 150ms), a
                       tela estala 120ms depois e o glifo acende. Os
                       60ms entre a chegada e o toque são folga de
                       encosto, não pausa.
     3220  is-ok       400ms depois do toque, que é o atraso de
                       consequência que a direção pediu e a mesma
                       distância que a ofg- pratica entre tap e ok. Aqui
                       a tela também fica VERDE.
     3900  is-saida    O cartão vai embora por caminho e curva
                       diferentes da entrada, 720ms. O instante não é
                       escolhido no olho: 3900 é exatamente quando o
                       recuo dele termina (3220 + 160 de atraso + 520 de
                       viagem). A mão relaxa e só então solta.
     4520  is-palco    O aparelho ENDIREITA para a vertical, SOBE 28px e
                       CRESCE 30% em 760ms, a tela clareia em 620 e o selo
                       se desenha em 540 com 260 de atraso. Três coisas na
                       mesma batida porque são a mesma notícia: a tela
                       assumiu a cena e está lavrando o comprovante.
                       O CRESCIMENTO ERA DE 8% ATÉ 25/08/2026, quando o
                       dono mandou o aparelho terminar 20% maior do que
                       terminava ("quando passa o cartão, o celular anime
                       até aumentar +20% do que ele está hoje"). 1,08 vezes
                       1,20 dão 1,30, e a subida de 28px é o que impede o
                       pé do aparelho de ser ceifado pelo recorte da caixa;
                       a conta das duas coisas está no comentário da
                       .bmq-fone. Os 640ms viraram 760 pela régua da
                       distância: a borda de cima passou a viajar 80px em
                       vez de 14.
                       OS 4520 SÃO O INSTANTE EM QUE O CARTÃO FICA
                       INVISÍVEL, e não em que ele para: a opacidade dele
                       fecha em 4500 (3900 + 120 de atraso + 480), enquanto
                       o transform ainda corre até 4620. Esperar o
                       movimento inteiro custaria 120ms por uma peça que
                       ninguém enxerga mais.
     5020  is-noti     500ms depois de o palco começar, que é o atraso de
                       consequência entre lavrar e parir. A notificação sai
                       de dentro da tela, sobe 245px, cruza 300 de
                       profundidade e endireita 64 graus em 760ms, pousando
                       SOBRE A TELA VERDE, com a ponta do aparelho à vista
                       acima dela (25/08/2026: eram 231px de subida e um
                       pouso na aresta, que apagava a aresta; a conta da
                       pose nova está no comentário da .bmq-noti).
                       ELA PARTE COM O APARELHO AINDA CRESCENDO, e é de
                       propósito. O palco fecha em 5280 e o parto começa em
                       5020, então há 260ms de encavalamento, contra 140 da
                       redação anterior. Nos primeiros quadros a peça está
                       a 300px de profundidade e quase transparente, ou
                       seja, ninguém a lê enquanto o fundo ainda se mexe;
                       e o pouso, que é o que precisa de alvo parado,
                       acontece em 5780, meio segundo depois de o aparelho
                       assentar.
     5780              Descanso. A cascata inteira mede 5,78s.

   ================= A ARQUEOLOGIA DO RELÓGIO =================
   A ABERTURA JÁ TEVE TRÊS TEMPOS, e o terceiro é ordem do dono de
   25/08/2026: "quero que o primeiro ato da animação (aparecendo os valores
   no celular) aconteça de uma maneira mais rápida. A animação está
   demorando."
     · v2. A subida ERA a cena inteira: 144px de percurso e nenhuma
       segunda batida. A tela já vinha escrita.
     · v3 (25/08, de madrugada). O dono mandou a entrada contar o título em
       duas batidas, e nasceram os 820 de subida, os 400 de pausa morta e a
       cascata de 780. A abertura passou a medir 1900ms até o cartão
       partir, e a cena inteira 6,48s.
     · v7 (25/08, mais tarde). Ele viu rodar e achou lento. A abertura caiu
       de 1900 para 1200ms, 36,8% a menos, e o total foi de 6,48 para
       5,78s. NADA DO TOQUE EM DIANTE MUDOU: is-perto, is-tap, is-ok,
       is-saida, is-palco e is-noti guardam a mesma distância entre si e em
       relação à chegada do cartão, porque cada uma dessas batidas foi
       aprovada em rodada própria. O relógio encolheu só pelo que a
       abertura devolveu, e todas elas andaram os mesmos 700ms para trás.

   ONDE O TEMPO FOI CORTADO, e por que em três lugares e não em um:
     · SUBIDA 820 -> 560. O percurso não mudou (os mesmos 96px), então a
       curva não muda: expo-out gasta a velocidade cedo e chega freando, e
       ela aguenta encurtar sem virar tranco. Cortar aqui é o que mais
       devolve tempo pelo que menos custa em leitura, porque a subida é a
       batida com menos informação nova.
     · PAUSA MORTA 400 -> 200. Ela ENCOLHE MAS NÃO MORRE, e isso é régua da
       casa: consequência pede atraso, e é essa pausa que separa "chegou"
       de "acordou". Em zero, a tela acenderia durante o assentamento e as
       duas batidas viravam uma só, que é justamente o que a v3 foi criada
       para desfazer. O que sobra ainda é a tela morta visível: o aparelho
       fica opaco em 480 e a tela só acende em 760.
     · CASCATA, degraus 180 -> 120 e durações um degrau menores (520/460/420
       viram 360/320/300). O intervalo entre os degraus é o que faz a
       cascata ler como cascata; 120ms ainda é o dobro de um quadro de
       60fps, então a ordem glifo -> valor -> instrução continua legível
       como sequência e não como flash.
   O HALO ACOMPANHOU (860 -> 620) porque ele é parte da primeira batida: luz
   que continua chegando 300ms depois de a tela já ter acendido embaralha
   qual batida está acontecendo.

   ================= AS LINHAS DO TEMPO MUDARAM DE CASA =================
   Este cabeçalho descreveu por um tempo a cascata de CADA arte por
   extenso, e isso parou de escalar quando a tabela passou de duas para
   seis linhas. Hoje cada linha da tabela CENAS carrega o roteiro dela no
   comentário da própria linha, que é onde ele fica ao lado dos números que
   descreve. O que sobra aqui em cima é o que é COMUM: o mecanismo, a
   espera, o quadro mudo, o pouso do movimento reduzido e a arqueologia do
   relógio do ato 1, que é o único que ainda mora aqui porque nasceu antes
   da tabela e é longo demais para caber numa linha dela.
   A LINHA DO TEMPO DO ATO 3 FOI A PRIMEIRA A DESCER, em 25/08/2026, quando
   a composição dele foi trocada por ordem do dono: a antiga (uma conversa
   com bolhas, sete fases, 4,81s) morreu inteira e a nova é conduzida por
   GEOMETRIA e não por ritmo, com as marcas calculadas a partir da curva da
   reta do fundo. Uma tabela dessas não cabe em prosa de cabeçalho: ela
   precisa estar encostada nos números.

   A GUARDA DE EXISTÊNCIA no topo é a mesma do bloco de cima e pelo mesmo
   motivo: o bancável _medida_cli.html carrega este arquivo e não tem a
   seção dentro. Agora ela é DUPLA: a guarda de fora protege o documento
   sem a seção, e a de dentro, por cena, protege o ato cuja arte ainda não
   existe. É ela que permite a tabela ter uma linha para cada ato à medida
   que as artes forem nascendo, sem que a ausência de uma derrube as
   outras.
   ============================================================ */
(function () {
    var sec = document.querySelector('.ben-section');
    if (!sec) return;

    /* ---- A TABELA DE CENAS ----
       Uma linha por arte que existe, e ela diz quatro coisas: em que ATO
       toca, qual é o ELEMENTO, quais são as FASES e onde caem as MARCAS.
       CURVA, DURAÇÃO E POSE NÃO ENTRAM AQUI: são assunto da folha de estilo,
       e o dia em que uma cena precisar declarar tempo DE ANIMAÇÃO neste
       arquivo é o dia em que o desenho vazou para o condutor.
       EXISTE UMA QUINTA COLUNA E ELA É OPCIONAL: `espera`, o intervalo entre
       a ativação e a primeira classe. Ela nasceu em 25/08/2026 à tarde,
       quando o dono mandou a cena do ato 3 começar "no exato momento" em que
       o visitante vê a seção. Linha sem `espera` herda os 500ms de sempre.
       NA MESMA NOITE ELA GANHOU O SEGUNDO INQUILINO: o dono repetiu a ordem
       para o ato 4, com as mesmas palavras ("a animação está demorando para
       começar, quero que comece no exato instante que o usuário visualiza
       ela"), e as duas linhas daquele ato passaram a declarar zero também.
       São QUATRO linhas com zero agora (as duas do ato 3 e as duas do ato
       4) e duas herdando os 500 (atos 1 e 2).
       E A REGRA MUDOU DE FORMA COM ISSO, o que vale registrar: quando só o
       ato 3 tinha zero, a leitura natural era "existe uma exceção". Com
       dois atos, a leitura certa é outra e é a que fica valendo: A ESPERA É
       PROPRIEDADE DO ATO, DITADA PELO DONO CENA A CENA. Não há um valor
       "correto" a que os outros devam convergir, e a assimetria não é
       dívida técnica esperando conserto. Quem chegar aqui e sentir vontade
       de uniformizar as seis linhas está prestes a desfazer duas ordens
       diretas de uma vez.
       ELA NÃO CONTRADIZ A RESSALVA DE CIMA, e a diferença é de natureza:
       espera não é tempo de desenho, é tempo de ATIVAÇÃO, ou seja o
       intervalo entre um evento de scroll e o começo da peça. Isso é assunto
       do condutor por definição, porque a folha não sabe quando a seção
       entrou na tela. A conta inteira está no comentário da ESPERA, lá
       embaixo, junto com o aviso de não uniformizar a assimetria.
       A TABELA FECHOU EM QUATRO LINHAS na madrugada de 25/08/2026, e as três
       últimas nasceram na mesma noite, cada uma numa sessão diferente: o ato
       3, depois o ato 2, depois o ato 4. Nenhuma delas precisou tocar no
       corpo do bloco, e é exatamente para isso que a generalização foi
       feita: a guarda de existência dentro do monta() deixou a tabela
       crescer de uma linha para quatro sem que nenhuma arte tivesse que
       esperar as outras ficarem prontas.
       COM O ATO 2, O VÃO TRACEJADO DA MARCAÇÃO DEIXOU DE EXISTIR na seção
       inteira: ele era o último dos quatro. A regra .ben-vao continua na
       folha, sem inquilino e de propósito, porque é ela que guarda a pegada
       de 640 por 512 contra a qual as artes foram conferidas. */
    var CENAS = [
        /* ============================================================
           LÁPIDE · A LINHA DO ATO 1 (bmqCena) · 26/08/2026
           ============================================================
           AQUI ERA A PRIMEIRA LINHA DA TABELA, a do celular que vira
           maquininha: nove fases e 5,78s, a cascata mais longa da seção.
           SAIU PORQUE O ATO SAIU, por ordem do dono ("exclua o bloco 'Seu
           celular virou maquininha.', deixando apenas os outros 3 blocos").
           POR QUE A LINHA SAI E O CSS FICA, que é a assimetria que salta aos
           olhos de quem varrer os dois arquivos: regra de folha com seletor
           que não casa com nada é tinta que ninguém aplica, custo zero e
           risco zero. LINHA DE TABELA É OUTRA COISA: o monta() procura o id,
           não acha, devolve null e o filter a descarta, então ela também
           não quebraria nada hoje. Mas ela é uma PROMESSA de que aquele id
           vai existir, e a próxima pessoa que recriar um elemento com id
           bmqCena por qualquer motivo ganharia nove timers de brinde. Código
           morto que só ocupa espaço fica; código morto que arma sozinho, não.
           A LINHA INTEIRA, PARA QUEM FOR RESTAURAR, com as marcas no
           caractere (o corpo do HTML está em
           _removido_ato1_celular-maquininha_26-08-2026.html):
             { ato: '1', id: 'bmqCena',
               FASES: ['is-corpo','is-acorda','is-cartao','is-perto','is-tap',
                       'is-ok','is-saida','is-palco','is-noti'],
               MARCAS: [[0,'is-corpo'],[760,'is-acorda'],[1200,'is-cartao'],
                        [2280,'is-perto'],[2820,'is-tap'],[3220,'is-ok'],
                        [3900,'is-saida'],[4520,'is-palco'],[5020,'is-noti']] }
           A ESPERA DELE ERA A HERDADA, 500ms, porque a linha não trazia a
           coluna. Quem restaurar restaura sem ela e recebe os 500 de volta.
           A TABELA TEM TRÊS ATOS E CINCO LINHAS desde hoje: o ato 2 com a
           cena e o globo, o ato 3 com a cena e o fio, e o ato 4 com a cena e
           o fio. A NUMERAÇÃO NÃO FOI REFEITA de propósito: o primeiro ato da
           seção hoje se chama 2, e isso é histórico, não ordinal.
           ============================================================ */
        {
            /* ATO 2 · O LINK QUE VIRA COBRANÇA. NOVE fases, 4,86s desde
               25/08/2026 (eram dez e 5,05s até a décima perder o objeto).
               25/08/2026. QUINTA composição e o quinto relógio. A arqueologia
               das cinco está na folha; aqui fica só o que é do tempo.

               O QUE MUDOU. O dono ditou o mapa exato dos cards e a colagem se
               reorganizou em volta do herói, que virou o CENTRO DO
               EQUILÍBRIO. Sumiu uma batida (o segundo conector, que morreu
               junto com o fio que ligava o herói às taxas: no mapa novo elas
               COBREM o herói, e duas peças que se tocam não precisam de fio
               para dizer que se relacionam) e a ORDEM NARRATIVA passou a ser
               a que o mapa desenha: a mensagem pede, o fio desce, o herói se
               monta, e os dois satélites cobrem por cima.

               ================= A COMPRESSÃO DE 25/08/2026 (noite) =================
               ORDEM DO DONO, com o exemplo dado por ele: "o card TAXAS DE
               PARCELAMENTO e RECEBIMENTOS DE AGOSTO animarem JUNTO. Analise
               para deixar bem mais dinâmica e mais rápida. Estão demorando
               muito". A cena caiu de 4,86s para 2,16s de cascata, as nove
               batidas viraram OITO e as durações da folha encolheram junto.

               O CRITÉRIO É SOBREPOSIÇÃO E NÃO VÃO, que é a lição que o ato 3
               pagou para aprender e que esta tabela agora aplica de propósito:
               o que garante que uma batida seja LIDA não é o silêncio depois
               dela, é o tanto que ela ainda está andando quando a próxima
               começa. Comprimir esticando os vãos deixa a cena lenta e picada;
               comprimir ENCAVALANDO deixa a cena rápida e contínua.
               A SOBREPOSIÇÃO DE CADA BATIDA, medida entre a marca nova e o
               fim da entrada anterior (duração da folha, já encolhida):
                 is-a   -> is-no    240 de vão contra 440 de pouso   200 juntas
                 is-no  -> is-b     320 contra 360 de desenho         40 juntas
                 is-b   -> is-foto  180 contra 470 de pouso          290 juntas
                 is-foto-> is-txt   160 contra 360 de fade           200 juntas
                 is-txt -> is-band  180 contra 490 de escrita        310 juntas
                 is-band-> is-botao 140 contra 340 de fade           200 juntas
                 is-botao-> is-c/d  200 contra 380 de pouso          180 juntas
               NENHUMA BATIDA ESTREIA NO SILÊNCIO, e a menor sobreposição da
               cena é a do conector com o papel do herói (40ms), que é
               justamente onde o encavalamento tem que ser MENOR: o fio precisa
               ter chegado para o card poder nascer onde ele chegou.

               A conta de cada marca:
                    0  is-a      A mensagem monta sozinha, no alto à esquerda.
                                 Ela primeiro porque é o pedido, e a cena
                                 inteira é a consequência dele.
                  240  is-no     O conector sai da aresta direita da mensagem e
                                 pousa no herói em 360ms. São 360 e não os 240
                                 de um fio reto porque o caminho é curvo.
                                 O DESENHO DELE MUDOU EM 27/08/2026, POR ORDEM
                                 DO DONO com referência de builder de fluxo, e a
                                 MARCA E A DURAÇÃO NÃO SE MEXERAM: era um
                                 cotovelo tracejado de 65,5 unidades que descia
                                 até a LATERAL ESQUERDA do herói, e é uma curva
                                 em S sólida de 106,2 que pousa no CENTRO DA
                                 ARESTA SUPERIOR dele ("não tem que conectar no
                                 canto do iphone, tem que ser no centro dele, na
                                 extremidade superior"). O percurso cresceu 62%
                                 e o relógio ficou: a régua da casa escolhe a
                                 curva pela DISTÂNCIA entre as duas peças, e a
                                 travessia é a mesma. O desenho inteiro está no
                                 style.css, na regra .blk-fio.
                                 ERA 520, e o corte de 280 é o maior da cena:
                                 a bolha e o fio são o PEDIDO, e pedido que
                                 demora a sair da boca é o que o dono estava
                                 sentindo. O fio agora parte com a bolha ainda
                                 assentando.
                                 A FASE ACIONAVA DUAS PEÇAS até a noite de
                                 25/08/2026: a linha e um nó translúcido no
                                 meio dela, que acendia em 440, no quadro em
                                 que a ponta chegava. O nó foi excluído por
                                 ordem do dono e a lápide está no style.css,
                                 acima da regra .blk.is-no .blk-fio. A MARCA
                                 NÃO SE MEXEU e o nome da fase também não: ela
                                 continua sendo a dona do conector, que é a
                                 peça que sempre importou aqui.
                                 A FASE VOLTOU A ACIONAR MAIS DE UMA PEÇA em
                                 27/08/2026, e são TRÊS: o fio e os dois NÓS
                                 das pontas que a referência do dono trouxe (o
                                 da origem maior, abraçando a borda da bolha; o
                                 do pouso no centro da aresta superior do herói,
                                 atrasado em 340ms, que é quando a ponta chega).
                                 ELES NÃO SÃO A VOLTA DO NÓ ENTERRADO ACIMA:
                                 aquele era um disco translúcido no MEIO do
                                 caminho, e o meio do fio continua vago.
                  560  is-b      O papel do herói monta, vazio. Ele entra 320
                                 depois de o fio partir, e esse é o vão mais
                                 apertado da cena com toda a razão: o conector
                                 tem que ter chegado em algum lugar para aquele
                                 lugar poder existir, e 320 contra os 360 do
                                 desenho é o mínimo que ainda deixa a ponta
                                 chegar primeiro.
                                 ESTA MARCA FOI A ÂNCORA DO FUNDO por um dia,
                                 e não é mais. Entre a noite de 25/08/2026 e a
                                 de 26/08 a linha do blkGlobo partia daqui mais
                                 o pouso do herói mais um respiro, e havia um
                                 aviso neste lugar mandando recalcular a espera
                                 de lá quem mexesse neste 560.
                                 O DONO CORTOU A AMARRAÇÃO ("quero que a
                                 animação do globo aconteça JUNTO com os outros
                                 elementos da animação"): o fundo passou a
                                 esperar os mesmos 500 da cena e não depende
                                 mais de marca nenhuma daqui. ESTE 560 VOLTOU A
                                 SER SÓ DA CENA, e quem mexer nele não deve
                                 nada a ninguém. A conta morta está inteira na
                                 linha do blkGlobo, com a data das duas pontas.
                  740  is-foto   A FOTO DO APARELHO aparece, em 360ms de
                                 opacidade. Depois do papel e não junto: papel
                                 e fotografia são matérias diferentes, e
                                 vê-las chegar juntas faria a foto parecer
                                 impressa no card em vez de posta nele. Os 180
                                 de vão contra 470 de pouso põem a foto
                                 chegando com o papel ainda descendo, que é o
                                 encavalamento mais forte da cena e o que faz
                                 o card parecer UM objeto e não dois.
                  900  is-txt    Valor e parcela, em degraus de 90ms. Eram três
                                 peças com degraus de 80 até esta noite: o
                                 título do produto morreu por ordem do dono e o
                                 valor herdou a primeira linha.
                 1080  is-band   A fila das bandeiras. ERAM QUATRO e são TRÊS
                                 desde 26/08/2026: a American Express foi
                                 excluída por ordem do dono, e a lápide está
                                 no index.html. A MARCA NÃO SE MEXEU e não
                                 devia: a fase acende a fila inteira de uma
                                 vez, por opacidade da caixa, e nunca contou
                                 bandeira nenhuma.
                 1220  is-botao  O BOTÃO VERDE, o último de dentro do card por
                                 ordem do dono: o papel chega, a foto aparece,
                                 o anúncio se escreve, e a AÇÃO é a última
                                 coisa a existir. Botão que nasce junto com o
                                 papel é decoração; botão que nasce depois é
                                 oferta.
                 1420  is-c      As TAXAS descem sobre a FOTO do herói, vindo
                     e is-d      de fora da borda direita do quadro, e os
                                 RECEBIMENTOS cobrem pela ESQUERDA, vindo de
                                 0,8em mais para fora do lado deles. Cada um
                                 parte 0,8em para fora, com essa faixa cortada
                                 pelo recorte da cena, e desliza para dentro.
                                 Os dois vêm depois de o herói estar inteiro, e
                                 isso é obrigatório: peça que cobre precisa ser
                                 vista chegando POR CIMA de algo que já existe,
                                 senão a sobreposição lê como estado inicial e
                                 não como camada.
                                 OS DOIS NA MESMA MARCA É ORDEM LITERAL DO
                                 DONO ("animarem JUNTO"), e ela conserta uma
                                 incoerência que estava na cara desde a v7: os
                                 dois satélites são um PAR ESPELHADO no espaço
                                 (mesma magnitude de trajeto, sinais opostos,
                                 cada um chegando da própria borda para o mesmo
                                 herói) e eram dois eventos no tempo, separados
                                 por 620ms. Par que se move em tempos
                                 diferentes lê como duas coisas; par que se
                                 move junto lê como a colagem se FECHANDO, que
                                 é o que a cena estava tentando dizer.
                                 O GRÁFICO DOS RECEBIMENTOS se desenha 180ms
                                 depois do papel, em 560ms (eram 240 e 760). O
                                 atraso é de consequência e sobrevive à
                                 compressão: o número existe antes da curva que
                                 o explica.
                                 DUAS FASES NO MESMO MILISSEGUNDO NÃO PRECISAM
                                 DE MECANISMO NOVO: o condutor arma um timer
                                 por marca e os dois vencem no mesmo tique, um
                                 atrás do outro, antes do quadro seguinte. Foi
                                 medido no navegador, não suposto.

               ---- A TROCA DE POSTOS, 25/08/2026 (fim de tarde) ----
               O dono mandou os dois satélites trocarem de lado: as taxas para
               o canto superior direito, "levemente em cima da imagem do
               iphone", e os recebimentos para a vaga que elas deixaram, à
               esquerda. NENHUMA MARCA DESTA TABELA MUDOU, e a decisão é
               deliberada: o que a troca mexeu foi de ONDE cada peça vem, não
               QUANDO ela chega. Ritmo é do relógio, trajetória é da folha, e
               esta é a primeira vez que a separação entre os dois foi posta à
               prova nesta seção. Passou: a re-harmonização inteira coube em
               dois sinais de translate3d, e este arquivo não precisou saber.
                 2160             Descanso. A colagem completa, que é o quadro
                                 contra o qual o texto do bloco 2 é lido. Não é
                                 uma marca: é o instante em que a última coisa
                                 em movimento (a curva do gráfico, que arranca
                                 180 depois do is-d e leva 560) termina.
                                 ERAM 4860 até a noite de 25/08/2026.
                                 O FUNDO ANDAVA DEPOIS DISSO ATÉ 26/08/2026,
                                 quando ele partia aos 1650 do ato e fechava aos
                                 3770, espalhando-se devagar sobre uma colagem
                                 que já tinha parado, e a frase que fechava este
                                 parágrafo era "a cena é a ação, o fundo é a
                                 consequência".
                                 HOJE OS DOIS ANDAM JUNTOS por ordem do dono: o
                                 globo parte aos 500 do ato, com a cena, e fecha
                                 aos 2540 (500 mais a leva de 840 mais os 1200 do
                                 esmaecimento), 120ms ANTES de a colagem
                                 descansar aos 2660. O fundo deixou de ser a
                                 consequência e virou o mundo em que a cena
                                 acontece, e o desenho do descanso não mudou uma
                                 vírgula: quem chega por último continua sendo a
                                 curva do gráfico.

               ---- A DÉCIMA BATIDA MORREU EM 25/08/2026 ----
               Aqui havia uma linha [4500, 'is-gente'], que acendia os dois
               discos de foto de pessoa com 110ms entre eles, e o descanso
               ficava em 5,05s. O DONO MANDOU EXCLUIR AS DUAS FOTOS, então a
               fase perdeu o objeto e saiu junto: fase que não acende nada é
               um timer pago para não fazer nada. As lápides das peças estão
               na folha e no HTML.
               NENHUMA DAS NOVE MARCAS QUE SOBRARAM FOI REMARCADA, e isso é
               decisão e não preguiça. O que a exclusão encurtou foi a CAUDA
               da cena, não o ritmo dela: as batidas de 0 a 3860 nasceram do
               tempo que cada uma precisa para ser lida, e nada nesse trecho
               mudou de tamanho nem de vizinho. Reapertar as oito primeiras
               por causa da nona seria pagar a conta de outra peça.

               POR QUE 4,86s. O irredutível são os 2,04s do herói se montando
               por dentro (do is-b ao is-botao, com a foto no meio) e os 1,26s
               das duas coberturas. O herói é a peça mais alta da colagem e a
               que carrega mais informação; comprimir a montagem dele faria a
               colagem aparecer pronta, e colagem que aparece pronta é uma
               imagem, não uma cena.

               O ATO 4 GANHOU A LINHA DELE na mesma madrugada, logo abaixo
               desta, e a promessa que esta frase fazia se cumpriu sem uma
               alteração no corpo do bloco: a arte da antecipação entrou como
               UMA LINHA de tabela, e nada do mecanismo comum precisou saber
               que ela existe. Era exatamente para isto que a generalização
               foi feita. A guarda de existência dentro do monta() continua
               sendo o que torna seguro escrever uma linha antes de a arte
               dela estar no HTML. */
            ato: '2',
            id: 'blkCena',
            FASES: ['is-a', 'is-no', 'is-b', 'is-foto', 'is-txt',
                    'is-band', 'is-botao', 'is-c', 'is-d'],
            MARCAS: [
                [   0, 'is-a'],
                [ 240, 'is-no'],
                [ 560, 'is-b'],
                [ 740, 'is-foto'],
                [ 900, 'is-txt'],
                [1080, 'is-band'],
                [1220, 'is-botao'],
                [1420, 'is-c'],
                [1420, 'is-d']
            ]
        },
        {
            /* ============ A LINHA DO TEMPO DO FUNDO DO ATO 2 (blkg-) ============
               25/08/2026, noite. O CIRCUITO DAS TRANSAÇÕES, e esta linha
               nasceu porque o dono amarrou duas camadas que o DOM mantém
               separadas: "hoje elas animam de fora para dentro; quero que se
               formem DE DENTRO PARA FORA, só DEPOIS QUE O CARD DO CELULAR
               APARECEU, de maneira mais calma".
               ATENÇÃO, LEITOR DE 26/08/2026 EM DIANTE: a ordem acima é a
               certidão de nascimento desta linha e NÃO é mais o que ela faz. O
               dono mandou o fundo animar JUNTO com a cena, a espera caiu de
               1650 para 500 e a conta inteira que sustentava os 1650 está
               guardada abaixo, no capítulo da amarração.

               ================= POR QUE UMA LINHA E NÃO UM ATRIBUTO =================
               Até esta noite o circuito se desenhava pelo data-fundo da seção,
               que responde "a seção está na tela" e não sabe nada da cena que
               roda na frente dele. "Depois que o card apareceu" é uma pergunta
               que só o relógio da cena responde, então a peça entrou na tabela
               como as duas artes de fundo dos atos 3 e 4 já estavam. A guarda
               de existência do monta() aceita id de fundo do mesmo jeito que
               aceita id de cena: o mecanismo comum não precisou saber que esta
               camada é outra.
               O QUE VEIO DE BRINDE foi o REARME. Com o atributo, o circuito só
               voltava ao começo quando a SEÇÃO INTEIRA saía da tela: quem
               passeasse entre os atos 2 e 3 encontrava o fundo parado no
               quadro final. Agora o zera() do condutor corta as classes no
               quadro mudo a cada ativação, igual às cenas.
               DESDE 26/08/2026 O BRINDE É O MOTIVO. Com a espera de volta aos
               500 do palco, a pergunta que trouxe esta camada para cá ("depois
               que o card apareceu") não se faz mais, e o que a mantém na tabela
               é o rearme por ato mais estar no mesmo mecanismo das outras
               quatro artes. Voltar para o data-fundo economizaria uma linha e
               devolveria o fundo parado no quadro final a quem passeia entre os
               atos 2 e 3, que é defeito medido e não hipótese.

               ============ A AMARRAÇÃO CAIU EM 26/08/2026, POR ORDEM ============
               A ESPERA É 500, A MESMA DA CENA, e é ordem literal do dono:
               "quero que a animação do globo aconteça JUNTO com os outros
               elementos da animação". As três levas do esmaecimento correm
               CONCORRENTES à cascata dos cards, e não mais atrás dela.
               O QUE CAIU, ESCRITO INTEIRO PORQUE ELE VIVEU UM DIA: a espera
               era 1650 e não era gosto, era a soma do relógio da CENA:
                  500  a espera do ato 2 antes da primeira batida
                + 560  a marca is-b, o papel do herói montando
                + 470  o pouso dele, que é a duração da entrada na folha
                + 120  o respiro, e era o único número escolhido ali
                = 1650
               Ela nasceu na noite de 25/08 de uma ordem que dizia o contrário
               desta ("só DEPOIS QUE O CARD DO CELULAR APARECEU"), e por isso
               estava escrita nas DUAS PONTAS: a marca is-b da cena carregava
               o aviso de recalcular. O aviso de lá foi retirado na mesma
               edição desta linha, e a marca voltou a ser só da cena.
               ORDEM NOVA REVOGA ORDEM VELHA e não a apaga: quem quiser o
               fundo atrás do herói de novo tem a conta acima inteira, com os
               quatro números, e não precisa remontá-la de cabeça.
               ESTA LINHA DEIXOU DE SER A EXCEÇÃO DA TABELA. Ela era o único
               número que dependia de outra linha; hoje ela repete a espera da
               cena por decisão de direção, que é uma coincidência de valor e
               não uma dependência: mexer nas marcas da cena não obriga mais a
               mexer aqui, e o que amarra as duas camadas agora é o ATO, não
               uma soma.
               POR QUE 500 E NÃO ZERO, já que "junto" poderia ser lido como
               "no primeiro quadro": porque a espera de 500 é do PALCO e não
               da cena. Ela tem bloco próprio no condutor e vale para toda arte
               desta seção, então "junto com os outros elementos" é exatamente
               a espera de 500, que é onde os outros elementos começam.
               O CONTRATO TINHA SOBREVIVIDO À TROCA DE MOTIVO e não sobreviveu
               à troca de direção. Esta linha nasceu conduzindo o CIRCUITO,
               conduziu o GLOBO atrás do herói por um dia e hoje conduz o mesmo
               globo em paralelo com ele: o desenho é o terceiro inquilino do
               slot e o relógio é o segundo do desenho.

               ================= AS TRÊS LEVAS =================
               ELAS DEIXARAM DE SER TRÊS ESMAECIMENTOS em 26/08/2026 e viraram
               três JANELAS DE FORMAÇÃO, por ordem do dono ("não quero um
               simples fade in, quero as linhas se formando independente"). O
               que o condutor manda continua sendo exatamente o mesmo: três
               classes em três marcas. O que mudou mora na folha, onde cada
               traço da leva tem o atraso dele DENTRO dela.
                    0  is-g1     O EIXO E O ARO se desenham, em 1020ms cada, com
                                 160ms entre um e outro. A esfera se anuncia
                                 pela haste e pela silhueta, dois traços que já
                                 dizem "globo" antes de existir uma malha.
                  420  is-g2     OS SEIS MERIDIANOS, de 115 em 115ms, 930ms
                                 cada: a curvatura chegando da esquerda para a
                                 direita.
                  840  is-g3     OS SETE PARALELOS EM CATORZE METADES, de 70 em
                                 70ms, 810ms cada: primeiro as sete da FRENTE,
                                 de cima para baixo, e depois as sete do fundo.
                                 Quem chega por último é quem carrega a
                                 PROFUNDIDADE, e é a leva em que o olho pousa.
                 2880             Descanso do fundo (840 da última leva mais 910
                                 do último atraso, mais 810 de desenho e 320 de
                                 troca de pele), que em relação ao ato acontece
                                 aos 3380, ou seja 720ms DEPOIS de a colagem
                                 descansar aos 2660. Eram 2270 no relógio curto
                                 da formação, 2040 no esmaecer e 3690 antes de a
                                 espera cair para 500.
                                 O FUNDO FECHAR DEPOIS DA CENA É ACEITO E TEM
                                 PRECEDENTE nesta seção: é a leitura da luz do
                                 ato 4, em que o fundo continua nascendo depois
                                 dos cards porque ambiente de verdade não acaba
                                 junto com a ação. A esticada foi ordem do dono
                                 ("um pouco mais lenta") e o relógio saiu de
                                 bancada de dois, contra um de 3,29s que ficava
                                 pela metade com a colagem já parada.
                                 AS TRÊS MARCAS NÃO FORAM REMARCADAS em nenhuma
                                 das três trocas, e isso é decisão: 0/420/840
                                 nasceu do tempo que cada leva precisa para ser
                                 lida, não da distância até a cena, nem da
                                 técnica de dentro dela, nem da velocidade dela.
                                 O que mudou foi a hora de entrar no palco e o
                                 que acontece dentro da leva; o compasso é o
                                 mesmo.
               A ORDEM DAS LEVAS É DE DENTRO DA FORMA PARA FORA DELA, e não é a
               mesma coisa que a ordem anterior: o circuito crescia de dentro
               para fora no ESPAÇO, e aqui nada cresce. O que anda de dentro
               para fora é a LEITURA: forma, curvatura, malha.
               O RITMO É CALMO DE PROPÓSITO E É CONTRASTE, e essa metade também
               atravessou a troca: na mesma ordem em que mandou o fundo ficar
               calmo, o dono mandou a cena ficar rápida. A colagem é a AÇÃO e o
               fundo é o mundo em volta dela.
               HÁ DESENHO PROGRESSIVO AQUI DESDE 26/08/2026, e a recusa antiga
               (que dizia o contrário nesta mesma linha) caiu por ordem do dono
               sem que a REGRA que a sustentava caísse: traço picado continua
               sem se desenhar por dash-offset. Quem se desenha é uma GÊMEA
               SÓLIDA de cada traço, e a picada assume no pouso por crossfade.
               A bancada de três técnicas, com os números de trace das duas
               reprovadas, está na folha, no bloco da entrada do blkg-. */
            ato: '2',
            id: 'blkGlobo',
            /* 500 E NÃO A COLUNA VAZIA, e a redundância é de propósito: sem
               `espera` a linha herdaria os mesmos 500 de sempre, mas o número
               aqui é ORDEM ("junto com os outros elementos") e não herança.
               Escrito, ele sobrevive ao dia em que o padrão do palco mudar. */
            espera: 500,
            /* ================= A QUARTA FASE, 27/08/2026 =================
               ORDEM DO DONO: "você consegue deixar essa esfera girando?".
               A is-gira NÃO É UMA LEVA e é a primeira desta linha que não é:
               as três de cima abrem janelas de FORMAÇÃO e esta abre o REGIME
               PERMANENTE. Ela faz duas coisas, uma de cada lado do arquivo: na
               folha derruba o dash dos seis meridianos (sem isso o traço perde
               o rabo assim que o caminho engorda no giro) e aqui embaixo, pelo
               gancho, chama o beginElement dos doze <animate> do HTML.
               ELA NÃO TEM MARCA DESDE 26/08/2026, e é a única fase desta tabela
               inteira que não tem: quem a acende é um EVENTO, o fim real do
               desenho da leva 2, contado nos animationend pelo gancho. A conta
               completa, com a medida que matou o número e a lição que ela
               deixou, está no bloco do gatilho, na coluna GANCHOS.
               A LÁPIDE DO NÚMERO, porque ele viveu dois dias e estava certo:
               "A MARCA É 2560 E ELA FOI CONTADA, não escolhida: é o instante em
               que a formação inteira fecha, e a conta é 840 (a marca da leva 3)
               mais 910 (o atraso do último paralelo) mais 810 (o desenho dele).
               QUEM MEXER NO RELÓGIO DA FORMAÇÃO RE-CONTA ESTE NÚMERO. É a
               única marca desta tabela que é uma SOMA das outras, e por isso
               ela é a única que pode ficar errada sem ninguém ver."
               O AVISO ESTAVA ESCRITO E MESMO ASSIM O NÚMERO SÓ SOBREVIVEU POR
               SORTE: ele atravessou a morte da troca de pele, duas mudanças de
               raio e a partição dos meridianos em doze arcos sem ninguém o
               reconferir. Medido em 26/08 ele ainda batia (fecho real aos
               3074,6ms do ato, classe aos 3066,2), e mesmo assim saiu.
               O QUE MUDOU DE DIREÇÃO JUNTO, e é o que o dono pediu: o gatilho
               é a leva 2 e não a formação inteira. Quem gira são os meridianos,
               e eles pousam aos 1925 da cascata; esperar os catorze paralelos
               fecharem deixava o arco parado 635ms depois de pronto, mais a
               rampa saindo do repouso. Era essa soma que ele via como gap. */
            FASES: ['is-g1', 'is-g2', 'is-g3', 'is-gira'],
            MARCAS: [
                [   0, 'is-g1'],
                [ 420, 'is-g2'],
                [ 840, 'is-g3']
            ],

            /* ================= OS GANCHOS DO GIRO =================
               A MECÂNICA INTEIRA DO GIRO CABE AQUI porque a geometria dele mora
               no HTML (doze <animate>, dois por meridiano) e o desligamento do
               dash mora na folha. O que falta é ligar, parar e rearmar, que é
               exatamente o que o condutor sabe fazer com relógio.
               POR QUE SMIL E NÃO A PROPRIEDADE CSS `d`: cobertura. <animate
               attributeName="d"> anda nos quatro motores; `d` em @keyframes não
               existe no Firefox. A conta inteira está no cabeçalho do blkg- no
               index.html. O que ela custa está resolvido logo abaixo. */
            GANCHOS: (function () {
                var svg = null, RAMPAS = null, GIROS = null, VIRGENS = null;
                var ouvinte = null, faltam = 0;

                /* ================= O GATILHO É UM EVENTO, 26/08/2026 =================
                   ORDEM DO DONO: "O globo demora para começar a rodar, tem um gap
                   dele se formar e terminar a animação, para realmente começar a
                   girar, quero que tire esse gap: depois que termine de se formar,
                   ele JÁ comece a girar".
                   AQUI MORAVA UM NÚMERO: a marca [2560, 'is-gira'] da tabela. Ela
                   era a SOMA de outros números da folha (840 da leva 3, mais 910
                   do último atraso, mais 810 do desenho) e a única marca desta
                   tabela que dependia das outras. Ela foi MEDIDA antes de morrer e
                   fica o registro honesto: ela estava CERTA. O último traço pousou
                   aos 3074,6ms do acender do ato e a classe entrou aos 3066,2 — oito
                   milissegundos de diferença, dentro do quadro. O gap não era ela.
                   MESMO ASSIM ELA MORRE, e é decisão de arquitetura e não de
                   sintoma: uma soma escrita à mão em cima de números que moram
                   noutro arquivo é uma bomba-relógio, e esta já tinha atravessado a
                   morte da troca de pele, duas mudanças de raio e a partição dos
                   meridianos em doze arcos sem ninguém a reconferir. Ela sobreviveu
                   por sorte. O que a substitui não pode apodrecer: o giro arranca
                   pelo FIM REAL do desenho, contado nos eventos animationend da
                   formação, e passa a se corrigir sozinho se alguém mexer em
                   qualquer duração, atraso ou marca da leva.
                   A LIÇÃO, escrita para a próxima vez: número derivado de outro
                   número, em arquivo diferente, tem que virar EVENTO na primeira
                   oportunidade. Enquanto ele existir, ele só está certo até
                   alguém mexer no que ele deriva — e ninguém vai lembrar.

                   O GATILHO É A LEVA 2 E NÃO A FORMAÇÃO INTEIRA, e esta é a parte
                   que responde à ordem no literal. Quem gira são os meridianos, e
                   eles pousam aos 1925ms da cascata; os catorze paralelos ainda
                   levam mais 635ms para fechar. Esperar a formação INTEIRA punha o
                   arco parado meio segundo depois de ele estar pronto, e mais um
                   tanto da rampa saindo do repouso: era essa a soma que o dono via.
                   Com o gatilho na leva 2 a rampa CABE dentro da cauda dos
                   paralelos, e no instante em que a última linha da formação pousa
                   o globo já está em velocidade de cruzeiro. "Depois que termine de
                   se formar, ele JÁ comece a girar" vira literalmente verdade: no
                   quadro do fecho ele já está girando. A bancada das duas variantes
                   está nas provas do dia. */
                var GATILHO = '.blkg-g--2 .blkg-risco';

                function pega(arte) {
                    if (svg) return true;
                    var s = arte.querySelector('.blkg-svg');
                    if (!s || typeof s.pauseAnimations !== 'function') return false;
                    var r = [].slice.call(s.querySelectorAll('.blkg-rampa'));
                    var g = [].slice.call(s.querySelectorAll('.blkg-giro'));
                    /* A GUARDA CONTA PARES E NÃO SEIS, desde 26/08/2026, e a
                       redação anterior (`r.length !== 6 || g.length !== 6`)
                       fica registrada porque ela QUEBROU EM SILÊNCIO no mesmo
                       dia: quando cada meridiano virou dois arcos (frente e
                       fundo), passaram a ser doze rampas e doze giros, a
                       guarda recusou, o gancho voltou sem fazer nada e o globo
                       ficou parado sem um erro no console. O número seis era
                       uma contagem de MERIDIANOS escrita num lugar que só
                       precisa saber de PARES.
                       O que importa aqui é: existe animação, e cada rampa tem
                       um giro. Quem acrescentar peça animada nesta camada não
                       precisa mais vir aqui mexer num número. */
                    if (!r.length || r.length !== g.length) return false;
                    if (typeof r[0].beginElement !== 'function') return false;
                    svg = s; RAMPAS = r; GIROS = g;
                    /* AS CÓPIAS VIRGENS, tiradas antes de qualquer beginElement:
                       são elas que fazem o rearme ser limpo (ver 'zera'). */
                    VIRGENS = r.concat(g).map(function (a) { return a.cloneNode(false); });
                    return true;
                }

                /* O ARRANQUE PROPRIAMENTE DITO, separado do gatilho de propósito:
                   quem chama isto é o contador de eventos, e ele podia ser outro
                   amanhã sem que a partida precisasse mudar. */
                function parte(arte, agenda) {
                    if (!pega(arte)) return;
                    arte.classList.add('is-gira');
                    RAMPAS.forEach(function (a) { a.beginElement(); });
                    var ms = (parseFloat(RAMPAS[0].getAttribute('dur')) || 0) * 1000;
                    agenda(ms, function () {
                        GIROS.forEach(function (a) { a.beginElement(); });
                    });
                }

                /* O CONTADOR. Um ouvinte só, na raiz da arte, e não vinte e oito:
                   animationend borbulha, então a conta se faz num lugar. O nome da
                   animação é conferido porque esta camada pode ganhar outra
                   animação de CSS amanhã, e um `animationend` alheio adiantaria o
                   giro em silêncio — que é a mesma família de defeito que o número
                   derivado tinha.
                   ELE SE DESARMA SOZINHO ao completar a conta, e o zera() o
                   desarma se a volta for interrompida no meio: animação cancelada
                   NÃO dispara animationend, então um contador vivo de uma volta
                   abortada ficaria esperando um evento que não vem, e a volta
                   seguinte começaria com a conta pela metade. */
                function arma(arte, agenda) {
                    if (!pega(arte)) return;
                    desarma(arte);
                    faltam = arte.querySelectorAll(GATILHO).length;
                    if (!faltam) return;
                    ouvinte = function (e) {
                        if (e.animationName !== 'blkgRisca') return;
                        if (!e.target.matches || !e.target.matches(GATILHO)) return;
                        if (--faltam > 0) return;
                        desarma(arte);
                        parte(arte, agenda);
                    };
                    arte.addEventListener('animationend', ouvinte);
                }

                function desarma(arte) {
                    if (ouvinte) arte.removeEventListener('animationend', ouvinte);
                    ouvinte = null; faltam = 0;
                }

                return {
                    /* O GATILHO SE ARMA NA PRIMEIRA MARCA e não na última: ele
                       precisa estar de pé antes de a leva 2 começar a desenhar, ou
                       os primeiros animationend passam sem ninguém contar. */
                    'is-g1': arma,

                    /* LÁPIDE DO GANCHO 'is-gira' · 26/08/2026. Ele era chamado pela
                       marca 2560 da tabela e fazia o que o parte() faz hoje. Saiu
                       com a marca: quem chama a partida agora é o contador de
                       eventos. O CORPO NÃO MUDOU UMA LINHA, só o gatilho.
                       Texto histórico dele, que continua explicando o que parte()
                       faz: "A PARTIDA. Primeiro a RAMPA, que é
                       meio passo (1,5°) percorrido com a velocidade saindo de
                       ZERO e chegando na do laço, e só quando ela acaba é que o
                       laço entra, já em velocidade de cruzeiro. É assim que o
                       giro começa sem solavanco: a ordem pede "ease
                       imperceptível", e um laço a frio partiria com a
                       velocidade cheia no primeiro quadro.
                       A DURAÇÃO DA ESPERA SAI DO PRÓPRIO HTML e não de um
                       número escrito aqui: são duas folhas para um contrato só,
                       e um `dur` mexido lá sem mexer aqui deixaria um buraco ou
                       uma sobreposição na emenda. Uma fonte, uma verdade.
                       E ELA VAI PARA A LISTA DE RELÓGIOS DA CENA, pelo agenda:
                       quem sair do ato entre a rampa e o laço não deixa um
                       arranque fantasma marcado para daqui a três segundos."
                       A classe is-gira continua na FASES (é o zera() que a tira) e
                       hoje quem a acende é o parte(), no mesmo tique da rampa. */

                    /* O FREIO. O ato apagou e as classes ficam de pé, então sem
                       isto os seis meridianos continuariam se redesenhando a
                       cada quadro atrás de um crossfade que ninguém vê. Um
                       pauseAnimations congela o relógio do SVG inteiro, e como
                       este SVG só tem o giro dentro dele, ele para tudo e nada
                       mais. */
                    para: function (arte) {
                        if (!pega(arte)) return;
                        svg.pauseAnimations();
                    },

                    /* O QUADRO MUDO DO QUE NÃO É CSS. A folha silencia a
                       formação com a .is-mudo; SMIL não escuta CSS, então o
                       rearme dele é aqui.
                       POR TROCA E NÃO POR endElement, e a escolha é para não
                       depender de canto escuro de especificação: a rampa é
                       fill="freeze", e um endElement numa animação congelada
                       DEIXA O VALOR CONGELADO no lugar, o que devolveria os
                       meridianos meio passo adiantados na volta seguinte. Um
                       <animate> recém-clonado nunca correu: não tem intervalo,
                       não tem congelamento, e o `d` volta a ser o do atributo,
                       que é o mesmo primeiro quadro da rampa. Doze nós minúsculos
                       trocados por re-entrada, que é coisa rara (só acontece
                       quando alguém rola de volta para o ato 2).
                       O unpauseAnimations É O PAR DO FREIO: sem ele, quem
                       voltasse depois de sair encontraria o relógio do SVG
                       parado e o giro nunca mais andaria. */
                    zera: function (arte) {
                        if (!pega(arte)) return;
                        /* O CONTADOR SAI PRIMEIRO. Animação cancelada não dispara
                           animationend, então um contador da volta abortada ficaria
                           esperando eventos que não vêm e a volta seguinte começaria
                           com a conta pela metade — o giro arrancaria cedo, ou nunca.
                           O arma() da marca is-g1 o repõe do zero logo em seguida. */
                        desarma(arte);
                        var vivos = RAMPAS.concat(GIROS);
                        var novos = VIRGENS.map(function (v, i) {
                            var n = v.cloneNode(false);
                            vivos[i].parentNode.replaceChild(n, vivos[i]);
                            return n;
                        });
                        /* O CORTE É NA METADE E NÃO NO SEIS, pelo mesmo motivo
                           da guarda lá em cima: o VIRGENS é rampas seguidas de
                           giros, então a metade é onde uma família acaba e a
                           outra começa, seja qual for o número de arcos. */
                        var meio = novos.length / 2;
                        RAMPAS = novos.slice(0, meio);
                        GIROS = novos.slice(meio);
                        svg.unpauseAnimations();
                    }
                };
            }())
        },
        {
            /* ================= A LINHA DO TEMPO DO ATO 3 (bnf-) =================
               25/08/2026. O CAMINHO ATÉ A NOTA, e esta é a SEGUNDA linha do
               tempo deste ato no mesmo dia. A primeira conduzia uma conversa
               (bolha de pedido, card escuro, pílula de vidro, bolha de
               resposta com PDF) em sete fases e 4,81s; ela não foi
               reprovada, foi SUPERADA por outra ordem do dono, com outra
               referência e outro assunto. A arqueologia inteira está na
               lápide da folha, no bloco bnf-.

               ================= AS MARCAS NÃO FORAM ESCOLHIDAS =================
               ESTA É A DIFERENÇA ENTRE ESTA LINHA E TODAS AS OUTRAS DA
               TABELA, e é o que quem for mexer precisa entender antes de
               tocar num número. Nos atos 1, 2 e 4 as marcas são ritmo: elas
               nasceram de "quanto tempo esta batida precisa para ser lida" e
               foram ajustadas no olho e na bancada. Aqui elas são
               GEOMETRIA. O dono mandou os passos acenderem conforme a reta
               do fundo passa por eles, então cada marca é a resposta de uma
               conta: em que instante a ponta da reta cruza a altura desta
               peça?

               A CONTA, por extenso, para poder ser refeita:
                 1. A reta é uma vertical de 0 a 1200 no viewBox da camada de
                    fundo, desenhada por uma transição única de 4600ms com a
                    curva --bnff-corrida, que é cubic-bezier(0.004, 0.085,
                    0.2, 0.25). A ponta dela no instante t está em
                    y = 1200 x saida_da_curva(t / 2300).
                 2. Uma unidade daquele viewBox vale UM PIXEL da caixa desta
                    cena (medido: 1,0000), e a cena cai em y de 344 a 856 lá
                    dentro. Então uma peça que mora em y=190 aqui mora em
                    y=534 lá.
                 3. Para cada peça, tomou-se o MEIO dela (o topo, no caso do
                    papel, porque documento começa a existir pela borda de
                    cima), converteu-se para o viewBox e INVERTEU-SE a curva
                    para achar a fração de tempo. As alturas medidas no
                    navegador, com tudo aceso, e as marcas que a curva de
                    hoje devolveu (entre parênteses, a fila das duas rodadas
                    anteriores do mesmo dia, para a arqueologia caber numa
                    linha só):
                      passo 1   meio y  34,52  ->  378,52   ->   618ms (973 / 1867)
                      passo 2   meio y  90,52  ->  434,52   ->   731ms (1205 / 2101)
                      papel     topo y 150,00  ->  494,00   ->   852ms (1459 / 2346)
                      passo 3   meio y 204,52  ->  548,52   ->   964ms (1695 / 2567)
                      passo 4   meio y 286,52  ->  630,52   ->  1132ms (2056 / 2897)
                      passo 5   meio y 454,52  ->  798,52   ->  1477ms (2804 / 3565)
                 4. Os dois desvios do fundo vêm 80ms ANTES da cápsula que
                    alimentam (884 e 1052), que é o atraso de consequência que
                    o ato 2 fixou entre o fio e o passo: a ligação chega
                    primeiro, o passo pousa depois. O ADIANTAMENTO ERA 150 E
                    ENCOLHEU COM A CENA: com os vãos entre passos em 112ms,
                    um lead de 150 poria o desvio ANTES do passo anterior, ou
                    seja a ligação chegaria antes de a etapa que a antecede
                    existir. Os 80 cabem dentro do vão com folga. Eles moram na OUTRA linha
                    desta tabela, a do fundo, porque moram no outro elemento.
               QUEM MEXER na pose de uma peça, na largura da caixa, na curva
               ou nos 2300ms REFAZ ESTA CONTA INTEIRA. Ajustar uma marca no
               olho aqui desalinha a cápsula da linha que a acende, e o
               defeito é silencioso: parece ritmo ruim, e é geometria errada.
               A REESCRITA DE 25/08/2026 À TARDE É A PROVA DISSO: a curva
               mudou por uma ordem que não falava de ritmo nenhum, e as seis
               marcas tiveram que ser recalculadas uma a uma. Nenhuma delas
               foi "ajustada"; todas foram RESOLVIDAS.

               ================= O ARRANQUE, 25/08/2026 (tarde) =================
               ORDEM DO DONO: "quero que a animação seja otimizada. Ela demora
               muito para começar, quero que comece NO EXATO MOMENTO que o
               usuário visualizar a sessão."

               O QUE ELE ESTAVA VENDO, somado: 500ms de espera de ativação
               mais 845ms de tempo cego da reta (as 150 unidades que ela
               desenha acima da borda de cima da tela, onde ninguém vê) davam
               1,35s de palco parado antes do primeiro pixel, e 2,37s até a
               primeira cápsula. A redação anterior deste bloco DEFENDIA esse
               trecho com todas as letras ("a cena começa vazia e fica vazia
               por quase dois segundos, e isso é a peça, não um defeito... é
               a linha descendo sozinha na tela"). O dono viu rodar e
               reprovou, e a defesa caiu: linha descendo sozinha é percurso
               quando dura um instante e é espera quando dura um segundo.

               A CENA DOBROU DE VELOCIDADE DEPOIS DISSO, ainda em 25/08 à
               tarde, numa segunda ordem: "pode deixar a animação mais rápida,
               deixar 2X MAIS RÁPIDO, demora muito para acontecer". A reta
               foi de 4600 para 2300ms, as seis marcas foram recalculadas pela
               inversa da curva outra vez e as ENTRADAS das cápsulas tiveram
               que comprimir junto (de 300 para 160ms), senão os vãos de 112ms
               entre elas fariam três cápsulas piscarem no mesmo quadro. A
               conta da compressão está na folha, na regra do chip.

               O CONSERTO DO ARRANQUE FOI EM DUAS FRENTES E NENHUMA DELAS É
               GEOMETRIA:
                 · A ESPERA DE ATIVAÇÃO DESTA CENA FOI A ZERO, e só desta:
                   ver a coluna `espera` e o aviso de não uniformizar, no
                   comentário da ESPERA lá embaixo.
                 · O TEMPO CEGO CAIU DE 845 PARA 180ms pela CURVA. O primeiro
                   ponto de controle ficou agressivo o bastante para a reta
                   cuspir o runway invisível e emendar no cruzeiro logo depois
                   de entrar. A bancada, com a amostragem monotônica que prova
                   que não há joelho na entrada, está na folha, no bloco do
                   .bnff-.
               O RESULTADO MEDIDO, depois das duas ordens: primeiro pixel
               visível aos 185ms da ativação (eram 1345), primeira cápsula aos
               618 (eram 2367) e a cena inteira em 2,30s (eram 5,70s). O
               arranque ficou 7,3 vezes mais curto e a cena, 2,5 vezes.

               O QUE NÃO SE FEZ, e fica registrado para ninguém tentar:
               encurtar o viewBox para diminuir o runway. Seria a saída
               óbvia e ela quebra a peça em janelas mais altas que a de
               projeto, porque a ponta de cima da reta passaria a cair DENTRO
               do quadro. O runway existe para a linha nunca ter ponta solta;
               o que estava errado era o preço dele, não ele.

               ================= O QUE ACONTECE ANTES E DEPOIS =================
               A CENA COMEÇA VAZIA E FICA VAZIA POR MEIO SEGUNDO. A reta
               entra pela borda de cima aos 185ms e alcança o primeiro passo
               aos 618. Esse trecho é curto e é o percurso: a linha chega, desce e
               a primeira cápsula acende.
               O ÚLTIMO PASSO ACENDE AOS 1477 E A RETA SÓ CRUZA A BORDA DE
               BAIXO AOS 1993, ou seja o fecho acontece com a linha ainda
               correndo, e ela não para nele. A direção pediu a ordem
               contrária ("a linha segue até sair da tela, o último chip
               fecha") e ela é GEOMETRICAMENTE IMPOSSÍVEL nesta caixa: o
               último ponto onde uma cápsula pode morar é y=512 da cena, que
               é y=856 do viewBox, e a borda de baixo da tela é y=1050. Não
               existe pose dentro da pegada de 640 por 512 que faça um passo
               acender depois de a reta sair. FICA A FLAG: o que se cumpriu
               foi o espírito (a reta não para no último passo, ela o
               ultrapassa e sai), e o que não se cumpriu foi a ordem literal
               dos dois eventos.
               O RELÓGIO DESTA CENA TERMINA AOS 1477 mais os 210ms da última
               cápsula, ou seja 1,69s, mas a CENA só descansa quando a reta
               fecha, aos 2,30s. O total que conta é o da reta, porque é ela
               que ainda se mexe. Os últimos 307ms são desenhados abaixo da
               dobra e ninguém os vê.

               ================= OS DEGRAUS QUE A GEOMETRIA DEU =================
               113, 121, 112, 168 e 345ms entre as seis batidas. Eles são
               desiguais porque as peças não são igualmente espaçadas, e o
               desenho foi feito sabendo disso: os dois primeiros passos
               ficam perto um do outro em cima, o papel e os dois passos do
               meio se adensam no centro (que é onde a coisa acontece) e o
               FECHO fica longe, a 345ms do passo anterior. Esse vão maior é
               o único degrau da cena que também é dramaturgia: ele separa a
               nota existindo da nota sendo entregue, e é a "inspiração antes
               da última palavra" que o ato 2 escreveu no bloco dele.
               O MENOR DEGRAU É 112ms, e ele NÃO é mais o piso desta cena. O
               piso virou a sobreposição das entradas, que é o que de fato se
               vê: com as cápsulas entrando em 160ms, quando o passo 2 começa
               o passo 1 já está entre 85 e 89% e do 3 em diante o anterior
               está em 1,000. Foi essa medida, e não o vão, que autorizou a cena a
               dobrar de velocidade. A conta está na folha, na regra do chip. */
            ato: '3',
            id: 'bnfCena',
            espera: 0,
            FASES: ['is-p1', 'is-p2', 'is-papel', 'is-p3', 'is-p4', 'is-p5'],
            MARCAS: [
                [ 618, 'is-p1'],
                [ 731, 'is-p2'],
                [ 852, 'is-papel'],
                [ 964, 'is-p3'],
                [1132, 'is-p4'],
                [1477, 'is-p5']
            ]
        },
        {
            /* ================= A RETA DO ATO 3 (bnff-) =================
               25/08/2026. A SEGUNDA LINHA DO ATO 3, e ela existe pelo mesmo
               motivo que o ato 4 tem duas: a arte mora em DOIS elementos que
               não se tocam. A cena é a caixa de 640 por 512 com o papel e as
               cinco cápsulas; a reta é o motivo de fundo, dentro da
               .ben-fundo-ato[data-ato="3"], que tem 100vh e pinta ATRÁS das
               cenas. As duas camadas são primas e não parentes: nenhuma está
               dentro da outra e nenhum seletor de CSS alcança uma a partir
               das classes da outra.

               DUAS LINHAS COM O MESMO ATO NÃO PEDEM UMA LINHA DE CÓDIGO
               NOVA: a tabela já monta uma porta por linha e os dois
               observadores já chamam todas as portas. É a solução mais
               barata das que existiam, e a mesma que o ato 4 escolheu
               algumas horas antes pelas mesmas razões (mexer no monta() para
               uma linha acender dois elementos é código compartilhado com
               outra sessão editando o arquivo, e alcançar a camada por
               :has() a partir da cena é um seletor de peso quebrado contra a
               disciplina de peso uniforme desta seção).

               A SINCRONIA SAI DE GRAÇA E JÁ FOI MEDIDA no ato 4: as duas
               portas são consultadas pelo MESMO callback do
               MutationObserver, no mesmo tique, e cada uma arma o próprio
               setTimeout de 500ms nesse instante. A deriva entre os dois
               arranques fica abaixo de um milissegundo, muito abaixo de um
               quadro. AQUI ISSO É MAIS DELICADO QUE LÁ: no ato 4 a linha era
               cenário e os cards tinham relógio próprio; aqui a reta É o
               relógio, e as seis marcas da cena foram calculadas a partir da
               curva DELA. Se as duas portas arrancassem em instantes
               diferentes, as cápsulas acenderiam fora do lugar por onde a
               linha passa, que é o defeito silencioso descrito na linha de
               cima. A prova mede essa deriva.

               TRÊS FASES. A reta é uma transição única de 4600ms que não tem
               paradas, então a marca dela cai no zero e todo o resto do
               ritmo é a curva. Os dois desvios têm marca própria porque cada
               um se desenha quando a ponta da reta chega na altura dele, e
               vêm 150ms antes da cápsula que alimentam. */
            ato: '3',
            id: 'bnfFio',
            espera: 0,
            FASES: ['is-traco', 'is-dve', 'is-dvd'],
            MARCAS: [
                [   0, 'is-traco'],
                [ 884, 'is-dve'],
                [1052, 'is-dvd']
            ]
        },
        {
            /* ================= A LINHA DO TEMPO DO ATO 4 (bcx-) =================
               25/08/2026, madrugada. A CASCATA DA ANTECIPAÇÃO: três cards
               escuros que pousam em diagonal enquanto um fio tracejado
               atravessa a tela inteira por trás deles. Esta linha acende só
               os CARDS; o fio tem linha própria, logo abaixo, porque mora
               noutro elemento. Quatro fases, 3,5s.

                242              O FIO CRUZA A BORDA DE CIMA e a cena passa a
                                 existir para quem olha. Não é marca de
                                 classe, é geometria, e está na tabela porque
                                 é o instante que o dono estava reclamando.
                289   is-c1      O CARD DA VENDA POUSA. Vem de cima e da
                                 esquerda, na direção em que a cascata cresce,
                                 e assenta em 560ms com a curva de pouso da
                                 casa. Nada elástico, que é ordem do dono
                                 desde a arte do ato 1. Ele entra logo atrás
                                 do fio, que acabou de aparecer.
                918   is-c2      O CARD DA ESPERA POUSA, com o fio passando
                                 por cima dele no mesmo instante. O TRILHO
                                 DE TRÊS DIAS se desenha dentro do pouso: o
                                 nó da venda acende aos 130ms, o fio parte
                                 aos 150 e os nós de ter 25 e qua 26 acendem
                                 aos 360 e aos 590. Fecha em 720ms, antes de
                                 o card 3 pousar, porque prazo que ainda
                                 está acendendo quando o dinheiro cai
                                 desmente a ordem dos fatos.
                                 (Até 25/08 de noite quem morava nesta
                                 batida era uma régua de duas casas
                                 anônimas; a lápide dela está na folha.)
               1755   is-c3      O CARD DO DINHEIRO POUSA, 837ms depois do
                                 anterior, com o fio já atravessando por trás
                                 dele. A BARRA VERDE DO GRÁFICO cresce do
                                 chão dentro do pouso, partindo aos 200ms e
                                 subindo em 480, ou seja encostando no teto
                                 aos 2435.
               2435   is-acento  A COROA DO GRÁFICO ACENDE, por último e
                                 sozinha, no instante exato em que a barra
                                 para de subir: número é a leitura da barra,
                                 e leitura vem depois da coisa lida. Mexer
                                 nesta marca pede mexer no atraso da barra,
                                 na folha, e vice-versa.
                                 (Até 25/08 de noite esta fase acendia a
                                 linha verde de estado do card 3, que morreu
                                 por dizer a mesma quarta-feira que o eixo
                                 do gráfico já escreve.)
               2816              o fio cruza a borda de BAIXO.
               3200              Descanso.

               ================= A ARQUEOLOGIA DO RITMO =================
               ESTA É A SEGUNDA LINHA DO TEMPO DESTA ARTE, e as duas ficam
               registradas porque a diferença entre elas é uma lição.

               A PRIMEIRA durava 4,54s e foi ditada pelo orquestrador. Ela
               tinha uma DRAMATURGIA DA ESPERA: sete fases, o vão entre o card
               2 e o card 3 medindo 1960ms (51% mais largo que o vão anterior)
               e, dentro dele, o fio RASTEJANDO a um décimo da velocidade, em
               curva linear. A tese era que a espera é o assunto do card 2,
               então o palco devia custar a passar junto com ela.

               O DONO VIU RODAR E REPROVOU: "deixar mais fluido, olha como
               está travado o movimento, o card 3 (NA SUA CONTA) tem que
               aparecer mais rápido, para não travar a linha pontilhada que
               faz o caminho". A tese era boa no papel e falsa na tela: a um
               décimo da velocidade o fio não lê como tempo custando a passar,
               lê como PEÇA TRAVADA, e o olho culpa a animação, não o prazo.

               O QUE MUDOU: as fases caíram de sete para quatro (as três do
               fio viraram uma só, noutra linha), o card 3 chega 1140ms mais
               cedo, os vãos entre os cards ficaram quase iguais (720 e 800ms)
               e a cena encolheu de 4,54s para 3,5s. O fio não muda de
               velocidade em instante nenhum.

               O D+2 NÃO SUMIU, só parou de ser contado pelo relógio: ele
               continua escrito no card 2 e desenhado logo abaixo dele, hoje
               no trilho de três dias. O que morreu foi a ideia de fazer o
               VISITANTE esperar para sentir a espera.

               OS CARDS FICARAM ESCUROS E VOLTARAM A SER BRANCOS na mesma
               manhã, por duas ordens do dono, mas isso é assunto da folha e
               não mudou uma marca deste relógio.

               O TERCEIRO AJUSTE FOI O ARRANQUE, e ele é o que explica os
               números acima. O dono voltou com "a animação demora demais
               para começar": o fio nasce ACIMA da borda de cima da tela (de
               propósito, para chegar nela encostado em vez de brotar do
               nada), e com a curva antiga esse trecho cego custava 533ms de
               desenho invisível, que somados aos 500ms de espera davam mais
               de um segundo de palco aparentemente parado.
               O conserto foi na CURVA e não na geometria (encurtar o trecho
               cego pelo desenho faria o fio nascer dentro da tela em janelas
               altas, com ponta solta). O fio agora cruza a borda aos 242ms.
               E AS QUATRO MARCAS ACIMA FORAM RECALCULADAS PELA INVERSA: para
               cada marca antiga leu-se a fração do percurso em que o fio
               estava (0,1330 · 0,3341 · 0,5783) e achou-se na curva nova o
               instante da mesma fração. Cada card pousa exatamente onde
               pousava em relação ao fio; a coreografia não mudou de forma,
               só de relógio. O total caiu de 3500 para 3200, e a travessia
               VISÍVEL mede 2574ms nas duas versões, no milissegundo.

               O NOME DA ÚLTIMA FASE É is-acento E NÃO is-verde: a folha tinha
               cinco classes utilitárias .is- sem escopo nenhum, e a .is-verde
               entre elas pintava um background verde claro na peça inteira.
               Nome de fase nova se confere contra
               `grep -oE '^\.is-[a-z0-9-]+' style.css` antes de virar código. */
            ato: '4',
            id: 'bcxCena',

            /* ESPERA ZERO, POR ORDEM DO DONO (25/08/2026, noite): "a
               animação está demorando para começar, quero que comece no
               exato instante que o usuário visualiza ela". É a MESMA ordem
               que o ato 3 recebeu, palavra por palavra, e é por isso que a
               coluna já existia: ela nasceu naquela rodada justamente para
               a espera poder ser por ato.
               O QUE ESTA LINHA DEVOLVE, medido: os 500ms de espera de
               ativação saem da conta e o primeiro pixel visível do fio cai
               de uns 742ms para os 242 da curva. A geometria não mudou um
               ponto e as quatro marcas dos cards não se moveram: o que
               encolheu foi só o silêncio antes do arranque.
               O CAMINHO DE ZERO É O DIRETO e não um setTimeout(0). Ver a
               conta dos 11ms na porta, lá embaixo: aqui ela vale igual,
               porque a primeira ativação desta cena também cai no lote de
               layout da seção. */
            espera: 0,
            FASES: ['is-c1', 'is-c2', 'is-c3', 'is-acento'],
            MARCAS: [
                [ 289, 'is-c1'],
                [ 918, 'is-c2'],
                [1755, 'is-c3'],
                [2435, 'is-acento']
            ]
        },
        {
            /* ================= A LUZ DO ATO 4 (ben-luz) =================
               27/08/2026. A TERCEIRA LINHA DO ATO 4, e ela nasce pelo mesmo
               motivo da segunda: a arte do ato 4 mora em elementos que não são
               parentes entre si, e o monta() acende UM elemento por linha.

               ORDEM DO DONO, com o celular na mão: "precisa corrigir o brilho
               cinza, ele aparece no background dando um brilho muito grande, e
               depois fica pequeno, ele deve ter um tamanho somente, e de ter um
               fade in, enquanto os cards aparecem."

               O DEFEITO TINHA DUAS METADES E ESTA LINHA MATA A SEGUNDA. A
               PRIMEIRA metade era a LAVAGEM do ato 3, que é uma demão do
               tamanho da tela e é o "brilho muito grande" do relato: medida em
               390x844, ela fica em opacidade 1,000 por quatro passos de 90px e
               só começa a sair quando o `data-ato` vira 4. Isso já tem conserto
               próprio, no bloco da lavagem logo abaixo, e NÃO se mexe aqui.
               A SEGUNDA metade era esta luz chegando CEDO DEMAIS. No celular
               ela subia pela faixa `entry 0% 24%` do surgir, que é uma faixa da
               CAIXA e não da cena: medido, a luz batia opacidade 1,000 no passo
               12 e o primeiro card (`is-c1`) só entrava no 13. O leitor via o
               fundo trocar de brilho ANTES de existir card, que é exatamente o
               "aparece grande e depois fica pequeno" lido do outro lado.
               O TAMANHO NUNCA FOI O PROBLEMA, e isso está medido para ninguém
               sair caçando: a caixa da luz mede 447x447 em TODOS os 26 passos
               da sonda, sem um pixel de variação. Quem mudava de tamanho era o
               conjunto lavagem-mais-luz, não a luz.

               UMA FASE SÓ, NO ZERO, igual à linha do fio, e pelo mesmo motivo:
               a luz é uma transição única e todo o ritmo dela mora na folha. A
               espera é ZERO junto com as outras duas linhas do ato, e é isso
               que faz as três partirem no mesmo tique do mesmo callback, sem
               mecanismo de coordenação nenhum. AS TRÊS LINHAS DO ATO 4 MUDAM
               JUNTAS OU NÃO MUDAM.
               A DURAÇÃO NÃO ESTÁ AQUI, está na folha: são 2400ms, escolhidos
               contra os 3000 do desktop para o fade FECHAR com a última marca
               dos cards (2435ms). "Enquanto os cards aparecem" é uma janela, e
               a luz agora ocupa a janela inteira.
               O DESKTOP NÃO SENTE NADA: lá quem acende a luz continua sendo o
               `data-ato="4"` da seção, e a classe `is-acesa` não tem regra
               fora do degrau de 600. */
            ato: '4',
            id: 'benLuz',
            espera: 0,
            FASES: ['is-acesa'],
            MARCAS: [
                [   0, 'is-acesa']
            ]
        },
        {
            /* ================= O FIO DO ATO 4 (bcxf-) =================
               25/08/2026, madrugada. A SEGUNDA LINHA DO ATO 4, e ela existe
               porque a arte do ato 4 mora em DOIS elementos e não em um.

               O DONO MANDOU O FIO ATRAVESSAR A TELA INTEIRA: "a linha
               pontilhada vá de extremidade a extremidade da tela (ir até o
               final, e começar lá do topo da tela mesmo)". A cena mede 640
               por 512, que é meia tela de altura, então o fio saiu de dentro
               dela e foi morar na CAMADA DE FUNDO do mesmo ato, que tem
               100vh. A camada e a cena são primas e não parentes: nenhuma
               das duas está dentro da outra, e nenhum seletor de CSS alcança
               uma a partir das classes da outra.

               DAÍ A LINHA SEPARADA, e ela é a solução mais barata das que
               existiam. As alternativas eram mexer no monta() para uma linha
               poder acender dois elementos (código compartilhado, e há outra
               sessão editando este arquivo agora) ou alcançar a camada por
               :has() a partir da cena (um seletor de peso quebrado, contra a
               disciplina de peso uniforme que esta seção inteira pratica).
               Duas linhas com o mesmo ato não pedem uma linha de código nova:
               a tabela já monta uma porta por linha e os dois observadores já
               chamam todas as portas.

               A SINCRONIA SAI DE GRAÇA E FOI MEDIDA. As duas portas são
               consultadas pelo MESMO callback do MutationObserver, no mesmo
               tique, e cada uma arma o próprio setTimeout de 500ms nesse
               instante. A deriva entre os dois arranques é de menos de um
               milissegundo, muito abaixo de um quadro, e é por isso que o
               fio e os cards partem juntos sem nenhum mecanismo de
               coordenação entre eles.

               UMA FASE SÓ, NO ZERO. O fio é uma transição única de 3500ms
               que não tem paradas, então o relógio dele tem uma marca e ela
               cai no instante zero. Todo o resto do ritmo é a curva, e a
               curva mora na folha.
               Se um dia o monta() ganhar a capacidade de acender vários
               elementos por linha, estas duas viram uma. */
            ato: '4',
            id: 'bcxFio',

            /* ESPERA ZERO AQUI TAMBÉM, E ISSO NÃO É CÓPIA CEGA: a sincronia
               entre esta linha e a da cena é o que faz o fio e os cards
               partirem juntos, e ela sai de graça porque as duas portas são
               consultadas pelo MESMO callback, no mesmo tique. Com 500 nas
               duas a deriva era de menos de um milissegundo; com ZERO nas
               duas ela some de vez, porque as duas chamam toca() de forma
               síncrona dentro da mesma volta do callback, sem timer nenhum
               no meio.
               DEIXAR UMA EM 0 E OUTRA EM 500 SERIA O PIOR DOS MUNDOS: os
               cards pousariam meio segundo antes de o fio existir, e a
               travessia por trás deles, que é o que faz três cards soltos
               lerem como um processo, viraria uma coincidência. As duas
               linhas do ato 4 mudam juntas ou não mudam. */
            espera: 0,
            FASES: ['is-traco'],
            MARCAS: [
                [   0, 'is-traco']
            ]
        }
    ];

    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* A TELA É UMA PERGUNTA SÓ, PARA A SEÇÃO INTEIRA, e por isso mora
       fora das cenas: quem responde é um observador único lá embaixo. Se
       cada cena tivesse a sua, seriam dois observadores fazendo a mesma
       pergunta ao navegador, que é como um palco passa a piscar. */
    var naTela = false;

    /* ================= O CELULAR PERGUNTA OUTRA COISA, 27/08/2026 =================
       ORDEM DO DONO: no celular a seção tem que ficar "mais parecida com a mesma
       sessão no desktop", com as animações acontecendo "quando o usuário vê a
       primeira vez a ilustração", fundos incluídos.

       POR QUE O ato DA SEÇÃO NÃO SERVE AQUI, e está medido. No desktop o palco é
       pinado: existe UMA arte em cena por vez e a pergunta certa é "qual TEXTO
       está na tira do meio da tela", que é o que o observador de ato responde.
       No celular as três artes viram pedaços de fluxo, uma embaixo do texto dela,
       e as três ficam visíveis em momentos diferentes do MESMO deslize. Medido em
       375x812: as caixas das artes são 327 por 261,6 e as dos textos 322, 352 e
       431, ou seja um texto e a arte do ato SEGUINTE cabem na mesma tela. Com o
       ato da seção mandando, a arte do ato 4 podia estar bem no meio da tela
       enquanto a tira de 10% segurava o texto do ato 3: a cena rodaria fora de
       cena, ou pior, ficaria parada no primeiro quadro (vazia) na frente de quem
       está olhando. Foi por isso que a folha congelava as três no quadro final.

       ENTÃO NO CELULAR A PERGUNTA É POR ATO E É SOBRE A PRÓPRIA ILUSTRAÇÃO:
       "a arte deste ato está à vista?". É a tradução literal da ordem, e é a
       única pergunta que sobrevive a uma coluna que rola.

       AS OUTRAS DUAS CONDIÇÕES DE ATIVAÇÃO NÃO MUDAM (aba visível, e o rearme na
       re-entrada), e o resto do condutor NÃO SABE DE NADA DISSO: relógio, quadro
       mudo, espera, ganchos e o pouso do movimento reduzido continuam escritos
       uma vez só. O que este bloco troca é uma linha do ativo().

       O MAPA É POR ATO E NÃO POR CENA de propósito. As linhas do ato 3 (bnfCena e
       bnfFio) e as do ato 4 (bcxCena e bcxFio) têm que partir JUNTAS, que é o que
       faz a reta existir debaixo das cápsulas e o fio atravessar por trás dos
       cards; a folha já diz isso com todas as letras na coluna `espera` das duas.
       Com uma resposta por ATO, as duas linhas leem o MESMO booleano no MESMO
       tique do mesmo callback, e a deriva entre elas é zero por construção. Uma
       resposta por CENA reabriria essa porta.
       QUEM RESPONDE É A .ben-cena DO ATO, sempre, inclusive para a linha do fundo:
       cena e fundo dividem a mesma célula da grade, com a mesma margem, então são
       a mesma caixa na tela. Observar as duas seria fazer a mesma pergunta duas
       vezes, que é como um palco passa a piscar. */
    var mob = window.matchMedia('(max-width: 600px)');
    var visivelAto = {};

    /* O SEGUNDO MAPA, e ele responde OUTRA pergunta sobre a mesma caixa: "a
       ilustração deste ato já encostou no topo da tela?". Ele existe só para a
       saída da lavagem e a conta está no bloco dela, logo abaixo do monta(). */
    var saindoAto = {};

    /* Cada cena montada devolve a PORTA dela, e é só isso que sai daqui
       para fora. O estado de uma cena (os relógios, o rodando) fica
       fechado dentro dela e nenhuma enxerga o da outra. */
    function monta(cfg) {
        var cena = sec.querySelector('.ben-cena[data-ato="' + cfg.ato + '"]');
        var arte = document.getElementById(cfg.id);
        if (!cena || !arte) return null;

        /* Toda classe que a arte acende precisa estar na FASES da linha dela:
           é esta lista que zera o palco no religamento e é ela que o movimento
           reduzido acende de uma vez. */
        var FASES = cfg.FASES;

        /* A linha do tempo de uma volta, em ms desde o começo dela. A conta
           de cada marca está no cabeçalho. */
        var MARCAS = cfg.MARCAS;

        var relogios = [];
        var rodando = false;

        /* ================= OS GANCHOS, 27/08/2026 =================
           A COLUNA OPCIONAL QUE NASCEU COM O GIRO DO GLOBO ("você consegue
           deixar essa esfera girando?"). Até aqui toda arte desta tabela se
           movia só por CLASSE, e por isso o condutor só sabia acender classes.
           O giro é SMIL, que classe nenhuma liga: <animate begin="indefinite">
           só anda quando alguém chama beginElement().
           A REGRA QUE ISSO NÃO QUEBRA, e ela é a razão de os ganchos serem uma
           coluna e não um bloco novo: continua sendo o CONDUTOR quem manda na
           hora. Um gancho não tem relógio próprio, ele é chamado na marca dele,
           e o que ele precisar agendar agenda na LISTA DE RELÓGIOS da cena, que
           é o que faz o cancelamento sair de graça quando o ato apaga.
           SÃO TRÊS ENTRADAS E DUAS DELAS SÃO NOMES RESERVADOS:
             GANCHOS['is-xxx']  chamado logo depois de a marca acender a classe
                                is-xxx, com (arte, agenda).
             GANCHOS.zera       chamado no fim do quadro mudo, para a peça que
                                não é CSS voltar ao começo junto com as outras.
             GANCHOS.para       chamado quando o ato apaga, para o que estiver
                                rodando parar de custar atrás de um crossfade
                                invisível. Ele existe porque as classes NÃO se
                                limpam na saída (o quadro final fica de pé para
                                a volta ser corte seco), e sem ele uma peça viva
                                continuaria repintando fora de cena.
           O MOVIMENTO REDUZIDO NÃO CHAMA GANCHO NENHUM, e é assim que o gate
           da folha alcança uma técnica que não escuta CSS: o toca() do reduce
           acende as classes e volta, e o que só nasce por gancho não nasce. */
        var GANCHOS = cfg.GANCHOS || {};

        function agenda(ms, fn) {
            if (ms > 0) relogios.push(setTimeout(fn, ms));
            else fn();
        }

        function gancho(nome) {
            if (GANCHOS[nome]) GANCHOS[nome](arte, agenda);
        }

        function limpa() {
            relogios.forEach(clearTimeout);
            relogios = [];
        }

        /* O QUADRO MUDO. Tirar as classes da volta anterior devolve as peças ao
           estado inicial (no ato 1 o cartão, a fita, o visto e a notificação;
           no ato 3 as duas bolhas, o card, o miolo e a pílula), e com as
           transições ligadas isso seria uma rebobinada na frente de quem está
           olhando.
           O is-mudo É POR PREFIXO E NÃO GLOBAL: cada arte tem a lista nominal
           dela na folha, e é por isso que esta função não precisa saber de
           qual arte se trata. Ela liga a classe, tira as fases e desliga.
           Os dois offsetWidth são obrigatórios e não são o mesmo: o primeiro
           assenta o estado inicial sem animar, o segundo devolve as
           transições antes de a cascata começar. */
        function zera() {
            arte.classList.add('is-mudo');
            FASES.forEach(function (c) { arte.classList.remove(c); });
            void arte.offsetWidth;
            arte.classList.remove('is-mudo');
            void arte.offsetWidth;
            /* O gancho vem DEPOIS dos dois reflows de propósito: o que ele
               desfaz não é CSS, então nada do que ele mexe precisa assentar
               entre um reflow e outro, e chamá-lo antes deixaria o estado
               inicial dele à mercê da remoção de classes que vem logo acima. */
            gancho('zera');
        }

        function toca() {
            limpa();

            if (reduz.matches) {
                /* O quadro final, inteiro, de uma vez. As durações estão
                   zeradas pelo gate da folha, então isto não anima nada.
                   E NENHUM GANCHO, que é como o gate alcança o que não é CSS:
                   ver o bloco dos ganchos lá em cima. */
                FASES.forEach(function (c) { arte.classList.add(c); });
                return;
            }

            zera();
            MARCAS.forEach(function (m) {
                if (m[0] === 0) { arte.classList.add(m[1]); gancho(m[1]); return; }
                relogios.push(setTimeout(function () {
                    arte.classList.add(m[1]);
                    gancho(m[1]);
                }, m[0]));
            });
        }

        /* AS TRÊS COISAS QUE CONTAM COMO ATIVAÇÃO, e a primeira é a única que
           mudou com a tabela: o ato da seção tem que ser O DESTA CENA, e não
           o "1" que estava escrito à mão aqui quando havia uma arte só.
           NO CELULAR A PRIMEIRA TROCA DE PERGUNTA e as outras duas ficam: em vez
           de "o ato da seção é o meu e a seção está na tela", vale "a MINHA
           ilustração está à vista". A conta e o motivo estão no bloco do
           `visivelAto`, lá em cima. Repare que a resposta do celular já embute o
           naTela: arte à vista é seção à vista, por construção. */
        function ativo() {
            if (mob.matches) return visivelAto[cfg.ato] === true && !document.hidden;
            return sec.dataset.ato === cfg.ato && naTela && !document.hidden;
        }

        /* A ESPERA DE MEIO SEGUNDO ANTES DA PRIMEIRA BATIDA. A ARQUEOLOGIA DO
           NÚMERO, que já tem três degraus e todos os dois últimos são do dono:
             · 0. A cena arrancava no mesmo quadro em que o ato 1 acendia,
               junto com o texto ao lado entrando.
             · 1000 (25/08/2026, madrugada): "comece depois de 1 segundo de
               visualizar ela". Nasceu como respiro: cena que entra na tela
               respira antes de agir.
             · 500 (25/08/2026, madrugada, mais tarde): "ao invés de demorar 1
               segundo, faça demorar 0,5s". O dono viu o compasso rodando e
               achou-o longo. A mecânica não mudou uma linha, só o número.
           CUIDADO DE ESCOPO: a esteira da emp- também espera 1000ms, e ela NÃO
           entra nesta ordem. O dono falou desta cena; o número de lá continua
           sendo o de lá até ele dizer o contrário.
           ================= O ATO 3 É EXCEÇÃO, 25/08/2026 (tarde) =================
           ELE ESPERA ZERO, E ISSO É ORDEM LITERAL DO DONO: "quero que a
           animação seja otimizada. Ela demora muito para começar, quero que
           comece NO EXATO MOMENTO que o usuário visualizar a sessão." Não há
           como cumprir "no exato momento" e guardar meio segundo de respiro
           ao mesmo tempo, então a espera daquela cena morreu.

           NÃO "CONSERTAR" A ASSIMETRIA. Esta é a parte que fica escrita em
           voz alta, porque a próxima pessoa a ler este bloco vai ver artes
           com 500 e artes com 0 e vai querer alinhar todas. NÃO ALINHE.
           Uniformizar por conta própria seria desfazer ordem do dono em
           nome de simetria, e hoje são DUAS ordens e não uma.

           A REGRA VIROU OUTRA NA NOITE DE 25/08/2026, e é ela que vale
           daqui em diante. O ato 4 recebeu a MESMA ordem que esta cena
           recebeu à tarde ("a animação está demorando para começar, quero
           que comece no exato instante que o usuário visualiza ela"), e com
           dois atos imediatos a leitura de "exceção" morreu: A ESPERA É
           PROPRIEDADE DO ATO E É DITADA PELO DONO, CENA A CENA. Hoje os
           atos 3 e 4 partem no instante da ativação e os atos 1 e 2 guardam
           o compasso de 500ms, e nenhum dos quatro números é mais "o certo"
           que os outros. Se um dia a assimetria incomodar, quem decide é o
           dono, não quem estiver arrumando o arquivo.
           A REDAÇÃO ANTERIOR DEFENDIA O CONTRÁRIO e vale saber por quê: ela
           dizia que a espera "não é propriedade da arte, é propriedade do
           PALCO", e que duas cenas do mesmo palco com esperas diferentes
           fariam o mesmo gesto de rolar render dois compassos. O argumento
           era bom e caiu por um fato: as cenas do palco deixaram de ser
           igualmente rápidas para chegar ao primeiro pixel. A do ato 3 tem
           uma reta que nasce fora da tela e precisa correr antes de aparecer,
           e era essa soma (espera mais tempo cego) que o dono estava vendo.
           Compasso igual não garante entrada igual quando as artes têm
           anatomias diferentes.

           POR ISSO A ESPERA VIROU COLUNA DA TABELA, e ela é a única coluna
           que o cabeçalho da tabela diz que não deveria existir. A ressalva
           continua valendo para o que ela cobre: curva, duração e pose seguem
           sendo assunto da FOLHA, e nada disso entrou aqui. O que entrou é um
           parâmetro de ATIVAÇÃO, que é assunto do condutor por definição,
           porque ele mede o intervalo entre um evento de scroll e a primeira
           classe. A coluna é opcional: linha sem `espera` herda os 500.

           O QUE ACONTECE DURANTE A ESPERA, nas cenas que ainda a têm: o
           palco fica na POSE PRÉ-PRIMEIRA-BATIDA, vazio (no ato 1 o celular
           ainda está fora e a tela morta). Por isso o zera() é chamado NA
           ATIVAÇÃO e não junto com a cascata: numa re-entrada o palco ainda
           carrega o quadro final da volta anterior, e sem o corte imediato o
           visitante veria a cena acabada por meio segundo e só então ela
           voltaria ao começo. O zera() acontece no quadro mudo, então o corte
           é seco e não uma rebobinada.
           COM ESPERA ZERO ISSO NÃO MUDA E CONTINUA OBRIGATÓRIO: o zera() da
           ativação e o zera() de dentro do toca() acontecem no mesmo tique,
           um atrás do outro, e o segundo é inofensivo porque o primeiro já
           deixou a arte no começo. O que ele garante é que a re-entrada seja
           CORTE SECO e não rebobinada, mesmo sem nenhum intervalo entre os
           dois.

           E O TIMER MORA NA LISTA DE RELÓGIOS de propósito. É o que faz o
           cancelamento ser de graça: sair do ato chama limpa(), que mata a
           espera junto com o resto, e voltar arma uma espera NOVA. Não existe
           arranque fantasma de um timer que venceu com a seção fora da tela.
           QUANDO A ESPERA É ZERO NÃO HÁ TIMER, e a porta chama toca() no
           mesmo tique. A primeira redação usava setTimeout(toca, 0) por
           uniformidade e a bancada mediu o preço: 11ms na primeira ativação,
           que é a cara (o layout da seção acontece no mesmo lote). Onze
           milissegundos não se veem sozinhos, mas empurravam o primeiro pixel
           da reta de 194 para 205ms e estouravam o teto de 200 da direção.
           Uniformidade que custa o número que a ordem fixou não é
           uniformidade, é teimosia. A conta está na porta. */
        var ESPERA = cfg.espera != null ? cfg.espera : 500;

        /* A porta única DESTA CENA. Toda mudança de estado passa por aqui, e é
           ela que garante que a cascata toque UMA vez por ativação: enquanto o
           ato dela continuar ativo nada se repete, e a borda de subida é o
           único instante em que a espera é armada sozinha.
           ELA É O QUE monta() DEVOLVE, e é a única coisa que sai desta função:
           os relógios e o rodando ficam fechados aqui dentro, então uma cena
           não tem como pisar no estado da outra nem por engano. */
        function confere() {
            var agora = ativo();
            if (agora && !rodando) {
                rodando = true;
                limpa();
                /* O movimento reduzido não espera: não há animação para
                   atrasar, e meio segundo de palco vazio antes de um quadro
                   parado seria só meio segundo a menos de conteúdo. */
                if (reduz.matches) { toca(); return; }
                zera();
                /* ESPERA ZERO DISPARA NO MESMO TIQUE, e não num setTimeout de
                   0. A diferença parece filosófica e foi MEDIDA: o timer de 0
                   cai no próximo macrotask, o que na primeira ativação (a
                   cara, com layout da seção acontecendo junto) custou 11ms
                   entre o carimbo do ato e a primeira classe. Onze
                   milissegundos não se veem, mas eles empurraram o primeiro
                   pixel da reta de 194 para 205ms e estouraram o teto de 200
                   que a direção fixou. Chamar toca() aqui devolve os 11.
                   E NÃO SE PERDE NADA COM ISSO: o zera() logo acima já forçou
                   os dois reflows, então o estado inicial está assentado de
                   forma síncrona antes de a primeira classe entrar; e não há
                   o que cancelar num timer que não existe, porque a cascata
                   inteira já foi armada dentro do toca(), na lista de
                   relógios, de onde o limpa() a tira.
                   AS CENAS COM ESPERA CONTINUAM NO TIMER, e ele continua
                   morando na lista pelo motivo de sempre: sair do ato mata a
                   espera junto com o resto e voltar arma uma nova. */
                if (ESPERA > 0) relogios.push(setTimeout(toca, ESPERA));
                else toca();
                return;
            }
            /* A SAÍDA CANCELA O QUE AINDA NÃO ACONTECEU E PARA O QUE JÁ ESTÁ
               ACONTECENDO. O limpa() sempre fez a primeira metade; o gancho
               'para' fez a segunda nascer em 27/08/2026, com o giro do globo.
               A ASSIMETRIA É DE PROPÓSITO E ESTÁ DOCUMENTADA NA FOLHA: as
               classes NÃO se limpam aqui, porque o quadro final tem que ficar
               de pé para a volta ser corte seco. Peça que só existe por classe
               não custa nada parada; peça VIVA (uma animação em laço) custaria
               a página inteira repintando atrás de um crossfade que ninguém
               está vendo. Quem for pôr um laço numa arte desta tabela põe o
               freio dele aqui, na coluna GANCHOS da linha. */
            if (!agora && rodando) { rodando = false; limpa(); gancho('para'); }
        }

        return confere;
    }

    /* ---- AS PORTAS, E OS DOIS OBSERVADORES QUE AS CHAMAM ----
       As cenas cuja arte ainda não existe caem fora aqui, na guarda de
       dentro do monta(), e o filter é o que deixa a tabela crescer sem
       exigir que as artes nasçam ao mesmo tempo. */
    var PORTAS = CENAS.map(monta).filter(Boolean);
    if (!PORTAS.length) return;

    /* ================= A LAVAGEM DO ATO 3 NO CELULAR · 27/08/2026 =================
       ORDEM DO DONO, com print do ato 3 no celular: "o efeito no degradê no
       background da sessão quando usuário visualiza ela, igual é no desktop.
       Aplique essas mudanças no mobile."

       O QUE MUDA DE MÃO. No desktop quem acende a lavagem é o `data-ato` da
       seção, escrito pelo observador dos TEXTOS: o ato é quem estiver na tira do
       meio da tela. Isso não serve aqui, e o motivo está medido na lápide do
       degrau de 960 na folha: no celular os três textos cabem quase na mesma
       tela e o ato 3 vale por 352px de rolagem, ou seja a entrada de 1600ms
       seria cancelada no meio do caminho e a lavagem PULSARIA.
       ENTÃO ELA PASSA A LER A ILUSTRAÇÃO, que é a tradução literal do "quando
       usuário visualiza ela" e é a mesma pergunta que as artes deste celular já
       fazem desde a rodada de hoje: `visivelAto['3']`, o mapa do observador das
       ilustrações, a 34% da .ben-cena. A JANELA TRIPLICA e é isso que desfaz o
       pulso: a arte mede 273,6 numa tela de 844, então ela fica acima dos 34%
       por 844 + 273,6 - 2x93 = 931px de rolagem, contra os 352 do texto. Uma
       entrada de 1600ms cabe folgada aí dentro.

       ELE É UM CARIMBO E NÃO UMA CLASSE, e o `data-arte` fica ao lado do
       `data-ato` de propósito: são a mesma pergunta feita sobre coisas
       diferentes (um lê o texto do meio, o outro a ilustração à vista), e a
       folha os trata com o MESMO PESO, (0,3,0), resolvendo a disputa por ORDEM
       lá embaixo, dentro do degrau de 600. Ver o item 9 do bloco do celular.
       O DESKTOP NÃO SENTE NADA: fora do degrau de 600 este carimbo nunca é
       escrito, e a regra que o lê mora dentro da media query.
       ELE NÃO ENTRA NO ativo() DE NINGUÉM. As artes continuam lendo o mapa
       direto, como sempre leram; este carimbo existe para a FOLHA, que não tem
       como ler um objeto de JavaScript.

       ================= E A SAÍDA TEM REGRA PRÓPRIA, 27/08/2026 =================
       SEGUNDA ORDEM DO DONO SOBRE A MESMA PEÇA, no mesmo dia: "você animou a luz
       no background, mas ela tem que sumir depois que você vai descendo para o
       próximo bloco."
       O DEFEITO TINHA CAUSA MEDIDA. Com o gatilho só na ilustração, a lavagem
       ficava acesa enquanto a arte tivesse 34% à vista, e 34% de uma arte de
       273,6 são 93px: ela só apagava quando a arte estava a 93px de sumir pelo
       topo, e aí ainda gastava os 1200ms do fade. Na prática o cinza acompanhava
       o leitor bloco adentro, que é exatamente o que o dono viu.

       A REGRA QUE FICOU: a lavagem vale enquanto a ilustração estiver com 34% à
       vista E NÃO tiver começado a sair pelo TOPO da tela. A borda de cima da
       arte cruzando y=0 é o instante em que se deixa de olhar para ela e se
       passa a descer para o bloco seguinte, e é aí que o fade de 1200ms começa.
       MEDIDO em 390x844: ela apaga com o título do bloco 4 a 64% da tela e
       morre com ele já passando pelo topo.

       O CAMINHO QUE FOI TENTADO E DESCARTADO, para ninguém refazê-lo: pendurar
       a saída no `data-ato` da seção (o observador dos TEXTOS, na tira do meio),
       que é a leitura mais literal de "próximo bloco". DESCENDO ele funciona;
       SUBINDO ele quebra, e a medição pegou: voltando para a arte, o texto do
       bloco 3 já está acima da tela, o `data-ato` continua valendo 4 e a lavagem
       NÃO volta. Um gatilho que só funciona num sentido não serve para uma peça
       que o dono confere rolando para os dois lados.
       A REGRA DE HOJE É SIMÉTRICA POR CONSTRUÇÃO, porque a pergunta é sobre a
       POSIÇÃO da arte e não sobre um estado que alguém escreveu antes: descendo,
       a borda de cima cruza o topo e a lavagem sai; subindo, ela volta a entrar
       e a lavagem volta, no mesmo pixel.

       COMO A PERGUNTA É FEITA: um segundo IntersectionObserver com
       `rootMargin: '0px 0px -100% 0px'`, que encolhe a raiz até ela virar a
       LINHA do topo da janela. A arte cruza essa linha só no instante em que
       está a cavalo dela, então `isIntersecting` ali quer dizer exatamente
       "começou a sair pelo topo" — não "está visível", que é a pergunta do outro
       observador. Os dois mapas leem as MESMAS .ben-cena e chamam o mesmo
       confere(), então não há um relógio novo nem um listener de rolagem.
       E ELE NÃO ENCOSTA NAS ARTES: quem lê o `saindoAto` é a lavagem e mais
       ninguém. O `ativo()` de cada cena continua com a pergunta dele. */
    function lavagem() {
        var liga = mob.matches
            && visivelAto['3'] === true
            && saindoAto['3'] !== true;
        if (liga) sec.dataset.arte = '3';
        else if (sec.dataset.arte) delete sec.dataset.arte;
    }

    function confere() {
        PORTAS.forEach(function (porta) { porta(); });
        lavagem();
    }

    /* UM observador de atributo e UM de tela, para a seção inteira, e não
       um par por cena: a pergunta "qual ato está no meio da tela" já foi
       respondida pelo bloco lá em cima, e "a seção está na tela" é uma
       pergunta só. Repetir qualquer uma delas é como um palco passa a
       piscar, e este arquivo já diz isso em três lugares. */
    new MutationObserver(confere).observe(sec, {
        attributes: true,
        attributeFilter: ['data-ato']
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) { naTela = e.isIntersecting; });
            confere();
        }, { threshold: 0 }).observe(sec);

        /* ---- O OBSERVADOR DAS ILUSTRAÇÕES, 27/08/2026 ----
           O TERCEIRO OBSERVADOR DESTA SEÇÃO, e ele NÃO repete pergunta nenhuma
           dos outros dois: aquele de cima responde "a seção está na tela" e o do
           bloco 3B-bis responde "qual TEXTO está na tira do meio". Este responde
           "esta ILUSTRAÇÃO está à vista", que é pergunta nova e só o celular faz.
           ELE FICA ARMADO NAS DUAS LARGURAS de propósito, e escrever o mapa no
           desktop não custa nem muda nada: o ativo() do desktop nem lê o mapa. O
           que isso compra é a virada de largura sem re-montagem: quem gira o
           aparelho ou abre o inspetor e atravessa os 600px encontra o mapa já
           preenchido, em vez de uma arte que espera o próximo deslize para saber
           se está na tela.

           OS 34% SÃO "VER A ILUSTRAÇÃO", e o número saiu de medição e não do olho.
           A caixa da arte mede 261,6px de altura num aparelho de 375 (e 273,6 num
           de 390), então 34% são 89px de desenho dentro da tela: a arte já passou
           da borda de baixo e está lida como peça, mas ainda sobra tela de sobra
           para a cascata inteira acontecer com ela subindo. Disparar em 0 seria
           tocar a cena com um fio de pixel à mostra; esperar 60% seria a arte
           chegar montada, que é exatamente o que o dono mandou desfazer.
           O LIMIAR SE MEDE POR intersectionRatio E NÃO POR isIntersecting, e isto é
           armadilha conhecida: o isIntersecting vira true no PRIMEIRO pixel, seja
           qual for o threshold declarado. Quem confia nele dispara a cena com a
           arte fora da tela. O 0,33 no teste é a folga do arredondamento contra o
           0,34 declarado, que o navegador entrega como 0,3399... com frequência.
           O ZERO NA LISTA É OBRIGATÓRIO: sem ele o callback não roda quando a arte
           SAI da tela por completo, e o mapa ficaria com um true velho de pé,
           matando o rearme da re-entrada.

           A VOLTA É REARME, exatamente como no desktop: descer, sair da arte e
           voltar toca a cascata do zero, porque o mapa vira false na saída e a
           porta única de cada cena lê a borda de subida de novo. Nada disso é
           código novo, é o confere() de sempre lendo outra resposta. */
        var ioArte = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                visivelAto[e.target.dataset.ato] = e.intersectionRatio >= 0.33;
            });
            confere();
        }, { threshold: [0, 0.34] });

        /* ---- O OBSERVADOR DA LINHA DO TOPO, 27/08/2026 ----
           O QUARTO OBSERVADOR, e ele responde a única pergunta que faltava para
           a lavagem do celular saber a hora de sair: "esta ilustração começou a
           sair pelo TOPO da tela?".
           O `rootMargin` de -100% embaixo encolhe a raiz até ela virar a LINHA
           y=0 da janela. Uma caixa só cruza uma linha quando está a cavalo dela,
           então aqui `isIntersecting` NÃO quer dizer "está visível" (essa é a
           pergunta do ioArte, logo acima) e sim "a borda de cima acabou de
           passar". É por isso que os dois mapas não são redundantes apesar de
           observarem os mesmos elementos.
           A LEITURA COMBINADA está no bloco da lavagem: à vista E não saindo.
           Descendo, a arte cruza a linha e a lavagem sai; subindo, ela cruza de
           volta e a lavagem volta, no mesmo pixel. É a simetria que o
           `data-ato` não tinha.
           ELE FICA ARMADO NAS DUAS LARGURAS pelo mesmo motivo do ioArte: escrever
           o mapa no desktop não custa nada e compra a virada de largura sem
           re-montagem. Quem lê o mapa é só a lavagem, e ela mora dentro dos
           600. */
        var ioTopo = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                saindoAto[e.target.dataset.ato] = e.isIntersecting;
            });
            confere();
        }, { rootMargin: '0px 0px -100% 0px', threshold: 0 });

        Array.prototype.forEach.call(
            sec.querySelectorAll('.ben-cena[data-ato]'),
            function (c) { ioArte.observe(c); ioTopo.observe(c); }
        );

        /* A VIRADA DE LARGURA CHAMA A PORTA, e ela é a única linha deste bloco
           que existe por causa da media query. Atravessar os 600px troca a
           pergunta do ativo() debaixo de cenas que já estão rodando (ou paradas),
           e sem este aviso a arte só descobriria isso no próximo deslize. O
           confere() resolve os dois sentidos sozinho: quem deixou de estar ativo
           cai no ramo de saída (limpa mais o gancho 'para'), quem passou a estar
           toca do zero. O addListener é o fallback de Safari antigo, que não
           implementa addEventListener em MediaQueryList. */
        if (mob.addEventListener) mob.addEventListener('change', confere);
        else if (mob.addListener) mob.addListener(confere);
    } else {
        /* Sem observador, a arte do ato que o HTML já carimbou roda uma vez
           no carregamento e fica no quadro final. Degradar para uma cena
           acabada é melhor do que degradar para uma cena que nunca começa. */
        naTela = true;
        confere();
    }

    document.addEventListener('visibilitychange', confere);

    /* ---- LÁPIDE: O REPLAY NO CLIQUE, 25/08/2026 (madrugada) ----
       Aqui morava um listener de clique na .ben-cena do ato 1 que re-rodava
       a cascata do zero. Nasceu como bônus do orquestrador na v1, foi
       refinado na v4 (não esperava o 1s de respiro, para clique não ler
       como defeito) e o DONO MANDOU EXCLUIR: "essa animação está com
       alguma integração que quando clica, ele reseta a animação e
       recomeça, tire isso". A cena não reage mais a clique nenhum.
       NÃO REPROPOR. O replay que sobrou é a re-entrada no ato, e ela é
       mecanismo de scrollytelling: quem sai para o ato 2 e volta recebe a
       cena rearmada com a espera de 500ms, como na primeira vez.
       A variável `cena` continua viva porque é ela que prova a existência
       do vão na guarda lá em cima; ela não escuta mais nada.
       A ORDEM VALE PARA A TABELA INTEIRA, e não só para a cena que a
       recebeu: a arte do ato 3 nasceu em 25/08/2026 já SEM clique, e as
       dos atos 2 e 4 nascem assim também. Não há um listener de ponteiro
       neste bloco e não deve voltar a haver. */
})();


/* =========================================================
   A CONSTRUÇÃO DA BANDA DA VITRINE (vit-), 25/08/2026
   =========================================================
   Ordem do dono: "Quero que crie uma animação nesse background. Quero
   que ele seja um background preto, porém quando o usuário chega na
   sessão, acontece uma animação tecnológica e futurista no background,
   fazendo ele virar esse degradê cinza que está agora".

   A SEGUNDA ORDEM DELE, no mesmo dia, trocou a coreografia por uma
   construção lenta: "Quero que deixe ela mais suave, de uma forma que
   ele vai construindo o background de maneira sutil, e calma". O feixe
   morreu; ESTE BLOCO NÃO MUDOU UMA LINHA, porque ele nunca soube o que
   estava disparando.

   ESTE BLOCO É SÓ O INTERRUPTOR. A coreografia inteira (as duas
   camadas, as curvas, os 2,2s da base e os 0,9s de atraso da luz que
   ainda desliza 6% no eixo dela) mora em CSS, no bloco A CONSTRUÇÃO DA
   BANDA da folha, e é lá que se mexe nela. Aqui só se decide QUANDO.

   A TERCEIRA ORDEM, ainda em 25/08/2026, REVOGOU O ONE-SHOT: "Quero
   que programe, para quando a pessoa sair por completo, ela volta a
   ser preta. Para caso ela volte para cima, e depois visualize essa
   página novamente, ela vai ver a mesma animação". A ignição virou UMA
   POR CHEGADA, e é só isto que esta rodada mudou: a coreografia do
   bloom no CSS não teve um número tocado.

   FICA REGISTRADO que o `disconnect` e a prova de "sai e volta e NÃO
   re-acende" não eram defeito: eram a exigência da rodada anterior,
   cumprida e medida. Esta ordem é que trocou a regra. A prova de hoje
   é o contrário dela, e é a que vale.

   O ROTEIRO TEM DOIS PASSOS E A ORDEM IMPORTA: primeiro `vit-armado`,
   que apaga as duas camadas, e depois `vit-vivo`, que roda o percurso
   de 0 a 1.
   O repouso declarado no CSS é a banda ACESA, então quem não passa por
   aqui (sem JS, sem IntersectionObserver, com movimento reduzido ou
   com o script quebrado) vê a seção pronta e parada, nunca um
   retângulo preto morto. Foi por isso que o preto ficou numa classe do
   JS em vez de ser o estado natural do CSS.

   A MÁQUINA TEM DOIS ESTADOS E DOIS LIMIARES, e os dois números têm
   trabalho diferente:

     - LIMIAR 0: `isIntersecting` falso é ZERO PIXEL da seção na
       janela, por cima ou por baixo. É a única hora em que se pode
       rearmar, porque apagar a banda é uma troca brusca e ela tem que
       acontecer com a seção FORA DA VISTA. Ninguém vê o reset.
     - LIMIAR 0,08 para disparar, o mesmo de sempre: 0,5 nunca seria
       satisfeito porque esta seção é MAIS ALTA QUE A JANELA em quase
       toda largura (1247px no 1920), e a banda ficaria apagada para
       sempre. Com 0,08 o gatilho cai quando a seção desponta, que é o
       "quando o usuário chega na sessão" do pedido.

   O OBSERVADOR NÃO MORRE MAIS, e não vira vazamento por isso: é UM só,
   registrado uma vez, sem listener acumulado e sem relógio parado no
   meio. As animações não têm fill de saída, então somem sozinhas do
   getAnimations quando assentam, e o que sobra vivo entre um ciclo e
   outro é o observador e mais nada.

   O REINÍCIO DOS KEYFRAMES é o ponto delicado: trocar a classe no
   mesmo quadro não reinicia animação nenhuma, o navegador não vê
   diferença. Entre rearmar e redisparar sempre passa rolagem, ou seja
   pelo menos um quadro, então na prática o ciclo se reinicia sozinho.
   Mesmo assim o `acende` tira a classe, força um reflow lendo
   offsetWidth e põe a classe de volta: é o reinício explícito, e ele
   custa um recálculo de layout por chegada. Cinturão e suspensório de
   propósito, porque um quadro coalescido aqui apareceria como uma
   seção que fica preta e não acende.

   SAIR NO MEIO DO BLOOM é caso previsto: o rearme tira `vit-vivo`, o
   que CANCELA as duas animações na hora, e a seção volta ao preto
   fora da vista. Na volta, o bloom recomeça do zero, inteiro.

   O MOVIMENTO REDUZIDO SAI ANTES DE ARMAR, e agora isso protege duas
   coisas. O CSS também tem o gate dele, e as duas guardas são de
   propósito: esta evita apagar a seção, a de lá salva quem trocar a
   preferência do sistema com a página já aberta. Com a máquina de
   ciclos, a guarda daqui ficou MAIS importante: sem ela, um visitante
   com movimento reduzido seria rearmado ao sair e, como o gate do CSS
   desliga as animações, ele voltaria para uma seção PRETA E PARADA
   para sempre. Por isso quem tem movimento reduzido não entra nesta
   função: nunca arma, nunca rearma, banda acesa do começo ao fim. */
(function () {
    var sec = document.querySelector('.vit-section');
    if (!sec) return;

    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduzido && reduzido.matches) return;

    if (!('IntersectionObserver' in window)) return;

    var LIMIAR = 0.08;
    var aceso = false;

    sec.classList.add('vit-armado');

    /* REARMA: volta ao preto. Só é chamada com a seção fora da vista. */
    function apaga() {
        if (!aceso) return;
        sec.classList.remove('vit-vivo');
        sec.classList.add('vit-armado');
        aceso = false;
    }

    /* DISPARA: o bloom inteiro, desde o preto. */
    function acende() {
        if (aceso) return;
        sec.classList.remove('vit-vivo');
        void sec.offsetWidth;
        sec.classList.remove('vit-armado');
        sec.classList.add('vit-vivo');
        aceso = true;
    }

    var io = new IntersectionObserver(function (entradas) {
        for (var i = 0; i < entradas.length; i++) {
            var e = entradas[i];
            if (!e.isIntersecting) apaga();
            else if (e.intersectionRatio >= LIMIAR) acende();
        }
    }, { threshold: [0, LIMIAR] });

    io.observe(sec);
})();


/* =========================================================
   SEÇÃO 3A-bis: O PAINEL QUE SE DESENHA (gd-), O RELÓGIO
   25/08/2026
   =========================================================

   O QUE ESTE BLOCO FAZ, E É SÓ ISSO: escreve o pedido letra a letra na
   pílula e troca três atributos do palco. Todo o desenho mora no
   style.css, em keyframes escalonados por data-fase. Não há aqui uma
   linha de posicionamento, de opacidade ou de geometria.

   AS MARCAS CONTAM DO COMEÇO DA DIGITAÇÃO, e essa é a ordem que a
   .emp-section já pratica desde a noite de 24/08/2026: a página se
   revela ENQUANTO o pedido está sendo escrito, e não depois de ele ser
   enviado. O que o dono quer dizer com isso é literal: o escritório
   começa a trabalhar enquanto você ainda está digitando. A única marca
   que ainda conta do FIM da digitação é o floreio do botão de enviar,
   porque é a única que fala da frase.

   O CONTRATO COM O style.css. Estes números andam juntos com os de lá,
   e quem mexer num mexe no outro:
     ESVAI    300   o apagamento da tela que sai (240 no CSS, com folga
                    de 60 para a troca acontecer com o palco já limpo)
     FIM_MONTA 2560 o botão verde é o último a nascer, aos 2200 do CSS,
                    e dura 320: 2520 mais 40 de folga
     REPOUSO  3000  o tempo de LEITURA do painel pronto
   A cascata inteira dos widgets (120 + 200 por widget na moldura, 400 +
   200 no conteúdo) vive só no CSS: o JavaScript não sabe quantos
   widgets cada tela tem, e é assim que tem de ser.

   O REPOUSO É MAIOR QUE O DA .emp-section (3000 contra 2800) e a razão
   é o conteúdo: lá o que se lê é um número grande e duas linhas, aqui
   são três ou quatro widgets com sete valores. Painel com mais
   informação pede mais tempo parado, e o olho é quem manda no número.

   UM CICLO FECHA EM 5,86s (300 de esvaziamento mais 2560 de montagem
   mais 3000 de leitura) e a volta inteira em 17,6s.

   CORREÇÃO DATADA, 31/08/2026: ESSES 5,86s SÃO O PISO, E ATÉ HOJE ERAM
   A LEI. Era esse o defeito. O avanço do ciclo era um setTimeout de
   relógio de parede armado no mesmo quadro da primeira letra, correndo
   EM PARALELO com a digitação e sem olhar uma vez sequer para ela. Na
   mesa isso nunca deu em nada, porque a frase mais longa fecha em 2,06s
   e sobram 3,4s de folga até o prazo. No CELULAR dá: o WebKit e o Chrome
   represam os timers curtos durante rolagem com inércia, em low power
   mode e nas trocas rápidas de aplicativo, e a digitação é feita
   inteirinha de timers curtos — cada letra reagenda a próxima "a partir
   de agora", então quando o piso do timer sobe a frase escorrega inteira
   junto. O timer único de 5,86s não escorrega proporcionalmente, e
   ATROPELAVA a frase: o ciclo seguinte começava com a anterior pela
   metade, apagava aquele toco 300ms depois e escrevia a frase nova por
   cima. Era exatamente o que o dono via no aparelho dele e ninguém
   conseguia ver na mesa.

   HOJE O AVANÇO ESPERA AS DUAS COISAS — o prazo de parede E o fim de
   verdade da digitação com o floreio dela — e anda no que acontecer POR
   ÚLTIMO. Em condição normal o que acontece por último é sempre o prazo,
   e é por isso que o relógio da cena não mudou um milissegundo: continua
   5,86s por ciclo e 17,6s a volta, no mesmo instante de antes. Sob timer
   represado o ciclo fica mais lento do que isso, e esse é o preço certo:
   a alternativa era a pílula engolindo a própria frase.

   A POSE PARADA. O HTML nasce em repouso / cheia / 1, com o painel 1
   desenhado inteiro e o pedido 1 na pílula. É o que a página entrega a
   quem chega sem JavaScript, a quem pede menos movimento e a quem está
   olhando durante a ESPERA de 1s. Por isso a primeira volta chamada é a
   do ciclo 2: o ciclo 1 já está em cartaz, e retomar nele faria a
   pílula apagar a frase 1 para escrever a frase 1 de novo.

   OS TRÊS PEDIDOS SÃO TRÊS PERGUNTAS DIFERENTES DE PROPÓSITO, e não
   três versões da mesma: um recorte de período (fluxo de caixa), uma
   repartição (gastos por categoria) e um filtro por pessoa
   (transferências para a Ana). É o argumento da seção inteira, e ele
   se quebra se alguém trocar um pedido por outro parecido.
   ========================================================= */
(function () {
    var secao = document.getElementById('graficosSection');
    var palco = document.getElementById('gdPalco');
    var campo = document.getElementById('gdTexto');
    if (!secao || !palco || !campo) return;

    /* O GATE DO MOVIMENTO REDUZIDO SAI ANTES DE QUALQUER COISA, e ele
       devolve sem ligar nada: a pose parada do HTML já é o painel
       desenhado com o pedido escrito, ou seja, a peça inteira contada
       num quadro. O style.css tem o gate dele também, para quem trocar
       a preferência do sistema com a página já aberta. */
    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduzido && reduzido.matches) return;

    var caixa = campo.parentNode;
    var telas = [].slice.call(palco.querySelectorAll('.gd-tela'));
    if (telas.length !== 3) return;

    /* Os três pedidos, na ordem em que entram. A frase e a tela que ela
       revela ficam juntas aqui para ninguém trocar uma sem a outra:
       pílula pedindo o gráfico de categorias e viewport mostrando as
       transferências é o tipo de erro que passa despercebido por
       semanas. */
    var CICLOS = [
        'Monta uma visão do meu fluxo de caixa',
        'Quero um gráfico dos meus gastos por categoria',
        'Quero um gráfico das transferências para a Ana por dia'
    ];

    /* ----- O RELÓGIO -----
       POR_LETRA é o CENTRO do compasso e cada tecla treme ±6 em volta
       dele: 24 a 36ms. Tecla em intervalo cravado lê como máquina, e o
       tremor de poucos milissegundos é o que a mão acrescenta. Das
       marcas do PALCO nenhuma depende disso, porque só o floreio conta
       do fim — e, desde 31/08/2026, o AVANÇO DO CICLO também, que é a
       correção documentada no cabeçalho e feita lá embaixo.

       A FRASE MAIS LONGA leva 54 × 30 = 1620ms, mais 200 de floreio e
       240 de aperto, ou seja, 2060. Ela cabe com 500ms de folga dentro
       dos 2560 da montagem, o que quer dizer que o botão de enviar é
       sempre apertado ANTES de o painel terminar de se desenhar.

       O QUE FRASE COMPRIDA FAZ, corrigido em 31/08/2026. A linha que
       morava aqui dizia que passar de 70 letras "não quebra nada, só
       empurra o aperto para dentro do repouso". A segunda metade continua
       certa e a primeira era falsa, e ficou cara: passar do prazo de
       5,56s com a digitação e o floreio — uns 170 caracteres em relógio
       limpo, ou MUITO menos com os timers represados no celular —
       quebrava, sim, porque o avanço do ciclo vinha em cima da frase
       inacabada. Agora o avanço espera, então frase comprida só ESTICA o
       ciclo. Ou seja: a linha antiga descrevia o comportamento que a
       peça só passou a ter hoje. */
    var POR_LETRA = 30;     // ±6 de tremor
    var ESVAI     = 300;    // do começo do ciclo até a digitação começar
    var ESPERA    = 1000;   // da visibilidade até o primeiro "apaga"
    var FIM_MONTA = 2560;   // contrato com o CSS: o botão verde fecha em 2520
    var REPOUSO   = 3000;   // o tempo de leitura do painel pronto
    var FLOREIO   = 200;    // e só esta conta do FIM da digitação

    /* A LEITURA MÍNIMA É A ÚNICA CONSTANTE NOVA DE 31/08/2026, e é a
       única deste relógio que NÃO tem contrato com o style.css: nenhum
       keyframe de lá conta com ela. Ela só aparece no caso em que a
       digitação estourou o prazo de parede, ou seja, quando os timers
       vinham represados. Nesse caso o avanço já está atrasado e a
       tentação é emendar o ciclo seguinte na última letra — o que faria a
       frase que custou tanto a sair aparecer inteira por um quadro só e
       sumir, que é o mesmo desrespeito do bug, de trás para frente.
       SÃO 600ms E SÃO POUCOS DE PROPÓSITO: quem está com o aparelho
       represando timer já esperou demais para ler esta frase, e o que se
       deve a ele é ver a frase pronta, não o REPOUSO inteiro de novo. */
    var LEITURA_MIN = 600;  // frase pronta em cartaz quando o prazo já venceu

    var relogios = [];
    var escrita = 0;
    var rodando = false;

    function limpa() {
        relogios.forEach(clearTimeout);
        relogios = [];
    }

    function daqui(ms, fn) {
        relogios.push(setTimeout(fn, ms));
    }

    /* Só uma escrita por vez. A volta pode ser cortada no meio da frase
       por uma rolagem ou por uma aba que dorme, e sem o número da vez a
       digitação velha continuaria comendo letra da nova. */
    function digita(txt, fim) {
        var meu = ++escrita;
        var i = 0;

        function passo() {
            if (meu !== escrita) return;
            i += 1;
            campo.textContent = txt.slice(0, i);
            caixa.scrollLeft = caixa.scrollWidth;
            if (i < txt.length) daqui(POR_LETRA - 6 + Math.random() * 12, passo);
            else fim();
        }

        passo();
    }

    /* A TROCA SILENCIOSA. A tela que sai já está apagada (240ms de
       transição contra os 300 do ESVAI), então a alça passa adiante sem
       ninguém ver. O quadro fica mudo mesmo assim, por cinto: se algum
       dia alguém puser transição na .gd-tela fora da fase "apaga", esta
       linha é o que impede a troca de virar um cross-fade. */
    function troca(i) {
        palco.classList.add('is-mudo');
        telas.forEach(function (t, n) { t.classList.toggle('is-vez', n === i); });
        palco.dataset.ciclo = String(i + 1);
        void palco.offsetWidth;
        palco.classList.remove('is-mudo');
    }

    /* Uma volta inteira. A ordem das batidas é a história: a pílula
       apaga o pedido anterior, a tela some com ele, e no MESMO QUADRO em
       que a primeira letra cai o painel novo já começa a se desenhar. */
    function ciclo(i) {
        palco.dataset.fase = 'apaga';
        palco.dataset.pilula = 'vazia';

        daqui(ESVAI, function () {
            campo.textContent = '';
            caixa.scrollLeft = 0;

            /* AS DUAS TRILHAS ARRANCAM JUNTAS, e é isto que a ordem do
               dono pede: a troca da tela, a fase de montagem e a
               primeira letra caem no mesmo quadro. A cascata dos widgets
               é toda do CSS, escalonada a partir daqui. */
            troca(i);
            palco.dataset.fase = 'monta';
            palco.dataset.pilula = 'escrevendo';

            daqui(FIM_MONTA, function () { palco.dataset.fase = 'repouso'; });

            /* O PRAZO DE PAREDE DO CICLO É ANOTADO AQUI E COBRADO LÁ
               EMBAIXO, no fim da digitação. Ele é o mesmo instante de
               sempre — FIM_MONTA mais REPOUSO contados deste quadro —, só
               deixou de ser um setTimeout solto.
               31/08/2026: nesta linha morava um
               `daqui(FIM_MONTA + REPOUSO, function () { ciclo(...) })`, e
               era ele que atropelava a frase no celular. O `fase =
               'repouso'` da linha de cima PODE continuar no relógio de
               parede, e continua: ele é contrato com os keyframes do CSS,
               que correm no compositor e não esperam ninguém, e o painel
               chegar ao repouso com a pílula ainda escrevendo é
               exatamente a cena que o dono pediu — a página se monta
               ENQUANTO se digita. Quem nunca podia ter corrido solto era
               só o AVANÇO, que é a única marca que APAGA o que a outra
               trilha ainda está escrevendo. */
            var prazo = performance.now() + FIM_MONTA + REPOUSO;

            /* E O FLOREIO DA PÍLULA, a única marca que conta do FIM da
               digitação, porque é a única que fala da frase. Quando ele
               acontece o painel já está quase pronto lá em cima, e o que
               ele diz é só "pronto, mandei".
               O SCROLLLEFT VOLTA A ZERO AQUI, e ele só tem trabalho no
               celular, onde a frase não cabe na caixa: durante a
               digitação o campo empurra o texto para a esquerda para o
               cursor ficar à vista (certo), mas depois ele ficaria
               parado no fim, e o repouso inteiro mostraria o
               complemento sem o verbo que diz o que foi pedido. Salto
               seco, sem rolagem suave, porque neste instante o olho está
               na janela de cima. */
            digita(CICLOS[i], function () {
                daqui(FLOREIO, function () {
                    caixa.scrollLeft = 0;
                    palco.dataset.pilula = 'envio';
                });
                daqui(FLOREIO + 240, function () { palco.dataset.pilula = 'cheia'; });

                /* E O AVANÇO DO CICLO NASCE AQUI DESDE 31/08/2026, no fim
                   da digitação, e não mais no quadro da primeira letra. A
                   conta é "o que vier por último": ou o que ainda falta do
                   prazo de parede, ou o floreio inteiro mais a leitura
                   mínima — o maior dos dois.
                   NO CAMINHO NORMAL O PRAZO GANHA SEMPRE, e por muito: a
                   frase mais longa fecha em 2,06s e o prazo vence aos
                   5,56s, então o `falta` vale uns 3,5s contra os 1,04s do
                   piso, e o ciclo vira no mesmo milissegundo em que virava
                   antes desta mudança. O piso só entra em cena com timer
                   represado, que é justamente quando ele é o que impede a
                   pílula de engolir a própria frase.
                   E ISTO MATA DE GRAÇA UM SEGUNDO DEFEITO do arranjo
                   antigo. Os dois floreios são agendados nas linhas de
                   cima, e agora o avanço vem DEPOIS deles por construção,
                   nunca mais em paralelo: acabou a chance de um 'envio' ou
                   um 'cheia' atrasado cair em cima de um ciclo que já
                   recomeçou, ressuscitando a frase velha no meio do fade
                   ou tirando o cursor de uma digitação em curso. */
                var falta = prazo - performance.now();
                daqui(Math.max(falta, FLOREIO + 240 + LEITURA_MIN), function () {
                    ciclo((i + 1) % CICLOS.length);
                });
            });
        });
    }

    function dorme() {
        if (!rodando) return;
        rodando = false;
        escrita += 1;
        limpa();
        /* A .is-parado CORTA as animações em vez de pausá-las, e o CSS
           explica por quê: como a pose de descanso de cada peça é a pose
           FINAL, cortar assenta o painel desenhado. Pausar deixaria meia
           linha traçada pendurada fora da tela. */
        palco.classList.add('is-parado');
        palco.classList.remove('is-vivo');
    }

    function acorda() {
        if (rodando || document.hidden) return;
        rodando = true;
        palco.classList.add('is-vivo');
        palco.classList.remove('is-parado');

        /* O QUADRO MUDO devolve a POSE DE NASCENÇA, que é LETRA POR LETRA
           a pose com que o HTML nasce: painel 1 desenhado, pedido 1
           inteiro na pílula. A mesma pose que a página entrega a quem
           chega sem JavaScript, o que faz o começo da cena e o repouso
           da página serem a mesma coisa por construção, e não por duas
           listas que alguém tem de manter iguais. */
        palco.classList.add('is-mudo');
        telas.forEach(function (t, n) { t.classList.toggle('is-vez', n === 0); });
        campo.textContent = CICLOS[0];
        caixa.scrollLeft = 0;
        palco.dataset.ciclo = '1';
        palco.dataset.fase = 'repouso';
        palco.dataset.pilula = 'cheia';
        void palco.offsetWidth;              // assenta o estado sem animar
        palco.classList.remove('is-mudo');
        void palco.offsetWidth;              // e devolve as transições

        /* A ESPERA DE 1s entra pelo daqui() de propósito: assim o timer
           mora na lista que o dorme() limpa, e a cena não arranca fora da
           tela para o visitante voltar no meio de uma volta que ele não
           viu começar. O que se vê durante ela é a pose de nascença, que
           é um quadro digno e não um vazio.
           A VOLTA CHAMADA É A DO CICLO 2: o ciclo 1 é o que está em
           cartaz durante a espera. */
        daqui(ESPERA, function () { ciclo(1); });
    }

    if ('IntersectionObserver' in window) {
        /* O 0,35 é o mesmo da .emp-section e pelo mesmo motivo: a peça é
           mais alta que um card, e com um quarto dela na tela o que
           apareceu é só o cabeçalho. A digitação começaria com metade da
           janela ainda fora do quadro. */
        var io = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (e.isIntersecting) acorda();
                else dorme();
            });
        }, { threshold: 0.35 });
        io.observe(secao);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { dorme(); return; }
        /* Voltando para a aba o observador não dispara sozinho, então a
           conta de "está na tela" é feita à mão, com a mesma fração. */
        var r = secao.getBoundingClientRect();
        var visivel = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (visivel > 0 && visivel / r.height >= 0.35) acorda();
    });
})();


/* =========================================================
   A ONDA DE ENERGIA DO CONTORNO DA PÍLULA (emp-) — 25/08/2026
   =========================================================
   Desenha o <canvas class="emp-cometa"> que mora dentro da .emp-pilula
   da seção "Cobre, fature e receba na mesma conversa". O berço é CSS, os
   números da onda são todos daqui.

   POR QUE ISTO É JAVASCRIPT E NÃO UMA ANIMAÇÃO DE FOLHA. A primeira
   versão era SVG: quatro retângulos de cápsula tracejados com
   pathLength, correndo juntos, para fingir um degradê ao longo do fio. O
   dono gravou a tela e reprovou no mesmo dia, e o defeito era do
   material e não da dose: TRAÇO TEM ALFA CHAPADO do começo ao fim do
   risco, em SVG e em CSS. Quatro dasharrays empilhados leem como quatro
   riscos perseguindo um ao outro, com degrau visível a olho nu em cada
   emenda, e a cabeça vira uma barra de brilho uniforme com ponta dura.
   Aqui a cauda é uma centena de segmentinhos, cada um com o SEU alfa, a
   SUA largura e a SUA cor: o degradê nasce por construção e não há duas
   peças para emendar.

   A GEOMETRIA É ANALÍTICA e recalculada a cada ponto, e isto é um desvio
   consciente do "pré-computa um array de pontos": uma tabela de umas
   centenas de amostras interpoladas em reta ACHATA as tampas, que são o
   trecho curto e curvo onde o olho mais percebe erro, e a conta de seno
   e cosseno de uma cápsula é barata demais para valer a troca.

   O SENTIDO É O DO VÍDEO: topo da esquerda para a direita, desce a tampa
   direita, base da direita para a esquerda, sobe a tampa esquerda.

   CUSTO POR QUADRO: umas 310 chamadas de stroke() num bitmap de 620 por
   76, o que é chamada de função e não taxa de preenchimento. O laço só
   roda com a seção em cena e com a aba à frente.

   CORREÇÃO DATADA, 26/08/2026: SÃO 239 E NÃO 310. Os 310 eram o custo
   das DUAS cristas que esta peça desenhava, e o dono mandou excluir a
   segunda nesta data. Medido no render depois do corte, contando as
   chamadas de stroke() em 30 quadros seguidos: 239,0 por quadro, num
   perímetro de 1260,8. O parágrafo de cima fica de pé como registro do
   que a peça custava quando nasceu, e a conta que vale hoje é esta. O
   resto dele continua valendo palavra por palavra.
   ========================================================= */
(function () {
    var tela = document.querySelector('.emp-section .emp-pilula .emp-cometa');
    if (!tela || !tela.getContext) return;

    /* O GATE DO MOVIMENTO REDUZIDO SAI ANTES DE TUDO e devolve sem ligar
       nada. A pose de quem pede menos movimento é o canvas vazio, ou
       seja, o fio de 1px da pílula sozinho, que é exatamente a mesma
       pose de quem chega sem JavaScript. O style.css tem o gate dele
       também (display: none na .emp-cometa), para quem trocar a
       preferência do sistema com a página já aberta. */
    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduzido && reduzido.matches) return;

    var ctx = tela.getContext('2d');
    if (!ctx) return;

    var secao = tela.closest ? tela.closest('.emp-section') : null;

    /* ----- A MARGEM -----
       CONTRATO COM O CSS: a folha dá ao canvas inset -11px, que é 10px
       de sobra para fora da borda da pílula, e é dentro dessa sobra que
       o passe largo do brilho acaba no ar. Bitmap corta o que passa da
       borda, então este número e o da folha andam juntos. */
    var MARGEM = 10;

    /* ----- O RELÓGIO E A ONDA -----
       VOLTA em 3,2s. A primeira versão andava em 4s e o dono achou que
       não fluía; o vídeo de referência dele, medido pela posição da
       cabeça entre quadros, fecha a volta perto de 3,1. 3,2 é o número
       que a peça ficou.

       CAUDA é 26% do perímetro, que é a leitura da cauda do vídeo (ela
       cobre uma tampa inteira mais um pedaço da reta).

       SUBIDA é a fração da cauda em que a luz CRESCE até o pico, e é a
       correção direta do "ponta dura": a cabeça não começa acesa, ela
       acende em smoothstep nos primeiros 12% e só então vira pico. Quer
       dizer que o ponto mais brilhante mora um pouco ATRÁS da ponta, que
       é como brilho de verdade se comporta.

       QUEDA é a constante da exponencial que gasta o resto da cauda, e o
       fator de quarta potência junto com ela é o que faz o rabo chegar a
       zero DE VERDADE no fim. Sem ele a cauda acabaria em 0,03 de tinta,
       que é pouco para se ver e o bastante para deixar uma borda reta. */
    var VOLTA   = 3.2;
    var CAUDA   = 0.26;
    var SUBIDA  = 0.14;
    var QUEDA   = 3.4;

    /* Largura do traço no pico e na ponta do rabo. A cauda afina junto
       com a tinta, senão ela lê como um risco cinza de espessura
       constante que alguém esqueceu de apagar. */
    var LARG_PICO = 2.4;
    var LARG_FIM  = 0.8;

    /* A cor desliza do branco do pico para a prata fria do rabo. O
       expoente 0,55 é o que faz a virada acontecer CEDO: com mistura
       linear a cauda inteira fica esbranquiçada e a peça perde o metal. */
    var QUENTE = [255, 255, 255];
    var FRIO   = [182, 188, 198];

    /* ----- A RESPIRAÇÃO -----
       A intensidade inteira sobe e desce num seno lento de 2,7s contra a
       volta de 3,2s. Os dois períodos não fecham conta um com o outro de
       propósito: se fechassem, o olho decoraria o ciclo em três voltas e
       a peça viraria relógio. */
    var RESPIRO_T = 2.7;
    var RESPIRO_A = 0.18;

    /* ----- A SEGUNDA CRISTA, MORTA EM 26/08/2026 -----
       O TEXTO ABAIXO É A ARQUEOLOGIA DELA E FICA DE PÉ, palavra por
       palavra como foi escrito na noite em que ela nasceu. Ele conta
       por que a oposição existiu, e isso continua sendo verdade sobre o
       passado desta peça. A lápide vem depois dele.

       Uma onda mais fraca e mais curta viajando atrás da principal, para
       o contorno parecer PERCORRIDO POR ONDAS e não patrulhado por um
       ponto só. Ela nasceu a 40% do perímetro atrás e o dono mandou os
       50% na mesma noite de 25/08/2026: "quando um chegar em uma ponta,
       a outra linha de energia deveria estar na exata outra ponta". Em
       oposição exata as duas cabeças ficam diametralmente presas uma à
       outra, tampa contra tampa, e como as duas andam na mesma
       velocidade a simetria nunca se desfaz. Os 35% da intensidade e
       55% do comprimento ficam: presente o bastante para dar companhia,
       fraca o bastante para nunca disputar a cabeça.

       LÁPIDE, 26/08/2026. O dono revogou a ordem dele mesmo da véspera,
       com estas palavras: "quero que deixe o efeito somente com uma
       linha de energia (somente a linha de energia mais forte), exclua a
       outra". Moravam aqui as três constantes que a segunda crista
       usava, CRISTA2_ATRASO = 0.50 (meio perímetro atrás, que é a
       oposição exata que o parágrafo de cima explica), CRISTA2_FORCA =
       0.35 e CRISTA2_COMPR = 0.55, mais a segunda chamada de
       desenhaCrista lá embaixo no quadro. As três morreram juntas.

       A ORDEM CHEGOU PELA PÍLULA IRMÃ. Na madrugada de 26/08 a .gd-pilula
       da seção "Peça o gráfico que quiser" ganhou uma réplica desta onda
       e o dono mandou que ela nascesse com uma linha só; avisado de que
       esta aqui seguia com duas, ele mandou igualar. As duas pílulas da
       home voltaram a ter a MESMA régua, agora com uma crista cada.

       A PRINCIPAL NÃO FOI RECALIBRADA e nenhum número dela mudou. A
       segunda crista somava luz num lugar do perímetro onde a principal
       não estava, então tirá-la não mexe no pico, no teto de 0,968, na
       emenda entre segmentos nem em coisa nenhuma da conta de brilho.
       Quem achar a peça fraca demais sem a companheira mexe em largura
       ou em cauda e refaz a conta do teto, nunca nos três ganhos.

       NÃO REPROPOR SEM ORDEM NOVA. Esta crista foi construída, vista,
       ajustada por ordem do dono e depois excluída por ordem do dono. */

    /* ----- O BRILHO -----
       Três passes aditivos, do mais largo e mais fraco ao núcleo fino e
       forte. É assim que se faz brilho de energia sem shader e sem
       ctx.filter: borrão por quadro custa caro e este custa nada.
       `passo` é de quantos em quantos pixels de fio cada passe corta a
       cauda em segmentos. Os dois passes de brilho são borrões por
       natureza e podem cortar grosso; quem manda é o núcleo.

       O NÚCLEO CORTA DE 2 EM 2 E O NÚMERO FOI MEDIDO, não escolhido. Em
       3 a peça já lia lisa a olho nu, mas a leitura do próprio bitmap
       (autocorrelação do resíduo da linha do fio de cima) acusava uma
       ondulação periódica com pico exatamente no passo, ou seja, as
       emendas entre segmentos ainda existiam, com uns 0,7% do pico de
       amplitude. É pouco, e é o mesmo tipo de defeito que derrubou a
       rodada 1, então não fica. Em 2 a emenda cai junto com a diferença
       de alfa entre vizinhos, que passa a ser 0,006, e a ondulação
       afunda no ruído de arredondamento de 8 bits. Custa uns 165
       segmentos por crista e nada de taxa de preenchimento.
       `largura` nula quer dizer "use o perfil", que é só o núcleo.

       OS TRÊS GANHOS SOMAM 0,82 NO PICO, E O TETO É O ASSUNTO. No centro
       da onda os três passes se sobrepõem e a soma é literal, então
       ganhos generosos ESTOURAM em branco puro. A primeira dose desta
       rodada somava 1,24 e o perfil lido do próprio bitmap mostrou uns
       50px de alfa 255 cravado: um PLATÔ, ou seja, a barra de brilho
       uniforme que o dono acabou de reprovar, de volta por outro
       caminho. Pior, com o alfa no teto as emendas entre segmentos
       voltam a aparecer, porque a soma que disfarçava a borda deles não
       cabe mais. O teto tem de contar a respiração junto: 0,82 vezes os
       1,18 do pico do seno dá 0,968, que passa raspando por baixo do 1 e
       deixa o cume da onda ser um PONTO em vez de um patamar. Quem for
       aumentar brilho aqui mexe na largura ou na cauda, não nestes três
       números, ou refaz a conta do teto. */
    var PASSES = [
        { largura: 7.0,  ganho: 0.055, passo: 9 },
        { largura: 3.5,  ganho: 0.145, passo: 6 },
        { largura: null, ganho: 0.620, passo: 2 }
    ];

    var TAU = Math.PI * 2;

    /* ----- A CÁPSULA -----
       Medidas em pixels de CSS, refeitas a cada resize. */
    var larguraCSS = 0, alturaCSS = 0;
    var x0 = 0, y0 = 0, cxE = 0, cxD = 0, cy = 0;
    var R = 0, RETA = 0, ARCO = 0, PERIM = 0;

    function mede() {
        var w = tela.offsetWidth;
        var h = tela.offsetHeight;
        if (!w || !h) return false;

        larguraCSS = w;
        alturaCSS = h;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var bw = Math.round(w * dpr);
        var bh = Math.round(h * dpr);
        if (tela.width !== bw || tela.height !== bh) {
            tela.width = bw;
            tela.height = bh;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        /* O meio-pixel é o que assenta o traço no CENTRO do fio de 1px
           da pílula em vez de na borda de fora dele. */
        x0 = MARGEM + 0.5;
        y0 = MARGEM + 0.5;
        var x1 = w - MARGEM - 0.5;
        var y1 = h - MARGEM - 0.5;

        R = (y1 - y0) / 2;
        cy = y0 + R;
        cxE = x0 + R;
        cxD = x1 - R;
        RETA = cxD - cxE;
        ARCO = Math.PI * R;
        PERIM = 2 * RETA + 2 * ARCO;
        return PERIM > 0 && RETA >= 0;
    }

    /* Onde fica o ponto que está a `s` pixels de fio do começo da reta de
       cima, andando no sentido do vídeo. Escreve em `alvo` para não criar
       um objeto por segmento por quadro. */
    function ponto(s, alvo) {
        s -= Math.floor(s / PERIM) * PERIM;

        if (s < RETA) {                       // reta de cima, esquerda -> direita
            alvo.x = cxE + s;
            alvo.y = y0;
            return;
        }
        s -= RETA;

        if (s < ARCO) {                       // tampa direita, de cima para baixo
            var td = s / R;
            alvo.x = cxD + R * Math.sin(td);
            alvo.y = cy - R * Math.cos(td);
            return;
        }
        s -= ARCO;

        if (s < RETA) {                       // base, direita -> esquerda
            alvo.x = cxD - s;
            alvo.y = cy + R;
            return;
        }
        s -= RETA;

        var te = s / R;                       // tampa esquerda, de baixo para cima
        alvo.x = cxE - R * Math.sin(te);
        alvo.y = cy + R * Math.cos(te);
    }

    /* O PERFIL DA ONDA. q vai de 0 na ponta da cabeça a 1 na ponta do
       rabo, e o que sai é quanto de luz aquele lugar da cauda tem. */
    function perfil(q) {
        if (q <= 0 || q >= 1) return 0;
        if (q < SUBIDA) {
            var e = q / SUBIDA;
            return e * e * (3 - 2 * e);
        }
        var d = (q - SUBIDA) / (1 - SUBIDA);
        var d2 = d * d;
        return Math.exp(-QUEDA * d) * (1 - d2 * d2);
    }

    var pa = { x: 0, y: 0 };
    var pb = { x: 0, y: 0 };

    function desenhaCrista(cabeca, comprimento, forca) {
        var compPx = comprimento * PERIM;
        if (compPx <= 1) return;

        for (var p = 0; p < PASSES.length; p++) {
            var passe = PASSES[p];
            var n = Math.max(8, Math.round(compPx / passe.passo));
            if (passe.largura) ctx.lineWidth = passe.largura;

            for (var i = 0; i < n; i++) {
                var qm = (i + 0.5) / n;
                var a = perfil(qm) * forca * passe.ganho;
                if (a <= 0.002) continue;
                if (a > 1) a = 1;

                if (!passe.largura) {
                    var pico = perfil(qm);
                    ctx.lineWidth = LARG_FIM + (LARG_PICO - LARG_FIM) * pico;
                    var m = Math.pow(pico, 0.55);
                    ctx.strokeStyle = 'rgba('
                        + Math.round(FRIO[0] + (QUENTE[0] - FRIO[0]) * m) + ','
                        + Math.round(FRIO[1] + (QUENTE[1] - FRIO[1]) * m) + ','
                        + Math.round(FRIO[2] + (QUENTE[2] - FRIO[2]) * m) + ','
                        + a.toFixed(3) + ')';
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
                }

                ponto(cabeca - (i / n) * compPx, pa);
                ponto(cabeca - ((i + 1) / n) * compPx, pb);

                ctx.beginPath();
                ctx.moveTo(pa.x, pa.y);
                ctx.lineTo(pb.x, pb.y);
                ctx.stroke();
            }
        }
    }

    var tempo = 0;
    var anterior = 0;
    var raf = 0;

    function quadro(agora) {
        raf = requestAnimationFrame(quadro);

        if (!anterior) anterior = agora;
        /* O passo é limitado a 50ms para a onda não dar um salto quando a
           aba volta de segundo plano ou a máquina engasga. */
        var dt = Math.min((agora - anterior) / 1000, 0.05);
        anterior = agora;
        tempo += dt;

        if (!PERIM) { if (!mede()) return; }

        ctx.clearRect(0, 0, larguraCSS, alturaCSS);
        ctx.globalCompositeOperation = 'lighter';
        /* PONTA RETA, e não redonda, e a escolha importa: com soma de luz
           duas pontas redondas vizinhas se sobrepõem e cada emenda vira
           uma conta acesa, que é justamente o defeito que esta rodada
           veio matar. Encostadas de topo elas somam o que a suavização de
           borda tirou de cada lado, e a emenda some. O buraco que a ponta
           reta deixa na parte de fora da curva mede uns 0,3 de pixel na
           tampa, ou seja, não existe. */
        ctx.lineCap = 'butt';

        var volta = (tempo / VOLTA) % 1;
        var cabeca = volta * PERIM;
        var respiro = 1 + RESPIRO_A * Math.sin(TAU * tempo / RESPIRO_T);

        /* UMA CHAMADA SÓ desde 26/08/2026. Morava aqui uma segunda, com
           a cabeça a meio perímetro de distância desta, e o dono mandou
           excluir: "somente a linha de energia mais forte". A lápide
           dela, com os três números e a arqueologia da ordem anterior,
           está lá em cima junto da respiração. */
        desenhaCrista(cabeca, CAUDA, respiro);

        ctx.globalCompositeOperation = 'source-over';
    }

    function acorda() {
        if (raf) return;
        anterior = 0;
        raf = requestAnimationFrame(quadro);
    }

    function dorme() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = 0;
    }

    mede();

    if (window.ResizeObserver) {
        new ResizeObserver(function () {
            mede();
        }).observe(tela);
    } else {
        window.addEventListener('resize', mede);
    }

    /* O laço só roda com a seção em cena. O limiar é baixo porque a
       pílula mora no ALTO da seção: esperar 35% como o condutor espera
       faria a onda nascer com a caixa de texto já lida. */
    if (secao && window.IntersectionObserver) {
        new IntersectionObserver(function (entradas) {
            for (var i = 0; i < entradas.length; i++) {
                if (entradas[i].isIntersecting) acorda();
                else dorme();
            }
        }, { threshold: 0.01 }).observe(secao);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { dorme(); return; }
        if (!secao) { acorda(); return; }
        var r = secao.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) acorda();
    });
})();


/* =========================================================
   A ONDA DE ENERGIA DO CONTORNO DA PÍLULA (gd-) — 26/08/2026
   =========================================================
   Desenha o <canvas class="gd-cometa"> que mora dentro da .gd-pilula da
   seção "Peça o gráfico que quiser. O Martin desenha na hora." O berço
   é CSS, os números da onda são todos daqui.

   ISTO É UMA CÓPIA DECLARADA DO BLOCO emp- QUE FICA LOGO ACIMA, e a
   fonte canônica da régua é ELE. Ordem do dono em 26/08/2026: esta
   pílula ganha a mesma luz que a .emp-pilula da seção "Cobre, fature e
   receba na mesma conversa" ganhou na noite anterior. Todos os números
   abaixo (volta, cauda, subida, queda, largura, cor, respiração, os
   três passes de brilho e o teto de 50ms) estão TRANSCRITOS de lá,
   iguais, e lá é que estão as medições e as três rodadas de aprovação
   que os fixaram. QUEM MUDAR UM NÚMERO LÁ MUDA AQUI JUNTO: duas pílulas
   irmãs com ondas de velocidade diferente na mesma página é o tipo de
   defeito que ninguém sabe nomear e todo mundo sente.

   UMA LINHA SÓ NAS DUAS, e a paridade é completa. Esta réplica nasceu
   na madrugada de 26/08/2026 transcrevendo as DUAS cristas da irmã, e o
   dono mandou tirar a segunda desta pílula na mesma madrugada: "somente
   a linha mais forte". Por umas horas as duas peças divergiram, esta
   com uma crista e a irmã com duas. AVISADO DA DIFERENÇA, ainda em
   26/08, o dono mandou igualar do outro lado: "quero que deixe o efeito
   somente com uma linha de energia (somente a linha de energia mais
   forte), exclua a outra". A segunda crista da emp- foi excluída e as
   duas pílulas da home voltaram a rodar exatamente a mesma onda.
   A lápide da crista morta desta peça está lá embaixo no lugar em que
   ela morava, e a da irmã está no bloco dela, com a arqueologia da
   ordem anterior de pé. Nenhum número da principal foi recalibrado em
   nenhum dos dois lados.

   POR QUE CÓPIA E NÃO UM MOTOR SÓ SERVINDO OS DOIS CANVAS. O bloco emp-
   é obra fechada, medida contra vídeo e aprovada pelo dono; refatorar
   peça aprovada para acomodar peça nova é o jeito clássico de estragar
   as duas de uma vez. Duzentas linhas duplicadas custam menos que um
   número da irmã mudando por acidente numa unificação. Se um dia as
   duas tiverem de virar uma, isso se faz com as duas paradas e com
   prova de pixel idêntico dos dois lados.

   A ÚNICA ADAPTAÇÃO É A GEOMETRIA, E ELA VEM DE GRAÇA. Esta pílula mede
   min(680px, 92%) contra os 600 da irmã, e cai para 94% da coluna no
   degrau de 1024. Não há um número de tamanho escrito em lugar nenhum
   deste arquivo: `mede()` lê o canvas por offsetWidth/offsetHeight e
   refaz raio, retas e perímetro do tamanho que achar, e o
   ResizeObserver refaz a conta a cada mudança. A onda anda em PIXELS
   POR SEGUNDO derivados do perímetro, então numa caixa mais larga ela
   percorre mais fio na mesma volta de 3,2s, que é o comportamento
   certo: as duas fecham a volta juntas.

   POR QUE JAVASCRIPT E NÃO ANIMAÇÃO DE FOLHA. Traço tem alfa CHAPADO do
   começo ao fim do risco, em SVG e em CSS, então tracejado empilhado lê
   como riscos perseguindo um ao outro, com degrau visível em cada
   emenda e cabeça em barra de ponta dura. Aqui a cauda é uma centena de
   segmentinhos, cada um com o SEU alfa, a SUA largura e a SUA cor: o
   degradê nasce por construção e não há duas peças para emendar. A
   versão em SVG foi construída, vista e REPROVADA pelo dono na irmã, e
   a lápide está no style.css dela. Não repropor sem ordem nova.

   O SENTIDO É O DO VÍDEO: topo da esquerda para a direita, desce a
   tampa direita, base da direita para a esquerda, sobe a tampa
   esquerda.

   ESTA ONDA NÃO OLHA PARA O ROTEIRO DA SEÇÃO. O #gdPalco tem
   data-fase, data-pilula e data-ciclo, e a onda ignora os três de
   propósito, como a irmã ignora os dela: a luz do contorno diz "tem uma
   IA morando nesta caixa", e isso é verdade enquanto a frase é digitada
   e enquanto ela fica parada esperando. Onda que acende e apaga no
   compasso do roteiro viraria indicador de estado, que é outra peça.
   O laço só para pelos dois motivos que a irmã também respeita: seção
   fora de cena e aba em segundo plano.
   ========================================================= */
(function () {
    var tela = document.querySelector('.gd-section .gd-pilula .gd-cometa');
    if (!tela || !tela.getContext) return;

    /* O GATE DO MOVIMENTO REDUZIDO SAI ANTES DE TUDO e devolve sem ligar
       nada. A pose de quem pede menos movimento é o canvas vazio, ou
       seja, o fio de 1px da pílula sozinho, que é exatamente a mesma
       pose de quem chega sem JavaScript. O style.css tem o gate dele
       também (display: none na .gd-cometa), para quem trocar a
       preferência do sistema com a página já aberta. */
    var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduzido && reduzido.matches) return;

    var ctx = tela.getContext('2d');
    if (!ctx) return;

    var secao = tela.closest ? tela.closest('.gd-section') : null;

    /* ----- A MARGEM -----
       CONTRATO COM O CSS: a folha dá ao canvas inset -11px, que é 10px
       de sobra para fora da borda da pílula, e é dentro dessa sobra que
       o passe largo do brilho acaba no ar. Bitmap corta o que passa da
       borda, então este número e o da folha andam juntos. */
    var MARGEM = 10;

    /* ----- O RELÓGIO E A ONDA -----
       Transcritos do bloco emp-. VOLTA de 3,2s (a irmã andou em 4 e o
       dono achou que não fluía; o vídeo de referência fecha perto de
       3,1). CAUDA de 26% do perímetro, que é a leitura da cauda do
       vídeo. SUBIDA é a fração da cauda em que a luz CRESCE até o pico,
       em smoothstep, e é o que tira a ponta dura: o ponto mais
       brilhante mora um pouco ATRÁS da ponta, como brilho de verdade se
       comporta. QUEDA é a constante da exponencial que gasta o resto da
       cauda, e o fator de quarta potência junto com ela é o que faz o
       rabo chegar a zero DE VERDADE em vez de acabar em 0,03 de tinta,
       que é pouco para se ver e bastante para deixar borda reta. */
    var VOLTA   = 3.2;
    var CAUDA   = 0.26;
    var SUBIDA  = 0.14;
    var QUEDA   = 3.4;

    /* Largura do traço no pico e na ponta do rabo. A cauda afina junto
       com a tinta, senão ela lê como um risco cinza de espessura
       constante que alguém esqueceu de apagar. */
    var LARG_PICO = 2.4;
    var LARG_FIM  = 0.8;

    /* A cor desliza do branco do pico para a prata fria do rabo. São as
       duas únicas cores da peça, as mesmas da irmã, e nada de tinta
       nova entra aqui: o que acende é luz branca sobre grafite. O
       expoente 0,55 lá embaixo é o que faz a virada acontecer CEDO: com
       mistura linear a cauda inteira fica esbranquiçada e a peça perde
       o metal. */
    var QUENTE = [255, 255, 255];
    var FRIO   = [182, 188, 198];

    /* ----- A RESPIRAÇÃO -----
       A intensidade inteira sobe e desce num seno lento de 2,7s contra
       a volta de 3,2s. Os dois períodos não fecham conta um com o outro
       de propósito: se fechassem, o olho decoraria o ciclo em três
       voltas e a peça viraria relógio. */
    var RESPIRO_T = 2.7;
    var RESPIRO_A = 0.18;

    /* ----- AQUI NÃO MORA A SEGUNDA CRISTA, E É ORDEM -----
       LÁPIDE COM DATA, 26/08/2026 de madrugada. A onda nasceu na irmã
       emp- com DUAS cristas: a principal e uma mais fraca e mais curta
       viajando a 50% do perímetro atrás dela, ou seja, na ponta
       exatamente oposta do contorno (aquilo foi ordem do dono na noite
       de 25/08, com as palavras "quando um chegar em uma ponta, a outra
       linha de energia deveria estar na exata outra ponta"). Esta
       réplica chegou a nascer com as duas, transcritas: CRISTA2_ATRASO
       0,50, CRISTA2_FORCA 0,35 e CRISTA2_COMPR 0,55, mais a segunda
       chamada de desenhaCrista lá embaixo.
       O DONO MANDOU TIRAR NA MESMA MADRUGADA, para esta pílula: "somente
       a linha mais forte". Então aqui roda UMA onda só, a principal, e
       o contorno fica com um ponto de luz percorrendo o fio em vez de
       dois em oposição.

       ATUALIZAÇÃO DO MESMO DIA 26/08/2026, E ELA DESFAZ A DIVERGÊNCIA.
       Por umas horas esta peça teve uma crista e a irmã teve duas, e
       este parágrafo dizia que a diferença era deliberada. NÃO É MAIS:
       avisado de que a emp- seguia com duas linhas, o dono mandou
       igualar lá também, com estas palavras: "quero que deixe o efeito
       somente com uma linha de energia (somente a linha de energia mais
       forte), exclua a outra". A segunda crista da irmã foi excluída, a
       lápide dela está no bloco dela com a arqueologia da ordem
       anterior de pé, e AS DUAS PÍLULAS DA HOME RODAM A MESMA ONDA DE
       NOVO, com uma crista cada.
       Ou seja: a fonte canônica da régua volta a ser o bloco emp- para
       TUDO, sem exceção nenhuma (velocidade, perfil, cor, saturação,
       passes, ponta reta, teto de 50ms e agora também a contagem de
       cristas). Quem mudar um número lá muda aqui junto.
       QUEM VIER DEVOLVER A SEGUNDA CRISTA, de qualquer um dos dois
       lados, está desfazendo ordem do dono e precisa de ordem nova.

       E A PRINCIPAL NÃO FOI RECALIBRADA para compensar a ausência da
       outra, aqui nem lá: nenhum número dela mudou. A segunda crista
       somava luz num lugar do perímetro onde a principal não estava,
       então tirá-la não mexe no pico, no teto de 0,968 nem em emenda
       nenhuma. Quem achar a peça fraca demais sem a companheira mexe em
       largura ou cauda e refaz a conta do teto, nunca nos três ganhos. */

    /* ----- O BRILHO -----
       Três passes aditivos, do mais largo e mais fraco ao núcleo fino e
       forte. É assim que se faz brilho de energia sem shader e sem
       ctx.filter: borrão por quadro custa caro e este custa nada.
       `passo` é de quantos em quantos pixels de fio cada passe corta a
       cauda em segmentos. Os dois passes de brilho são borrões por
       natureza e podem cortar grosso; quem manda é o núcleo.

       O NÚCLEO CORTA DE 2 EM 2 E O NÚMERO FOI MEDIDO na irmã, não
       escolhido. Em 3 a peça já lia lisa a olho nu, mas a leitura do
       próprio bitmap acusava ondulação periódica com pico exatamente no
       passo, ou seja, as emendas entre segmentos ainda existiam, com
       uns 0,7% do pico de amplitude. É o mesmo tipo de defeito que
       derrubou a rodada em SVG, então não fica. Em 2 a diferença de
       alfa entre vizinhos cai para 0,006 e a ondulação afunda no ruído
       de arredondamento de 8 bits. `largura` nula quer dizer "use o
       perfil", que é só o núcleo.

       OS TRÊS GANHOS SOMAM 0,82 NO PICO, E O TETO É O ASSUNTO. No
       centro da onda os três passes se sobrepõem e a soma é literal,
       então ganhos generosos ESTOURAM em branco puro e o cume vira um
       PLATÔ, que é a barra de brilho uniforme que o dono reprovou. O
       teto conta a respiração junto: 0,82 vezes os 1,18 do pico do seno
       dá 0,968, que passa raspando por baixo do 1 e deixa o cume ser um
       PONTO. Quem for aumentar brilho aqui mexe na largura ou na cauda,
       não nestes três números, ou refaz a conta do teto. E mexe na irmã
       na mesma hora. */
    var PASSES = [
        { largura: 7.0,  ganho: 0.055, passo: 9 },
        { largura: 3.5,  ganho: 0.145, passo: 6 },
        { largura: null, ganho: 0.620, passo: 2 }
    ];

    var TAU = Math.PI * 2;

    /* ----- A CÁPSULA -----
       Medidas em pixels de CSS, refeitas a cada resize. É AQUI que a
       diferença de largura entre as duas pílulas se resolve sozinha:
       ninguém escreve 680 nem 600, o canvas é medido. */
    var larguraCSS = 0, alturaCSS = 0;
    var x0 = 0, y0 = 0, cxE = 0, cxD = 0, cy = 0;
    var R = 0, RETA = 0, ARCO = 0, PERIM = 0;

    function mede() {
        var w = tela.offsetWidth;
        var h = tela.offsetHeight;
        if (!w || !h) return false;

        larguraCSS = w;
        alturaCSS = h;

        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var bw = Math.round(w * dpr);
        var bh = Math.round(h * dpr);
        if (tela.width !== bw || tela.height !== bh) {
            tela.width = bw;
            tela.height = bh;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        /* O meio-pixel é o que assenta o traço no CENTRO do fio de 1px
           da pílula em vez de na borda de fora dele. */
        x0 = MARGEM + 0.5;
        y0 = MARGEM + 0.5;
        var x1 = w - MARGEM - 0.5;
        var y1 = h - MARGEM - 0.5;

        R = (y1 - y0) / 2;
        cy = y0 + R;
        cxE = x0 + R;
        cxD = x1 - R;
        RETA = cxD - cxE;
        ARCO = Math.PI * R;
        PERIM = 2 * RETA + 2 * ARCO;
        return PERIM > 0 && RETA >= 0;
    }

    /* Onde fica o ponto que está a `s` pixels de fio do começo da reta
       de cima, andando no sentido do vídeo. Escreve em `alvo` para não
       criar um objeto por segmento por quadro. */
    function ponto(s, alvo) {
        s -= Math.floor(s / PERIM) * PERIM;

        if (s < RETA) {                       // reta de cima, esquerda -> direita
            alvo.x = cxE + s;
            alvo.y = y0;
            return;
        }
        s -= RETA;

        if (s < ARCO) {                       // tampa direita, de cima para baixo
            var td = s / R;
            alvo.x = cxD + R * Math.sin(td);
            alvo.y = cy - R * Math.cos(td);
            return;
        }
        s -= ARCO;

        if (s < RETA) {                       // base, direita -> esquerda
            alvo.x = cxD - s;
            alvo.y = cy + R;
            return;
        }
        s -= RETA;

        var te = s / R;                       // tampa esquerda, de baixo para cima
        alvo.x = cxE - R * Math.sin(te);
        alvo.y = cy + R * Math.cos(te);
    }

    /* O PERFIL DA ONDA. q vai de 0 na ponta da cabeça a 1 na ponta do
       rabo, e o que sai é quanto de luz aquele lugar da cauda tem. */
    function perfil(q) {
        if (q <= 0 || q >= 1) return 0;
        if (q < SUBIDA) {
            var e = q / SUBIDA;
            return e * e * (3 - 2 * e);
        }
        var d = (q - SUBIDA) / (1 - SUBIDA);
        var d2 = d * d;
        return Math.exp(-QUEDA * d) * (1 - d2 * d2);
    }

    var pa = { x: 0, y: 0 };
    var pb = { x: 0, y: 0 };

    function desenhaCrista(cabeca, comprimento, forca) {
        var compPx = comprimento * PERIM;
        if (compPx <= 1) return;

        for (var p = 0; p < PASSES.length; p++) {
            var passe = PASSES[p];
            var n = Math.max(8, Math.round(compPx / passe.passo));
            if (passe.largura) ctx.lineWidth = passe.largura;

            for (var i = 0; i < n; i++) {
                var qm = (i + 0.5) / n;
                var a = perfil(qm) * forca * passe.ganho;
                if (a <= 0.002) continue;
                if (a > 1) a = 1;

                if (!passe.largura) {
                    var pico = perfil(qm);
                    ctx.lineWidth = LARG_FIM + (LARG_PICO - LARG_FIM) * pico;
                    var m = Math.pow(pico, 0.55);
                    ctx.strokeStyle = 'rgba('
                        + Math.round(FRIO[0] + (QUENTE[0] - FRIO[0]) * m) + ','
                        + Math.round(FRIO[1] + (QUENTE[1] - FRIO[1]) * m) + ','
                        + Math.round(FRIO[2] + (QUENTE[2] - FRIO[2]) * m) + ','
                        + a.toFixed(3) + ')';
                } else {
                    ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
                }

                ponto(cabeca - (i / n) * compPx, pa);
                ponto(cabeca - ((i + 1) / n) * compPx, pb);

                ctx.beginPath();
                ctx.moveTo(pa.x, pa.y);
                ctx.lineTo(pb.x, pb.y);
                ctx.stroke();
            }
        }
    }

    var tempo = 0;
    var anterior = 0;
    var raf = 0;

    function quadro(agora) {
        raf = requestAnimationFrame(quadro);

        if (!anterior) anterior = agora;
        /* O passo é limitado a 50ms para a onda não dar um salto quando
           a aba volta de segundo plano ou a máquina engasga. */
        var dt = Math.min((agora - anterior) / 1000, 0.05);
        anterior = agora;
        tempo += dt;

        if (!PERIM) { if (!mede()) return; }

        ctx.clearRect(0, 0, larguraCSS, alturaCSS);
        ctx.globalCompositeOperation = 'lighter';
        /* PONTA RETA, e não redonda, e a escolha importa: com soma de
           luz duas pontas redondas vizinhas se sobrepõem e cada emenda
           vira uma conta acesa, que é justamente o defeito que esta
           receita veio matar. Encostadas de topo elas somam o que a
           suavização de borda tirou de cada lado, e a emenda some. O
           buraco que a ponta reta deixa na parte de fora da curva mede
           uns 0,3 de pixel na tampa, ou seja, não existe. */
        ctx.lineCap = 'butt';

        var volta = (tempo / VOLTA) % 1;
        var cabeca = volta * PERIM;
        var respiro = 1 + RESPIRO_A * Math.sin(TAU * tempo / RESPIRO_T);

        /* UMA CHAMADA SÓ, e a irmã emp- faz duas. Ordem do dono de
           26/08/2026: "somente a linha mais forte". A lápide da segunda
           crista, com os três números que ela usava e o porquê de a
           divergência ser deliberada, está lá em cima junto da
           respiração. */
        desenhaCrista(cabeca, CAUDA, respiro);

        ctx.globalCompositeOperation = 'source-over';
    }

    function acorda() {
        if (raf) return;
        anterior = 0;
        raf = requestAnimationFrame(quadro);
    }

    function dorme() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = 0;
    }

    mede();

    if (window.ResizeObserver) {
        new ResizeObserver(function () {
            mede();
        }).observe(tela);
    } else {
        window.addEventListener('resize', mede);
    }

    /* O laço só roda com a seção em cena. O limiar é baixo pelo mesmo
       motivo da irmã: a pílula mora no ALTO da seção, logo abaixo da
       manchete, e esperar 35% como o condutor do painel espera faria a
       onda nascer com a frase já lida. */
    if (secao && window.IntersectionObserver) {
        new IntersectionObserver(function (entradas) {
            for (var i = 0; i < entradas.length; i++) {
                if (entradas[i].isIntersecting) acorda();
                else dorme();
            }
        }, { threshold: 0.01 }).observe(secao);
    } else {
        acorda();
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { dorme(); return; }
        if (!secao) { acorda(); return; }
        var r = secao.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) acorda();
    });
})();


/* ============================================================
   "UM DIA COM A SUA EQUIPE" (dia-): O DISPARADOR DE ATO
   04/09/2026
   ============================================================

   ESTE BLOCO É IRMÃO GÊMEO do disparador da .ben-section, e de
   propósito: mesma pergunta, mesma resposta, mesma faixa. Ele
   responde "qual dos cinco espaçadores está na faixa do meio da
   tela agora?" e escreve o número no data-ato da seção. Não há
   aqui uma linha de posicionamento, de opacidade ou de tempo — o
   pin é position:sticky na folha, o crossfade é transition na
   folha, e este arquivo não sabe nada sobre nenhum dos dois.

   POR QUE COPIAR EM VEZ DE GENERALIZAR. Dava para fatorar um
   observador só que servisse as duas seções. Não fiz, e o motivo
   é o mesmo que mantém os dois blocos de cabeçalho (o da home e o
   do header.js) separados: as duas seções têm ciclos de vida
   diferentes — a ben tem quatro atos, começa no 2 e tem um
   segundo observador cuidando dos fundos; esta tem cinco, começa
   no 1 e não tem fundo nenhum. Um helper comum ia nascer com
   parâmetros para as duas e virar o lugar onde um bug de uma
   quebra a outra.

   O SCROLL DISPARA, NÃO ESFREGA, como na ben: a barra não é um
   cursor dentro de uma linha do tempo, ela só troca um atributo.
   A transição do CSS roda inteira, no tempo dela, mesmo que o
   visitante pare no meio da rolagem. Por isso não há onscroll nem
   requestAnimationFrame aqui.

   OS -45% DE CIMA E DE BAIXO deixam viva uma tira de 10% da altura
   da janela, no meio. Cada .dia-passo tem uma tela inteira, então a
   tira fina garante que exatamente UM espaçador a ocupe por vez.
   Numa faixa larga dois vizinhos entrariam no mesmo lote e o
   data-ato piscaria entre dois valores dentro da mesma rolagem.

   O ESTADO INICIAL VEM DO HTML (data-ato="1"). O observador é
   confirmação, não fundação: antes de a seção chegar perto da tela
   nenhuma entrada disparou, e se o JS falhar ou demorar a página
   mostra o primeiro momento em vez de um palco vazio. Quem trocar o
   primeiro ato troca esse atributo no HTML junto.

   NO REPOUSO ELE SE DESLIGA SOZINHO, sem saber disso. Em
   prefers-reduced-motion a folha põe display:none nos .dia-passo
   E na coluna de texto do desktop, os dois conjuntos de uma vez:
   sem caixa não há interseção, o observador nunca dispara, o
   data-ato fica no 1 e a folha já está mostrando os cinco cartões
   empilhados. Nenhuma guarda de mídia aqui — a decisão mora num
   lugar só, que é a folha.

   A GUARDA DE EXISTÊNCIA no topo protege qualquer documento que
   carregue este arquivo sem ter a seção dentro, que hoje é o
   bancável _medida_cli.html.
   ============================================================ */
(function () {
    var sec = document.querySelector('.dia-section');
    if (!sec) return;

    /* DOIS CONJUNTOS, UM OBSERVADOR (05/09/2026, redesenho de desktop).
       A seção passou a ter dois regimes com combustíveis diferentes: até
       960px são os cinco .dia-passo (espaçadores vazios de uma tela), de
       961px para cima são os cinco .dia-texto da coluna da esquerda, que
       carregam o horário e a linha de cena e sobem com o scroll natural,
       igual aos .ben-bloco. Os dois são observados juntos e SEM NENHUMA
       media query aqui: a folha põe display:none no conjunto do regime que
       não vale, e elemento sem caixa não interseta nada — o conjunto
       apagado nunca dispara. É a mesma propriedade que já desligava este
       bloco inteiro em prefers-reduced-motion.
       ESSE É O JEITO ROBUSTO A REDIMENSIONAMENTO, e a alternativa foi
       descartada de propósito: um matchMedia aqui criaria estado de JS para
       reconciliar a cada troca de divisa (desobservar um conjunto, observar
       o outro, recalcular o ato atual na mão) e um jeito novo de a página
       ficar num ato que não corresponde ao que está na tela. Aqui, quando a
       janela cruza os 960px, o navegador reavalia as interseções sozinho:
       o conjunto que ganhou caixa entrega a entrada dele e o data-ato se
       corrige na mesma passada. */
    var pistas = sec.querySelectorAll('.dia-passo, .dia-texto');
    if (!pistas.length) return;

    /* Sem IntersectionObserver a seção não quebra: o palco continua
       preso pela folha e mostra o ato que o HTML carimbou. Degradar
       para uma cena parada é melhor do que degradar para um listener
       de scroll que ninguém vai manter. */
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entradas) {
        /* Só a ENTRADA na faixa manda. A saída não é lida: quem sai da
           tira do meio está sendo substituído por quem entra, e apagar o
           ato na saída deixaria o palco vazio no intervalo de um quadro
           entre as duas leituras.

           O DESEMPATE POR ALTURA É A ÚNICA LINHA QUE NÃO EXISTE NA BEN, e
           existe aqui porque eu bati no defeito medindo. Dois espaçadores
           vizinhos se tocam numa aresta: quando a rolagem para EXATAMENTE
           nela, o navegador conta os dois como intersectando (a interseção
           do de baixo tem altura zero, mas zero conta) e o lote chega com
           duas entradas. Vencendo a última do array, o ato passava para o
           espaçador seguinte enquanto a tira ainda estava inteira dentro do
           anterior — e, pior, ficava preso lá: para reagir de novo, o
           espaçador de cima precisaria SAIR da tira antes de reentrar, e
           ele nunca saiu. Medido a 375x667, parando na aresta e voltando:
           o cartão travava no ato 2 com o ato 1 na tela.
           Pegar a entrada de maior interseção resolve pela geometria em vez
           da ordem do array: na aresta, o de cima cobre os 66,7px da tira e
           o de baixo cobre 0. O contrato continua o mesmo da ben — a saída
           segue ignorada e o ato só muda quando existe ato novo. */
        var melhor = null;
        entradas.forEach(function (e) {
            if (!e.isIntersecting) return;
            if (!melhor || e.intersectionRect.height > melhor.intersectionRect.height) melhor = e;
        });
        if (!melhor) return;

        var ato = melhor.target.dataset.ato;
        if (ato && sec.dataset.ato !== ato) sec.dataset.ato = ato;
    }, {
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
    });

    pistas.forEach(function (p) { io.observe(p); });
})();


/* ============================================================
   SEÇÃO "UM DIA": A BOLINHA DO TRILHO VERTICAL (só desktop)
   05/09/2026
   ============================================================

   Este bloco escreve um número de 0 a 1 no --dia-progresso do <ol>
   e marca os horários que o indicador já alcançou. A folha usa esse
   número para deslocar a bolinha e preencher a linha; a classe
   is-passed escurece os marcos alcançados e sai ao rolar de volta.

   POR QUE AQUI TEM LISTENER DE SCROLL E NO BLOCO DE CIMA NÃO. O
   observador de ato responde uma pergunta discreta ("qual dos cinco
   está no meio da tela?") e cinco respostas bastam. A bolinha é
   outra coisa: o dono pediu que ela VIAJE pela linha, contínua,
   marcando a hora do dia — ou seja, é uma leitura de posição, não um
   gatilho. Isso não existe em IntersectionObserver sem picotar a
   seção em dezenas de sentinelas, o que seria mais caro e menos
   exato do que uma conta de duas leituras. Então aqui o scroll
   ESFREGA, e no bloco de cima ele continua só disparando; as duas
   coisas convivem porque tratam de camadas diferentes (o ato é
   estado, a bolinha é medida).
   O CUSTO POR QUADRO É DE DUAS getBoundingClientRect E, quando muda,
   UMA escrita de custom property. As classes só são atualizadas ao
   cruzar um marco — nessa ordem, todas as leituras
   antes de qualquer escrita, que é o que evita o layout thrashing. O
   listener é passivo e a rajada de eventos é coalescida num pedido
   de quadro só, exatamente como o bloco do header claro faz.
   E A ESCRITA VAI NO <ol>, NÃO NA SEÇÃO: custom property é herdada,
   então escrever na seção invalidaria o estilo dos ~200 descendentes
   dela a cada quadro. No trilho a invalidação para em seis
   elementos, que é onde o número realmente é lido.

   A CONTA. As cinco caixas de texto têm uma tela cada e são vizinhas,
   então a posição do primeiro basta para saber onde estão todas:

       p = (0,55 * altura da janela - topo do 1o) / (topo do 5o - topo do 1o)

   preso entre 0 e 1. Ela dá exatamente 0 quando o topo do PRIMEIRO
   bloco cruza a linha de 55% e exatamente 1 quando o topo do QUINTO a
   cruza — e, no meio, (k-1)/4 quando é o k-ésimo que cruza. Ou seja: a
   bolinha pousa em cima de cada horário no MESMO instante em que
   aquele ato acende, e chega no 22:00 na batida em que o último bloco
   entra. Isso não é coincidência de calibragem: os 55% são os mesmos
   45% de rootMargin do observador vistos do outro lado (a tira viva
   vai de 45% a 55% da janela, e um bloco que sobe entra nela quando o
   topo dele cruza os 55%). Quem mexer no rootMargin de lá mexe na
   LINHA daqui junto, ou a bolinha e o horário aceso descolam.
   O denominador é MEDIDO, não calculado a partir de 100svh: assim a
   conta continua certa se um dia os blocos mudarem de altura, e é o
   mesmo número que serve de detector de regime.

   COMO ELE SABE QUE NÃO É DESKTOP: pelo próprio denominador. No
   celular — e no repouso — a folha põe display:none na coluna de
   texto, as duas caixas medem zero, o curso dá zero e a função
   desiste antes de escrever qualquer coisa. Nenhuma media query
   aqui, nenhum estado para reconciliar no redimensionamento: é a
   mesma regra do observador de ato, e a divisa mora num lugar só,
   que é a folha.

   A GUARDA DE EXISTÊNCIA no topo protege quem carregue este arquivo
   sem a seção dentro (hoje, o bancável _medida_cli.html).
   ============================================================ */
(function () {
    var sec = document.querySelector('.dia-section');
    if (!sec) return;

    var trilho = sec.querySelector('.dia-trilho');
    var blocos = sec.querySelectorAll('.dia-texto');
    if (!trilho || blocos.length < 2) return;

    var marcos = trilho.querySelectorAll('.dia-marco');
    var primeiro = blocos[0];
    var ultimo = blocos[blocos.length - 1];

    /* Os 55% da janela. Ver o cabeçalho: este número é o espelho do
       rootMargin de -45% do observador de ato. */
    var LINHA = 0.55;

    var ultimoValor = -1;
    var ultimoMarco = -1;
    var agendado = false;

    function medir() {
        agendado = false;

        /* As duas leituras primeiro, a escrita depois. */
        var a = primeiro.getBoundingClientRect();
        var b = ultimo.getBoundingClientRect();
        var curso = b.top - a.top;

        /* Regime do celular ou repouso: sem caixa, sem trilho vertical,
           sem nada a escrever. */
        if (curso <= 0) return;

        var p = (window.innerHeight * LINHA - a.top) / curso;
        if (p < 0) p = 0;
        else if (p > 1) p = 1;

        /* Quantizar em 1/2000 corta as escritas repetidas sem que o
           degrau apareça: na linha mais alta que o desenho permite
           (420px) isso dá 0,2px por passo. */
        p = Math.round(p * 2000) / 2000;
        if (p === ultimoValor) return;
        ultimoValor = p;

        trilho.style.setProperty('--dia-progresso', p);

        /* Mesmos limites do indicador: 0, 0.25, 0.5, 0.75 e 1.
           Recalcular a classe nos dois sentidos também cobre a volta. */
        var marcoAtual = Math.floor(p * (marcos.length - 1));
        if (marcoAtual !== ultimoMarco) {
            marcos.forEach(function (marco, i) {
                marco.classList.toggle('is-passed', i <= marcoAtual);
            });
            ultimoMarco = marcoAtual;
        }
    }

    function pedir() {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(medir);
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir, { passive: true });

    /* A primeira leitura cobre quem recarrega a página no meio da
       seção (o navegador devolve a rolagem onde estava) e o pouso com
       âncora. O load é a segunda passada, para o caso de imagem ou
       fonte ainda ter mexido na altura da página. */
    pedir();
    setTimeout( pedir);
})();


/* --- agenda.js --- */

/* =========================================================
   SEÇÃO DA AGENDA — os quatro relógios
   =========================================================
   Um arquivo só, e ele faz uma coisa só: escrever o nome do
   estado atual no data-fase de cada card. Todo o desenho, toda
   a curva e todo o tempo de transição moram no style.css, no
   bloco "SEÇÃO 3B". Aqui não se calcula pixel nem cor.

   O LAYOUT EM VOLTA MUDOU DUAS VEZES E A LÓGICA NÃO MUDOU
   NENHUMA. A seção deixou de ser um retângulo branco com grade
   2x2 e virou uma banda de largura cheia, com o cabeçalho grudado
   à esquerda e os quatro blocos empilhados à direita; depois o
   dono cortou a altura dos tiles pela metade e mandou o texto de
   cada bloco para BAIXO da peça. Deste arquivo as duas rodadas
   cobraram a mesma coisa e nada além dela: o nome da caixa que
   guarda o desenho (o palco virou .ag-tile) e os limites de
   escala das artes. As quatro máquinas de estado, os quatro
   roteiros, os quatro períodos, o escalonamento de largada e o
   observador não mudaram uma linha, e nem a inversão de ordem no
   DOM os alcançou — nada aqui lê ordem de irmãos, e nada aqui
   nunca soube em que caixa o desenho estava.

   TERCEIRA MUDANÇA DE LAYOUT, 18/08/2026, e ela custou ZERO a
   este arquivo: o dono trocou os dois cards de baixo de lugar, e
   no index.html o card 4 passou a vir antes do card 3. Este
   arquivo não sentiu porque tudo aqui é chaveado por data-ag —
   ESCALA, ROTEIROS, LARGADA e MONTADO são objetos indexados pelo
   número do card, e a lista vem de um querySelectorAll que só
   percorre o que achou. A escada de largada (0/380/760/190) e os
   quatro períodos ficaram como estavam: eles espaçam a partida no
   TEMPO, e tempo não tem nada com o lugar do card na grade.

   POR QUE MÁQUINA DE ESTADOS E NÃO KEYFRAME SOLTO. Um GIF de
   CSS rodando em loop não tem onde parar nem onde recomeçar:
   fora da tela ele continua, e ao voltar ele emenda no meio de
   um quadro qualquer. Com estados nomeados a folha só descreve
   como é ESTAR em cada um deles, e a volta inteira é uma lista
   de (instante, nome) que este arquivo toca. Voltar do zero é
   só reescrever o primeiro nome.

   TRÊS REGRAS DA CASA ATRAVESSAM O ARQUIVO:

   1. CADA CARD TEM RELÓGIO PRÓPRIO, MENOS OS DOIS APARELHOS. Os
      quatro períodos são 10,7s / 13,64s / 19,14s / 13,64s, e os dois
      números iguais são os cards 2 e 4, de propósito: desde
      18/08/2026 eles não têm relógio próprio, dividem UM. O pedido
      do dono foi que os dois celulares da seção subissem juntos e
      saíssem juntos, e dois relógios só ficam em fase se tiverem o
      mesmo período, a mesma largada e o mesmo instante de entrada e
      de saída — com dois relógios separados, o erro de cada
      setTimeout iria somando volta após volta até os dois
      descolarem. Um relógio só não descola nunca. Ver o bloco A
      DUPLA, na montagem, e a conta do período no roteiro do card 2.
      Entre o que sobrou nenhum período é múltiplo de outro.
      (O quarto era 11,2s enquanto a cena tinha um relógio analógico e
      barras cinzas; a mensagem que entrou no lugar tem cinco linhas
      para ler, e o repouso que isso pede levou o número para 11,8, que
      é o único dos quatro fora do intervalo dos outros três.)
      (O segundo já foi 9,6s com ida e volta e 9,1s com um voo só;
      em 18/08/2026 a cena virou um celular que troca de aplicativo, e
      três atos não cabem no período mais curto da seção. Os 14,2 são o
      primeiro degrau acima da faixa que os outros três proibiam então.)
      (O terceiro era 12,9s enquanto a cena mostrava só o MEIO da
      história — o convite pronto, a elipse e a ata. No mesmo 18/08/2026
      o dono pediu o ciclo inteiro, em cinco batidas e dois atos que se
      revezam no palco, e 16,7 é o que isso pede. Ele tomou do card 2 o
      posto de volta mais longa dos quatro, no mesmo dia em que o card 2
      o havia ganhado.)
      (O primeiro era 7,4s enquanto o card 1 era a bolha que virava
      pílula; a cena de conversa que entrou no lugar tem três
      atrasos de gente dentro e não cabe em menos que isso.)
      Além disso a partida é escalonada em 0/190/760ms depois do
      observador acender (card 1, a dupla, card 3), para os quatro
      não nascerem no mesmo quadro. Duas coisas pulsando juntas
      leem como uma coisa só, e é exatamente por isso que a dupla
      pulsa junta: ali as duas SÃO uma coisa só, e a escada agora
      espaça três partidas em vez de quatro.
   2. FORA DA TELA NADA ANDA. O IntersectionObserver fica DE PÉ
      (não se desconecta no primeiro disparo), no mesmo contrato
      do palco da promessa e do cartão black no script.js: entra
      em 0,25 de card visível e para quando sai inteiro. Aba
      escondida também dorme. Com a dupla, o limiar passou a ser
      dos DOIS cards ao mesmo tempo, para as duas subidas
      acontecerem na tela e não uma delas embaixo do corte, e um
      teto de 1s impede que essa espera vire tile parado. Quem
      decide deixou de ser a entrada do observador, uma a uma, e
      passou a ser o decide(), que lê os itens da máquina toda.
   3. prefers-reduced-motion ENTREGA A CENA MONTADA. Nenhum
      relógio parte: cada card recebe o estado "montado" uma vez
      e fica nele. O que o estado montado É por card está escrito
      na folha, porque montado é uma POSE, não uma animação
      congelada.
   ========================================================= */
setTimeout( () => {

    const secao = document.getElementById('agendaSection');
    if (!secao) return;

    const cards = secao.querySelectorAll('.ag-card[data-ag]');
    if (!cards.length) return;

    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* =========================================================
       A ESCALA DAS ARTES
       =========================================================
       Cada ilustração é uma caixa de pixels FIXA (--ag-arte-w e
       --ag-arte-h no style.css) com tudo dentro dela em absoluto, e o
       responsivo é a caixa inteira sendo escalada. É o contrato do
       --flow-scale da seção da promessa: geometria de voo, alvo de
       pouso e altura de bolha continuam valendo em qualquer largura,
       porque NADA no desenho muda de número.

       POR QUE A CONTA ESTÁ AQUI E NÃO NA FOLHA. A escala é
       vão-disponível dividido por tamanho-da-arte, e calc() não sabe
       dividir comprimento por comprimento — o resultado teria de ser
       um número puro, e não existe jeito de tirar número puro de cqw
       ou de vw. A alternativa em CSS seria uma escada de umas
       dezesseis media queries, cada uma com o vão interno do card
       naquela largura escrito à mão, e qualquer mudança de padding
       desta seção invalidaria as dezesseis de uma vez. Aqui é uma
       conta só, contínua, e ela se refaz sozinha quando o card muda de
       tamanho.

       A folha já traz um piso de --ag-esc que cabe na tela mais
       estreita que a página atende: se este trecho não rodar, as artes
       ficam pequenas mas nunca transbordam o card.

       DOIS LIMITES POR BLOCO, E SÓ DOIS:
       · OCUPA é quanto da largura do tile a arte pode tomar. Ele existe
         para a peça ler como OBJETO POUSADO no cinza, e não como
         conteúdo esticado até a borda: é o cinza sobrando em volta que
         faz o tile parecer palco. É ele quem manda em tela estreita, e
         é ele que impede o transbordo em 340px.
       · TETO é o tamanho em que a arte para de crescer. Ele já foi só
         uma proteção contra o desenho ficar grande demais numa janela
         larga (o texto de 9,6px de dentro da ilustração passando o
         corpo de 19,2px do título do bloco), e virou o número que
         DECIDE o tamanho da peça no desktop inteiro, porque em tela
         larga é sempre ele o limite ativo.

       ERA UM TRIO E VIROU DUPLA. O terceiro limite era a altura do
       tile, com uma folga vertical de 0,70, e ele morreu na rodada em
       que o tile deixou de ter altura própria: agora a altura do tile é
       a arte mais uma faixa de cinza, e uma medida que sai do desenho
       não pode voltar para limitar o desenho.

       ESTES NÚMEROS JÁ FORAM RECALIBRADOS TRÊS VEZES, e as três estão
       aqui porque quem mexer numa quarta precisa saber quem manda em
       cada largura.

       PRIMEIRA, do palco antigo para o tile. O palco tinha 252px de
       teto de altura e o limite ativo era quase sempre a LARGURA: os
       tetos (1,20 a 1,55) nem chegavam a ser tocados. O tile chegou a
       462 de altura e 820 de largura, e ali quem passou a mandar foi o
       teto. Foram subidos.

       SEGUNDA, com o corte do tile para 34cqw. As duas artes de 188px
       de altura passaram a ser amarradas pela ALTURA, e os tetos delas
       viraram só proteção de novo.

       TERCEIRA, com o fim da altura fixa. Sem o limite de altura, o
       1,10 do card 2 e o 1,20 do card 3 fariam as duas artes CRESCEREM
       justo na rodada em que o dono mandou encolher o cinza em volta
       delas. Os dois desceram para 1,00, que é o tamanho em que as
       duas foram desenhadas — o mesmo que elas já tinham na tela, com
       menos de 5% de diferença. Os outros dois não mexeram um dígito:
       o áudio e o resumo são as artes achatadas, altura nunca foi o
       limite delas e o teto já era o tamanho que se via.

       QUARTA, com o corte da LARGURA do tile (o teto de 570 no
       .ag-pilha). Um número só mudou, o ocupa do resumo: com 0,76 num
       tile de 570 a largura passava a mandar e a arte encolhia 3%
       justo na rodada em que o dono disse para não mexer no tamanho
       das ilustrações. 0,79 devolve o teto de 1,35 como limite ativo,
       que é o que ele viu e aprovou. Os outros três atravessaram o
       corte sem tocar em nada: os 570 foram escolhidos por caberem
       neles.

       SEXTA, com os cards dois por linha e o tile em 616 (18/08/2026).
       O dono mandou as ilustrações MAIS LARGAS para o vão do meio
       encolher, e as duas coisas são a mesma conta: o tile cresceu 8%
       e os tetos subiram 8% junto, senão o quadro maior seria só
       quadro mais vazio. É a primeira vez que esta tabela sobe por
       causa da largura desde a primeira recalibração.

       · os dois 1,00 viraram 1,08. Eles eram "o tamanho em que as
         artes foram desenhadas", e passar disso era o que a terceira
         recalibração tinha ido desfazer — mas lá o problema era arte
         crescendo com o CINZA encolhendo, e aqui as duas crescem
         juntas. O tipo de dentro delas é pequeno (8,6 e 9,6px), então
         8% não chega perto de nenhum limite de leitura.
       · o 1,35 do resumo virou 1,46. O tipo maior dele (10,5px)
         desenha 15,3 na tela, ainda abaixo do título do bloco.
       · o card 1 é a EXCEÇÃO e não subiu os 8%: de 1,32 foi só a 1,35,
         porque quem manda nele não é a largura do tile, é o limite de
         tipo explicado aqui embaixo. A proporção pediria 1,43, o que
         poria o compromisso da ilustração em 17,2px contra os 16,3 do
         título do bloco. O preço é o único da rodada: a conversa do
         card 1 fica com 139px de cinza de cada lado em vez de 120.
       ========================================================= */
    const ESCALA = {
        /* QUINTA RECALIBRAÇÃO, e ela é de UM card só: o 1 trocou de
           arte. A cena dele deixou de ser um balão de áudio solto de
           210x66 e virou um recorte de conversa de 250x155 (a bolha
           enviada, a Sofi digitando e a resposta com o compromisso
           dentro). Os dois números vieram atrás do desenho novo:

           · o OCUPA subiu de 0,70 para 0,80, que é a régua do card 2.
             O 0,70 tinha sido escolhido para dar 252px de balão num
             celular de 375, e essa conta morreu com o balão solto:
             agora o que ocupa a largura é uma CONVERSA, e num tile de
             360 o 0,70 devolvia uma resposta de 183px, um recorte de
             chat visto de longe. Com 0,80 ela sai com 210 e a arte
             deixa 36px de cinza de cada lado, que é o mesmo respiro
             que as duas janelas do card 2 guardam nessa tela.
           · o TETO caiu de 1,60 para 1,32, e não é encolhimento: 1,60
             era o número de uma arte de 66px de altura, que só existia
             para o balãozinho não virar painel de 570 de largura. A
             arte nova é mais que o dobro dela, e 1,32 SAI DE UM LIMITE
             DE TIPO, que é a primeira vez que um número desta tabela
             tem essa origem. O compromisso é desenhado em 12px, e o
             título do bloco logo abaixo do tile tem 16,3px: um texto
             de dentro da ilustração que PASSA o título do bloco
             inverte a hierarquia da coluna, porque a legenda vira a
             peça e a peça vira a manchete. Acima de 1,36 o card 1
             estaria gritando mais alto que a própria legenda dele, e é
             por isso que ele parou em 1,35 na rodada seguinte (12 x
             1,35 dá 16,2px, um fio abaixo dos 16,32 do título) em vez
             de acompanhar os 8% que os outros três subiram.

           Os outros três não mexeram um dígito. O teto de 1,35 do card
           4 é a outra arte achatada, a única que a largura do tile não
           alcança; os de 1,00 são as duas artes altas, que já são
           desenhadas no tamanho em que aparecem. */

        /* NONA RECALIBRAÇÃO, do card 1 outra vez, e ela é a primeira
           desta tabela em que os dois números do bloco andam em sentido
           CONTRÁRIO: a caixa cresceu de 250x141 para 330x190 e o teto
           caiu de 1,35 para 1,07. O motivo é a transcrição da mensagem
           de voz, que entrou embaixo da onda.

           A CONTA É DE ALTURA E ELA É APERTADA. Desde que este arquivo
           passou a dar aos quatro tiles a MESMA altura (a maior das
           quatro), crescer a arte do card 1 engorda o cinza dos outros
           três, e a altura comum hoje é 263 no desktop, ditada pelo
           card 3. A régua vira: --ag-arte-h x teto + 60 de faixa não
           pode passar de 263. Com 190 x 1,07 dá 263,3, tocado por
           dentro. Um teto de 1,08 já poria a grade inteira 2px mais
           alta por causa de uma linha de texto de um card só.

           A TRANSCRIÇÃO NÃO FOI PAGA EM ALTURA, PORQUE NÃO HAVIA. Ela
           foi paga em LARGURA, que era o que sobrava: o tile tem 616 e
           a arte usava 338, com 139 de cinza morto de cada lado. Agora
           ela desenha 353x203 e o cinza cai para 131. É a primeira vez
           que uma arte desta seção cresce para o lado porque não podia
           crescer para cima.

           O OCUPA NÃO MEXEU, e é ele que protege o celular. Em tela
           estreita quem manda é sempre ele, e a largura desenhada ali é
           o vão do tile vezes 0,80, INDEPENDENTE do tamanho da caixa.
           O que muda com a caixa maior é a altura desenhada, que é a
           RAZÃO da caixa vezes essa largura. E aqui a primeira versão
           deste comentário errou o sinal, então fica medido: 190/330 dá
           0,576 contra os 0,564 de 141/250, ou seja, a arte nova é 2%
           mais ALTA em proporção, não mais achatada. Em 375 ela desenha
           165,8 de altura onde a velha desenhava 162,4.

           O PREÇO DA RODADA, MEDIDO NAS 21 LARGURAS. No desktop a
           altura comum não se move: 263 antes, 263 depois, porque lá
           quem mandava era o card 3 e o card 1 encosta nele por baixo
           (190 x 1,07 + 60 = 263,3). O que cresce é o celular, e cresce
           pouco: 183 vira 186 em 340, 201 vira 204 em 375, 221 vira 225
           em 414. Três a quatro pixels, que é a altura de uma linha de
           transcrição rateada entre os quatro cards.

           A ÚNICA FAIXA QUE SENTE é a de 470 a 520 de janela, onde o
           teto passa a mandar mais cedo que antes: ali a altura comum
           sai de 239 para 252. São 13px numa banda estreita, e é o
           maior número desta rodada.

           E O CARD 1 PASSOU A DITAR A ALTURA COMUM EM TODA LARGURA.
           Antes ele só mandava abaixo de 560 e o card 3 mandava acima;
           agora ele empata ou ganha em todas. Quem for mexer no card 3
           daqui para a frente precisa saber que a folga que existia
           acima dele acabou: a grade inteira está pendurada no card 1.

           E OS CORPOS DE TEXTO DA FOLHA SUBIRAM TODOS 26%, na mão, para
           que o produto escala x corpo não mude: o compromisso passou
           de 12 para 15 e continua saindo em 16,0px reais contra os
           16,2 de antes. Quem mexer no teto daqui tem de mexer nos
           corpos do bloco ag1-* do style.css junto, senão a hierarquia
           contra o título do bloco (16,32px) se desfaz. */

        /* DÉCIMA RECALIBRAÇÃO, e ela é do card 2, pelo mesmo motivo que
           a quinta foi do card 1 e a oitava foi do card 3: a arte
           trocou. A mensagem solta mais o quadro de calendário mais o
           cartão que voava (400x158) viraram UM CELULAR, na receita do
           card 4, com duas telas dentro dele. A caixa foi para 300x210 e
           os dois números da linha mudaram.

           A CAIXA É A DO CARD 4 NA LARGURA E MAIS ALTA NA ALTURA, e as
           duas metades dessa frase têm motivos diferentes.

           · OS 300 DE LARGURA são a medida original do aparelho da
             página Segurança, que é de onde o card 4 trouxe o desenho.
             Aparelho não se redesenha para caber numa caixa: a caixa é
             que é a régua dele.
           · OS 210 DE ALTURA são o que a segunda bolha custou, e este é
             o número apertado desta rodada. A arte é CENTRADA no tile,
             então cada unidade de caixa a mais devolve MEIA unidade de
             aparelho à vista e custa uma unidade inteira de altura
             pedida. O teto real é 215: acima disso este card passa a
             pedir mais que o vizinho mais alto na janela de 320px, que é
             a largura mais apertada que a página atende, e a altura
             comum dos QUATRO tiles subiria por causa de um só. Ficou em
             210, com três unidades de folga medidas nas 23 larguras.

           O OCUPA CAIU DE 0,82 PARA 0,62, E A QUEDA É VERTICAL. Parece
           encolhimento de largura e não é: 0,64 é o do card 4 (a mesma
           caixa de 300, o mesmo aparelho), e o que os 0,02 a menos
           compram é ALTURA. Escala menor é a mesma altura de tile
           valendo mais unidades de desenho, e é em unidades de desenho
           que se conta quanto de celular aparece. Medido: com 0,64 a
           pior largura devolve 265,6 unidades de tile, com 0,62 devolve
           269,3 — quase quatro unidades de aparelho de graça, e o preço
           é o celular sair 3% menor no celular de verdade (223px reais
           em 375 contra 230).

           E 0,62 É O FIM DA LINHA, não um número escolhido no olho.
           Abaixo dele o limite ativo na faixa apertada deixa de ser o
           ocupa e passa a ser o TETO (a janela de 470 a 520, onde a
           escala já bateu em 0,933), e ali o ocupa não tem mais nada a
           dar: 0,58 devolve exatamente a mesma pior largura que 0,62.
           Quem quiser mais altura depois deste ponto tem de mexer no
           teto, e mexer no teto é encolher o aparelho no desktop.

           O TETO CAIU DE 1,28 PARA 0,933, e é o mesmo do card 4 pelo
           mesmo motivo que ele: 0,933 é 280/300, ou seja o aparelho da
           Segurança desenhado em 300 e entregue nos 280 reais que o dono
           pediu. Um teto menor que 1 é o sinal de que a arte não é
           desenhada no tamanho em que aparece — ela é desenhada na régua
           da referência e reduzida.

           E O CARD 2 CONTINUA NÃO PUXANDO A ALTURA DA GRADE, que era a
           condição desta rodada inteira. Medido nas 23 larguras que a
           tabela do mede() atravessa, o pedido dele fica abaixo do maior
           em todas: 174 de 177 em 320px, 199 de 204 em 375, 220 de 225
           em 414 e 256 de 263 no desktop. A altura comum dos quatro
           tiles é a mesma antes e depois desta rodada, pixel por pixel,
           e é isso que faz esta cena caber sem levantar os vizinhos. */
        1: { ocupa: 0.80, teto: 1.07 },
        2: { ocupa: 0.62, teto: 0.933 },
        /* OITAVA RECALIBRAÇÃO, e ela é de UM card só: o 3 trocou de
           arte. A cena dele deixou de ser um cartão de reunião com barra
           cinza, três avatares mudos e três bolhas voando (300x188) e
           virou um recorte de conversa de grupo com o link do Meet, o
           divisor de dia e a ata (318x203). Os dois números vieram
           atrás do desenho novo, e os dois são incomuns nesta tabela.

           · o TETO é 1,00, que é a primeira vez que um teto aqui vale
             exatamente um. Ele não é gosto nem coincidência: é a
             ALTURA COMUM DA GRADE virando limite ativo. Os quatro tiles
             usam a maior das quatro alturas, e hoje quem a fixa é este
             card (203 de arte mais 60 de faixa dá os 263 do tile).
             Qualquer teto acima de 1,00 faria a arte pedir mais que
             203, e os QUATRO tiles cresceriam por causa deste. Então a
             arte foi desenhada na medida em que ela aparece: 1px de
             desenho é 1px de tela no desktop, e quem mexer nela lê os
             corpos de texto no tamanho real, sem conta nenhuma.
             O limite POR TIPO, que é o que trava o card 1, aqui sobra:
             o maior corpo desenhado é o título da ata, 14,5px, contra
             os 16,32px do título do bloco, e ele permitiria ir até
             1,12. Os dois limites existem, e este é o card em que a
             altura ganha do tipo.
           · o OCUPA caiu de 0,68 para 0,66, e a queda é conserto de
             efeito colateral. A caixa nova é mais alta que a velha (203
             contra 188), então na faixa de largura em que o teto ainda
             não pegou (tile abaixo de uns 480, que é tablet em retrato)
             o mesmo 0,68 faria esta arte pedir mais altura que a antiga
             e empurrar a grade inteira. 0,66 põe a curva do card 3
             abaixo da que ela tinha em TODA largura: no desktop o
             limite é o teto e nada muda, e no celular quem fixa a
             altura continua sendo o card 1, como já era.
             Na tela estreita a arte fica MAIOR do que era, apesar do
             ocupa menor, porque a caixa cresceu: o texto de leitura
             sai em 8,4px num aparelho de 340 contra os 7,1px da barra
             cinza e do "Reunião · 14:00" da cena velha. */
        /* E A CENA TROCOU OUTRA VEZ EM 18/08/2026 SEM MOVER UM DÍGITO
           DESTA LINHA, o que não tinha acontecido ainda nesta tabela. O
           card 3 passou de três batidas para CINCO (o pedido em áudio, a
           digitação, a resposta com o link, a reunião no Meet e a ata),
           em dois atos que se revezam no mesmo palco. A caixa continua
           332x203 e os dois limites continuam valendo pelos mesmos
           motivos: o teto porque a altura comum da grade é o limite
           ativo, e o ocupa porque em tela estreita é ele que segura a
           arte dentro do tile.

           E É JUSTAMENTE PORQUE OS NÚMEROS NÃO PODIAM MUDAR que a cena
           nova é em atos. Cinco peças empilhadas pedem bem mais que 203,
           e 203 é teto duro: um pixel a mais aqui levanta o tile dos
           quatro cards. Então em vez de a caixa crescer, os atos se
           revezam — a janela do Meet e a ata são inquilinas sucessivas
           do mesmo vão, e nunca se veem juntas. */
        3: { ocupa: 0.66, teto: 1.00 },
        /* SÉTIMA RECALIBRAÇÃO, e ela também é de UM card só: o 4 trocou
           de arte. A cena dele deixou de ser um relógio analógico ao
           lado de uma bolha com barras cinzas (330x110) e virou uma
           mensagem só, com o dia inteiro escrito dentro (257x124).

           E NA MESMA SEMANA A CENA GANHOU UM APARELHO EM VOLTA, e depois
           o aparelho foi reconstruído em cima do celular da página
           Segurança. Este número é o da RECONSTRUÇÃO:

           · o TETO caiu de 1,167 para 0,933, e a queda não encolhe nada:
             ela é o preço de trazer o desenho na MEDIDA ORIGINAL da
             Segurança. O aparelho de lá é desenhado com 300 de largura,
             o dono pediu 280 reais, e 280/300 dá exatamente 0,933. Um
             teto MENOR que 1 é o primeiro desta tabela, e é o sinal de
             que a arte deixou de ser desenhada no tamanho em que
             aparece: ela é desenhada na régua da referência e reduzida.
           · o OCUPA caiu de 0,68 para 0,64 pelo mesmo motivo, um degrau
             atrás: a caixa cresceu de 240 para 300 de largura, então a
             mesma fração de tile devolveria um celular maior do que o
             pedido em telas estreitas.

           O que segue abaixo é o registro da rodada anterior, quando o
           aparelho ainda era desenhado à mão nesta folha (a OITAVA
           recalibração, a segunda deste card em 24 horas). O dono
           pediu a mensagem dentro de um CELULAR subindo de baixo do
           tile, com a referência do aparelho da página Segurança na mão,
           e a caixa foi de 257x124 para 300x146. Os dois números novos:

           · o OCUPA subiu de 0,80 para 0,88, e a subida É o aparelho. A
             moldura, o topo da conversa e as margens do papel de parede
             comem uns 40% da área, então o que sobra para a mensagem é
             menor: num tile de 360 o 0,80 devolvia um celular de 288px e
             uma lista de 10,6px reais, que é fino demais para ler. Com
             0,88 o celular sai com 317 e a lista com 11,6. É o maior
             ocupa dos quatro, e é justo: nos outros três a peça é um
             objeto pousado no cinza, e aqui a peça é uma TELA, que só
             existe se for grande o bastante para se ler o que está
             dentro dela.
           · o TETO ficou em 1,25, e não é inércia: o número foi
             reencontrado por outro caminho. A mensagem agora é desenhada
             em 11px (era 12) e a 1,25 ela vira 13,75 reais. Mais teto
             daria mais letra e MENOS aparelho à vista, porque o que se
             vê do celular é (altura do tile + altura da arte x escala)
             dividido por 2, medido em unidades de desenho: subir para
             1,40 devolveria 15,4px de letra e cortaria o balão no meio.
             1,25 é o ponto em que as duas coisas cabem.

           E EXISTE UM SEGUNDO LIMITE NESTA LINHA, QUE NÃO É DE TIPO NEM
           DE LARGURA: a altura comum. A altura do tile é a MAIOR das
           quatro pedidas, então este card não pode pedir mais que o card
           1 no celular nem mais que a arte de 188px no desktop, ou o
           tile dos QUATRO sobe. Com 146 de arte ele pede 242,5 de 263 no
           desktop, 192,3 de 200,6 em 375px e 175,6 de 183 em 340px:
           folga em todas as larguras, nos dois regimes (com o teto ativo
           e com o ocupa ativo). Não é sorte, é o número que fecha o
           desenho, e é a condição de o card 4 poder ser reformado
           sozinho sem levantar o tile dos vizinhos. O 146 é também o que
           decide QUANTO de celular aparece, porque a arte é centrada no
           tile e o aparelho é mais alto que ela de propósito.

           Os outros três não mexeram um dígito. */
        4: { ocupa: 0.64, teto: 0.933 }
    };

    /* A FAIXA DE CINZA, que é a única coisa que sobrou de respiro no
       tile. Ela é o que separa o desenho da borda de cima e da de
       baixo, e é IGUAL nos quatro cards: é ela, e não a altura, que faz
       os quatro lerem como a mesma família.

       Cresce com a largura do bloco entre 18 e 30px, pelos dois motivos
       de sempre. O teto de 30 porque a maior sombra desenhada aqui é um
       0 8px 20px, que espalha 28px para baixo da peça: com menos que
       isso a cauda da sombra seria cortada pela borda do tile, e uma
       peça com a sombra cortada deixa de estar pousada. O piso de 18
       porque no celular a arte já saiu escalada para uns dois terços, e
       uma faixa fixa de 30 ali viraria de novo o vazio que esta rodada
       veio desfazer.

       A FRAÇÃO SUBIU DE 0,037 PARA 0,053 quando o tile perdeu largura
       (o teto de 570 no .ag-pilha). Ela é medida na largura do bloco, e
       um bloco 30% mais estreito devolvia uma faixa de 21px, abaixo dos
       28 que a sombra pede. 0,053 põe o desktop de volta nos 30 e deixa
       o celular em 20, que é onde ele já estava. */
    const FAIXA = { min: 18, max: 30, fracao: 0.053 };

    const tiles = [];

    cards.forEach((card) => {
        const tile = card.querySelector('.ag-tile');
        const arte = card.querySelector('.ag-arte');
        if (tile && arte) tiles.push({ card: card, tile: tile, arte: arte });
    });

    /* =========================================================
       UMA ALTURA SÓ PARA OS QUATRO
       =========================================================
       Pedido do dono em 18/08/2026, olhando a grade de dois por dois:
       os quadros têm de ter o mesmo tamanho. Com dois cards por linha
       a altura desigual deixou de ser régua e virou defeito — os dois
       tiles de uma linha começam juntos em cima e terminavam em linhas
       diferentes, então os títulos de baixo também saíam desalinhados,
       e a grade lia como quatro peças soltas em vez de um conjunto.

       ISSO DESFAZ A REGRA DE 17/08, e é bom saber o que se desfez: na
       coluna única, a altura de cada tile era o desenho dele mais a
       faixa de cinza, e o que se repetia na pilha era a MARGEM, não a
       altura. Ali funcionava porque nada ficava lado a lado para
       comparar. Em grade, o olho compara.

       A ALTURA COMUM É A MAIOR DAS QUATRO, e a escolha não é de gosto.
       Padronizar por baixo (ou pela média) obrigaria as duas artes de
       188px a encolher, e desenho aprovado não encolhe para caber em
       moldura — o que se padroniza aqui é a MOLDURA. Quem desenha mais
       baixo ganha mais cinza em volta, e é só isso que a mudança custa:
       no desktop, o resumo passa de 30px de faixa para uns 51.

       A FAIXA CONTINUA SENDO O PISO. A conta de cada card não some: ela
       é que diz qual é a maior altura pedida, e é ela que garante que o
       card mais alto (a arte de 188 escalada) fique com os 30px de
       cinza que a cauda da sombra precisa. Os outros três só recebem
       mais do que pediram. */
    function mede() {
        /* DUAS PASSADAS, e é o que a altura comum custa. A primeira mede
           e guarda; a segunda escreve. Uma passada só não serve porque o
           primeiro card precisa saber o que o último vai pedir, e isso
           ninguém sabe antes de medir os quatro. */
        const contas = [];
        let maior = 0;

        tiles.forEach((p) => {
            /* Lê do .ag-arte, e NÃO do bloco: o --ag-arte-w de cada
               composição é declarado no próprio elemento da arte (.ag1 a
               .ag4). Lendo do bloco, as quatro contas usavam o valor
               genérico do .ag-card e a arte larga do card 2 transbordava
               a borda no celular. */
            const cs = getComputedStyle(p.arte);
            const aw = parseFloat(cs.getPropertyValue('--ag-arte-w'));
            const ah = parseFloat(cs.getPropertyValue('--ag-arte-h'));
            const lim = ESCALA[p.card.dataset.ag] || { ocupa: 0.8, teto: 1.4 };
            /* SÓ A LARGURA SE MEDE AQUI. A altura do tile não entra na
               conta porque ela SAI dela: quem lê a altura para decidir o
               tamanho da arte e depois escreve a altura a partir da arte
               monta um laço que se persegue. Com a altura comum isso vale
               em dobro, porque agora a altura de um card depende do
               desenho dos outros três. */
            const lw = p.tile.clientWidth;
            if (!aw || !ah || !lw) return;
            /* A MENOR DAS DUAS: em tela estreita manda o ocupa, em tela
               larga manda o teto, e a troca de um pelo outro é o único
               degrau que existe na vida desta arte. */
            const e = Math.min((lw * lim.ocupa) / aw, lim.teto);
            const faixa = Math.min(FAIXA.max, Math.max(FAIXA.min, lw * FAIXA.fracao));
            const h = Math.round(ah * e + faixa * 2);
            if (h > maior) maior = h;
            contas.push({ card: p.card, esc: e });
        });

        if (!maior) return;

        /* Escrever isto muda a caixa do tile e acorda o ResizeObserver de
           volta. Não é laço: a largura não mudou, a conta devolve os
           mesmos números, o navegador não vê mudança de caixa nenhuma na
           segunda passada e o observador cala. */
        contas.forEach((c) => {
            c.card.style.setProperty('--ag-esc', (Math.round(c.esc * 1000) / 1000).toString());
            c.card.style.setProperty('--ag-tile-h', maior + 'px');
        });
    }

    mede();

    if ('ResizeObserver' in window) {
        /* Observa o TILE, e não a janela: assim a conta se refaz também
           quando a grade troca de duas colunas para uma, quando a barra
           de rolagem aparece, ou quando qualquer coisa fora desta seção
           mudar a largura do bloco. */
        const ro = new ResizeObserver(() => mede());
        tiles.forEach((p) => ro.observe(p.tile));
    } else {
        window.addEventListener('resize', mede);
    }

    /* A fonte da web chegando depois muda a altura do bloco de texto e,
       com ela, nada do tile — mas muda a largura da barra de rolagem
       em alguns casos. Uma remedida no load fecha a conta. */
    setTimeout( mede);

    /* ---------------------------------------------------------
       OS QUATRO ROTEIROS
       ---------------------------------------------------------
       Cada roteiro é uma lista de passos {t, f}: no instante t
       (ms, contado do começo da volta) o card passa a estar na
       fase f. O período é quanto a volta inteira dura, incluindo
       o respiro de fim — o intervalo entre o último passo e o
       período é o silêncio de propósito, que é o que impede a
       cena de parecer esteira.

       Os tempos aqui conversam com os tempos da folha: quando um
       passo pede uma transição de 480ms, o passo seguinte só
       entra depois dela. Mexer num número aqui sem olhar a
       duração de lá é o jeito de cortar uma transição no meio.
       --------------------------------------------------------- */

    const ROTEIROS = {

        /* CARD 1 · o áudio e a resposta.
           A CENA VELHA ERA UMA BOLHA MORFANDO NUMA PÍLULA de estados
           ("Áudio → Entendendo → Agendado"), em 7,4s. Ela caiu inteira:
           a bolha flutuava sem conversa em volta, a pílula era UI que
           não existe em produto nenhum, e o desfecho era um RÓTULO
           quando a copy promete um compromisso. O roteiro novo é uma
           conversa curta, e cada passo é um ato de alguém.

           'fala' põe a bolha de áudio enviada em cena (sobe 9px e
           assenta na mola, 500ms). 'ouvindo' solta a onda e o cabeçote
           pelos 171px em 2,06s LINEARES — cabeçote é relógio, e relógio
           não desacelera na chegada — e solta junto a TRANSCRIÇÃO,
           palavra por palavra, uma a cada 235ms. 'ouvido' escreve a
           pose de fim da onda e vira o par de vistos para o azul, com
           180ms de folga: a onda acaba, e SÓ DEPOIS o aplicativo marca
           como ouvido.

           A TRANSCRIÇÃO É A PEÇA NOVA DESTA RODADA e ela não pediu fase
           nenhuma. O escalonamento das oito palavras é propriedade das
           PALAVRAS, não do card: cada uma carrega o índice no --i e a
           folha calcula o atraso dela. Se virasse fase daqui, o card
           teria oito estados para descrever um gesto só, que é o mesmo
           argumento pelo qual o card 3 não tem uma fase por bolha.

           OITO PALAVRAS EM 1,65s DENTRO DOS 2,06s DA ONDA. A última
           assenta antes de o áudio acabar de propósito: transcrição de
           verdade persegue a fala e alcança no fim, e uma que
           terminasse junto com a onda no mesmo quadro leria como duas
           animações amarradas em vez de uma consequência da outra.
           'digitando' acende a bolha de três pontos. 'resposta' apaga
           os pontos e traz a mensagem com o compromisso dentro, do
           mesmo canto. 'saindo' apaga as duas bolhas juntas, no lugar.

           OS TRÊS ATRASOS SÃO O ASSUNTO DO ROTEIRO, e são o que separa
           uma conversa de uma troca de estados:
           · 200ms entre a bolha assentar (aos 800) e a onda começar
             (aos 1000). Ninguém aperta o play no mesmo quadro em que a
             mensagem aparece.
           · 900ms entre a onda acabar (aos 3060) e os pontos
             aparecerem (aos 3960). É a folga de gente: alguém do outro
             lado ouviu, entendeu e só então começou a escrever. Sem
             ela a resposta seria automática, e automático é a leitura
             que a peça velha tinha.
           · 1280ms de digitação, aos 3960 até 5240. Escrever leva
             tempo, e é o único trecho da volta em que nada acontece
             além de esperar — que é justamente o que faz o outro lado
             parecer humano.

           A RESPOSTA CHEGA 2,7s DEPOIS DO FIM DO ÁUDIO, montada aos
           5760, e a cena então FICA PARADA 2,8s antes de sair. Esse
           repouso é o desfecho: é nele que se lê "Dentista", "quinta ·
           15:00" e o aviso das 14:00. Não há movimento algum pagando o
           fim da história, e é de propósito — quem paga é o tempo.

           O PERÍODO É 10,7s E NÃO É MÚLTIPLO DE NENHUM DOS OUTROS TRÊS
           (14,2 / 16,7 / 15,4), que é o contrato desta seção. Esta lista
           já trouxe o 7,4s, que era o período DESTE card na cena velha e
           não o de um vizinho, e depois trouxe os três números que os
           vizinhos tinham antes das rodadas deles: quem mexer num
           período tem de reescrever a lista aqui, senão ela vira um
           retrato de uma seção que não existe mais.

           A TRANSCRIÇÃO NÃO CUSTOU UM MILISSEGUNDO. Ela cabe inteira
           dentro da fase que já existia, porque o que ela acompanha é a
           onda, e a onda não mudou de duração ao mudar de largura: 2,06s
           valia para 87px e vale para 171px, já que o cabeçote é um
           relógio e relógio não anda mais rápido por ter mais chão.

           Os 1,5s entre o 'off' e o fim da volta são o tile vazio antes
           de recomeçar, na mesma faixa dos vizinhos (o card 2 guarda
           1,94s, o card 3 guarda 1,22s, o card 4 guarda 1,74s). */
        1: {
            periodo: 10700,
            passos: [
                { t:    0, f: 'off'       },
                { t:  300, f: 'fala'      },
                { t: 1000, f: 'ouvindo'   },
                { t: 3080, f: 'ouvido'    },
                { t: 3960, f: 'digitando' },
                { t: 5240, f: 'resposta'  },
                { t: 8560, f: 'saindo'    },
                { t: 9200, f: 'off'       }
            ]
        },

        /* CARD 2 · o celular que troca de aplicativo.
           A CENA VELHA ERA UMA IDA SÓ, em 9,1s: uma bolha aparecia, o
           cartão do compromisso se descolava dela e voava até o vão das
           15:00 de um quadro de calendário ao lado. Ela caiu inteira em
           18/08/2026, com o dono dizendo que estava travada e que morria
           inteira, e o argumento do corte está no comentário do bloco no
           index.html. Aqui vale a consequência de tempo: a cena deixou
           de ter um gesto só (o voo) para ter TRÊS ATOS (o aparelho que
           sobe, a leitura da conversa, a troca de aplicativo), e um
           roteiro de três atos não cabe no período mais curto da seção.

           'sobe' traz o aparelho de fora do tile até o lugar, na curva
           calibrada do card 4 (1,05s de subida, 0,58 de opacidade), e
           ele já sobe COM A CONVERSA DENTRO: o áudio do dono e a
           resposta da Sofi, prontos, como uma captura de tela. Nada é
           digitado em cena e nada chega — a conversa é a do card 1 vista
           horas depois, e é por isso que os vistos já nascem azuis.
           'whats' é a fase de leitura: nela nada se move, e é ela que
           paga a primeira metade do título. 'troca' é o GESTO DE TROCA
           DE APP DO iOS (era um fade; a revogação, com o filme que a
           motivou, está logo abaixo): 580ms de keyframes na folha, as
           duas telas viram cartões opacos e deslizam sobre o chão
           escuro do sistema, o WhatsApp saindo pela esquerda e o
           Google Agenda entrando pela direita. 'agenda' é o calendário
           MONTADO E VAZIO: a régua das 15:00 à vista, nada nela, e o
           vazio é conteúdo — é o "antes" do registro. 'arrasta' é a
           PUXADA: o compromisso emerge da borda de baixo do tile,
           puxado por um cursor, sobe por cima da tela e encaixa no vão
           das 15:00.
           'evento' é o POUSO e o que vem depois dele: o bloco de
           verdade acende no lugar da peça que viajou, o cursor solta e
           sai, e o brilho passa uma vez. 'saindo' apaga o aparelho
           inteiro, com o Google Agenda e o compromisso ainda legíveis
           no último quadro.

           OS DOIS INTERVALOS SÃO O ASSUNTO DO ROTEIRO:

           · 110ms entre o aparelho assentar (aos 1190) e a fase de
             leitura. É a mesma folga que o card 4 usa entre a subida e
             os três pontos, e ela existe pelo mesmo motivo: aparelho
             ainda em movimento com coisa acontecendo dentro são dois
             gestos no mesmo quadro, e o olho não sabe qual dos dois é o
             assunto.
           · 3,41s de leitura, dos 1190 aos 4600. São duas bolhas com
             seis linhas somadas (a onda, a transcrição, a assinatura, o
             compromisso, o aviso e as duas horas), e trocar de
             aplicativo antes disso transformaria a conversa em vinheta
             de abertura. Mais que isso e o card fica esperando: o
             assunto dele é o que acontece DEPOIS.

           "NÃO HÁ CONSEQUÊNCIA ATRASADA DEPOIS DA TROCA" FOI REVOGADA
           pelo dono em 18/08/2026, com o filme na mão: o bloco do
           Dentista vinha embutido na tela que entrava, atravessava a
           fusão como fantasma desde o primeiro quadro, e nada
           ACONTECIA no calendário. O medo que a regra guardava
           (entrada = história de transporte) errava o alvo: transporte
           é peça VIAJANDO de um aplicativo para o outro, e o que entra
           agora é o registro acontecendo NO LUGAR dele, sem viagem e
           sem ninguém tocar na tela. O automático dramatizado é a
           prova de que ninguém digitou, e o beat de calendário vazio
           antes dele é o "antes" que faz o registro ser um
           acontecimento em vez de mobília.

           A CONTA DO TERÇO FINAL, REFEITA EM 19/08/2026 PELO ARRASTO.
           O que mudou não foi o tamanho do terço, foi o que acontece
           dentro dele: onde havia 385ms de bloco se escrevendo sozinho
           agora há 1,18s de compromisso sendo trazido de fora. As
           pontas compartilhadas com o card 4 não se mexeram, e o preço
           saiu de dois lugares só, os dois com folga contratada.

           · o gesto do iOS dura 640ms, dos 4600 aos 5240, e 'agenda'
             só entra aos 5320, 80ms DEPOIS do último quadro: trocar a
             fase antes disso arranca a animação do elemento e corta o
             keyframe no meio. A margem foi conferida no filme, e a
             mesma margem de 80ms se repete agora na virada do pouso.
           · o BEAT DO CALENDÁRIO VAZIO É MEDIDO NA TELA, E NÃO NO
             ROTEIRO, e essa distinção nasceu com a puxada de baixo: a
             fase 'arrasta' entra aos 5820, mas os primeiros 417ms dela
             acontecem ABAIXO da borda do tile, com a peça ainda fora do
             quadro. O que o olho vê de calendário vazio vai do fim do
             gesto (5240) até a peça emergir (6237): 997ms, no teto da
             faixa de 700 a 1000 que o roteiro contrata. Quem mexer na
             distância da puxada refaz esta conta, porque ela muda o
             instante em que a peça aparece sem mudar passo nenhum.
           · a PUXADA dura 1150ms, dos 5820 aos 6970, e 'evento' entra
             aos 7050 — os mesmos 80ms de margem do gesto do iOS. A
             peça já está imóvel bem antes disso: a cauda morta medida
             da curva é de 100ms, então ela repousa dos ~6870 em diante
             e a troca de peça acontece com tudo parado, que é a única
             condição em que uma troca de peça não se vê.
           · o DESFECHO MONTADO fica em cena dos 7050 aos 11600: 4,55s
             de bloco no lugar, entre a linha das 15:00 e a das 16:00.

           O PISO DE 5s DO DESFECHO CAIU PARA 4,4s, e a régua que o
           substituiu é melhor do que ele. O que o piso media era TEMPO
           DE LEITURA do compromisso, e na montagem velha o desfecho era
           o único lugar onde ele existia: antes dos 6505 não havia
           texto para ler. Agora o bloco entra no quadro JÁ ESCRITO e
           está inteiro dentro do aparelho muito antes de pousar — o
           texto é legível desde os ~6600, o que dá 5,0s de compromisso
           lido em cena, mais do que os 5,1s de antes só não são por
           uma décima. Quem recalibrar isto mede a LEITURA, não a
           imobilidade.

           E É NO DESFECHO QUE O TÍTULO SE PAGA, como sempre:
           "Dentista", quinta 20, uma hora de duração, no calendário
           certo. O que a cena deixou de dizer com o registro
           automático ela agora diz com a origem da peça — o
           compromisso chega PRONTO, de fora, e ninguém digita nada em
           cena.

           AS BATIDAS JÁ ANDARAM DUAS VEZES EM 18/08/2026, e as duas
           estão escritas porque a segunda desfez metade da primeira.
           Na lapidação do meio-dia o gesto caiu de 640 para 580 e
           'agenda'/'evento' desceram os mesmos 60. À noite o dono
           pediu o gesto MAIS SUAVE, "como a troca de aplicativos do
           iPhone", e a curva virou MOLA — que precisa da cauda de
           volta para sair da imobilidade e assentar sem estalo. O
           gesto voltou aos 640 e, com ele, 'agenda' aos 5320 e
           'evento' aos 6120, que são os números de antes da
           lapidação. O que a lapidação deixou de herança e NÃO voltou
           atrás é a sobreposição: a rampa de escala do cartão que
           entra continua acendendo dentro do rastejo da viagem, e não
           depois dela.

           A SAÍDA FOI E VOLTOU, e vale saber por quê, porque foi por
           pouco. Quando a autoria do registro tinha três batidas (com
           a fagulha), o bloco só ficava legível aos 570ms e 'saindo'
           foi para 11800 para o desfecho não cair abaixo do piso de
           5s. Tirado o símbolo, o atraso que a causalidade dele pedia
           caiu junto, a escrita passou a começar no próprio instante
           da virada de fase (385ms até legível) e os 200ms
           emprestados voltaram: 'saindo' está de novo em 11600.

           E O ARRASTO NÃO O TIROU DE LÁ, mesmo custando 1,23s onde
           havia 385ms. Foi de propósito: a ponta é compartilhada, e a
           régua desta seção diz que o que se negocia é o CUSTO da
           batida nova, nunca a ponta. O tempo veio do beat do vazio e
           do desfecho, que passou a ser medido por leitura em vez de
           por imobilidade. Nenhum passo do card 4 foi tocado.

           O QUE ACONTECE DENTRO DE 'evento' TEM ORDEM, e ela está toda
           na folha porque é desenho e não roteiro: 180ms de pulso do
           cursor soltando, 480ms de cursor se afastando e apagando, e o
           brilho largando aos 660, no quadro seguinte ao último em que
           existe um ponteiro na tela. O compromisso fica sozinho em
           cena a partir dos 8350, e são 3,25s assim até 'saindo'.

           E ELE NÃO PODIA TER SAÍDO DE LÁ, o que só se soube depois:
           'saindo' aos 11600 é número COMPARTILHADO com o card 4
           desde que os dois aparelhos viraram uma cena só, junto com
           o 'sobe' aos 140 e o período. Mexer nele aqui e não lá tira
           os dois de fase. Fica a régua para a próxima vez que o
           desfecho precisar de mais tempo: o que se negocia é o
           CUSTO da batida nova (aqui, tirar 190ms de atraso resolveu
           inteiro), nunca a ponta compartilhada.

           A SAÍDA É SÓ OPACIDADE e o aparelho inteiro de uma vez: volta
           não é ida rebobinada, e a troca de aplicativo não se desfaz
           antes de sair. O que sai de cena é o celular com a agenda
           dentro.

           O PERÍODO É 13,64s, E ELE NÃO É MAIS SÓ DESTE CARD. Em
           18/08/2026 o dono pediu que os dois aparelhos da seção
           subissem juntos e saíssem juntos, e dois relógios só ficam em
           fase se tiverem o MESMO período: os cards 2 e 4 passaram a
           dividir um relógio, e este roteiro é o que manda nos dois. As
           pontas são daqui ('sobe' aos 140, 'saindo' aos 11600, 'off'
           aos 12260) e o vizinho veio para elas, porque é este card que
           tem três atos e não cabe em menos.

           O QUE ESTA CENA PAGOU FORAM 560ms DE TILE VAZIO, e nada além
           disso: nenhum passo daqui andou um milissegundo, nem o gesto
           do iOS, nem o beat do calendário vazio, nem os 5,2s de
           desfecho montado. O que encolheu foi o vão entre o 'off' e o
           recomeço, que é o único trecho da volta sem assunto e era o
           mais largo dos quatro (1,94s, contra 1,5s do card 1 e 1,22s do
           card 3). Em 13,64s ele fica em 1,38s, dentro da faixa dos
           vizinhos, e o tile passa 1,52s sem um pixel se mexendo até o
           aparelho subir de novo, que é o número que o card 4 já tinha
           por escrito depois de o dono reclamar da espera do fim.

           A CONTA VELHA, DE QUANDO O PERÍODO ERA 14,2s E SÓ DESTE CARD.
           O contrato da seção
           é que nenhum dos quatro seja múltiplo de outro e que nenhum
           encoste no vizinho. Quando este número foi escolhido os outros
           três eram 10,7 / 12,9 / 11,8, e a faixa de 9,7 a 13,9 inteira
           estava proibida por isso: qualquer número ali ficava a menos de
           um segundo de um dos três. Como esta cena tem três atos e não
           cabe abaixo de 9,7, o primeiro número disponível era 13,9, e
           14,2 pegou esse degrau com folga.

           OS VIZINHOS NÃO PARAM QUIETOS, e é por isso que esta conta se
           refaz COM O ARQUIVO ABERTO, nunca com a lista decorada: o
           card 3 já passou por 12,9, 16,7 e 19,14 no mesmo dia, e o
           card 4 por 11,2, 15,4 e 11,8. Na rodada do gesto do iOS
           (18/08/2026) a leitura deste arquivo era 10,7 / 19,14 / 11,8:
             14,2 / 10,7  = 1,327
             14,2 / 11,8  = 1,203
             19,14 / 14,2 = 1,348
           Nenhum era múltiplo de nenhum e o vizinho mais próximo (o card
           4) estava a 2,4s.

           A CONTA REFEITA, com a dupla no lugar de dois números
           separados: sobraram TRÊS períodos para conferir, 10,7 / 13,64
           / 19,14.
             13,64 / 10,7  = 1,275
             19,14 / 13,64 = 1,403
             19,14 / 10,7  = 1,789
           Nenhum é múltiplo de nenhum, e o vizinho mais próximo (o card
           1) está a 2,94s, mais longe do que este card já esteve de
           qualquer um deles. Os cards 2 e 4 encostam um no outro em
           cheio, e isso deixou de ser defeito no dia em que os dois
           viraram uma cena só. O gesto custou ~200ms a mais que o fade e o
           beat mais a entrada do evento custaram ~1,06s, e como os dois
           couberam inteiros no repouso velho da 'agenda', nem o período
           nem os passos das pontas mudaram: 'saindo' segue aos 11600 e
           'off' aos 12260. Quem recalibrar qualquer um dos quatro refaz
           só esta conta.

           O 140 DO 'sobe' É O DO CARD 4, número por número, e pelo mesmo
           motivo: é o menor valor que ainda deixa um quadro de tile
           vazio antes do movimento. Sem nenhum vazio o celular já
           estaria subindo quando o olho chega, e o "antes" da cena
           desapareceria. Com os 190 do escalonamento de largada (que
           passaram a ser os da dupla inteira, herdados do card 4), são
           330ms do observador acender até o primeiro pixel se mexer,
           contra os 520 de quando este card partia sozinho aos 380.

           OS 1,38s ENTRE O 'off' E O FIM DA VOLTA são o tile vazio antes
           de recomeçar, na mesma faixa dos vizinhos (1,5s no card 1 e
           1,22s no card 3) e iguais aos do card 4, porque agora é a
           mesma volta nos dois. Na cena velha este trecho era
           o único da seção que ainda dizia alguma coisa, porque o
           calendário ficava em cena depois de a mensagem sair; com um
           aparelho só, ele voltou a ser tile vazio como nos outros
           três. */
        2: {
            /* O PERÍODO É COMPARTILHADO COM O CARD 4, e as duas pontas
               também ('sobe' aos 140 e 'saindo' aos 11600). Mexer num
               destes três números sem mexer no de lá tira os dois
               aparelhos de fase, que é o único jeito de quebrar o pedido
               do dono sem quebrar nada na tela. */
            periodo: 13640,
            passos: [
                { t:     0, f: 'off'     },
                { t:   140, f: 'sobe'    },
                { t:  1300, f: 'whats'   },
                { t:  4600, f: 'troca'   },
                { t:  5320, f: 'agenda'  },
                { t:  5820, f: 'arrasta' },
                { t:  7050, f: 'evento'  },
                { t: 11600, f: 'saindo'  },
                { t: 12260, f: 'off'     }
            ]
        },

        /* CARD 3 · o ciclo da reunião.
           A CENA VELHA MOSTRAVA SÓ O MEIO DA HISTÓRIA, em 12,9s e três
           batidas: o convite já pronto com o link, o divisor de dia, e a
           ata. Em 18/08/2026 o dono pediu o ciclo INTEIRO, nos termos
           dele — você PEDE o link, o link É GERADO, o convite é ENVIADO,
           a REUNIÃO ACONTECE, e as notas saem GERADAS no fim. São cinco
           batidas onde havia três, e o argumento de cada corte e de cada
           revogação está no cabeçalho ag3-* da folha e no comentário do
           card no index.html. Aqui fica só o tempo.

           'pedido' põe em cena a bolha VERDE de áudio, que é a encomenda
           do dono. 'tocando' e 'tocado' são a SUB-MÁQUINA DO CARD 1
           trazida para cá em 18/08/2026, quando o dono revogou o "sem
           transcrição, e ela não toca" que este card tinha escrito: a
           onda corre, o cabeçote corre com ela e a transcrição se escreve
           palavra por palavra embaixo; 'tocado' escreve a pose de fim da
           onda e vira o par de vistos para o azul. 'digitando' acende a
           bolha de três pontos da Sofi, que é quem paga o "o link é
           gerado" sem inventar mágica. 'resposta' apaga os pontos no
           lugar e traz a mensagem com o endereço do Meet e a linha dos
           convidados. 'dia' é a DOBRADIÇA: a pílula do divisor entra e o
           ato 1 inteiro sai por opacidade. 'reuniao' traz a janela do
           Meet com a Ana, o assessor e o Lucas dentro. 'encerra' apaga
           a janela. 'ata'
           traz o documento no vão que a janela acabou de desocupar.
           'saindo' apaga a ata e a pílula juntas, no lugar.

           OS NOMES DAS DUAS FASES NOVAS SÃO PRÓPRIOS DE PROPÓSITO. Lá as
           fases se chamam 'ouvindo' e 'ouvido', que é o ponto de vista de
           quem recebe; aqui são 'tocando' e 'tocado'. A família é a
           mesma, e nomes distintos são o que faz quem lê um seletor saber
           em qual das duas máquinas está.

           A TRANSCRIÇÃO NÃO PEDIU FASE NENHUMA, exatamente como no card
           1: o escalonamento das ONZE palavras é propriedade das
           PALAVRAS, não do card. Cada uma carrega o índice no --i e a
           folha calcula o atraso dela. Se virasse fase daqui, o card
           teria onze estados para descrever um gesto só.

           OS SEIS INTERVALOS SÃO O ASSUNTO DO ROTEIRO, e cada um deles é
           uma regra da casa cobrando:

           · 200ms entre a bolha assentar (aos 760, porque a mola leva
             520) e a onda começar (aos 960). Ninguém aperta o play no
             mesmo quadro em que a mensagem aparece. É o número do card 1.
           · 2,06s de onda, dos 960 aos 3020, e são OS MESMOS 2,06s do
             card 1 apesar de o rótulo dizer 0:04 contra o 0:07 de lá. A
             onda não é cronômetro: ela é a batida de cena de que a
             transcrição precisa para se escrever inteira, e o card 1 já
             comprimia sete segundos nela. O que a duração acompanha é o
             TEXTO, não o rótulo — e as duas frases levam uma linha cada.
           · 165ms entre uma palavra e a seguinte. Onze palavras: a última
             larga aos 1650 da onda e assenta aos 1970, ou seja, 90ms
             ANTES de a onda acabar. Transcrição de verdade persegue a
             fala e alcança no fim; uma que terminasse junto leria como
             duas animações amarradas. (No card 1 são oito palavras a
             235ms e a margem é de 95ms — a mesma régua, outra conta.)
           · 900ms entre a onda acabar (aos 3020) e os pontos aparecerem
             (aos 3920). É a folga de gente, e é o número do card 1: o
             outro lado ouviu, entendeu e só então começou a escrever. O
             visto entra dentro dessa folga sem disputar quadro com nada —
             ele começa a virar aos 3220 (180ms depois da onda, o atraso
             mora na FOLHA, na pose da fase 'tocado') e termina aos 3520,
             deixando 400ms de silêncio antes dos pontos. Esses 400 são
             filhos de um filme antigo deste card, em que a virada
             terminava 100ms antes dos pontos e a consequência pisava no
             fim da causa.
           · 1200ms de digitação, dos 3920 aos 5120. É a mesma faixa do
             card 1 (1,28s) e do card 4 (1,42s), e é o único trecho do ato
             1 em que nada acontece além de esperar — que é justamente o
             que faz o outro lado parecer gente.
           · 740ms de pílula SOZINHA em cena, entre o ato 1 acabar de sair
             e a janela do Meet começar a aparecer. Esse número não foi
             escolhido, ele foi MEDIDO e aprovado na montagem anterior
             deste mesmo card, quando o intervalo entre a pílula e a ata
             caiu de 1,4s para 700ms depois do primeiro filme. É o tempo
             em que o corte de cena se lê sem que o palco pareça ter uma
             peça faltando. O palco fica de fato VAZIO por uns 130ms só.
           · 500ms entre a janela do Meet terminar de sair e a ata chegar.
             Consequência pede atraso, e dois gestos no mesmo quadro viram
             um só: a chamada acabou, e SÓ DEPOIS as notas chegam.

           OS DOIS REPOUSOS SÃO CONTEÚDO, NÃO SOBRA:
           · 2,0s com a resposta montada, dos 5640 aos 7640. É o tempo de
             ler o endereço do Meet e a linha dos convidados. A montagem
             anterior dava 2,96s aqui porque a mensagem era a primeira
             coisa da cena; agora ela chega depois de um pedido, de um
             áudio ouvido e de uma digitação, e o olho já está no lugar
             certo quando ela pousa.
           · 4,0s com a ata montada, dos 13280 aos 17280. É o desfecho, e
             são quatro linhas para ler (o que é, quanto durou, e duas
             tarefas com dono). Não há movimento algum pagando o fim da
             história, e é de propósito: quem paga é o tempo.

           A REUNIÃO VIVE 3,54s EM CENA, dos 8720 aos 12260, e a
           alternância da borda azul cobre 2,6s deles. Ela começa 540ms
           depois da entrada, e o número saiu do filme: com 340ms a borda
           acendia enquanto a mola da janela ainda estava assentando, e
           janela em movimento com alguém falando dentro são dois gestos
           no mesmo quadro. São três turnos desiguais — medidos em 670ms,
           870 e 465 —, o último é o mais curto de propósito, e o desenho
           deles está na folha. E são turnos de DUAS pessoas mesmo com
           três ladrilhos em cena desde 20/08/2026: o do meio é o
           assessor, que entrou na chamada mutado, e a borda dele não
           acende em quadro nenhum. Uma reunião parada em cena seria o retrato
           de uma reunião; é a alternância que a faz acontecer, e é o
           análogo exato dos três pontos do ato 1: o estado que DURA
           precisa respirar.

           O PERÍODO SUBIU DE 16,7s PARA 19,14s, e o que ele comprou está
           todo no ato 1: a sub-máquina da onda pôs 200ms de espera, 2,06s
           de áudio tocando e 900ms de folga de gente onde antes havia um
           atraso de visto de 700ms. A resposta, que montava aos 2680,
           monta agora aos 5120 — 2,44s adiante —, e o resto do roteiro
           guarda os intervalos que já tinha, um por um.

           A CONTA DE MÚLTIPLO FECHA COM OS TRÊS VIZINHOS LIDOS DESTE
           ARQUIVO HOJE (10,7 do card 1, 14,2 do card 2 e 11,8 do card 4):
             19,14 / 14,2 = 1,348
             19,14 / 11,8 = 1,622
             19,14 / 10,7 = 1,789
           Nenhum é inteiro, e o vizinho mais próximo (o card 2) está a
           4,94s — bem acima do segundo de distância que o contrato pede.
           Quem recalibrar qualquer um dos quatro refaz só esta conta,
           lendo os períodos deste arquivo e não de memória: o 14,2 do
           card 2 já foi 9,1 na manhã do mesmo dia, e uma lista de cabeça
           vira o retrato de uma seção que não existe mais.

           E ELE CONTINUA SENDO O MAIOR PORQUE A CENA É A MAIS LONGA, não
           porque sobrou tempo: são cinco batidas, um áudio que toca, dois
           repousos de leitura e um corte de cena que precisa de silêncio
           dos dois lados. Os 1,22s entre o 'off' e o fim da volta são o
           tile vazio antes de recomeçar, e são os mesmos de antes, na
           mesma faixa dos vizinhos (1,5s no card 1, 1,94s no card 2,
           1,38s no card 4). A ESCADA DE LARGADA NÃO FOI TOCADA: o
           {0, 380, 760, 190} do LARGADA continua igual. */
        3: {
            periodo: 19140,
            passos: [
                { t:     0, f: 'off'       },
                { t:   240, f: 'pedido'    },
                { t:   960, f: 'tocando'   },
                { t:  3040, f: 'tocado'    },
                { t:  3920, f: 'digitando' },
                { t:  5120, f: 'resposta'  },
                { t:  7640, f: 'dia'       },
                { t:  8720, f: 'reuniao'   },
                { t: 11820, f: 'encerra'   },
                { t: 12760, f: 'ata'       },
                { t: 17280, f: 'saindo'    },
                { t: 17920, f: 'off'       }
            ]
        },

        /* CARD 4 · o resumo da manhã.
           A CENA VELHA ERA UM RELÓGIO ANALÓGICO E TRÊS BARRAS CINZAS, em
           11,2s. Caiu inteira, e por defeito de honestidade nos dois
           lados: as barras eram lorem onde a copy promete "os
           compromissos do dia em ordem de horário, com as prioridades e
           os prazos", e o relógio era a única peça dos quatro tiles que
           não é superfície de produto. A cena nova é UMA MENSAGEM SÓ,
           carregando o dia inteiro, e as fases 'relogio', 'bolha' e 'pe'
           morreram com ela.

           E DEPOIS ELA GANHOU UM APARELHO. Em 18/08/2026, com a
           referência do celular da página Segurança na mão, o dono pediu
           que a cena virasse um CELULAR SUBINDO de baixo do tile, com a
           conversa de WhatsApp aberta dentro dele e a mensagem chegando
           lá. Naquela rodada a mensagem não mudou uma palavra, o que
           mudou foi o lugar dela, e o roteiro ganhou uma fase antes de
           todas as outras. As palavras mudaram no fim do mesmo dia, num
           pedido separado, e o argumento delas está no index.html, ao
           lado da linha: aqui nada depende do texto, só do número de
           linhas, que continua cinco.

           'sobe' traz o aparelho de fora do tile até o lugar, e ele
           entra vazio: uma conversa sem mensagem nenhuma, que é o "antes"
           da cena. 'digitando' acende a bolha de três pontos no canto
           onde a mensagem vai nascer. 'chega' apaga os pontos NO LUGAR e
           põe a mensagem INTEIRA em cena, tudo num gesto só (sobe 7px e
           assenta na mola). 'saindo' apaga o aparelho inteiro no lugar,
           com o dia ainda legível no último quadro visível.

           OS PONTOS SÃO PEDIDO DO DONO E NÃO CONTRADIZEM A REGRA DELE.
           Eles vêm ANTES da mensagem, nunca no lugar do gesto único: a
           mensagem continua chegando pronta, e o que os pontos contam é
           o tempo que a Sofi levou para escrevê-la. É a diferença entre
           mostrar alguém digitando (que o aplicativo faz) e mostrar uma
           mensagem se escrevendo sozinha na tela de quem recebe (que ele
           nunca faz, e que era a cascata enterrada em 18/08/2026).

           A VOLTA INTEIRA ANDOU PARA A ESQUERDA em 18/08/2026, e o
           pedido do dono foi "demora demais para começar". Medido, do
           card aparecer na tela até o celular sair do lugar eram 1442ms,
           e a culpa era de duas somas: 1140 do escalonamento de largada
           (que está lá em cima e foi para 190) e 300 destes passos aqui.
           O 'sobe' foi para 140, que é o menor valor que ainda deixa um
           quadro de tile vazio antes do movimento: sem nenhum vazio o
           celular já estaria subindo quando o olho chega, e o "antes" da
           cena desapareceria. Agora são 330ms até o primeiro pixel se
           mexer, contra 1442.

           E A SAÍDA ANDOU PARA A DIREITA pelo mesmo motivo, 600ms: o
           tile ficava 2,28s vazio entre o aparelho sumir e o seguinte
           subir, que é a mesma espera do começo aparecendo no fim. Com
           'saindo' em 9760 e 'off' em 10420 eram 1,52s, e o repouso ainda
           cresceu de 5,86s para 6,62s. O período não mudou naquela
           rodada, e mudou na seguinte, algumas horas depois.

           A VOLTA INTEIRA VIROU A DO CARD 2, ainda em 18/08/2026, e o
           pedido do dono foi que os dois celulares da seção subissem
           juntos e saíssem juntos. Dois relógios separados não fazem
           isso: mesmo partindo no mesmo instante, o erro de cada
           setTimeout vai somando volta após volta até os dois
           descolarem, e com períodos diferentes eles descolam já na
           segunda. Os dois cards passaram a dividir UM relógio, e quem
           dita as pontas é o card 2, que tem três atos e não cabe em
           menos. Deste roteiro mudaram três números e só eles: 'saindo'
           foi de 9760 para 11600, 'off' de 10420 para 12260 e o período
           de 11,8s para 13,64s. O 'sobe' aos 140 já era o mesmo lá e
           aqui, número por número, desde a rodada do aparelho.

           O QUE ISSO CUSTA É 1,84s A MAIS DE MENSAGEM PARADA EM CENA, e
           o custo cai onde este card sempre teve folga: o repouso foi de
           6,62s para 8,46s. É muito para cinco linhas que se leem em
           três segundos, e é o preço declarado da sincronia, porque a
           alternativa era o contrário — puxar a saída dos dois para os
           9760 daqui e cortar 1,84s do desfecho do card 2, onde o bloco
           do compromisso acabou de pousar na régua das 15:00 e é o que
           paga o título de lá. Entre esticar uma leitura que já
           terminou e cortar uma que mal começou, estica-se a que
           terminou.

           O VÃO VAZIO DO FIM NÃO MUDOU, e é a parte boa da conta: com
           'off' aos 12260 num período de 13640 são os mesmos 1,38s de
           antes, e 1,52s até o aparelho se mexer de novo. A reclamação
           do dono sobre a espera do fim continua respondida, e agora o
           card 2 também a respeita, porque encolheu o vão dele de 1,94s
           para os mesmos 1,38s.

           OS DOIS INSTANTES DEPOIS DA SUBIDA ANDARAM 280ms, e o motivo
           está na folha: a curva da subida foi refeita para o dono, e ela
           passou de 0,78s para 1,05s. A relação que os prende é a mesma
           de antes, e é ela que se preserva: os pontos entram 110ms
           DEPOIS de o aparelho parar, nunca durante. Aparelho ainda em
           movimento com bolha nascendo dentro dele são dois gestos no
           mesmo quadro, e o olho não sabe qual dos dois é o assunto.

           O PERÍODO SEGUIA EM 11,8s e quem pagou os 280ms foi o repouso,
           que caiu de 6,14s para 5,86s. É o mesmo lugar de onde saiu o
           tempo dos pontos, e pelo mesmo motivo: é o único trecho da
           volta que existe com folga, e 5,8s continuam sendo mais que o
           dobro do tempo de leitura das cinco linhas.

           1,42s DE PONTOS, dos 1460 aos 2880. Menos que isso não dá
           tempo de o olho ver o pisca escalonado e a peça vira lampejo;
           mais que isso e a cena passa a esperar em vez de contar. É a
           mesma faixa do card 1, que segura os pontos dele por 1,28s.

           O PERÍODO NÃO MUDOU, e a conta é essa: os 1,42s da fase nova
           saíram do REPOUSO, que caiu de 7,56s para 6,14s. Não havia
           motivo para esticar a volta, porque o repouso é o único trecho
           da cena que existia com folga, e 6,1s continuam sendo mais do
           que o dobro do tempo de leitura das cinco linhas. Manter os
           11,8s também poupa a conta de múltiplo, que já estava fechada
           com os três vizinhos.

           A ORDEM DOS TRÊS FATOS É A FRASE DO CARD, e os intervalos são
           o que a sustenta. O aparelho parte aos 300 e assenta aos 1080
           (780ms de viagem). Os pontos entram aos 1180, 100ms depois de
           ele assentar: é pouco de propósito, porque quem começa a
           escrever do outro lado não espera a mão de ninguém, mas não é
           zero, porque no mesmo quadro os dois fatos viram um só. A
           mensagem chega aos 2600 e assenta aos 3020. Um aparelho que
           subisse já com a mensagem dentro entregaria tudo no mesmo
           quadro, e aí a mensagem deixaria de ser um acontecimento para
           virar parte da mobília. O celular chega, a conversa está lá
           vazia, alguém começa a escrever, e ENTÃO o resumo da manhã
           cai.

           A MENSAGEM CHEGAVA LINHA POR LINHA E O DONO MANDOU CHEGAR
           PRONTA, em 18/08/2026, e a régua que decidiu é a que o card 1
           desta mesma seção já tinha por escrito: mensagem de WhatsApp
           não se monta linha por linha na tela de quem recebe, ela
           aparece pronta. A cascata (chega em 53px, l1 78, l2 101, l3
           124, com atrasos desiguais de 360 e 260ms) veio de briefing e
           era bonita, e era a gramática de IA com streaming, que é
           exatamente o que a seção inteira veio matar. As fases 'l1',
           'l2' e 'l3' morreram com ela, e as linhas deixaram de ter
           entrada própria no CSS: a bolha é UM objeto, como no app.

           O TILE VAZIO ANTES DE TUDO continua sendo o "antes" que dá
           peso ao "depois": 300ms de nada, o aparelho subindo por 780 e
           a conversa vazia por mais 100 até os pontos acenderem. Nenhum
           desses trechos é pose, os três são transitórios.

           O PERÍODO ERA 11,8s, pelo motivo que este card sempre teve: o assunto é o dia chegar
           pronto e FICAR lá te esperando, então os 6,14s de cena montada
           são conteúdo e não sobra. É neles que se leem as cinco linhas.
           O argumento continua de pé com a dupla, e agora com folga
           sobrando em vez de faltando: a cena montada passou a durar
           8,46s.
           11,8 / 10,7 dá 1,103, então não é múltiplo do card 1, e fica
           1,1s longe dele.

           E AQUI VAI A INCERTEZA DECLARADA, porque ela é do dia em que
           isto foi escrito: os cards 2 e 3 estavam sendo reescritos NO
           MESMO MOMENTO por outras mãos. Quando este número foi
           escolhido os vizinhos eram 10,7 / 9,6 / 8,3, e 11,8 nasceu
           fora desse intervalo inteiro, que era a única aposta segura
           contra dois números que ainda iam mudar. Eles mudaram, e no
           fim da tarde a lista era 10,7 / 9,1 / 12,9: o card 3 passou
           por cima do 11,8 e o intervalo deixou de ser um argumento. O
           card 2 mudou outra vez em 18/08/2026 e foi para 14,2, e o card 3
           foi para 16,7 no mesmo dia, o que levou este a ser o segundo
           mais curto dos quatro. O que sobrou, e sobrevive a todas essas
           rodadas, era a conta de múltiplo: 16,7/11,8 = 1,415, 11,8/10,7 =
           1,103, 14,2/11,8 = 1,203. Nenhum era múltiplo de outro e o vizinho
           mais próximo estava a 1,1s.

           E ELA DEIXOU DE SER CONTA DESTE CARD no fim do mesmo dia. Com
           a dupla, o período daqui não se escolhe mais: ele é o do card
           2, e o que sobra para conferir são três números, escritos por
           inteiro lá. Quem recalibrar este card recalibra o vizinho no
           mesmo gesto, ou os dois aparelhos param de subir juntos. */
        4: {
            /* PERÍODO E PONTAS SÃO DO CARD 2, e é o que põe os dois
               aparelhos em fase. Os três números que este card não
               escolhe sozinho são 13640, o 'sobe' aos 140 e o 'saindo'
               aos 11600: qualquer um deles editado aqui e não lá tira os
               celulares de sincronia. Os passos DE DENTRO ('digitando' e
               'chega') continuam sendo assunto só desta cena. */
            periodo: 13640,
            passos: [
                { t:     0, f: 'off'       },
                { t:   140, f: 'sobe'      },
                { t:  1300, f: 'digitando' },
                { t:  2720, f: 'chega'     },
                { t: 11600, f: 'saindo'    },
                { t: 12260, f: 'off'       }
            ]
        }
    };

    /* Escalonamento da PARTIDA. Sem isso os quatro relógios
       nascem no mesmo quadro e, apesar dos períodos diferentes,
       a primeira volta (a única que muita gente vê) sai em
       coro.

       O CARD 4 SAIU DO FIM DA ESCADA em 18/08/2026, de 1140 para 190, e
       o pedido do dono foi "demora demais para começar". A medida dava
       razão a ele: do card aparecer na tela até o celular começar a
       subir eram 1442ms medidos, e 1140 deles eram esta linha. Uma
       ilustração que fica um segundo e meio parada depois de aparecer
       não lê como animação atrasada, lê como animação quebrada.

       E A ESCADA CONTINUA SENDO ESCADA: 0 / 380 / 760 / 190 não tinha dois
       números iguais, e o card 4 passou a ser o SEGUNDO a partir, a
       190ms do card 1 e a 190 do card 2. O que a regra proíbe é nascer
       no mesmo quadro, e 190ms são doze quadros. A ordem da escada nunca
       foi o argumento, o espaçamento é.

       A ESCADA PASSOU A TER TRÊS DEGRAUS, 0 / 190 / 760, no fim do mesmo
       dia: os cards 2 e 4 viraram uma máquina só e partem no MESMO
       quadro, que é o pedido do dono. Nascer junto continua proibido
       para o que é cena separada, e os dois aparelhos deixaram de ser
       cena separada — o defeito que a regra evita é o olho ler duas
       coisas distintas como uma; aqui as duas SÃO uma, e a leitura certa
       é justamente essa. O 190 da dupla é o que o card 4 já tinha, e é
       ele que segura a reclamação de "demora demais para começar": o
       card 2 partia aos 380 e ganhou 190ms com a mudança.

       Fora da dupla nada mudou: o card 1 continua abrindo em 0 e o card
       3 fechando em 760, a 570ms da dupla. */
    const LARGADA = { 1: 0, 3: 760 };

    /* ---------------------------------------------------------
       A DUPLA
       ---------------------------------------------------------
       OS DOIS CARDS COM APARELHO SÃO UMA MÁQUINA SÓ. Pedido do dono
       em 18/08/2026: os celulares do card 2 (o Google Agenda) e do
       card 4 (o resumo da manhã) sobem juntos e saem juntos.

       A SINCRONIA NÃO É COISA DE CSS. As duas subidas já eram a
       MESMA, número por número, desde que o card 2 copiou a entrada do
       card 4: 250px abaixo do lugar, 1,05s na mesma curva, 0,58s de
       opacidade, e a saída é o mesmo apagar de 0,46s nos dois. O que
       os separava era só o relógio, e por isso a sincronia se resolve
       aqui e não uma linha na folha.

       POR QUE UMA MÁQUINA E NÃO DUAS COM O MESMO NÚMERO. Dois relógios
       de setTimeout com o mesmo período partem juntos e vão
       descolando: cada volta se reagenda a partir do instante em que a
       anterior REALMENTE disparou, o navegador entrega cada uma com
       alguns milissegundos de atraso, e esse erro é próprio de cada
       cadeia e não se cancela. Em alguns minutos de página aberta a
       diferença chega a quadros visíveis, e um aparelho começa a subir
       depois do outro. Com uma cadeia só de timers escrevendo o
       data-fase dos dois cards, os dois recebem a fase na mesma tarefa
       e o compositor pinta as duas subidas no mesmo quadro, para
       sempre.

       O QUE CADA CARD MANTÉM É O MIOLO. A máquina não funde os
       roteiros: cada card continua com a lista de passos dele, e o que
       eles passaram a ter em comum são o período e as duas pontas
       (o 'sobe' aos 140 e o 'saindo' aos 11600). Entre uma ponta e a
       outra o card 2 troca de aplicativo e o card 4 recebe a mensagem,
       cada um no tempo da cena dele.
       --------------------------------------------------------- */
    const DUPLA = ['2', '4'];
    const LARGADA_DUPLA = 190;

    /* A fase de repouso montado, por card. Vale para
       prefers-reduced-motion e para navegador sem
       IntersectionObserver que caia aqui sem relógio. */
    const MONTADO = { 1: 'montado', 2: 'montado', 3: 'montado', 4: 'montado' };

    /* ---------------------------------------------------------
       O RELÓGIO
       ---------------------------------------------------------
       Um por MÁQUINA, e uma máquina rege um card ou dois: os cards
       1 e 3 têm o deles, os cards 2 e 4 dividem o mesmo (ver o
       bloco A DUPLA). Toda a volta é agendada de uma vez com
       setTimeout e os ids ficam guardados: dormir é limpar a
       lista e voltar para 'off'. Não há rAF aqui porque não há
       nada a interpolar quadro a quadro — quem interpola é o
       compositor, a partir das transições da folha. É a mesma
       disciplina do resto do site: o JS escreve estado, o CSS
       desenha o caminho entre estados.

       CADA ITEM É UM PAR {card, roteiro}. Com dois itens, os passos
       dos dois roteiros entram na MESMA cadeia de timers: os que
       caem no mesmo instante são escritos na mesma tarefa, e o
       navegador pinta os dois cards no mesmo quadro. É isso, e só
       isso, que põe os dois aparelhos em fase.
       --------------------------------------------------------- */
    function relogio(itens, atrasoDeLargada) {
        const timers = [];
        let ligado = false;

        /* Os períodos dos itens de uma máquina TÊM de ser iguais, e
           é no roteiro de cada um que isso está escrito. O máximo é
           só a rede: se alguém editar um e esquecer o outro, os dois
           saem de fase (não há conserto para isso aqui), mas ao menos
           a volta mais longa continua cabendo inteira em vez de ser
           cortada no meio pelo recomeço. */
        const periodo = itens.reduce((a, it) => Math.max(a, it.roteiro.periodo), 0);

        function pousa(fase) {
            itens.forEach((it) => { it.card.dataset.fase = fase; });
        }

        function volta() {
            itens.forEach((it) => {
                it.roteiro.passos.forEach((p) => {
                    timers.push(setTimeout(() => { it.card.dataset.fase = p.f; }, p.t));
                });
            });
            timers.push(setTimeout(volta, periodo));
        }

        function limpa() {
            timers.forEach(clearTimeout);
            timers.length = 0;
        }

        return {
            ativo() { return ligado; },
            liga() {
                if (ligado) return;
                ligado = true;
                /* A volta SEMPRE começa do zero, nunca emenda no meio.
                   Rolar de volta para a seção e pegar a pílula já verde
                   é pegar o fim de uma história que não se viu. */
                pousa('off');
                timers.push(setTimeout(volta, atrasoDeLargada));
            },
            desliga() {
                if (!ligado) return;
                ligado = false;
                limpa();
                pousa('off');
            }
        };
    }

    /* ---------------------------------------------------------
       MONTAGEM
       --------------------------------------------------------- */
    const maquinas = [];

    function monta(itens, atraso) {
        if (!itens.length) return;
        maquinas.push({ itens: itens, m: relogio(itens, atraso), espera: null });
    }

    /* Os cards da dupla são recolhidos e montados JUNTOS, no fim. A
       ordem do DOM não entra nesta conta: a seção já trocou os cards de
       lugar uma vez (a ordem virou 1, 2, 4, 3 em 18/08/2026) e nada aqui
       lê ordem de irmãos, só o data-ag. */
    const dupla = [];

    cards.forEach((card) => {
        const n = card.dataset.ag;
        const roteiro = ROTEIROS[n];
        if (!roteiro) return;
        if (DUPLA.indexOf(n) !== -1) dupla.push({ card: card, roteiro: roteiro });
        else monta([{ card: card, roteiro: roteiro }], LARGADA[n] || 0);
    });

    monta(dupla, LARGADA_DUPLA);

    function montaParado() {
        maquinas.forEach((x) => {
            esquece(x);
            x.m.desliga();
            x.itens.forEach((it) => {
                it.card.dataset.fase = MONTADO[it.card.dataset.ag] || 'montado';
            });
        });
    }

    /* O observador olha CADA CARD, não a seção. Empilhada no
       celular a seção passa de 1600px de altura: com um
       observador só, o último da coluna já estaria rodando (e
       gastando) três telas antes de aparecer, e o card 1
       continuaria rodando muito depois de sair por cima. O último
       era o card 4 e passou a ser o card 3 na troca de
       18/08/2026, quando a ordem do DOM virou 1, 2, 4, 3. Para o
       observador isso não é notícia: ele observa os quatro, um a
       um, e nunca soube qual é o último.

       Dois limiares, como o palco da promessa: acende em 0,25
       (tem palco suficiente na tela para a cena valer a pena) e
       só apaga quando o card sai INTEIRO, para não congelar um
       quadro no meio com metade do desenho ainda à vista. */
    let observador = null;

    /* A PACIÊNCIA DA DUPLA, e ela existe por causa de um defeito que a
       sincronia trouxe junto. Com dois cards numa máquina só, a partida
       espera os DOIS estarem na tela: sem isso, quem rola de cima pega o
       card 2 acendendo no fim da primeira fileira e o aparelho do card 4
       subindo lá embaixo, fora do campo de visão, e a primeira volta (a
       única que muita gente vê) entrega os dois já de pé em vez das duas
       subidas juntas, que é o que o dono pediu.

       Só que esperar os dois tem o defeito espelhado: quem PARA de rolar
       com a primeira fileira na tela e a segunda ainda embaixo ficaria
       olhando um tile cinza vazio ao lado do card 1 animando. Daí o
       teto: 1s depois de o primeiro dos dois acender, a máquina parte de
       qualquer jeito. Rolagem normal atravessa esse vão em bem menos que
       isso e a subida sai sincronizada na tela; parada em cima da
       fronteira, a cena começa e o segundo card entra no meio da volta
       corrente — e a partir da volta seguinte os dois estão em fase para
       sempre, porque é o mesmo relógio. O custo do teto é no máximo uma
       volta do segundo card, e o custo de não ter teto seria um tile
       morto por tempo indeterminado.

       O 1s SAIU DA RECLAMAÇÃO DO DONO SOBRE A ESPERA DO COMEÇO, medida
       naquele dia em 1442ms do card aparecer até o primeiro pixel se
       mexer. Somados os 190 da largada e os 140 do 'sobe', o pior caso
       desta espera dá 1330ms, ou seja, fica abaixo do número que já foi
       reprovado uma vez. E o pior caso é só o de quem estaciona a
       rolagem em cima da fronteira: com os dois cards na tela, os 330ms
       de sempre.

       O MESMO TETO COBRE A TELA MUITO BAIXA, de graça: medido nesta
       página, os dois cards precisam de 252px de altura de janela para
       caberem com 0,25 cada um à mostra no desktop e 237px no celular,
       então "os dois na tela" acontece em qualquer janela de gente. Numa
       janela mais curta que isso a espera nunca se cumpriria, e é a
       paciência que impede a seção de ficar parada. */
    const PACIENCIA = 1000;

    /* Quanto do card está na vertical da janela, de 0 a 1. É a mesma
       conta que o visibilitychange sempre fez, agora com um nome, porque
       a decisão passou a ser de MÁQUINA e não de card: com dois cards
       numa máquina, não dá para responder olhando uma entrada do
       observador de cada vez. O observador virou o gatilho, e quem
       decide é esta conta, lida na hora para os itens todos. */
    function fatia(card) {
        const r = card.getBoundingClientRect();
        if (!r.height) return 0;
        const alt = window.innerHeight || document.documentElement.clientHeight;
        const dentro = Math.min(r.bottom, alt) - Math.max(r.top, 0);
        return dentro > 0 ? dentro / r.height : 0;
    }

    function esquece(x) {
        if (!x.espera) return;
        clearTimeout(x.espera);
        x.espera = null;
    }

    /* Acende quando TODOS os cards da máquina têm 0,25 na tela, apaga
       quando NENHUM deles tem um pixel nela, e arma a paciência no meio
       do caminho. Para as máquinas de um card só, "todos" e "algum" são
       a mesma coisa e a paciência nunca chega a ser armada: o contrato
       delas é o de sempre, letra por letra. */
    function decide() {
        maquinas.forEach((x) => {
            let algum = false;
            let todos = true;
            let nenhum = true;
            x.itens.forEach((it) => {
                const f = fatia(it.card);
                if (f >= 0.25) algum = true; else todos = false;
                if (f > 0) nenhum = false;
            });
            if (todos) {
                esquece(x);
                x.m.liga();
            } else if (algum) {
                if (!x.espera && !x.m.ativo()) {
                    x.espera = setTimeout(() => { x.espera = null; x.m.liga(); }, PACIENCIA);
                }
            } else if (nenhum) {
                esquece(x);
                x.m.desliga();
            }
        });
    }

    function ligaObservador() {
        if (observador || !('IntersectionObserver' in window)) return;
        observador = new IntersectionObserver(() => { decide(); }, { threshold: [0, 0.25] });
        maquinas.forEach((x) => x.itens.forEach((it) => observador.observe(it.card)));
    }

    function desligaObservador() {
        if (!observador) return;
        observador.disconnect();
        observador = null;
    }

    function aplica() {
        if (calmo.matches) {
            desligaObservador();
            montaParado();
            return;
        }
        if (!('IntersectionObserver' in window)) {
            /* Sem observador não há como saber quando parar, e um
               relógio eterno é pior que nenhum: entrega montado. */
            montaParado();
            return;
        }
        ligaObservador();
    }

    aplica();

    /* Trocar a preferência no sistema não deveria pedir recarga. */
    if (calmo.addEventListener) calmo.addEventListener('change', aplica);
    else if (calmo.addListener) calmo.addListener(aplica);

    /* Aba escondida não precisa de quatro relógios rodando. Ao
       voltar, o observador reacende sozinho quem está na tela,
       e cada volta recomeça do zero. */
    document.addEventListener('visibilitychange', () => {
        if (calmo.matches) return;
        if (document.hidden) maquinas.forEach((x) => { esquece(x); x.m.desliga(); });
        else decide();
    });
});


/* --- cobranca.js --- */

/* A cena da cobrança: o pedido do usuário já entra digitado (12/09/2026, pedido
   do dono — antes era letra a letra com caret) e a equipe responde
   no mesmo aparelho, passo a passo (is-vista). "Digitando" só fica visível no
   próprio passo. A conversa acompanha a última mensagem (rolagem própria em
   JS: a tela é overflow:hidden para o toque não rolar nem prender a página). Roda em
   loop enquanto a seção está na tela; some da tela ou da aba, para (aba em
   segundo plano estrangula timers e soltaria tudo em rajada); com "reduzir
   movimento" mostra a cena final parada e não anima. */
(function () {
    var cena = document.getElementById('cobCena');
    var pedido = document.getElementById('cobPedido');
    if (!cena || !pedido) return;
    var conversa = document.getElementById('cobConversa');
    var botao = document.getElementById('cobBotao');
    var card = cena.querySelector('.cob-card');
    var msgs = [].slice.call(cena.querySelectorAll('.cob-msg'));
    var balaoPedido = pedido.closest('.cob-msg');
    var FRASE = pedido.dataset.texto || pedido.textContent;
    var reduz = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var timers = [];
    var daqui = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var limpa = function () { timers.forEach(clearTimeout); timers = []; };

    /* A conversa é overflow:hidden (o visitante não rola nem prende a rolagem
       da página no toque); quem a leva até a última mensagem é esta animação. */
    var rolagem = null;
    function pararRolagem() { if (rolagem) { cancelAnimationFrame(rolagem); rolagem = null; } }
    function acompanhar() {
        if (!conversa) return;
        pararRolagem();
        var alvo = conversa.scrollHeight - conversa.clientHeight, de = conversa.scrollTop, delta = alvo - de;
        if (reduz || Math.abs(delta) < 1) { conversa.scrollTop = alvo; return; }
        var t0 = null, DUR = 420;
        rolagem = requestAnimationFrame(function quadro(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
            conversa.scrollTop = de + delta * e;
            rolagem = p < 1 ? requestAnimationFrame(quadro) : null;
        });
    }
    function passo(n) {
        msgs.forEach(function (m) {
            var p = +m.dataset.passo, digitando = m.classList.contains('typing-indicator');
            m.classList.toggle('is-vista', digitando ? p === n : p <= n);
        });
        if (n >= 10) { card.classList.add('is-pago'); botao.textContent = 'Pago ✓'; }
        acompanhar();
    }
    function zera() {
        limpa();
        cena.classList.add('is-mudo');
        cena.classList.remove('is-descendo');
        msgs.forEach(function (m) { m.classList.remove('is-vista'); });
        pedido.textContent = FRASE; balaoPedido.classList.add('is-enviada');
        card.classList.remove('is-pago'); botao.textContent = 'Pagar agora';
        pararRolagem();
        if (conversa) conversa.scrollTop = 0;
        void cena.offsetWidth;
        cena.classList.remove('is-mudo');
    }
    /* Marcas em ms, contadas da entrada da mensagem (mais 600ms de respiro). */
    var ROTEIRO = [
        [900,   function () { passo(2); }],
        [2200,  function () { passo(3); }],
        [3100,  function () { passo(4); }],
        [4500,  function () { passo(5); }],
        [5800,  function () { passo(6); }],
        [6500,  function () { passo(7); }],
        [9700,  function () { passo(9); }],
        [10900, function () { passo(10); }],
        [15100, function () { cena.classList.add('is-descendo'); }],
        [16000, function () { ciclo(); }]
    ];
    var rodando = false, naTela = false;
    function ciclo() {
        rodando = true; zera();
        /* A mensagem entra pronta (já digitada, com o visto) e o roteiro parte dela:
           900ms depois o Martin aparece digitando. */
        daqui(500, function () { passo(1); ROTEIRO.forEach(function (r) { daqui(600 + r[0], r[1]); }); });
    }
    function para() { rodando = false; limpa(); }
    window.__cobPasso = passo; window.__cobParar = para; window.__cobCiclo = ciclo; /* ganchos de verificação; inofensivos */

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { if (rodando) para(); }
        else if (naTela && !rodando && !reduz) ciclo();
    });

    if (reduz) { pedido.textContent = FRASE; balaoPedido.classList.add('is-enviada'); passo(10); return; }
    if (!('IntersectionObserver' in window)) { ciclo(); return; }
    new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
            naTela = en.isIntersecting;
            if (naTela && !rodando && !document.hidden) ciclo();
            if (!naTela && rodando) para();
        });
    }, { threshold: 0.35 }).observe(cena);
})();


/* --- embaixadores.js --- */

/* Embaixadores: uma fala por vez, os cinco rostos como abas. Avança sozinho a
   cada 6s, para com o mouse em cima, fora da tela e com "reduzir movimento".
   Setas e arrasto trocam. SEM SCRIPT a seção mostra as cinco falas empilhadas
   (o CSS cuida disso): este arquivo só liga o palco (is-js) quando de fato
   consegue cuidar dele. */
(function () {
    var palco = document.getElementById('embPalco');
    if (!palco) return;
    var falas = [].slice.call(palco.querySelectorAll('.emb-fala'));
    var botoes = [].slice.call(palco.querySelectorAll('.emb-pessoa'));
    if (!falas.length || falas.length !== botoes.length) return;

    var DURACAO = 6000;
    var reduz = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var atual = 0, timer = null, mouseEmCima = false, naTela = true;

    function armar() {
        clearTimeout(timer);
        if (reduz || mouseEmCima || !naTela) return;
        timer = setTimeout(function () { mostrar(atual + 1); }, DURACAO);
    }
    function mostrar(i) {
        atual = (i + falas.length) % falas.length;
        falas.forEach(function (f, k) { f.classList.toggle('is-ativa', k === atual); });
        botoes.forEach(function (b, k) {
            var ativo = k === atual;
            b.classList.toggle('is-ativa', ativo);
            b.setAttribute('aria-selected', ativo ? 'true' : 'false');
            b.tabIndex = ativo ? 0 : -1;
        });
        armar();
    }

    botoes.forEach(function (b, k) { b.addEventListener('click', function () { mostrar(k); }); });
    palco.addEventListener('mouseenter', function () { mouseEmCima = true; clearTimeout(timer); });
    palco.addEventListener('mouseleave', function () { mouseEmCima = false; armar(); });
    palco.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(atual + 1); botoes[atual].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(atual - 1); botoes[atual].focus(); }
    });
    var x0 = null;
    palco.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    palco.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) mostrar(atual + (dx < 0 ? 1 : -1));
    }, { passive: true });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entradas) {
            entradas.forEach(function (en) { naTela = en.isIntersecting; if (naTela) armar(); else clearTimeout(timer); });
        }, { threshold: 0.3 }).observe(palco);
    }

    palco.classList.add('is-js');
    mostrar(0);
})();


/* --- dia2.js --- */

/* Um dia normal, v2 (12/09/2026): UM palco só que avança sozinho, no lugar
   das cinco telas de rolagem. A lista da esquerda (desktop) e a linha do
   tempo (celular) apontam o momento ativo; a cena correspondente (.dia2-cena)
   acende e as peças — notificação, áudio, bolhas — entram por CSS, disparadas
   pela classe is-ativa. Avança a cada DUR ms enquanto a seção está na tela e
   a aba visível (aba em segundo plano estrangula timers e soltaria tudo em
   rajada); clicar num momento salta para ele e reinicia a contagem. Com
   "reduzir movimento" não avança sozinho: fica no momento escolhido. */
(function () {
    var sec = document.getElementById('diaSection');
    if (!sec || !sec.classList.contains('dia2-section')) return;
    var itens = [].slice.call(sec.querySelectorAll('.dia2-item'));
    var cenas = [].slice.call(sec.querySelectorAll('.dia2-cena'));
    var marcos = [].slice.call(sec.querySelectorAll('.dia2-marco'));
    var legendas = [].slice.call(sec.querySelectorAll('.dia2-legenda-item'));
    var N = cenas.length;
    if (!N) return;
    var DUR = 4600;
    var reduz = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var atual = 0, timer = null, visivel = false;
    sec.classList.add('is-js');

    function marcar(lista, n, classe) {
        lista.forEach(function (el, i) {
            el.classList.toggle(classe, i === n);
            el.classList.toggle('is-passado', i < n);
        });
    }
    function ir(n, reiniciar) {
        n = ((n % N) + N) % N;
        if (n === atual && reiniciar) {
            /* mesma cena: tira e devolve a classe para a barra e as peças recomeçarem do zero */
            if (itens[n]) itens[n].classList.remove('is-ativo');
            cenas[n].classList.remove('is-ativa');
            void sec.offsetWidth;
        }
        atual = n;
        marcar(itens, n, 'is-ativo');
        marcar(cenas, n, 'is-ativa');
        marcar(marcos, n, 'is-ativo');
        marcar(legendas, n, 'is-ativo');
        itens.forEach(function (li, i) { li.setAttribute('aria-current', i === n ? 'true' : 'false'); });
    }
    function limpa() { if (timer) { clearTimeout(timer); timer = null; } }
    function agendar() {
        limpa();
        if (reduz || !visivel || document.hidden) return;
        timer = setTimeout(function () { ir(atual + 1); agendar(); }, DUR);
    }
    function pausar() { limpa(); sec.classList.add('is-pausado'); }
    function retomar() { sec.classList.remove('is-pausado'); ir(atual, true); agendar(); }

    itens.forEach(function (li) {
        var botao = li.querySelector('.dia2-botao');
        if (botao) botao.addEventListener('click', function () { ir(+li.getAttribute('data-ato') - 1, true); agendar(); });
    });
    marcos.forEach(function (m) {
        m.addEventListener('click', function () { ir(+m.getAttribute('data-ato') - 1, true); agendar(); });
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (ents) {
            ents.forEach(function (e) {
                visivel = e.isIntersecting;
                if (visivel && !document.hidden) retomar(); else pausar();
            });
        }, { threshold: 0.3 }).observe(sec);
    } else { visivel = true; retomar(); }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pausar(); else if (visivel) retomar();
    });

    /* ganchos de verificação */
    window.__dia2Ir = function (n) { pausar(); ir(n - 1, true); };
    window.__dia2Parar = pausar;
    window.__dia2Rodar = retomar;
})();


/* --- ben2.js --- */

/* Benefícios v2 (12/09/2026): três cards, cada um com uma mini-cena em loop —
   link de pagamento → pago; nota emitida → PDF no WhatsApp; venda no cartão →
   D+2 na conta. Os passos são classes cumulativas is-p1..is-p4 na .ben2-cena
   e o CSS faz as transições; o valor da conta é contado aqui (rAF). Os três
   cards partem com um pequeno escalonamento para não se moverem em uníssono.
   Roda enquanto a seção está na tela e a aba visível; com "reduzir movimento"
   mostra a cena final parada. No celular os cards deslizam (scroll-snap) e os
   pontos seguem o card à vista. */
(function () {
    var sec = document.getElementById('beneficiosSection');
    if (!sec || !sec.classList.contains('ben2-section')) return;
    var cenas = [].slice.call(sec.querySelectorAll('.ben2-cena'));
    if (!cenas.length) return;
    var reduz = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var ROTEIRO = {
        link:  [[0, 1], [1300, 2], [3000, 3], [3350, 4]],
        nota:  [[0, 1], [1300, 2], [2600, 3], [3600, 4]],
        caixa: [[0, 1], [1200, 2], [3000, 3]]
    };
    var FIM = 7300, CICLO = 8000, ESCALA = 450;
    var timers = [], visivel = false, contagem = null;

    function daqui(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function limpa() {
        timers.forEach(clearTimeout); timers = [];
        if (contagem) { cancelAnimationFrame(contagem); contagem = null; }
    }
    function moeda(v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function contar(cena) {
        var el = cena.querySelector('.bn2-conta-valor');
        if (!el) return;
        var alvo = +el.getAttribute('data-valor') || 0;
        if (reduz) { el.textContent = moeda(alvo); return; }
        var t0 = null, DUR = 900;
        contagem = requestAnimationFrame(function q(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
            el.textContent = moeda(alvo * e);
            contagem = p < 1 ? requestAnimationFrame(q) : null;
        });
    }
    function passo(cena, n) {
        for (var i = 1; i <= 4; i++) cena.classList.toggle('is-p' + i, i <= n);
        if (cena.getAttribute('data-cena') === 'caixa') {
            var el = cena.querySelector('.bn2-conta-valor');
            if (n >= 3) contar(cena); else if (el) el.textContent = moeda(0);
        }
    }
    function ultimo(cena) { var r = ROTEIRO[cena.getAttribute('data-cena')] || [[0, 0]]; return r[r.length - 1][1]; }
    function ciclo() {
        limpa();
        cenas.forEach(function (cena, i) {
            var r = ROTEIRO[cena.getAttribute('data-cena')] || [], atraso = i * ESCALA;
            passo(cena, 0);
            r.forEach(function (m) { daqui(atraso + m[0], function () { passo(cena, m[1]); }); });
            daqui(atraso + FIM, function () { passo(cena, 0); });
        });
        daqui(CICLO + (cenas.length - 1) * ESCALA, ciclo);
    }
    function parar() { limpa(); }
    function rodar() {
        if (reduz) { cenas.forEach(function (c) { passo(c, ultimo(c)); }); return; }
        ciclo();
    }
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (ents) {
            ents.forEach(function (e) {
                visivel = e.isIntersecting;
                if (visivel && !document.hidden) rodar(); else parar();
            });
        }, { threshold: 0.25 }).observe(sec);
    } else { visivel = true; rodar(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) parar(); else if (visivel) rodar(); });

    /* pontos do carrossel (celular): o card com 60% à vista acende o ponto dele */
    var pontos = [].slice.call(sec.querySelectorAll('.ben2-ponto'));
    var cards = [].slice.call(sec.querySelectorAll('.ben2-card'));
    var grade = sec.querySelector('.ben2-grade');
    if (pontos.length && grade && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (ents) {
            ents.forEach(function (e) {
                if (!e.isIntersecting) return;
                var i = cards.indexOf(e.target);
                pontos.forEach(function (p, k) { p.classList.toggle('is-ativo', k === i); });
            });
        }, { root: grade, threshold: 0.6 });
        cards.forEach(function (c) { io.observe(c); });
    }

    /* ganchos de verificação */
    window.__ben2Passo = function (k, n) { parar(); passo(cenas[k], n); };
    window.__ben2Parar = parar;
    window.__ben2Rodar = rodar;
})();


/* --- rastro.js --- */

/* Rastro do site — paridade total com o site anterior (incorporado lá em 09/08/2026).

   BLOCO 1 — Cupom do influenciador: meuassessor.com?cupom=MARCOS10 viaja até o
   checkout. Guarda por 7 dias e decora todo link para o /assinar no CLIQUE com
   cupom + fbclid + gclid/gbraid/wbraid (Google Ads, 14/09/2026) + utm_* da visita (roda em fase de captura, ANTES do handler
   de analytics que lê o href decorado).

   BLOCO 2 — Eventos de intenção Meta/GA4: ViewContent/view_item quando a seção
   de preço (#planos) fica 45% visível; InitiateCheckout/begin_checkout no
   clique de qualquer link do /assinar (eventID único por pageview — cliques
   repetidos não inflam o IC); pricing_cta_click; login_click; whatsapp_click
   com Contact (Meta). Seletores sem alvo na página viram no-op. */

/* BLOCO 0 — Navegação local (file://): sem servidor não existem as URLs
   limpas do Firebase (cleanUrls), então os links internos absolutos são
   reescritos para os arquivos .html correspondentes, como o site anterior
   fazia. Em produção (http/https) este bloco não faz nada. */
(function () {
    if (window.location.protocol !== 'file:') return;
    var raiz = window.location.href.includes('/pages/')
        ? window.location.href.split('/pages/')[0] + '/'
        : window.location.href.replace(/\/[^/]*$/, '/');
    var LEGADOS = {
        '/suporte': 'pages/suporte/index.html',
        '/politica-de-privacidade': 'pages/politica-de-privacidade/index.html',
        '/termos-de-uso': 'pages/termos-de-uso/index.html'
    };
    document.querySelectorAll('a[href]').forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '/' || href.charAt(1) === '/') return;
        var partes = href.split('#');
        var caminho = partes[0];
        var ancora = partes.length > 1 ? '#' + partes.slice(1).join('#') : '';
        var local;
        if (LEGADOS[caminho]) local = LEGADOS[caminho];
        else if (caminho === '/') local = 'index.html';
        else {
            var m = caminho.match(/^\/pages\/(.+)$/);
            local = m ? 'pages/' + m[1] + '/index.html' : caminho.slice(1) + '.html';
        }
        link.setAttribute('href', raiz + local + ancora);
    });
})();

(function () {
    var SETE_DIAS = 7 * 24 * 60 * 60 * 1000;
    var daUrl = (new URLSearchParams(window.location.search).get('cupom') || '').trim();
    if (daUrl) {
        try {
            localStorage.setItem('ma_cupom', JSON.stringify({ c: daUrl.toUpperCase(), em: Date.now() }));
        } catch (e) { /* modo privado: o cupom ainda vale nesta página */ }
    }
    // fbclid/gclid/gbraid/wbraid/utm tambem persistem 7 dias: quem chega do anuncio, passeia
    // pelas paginas internas (sem query) e clica depois nao pode perder
    // a campanha — o cupom ja tinha essa rede, o rastro nao tinha
    var rastroAgora = {};
    ['fbclid', 'gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (p) {
        var v = (new URLSearchParams(window.location.search).get(p) || '').trim();
        if (v) rastroAgora[p] = v;
    });
    if (Object.keys(rastroAgora).length) {
        try {
            rastroAgora.em = Date.now();
            localStorage.setItem('ma_rastro', JSON.stringify(rastroAgora));
        } catch (e) { }
    }
    function rastroVigente() {
        try {
            var g = JSON.parse(localStorage.getItem('ma_rastro') || 'null');
            if (g && (Date.now() - (g.em || 0)) < SETE_DIAS) return g;
        } catch (e) { }
        return {};
    }
    function cupomVigente() {
        var agora = (new URLSearchParams(window.location.search).get('cupom') || '').trim();
        if (agora) return agora.toUpperCase();
        try {
            var guardado = JSON.parse(localStorage.getItem('ma_cupom') || 'null');
            if (guardado && guardado.c && (Date.now() - (guardado.em || 0)) < SETE_DIAS) {
                return String(guardado.c);
            }
        } catch (e) { }
        return '';
    }
    window.__maCupomVigente = cupomVigente;
    document.addEventListener('click', function (ev) {
        var alvo = ev.target && ev.target.closest ? ev.target.closest('a[href*="app.meuassessor.com/assinar"]') : null;
        if (!alvo) return;
        try {
            var url = new URL(alvo.href);
            var cupom = cupomVigente();
            if (cupom && !url.searchParams.get('cupom')) url.searchParams.set('cupom', cupom);
            var visita = new URLSearchParams(window.location.search);
            var guardadoRastro = rastroVigente();
            ['fbclid', 'gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (p) {
                var v = visita.get(p) || guardadoRastro[p] || '';
                if (v && !url.searchParams.get(p)) url.searchParams.set(p, v);
            });
            alvo.href = url.toString();
        } catch (e) { /* qualquer falha: o link segue como está */ }
    }, true);
})();

(function trackAnalyticsIntentEvents() {
    const planMetaEventData = {
        content_name: 'Plano Anual Meu Assessor',
        content_category: 'SaaS',
        content_ids: ['meu-assessor-plano-anual'],
        content_type: 'product',
        value: 358.80,
        currency: 'BRL'
    };

    const planAnalyticsItem = {
        item_id: 'meu-assessor-plano-anual',
        item_name: 'Plano Anual Meu Assessor',
        item_category: 'SaaS',
        price: 358.80,
        quantity: 1
    };

    const planAnalyticsEventData = {
        currency: 'BRL',
        value: 358.80,
        items: [planAnalyticsItem],
        transport_type: 'beacon'
    };

    function trackMeta(eventName, eventData, eventId) {
        if (typeof window.fbq !== 'function') return;
        if (eventId) {
            window.fbq('track', eventName, eventData, { eventID: eventId });
            return;
        }
        window.fbq('track', eventName, eventData);
    }

    function trackAnalytics(eventName, eventData) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, eventData);
    }

    // Seção de preço do site novo: id="planos" (era #pricing-section no anterior)
    const pricingSection = document.getElementById('planos');

    if (pricingSection && 'IntersectionObserver' in window) {
        let hasTrackedPricingView = false;
        const pricingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting || hasTrackedPricingView) return;
                hasTrackedPricingView = true;
                trackMeta('ViewContent', planMetaEventData);
                trackAnalytics('view_item', planAnalyticsEventData);
                observer.disconnect();
            });
        }, { threshold: 0.45 });

        pricingObserver.observe(pricingSection);
    }

    // Instrumentação de funil (10/09/2026): todo clique de CTA diz de QUAL
    // seção veio e qual é a sua posição na página. Os 11 CTAs da home têm
    // texto quase igual ("Começar agora", "Contratar assessores"), então só o
    // link_text não separa o CTA do hero do CTA do rodapé — e sem isso não dá
    // para saber quais seções vendem e quais só ocupam tela.
    const todosCtas = [...document.querySelectorAll('a[href="#planos"], a[href="/#planos"], a[href*="app.meuassessor.com/assinar"]')];
    function origemDoCta(el) {
        const dono = el.closest('section, header, footer, nav');
        const secao = dono ? (dono.id || (dono.className || '').split(' ')[0] || dono.tagName.toLowerCase()) : 'sem-secao';
        return { cta_section: secao, cta_index: todosCtas.indexOf(el) + 1, cta_total: todosCtas.length };
    }

    // eventID único por pageview + disparo único: cliques repetidos no
    // CTA (o site navega com 180ms de atraso) não podem inflar o IC
    const icSiteEventId = 'ic_site_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    let icSiteDisparado = false;
    document.querySelectorAll('a[href*="app.meuassessor.com/assinar"]').forEach((checkoutLink) => {
        checkoutLink.addEventListener('click', (event) => {
            if (!icSiteDisparado) {
                icSiteDisparado = true;
                trackMeta('InitiateCheckout', {
                    ...planMetaEventData,
                    num_items: 1
                }, icSiteEventId);
            }
            trackAnalytics('begin_checkout', {
                ...planAnalyticsEventData,
                // cupom do influenciador vigente (?cupom= desta visita ou
                // guardado por 7 dias) — 'organico' quando não há
                coupon: (window.__maCupomVigente && window.__maCupomVigente()) || 'organico',
                ...origemDoCta(checkoutLink)
            });

            const opensNewContext = checkoutLink.target === '_blank'
                || event.metaKey
                || event.ctrlKey
                || event.shiftKey
                || event.button !== 0;

            if (opensNewContext) return;

            event.preventDefault();
            window.setTimeout(() => {
                window.location.href = checkoutLink.href;
            }, 180);
        });
    });

    document.querySelectorAll('a[href="#planos"], a[href="/#planos"]').forEach((pricingLink) => {
        pricingLink.addEventListener('click', () => {
            trackAnalytics('pricing_cta_click', {
                link_text: pricingLink.textContent.trim(),
                destination: 'planos',
                transport_type: 'beacon',
                ...origemDoCta(pricingLink)
            });
        });
    });

    document.querySelectorAll('a[href*="app.meuassessor.com"]:not([href*="/assinar"])').forEach((loginLink) => {
        loginLink.addEventListener('click', () => {
            trackAnalytics('login_click', {
                link_url: loginLink.href,
                link_text: loginLink.textContent.trim(),
                transport_type: 'beacon'
            });
        });
    });

    // Até que seção o visitante chegou. Um evento por marco, uma vez por
    // pageview, quando o TOPO da seção cruza o meio da tela (rootMargin de
    // -50% embaixo) — critério que não depende da altura da seção: com um
    // limiar de porcentagem, o hero de duas telas nunca "entrava". São 9
    // marcos (não as 18 seções) para o relatório caber num olhar: a pergunta
    // é "onde a página perde gente", e para isso os marcos bastam. O 90% de
    // scroll do GA4 já existe e continua; isto diz ONDE no meio do caminho.
    const marcos = ['hero-container', 'team-section', 'dia2-section', 'of-section', 'ag-section', 'ben2-section', 'preco-section', 'emb-section', 'faq-section'];
    if ('IntersectionObserver' in window) {
        const vistos = new Set();
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                const nome = entrada.target.dataset.marco;
                if (vistos.has(nome)) return;
                vistos.add(nome);
                observador.unobserve(entrada.target);
                trackAnalytics('section_view', {
                    section_name: nome,
                    section_index: marcos.indexOf(nome) + 1,
                    transport_type: 'beacon'
                });
            });
        }, { threshold: 0, rootMargin: '0px 0px -50% 0px' });
        marcos.forEach((classe) => {
            const el = document.querySelector('.' + classe);
            if (!el) return;
            el.dataset.marco = classe;
            observador.observe(el);
        });
    }

    document.querySelectorAll('a[href*="wa.me/5547992921005"]').forEach((whatsappLink) => {
        whatsappLink.addEventListener('click', () => {
            // parte do funil fecha pelo WhatsApp: Contact é o evento
            // padrão barato que dá públicos intermediários à Meta
            trackMeta('Contact', { content_name: 'whatsapp_suporte' });
            trackAnalytics('whatsapp_click', {
                link_url: whatsappLink.href,
                link_text: whatsappLink.textContent.trim(),
                transport_type: 'beacon'
            });
        });
    });
})();
