import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/LOGO.png';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/meuassessor/meuassessor_script.js?v=" + Date.now();
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="clone-wrapper">
      <link rel="stylesheet" href={"/meuassessor/meuassessor.css?v=" + Date.now()} />
      
    
    <img src="/meuassessor/images/celular-2.webp" id="global-celular-bg" alt="Celular Background" />
    
    <header className="glass-header">
        
        <a href="/" className="logo-link logo-troca">
            <img src={logo} alt="Simplific Pro Logo" className="header-logo logo-no-escuro" />
            <img src={logo} alt="" aria-hidden="true" className="header-logo logo-no-claro" />
        </a>
        <nav className="header-nav">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>
        </nav>
        
        <a href="/checkout" className="header-cta">Começar agora &rarr;</a>

        <button className="header-menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-do-celular">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <nav className="menu-movel" id="menu-do-celular" aria-label="Menu do site">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>
            
            <a href="/checkout" className="mm-acao">Começar agora &rarr;</a>
            <a href="/login" className="mm-login">Fazer login</a>
        </nav>
    </header>

    <section className="hero-container">
        
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
    </section>

    <section className="promise-section" id="promiseSection">
        <div className="promise-container">

            <div className="promise-text">
                <h2 className="promise-headline">Vive esquecendo onde foi parar o dinheiro ou qual é o próximo compromisso?<span className="hl-so-desktop"> Mande uma mensagem ou áudio e deixe tudo organizado.</span></h2>
                <p className="promise-description">Basta enviar uma simples mensagem por texto ou áudio no WhatsApp. A equipe registra tudo, organiza, e não deixa você esquecer de nada.</p>

                <a href="#planos" className="hero-btn promise-btn"><span>Contratar minha equipe</span></a>
            </div>

            <div className="promise-stage" aria-hidden="true">
                <div className="flow" id="promiseFlow" data-ato="1">
                  <div className="flow-drift">

                    <div className="reg-phone">
                        <div className="reg-screen">

                            <div className="reg-tags" data-ato="1">
                                <span className="is-on">Alimentação</span>
                                <span>Crédito</span>
                                <span>Conciliado</span>
                            </div>

                            <div className="reg-chart" data-ato="1">
                                <span className="reg-chart-top">Alimentação · este mês</span>
                                <ul className="reg-rows">
                                    <li><em>jul</em><span className="reg-track"><i style={{'--w': '87%'}}></i></span><b>R$ 1.079</b></li>
                                    <li className="is-now"><em>ago</em><span className="reg-track"><i style={{'--w': '100%'}}></i></span><b>R$ 1.240</b></li>
                                </ul>
                            </div>

                            <div className="reg-insight" data-ato="1">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/>
                                    <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/>
                                </svg>
                                <p><b>Martin</b> · alimentação está <b>15% acima</b> de julho. No ritmo de agora, o mês fecha perto de R$ 1.430.</p>
                            </div>

                            <div className="reg-tags" data-ato="2">
                                <span className="is-on">Reunião</span>
                                <span>Presencial</span>
                                <span>1 hora</span>
                            </div>

                            <div className="reg-done" data-ato="2">
                                <span className="reg-chart-top">Já está feito</span>
                                <ul className="reg-steps">
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Horário reservado · 15:00 às 16:00</span>
                                    </li>
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Convite enviado para Ana Prado</span>
                                    </li>
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Lembrete 1h antes</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="reg-insight" data-ato="2">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/>
                                    <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/>
                                </svg>
                                <p><b>Sofi</b> · quinta você almoça na Faria Lima até 14h. Já segurei <b>25 min</b> de deslocamento antes.</p>
                            </div>

                            <div className="reg-tags" data-ato="3">
                                <span className="is-on">Tarefa</span>
                                <span>Alta</span>
                                <span>Sexta 22</span>
                            </div>

                            <div className="reg-done" data-ato="3">
                                <span className="reg-chart-top">Já está feito</span>
                                <ul className="reg-steps">
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Prazo definido · sexta, 22</span>
                                    </li>
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Prioridade alta, topo da fila</span>
                                    </li>
                                    <li>
                                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4"/></svg>
                                        <span>Lembrete na quarta, 9h</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="reg-insight" data-ato="3">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/>
                                    <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/>
                                </svg>
                                <p><b>Luna</b> · quinta sua tarde já é da Ana, então te lembro <b>na quarta</b>. Ainda dá tempo de pagar sem multa.</p>
                            </div>
                        </div>
                    </div>

                    <div className="reg-cast">
                        <span className="reg-bloom"></span>

                        <figure className="reg-item" data-ato="1">
                            
                            <span className="reg-photo"><img src="/meuassessor/images/coca-350.jpg" width="440" height="440" decoding="sync" alt="" /></span>
                        </figure>

                        <div className="reg-cap" data-ato="1">
                            <b>Coca-Cola Zero 350 ml</b>
                            <span>R$ 7,50 · crédito</span>
                        </div>

                        <div className="reg-agenda" data-ato="2">
                            <div className="reg-week">
                                <span><em>seg</em><b>18</b></span>
                                <span><em>ter</em><b>19</b></span>
                                <span><em>qua</em><b>20</b></span>
                                <span className="is-day"><em>qui</em><b>21</b></span>
                                <span><em>sex</em><b>22</b></span>
                            </div>
                            
                            <div className="reg-days">
                                
                                <div className="reg-day"><i style={{'--t': '1'}}></i><i style={{'--t': '4'}}></i></div>
                                
                                <div className="reg-day"><i style={{'--t': '0'}}></i><i style={{'--t': '2'}}></i></div>
                                
                                <div className="reg-day"><i style={{'--t': '2'}}></i><i style={{'--t': '4'}}></i></div>
                                <div className="reg-day is-day">
                                    
                                    <i style={{'--t': '1'}}></i>
                                    <span className="reg-slot"><i></i><b>15:00</b></span>
                                    
                                    <em className="reg-slot-ring"></em>
                                </div>
                                
                                <div className="reg-day"><i style={{'--t': '0'}}></i><i style={{'--t': '4'}}></i></div>
                            </div>
                        </div>

                        <div className="reg-cap" data-ato="2">
                            <b>Reunião com Ana Prado</b>
                            <span>Quinta, 21 de agosto · 15:00 às 16:00</span>
                        </div>

                        <div className="reg-fila" data-ato="3">
                            <span className="reg-fila-top">Tarefas</span>
                            <div className="reg-tasks">
                                
                                <div className="reg-task" style={{'--i': '0'}}><i></i><span>Renovar o seguro do carro</span><b>seg 25</b></div>
                                <div className="reg-task" style={{'--i': '1'}}><i></i><span>Enviar o contrato assinado</span><b>qua 27</b></div>
                                <div className="reg-task" style={{'--i': '2'}}><i></i><span>Marcar o check-up</span><b>sex 29</b></div>

                                <span className="reg-nova">
                                    <i></i>
                                    <em></em>
                                    <b>Pagar o IPVA</b>
                                    <span>sex 22</span>
                                </span>
                                
                                <u className="reg-nova-ring"></u>
                            </div>
                        </div>

                        <div className="reg-cap" data-ato="3">
                            <b>Pagar o IPVA</b>
                            <span>Vence sexta, 22 de agosto</span>
                        </div>

                        <div className="reg-bar">
                            <span className="reg-bar-in">
                                <span className="reg-wave"><i></i><i></i><i></i><i></i><i></i></span>
                                <span className="reg-text"><span id="flowText"></span><i className="reg-caret"></i></span>
                                <span className="reg-send">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>
                                    <i className="reg-send-ring"></i>
                                </span>
                            </span>
                        </div>
                    </div>

                    <span className="flow-cursor" id="flowCursor">
                        <svg viewBox="0 0 20 22" aria-hidden="true"><path d="M2 1.6 17 11l-6.4 1.2 3 6-2.9 1.3-2.9-6L2 18.4Z"/></svg>
                    </span>

                  </div>
                </div>
            </div>
        </div>
    </section>

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
    <section className="conf-faixa" aria-label="Segurança e regulação">

        <svg className="conf-defs" aria-hidden="true" focusable="false">
            {/* O laço da Meta: geometria oficial da marca, em uma cor só. O
                 viewBox recorta a altura real do desenho (y de 3,9 a 20,1) para
                 o laço nascer do mesmo tamanho ótico das outras marcas. */}
            <symbol id="conf-m-meta" viewBox="0 3.9 24 16.2"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></symbol>
            {/* Banco Central: NÃO é o brasão oficial, e de propósito. Um brasão
                 refeito de memória sai amador; aqui vai um edifício de colunas
                 em traço fino, que é o sinal institucional sem falsificar marca. */}
            <symbol id="conf-m-bacen" viewBox="0 0 24 24"><path d="M1.6 9.6 12 3.2l10.4 6.4Z"/><path d="M5.9 10.6v9.1M9.95 10.6v9.1M14.05 10.6v9.1M18.1 10.6v9.1"/><path d="M2.6 20.5h18.8"/></symbol>
            {/* Glifo oficial do WhatsApp, o mesmo path do rodapé: desenhado em
                 massa, não em traço, daí o modificador .is-cheio no <use>. */}
            <symbol id="conf-m-whatsapp" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></symbol>
            <symbol id="conf-m-olho" viewBox="0 0 24 24"><path d="M1.6 12C5 7.4 8.4 5.1 12 5.1s7 2.3 10.4 6.9c-3.4 4.6-6.8 6.9-10.4 6.9S5 16.6 1.6 12Z"/><circle cx="12" cy="12" r="3.05"/></symbol>
            {/* O CARIMBO da LGPD: caixa arredondada com a sigla dentro, único
                 desenho da fita que é letra e não figura. Tinha um irmão — o
                 carimbo "114", mesma caixa e mesmo peso — que saiu na 6a
                 rodada; ficou o molde, caso outro carimbo volte um dia. O fill
                 e o stroke do <text> vão em ATRIBUTO e não na folha de estilo,
                 porque CSS de documento não atravessa o conteúdo clonado pelo
                 <use> — só a herança passa. */}
            <symbol id="conf-m-lgpd" viewBox="0 0 24 24"><rect x="1.3" y="5.4" width="21.4" height="13.2" rx="3.4"/><text x="12.15" y="14.1" text-anchor="middle" fill="currentColor" stroke="none" font-family="Poppins, sans-serif" font-size="5.9" font-weight="600" letter-spacing="0.3">LGPD</text></symbol>
        </svg>

        <div className="conf-trilho">
            <div className="conf-fita">

            <ul className="conf-fila">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            <ul className="conf-fila" aria-hidden="true">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            <ul className="conf-fila" aria-hidden="true">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            </div>
        </div>
    </section>

    <section className="team-section" id="teamSection">
        <div className="team-container">
            
            <div className="team-energy" aria-hidden="true">
                <div className="team-energy-in">
                    <canvas id="esferaEquipe" data-esfera="equipe"></canvas>
                </div>
            </div>

            <div className="team-content-row">
                
                <div className="team-selector">
                    
                    <div className="team-selector-card active" data-assessor="theo" role="button" tabIndex="0" aria-pressed="true">
                        <img src="/meuassessor/images/theo.jpg" alt="Theo" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="martin" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/martin.jpg" alt="Martin" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="sofi" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/sofi.jpg" alt="Sofi" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="luna" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/luna.jpg" alt="Luna" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="italo" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/italo_otim.jpg" alt="Ítalo" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="rita" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/rita.jpg" alt="Rita" className="team-selector-avatar" />
                    </div>
                </div>

                <svg style={{width: '0', '--height': '0', position: 'absolute'}} aria-hidden="true" focusable="false">
                    <linearGradient id="verifiedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#bc85f8" />
                        <stop offset="100%" stop-color="#e27bb7" />
                    </linearGradient>
                </svg>

                <div className="team-main-card-wrapper" id="teamCarouselWrapper">

                    <div className="team-carousel-card pos-center" data-index="0" data-assessor="theo">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/theo_large_otim.jpg" alt="Theo" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Theo</span>

                            </div>
                            <div className="team-main-role">Diretor de operações</div>
                        </div>
                    </div>

                    <div className="team-carousel-card pos-right" data-index="1" data-assessor="martin">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/martin_large_otim.jpg" alt="Martin" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Martin</span>

                            </div>
                            <div className="team-main-role">Gerente financeiro</div>
                        </div>
                    </div>

                    <div className="team-carousel-card pos-back" data-index="2" data-assessor="sofi">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/sofi_large_otim.jpg" alt="Sofi" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Sofi</span>

                            </div>
                            <div className="team-main-role">Secretária executiva</div>
                        </div>
                    </div>

                    <div className="team-carousel-card pos-back" data-index="3" data-assessor="luna">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/luna_large_otim.jpg" alt="Luna" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Luna</span>

                            </div>
                            <div className="team-main-role">Organização & Docs</div>
                        </div>
                    </div>

                    <div className="team-carousel-card pos-back" data-index="4" data-assessor="italo">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/italo_large_otim.jpg" alt="Ítalo" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Ítalo</span>

                            </div>
                            <div className="team-main-role">Estagiário de pesquisas</div>
                        </div>
                    </div>

                    <div className="team-carousel-card pos-left" data-index="5" data-assessor="rita">
                        <div className="team-main-portrait">
                            <img src="/meuassessor/images/rita_large_otim.jpg" alt="Rita" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Rita</span>

                            </div>
                            <div className="team-main-role">Assistente fiscal</div>
                        </div>
                    </div>

                    <div className="team-notification" id="teamNotification">
                        <div className="team-notif-msg" id="notifMsg">Sua manhã foi organizada! Separei 3 prioridades.</div>
                        <div className="team-notif-time">
                            <span id="notifTime">09:41</span>
                            <svg viewBox="0 0 16 11" width="16" height="11" fill="none" className="team-notif-checks"><path d="M1.5 5.5l2.5 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 5.5l2.5 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    </div>
                </div>

                <div className="team-sphere">
                    
                    <div className="dash-stack" id="teamDashboard">
                      <div className="dash-orbit">

                        <article className="dash-panel is-active" data-assessor="theo">
                            <div className="dash-eyebrow"><span>O expediente</span><span className="dash-tag">agosto</span></div>

                            <div className="dash-hero">
                                <span className="dash-num" data-count="119">119</span>
                                <span className="dash-cap">coisas resolvidas<br />sem você<b>+22% vs. julho</b></span>
                            </div>

                            <div className="dash-chart">
                                <ul className="dash-bars">
                                    <li className="dash-bar is-top" style={{'--w': '100%'}}>
                                        <span className="dash-bar-key">Luna <em>tarefas</em></span>
                                        <span className="dash-bar-track"><i></i></span>
                                        <span className="dash-bar-val" data-count="46">46</span>
                                    </li>
                                    <li className="dash-bar" style={{'--w': '74%'}}>
                                        <span className="dash-bar-key">Martin <em>contas pagas</em></span>
                                        <span className="dash-bar-track"><i></i></span>
                                        <span className="dash-bar-val" data-count="34">34</span>
                                    </li>
                                    <li className="dash-bar" style={{'--w': '46%'}}>
                                        <span className="dash-bar-key">Sofi <em>compromissos</em></span>
                                        <span className="dash-bar-track"><i></i></span>
                                        <span className="dash-bar-val" data-count="21">21</span>
                                    </li>
                                    <li className="dash-bar" style={{'--w': '39%'}}>
                                        <span className="dash-bar-key">Theo <em>avisos</em></span>
                                        <span className="dash-bar-track"><i></i></span>
                                        <span className="dash-bar-val" data-count="18">18</span>
                                    </li>
                                </ul>
                            </div>

                            <ul className="dash-stats">
                                <li><span>nesta semana</span><b>27</b></li>
                                <li><span>hoje</span><b>4</b></li>
                                <li><span>tempo poupado</span><b className="is-up">6h20</b></li>
                                <li><span>nada esquecido</span><b>31 dias</b></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p>a <b>Luna</b> puxou o mês: 46 tarefas fechadas, 12 delas hoje.</p>
                            </footer>
                        </article>

                        <article className="dash-panel" data-assessor="martin">
                            <div className="dash-eyebrow"><span>Saldo do mês</span><span className="dash-tag">agosto</span></div>

                            <div className="dash-hero">
                                <span className="dash-num dash-num-money">
                                    <em>R$</em><span data-count="1473" data-fmt="int">1.473</span><i>,20</i>
                                </span>
                                <span className="dash-cap">sobrando<b>fecha positivo</b></span>
                            </div>

                            <div className="dash-chart">
                                <div className="dash-spark">
                                    <svg viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true">
                                        <defs>
                                            <linearGradient id="dashSparkFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0.2"/>
                                                <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0"/>
                                            </linearGradient>
                                        </defs>
                                        <line className="dash-spark-grid" x1="0" y1="20" x2="300" y2="20"/>
                                        <line className="dash-spark-grid" x1="0" y1="44" x2="300" y2="44"/>
                                        <path className="dash-spark-area" d="M0,40 15,41 28,42 34,14 42,16 60,22 80,28 100,33 120,38 140,44 160,45 168,22 176,20 190,26 210,33 230,41 246,46 258,47 268,42 280,39 300,37 L300,64 L0,64 Z"/>
                                        <path className="dash-spark-line" pathLength="1" fill="none" d="M0,40 15,41 28,42 34,14 42,16 60,22 80,28 100,33 120,38 140,44 160,45 168,22 176,20 190,26 210,33 230,41 246,46 258,47 268,42 280,39 300,37"/>
                                    </svg>
                                </div>
                            </div>

                            <ul className="dash-stats">
                                <li><span>entrou</span><b>R$ 8.430</b></li>
                                <li><span>saiu</span><b>R$ 6.957</b></li>
                                <li><span>cartão</span><b>R$ 1.884</b></li>
                                <li><span>guardado</span><b className="is-up">R$ 600</b></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p>o <b>mercado</b> foi seu maior gasto: R$ 1.240 em 11 compras.</p>
                            </footer>
                        </article>

                        <article className="dash-panel" data-assessor="sofi">
                            <div className="dash-eyebrow"><span>Sua semana</span><span className="dash-tag">9 compromissos</span></div>

                            <div className="dash-hero">
                                <span className="dash-num dash-num-time">em 2h10</span>
                                <span className="dash-cap"><b>Consulta no dentista</b>hoje · 15:30</span>
                            </div>

                            <div className="dash-chart">
                                <div className="dash-week">
                                    <div className="dash-day is-today" style={{'--h': '66%'}}><b>2</b><span className="dash-day-col"><i></i></span><em>qui</em></div>
                                    <div className="dash-day" style={{'--h': '33%'}}><b>1</b><span className="dash-day-col"><i></i></span><em>sex</em></div>
                                    <div className="dash-day" style={{'--h': '100%'}}><b>3</b><span className="dash-day-col"><i></i></span><em>sáb</em></div>
                                    <div className="dash-day" style={{'--h': '0'}}><b></b><span className="dash-day-col"><i></i></span><em>dom</em></div>
                                    <div className="dash-day" style={{'--h': '66%'}}><b>2</b><span className="dash-day-col"><i></i></span><em>seg</em></div>
                                    <div className="dash-day" style={{'--h': '33%'}}><b>1</b><span className="dash-day-col"><i></i></span><em>ter</em></div>
                                    <div className="dash-day" style={{'--h': '0'}}><b></b><span className="dash-day-col"><i></i></span><em>qua</em></div>
                                </div>
                            </div>

                            <ul className="dash-list">
                                <li className="is-due"><i></i><span>Consulta no dentista</span><em>hoje 15:30</em></li>
                                <li><i></i><span>Reunião de pais na escola</span><em>sex 19:00</em></li>
                                <li><i></i><span>Aniversário da Helena</span><em>sáb 16:00</em></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p><b>sábado</b> é seu dia cheio: três compromissos seguidos.</p>
                            </footer>
                        </article>

                        <article className="dash-panel" data-assessor="luna">
                            <div className="dash-eyebrow"><span>Suas tarefas</span><span className="dash-tag">24 abertas</span></div>

                            <div className="dash-hero">
                                <span className="dash-num" data-count="24">24</span>
                                <span className="dash-cap">na sua fila<br />agora<b>9 fechadas na semana</b></span>
                            </div>

                            <div className="dash-chart">
                                <div className="dash-seg">
                                    <i className="s1" style={{'--w': '21%'}}></i>
                                    <i className="s2" style={{'--w': '29%'}}></i>
                                    <i className="s3" style={{'--w': '13%'}}></i>
                                    <i className="s4" style={{'--w': '37%'}}></i>
                                </div>
                                <ul className="dash-legend">
                                    <li className="s1"><i></i><span>Vencendo</span><b>5</b></li>
                                    <li className="s2"><i></i><span>Pendentes</span><b>7</b></li>
                                    <li className="s3"><i></i><span>Em andamento</span><b>3</b></li>
                                    <li className="s4"><i></i><span>Concluídas</span><b>9</b></li>
                                </ul>
                            </div>

                            <ul className="dash-list">
                                <li className="is-due"><i></i><span>Pagar o IPTU (2ª parcela)</span><em>hoje</em></li>
                                <li><i></i><span>Renovar o seguro do carro</span><em>em 3d</em></li>
                                <li><i></i><span>Levar o carro na revisão</span><em>em 6d</em></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p>o <b>IPTU</b> vence hoje: já deixei o boleto separado pra você.</p>
                            </footer>
                        </article>

                        <article className="dash-panel" data-assessor="italo">
                            <div className="dash-eyebrow"><span>Pesquisas</span><span className="dash-tag">agosto</span></div>

                            <div className="dash-hero">
                                <span className="dash-num" data-count="23">23</span>
                                <span className="dash-cap">pesquisas<br />entregues<b>todas com fonte</b></span>
                            </div>

                            <div className="dash-chart">
                                <ul className="dash-list">
                                    <li><i></i><span>Monitor LG 27&quot;</span><em>R$ 1.149 · menor de 3 lojas</em></li>
                                    <li><i></i><span>Passagem GRU→FLN</span><em>R$ 412 ida e volta</em></li>
                                    <li><i></i><span>Seguro do carro</span><em>4 cotações comparadas</em></li>
                                </ul>
                            </div>

                            <ul className="dash-stats">
                                <li><span>nesta semana</span><b>6</b></li>
                                <li><span>hoje</span><b>1</b></li>
                                <li><span>economia achada</span><b className="is-up">R$ 380</b></li>
                                <li><span>fontes checadas</span><b>41</b></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p>o monitor da <b>Kabum</b> caiu 8% desde ontem: boa hora de comprar.</p>
                            </footer>
                        </article>

                        <article className="dash-panel" data-assessor="rita">
                            <div className="dash-eyebrow"><span>Notas fiscais</span><span className="dash-tag">agosto</span></div>

                            <div className="dash-hero">
                                <span className="dash-num dash-num-money">
                                    <em>R$</em><span data-count="4250" data-fmt="int">4.250</span>
                                </span>
                                <span className="dash-cap">faturados<br />em notas<b>5 notas no mês</b></span>
                            </div>

                            <div className="dash-chart">
                                <ul className="dash-list">
                                    <li><i></i><span>Nº 157 · Mentoria</span><em>R$ 1.450 · paga</em></li>
                                    <li><i></i><span>Nº 156 · Consultoria</span><em>R$ 850 · paga</em></li>
                                    <li><i></i><span>Nº 155 · Aula avulsa</span><em>R$ 350 · emitida</em></li>
                                </ul>
                            </div>

                            <ul className="dash-stats">
                                <li><span>emitidas</span><b>5</b></li>
                                <li><span>recorrentes</span><b>2</b></li>
                                <li><span>para emitir</span><b>1</b></li>
                                <li><span>impostos separados</span><b>R$ 212</b></li>
                            </ul>

                            <footer className="dash-foot">
                                <svg className="dash-voice" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z"/><path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z"/></svg>
                                <p>a nota da <b>mentoria</b> de setembro já está agendada para o dia 1º.</p>
                            </footer>
                        </article>

                      </div>
                    </div>
                </div>
            </div> 

            <div className="team-text-block">
                <h2 className="team-headline"><span className="hl-so-desktop">Pare de tentar organizar tudo sozinho. </span>Tenha um assessor especializado em cada parte da sua rotina.</h2>
                <p className="team-description">Cada assessor é especialista em uma área, mas todos trabalham juntos. Você envia uma mensagem pelo WhatsApp e a equipe transforma o pedido em algo resolvido.</p>
                <a href="/assessores" className="hero-btn team-btn"><span>Conheça seus assessores</span></a>
            </div>
        </div>
    </section>

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
    <section className="dia2-section" id="diaSection">
        <div className="dia2-grade">
            <div className="dia2-texto">
                <header className="dia2-topo">
                    <h2 className="dia2-headline">Um dia normal. Só que alguém cuidou de tudo.</h2>
                    <p className="dia2-sub">Cinco momentos de um dia comum, e o que a sua equipe resolve em cada um deles pelo WhatsApp.</p>
                </header>
                <ol className="dia2-lista" id="dia2Lista">
                    <li className="dia2-item is-ativo" data-ato="1" aria-current="true">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">07:40</span><span className="dia2-titulo">O aviso da fatura chega antes de você terminar o café.</span></button>
                        <div className="dia2-corpo"><p>Seus assessores acompanham contas, compromissos e documentos. Eles enviam avisos, trazem atualizações e sugerem análises pelo WhatsApp, sem esperar você pedir.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="2" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">09:15</span><span className="dia2-titulo">Um áudio no caminho, e a consulta entra na agenda.</span></button>
                        <div className="dia2-corpo"><p>A Sofi cria compromissos no Google Agenda a partir de mensagens ou áudios enviados pelo WhatsApp, com data, horário e lembrete. A agenda também pode ser consultada pela conversa.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="3" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">12:30</span><span className="dia2-titulo">Pagou o almoço? Já está registrado.</span></button>
                        <div className="dia2-corpo"><p>Com o banco conectado pelo Open Finance, o Martin importa as movimentações e organiza os gastos por categoria. Você também pode registrar despesas por mensagem, áudio ou foto.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="4" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">15:30</span><span className="dia2-titulo">Não encontra um documento? É só mandar uma mensagem.</span></button>
                        <div className="dia2-corpo"><p>A Luna organiza os arquivos enviados pelo WhatsApp em pastas. Você pode buscar um documento descrevendo o que precisa e recebê-lo na própria conversa.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="5" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">22:00</span><span className="dia2-titulo">Antes de dormir, o resumo do dia já está pronto.</span></button>
                        <div className="dia2-corpo"><p>Sua equipe reúne as atividades realizadas em um resumo enviado pelo WhatsApp. A Sofi também envia os compromissos, as prioridades e os prazos da agenda a cada manhã.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                </ol>
            </div>
            <div className="dia2-palco">
                <div className="dia2-quadro" id="dia2Quadro" aria-hidden="true">
                    <div className="dia2-cena is-ativa" data-ato="1">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">07:40</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'images/7-40.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti">
                        <span className="dia-noti-icone is-nubank"><img src="/meuassessor/images/bancos/nubank.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Fatura de cartão</strong>
                        <span className="dia-noti-hora">7:40</span>
                        </span>
                        <span className="dia-noti-sub">Martin: Sua fatura do Nubank vence hoje!<span className="dia-noti-pergunta">Quer que eu gere o relatório dos gastos?</span></span>
                        </span>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="2">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">09:15</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'images/9-15.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-zap" aria-hidden="true">
                        <div className="dia-zap-audio">
                        <div className="dia-zap-linha">
                        <span className="dia-zap-play"><svg viewBox="0 0 12 14" focusable="false"><path d="M2.2 1.5 10.6 7 2.2 12.5Z"/></svg></span>
                        <span className="dia-zap-onda"><i style={{'--h': '22%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '40%'}}></i><i style={{'--h': '54%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '82%'}}></i><i style={{'--h': '94%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '26%'}}></i><i style={{'--h': '36%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '100%'}}></i><i style={{'--h': '90%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '62%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '86%'}}></i><i style={{'--h': '96%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '26%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '64%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '24%'}}></i></span>
                        <span className="dia-zap-dur">0:08</span>
                        </div>
                        <div className="dia-zap-fio"></div>
                        <p className="dia-zap-tr">Marca o pediatra da Alice na quinta 10 horas.</p>
                        <p className="dia-zap-meta">9:15<svg className="dia-zap-visto" viewBox="0 0 17 11" focusable="false"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></p>
                        </div>
                        <div className="dia-zap-resp">
                        <p className="dia-zap-quem"><span className="dia-zap-nome"><b>Sofi</b> &middot; Secretária executiva</span></p>
                        <p className="dia-zap-txt">Marcado ✅ Já está no seu Google Agenda.</p>
                        <p className="dia-zap-meta">9:15</p>
                        </div>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="3">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">12:30</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'images/12-30.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti">
                        <span className="dia-noti-icone is-ifood"><img src="/meuassessor/images/bancos/ifood.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Gasto registrado</strong>
                        <span className="dia-noti-hora">12:30</span>
                        </span>
                        <span className="dia-noti-sub">Martin: Registrei seu almoço no iFood: R$38 em Alimentação.</span>
                        </span>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="4">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">15:30</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'images/15-30.webp\')'}} aria-hidden="true"></div>
                        <div className="zap4-fio" aria-hidden="true">
                        <div className="zap4-bolha is-voce">
                        <span className="zap4-txt">Preciso do contrato assinado do Rodrigo.</span>
                        <span className="zap4-meta">15:30<svg className="zap4-visto" viewBox="0 0 17 11" focusable="false"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                        </div>
                        <div className="zap4-bolha is-luna">
                        <span className="zap4-quem"><span className="zap4-nome">Luna</span><span className="zap4-cargo">Organização &amp; Docs</span></span>
                        <span className="zap4-txt">Achei! 📄 <span className="zap4-arq">contrato-rodrigo.pdf</span> estava na pasta de Contratos<span className="zap4-envio-desktop"> — acabei de te enviar</span>.</span>
                        <span className="zap4-meta">15:30</span>
                        </div>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="5">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">22:00</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'images/22-00.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti is-equipe">
                        <span className="dia-noti-icone is-equipe"><img src="favicon.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Sua equipe fechou o dia</strong>
                        <span className="dia-noti-hora">22:00</span>
                        </span>
                        <span className="dia-noti-sub">1 fatura avisada, 1 consulta marcada, 1 gasto registrado e 1 documento encontrado.</span>
                        </span>
                        </div>
                        </div>
                    </div>
                </div>
                <ol className="dia2-trilho" id="dia2Trilho" aria-hidden="true">
                    <li><button type="button" className="dia2-marco is-ativo" data-ato="1">07:40</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="2">09:15</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="3">12:30</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="4">15:30</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="5">22:00</button></li>
                </ol>
                <div className="dia2-legenda" id="dia2Legenda" aria-hidden="true">
                    <div className="dia2-legenda-item is-ativo" data-ato="1"><h3>O aviso da fatura chega antes de você terminar o café.</h3><p>Receba avisos de contas e compromissos sem precisar pedir.</p></div>
                    <div className="dia2-legenda-item" data-ato="2"><h3>Um áudio no caminho, e a consulta entra na agenda.</h3><p>Mande um áudio e a Sofi agenda, com data, horário e lembrete.</p></div>
                    <div className="dia2-legenda-item" data-ato="3"><h3>Pagou o almoço? Já está registrado.</h3><p>O Martin importa os gastos do banco e organiza por categoria.</p></div>
                    <div className="dia2-legenda-item" data-ato="4"><h3>Não encontra um documento? É só mandar uma mensagem.</h3><p>Descreva o arquivo que precisa. A Luna encontra e envia no WhatsApp.</p></div>
                    <div className="dia2-legenda-item" data-ato="5"><h3>Antes de dormir, o resumo do dia já está pronto.</h3><p>Receba o resumo do dia e os próximos compromissos pelo WhatsApp.</p></div>
                </div>
            </div>
            <a className="hero-btn dia2-btn cta-forte" href="#planos"><span>Contratar minha equipe</span></a>
        </div>
    </section>

    <section className="mostra-section" id="mostraSection" data-header="claro">
        <div className="mostra-grade">

            <header className="mostra-topo">
                <h2 className="mostra-headline">Se você sabe mandar uma mensagem no WhatsApp, já sabe usar o Simplific Pro.</h2>
                
                <p className="mostra-sub">Fale com seus assessores do mesmo jeito que fala com qualquer pessoa. Peça com as palavras que vierem à cabeça. Sua equipe entende o que você precisa.</p>
            </header>
        </div>


        <div className="mostra-esteiras">

            <div className="mostra-trilho">
                <div className="mostra-fita mostra-f1">
                    <div className="mostra-fila">
                        <span className="mostra-bolha"><span className="mostra-txt">bom dia! o que eu tenho hoje?</span><span className="mostra-meta">07:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">gastei 62 na farmácia agora</span><span className="mostra-meta">09:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">minha fatura já fechou?</span><span className="mostra-meta">23:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">cria o link do meet da call de amanhã</span><span className="mostra-meta">17:35<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">cobra o Vitor todo dia 10 🙏</span><span className="mostra-meta">17:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">guarda essa aqui</span><span className="mostra-meta">13:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quantas tarefas fechei essa semana?</span><span className="mostra-meta">20:08<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">adiciona a minha esposa na conta ❤️</span><span className="mostra-meta">20:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">puxa minha semana do google agenda</span><span className="mostra-meta">08:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Almoço R$ 141,60 no cartão do Itaú.</span><span className="mostra-meta">13:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quanto foi de mercado em agosto?</span><span className="mostra-meta">21:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">reunião semanal toda terça 9h</span><span className="mostra-meta">09:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">lembra meu irmão do aniversário da mãe dia 27</span><span className="mostra-meta">18:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">vc acha o comprovante do aluguel?</span><span className="mostra-meta">15:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">anota a ideia da assinatura anual</span><span className="mostra-meta">23:17<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                    
                    <div className="mostra-fila" aria-hidden="true">
                        <span className="mostra-bolha"><span className="mostra-txt">bom dia! o que eu tenho hoje?</span><span className="mostra-meta">07:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">gastei 62 na farmácia agora</span><span className="mostra-meta">09:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">minha fatura já fechou?</span><span className="mostra-meta">23:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">cria o link do meet da call de amanhã</span><span className="mostra-meta">17:35<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">cobra o Vitor todo dia 10 🙏</span><span className="mostra-meta">17:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">guarda essa aqui</span><span className="mostra-meta">13:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quantas tarefas fechei essa semana?</span><span className="mostra-meta">20:08<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">adiciona a minha esposa na conta ❤️</span><span className="mostra-meta">20:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">puxa minha semana do google agenda</span><span className="mostra-meta">08:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Almoço R$ 141,60 no cartão do Itaú.</span><span className="mostra-meta">13:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quanto foi de mercado em agosto?</span><span className="mostra-meta">21:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">reunião semanal toda terça 9h</span><span className="mostra-meta">09:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">lembra meu irmão do aniversário da mãe dia 27</span><span className="mostra-meta">18:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">vc acha o comprovante do aluguel?</span><span className="mostra-meta">15:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">anota a ideia da assinatura anual</span><span className="mostra-meta">23:17<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                </div>
            </div>

            <div className="mostra-trilho">
                <div className="mostra-fita mostra-f2">
                    <div className="mostra-fila">
                        <span className="mostra-bolha"><span className="mostra-txt">Uber 23,90, débito.</span><span className="mostra-meta">22:51<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Marca meu almoço com a Cláudia sexta.</span><span className="mostra-meta">10:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me avisa antes do alvará vencer</span><span className="mostra-meta">10:27<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Me avisa antes de vencer a fatura do cartão.</span><span className="mostra-meta">08:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Cria a tarefa de revisar o contrato.</span><span className="mostra-meta">11:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Preciso de um link de cobrança de R$ 1.280.</span><span className="mostra-meta">10:52<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Marca uma reunião com o time quinta 14h30.</span><span className="mostra-meta">08:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quero que o meu sócio veja só os gastos.</span><span className="mostra-meta">16:42<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Me manda tudo o que tem da reforma.</span><span className="mostra-meta">19:14<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me lembra do remedio todo dia 20h</span><span className="mostra-meta">19:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">vou te mandar a foto da nota do posto</span><span className="mostra-meta">15:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">no crédito, quanto já foi esse mês?</span><span className="mostra-meta">12:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me manda a ata da reunião de ontem</span><span className="mostra-meta">10:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">lembra os alunos da mensalidade dia 5</span><span className="mostra-meta">08:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">o que ta atrasado no projeto do site?</span><span className="mostra-meta">17:29<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                    
                    <div className="mostra-fila" aria-hidden="true">
                        <span className="mostra-bolha"><span className="mostra-txt">Uber 23,90, débito.</span><span className="mostra-meta">22:51<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Marca meu almoço com a Cláudia sexta.</span><span className="mostra-meta">10:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me avisa antes do alvará vencer</span><span className="mostra-meta">10:27<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Me avisa antes de vencer a fatura do cartão.</span><span className="mostra-meta">08:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Cria a tarefa de revisar o contrato.</span><span className="mostra-meta">11:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Preciso de um link de cobrança de R$ 1.280.</span><span className="mostra-meta">10:52<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Marca uma reunião com o time quinta 14h30.</span><span className="mostra-meta">08:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Quero que o meu sócio veja só os gastos.</span><span className="mostra-meta">16:42<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Me manda tudo o que tem da reforma.</span><span className="mostra-meta">19:14<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me lembra do remedio todo dia 20h</span><span className="mostra-meta">19:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">vou te mandar a foto da nota do posto</span><span className="mostra-meta">15:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">no crédito, quanto já foi esse mês?</span><span className="mostra-meta">12:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me manda a ata da reunião de ontem</span><span className="mostra-meta">10:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">lembra os alunos da mensalidade dia 5</span><span className="mostra-meta">08:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">o que ta atrasado no projeto do site?</span><span className="mostra-meta">17:29<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                </div>
            </div>

            <div className="mostra-trilho">
                <div className="mostra-fita mostra-f3">
                    <div className="mostra-fila">
                        <span className="mostra-bolha"><span className="mostra-txt">quanto sobrou pra fechar o mes? 😬</span><span className="mostra-meta">21:36<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">acha o documento do carro, o CRLV</span><span className="mostra-meta">16:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">poe o dentista no meu google agenda</span><span className="mostra-meta">15:02<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">reenvia o link de cobrança pra Renata</span><span className="mostra-meta">18:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Paguei 1.240,00 de aluguel hoje.</span><span className="mostra-meta">13:31<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">chama o Douglas e a Bia pra sexta 16h</span><span className="mostra-meta">16:26<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">novo projeto: mudança do escritório</span><span className="mostra-meta">10:03<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Theo, quem tem acesso à conta?</span><span className="mostra-meta">11:06<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Compara meu gasto com o do mês passado.</span><span className="mostra-meta">09:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Sofi, me manda o resumo do dia todo dia às 7h.</span><span className="mostra-meta">07:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Preciso da nota fiscal do notebook.</span><span className="mostra-meta">11:19<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">toda segunda tem 89,90 da academia</span><span className="mostra-meta">07:38<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me lembra de pagar o INSS dia 20</span><span className="mostra-meta">11:28<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">a reunião de sexta pode virar 15h?</span><span className="mostra-meta">14:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">nao me deixa esquecer de ligar pro contador</span><span className="mostra-meta">18:26<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                    
                    <div className="mostra-fila" aria-hidden="true">
                        <span className="mostra-bolha"><span className="mostra-txt">quanto sobrou pra fechar o mes? 😬</span><span className="mostra-meta">21:36<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">acha o documento do carro, o CRLV</span><span className="mostra-meta">16:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">poe o dentista no meu google agenda</span><span className="mostra-meta">15:02<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">reenvia o link de cobrança pra Renata</span><span className="mostra-meta">18:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Paguei 1.240,00 de aluguel hoje.</span><span className="mostra-meta">13:31<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">chama o Douglas e a Bia pra sexta 16h</span><span className="mostra-meta">16:26<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">novo projeto: mudança do escritório</span><span className="mostra-meta">10:03<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Theo, quem tem acesso à conta?</span><span className="mostra-meta">11:06<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Compara meu gasto com o do mês passado.</span><span className="mostra-meta">09:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Sofi, me manda o resumo do dia todo dia às 7h.</span><span className="mostra-meta">07:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">Preciso da nota fiscal do notebook.</span><span className="mostra-meta">11:19<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">toda segunda tem 89,90 da academia</span><span className="mostra-meta">07:38<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">me lembra de pagar o INSS dia 20</span><span className="mostra-meta">11:28<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">a reunião de sexta pode virar 15h?</span><span className="mostra-meta">14:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                        <span className="mostra-bolha"><span className="mostra-txt">nao me deixa esquecer de ligar pro contador</span><span className="mostra-meta">18:26<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></span>
                    </div>
                </div>
            </div>
        </div>

        <a className="hero-btn mostra-btn" href="/como-usar"><span>Veja o que dá para pedir</span></a>
    </section>

    <section className="of-section" id="openFinanceSection">
        <div className="of-bancos">
            <p className="of-bancos-nota">Saiba exatamente para onde vai seu dinheiro<br />sem precisar somar faturas manualmente.</p>
            <div className="of-bancos-trilho">
                <div className="of-bancos-fita" aria-hidden="true">
                    
                    <div className="of-bancos-fila">
                        <img className="of-bancos-logo is-itau" src="/meuassessor/images/bancos/itau.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bradesco" src="/meuassessor/images/bancos/bradesco.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bb" src="/meuassessor/images/bancos/bb.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-santander" src="/meuassessor/images/bancos/santander.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-nubank" src="/meuassessor/images/bancos/nubank.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicoob" src="/meuassessor/images/bancos/sicoob.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-btg" src="/meuassessor/images/bancos/btg.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-caixa" src="/meuassessor/images/bancos/caixa.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-xp" src="/meuassessor/images/bancos/xp.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-c6" src="/meuassessor/images/bancos/c6.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicredi" src="/meuassessor/images/bancos/sicredi.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-inter" src="/meuassessor/images/bancos/inter.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </div>
                    
                    <div className="of-bancos-fila">
                        <img className="of-bancos-logo is-itau" src="/meuassessor/images/bancos/itau.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bradesco" src="/meuassessor/images/bancos/bradesco.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bb" src="/meuassessor/images/bancos/bb.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-santander" src="/meuassessor/images/bancos/santander.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-nubank" src="/meuassessor/images/bancos/nubank.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicoob" src="/meuassessor/images/bancos/sicoob.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-btg" src="/meuassessor/images/bancos/btg.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-caixa" src="/meuassessor/images/bancos/caixa.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-xp" src="/meuassessor/images/bancos/xp.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-c6" src="/meuassessor/images/bancos/c6.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicredi" src="/meuassessor/images/bancos/sicredi.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-inter" src="/meuassessor/images/bancos/inter.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </div>
                    
                    <div className="of-bancos-fila">
                        <img className="of-bancos-logo is-itau" src="/meuassessor/images/bancos/itau.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bradesco" src="/meuassessor/images/bancos/bradesco.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-bb" src="/meuassessor/images/bancos/bb.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-santander" src="/meuassessor/images/bancos/santander.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-nubank" src="/meuassessor/images/bancos/nubank.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicoob" src="/meuassessor/images/bancos/sicoob.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-btg" src="/meuassessor/images/bancos/btg.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-caixa" src="/meuassessor/images/bancos/caixa.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-xp" src="/meuassessor/images/bancos/xp.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-c6" src="/meuassessor/images/bancos/c6.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-sicredi" src="/meuassessor/images/bancos/sicredi.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                        <img className="of-bancos-logo is-inter" src="/meuassessor/images/bancos/inter.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </div>
                </div>
            </div>
        </div>

        <div className="of-row">

            <article className="of-card" id="ofCardCartao">

                <button type="button" className="of-abrir" id="ofAbrirCartao"
                        aria-haspopup="dialog" aria-controls="ofModalCartao"
                        aria-label="Abrir detalhes sobre a conexão com os bancos">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                              stroke="currentColor" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="of-stage of-stage-cartao" aria-hidden="true">
                    <div className="ofc-cena">
                        <div className="ofc-tilt">
                            <div className="ofc-flutua">
                            <div className="ofc-cartao">
                                <span className="ofc-verso"></span>
                                <span className="ofc-face">
                                    <span className="ofc-brilho"></span>
                                    <svg className="ofc-chip" viewBox="0 0 44 34">
                                        <defs>
                                            <linearGradient id="ofcChipGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0" stop-color="#e9e9ed"/>
                                                <stop offset="0.55" stop-color="#b4b4bd"/>
                                                <stop offset="1" stop-color="#d9d9df"/>
                                            </linearGradient>
                                        </defs>
                                        <rect x="0.7" y="0.7" width="42.6" height="32.6" rx="7" fill="url(#ofcChipGrad)"/>
                                        <path d="M1 11.4h12.3M1 22.6h12.3M30.7 11.4H43M30.7 22.6H43M22 1.2v6.6M22 26.2v6.6" stroke="rgba(12,12,16,0.5)" strokeWidth="1.3" fill="none"/>
                                        <rect x="13.3" y="7.8" width="17.4" height="18.4" rx="4.2" stroke="rgba(12,12,16,0.5)" strokeWidth="1.3" fill="none"/>
                                    </svg>
                                    <svg className="ofc-nfc" viewBox="0 0 18 24" fill="none">
                                        <path d="M3 8.4a6.5 6.5 0 0 1 0 7.2M6.9 5.3a11.6 11.6 0 0 1 0 13.4M10.8 2.3a17 17 0 0 1 0 19.4" stroke="rgba(255,255,255,0.72)" strokeWidth="1.9" strokeLinecap="round"/>
                                    </svg>
                                    
                                    <svg className="ofc-logo" viewBox="0 0 1000 324.68">
                                        <defs>
                                            <linearGradient id="ofcVisaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0" stop-color="#f2f2f5"/>
                                                <stop offset="1" stop-color="#b4b4bd"/>
                                            </linearGradient>
                                        </defs>
                                        <path fill="url(#ofcVisaGrad)" d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"/>
                                    </svg>
                                </span>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="of-text">
                    <h3 className="of-title">Organize todos os seus cartões e contas dos bancos em um só lugar.</h3>
                    <p className="of-desc">Conectado com 114 bancos pelo Open Finance do Banco Central. Tudo se atualiza sozinho.</p>
                </div>
            </article>

            <article className="of-card" id="ofCardOrg">
                
                <button type="button" className="of-abrir" id="ofAbrirOrg"
                        aria-haspopup="dialog" aria-controls="ofModalOrg"
                        aria-label="Abrir detalhes sobre a organização dos gastos">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                              stroke="currentColor" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="of-stage of-stage-org" aria-hidden="true">
                  <div className="ofg" id="ofgCena">

                    <div className="ofg-compra">

                        <div className="ofg-pos">
                            <div className="ofg-tela">
                                <svg className="ofg-nfc" viewBox="0 0 18 24" fill="none" aria-hidden="true">
                                    <path d="M3 8.4a6.5 6.5 0 0 1 0 7.2M6.9 5.3a11.6 11.6 0 0 1 0 13.4M10.8 2.3a17 17 0 0 1 0 19.4"
                                          stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
                                </svg>

                                <span className="ofg-tela-valor">R$ 261,12</span>

                                <span className="ofg-slot ofg-tela-slot">
                                    <span className="ofg-cru">Aproxime</span>
                                    <span className="ofg-cat">
                                        <svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2.6 7.3 5.6 10.3 11.4 4"/></svg>
                                        Aprovado
                                    </span>
                                </span>
                            </div>

                            <div className="ofg-teclas">
                                <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                            </div>
                        </div>

                        <span className="ofg-ondas"><i></i><i></i><i></i></span>

                        <div className="ofg-cartao">
                            <span className="ofg-cartao-face">
                                <svg className="ofg-chip" viewBox="0 0 44 34" aria-hidden="true">
                                    <defs>
                                        <linearGradient id="ofgChipGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0" stop-color="#e9e9ed"/>
                                            <stop offset="0.55" stop-color="#b4b4bd"/>
                                            <stop offset="1" stop-color="#d9d9df"/>
                                        </linearGradient>
                                    </defs>
                                    <rect x="0.7" y="0.7" width="42.6" height="32.6" rx="7" fill="url(#ofgChipGrad)"/>
                                    <path d="M1 11.4h12.3M1 22.6h12.3M30.7 11.4H43M30.7 22.6H43M22 1.2v6.6M22 26.2v6.6" stroke="rgba(12,12,16,0.5)" strokeWidth="1.3" fill="none"/>
                                    <rect x="13.3" y="7.8" width="17.4" height="18.4" rx="4.2" stroke="rgba(12,12,16,0.5)" strokeWidth="1.3" fill="none"/>
                                </svg>
                                <svg className="ofg-cartao-nfc" viewBox="0 0 18 24" fill="none" aria-hidden="true">
                                    <path d="M3 8.4a6.5 6.5 0 0 1 0 7.2M6.9 5.3a11.6 11.6 0 0 1 0 13.4M10.8 2.3a17 17 0 0 1 0 19.4" stroke="rgba(255,255,255,0.72)" strokeWidth="1.9" strokeLinecap="round"/>
                                </svg>
                                <svg className="ofg-visa" viewBox="0 0 1000 324.68" aria-hidden="true">
                                    <defs>
                                        <linearGradient id="ofgVisaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0" stop-color="#f2f2f5"/>
                                            <stop offset="1" stop-color="#b4b4bd"/>
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#ofgVisaGrad)" d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"/>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="ofg-dash">

                        <div className="ofg-painel">
                            <div className="ofg-topo">
                                
                                <div className="ofg-topo-linha">
                                    <span className="ofg-mes">Fatura de agosto</span>
                                    <span className="ofg-conta">final 4416</span>
                                </div>
                                
                                <span className="ofg-slot ofg-total">
                                    <span className="ofg-cru">R$ 5.418,60</span>
                                    <span className="ofg-cat">R$ 5.679,72</span>
                                </span>
                            </div>

                            <div className="ofg-lista">
                                <div className="ofg-trilho">
                                    <article className="ofg-linha">
                                        <div className="ofg-cabeca">
                                            <span className="ofg-nome">Uber</span>
                                            <span className="ofg-valor">R$ 24,90</span>
                                        </div>
                                        <span className="ofg-etiqueta">Transporte</span>
                                    </article>

                                    <article className="ofg-linha">
                                        <div className="ofg-cabeca">
                                            <span className="ofg-nome">Pão de Açúcar</span>
                                            <span className="ofg-valor">R$ 318,47</span>
                                        </div>
                                        <span className="ofg-etiqueta">Mercado</span>
                                    </article>

                                </div>
                            </div>
                        </div>

                        <article className="ofg-nova">
                            <div className="ofg-cabeca">
                                <span className="ofg-slot ofg-nome-slot">
                                    <span className="ofg-cru">SEPHORA BRASIL 0834 SP BR</span>
                                    <span className="ofg-cat">Sephora</span>
                                </span>
                                <span className="ofg-valor">R$ 261,12</span>
                            </div>
                            <span className="ofg-slot ofg-sub-slot">
                                <span className="ofg-cru">16 ago · 21:04 · crédito</span>
                                <span className="ofg-cat">Beleza</span>
                            </span>
                        </article>
                    </div>

                  </div>
                </div>
                <div className="of-text">
                    <h3 className="of-title">Cada gasto já entra organizado na categoria certa, sem você digitar nada.</h3>
                    <p className="of-desc">O Martin, seu assessor financeiro, reconhece o que se repete e projeta os próximos meses.</p>
                </div>
            </article>

            <article className="of-card" id="ofCardConversa">
                
                <button type="button" className="of-abrir" id="ofAbrirConversa"
                        aria-haspopup="dialog" aria-controls="ofModalConversa"
                        aria-label="Abrir detalhes sobre a conversa no WhatsApp">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                              stroke="currentColor" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="of-stage of-stage-conversa" aria-hidden="true">
                  <div className="ofr" id="ofrCena">

                    <div className="ofr-tela">
                        
                        <div className="ofr-topo">
                            <span className="ofr-avatar">
                                <svg viewBox="0 0 16 16" fill="none">
                                    <circle cx="6.1" cy="5.4" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="M1.6 13.4c0-2.3 2-3.7 4.5-3.7s4.5 1.4 4.5 3.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                    <path d="M11 3.4a2.2 2.2 0 0 1 0 4.1M12.2 9.9c1.5.4 2.5 1.6 2.5 3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                </svg>
                            </span>
                            <div>
                                <b>Simplific Pro</b>
                                <span>Theo, Martin, Sofi, Luna</span>
                            </div>
                        </div>

                        <span className="ofr-dia">hoje</span>

                        <div className="ofr-fio">
                            
                            <div className="ofr-vao ofr-vao-voce">
                                <div className="ofr-bolha ofr-voce">
                                    <span className="ofr-fala">Quanto que eu tenho de gasto parcelado esse mês?</span>
                                    <i>09:41
                                        <svg className="ofr-visto" viewBox="0 0 16 11" fill="none">
                                            <path d="M1 6.1 3.6 8.7 8.7 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M6.4 6.1 9 8.7 14.6 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                </div>
                            </div>

                            <div className="ofr-vao ofr-vao-martin">
                                <div className="ofr-bolha ofr-martin">
                                    <em>Martin</em>
                                    <span className="ofr-slot">
                                        <span className="ofr-pontos"><i></i><i></i><i></i></span>
                                        <span className="ofr-resp">São 4 compras parceladas rodando. Montei o mês a mês até dezembro.</span>
                                    </span>
                                </div>
                            </div>

                            <div className="ofr-vaga"></div>
                        </div>

                        <div className="ofr-barra">
                            <span className="ofr-campo"><span id="ofrTexto"></span><i className="ofr-caret"></i></span>
                            <span className="ofr-enviar">
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="ofr-doc">
                        <div className="ofr-capa">
                            <span className="ofr-capa-topo">
                                <i className="ofr-ic">
                                    <svg viewBox="0 0 14 16" fill="none">
                                        <path d="M2 1.6h5.6L12 5.8v8.6H2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                        <path d="M7.6 1.6v4.2H12M4.4 9h5.2M4.4 11.6h3.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                    </svg>
                                </i>
                                <b>Gastos parcelados</b>
                            </span>

                            <span className="ofr-capa-meio">
                                <strong>R$ 2.847,30</strong>
                                
                                <span className="ofr-mini">
                                    <i style={{'--h': '100%'}}></i><i style={{'--h': '62%'}}></i><i style={{'--h': '33%'}}></i><i style={{'--h': '14%'}}></i><i style={{'--h': '0%'}}></i>
                                </span>
                            </span>

                            <span className="ofr-capa-pe">agosto · 4 compras<i>09:41</i></span>
                        </div>

                        <div className="ofr-rel">
                            <div className="ofr-rel-topo">
                                <i>
                                    <svg viewBox="0 0 12 12" fill="none">
                                        <path d="M7.6 1.8 3.4 6l4.2 4.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </i>
                                <b>Gastos parcelados</b>
                            </div>

                            <div className="ofr-rel-valor">
                                <strong>R$ 2.847,30</strong>
                                <span className="ofr-sub">4 compras · a última fecha em novembro</span>
                            </div>

                            <ul className="ofr-lista">
                                <li>
                                    <span className="ofr-li-topo"><span>Apple Store</span><b>R$ 1.089,90</b></span>
                                </li>
                                <li>
                                    <span className="ofr-li-topo"><span>Latam</span><b>R$ 812,00</b></span>
                                </li>
                                <li>
                                    <span className="ofr-li-topo"><span>Tok&amp;Stok</span><b>R$ 558,20</b></span>
                                </li>
                                <li>
                                    <span className="ofr-li-topo"><span>Decathlon</span><b>R$ 387,20</b></span>
                                </li>
                            </ul>

                            <div className="ofr-proj">
                                <span className="ofr-rot">Já comprometido por mês</span>
                                
                                <div className="ofr-cols">
                                    <div className="ofr-colu" style={{'--b': '42px'}}><b>R$ 2.847,30</b><i></i></div>
                                    <div className="ofr-colu is-prev" style={{'--b': '26px'}}><b>R$ 1.757,40</b><i></i></div>
                                    <div className="ofr-colu is-prev" style={{'--b': '14px'}}><b>R$ 945,40</b><i></i></div>
                                    <div className="ofr-colu is-prev" style={{'--b': '6px'}}><b>R$ 387,20</b><i></i></div>
                                    <div className="ofr-colu is-prev" style={{'--b': '0px'}}><b>R$ 0</b><i></i></div>
                                </div>
                                <div className="ofr-meses">
                                    <span>ago</span><span>set</span><span>out</span><span>nov</span><span>dez</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <span className="ofr-mao"><i></i></span>

                  </div>
                </div>
                <div className="of-text">
                    <h3 className="of-title">Tire dúvidas sobre o seu dinheiro com os assessores, direto no WhatsApp.</h3>
                    <p className="of-desc">A resposta chega na hora, com seus números na mão. Se algo foge do padrão, eles avisam.</p>
                </div>
            </article>

        </div>

        <a className="hero-btn of-btn cta-forte" href="#planos"><span>Contratar minha equipe</span></a>
    </section>

    <section className="gd-section" id="graficosSection">

        <header className="gd-topo">
            <h2 className="gd-headline"><span className="hl-so-desktop">Quer ver apenas os números que importam para você? Peça ao Martin e ele monta um painel personalizado para você.</span><span className="hl-so-mobile">Crie painéis personalizados para ver apenas o que importa para você.</span></h2>
        </header>

        <div className="gd-palco" id="gdPalco" data-fase="repouso" data-pilula="cheia" data-ciclo="1" aria-hidden="true">

            <div className="gd-pilula">
                
                <canvas className="gd-cometa" aria-hidden="true"></canvas>
                <svg className="gd-balao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                    <path d="M5.9 3.5H14.1A2.9 2.9 0 0 1 17 6.4V11A2.9 2.9 0 0 1 14.1 13.9H9.3L5.8 16.6 6.4 13.9H5.9A2.9 2.9 0 0 1 3 11V6.4A2.9 2.9 0 0 1 5.9 3.5Z"/>
                </svg>
                <span className="gd-campo"><span className="gd-texto" id="gdTexto">Monta uma visão do meu fluxo de caixa</span><i className="gd-cursor"></i></span>
                <span className="gd-enviar">
                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <path d="M10 15.4V5.2"/>
                        <path d="M5.7 9.3 10 4.9l4.3 4.4"/>
                    </svg>
                </span>
            </div>

            <div className="gd-janela">
                <div className="gd-barra">
                    <span className="gd-pontos"><i></i><i></i><i></i></span>
                    <span className="gd-endereco">meuassessor.com</span>
                </div>

                <div className="gd-viewport">

                    <article className="gd-tela gd-tela--fluxo is-vez">
                        <header className="gd-cab">
                            <span className="gd-tit">Fluxo de caixa</span>
                            <span className="gd-periodo">· março a agosto</span>
                            <span className="gd-salvar">Salvar painel</span>
                        </header>

                        <div className="gd-kpis">
                            <div className="gd-w gd-kpi" style={{'--gd-i': '0'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Entradas</span>
                                        <span className="gd-wsub">01 a 31/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <span className="gd-num">R$ 18.240</span>
                                <span className="gd-var gd-var--alta">+8,6% vs. julho</span>
                            </div>
                            <div className="gd-w gd-kpi" style={{'--gd-i': '1'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Saídas</span>
                                        <span className="gd-wsub">01 a 31/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <span className="gd-num">R$ 13.930</span>
                                
                                <span className="gd-var gd-var--baixa">+3,2% vs. julho</span>
                            </div>
                            <div className="gd-w gd-kpi gd-kpi--forte" style={{'--gd-i': '2'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Saldo do mês</span>
                                        <span className="gd-wsub">entradas menos saídas</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <span className="gd-num">R$ 4.310</span>
                                <span className="gd-var gd-var--alta">+30,6% vs. julho</span>
                            </div>
                        </div>

                        <div className="gd-w gd-carta gd-carta--fluxo" style={{'--gd-i': '3'}}>
                            <div className="gd-whead">
                                <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                <span className="gd-wtxt">
                                    <span className="gd-wtit">Fluxo mensal 6m</span>
                                    <span className="gd-wsub">março a agosto de 2026</span>
                                </span>
                                <span className="gd-menu"><i></i><i></i><i></i></span>
                            </div>

                            <div className="gd-graf">
                                <div className="gd-ycol">
                                    <span style={{bottom: '100%'}}>20 mil</span>
                                    <span style={{bottom: '75%'}}>15 mil</span>
                                    <span style={{bottom: '50%'}}>10 mil</span>
                                    <span style={{bottom: '25%'}}>5 mil</span>
                                    <span style={{bottom: '0%'}}>R$ 0</span>
                                </div>
                                <div className="gd-plot">
                                    <i className="gd-grade" style={{bottom: '100%'}}></i>
                                    <i className="gd-grade" style={{bottom: '75%'}}></i>
                                    <i className="gd-grade" style={{bottom: '50%'}}></i>
                                    <i className="gd-grade" style={{bottom: '25%'}}></i>
                                    <i className="gd-grade gd-grade--chao" style={{bottom: '0%'}}></i>
                                    <div className="gd-barras gd-barras--par">
                                        <div className="gd-bgrupo" style={{'--gd-n': '0'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '56%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '54.5%'}}></span>
                                        </div>
                                        <div className="gd-bgrupo" style={{'--gd-n': '1'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '69.5%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '58.5%'}}></span>
                                        </div>
                                        <div className="gd-bgrupo" style={{'--gd-n': '2'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '65.5%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '62%'}}></span>
                                        </div>
                                        <div className="gd-bgrupo" style={{'--gd-n': '3'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '78%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '60.5%'}}></span>
                                        </div>
                                        <div className="gd-bgrupo" style={{'--gd-n': '4'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '84%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '67.5%'}}></span>
                                        </div>
                                        <div className="gd-bgrupo" style={{'--gd-n': '5'}}>
                                            <span className="gd-bar gd-bar--azul" style={{'--gd-h': '91.2%'}}></span>
                                            <span className="gd-bar gd-bar--menta" style={{'--gd-h': '69.65%'}}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="gd-eixo gd-eixo--seis">
                                <span>mar</span><span>abr</span><span>mai</span><span>jun</span><span>jul</span><span>ago</span>
                            </div>

                            <div className="gd-pontinhos">
                                <span className="gd-ponto"><i className="gd-bolha gd-bolha--azul"></i>Entradas</span>
                                <span className="gd-ponto"><i className="gd-bolha gd-bolha--menta"></i>Saídas</span>
                            </div>
                        </div>
                    </article>

                    <article className="gd-tela gd-tela--gastos">
                        <header className="gd-cab">
                            <span className="gd-tit">Gastos por categoria</span>
                            <span className="gd-periodo">· agosto</span>
                            <span className="gd-salvar">Salvar painel</span>
                        </header>

                        <div className="gd-duas">
                            <div className="gd-w gd-carta gd-carta--donut" style={{'--gd-i': '1'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Despesas por categoria</span>
                                        <span className="gd-wsub">01 a 31/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <div className="gd-donut">
                                    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
                                        
                                        <circle className="gd-fatia gd-fatia--1" style={{'--gd-len': '81.83', '--gd-dur': '322ms', '--gd-off': '0ms'}} cx="60" cy="60" r="42" transform="rotate(-90 60 60)" stroke-dasharray="81.83 264"/>
                                        <circle className="gd-fatia gd-fatia--2" style={{'--gd-len': '66.85', '--gd-dur': '263ms', '--gd-off': '322ms'}} cx="60" cy="60" r="42" transform="rotate(24.36 60 60)" stroke-dasharray="66.85 264"/>
                                        <circle className="gd-fatia gd-fatia--3" style={{'--gd-len': '48.95', '--gd-dur': '193ms', '--gd-off': '585ms'}} cx="60" cy="60" r="42" transform="rotate(118.29 60 60)" stroke-dasharray="48.95 264"/>
                                        <circle className="gd-fatia gd-fatia--4" style={{'--gd-len': '34.34', '--gd-dur': '135ms', '--gd-off': '778ms'}} cx="60" cy="60" r="42" transform="rotate(187.80 60 60)" stroke-dasharray="34.34 264"/>
                                        <circle className="gd-fatia gd-fatia--5" style={{'--gd-len': '21.92', '--gd-dur': '87ms', '--gd-off': '913ms'}} cx="60" cy="60" r="42" transform="rotate(237.37 60 60)" stroke-dasharray="21.92 264"/>
                                    </svg>
                                    <span className="gd-donut-meio">
                                        <b>32,2%</b>
                                        <em>Mercado</em>
                                    </span>
                                </div>
                                <div className="gd-pontinhos gd-pontinhos--duas">
                                    <span className="gd-ponto"><i className="gd-bolha gd-bolha--menta"></i>Mercado</span>
                                    <span className="gd-ponto"><i className="gd-bolha gd-bolha--azul"></i>Casa</span>
                                    <span className="gd-ponto"><i className="gd-bolha gd-bolha--roxo"></i>Restaurantes</span>
                                    <span className="gd-ponto"><i className="gd-bolha gd-bolha--rosa"></i>Transporte</span>
                                    <span className="gd-ponto"><i className="gd-bolha gd-bolha--amarelo"></i>Outros</span>
                                </div>
                                <span className="gd-nota">Mostrando as cinco maiores categorias</span>
                            </div>

                            <div className="gd-coluna">
                                <div className="gd-w gd-kpi gd-kpi--forte" style={{'--gd-i': '0'}}>
                                    <div className="gd-whead">
                                        <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                        <span className="gd-wtxt">
                                            <span className="gd-wtit">Total do mês</span>
                                            <span className="gd-wsub">01 a 31/08/2026</span>
                                        </span>
                                        <span className="gd-menu"><i></i><i></i><i></i></span>
                                    </div>
                                    <span className="gd-num">R$ 6.950</span>
                                    
                                    <span className="gd-var gd-var--baixa">+4,1% vs. julho</span>
                                </div>

                            <div className="gd-w gd-carta gd-carta--lista" style={{'--gd-i': '2'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Detalhe por categoria</span>
                                        <span className="gd-wsub">01 a 31/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <ul className="gd-lista">
                                    <li className="gd-item" style={{'--gd-n': '0'}}><i className="gd-marca gd-marca--1"></i><span className="gd-item-nome">Mercado</span><span className="gd-item-fat">32,2%</span><span className="gd-item-val">R$ 2.240</span></li>
                                    <li className="gd-item" style={{'--gd-n': '1'}}><i className="gd-marca gd-marca--2"></i><span className="gd-item-nome">Casa</span><span className="gd-item-fat">26,3%</span><span className="gd-item-val">R$ 1.830</span></li>
                                    <li className="gd-item" style={{'--gd-n': '2'}}><i className="gd-marca gd-marca--3"></i><span className="gd-item-nome">Restaurantes</span><span className="gd-item-fat">19,3%</span><span className="gd-item-val">R$ 1.340</span></li>
                                    <li className="gd-item" style={{'--gd-n': '3'}}><i className="gd-marca gd-marca--4"></i><span className="gd-item-nome">Transporte</span><span className="gd-item-fat">13,5%</span><span className="gd-item-val">R$ 940</span></li>
                                    <li className="gd-item" style={{'--gd-n': '4'}}><i className="gd-marca gd-marca--5"></i><span className="gd-item-nome">Outros</span><span className="gd-item-fat">8,7%</span><span className="gd-item-val">R$ 600</span></li>
                                </ul>
                            </div>
                            </div>
                        </div>
                    </article>

                    <article className="gd-tela gd-tela--transf">
                        <header className="gd-cab">
                            <span className="gd-tit">Transferências para Ana</span>
                            <span className="gd-periodo">· esta semana</span>
                            <span className="gd-salvar">Salvar painel</span>
                        </header>

                        <div className="gd-w gd-carta gd-carta--barras" style={{'--gd-i': '0'}}>
                            <div className="gd-whead">
                                <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                <span className="gd-wtxt">
                                    <span className="gd-wtit">Enviado por dia</span>
                                    <span className="gd-wsub">24 a 30/08/2026</span>
                                </span>
                                <span className="gd-menu"><i></i><i></i><i></i></span>
                            </div>

                            <div className="gd-graf">
                                <div className="gd-ycol">
                                    <span style={{bottom: '84%'}}>240</span>
                                    <span style={{bottom: '56%'}}>160</span>
                                    <span style={{bottom: '28%'}}>80</span>
                                    <span style={{bottom: '0%'}}>R$ 0</span>
                                </div>
                                <div className="gd-plot">
                                    <i className="gd-grade" style={{bottom: '84%'}}></i>
                                    <i className="gd-grade" style={{bottom: '56%'}}></i>
                                    <i className="gd-grade" style={{bottom: '28%'}}></i>
                                    <i className="gd-grade gd-grade--chao" style={{bottom: '0%'}}></i>
                                    <div className="gd-barras gd-barras--sete">
                                        <div className="gd-bcol" style={{'--gd-n': '0'}}><span className="gd-coroa">85</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '29.75%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '1'}}><span className="gd-coroa">40</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '14%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '2'}}><span className="gd-coroa">160</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '56%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '3'}}><span className="gd-coroa">75</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '26.25%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '4'}}><span className="gd-coroa">220</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '77%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '5'}}><span className="gd-coroa">130</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '45.5%'}}></span></div>
                                        <div className="gd-bcol" style={{'--gd-n': '6'}}><span className="gd-coroa">55</span><span className="gd-bar gd-bar--menta" style={{'--gd-h': '19.25%'}}></span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="gd-eixo gd-eixo--sete">
                                <span>seg</span><span>ter</span><span>qua</span><span>qui</span><span>sex</span><span>sáb</span><span>dom</span>
                            </div>

                            <div className="gd-pontinhos">
                                <span className="gd-ponto"><i className="gd-bolha gd-bolha--menta"></i>Enviado para Ana</span>
                            </div>
                        </div>

                        <div className="gd-kpis gd-kpis--dois">
                            <div className="gd-w gd-kpi gd-kpi--forte" style={{'--gd-i': '1'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Total da semana</span>
                                        <span className="gd-wsub">24 a 30/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <span className="gd-num">R$ 765</span>
                                
                                <span className="gd-var gd-var--alta">+10,9% vs. semana anterior</span>
                            </div>
                            <div className="gd-w gd-kpi" style={{'--gd-i': '2'}}>
                                <div className="gd-whead">
                                    <span className="gd-alca"><i></i><i></i><i></i><i></i><i></i><i></i></span>
                                    <span className="gd-wtxt">
                                        <span className="gd-wtit">Maior dia</span>
                                        <span className="gd-wsub">sexta, 28/08/2026</span>
                                    </span>
                                    <span className="gd-menu"><i></i><i></i><i></i></span>
                                </div>
                                <span className="gd-num">R$ 220</span>
                                
                                <span className="gd-var gd-var--neutra">29% da semana</span>
                            </div>
                        </div>
                    </article>

                </div>
            </div>

        </div>
    </section>

    <section className="ag-section" id="agendaSection" data-header="claro">
        <div className="ag-grade">

            <div className="ag-lado">
                
                <header className="ag-topo">
                    <h2 className="ag-headline">A Sofi mantém a sua agenda em dia por você.</h2>
                    <p className="ag-sub">Diga apenas o compromisso, o dia e a hora. A Sofi coloca tudo na sua agenda e cria o lembrete para você não esquecer.</p>
                </header>
            </div>

            <div className="ag-pilha">

                <article className="ag-card" data-ag="1" data-fase="off">
                    <div className="ag-tile">
                        <div className="ag-arte ag1" aria-hidden="true">

                            <div className="ag1-fala">
                                <div className="ag1-linha">
                                    <span className="ag1-play">
                                        <svg className="ag1-glifo ag1-play-on" viewBox="0 0 12 14"><path d="M2.2 1.5 10.6 7 2.2 12.5Z"/></svg>
                                        <svg className="ag1-glifo ag1-play-off" viewBox="0 0 12 14"><path d="M2.6 1.7h2.5v10.6H2.6ZM6.9 1.7h2.5v10.6H6.9Z"/></svg>
                                    </span>
                                    
                                    <span className="ag1-onda">
                                        <span className="ag1-barras"><i style={{'--h': '28%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '96%'}}></i><i style={{'--h': '90%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '64%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '54%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '18%'}}></i></span>
                                        <span className="ag1-barras ag1-lidas"><i style={{'--h': '28%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '96%'}}></i><i style={{'--h': '90%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '64%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '54%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '18%'}}></i></span>
                                        <i className="ag1-cabeca"></i>
                                    </span>
                                    <span className="ag1-dur">0:07</span>
                                </div>

                                <div className="ag1-fio"></div>
                                <p className="ag1-tr"><i style={{'--i': '0'}}>Marca</i> <i style={{'--i': '1'}}>o</i> <i style={{'--i': '2'}}>dentista</i> <i style={{'--i': '3'}}>quinta</i> <i style={{'--i': '4'}}>às</i> <i style={{'--i': '5'}}>três</i> <i style={{'--i': '6'}}>da</i> <i style={{'--i': '7'}}>tarde.</i></p>
                                
                                <div className="ag1-meta">
                                    <span>08:12</span>
                                    <svg className="ag1-visto" viewBox="0 0 16 11"><path d="M1.3 5.8 3.8 8.3 9.7 2.2"/><path d="M7.4 5.8 9.9 8.3 15.8 2.2"/></svg>
                                </div>
                            </div>

                            <div className="ag1-dig">
                                <span className="ag1-pontos"><i></i><i></i><i></i></span>
                            </div>

                            <div className="ag1-resp">
                                <span className="ag1-quem">Sofi</span>
                                <div className="ag1-ev">
                                    <i className="ag1-tarja"></i>
                                    <span className="ag1-ev-t">Dentista · quinta, 15:00</span>
                                </div>
                                <div className="ag1-pe">
                                    <span className="ag1-aviso">Te aviso às 14:00.</span>
                                    <span className="ag1-hora">08:13</span>
                                </div>
                            </div>

                        </div>
                    </div>
                    <h3 className="ag-titulo">Fale, e está marcado.</h3>
                    <p className="ag-desc">Manda um áudio ou um texto do jeito que vier na cabeça. A Sofi entende o dia e a hora, cria o compromisso e ainda te avisa antes de ele chegar.</p>
                </article>

                <article className="ag-card" data-ag="2" data-fase="off">
                    <div className="ag-tile">
                        <div className="ag-arte ag2" aria-hidden="true">

                            <div className="ag2-fone">
                                <div className="ag2-tela">
                                    <i className="ag2-ilha"></i>

                                    <div className="ag2-app ag2-zap">

                                        <header className="ag2-topo">
                                            <svg className="ag2-voltar" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>
                                            <span className="ag2-av">
                                                <img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" />
                                            </span>
                                            <span className="ag2-id">
                                                <b>Simplific Pro<svg className="ag2-selo" viewBox="0 0 24 24">
                                                    <path d="M12 1.4l2.4 1.75 2.94-.29 1.18 2.72 2.66 1.31-.63 2.9L22 12l-1.45 2.21.63 2.9-2.66 1.31-1.18 2.72-2.94-.29L12 22.6l-2.4-1.75-2.94.29-1.18-2.72-2.66-1.31.63-2.9L2 12l1.45-2.21-.63-2.9 2.66-1.31 1.18-2.72 2.94.29L12 1.4z" fill="#1d9bf0"/>
                                                    <path d="M10.6 15.5L7.4 12.3l1.3-1.3 1.9 1.9 4.7-4.7 1.3 1.3-6 6z" fill="#ffffff"/>
                                                </svg></b>
                                                <em>online</em>
                                            </span>
                                        </header>

                                        <div className="ag2-fluxo">

                                            <div className="ag2-audio">
                                                <div className="ag2-linha">
                                                    <span className="ag2-play">
                                                        <svg viewBox="0 0 12 14"><path d="M2.2 1.5 10.6 7 2.2 12.5Z"/></svg>
                                                    </span>
                                                    
                                                    <span className="ag2-onda">
                                                        <span className="ag2-barras"><i style={{'--h': '28%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '96%'}}></i><i style={{'--h': '90%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '64%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '54%'}}></i><i style={{'--h': '42%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '18%'}}></i></span>
                                                        <i className="ag2-cabeca"></i>
                                                    </span>
                                                    <span className="ag2-dur">0:07</span>
                                                </div>

                                                <div className="ag2-fio"></div>
                                                <p className="ag2-tr">Marca o dentista quinta às três da tarde.</p>

                                                <div className="ag2-meta">
                                                    <span>08:12</span>
                                                    <svg className="ag2-visto" viewBox="0 0 16 11"><path d="M1.3 5.8 3.8 8.3 9.7 2.2"/><path d="M7.4 5.8 9.9 8.3 15.8 2.2"/></svg>
                                                </div>
                                            </div>

                                            <div className="ag2-resp">
                                                <span className="ag2-quem">Sofi</span>
                                                <div className="ag2-ev">
                                                    <i className="ag2-tarja"></i>
                                                    <span className="ag2-ev-t">Dentista · quinta, 15:00</span>
                                                </div>
                                                <span className="ag2-aviso">Te aviso às 14:00.</span>
                                                <span className="ag2-hora">08:13</span>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="ag2-app ag2-gcal">

                                        <header className="ag2-gtopo">
                                            <svg className="ag2-menu" viewBox="0 0 18 12"><path d="M0 1h18M0 6h18M0 11h18"/></svg>
                                            <svg className="ag2-glogo" viewBox="0 0 200 200"><g transform="translate(3.75 3.75)"><path fill="#ffffff" d="M148.88,43.62l-47.37-5.26l-57.9,5.26L38.35,96.25l5.26,52.63l52.63,6.58l52.63-6.58l5.26-53.95L148.88,43.62z"/><path fill="#1a73e8" d="M65.21,125.28c-3.93-2.66-6.66-6.54-8.14-11.67l9.13-3.76c0.83,3.16,2.28,5.61,4.34,7.34c2.05,1.74,4.55,2.59,7.47,2.59c2.99,0,5.55-0.91,7.7-2.72s3.22-4.13,3.22-6.93c0-2.87-1.13-5.21-3.4-7.03s-5.11-2.72-8.5-2.72h-5.28v-9.04H76.5c2.92,0,5.38-0.79,7.38-2.37c2-1.58,3-3.74,3-6.49c0-2.45-0.9-4.39-2.68-5.86s-4.05-2.2-6.8-2.2c-2.68,0-4.82,0.71-6.39,2.15s-2.72,3.2-3.45,5.28l-9.04-3.76c1.2-3.4,3.4-6.39,6.62-8.99c3.22-2.59,7.34-3.9,12.34-3.9c3.7,0,7.03,0.71,9.97,2.15c2.95,1.43,5.26,3.42,6.93,5.95c1.67,2.54,2.5,5.38,2.5,8.54c0,3.22-0.78,5.95-2.33,8.18c-1.55,2.24-3.46,3.95-5.72,5.14v0.54c2.99,1.25,5.42,3.16,7.34,5.72c1.91,2.57,2.87,5.63,2.87,9.21s-0.91,6.78-2.72,9.58c-1.82,2.8-4.33,5.01-7.51,6.62c-3.2,1.6-6.79,2.42-10.78,2.42C73.41,129.26,69.14,127.93,65.21,125.28z"/><path fill="#1a73e8" d="M121.25,79.96l-9.97,7.25l-5.01-7.61l17.99-12.97h6.89v61.2h-9.89L121.25,79.96z"/><path fill="#ea4335" d="M148.88,196.25l47.37-47.37l-23.68-10.53l-23.68,10.53l-10.53,23.68L148.88,196.25z"/><path fill="#34a853" d="M33.09,172.57l10.53,23.68h105.26v-47.37H43.62L33.09,172.57z"/><path fill="#4285f4" d="M12.04-3.75C3.32-3.75-3.75,3.32-3.75,12.04v136.84l23.68,10.53l23.68-10.53V43.62h105.26l10.53-23.68L148.88-3.75H12.04z"/><path fill="#188038" d="M-3.75,148.88v31.58c0,8.72,7.07,15.79,15.79,15.79h31.58v-47.37H-3.75z"/><path fill="#fbbc04" d="M148.88,43.62v105.26h47.37V43.62l-23.68-10.53L148.88,43.62z"/><path fill="#1967d2" d="M196.25,43.62V12.04c0-8.72-7.07-15.79-15.79-15.79h-31.58v47.37H196.25z"/></g></svg>
                                            <span className="ag2-mes">Agosto</span>
                                            <svg className="ag2-lupa" viewBox="0 0 20 20"><circle cx="8.6" cy="8.6" r="6.1"/><path d="m13.2 13.2 4.3 4.3"/></svg>
                                        </header>

                                        <div className="ag2-semana">
                                            <span className="ag2-d"><i>D</i><b>16</b></span>
                                            <span className="ag2-d"><i>S</i><b>17</b></span>
                                            <span className="ag2-d"><i>T</i><b>18</b></span>
                                            <span className="ag2-d"><i>Q</i><b>19</b></span>
                                            <span className="ag2-d ag2-d-alvo"><i>Q</i><b>20</b></span>
                                            <span className="ag2-d"><i>S</i><b>21</b></span>
                                            <span className="ag2-d"><i>S</i><b>22</b></span>
                                        </div>
                                        <i className="ag2-gfio"></i>

                                        <div className="ag2-grade">
                                            <span className="ag2-h" data-h="1"><b>14:00</b><i></i></span>
                                            <span className="ag2-h" data-h="2"><b>15:00</b><i></i></span>
                                            <span className="ag2-h" data-h="3"><b>16:00</b><i></i></span>
                                            <div className="ag2-evento">
                                                <b>Dentista</b>
                                                <span>15:00 – 16:00</span>
                                                <i className="ag2-brilho"></i>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>

                            <div className="ag2-arrasto">
                                <div className="ag2-desvio">

                                    <div className="ag2-peca">
                                        <b>Dentista</b>
                                        <span>15:00 – 16:00</span>
                                    </div>

                                    <svg className="ag2-cursor" viewBox="0 0 12 19">
                                        <path d="M1 1v15.2l3.6-3.3 2.5 5.3 2.5-1.2-2.5-5.1h4.5z"/>
                                    </svg>

                                </div>
                            </div>

                        </div>
                    </div>
                    <h3 className="ag-titulo">Da mensagem direto pro Google Agenda.</h3>
                    <p className="ag-desc">Você marca pelo WhatsApp e o compromisso aparece lá, com horário e duração. Sem digitar duas vezes nem trocar de calendário.</p>
                </article>

                <article className="ag-card" data-ag="4" data-fase="off">
                    <div className="ag-tile">
                        <div className="ag-arte ag4" aria-hidden="true">

                            <div className="ag4-fone">
                                <div className="ag4-tela">
                                    <i className="ag4-ilha"></i>

                                    <header className="ag4-topo">
                                        <svg className="ag4-voltar" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>
                                        <span className="ag4-av">
                                            <img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" />
                                        </span>
                                        <span className="ag4-id">
                                            <b>Simplific Pro<svg className="ag4-selo" viewBox="0 0 24 24">
                                                <path d="M12 1.4l2.4 1.75 2.94-.29 1.18 2.72 2.66 1.31-.63 2.9L22 12l-1.45 2.21.63 2.9-2.66 1.31-1.18 2.72-2.94-.29L12 22.6l-2.4-1.75-2.94.29-1.18-2.72-2.66-1.31.63-2.9L2 12l1.45-2.21-.63-2.9 2.66-1.31 1.18-2.72 2.94.29L12 1.4z" fill="#1d9bf0"/>
                                                <path d="M10.6 15.5L7.4 12.3l1.3-1.3 1.9 1.9 4.7-4.7 1.3 1.3-6 6z" fill="#ffffff"/>
                                            </svg></b>
                                            <em>online</em>
                                        </span>
                                    </header>

                                    <div className="ag4-fluxo">

                                        <span className="ag4-dia">Hoje</span>

                                        <div className="ag4-dig">
                                            <span className="ag4-pontos"><i></i><i></i><i></i></span>
                                        </div>

                                        <div className="ag4-bolha">

                                            <span className="ag4-quem">Sofi</span>

                                            <span className="ag4-cab">Bom dia! Já organizei seu dia:</span>

                                            <span className="ag4-l" data-l="1"><b>08:30</b><span>- Reunião de diretoria</span></span>
                                            <span className="ag4-l" data-l="2"><b>11:00</b><span>- Call com investidor</span></span>
                                            <span className="ag4-l" data-l="3"><b>16:30</b><span>- Prazo do relatório</span></span>

                                            <span className="ag4-pe">07:00</span>

                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                    <h3 className="ag-titulo">Acorde já sabendo como vai ser o seu dia.</h3>
                    <p className="ag-desc">Toda manhã a Sofi manda os compromissos do dia em ordem, com as prioridades e os prazos que precisam de atenção.</p>
                </article>

                <article className="ag-card" data-ag="3" data-fase="off">
                    <div className="ag-tile">
                        <div className="ag-arte ag3" aria-hidden="true">

                            <div className="ag3-ped ag3-a1">
                                <div className="ag3-ped-linha">
                                    
                                    <span className="ag3-play">
                                        <svg className="ag3-glifo ag3-play-on" viewBox="0 0 12 14"><path d="M2.2 1.5 10.6 7 2.2 12.5Z"/></svg>
                                        <svg className="ag3-glifo ag3-play-off" viewBox="0 0 12 14"><path d="M2.6 1.7h2.5v10.6H2.6ZM6.9 1.7h2.5v10.6H6.9Z"/></svg>
                                    </span>
                                    
                                    <span className="ag3-onda">
                                        <span className="ag3-barras"><i style={{'--h': '26%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '36%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '62%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '82%'}}></i><i style={{'--h': '86%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '24%'}}></i></span>
                                        <span className="ag3-barras ag3-lidas"><i style={{'--h': '26%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '36%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '24%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '62%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '82%'}}></i><i style={{'--h': '86%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '24%'}}></i></span>
                                        <i className="ag3-cabeca"></i>
                                    </span>
                                    <span className="ag3-dur">0:04</span>
                                </div>

                                <div className="ag3-fio"></div>
                                <p className="ag3-tr"><i style={{'--i': '0'}}>Marca</i> <i style={{'--i': '1'}}>reunião</i> <i style={{'--i': '2'}}>com</i> <i style={{'--i': '3'}}>a</i> <i style={{'--i': '4'}}>Ana</i> <i style={{'--i': '5'}}>e</i> <i style={{'--i': '6'}}>o</i> <i style={{'--i': '7'}}>Lucas</i> <i style={{'--i': '8'}}>terça</i> <i style={{'--i': '9'}}>às</i> <i style={{'--i': '10'}}>dez.</i></p>

                                <div className="ag3-ped-meta">
                                    <span>17:23</span>
                                    <svg className="ag3-visto" viewBox="0 0 16 11"><path d="M1.3 5.8 3.8 8.3 9.7 2.2"/><path d="M7.4 5.8 9.9 8.3 15.8 2.2"/></svg>
                                </div>
                            </div>

                            <div className="ag3-dig ag3-a1">
                                <span className="ag3-pontos"><i></i><i></i><i></i></span>
                            </div>

                            <div className="ag3-msg ag3-conv ag3-a1">
                                <span className="ag3-nota">Reunião terça, 10:00. Convidei Ana e Lucas.</span>
                                <div className="ag3-pe">
                                    <span className="ag3-link">
                                        <svg className="ag3-cam" viewBox="0 0 20 13"><rect x="0.85" y="0.85" width="12.5" height="11.3" rx="2.6"/><path d="M13.35 4.9 18.95 2.05v8.9L13.35 8.1Z"/></svg>
                                        <span className="ag3-url">meet.google.com/qvp-mkzt</span>
                                    </span>
                                    <span className="ag3-hora">17:24</span>
                                </div>
                            </div>

                            <div className="ag3-dia"><span>terça-feira</span></div>

                            <div className="ag3-meet">
                                
                                <div className="ag3-lads">
                                    <span className="ag3-lad ag3-lad-a"><i className="ag3-ini">A</i><b>Ana</b></span>
                                    <span className="ag3-lad ag3-lad-s">
                                        <i className="ag3-av"><img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" /></i>
                                        <b>Sofi</b>
                                        <em className="ag3-mudo">
                                            <svg className="ag3-mic" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.41 3.86 3 5.27l6 6V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.09l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.09H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9l4.19 4.19 1.41-1.41z"/></svg>
                                        </em>
                                    </span>
                                    <span className="ag3-lad ag3-lad-l"><i className="ag3-ini">L</i><b>Lucas</b></span>
                                </div>
                                <div className="ag3-meet-pe">
                                    <span className="ag3-cod">qvp-mkzt</span>
                                    <span className="ag3-desliga">
                                        <svg className="ag3-fone" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>
                                    </span>
                                </div>
                            </div>

                            <div className="ag3-msg ag3-ata">
                                <div className="ag3-doc">
                                    <div className="ag3-doc-cab">
                                        <svg className="ag3-folha" viewBox="0 0 13 16"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                        <span className="ag3-doc-t">Ata da reunião</span>
                                        <span className="ag3-doc-d">47 min</span>
                                    </div>
                                    <span className="ag3-tar"><i></i><b>Ana</b> envia a proposta até sexta</span>
                                    <span className="ag3-tar"><i></i><b>Lucas</b> revisa o orçamento</span>
                                </div>
                                <div className="ag3-pe ag3-pe-ata">
                                    <span className="ag3-hora">10:51</span>
                                </div>
                            </div>

                        </div>
                    </div>
                    <h3 className="ag-titulo">Peça a reunião e só apareça na hora.</h3>
                    <p className="ag-desc">A Sofi cria o link do Meet, convida todo mundo pelo WhatsApp, lembra antes da hora e manda a ata no fim.</p>
                </article>

            </div>
        </div>

        <a className="hero-btn ag-btn cta-forte" href="#planos"><span>Contratar minha equipe</span></a>
    </section>

    <section className="emp-section" id="empSection">

        <header className="emp-topo">
            <h2 className="emp-headline">Cobrar, emitir a nota e ver o pagamento cair. Tudo pela mesma conversa.</h2>
            <p className="emp-sub">Você manda uma mensagem. O Martin cria a cobrança, a Rita emite a nota fiscal e o pagamento cai na sua conta — sem sair do WhatsApp.</p>
        </header>

        <div className="emp-palco" id="empPalco" data-fase="repouso" data-pilula="cheia" data-ciclo="1" aria-hidden="true">

            

            

            

            

            

            <div className="emp-cena">

                {/* A CENA DA COBRANÇA (12/09/2026). No lugar das janelas de navegador: o
                     pedido é digitado no pill (o contrato data-pilula continua o mesmo) e o
                     resultado acontece DENTRO DO WHATSAPP — o celular da vitrine com o balão
                     do hero (.chat-msg), o card de pagamento da home (.blk-b-*) e a tela da
                     nota fiscal que já vivia aqui (article.emp-tela--nota), agora abrindo
                     como documento ao lado do aparelho. Três batidas: o pedido, a equipe
                     assumindo (Martin → link, Rita → nota + PDF) e o pagamento caindo. O
                     cobranca.js marca is-vista passo a passo; sem script, tudo nasce visível. */}
                <div className="cob-cena" id="cobCena" aria-hidden="true">
                    <div className="cob-fone vit-fone">
                        <div className="vit-tela cob-tela">
                            <div className="chat-messages cob-conversa" id="cobConversa">
                                <div className="chat-msg user cob-msg" data-passo="1"><div className="chat-msg-text" id="cobPedido" data-texto="Tenho R$ 5.000 pra receber todo dia 10 do Carlos. Gera as cobranças e a nota fiscal.">Tenho R$ 5.000 pra receber todo dia 10 do Carlos. Gera as cobranças e a nota fiscal.</div><div className="chat-msg-time">09:12 <svg viewBox="0 0 16 11" width="16" height="11" fill="none" className="chat-msg-checks" aria-hidden="true"><path d="M1.5 5.5l2.5 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 5.5l2.5 2.5 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div></div>
                                <div className="chat-msg bot typing-indicator cob-msg" data-passo="2"><div className="chat-msg-header"><img src="/meuassessor/images/martin.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#00897B'}}>Martin</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Gerente financeiro</span></div><div className="chat-typing-dots"><span></span><span></span><span></span></div></div>
                                <div className="chat-msg bot cob-msg" data-passo="3"><div className="chat-msg-header"><img src="/meuassessor/images/martin.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#00897B'}}>Martin</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Gerente financeiro</span></div><div className="chat-msg-text">Fechado. Cobrança do <b>Carlos</b>: <b>R$ 5.000,00 todo dia 10</b>, a partir de outubro. O link já foi pra ele.</div><div className="chat-msg-time">09:12</div></div>
                                <div className="chat-msg bot cob-msg cob-card" data-passo="4"><span className="blk-b-corpo"><span className="blk-etiq cob-etiq">Link de cobrança · vence 10/10</span><span className="blk-b-valor">R$ 5.000,00</span><span className="blk-b-parcela">em até 10x · todo dia 10</span><span className="blk-b-botao" id="cobBotao">Pagar agora</span><span className="blk-bandeiras">
                                                <span className="blk-band blk-band--mc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.2 618"><rect x="364" y="66.1" fill="#FF5A00" width="270.4" height="485.8"/> <path fill="#EB001B" d="M382,309c0-98.7,46.4-186.3,117.6-242.9 C447.2,24.9,381.1,0,309,0C138.2,0,0,138.2,0,309s138.2,309,309,309c72.1,0,138.2-24.9,190.6-66.1C428.3,496.1,382,407.7,382,309z" /> <path fill="#F79E1B" d="M999.2,309c0,170.8-138.2,309-309,309 c-72.1,0-138.2-24.9-190.6-66.1c72.1-56.7,117.6-144.2,117.6-242.9S570.8,122.7,499.6,66.1C551.9,24.9,618,0,690.1,0 C861,0,999.2,139.1,999.2,309z"/></svg></span>
                                                <span className="blk-band blk-band--visa"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 324.68"><path fill="#1434cb" d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"/></svg></span>
                                                <span className="blk-band blk-band--elo"><svg viewBox="0 0 74 29" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M11.552 6.174a8.538 8.538 0 0 1 2.66-.42c4.06 0 7.449 2.824 8.225 6.58l5.753-1.15C26.87 4.801 21.115 0 14.213 0c-1.582 0-3.1.252-4.523.718l1.862 5.456z" fill="#FFCA05"/><path d="M4.872 24.667l3.938-4.353c-1.758-1.523-2.867-3.745-2.867-6.22 0-2.475 1.107-4.696 2.864-6.217L4.87 3.524C1.884 6.11 0 9.887 0 14.094c0 4.208 1.884 7.986 4.872 10.573" fill="#00A4DF"/><path d="M22.438 15.857c-.779 3.755-4.164 6.577-8.22 6.577a8.49 8.49 0 0 1-2.664-.423L9.69 27.473c1.422.466 2.944.717 4.527.717 6.894 0 12.648-4.797 13.973-11.176l-5.752-1.157z" fill="#EE4123"/><path d="M44.476 18.725l-.004.004-.163-.11c-.47.764-1.2 1.384-2.125 1.786-1.757.767-3.385.57-4.554-.46l-.107.164c-.002-.002-.002-.003-.004-.003l-1.994 2.996a8.524 8.524 0 0 0 1.585.872c2.203.92 4.456.877 6.676-.093 1.607-.699 2.866-1.765 3.728-3.116l-3.038-2.04zm-6.225-7.393c-1.855.8-2.812 2.549-2.615 4.599l7.86-3.398c-1.352-1.596-3.11-2.124-5.245-1.201zm-5.218 9.128a10.248 10.248 0 0 1-.596-1.153c-.907-2.115-.95-4.303-.185-6.404.842-2.304 2.45-4.068 4.529-4.966 2.613-1.13 5.502-.907 8.006.586 1.591.916 2.719 2.332 3.575 4.333.11.256.205.53.299.763l-15.628 6.84zm21.09-16.936v16.659l2.579 1.05-1.465 3.434-2.846-1.19c-.639-.279-1.074-.704-1.403-1.184-.315-.49-.55-1.16-.55-2.065V3.524h3.685zm6.68 12.415a4.722 4.722 0 0 0 1.6 3.552l-2.642 2.966a8.698 8.698 0 0 1-2.918-6.522 8.695 8.695 0 0 1 2.927-6.514l2.645 2.963a4.72 4.72 0 0 0-1.612 3.555zm4.7 4.728c2.272.002 4.168-1.615 4.61-3.766l3.883.796c-.81 3.969-4.308 6.954-8.497 6.95a8.628 8.628 0 0 1-2.75-.451l1.264-3.773c.468.156.97.243 1.49.244zm.012-13.428c4.192.003 7.686 3 8.485 6.974l-3.884.79a4.708 4.708 0 0 0-4.605-3.785 4.72 4.72 0 0 0-1.491.242l-1.252-3.777a8.62 8.62 0 0 1 2.747-.444z" fill="#000"/></g></svg></span>
                                                                                                
                                                                                                <span className="blk-band blk-band--amex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 997.5"><g transform="translate(-55.5,-1002.3)"><path fill="#016fd0" d="m55.5,1002.3 997.5,0 0,538.5 -49.4,77.1 49.4,68.7 0,313.2 -997.5,0 0-507.6L86.4,1456.7 55.5,1422.8Z"/><path fill="#fff" d="m249.1,1697.4 0-156.6 165.8,0 17.8,23.2 18.4-23.2 601.9,0 0,145.8c0,0 -15.7,10.6 -33.9,10.8l-333.3,0 -20.1-24.7 0,24.7 -65.7,0 0-42.1c0,0 -9,5.9 -28.4,5.9l-22.4,0 0,36.3 -99.5,0 -17.8-23.7 -18,23.7z"/><path fill="#fff" d="m55.5,1422.8 37.4-87.2 64.7,0 21.2,48.8 0-48.8 80.4,0 12.6,35.3 12.2-35.3 360.9,0 0,17.7c0,0 19-17.7 50.1-17.7l117.1,0.4 20.9,48.2 0-48.6 67.3,0 18.5,27.7 0-27.7 67.9,0 0,156.6 -67.9,0 -17.7-27.8 0,27.8 -98.8,0 -9.9-24.7 -26.6,0 -9.8,24.7 -67,0c-26.8,0 -44-17.4 -44-17.4l0,17.4 -101.1,0 -20.1-24.7 0,24.7 -375.8,0 -9.9-24.7 -26.5,0 -9.9,24.7 -46.2,0z"/><path fill="#016fd0" d="m106.1,1354.9 -50.4,117.3 32.8,0 9.3-23.5 54.1,0 9.3,23.5 33.6,0 -50.4-117.3 -38.2,0zm18.7,27.3 16.5,41 -33,0 16.5-41z"/><path fill="#016fd0" d="m198.2,1472.2 0-117.3 46.7,0.2 27.1,75.6 26.5-75.8 46.3,0 0,117.3 -29.3,0 0-86.4 -31.1,86.4 -25.7,0 -31.2-86.4 0,86.4z"/><path fill="#016fd0" d="m364.9,1472.2 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.5,0 0,24.7 -64.5,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m477.5,1354.9 0,117.3 29.3,0 0-41.7 12.3,0 35.2,41.7 35.8,0 -38.6-43.2c15.8-1.3 32.2-14.9 32.2-36 0-24.7 -19.4-38 -41-38l-65.2,0zm29.3,26.2 33.5,0c8,0 13.9,6.3 13.9,12.3 0,7.8 -7.6,12.3 -13.5,12.3l-33.9,0 0-24.7z"/><path fill="#016fd0" d="m625.6,1472.2 -29.9,0 0-117.3 29.9,0z"/><path fill="#016fd0" d="m696.6,1472.2 -6.5,0c-31.3,0 -50.2-24.6 -50.2-58.1 0-34.3 18.8-59.1 58.2-59.1l32.4,0 0,27.8 -33.6,0c-16,0 -27.4,12.5 -27.4,31.6 0,22.7 13,32.2 31.6,32.2l7.7,0z"/><path fill="#016fd0" d="m760.4,1354.9 -50.4,117.3 32.8,0 9.3-23.5 54.1,0 9.3,23.5 33.6,0 -50.4-117.3 -38.2,0zm18.7,27.3 16.5,41 -33,0 16.5-41z"/><path fill="#016fd0" d="m852.4,1472.2 0-117.3 37.3,0 47.6,73.7 0-73.7 29.3,0 0,117.3 -36.1,0 -48.8-75.6 0,75.6z"/><path fill="#016fd0" d="m269.2,1677.4 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.5,0 0,24.7 -64.5,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m737.9,1677.4 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.2,0 0,24.7 -64.2,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m368.6,1677.4 46.6-57.9 -47.7-59.4 36.9,0 28.4,36.7 28.5-36.7 35.5,0 -47.1,58.6 46.7,58.6 -36.9,0 -27.6-36.1 -26.9,36.1z"/><path fill="#016fd0" d="m499.9,1560.1 0,117.3 30.1,0 0-37 30.9,0c26.1,0 45.9-13.9 45.9-40.8 0-22.3 -15.5-39.4 -42.1-39.4l-64.8,0zm30.1,26.5 32.5,0c8.4,0 14.5,5.2 14.5,13.5 0,7.8 -6,13.5 -14.6,13.5l-32.4,0 0-27z"/><path fill="#016fd0" d="m619.4,1560.1 0,117.3 29.3,0 0-41.7 12.3,0 35.2,41.7 35.8,0 -38.6-43.2c15.8-1.3 32.2-14.9 32.2-36 0-24.7 -19.4-38 -41-38l-65.2,0zm29.3,26.2 33.5,0c8,0 13.9,6.3 13.9,12.3 0,7.8 -7.6,12.3 -13.5,12.3l-33.9,0 0-24.7z"/><path fill="#016fd0" d="m847.2,1677.4 0-25.5 58.7,0c8.7,0 12.4-4.7 12.4-9.8 0-4.9 -3.7-9.9 -12.4-9.9l-26.5,0c-23,0 -35.9-14 -35.9-35.1 0-18.8 11.8-36.9 46-36.9l57.1,0 -12.3,26.4 -49.4,0c-9.4,0 -12.3,5 -12.3,9.7 0,4.9 3.6,10.2 10.8,10.2l27.8,0c25.7,0 36.8,14.6 36.8,33.7 0,20.5 -12.4,37.3 -38.2,37.3z"/><path fill="#016fd0" d="m954.8,1677.4 0-25.5 58.7,0c8.7,0 12.4-4.7 12.4-9.8 0-4.9 -3.7-9.9 -12.4-9.9l-26.5,0c-23,0 -35.9-14 -35.9-35.1 0-18.8 11.8-36.9 46-36.9l57.1,0 -12.3,26.4 -49.4,0c-9.4,0 -12.3,5 -12.3,9.7 0,4.9 3.6,10.2 10.8,10.2l27.8,0c25.7,0 36.8,14.6 36.8,33.7 0,20.5 -12.4,37.3 -38.2,37.3z"/></g></svg></span></span></span></div>
                                <div className="chat-msg bot typing-indicator cob-msg" data-passo="5"><div className="chat-msg-header"><img src="/meuassessor/images/rita.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#E91E63'}}>Rita</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Assistente fiscal</span></div><div className="chat-typing-dots"><span></span><span></span><span></span></div></div>
                                <div className="chat-msg bot cob-msg" data-passo="6"><div className="chat-msg-header"><img src="/meuassessor/images/rita.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#E91E63'}}>Rita</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Assistente fiscal</span></div><div className="chat-msg-text">Nota emitida 🧾 <b>NFS-e nº 158</b> · R$ 5.000,00 · Carlos Mendes. O PDF já está aqui na conversa.</div><div className="chat-msg-time">09:13</div></div>
                                <div className="chat-msg bot cob-msg cob-arquivo" data-passo="7"><div className="chat-msg-header"><img src="/meuassessor/images/rita.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#E91E63'}}>Rita</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Assistente fiscal</span></div><div className="cob-pdf"><span className="cob-pdf-icone" aria-hidden="true">PDF</span><span className="cob-pdf-info"><span className="cob-pdf-nome">NFS-e-158-Carlos-Mendes.pdf</span><span className="cob-pdf-meta">1 página · 84 KB · PDF</span></span></div><div className="chat-msg-time">09:13</div></div>
                                <div className="chat-msg bot typing-indicator cob-msg" data-passo="9"><div className="chat-msg-header"><img src="/meuassessor/images/martin.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#00897B'}}>Martin</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Gerente financeiro</span></div><div className="chat-typing-dots"><span></span><span></span><span></span></div></div>
                                <div className="chat-msg bot cob-msg" data-passo="10"><div className="chat-msg-header"><img src="/meuassessor/images/martin.jpg" alt="" className="chat-msg-avatar" width="22" height="22" loading="lazy" decoding="async" /><span className="chat-msg-name" style={{color: '#00897B'}}>Martin</span><svg className="chat-msg-verified" aria-hidden="true"><use href="#vit-ic-selo"></use></svg><span className="chat-msg-role">· Gerente financeiro</span></div><div className="chat-msg-text">Pagamento confirmado ✅ O Carlos pagou o link: <b>R$ 5.000,00</b> na sua conta. Próxima cobrança: 10/11.</div><div className="chat-msg-time">10:41</div></div>
                            </div>
                        </div>
                        <img className="vit-moldura" src="/meuassessor/images/iphone.webp" alt="" loading="lazy" decoding="async" />
                    </div>
</div>

                
            </div>
        </div>

    </section>

    {/* BENEFÍCIOS, v2 (12/09/2026). O palco sticky de três atos (três telas de
         100vh) virou três cards com mini-cenas em loop, no regime do resto do
         site. Vem logo depois da cena da cobrança e mostra o que acontece
         DEPOIS da mensagem: o link pago, a nota emitida com o PDF no WhatsApp e
         a venda no cartão caindo em D+2. Os títulos são os já aprovados. As
         cenas são aria-hidden (título e parágrafo dizem o mesmo). No celular os
         cards deslizam (scroll-snap) com pontos. Motor: ben2.js. */}
    <section className="ben2-section" id="beneficiosSection">
        <header className="ben2-topo">
            <h2 className="ben2-headline">Você manda a mensagem. O resto acontece sozinho.</h2>
            <p className="ben2-sub">Link de pagamento pronto pra enviar, nota fiscal emitida sem outro aplicativo e a venda no cartão na sua conta em até dois dias úteis.</p>
        </header>
        <div className="ben2-grade" id="ben2Grade">
            <article className="ben2-card">
                <div className="ben2-cena" data-cena="link" aria-hidden="true">
                    <div className="bn2-bolha is-voce"><span className="bn2-txt">Cobra R$ 850 do João pela consultoria de agosto.</span><span className="bn2-meta">19:32<svg className="bn2-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></div>
                    <div className="bn2-link">
                        <span className="blk-etiq">Link de cobrança · vence 24/08</span>
                        <span className="blk-b-valor">R$ 850,00</span>
                        <span className="blk-b-parcela">em até 10x</span>
                        <span className="blk-b-botao">Pagar agora</span>
                        <span className="blk-bandeiras">
                            <span className="blk-band blk-band--mc"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 999.2 618"><rect x="364" y="66.1" fill="#FF5A00" width="270.4" height="485.8"/> <path fill="#EB001B" d="M382,309c0-98.7,46.4-186.3,117.6-242.9 C447.2,24.9,381.1,0,309,0C138.2,0,0,138.2,0,309s138.2,309,309,309c72.1,0,138.2-24.9,190.6-66.1C428.3,496.1,382,407.7,382,309z" /> <path fill="#F79E1B" d="M999.2,309c0,170.8-138.2,309-309,309 c-72.1,0-138.2-24.9-190.6-66.1c72.1-56.7,117.6-144.2,117.6-242.9S570.8,122.7,499.6,66.1C551.9,24.9,618,0,690.1,0 C861,0,999.2,139.1,999.2,309z"/></svg></span>
                            <span className="blk-band blk-band--visa"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 324.68"><path fill="#1434cb" d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z"/></svg></span>
                            <span className="blk-band blk-band--elo"><svg viewBox="0 0 74 29" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><path d="M11.552 6.174a8.538 8.538 0 0 1 2.66-.42c4.06 0 7.449 2.824 8.225 6.58l5.753-1.15C26.87 4.801 21.115 0 14.213 0c-1.582 0-3.1.252-4.523.718l1.862 5.456z" fill="#FFCA05"/><path d="M4.872 24.667l3.938-4.353c-1.758-1.523-2.867-3.745-2.867-6.22 0-2.475 1.107-4.696 2.864-6.217L4.87 3.524C1.884 6.11 0 9.887 0 14.094c0 4.208 1.884 7.986 4.872 10.573" fill="#00A4DF"/><path d="M22.438 15.857c-.779 3.755-4.164 6.577-8.22 6.577a8.49 8.49 0 0 1-2.664-.423L9.69 27.473c1.422.466 2.944.717 4.527.717 6.894 0 12.648-4.797 13.973-11.176l-5.752-1.157z" fill="#EE4123"/><path d="M44.476 18.725l-.004.004-.163-.11c-.47.764-1.2 1.384-2.125 1.786-1.757.767-3.385.57-4.554-.46l-.107.164c-.002-.002-.002-.003-.004-.003l-1.994 2.996a8.524 8.524 0 0 0 1.585.872c2.203.92 4.456.877 6.676-.093 1.607-.699 2.866-1.765 3.728-3.116l-3.038-2.04zm-6.225-7.393c-1.855.8-2.812 2.549-2.615 4.599l7.86-3.398c-1.352-1.596-3.11-2.124-5.245-1.201zm-5.218 9.128a10.248 10.248 0 0 1-.596-1.153c-.907-2.115-.95-4.303-.185-6.404.842-2.304 2.45-4.068 4.529-4.966 2.613-1.13 5.502-.907 8.006.586 1.591.916 2.719 2.332 3.575 4.333.11.256.205.53.299.763l-15.628 6.84zm21.09-16.936v16.659l2.579 1.05-1.465 3.434-2.846-1.19c-.639-.279-1.074-.704-1.403-1.184-.315-.49-.55-1.16-.55-2.065V3.524h3.685zm6.68 12.415a4.722 4.722 0 0 0 1.6 3.552l-2.642 2.966a8.698 8.698 0 0 1-2.918-6.522 8.695 8.695 0 0 1 2.927-6.514l2.645 2.963a4.72 4.72 0 0 0-1.612 3.555zm4.7 4.728c2.272.002 4.168-1.615 4.61-3.766l3.883.796c-.81 3.969-4.308 6.954-8.497 6.95a8.628 8.628 0 0 1-2.75-.451l1.264-3.773c.468.156.97.243 1.49.244zm.012-13.428c4.192.003 7.686 3 8.485 6.974l-3.884.79a4.708 4.708 0 0 0-4.605-3.785 4.72 4.72 0 0 0-1.491.242l-1.252-3.777a8.62 8.62 0 0 1 2.747-.444z" fill="#000"/></g></svg></span>
                            
                            <span className="blk-band blk-band--amex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 997.5"><g transform="translate(-55.5,-1002.3)"><path fill="#016fd0" d="m55.5,1002.3 997.5,0 0,538.5 -49.4,77.1 49.4,68.7 0,313.2 -997.5,0 0-507.6L86.4,1456.7 55.5,1422.8Z"/><path fill="#fff" d="m249.1,1697.4 0-156.6 165.8,0 17.8,23.2 18.4-23.2 601.9,0 0,145.8c0,0 -15.7,10.6 -33.9,10.8l-333.3,0 -20.1-24.7 0,24.7 -65.7,0 0-42.1c0,0 -9,5.9 -28.4,5.9l-22.4,0 0,36.3 -99.5,0 -17.8-23.7 -18,23.7z"/><path fill="#fff" d="m55.5,1422.8 37.4-87.2 64.7,0 21.2,48.8 0-48.8 80.4,0 12.6,35.3 12.2-35.3 360.9,0 0,17.7c0,0 19-17.7 50.1-17.7l117.1,0.4 20.9,48.2 0-48.6 67.3,0 18.5,27.7 0-27.7 67.9,0 0,156.6 -67.9,0 -17.7-27.8 0,27.8 -98.8,0 -9.9-24.7 -26.6,0 -9.8,24.7 -67,0c-26.8,0 -44-17.4 -44-17.4l0,17.4 -101.1,0 -20.1-24.7 0,24.7 -375.8,0 -9.9-24.7 -26.5,0 -9.9,24.7 -46.2,0z"/><path fill="#016fd0" d="m106.1,1354.9 -50.4,117.3 32.8,0 9.3-23.5 54.1,0 9.3,23.5 33.6,0 -50.4-117.3 -38.2,0zm18.7,27.3 16.5,41 -33,0 16.5-41z"/><path fill="#016fd0" d="m198.2,1472.2 0-117.3 46.7,0.2 27.1,75.6 26.5-75.8 46.3,0 0,117.3 -29.3,0 0-86.4 -31.1,86.4 -25.7,0 -31.2-86.4 0,86.4z"/><path fill="#016fd0" d="m364.9,1472.2 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.5,0 0,24.7 -64.5,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m477.5,1354.9 0,117.3 29.3,0 0-41.7 12.3,0 35.2,41.7 35.8,0 -38.6-43.2c15.8-1.3 32.2-14.9 32.2-36 0-24.7 -19.4-38 -41-38l-65.2,0zm29.3,26.2 33.5,0c8,0 13.9,6.3 13.9,12.3 0,7.8 -7.6,12.3 -13.5,12.3l-33.9,0 0-24.7z"/><path fill="#016fd0" d="m625.6,1472.2 -29.9,0 0-117.3 29.9,0z"/><path fill="#016fd0" d="m696.6,1472.2 -6.5,0c-31.3,0 -50.2-24.6 -50.2-58.1 0-34.3 18.8-59.1 58.2-59.1l32.4,0 0,27.8 -33.6,0c-16,0 -27.4,12.5 -27.4,31.6 0,22.7 13,32.2 31.6,32.2l7.7,0z"/><path fill="#016fd0" d="m760.4,1354.9 -50.4,117.3 32.8,0 9.3-23.5 54.1,0 9.3,23.5 33.6,0 -50.4-117.3 -38.2,0zm18.7,27.3 16.5,41 -33,0 16.5-41z"/><path fill="#016fd0" d="m852.4,1472.2 0-117.3 37.3,0 47.6,73.7 0-73.7 29.3,0 0,117.3 -36.1,0 -48.8-75.6 0,75.6z"/><path fill="#016fd0" d="m269.2,1677.4 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.5,0 0,24.7 -64.5,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m737.9,1677.4 0-117.3 95.7,0 0,26.2 -66,0 0,20.1 64.2,0 0,24.7 -64.2,0 0,20.8 66,0 0,25.5z"/><path fill="#016fd0" d="m368.6,1677.4 46.6-57.9 -47.7-59.4 36.9,0 28.4,36.7 28.5-36.7 35.5,0 -47.1,58.6 46.7,58.6 -36.9,0 -27.6-36.1 -26.9,36.1z"/><path fill="#016fd0" d="m499.9,1560.1 0,117.3 30.1,0 0-37 30.9,0c26.1,0 45.9-13.9 45.9-40.8 0-22.3 -15.5-39.4 -42.1-39.4l-64.8,0zm30.1,26.5 32.5,0c8.4,0 14.5,5.2 14.5,13.5 0,7.8 -6,13.5 -14.6,13.5l-32.4,0 0-27z"/><path fill="#016fd0" d="m619.4,1560.1 0,117.3 29.3,0 0-41.7 12.3,0 35.2,41.7 35.8,0 -38.6-43.2c15.8-1.3 32.2-14.9 32.2-36 0-24.7 -19.4-38 -41-38l-65.2,0zm29.3,26.2 33.5,0c8,0 13.9,6.3 13.9,12.3 0,7.8 -7.6,12.3 -13.5,12.3l-33.9,0 0-24.7z"/><path fill="#016fd0" d="m847.2,1677.4 0-25.5 58.7,0c8.7,0 12.4-4.7 12.4-9.8 0-4.9 -3.7-9.9 -12.4-9.9l-26.5,0c-23,0 -35.9-14 -35.9-35.1 0-18.8 11.8-36.9 46-36.9l57.1,0 -12.3,26.4 -49.4,0c-9.4,0 -12.3,5 -12.3,9.7 0,4.9 3.6,10.2 10.8,10.2l27.8,0c25.7,0 36.8,14.6 36.8,33.7 0,20.5 -12.4,37.3 -38.2,37.3z"/><path fill="#016fd0" d="m954.8,1677.4 0-25.5 58.7,0c8.7,0 12.4-4.7 12.4-9.8 0-4.9 -3.7-9.9 -12.4-9.9l-26.5,0c-23,0 -35.9-14 -35.9-35.1 0-18.8 11.8-36.9 46-36.9l57.1,0 -12.3,26.4 -49.4,0c-9.4,0 -12.3,5 -12.3,9.7 0,4.9 3.6,10.2 10.8,10.2l27.8,0c25.7,0 36.8,14.6 36.8,33.7 0,20.5 -12.4,37.3 -38.2,37.3z"/></g></svg></span></span>
                    </div>
                    <div className="bn2-selo"><i>✓</i>Pagamento recebido · R$ 850,00</div>
                </div>
                <h3 className="ben2-titulo">Crie links de pagamento com uma mensagem.</h3>
                <p className="ben2-corpo">Diga quanto cobrar e o link chega pronto pra enviar. Sem abrir o banco nem montar a cobrança na mão.</p>
            </article>
            <article className="ben2-card">
                <div className="ben2-cena" data-cena="nota" aria-hidden="true">
                    <div className="bn2-bolha is-voce"><span className="bn2-txt">Emite a nota daquela cobrança de R$ 850 para o João.</span><span className="bn2-meta">19:40<svg className="bn2-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span></div>
                    <div className="bn2-nota">
                        <header className="bn2-nota-topo"><span className="bn2-nota-rotulo">Nota fiscal de serviço</span><span className="bn2-nota-num">Nº 142</span></header>
                        <span className="bn2-nota-valor">R$ 850,00</span>
                        <span className="bn2-nota-tomador">Tomador: João Almeida</span>
                        <span className="bn2-nota-desc">Consultoria · agosto de 2026</span>
                        <span className="bn2-osso bn2-osso--1"></span>
                        <span className="bn2-osso bn2-osso--2"></span>
                        <span className="bn2-carimbo">Emitida</span>
                    </div>
                    <div className="bn2-bolha is-bot bn2-pdf"><span className="cob-pdf-icone">PDF</span><span className="bn2-pdf-txt"><span className="cob-pdf-nome">NFS-e-142-Joao-Almeida.pdf</span><span className="cob-pdf-meta">1 página · 84 KB</span></span></div>
                </div>
                <h3 className="ben2-titulo">Gere notas fiscais sem abrir outro aplicativo.</h3>
                <p className="ben2-corpo">Na hora de mandar a nota para o cliente, é só pedir. A Rita emite e o PDF chega na própria conversa.</p>
            </article>
            <article className="ben2-card">
                <div className="ben2-cena" data-cena="caixa" aria-hidden="true">
                    <div className="bn2-venda"><i className="bn2-disco"></i><span>Venda aprovada</span><b>R$ 850,00</b></div>
                    <div className="bn2-trilho"><i className="bn2-fio"></i><i className="bn2-fio-cheio"></i><span className="bn2-dia"><i></i>seg 24</span><span className="bn2-dia"><i></i>ter 25</span><span className="bn2-dia"><i></i>qua 26</span></div>
                    <div className="bn2-conta"><span className="bn2-conta-rotulo">Na sua conta</span><span className="bn2-conta-valor" data-valor="850">R$ 0,00</span><span className="bn2-conta-sub">quarta, 26 de agosto</span><span className="bn2-prazo">D+2</span></div>
                </div>
                <h3 className="ben2-titulo">A venda no cartão cai em até dois dias úteis.</h3>
                <p className="ben2-corpo">Com a antecipação, o valor das suas vendas fica disponível em até dois dias úteis, para pagar contas, fornecedores ou manter o caixa girando.</p>
            </article>
        </div>
        <div className="ben2-pontos" aria-hidden="true"><i className="ben2-ponto is-ativo"></i><i className="ben2-ponto"></i><i className="ben2-ponto"></i></div>
    </section>

    <section className="exp-section" id="expedienteSection" data-header="claro">

        <header className="exp-topo">
            <h2 className="exp-headline">Tudo o que você pede pelo WhatsApp fica organizado para consultar, encontrar ou compartilhar depois.</h2>
            <p className="exp-sub">Acesse seus painéis e documentos pelo navegador, convide outras pessoas para a conta e deixe seus assessores cuidarem das conversas por você.</p>
        </header>

        <div className="exp-grade">

            <div className="exp-linha exp-linha--topo">

                <article className="exp-card">
                    
                    <button type="button" className="exp-abrir" id="expAbrirPainel"
                            aria-haspopup="dialog" aria-controls="pnmModalPainel"
                            aria-label="Abrir detalhes sobre o painel no navegador">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                                  stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="exp-vao exp-vao--painel" aria-hidden="true">
                        <div className="pn-app">

                            <header className="pn-topo">
                                <nav className="pn-abas">
                                    <span className="pn-aba is-ativa" data-aba="financas">
                                        <span className="pn-aba-foto"><img src="/meuassessor/images/martin.jpg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>FINANÇAS</b><i>por Martin</i></span>
                                    </span>
                                    <span className="pn-aba" data-aba="agenda">
                                        <span className="pn-aba-foto"><img src="/meuassessor/images/sofi.jpg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>AGENDA</b><i>por Sofi</i></span>
                                    </span>
                                    <span className="pn-aba" data-aba="tarefas">
                                        <span className="pn-aba-foto"><img src="/meuassessor/images/luna.jpg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>TAREFAS</b><i>por Luna</i></span>
                                    </span>
                                    <span className="pn-aba" data-aba="operacao">
                                        <span className="pn-aba-foto"><img src="/meuassessor/images/theo.jpg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>OPERAÇÃO</b><i>por Theo</i></span>
                                    </span>
                                </nav>
                                
                            </header>
                            <div className="pn-fio"></div>

                            <div className="pn-corpo">

                              <div className="pn-pagina pn-pagina--financas is-ativa" data-pagina="financas">

                                <p className="pn-rotulo"><b>SALDO DO PERÍODO</b><i></i></p>

                                <div className="pn-colunas">

                                    <div className="pn-esq">
                                        <p className="pn-mes"><span className="pn-seta">‹</span><b>ESTE MÊS</b><span className="pn-seta">›</span></p>

                                        <p className="pn-saldo"><em>R$</em><strong data-count="1473" data-fmt="int">1.473</strong><em className="pn-cent">,20</em><i>+<span data-count="18">18</span>% vs jul</i></p>

                                        <div className="pn-tri">
                                            <span><b>RECEBIDO</b><i>R$ <span data-count="8430" data-fmt="int">8.430</span>,00</i></span>
                                            <span><b>PAGO</b><i>R$ <span data-count="6956" data-fmt="int">6.956</span>,80</i></span>
                                            <span><b>PROJETADO</b><i>R$ <span data-count="1180" data-fmt="int">1.180</span>,40</i></span>
                                        </div>

                                        <p className="pn-inicio"><b>INÍCIO DO MÊS</b><i>R$ <span data-count="2184" data-fmt="int">2.184</span>,60</i></p>

                                        <div className="pn-recado">
                                            <span className="pn-recado-foto"><img src="/meuassessor/images/martin.jpg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b>Martin</b> · Gerente financeiro</p>
                                                <p className="pn-balao-txt">seu saldo está <b>18% acima</b> do saldo de julho, com <b>Mercado</b> puxando os gastos.</p>
                                                <p className="pn-balao-sync">sincronizado às 00:06
                                                    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pn-dir">

                                        <div className="pn-graf">
                                            <svg viewBox="0 0 440 150" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="pnGrafFill" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0" stop-color="#1c8a5f" stop-opacity=".17"/>
                                                        <stop offset="1" stop-color="#1c8a5f" stop-opacity="0"/>
                                                    </linearGradient>
                                                </defs>
                                                <path className="pn-graf-area" d="M0,79 L26,80 L72,88 L117,99 L147,107 L163,109 L178,95 L189,80 L208,89 L228,93 L253,94 L258,80 L273,72 L319,72 L359,74 L379,75 L392,64 L410,63 L440,64 L440,150 L0,150 Z"/>
                                                <path className="pn-graf-ref" d="M0,80 H440"/>
                                                <path className="pn-graf-jul" d="M0,28 L13,53 L21,137 L57,136 L82,130 L117,131 L152,133 L178,126 L185,122 L195,68 L228,69 L258,70 L273,48 L319,49 L359,50 L379,28 L407,5 L420,23 L440,27"/>
                                                <path className="pn-graf-linha" pathLength="1" d="M0,79 L26,80 L72,88 L117,99 L147,107 L163,109 L178,95 L189,80 L208,89 L228,93 L253,94 L258,80 L273,72 L319,72 L359,74 L379,75 L392,64 L410,63 L440,64"/>
                                            </svg>
                                            <span className="pn-marca pn-marca--pico"><i></i>PICO</span>
                                            <span className="pn-marca pn-marca--vale"><i></i>VALE</span>
                                        </div>

                                        <p className="pn-eixo"><span>1</span><span>7</span><span>14</span></p>
                                        <p className="pn-legenda"><i></i>JUL · 2026</p>

                                        <p className="pn-rotulo pn-rotulo--solo"><b>ÚLTIMOS LANÇAMENTOS</b></p>

                                        <ul className="pn-lanc">
                                            <li>
                                                <span className="pn-ponto pn-ponto--azul"></span>
                                                <span className="pn-lanc-txt">
                                                    <b>Mercado São Bento</b>
                                                    <i>MERCADO · 19/08</i>
                                                </span>
                                                <span className="pn-lanc-val">−R$ 238,17</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--laranja"></span>
                                                <span className="pn-lanc-txt">
                                                    <b>Pix para Renata Alvarenga</b>
                                                    <i>TRANSFERÊNCIA · 19/08</i>
                                                </span>
                                                <span className="pn-lanc-val">−R$ 180,00</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--azul"></span>
                                                <span className="pn-lanc-txt">
                                                    <b>Posto São Jorge</b>
                                                    <i>TRANSPORTE · 18/08</i>
                                                </span>
                                                <span className="pn-lanc-val">−R$ 250,00</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--laranja"></span>
                                                <span className="pn-lanc-txt">
                                                    <b>Pix para Douglas Ferraz</b>
                                                    <i>TRANSFERÊNCIA · 17/08</i>
                                                </span>
                                                <span className="pn-lanc-val">−R$ 90,00</span>
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                              </div>

                              <div className="pn-pagina pn-pagina--agenda" data-pagina="agenda">

                                <p className="pn-rotulo pn-rotulo--agenda"><b>COMPROMISSOS POR DIA</b><i></i></p>

                                <div className="pn-colunas">

                                    <div className="pn-esq">
                                        <p className="pn-mes"><span className="pn-seta">&#8249;</span><b>TER &middot; 19/08</b><span className="pn-seta">&#8250;</span></p>

                                        <p className="pn-num"><strong data-count="4">4</strong><em>compromissos</em></p>

                                        <div className="pn-tri">
                                            <span><b>COMEÇA</b><i>09:00</i></span>
                                            <span><b>TERMINA</b><i>17:45</i></span>
                                            <span><b>OCUPADO</b><i>3h30</i></span>
                                        </div>

                                        <p className="pn-inicio"><b>MAIOR VÃO</b><i>11:45 às 15:00</i></p>

                                        <div className="pn-recado">
                                            <span className="pn-recado-foto"><img src="/meuassessor/images/sofi.jpg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b className="is-sofi">Sofi</b> &middot; Secretária executiva</p>
                                                <p className="pn-balao-txt">seu dia vai das <b>09:00</b> às <b>17:45</b>, com <b>4 compromissos</b>.</p>
                                                <p className="pn-balao-sync">falei com o Google às 07:00
                                                    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pn-dir">
                                        <div className="pn-dia">
                                            <span className="pn-hora" style={{top: '0%'}}>08h</span>
                                            <span className="pn-hora" style={{top: '16.67%'}}>10h</span>
                                            <span className="pn-hora" style={{top: '33.33%'}}>12h</span>
                                            <span className="pn-hora" style={{top: '50%'}}>14h</span>
                                            <span className="pn-hora" style={{top: '66.67%'}}>16h</span>
                                            <span className="pn-hora" style={{top: '83.33%'}}>18h</span>
                                            <span className="pn-hora" style={{top: '100%'}}>20h</span>

                                            <i className="pn-risco" style={{top: '0%'}}></i>
                                            <i className="pn-risco" style={{top: '16.67%'}}></i>
                                            <i className="pn-risco" style={{top: '33.33%'}}></i>
                                            <i className="pn-risco" style={{top: '50%'}}></i>
                                            <i className="pn-risco" style={{top: '66.67%'}}></i>
                                            <i className="pn-risco" style={{top: '83.33%'}}></i>
                                            <i className="pn-risco" style={{top: '100%'}}></i>

                                            <span className="pn-ev" style={{top: '8.33%'}}>
                                                <span className="pn-pino"></span>
                                                <span className="pn-ev-txt">
                                                    <b><em>09:00</em><span>Reunião semanal do time</span></b>
                                                    <i><em>09:00 às 10:00</em><span className="pn-chip">1H</span></i>
                                                </span>
                                            </span>
                                            <span className="pn-ev" style={{top: '25%'}}>
                                                <span className="pn-pino"></span>
                                                <span className="pn-ev-txt">
                                                    <b><em>11:00</em><span>Call com investidor</span></b>
                                                    <i><em>11:00 às 11:45</em><span className="pn-chip">45MIN</span></i>
                                                </span>
                                            </span>
                                            <span className="pn-ev" style={{top: '58.33%'}}>
                                                <span className="pn-pino"></span>
                                                <span className="pn-ev-txt">
                                                    <b><em>15:00</em><span>Consulta no dentista</span></b>
                                                    <i><em>15:00 às 16:00</em><span className="pn-chip">1H</span></i>
                                                </span>
                                            </span>
                                            <span className="pn-ev" style={{top: '75%'}}>
                                                <span className="pn-pino"></span>
                                                <span className="pn-ev-txt">
                                                    <b><em>17:00</em><span>Alinhamento com os sócios</span></b>
                                                    <i><em>17:00 às 17:45</em><span className="pn-chip">45MIN</span></i>
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                </div>

                              </div>

                              <div className="pn-pagina pn-pagina--tarefas" data-pagina="tarefas">

                                <p className="pn-rotulo pn-rotulo--tarefas"><b>TAREFAS POR STATUS</b><i></i></p>

                                <div className="pn-colunas">

                                    <div className="pn-esq">
                                        <p className="pn-mes"><span className="pn-seta">&#8249;</span><b>AGOSTO</b><span className="pn-seta">&#8250;</span></p>

                                        <p className="pn-num"><strong data-count="24">24</strong><em>tarefas</em></p>

                                        <div className="pn-barra">
                                            <span className="pn-seg is-vermelho" style={{flex: '5'}}></span>
                                            <span className="pn-seg is-ambar" style={{flex: '7'}}></span>
                                            <span className="pn-seg is-azul" style={{flex: '3'}}></span>
                                            <span className="pn-seg is-verde" style={{flex: '9'}}></span>
                                        </div>

                                        <ul className="pn-status">
                                            <li><i className="is-vermelho"></i><span>Vencendo</span><b data-count="5">5</b></li>
                                            <li><i className="is-ambar"></i><span>Pendentes</span><b data-count="7">7</b></li>
                                            <li><i className="is-azul"></i><span>Em andamento</span><b data-count="3">3</b></li>
                                            <li><i className="is-verde"></i><span>Concluídas</span><b data-count="9">9</b></li>
                                        </ul>

                                        <div className="pn-par">
                                            <span><b>CONCLUÍDAS</b><i><span data-count="38">38</span>%</i></span>
                                            <span><b>VENCENDO</b><i data-count="5">5</i></span>
                                        </div>

                                        <div className="pn-recado">
                                            <span className="pn-recado-foto"><img src="/meuassessor/images/luna.jpg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b className="is-luna">Luna</b> · Organização &amp; Docs</p>
                                                <p className="pn-balao-txt"><b>5 vencendo</b>. Se resolver <b>Pagar o IPTU</b> primeiro, o resto anda.</p>
                                                <p className="pn-balao-sync">sincronizado às 00:06
                                                    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pn-dir">

                                        <p className="pn-rotulo pn-rotulo--solo"><b>ABERTAS · MAIS PRÓXIMAS DO PRAZO</b></p>

                                        <ul className="pn-tar">
                                            <li>
                                                <span className="pn-ponto pn-ponto--vermelho"></span>
                                                <span className="pn-tar-txt"><b>Pagar o IPTU (2ª parcela)</b><i className="is-urgente">VENCE HOJE · CASA</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--vermelho"></span>
                                                <span className="pn-tar-txt"><b>Ligar para o contador</b><i className="is-urgente">VENCE AMANHÃ · TRABALHO</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--vermelho"></span>
                                                <span className="pn-tar-txt"><b>Revisar o contrato</b><i>VENCE SEX 22 · TRABALHO</i></span>
                                                <span className="pn-selo">ALTA</span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--vermelho"></span>
                                                <span className="pn-tar-txt"><b>Pagar o IPVA</b><i>VENCE SEX 22 · CARRO</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--vermelho"></span>
                                                <span className="pn-tar-txt"><b>Renovar o seguro do carro</b><i>VENCE SEG 25 · CARRO</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--ambar"></span>
                                                <span className="pn-tar-txt"><b>Levar o carro na revisão</b><i>VENCE TER 26 · CARRO</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--ambar"></span>
                                                <span className="pn-tar-txt"><b>Enviar o contrato assinado</b><i>VENCE QUA 27 · TRABALHO</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                            <li>
                                                <span className="pn-ponto pn-ponto--ambar"></span>
                                                <span className="pn-tar-txt"><b>Marcar o check-up</b><i>VENCE SEX 29 · SAÚDE</i></span>
                                                <span className="pn-abrir">abrir →</span>
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                              </div>

                              <div className="pn-pagina pn-pagina--operacao" data-pagina="operacao">

                                <p className="pn-rotulo pn-rotulo--operacao"><b>O MOVIMENTO</b><i></i></p>

                                <div className="pn-colunas">

                                    <div className="pn-esq">
                                        <p className="pn-mes"><span className="pn-seta">&#8249;</span><b>ÚLTIMOS 6 MESES</b><span className="pn-seta">&#8250;</span></p>

                                        <p className="pn-num pn-num--so"><strong data-count="236">236</strong></p>
                                        <p className="pn-frase">movimentos registrados <b>este mês</b>.</p>

                                        <div className="pn-tri">
                                            <span><b>EM 12 MESES</b><i><span data-count="2610" data-fmt="int">2.610</span></i></span>
                                            <span><b>MÉDIA MENSAL</b><i><span data-count="218">218</span></i></span>
                                            <span><b>RESOLVIDOS</b><i><span data-count="119">119</span></i></span>
                                        </div>

                                        <p className="pn-inicio"><b>TEMPO DEVOLVIDO</b><i>6h20</i></p>

                                        <div className="pn-recado">
                                            <span className="pn-recado-foto"><img src="/meuassessor/images/theo.jpg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b className="is-theo">Theo</b> &middot; Diretor de operações</p>
                                                <p className="pn-balao-txt">a equipe manteve o registro vivo, <b>2.610 movimentos</b> em 12 meses. <b>Nenhum deles</b> você anotou.</p>
                                                <p className="pn-balao-sync">sincronizado às 00:06
                                                    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pn-dir">
                                        <ul className="pn-meses">
                                                <li><b>Março</b><span className="pn-trilho"><i style={{width: '70.1%'}}></i></span><em data-count="176">176</em></li>
                                                <li><b>Abril</b><span className="pn-trilho"><i style={{width: '85.3%'}}></i></span><em data-count="214">214</em></li>
                                                <li><b>Maio</b><span className="pn-trilho"><i style={{width: '91.2%'}}></i></span><em data-count="229">229</em></li>
                                                <li><b>Junho</b><span className="pn-trilho"><i style={{width: '77.3%'}}></i></span><em data-count="194">194</em></li>
                                                <li><b>Julho</b><span className="pn-trilho"><i style={{width: '100%'}}></i></span><em data-count="251">251</em></li>
                                                <li><b>Agosto</b><span className="pn-trilho"><i style={{width: '94.0%'}}></i></span><em data-count="236">236</em></li>
                                        </ul>
                                        <p className="pn-nota">REGISTROS POR MÊS &middot; GASTOS, AGENDA E TAREFAS</p>
                                    </div>

                                </div>

                              </div>

                            </div>
                        </div>
                    </div>
                    <div className="exp-text">
                        <h3 className="exp-title">Cada mensagem ajuda a construir um painel completo da sua rotina.</h3>
                        <p className="exp-desc">Enquanto seus assessores trabalham, o painel organiza tudo para você acompanhar o mês inteiro de uma vez.</p>
                    </div>
                </article>

                <article className="exp-card">
                    
                    <button type="button" className="exp-abrir" id="expAbrirConta"
                            aria-haspopup="dialog" aria-controls="cvmModalConta"
                            aria-label="Abrir detalhes sobre a conta compartilhada">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                                  stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="exp-vao exp-vao--convite" aria-hidden="true">
                        <div className="cv-peca">
                            <div className="cv-palco">

                                <div className="cv-ato cv-ato--menu">
                                    <p className="cv-rot"><span>SUA EQUIPE DE ACESSO</span></p>

                                    <ul className="cv-menu">
                                        <li className="cv-fila cv-fila--alvo" style={{'--i': '0'}}>
                                            <span className="cv-icone">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="9.4" cy="8.6" r="3.3"/>
                                                    <path d="M3.5 19.4c0-3.2 2.6-5.3 5.9-5.3s5.9 2.1 5.9 5.3"/>
                                                    <path d="M16.6 6.3a3 3 0 0 1 0 5.9"/>
                                                    <path d="M17.9 14.6c2 .5 3.4 2.1 3.4 4.2"/>
                                                </svg>
                                            </span>
                                            <span className="cv-fila-txt"><b>Usuários conectados</b><i>quem o Theo atende nesta conta</i></span>
                                            <span className="cv-chev">›</span>
                                        </li>

                                        <li className="cv-fila cv-fila--convites" style={{'--i': '1'}}>
                                            <span className="cv-icone">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2.8" y="6" width="13.4" height="10" rx="2.1"/>
                                                    <path d="M3.4 7.2 9.5 11.6 15.6 7.2"/>
                                                    <path d="M18.9 13.6v5.6"/>
                                                    <path d="M16.1 16.4h5.6"/>
                                                </svg>
                                            </span>
                                            <span className="cv-fila-txt"><b>Convites</b><i>códigos de acesso à sua conta</i></span>
                                            <span className="cv-chev">›</span>
                                        </li>

                                        <li className="cv-fila cv-fila--contador" style={{'--i': '2'}}>
                                            <span className="cv-icone">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="2.9" y="7.6" width="18.2" height="11.6" rx="2.3"/>
                                                    <path d="M8.9 7.6V6.3a1.8 1.8 0 0 1 1.8-1.8h2.6a1.8 1.8 0 0 1 1.8 1.8v1.3"/>
                                                    <path d="M2.9 12.4h18.2"/>
                                                </svg>
                                            </span>
                                            <span className="cv-fila-txt"><b>Área do contador</b><i>dossiê fiscal e ponte com seu contador</i></span>
                                            <span className="cv-chev">›</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="cv-ato cv-ato--folha cv-ato--gente">
                                    <div className="cv-folha-topo">
                                        <b>Usuários conectados</b>
                                        <span className="cv-fechar">fechar ×</span>
                                    </div>

                                    <div className="cv-titular">
                                        <span className="cv-ponto"></span>
                                        <span className="cv-fila-txt"><b>Você</b><i>titular da conta</i></span>
                                        <span className="cv-carimbo">TITULAR</span>
                                    </div>

                                    <p className="cv-lead">Só você por enquanto. Gere um convite para trazer alguém da família ou da equipe.</p>

                                    <span className="cv-btn cv-btn--largo">Convidar alguém →</span>
                                </div>

                                <div className="cv-ato cv-ato--folha cv-ato--codigo">
                                    <div className="cv-folha-topo">
                                        <b>Convite pronto</b>
                                        <span className="cv-fechar">fechar ×</span>
                                    </div>

                                    <p className="cv-lead cv-lead--meio">Quem usar este código no cadastro entra na sua conta, e o Theo passa a atender essa pessoa também.</p>

                                    <p className="cv-rot cv-rot--codigo"><span>CÓDIGO DE CONVITE</span></p>

                                    <p className="cv-codigo">COD-CONVITE-7QF3ZD</p>

                                    <div className="cv-acoes">
                                        <span className="cv-btn cv-btn--copiar">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/>
                                                <path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/>
                                            </svg>Copiar</span>
                                        <span className="cv-btn cv-btn--zap">
                                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>Enviar no WhatsApp</span>
                                    </div>
                                </div>

                                <div className="cv-ato cv-ato--zap">
                                    
                                    <div className="cv-zap-topo">
                                        <span className="cv-zap-av">
                                            <img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" />
                                        </span>
                                        <span className="cv-zap-id">
                                            <b>Simplific Pro<svg className="cv-selo" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M12 1.4l2.4 1.75 2.94-.29 1.18 2.72 2.66 1.31-.63 2.9L22 12l-1.45 2.21.63 2.9-2.66 1.31-1.18 2.72-2.94-.29L12 22.6l-2.4-1.75-2.94.29-1.18-2.72-2.66-1.31.63-2.9L2 12l1.45-2.21-.63-2.9 2.66-1.31 1.18-2.72 2.94.29L12 1.4z" fill="#1d9bf0"/>
                                                <path d="M10.6 15.5L7.4 12.3l1.3-1.3 1.9 1.9 4.7-4.7 1.3 1.3-6 6z" fill="#ffffff"/>
                                            </svg></b>
                                            <i>online</i>
                                        </span>
                                    </div>

                                    <div className="cv-chat">
                                        
                                        <span className="cv-chip">hoje</span>

                                        <div className="cv-fala cv-fala--out">
                                            <span className="cv-dig cv-dig--out"><i></i><i></i><i></i></span>
                                            <div className="cv-balao cv-balao--out">
                                                <p>COD-CONVITE-7QF3ZD</p>
                                                <span className="cv-meta">09:12<svg className="cv-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                            </div>
                                        </div>

                                        <div className="cv-fala cv-fala--in">
                                            <span className="cv-dig cv-dig--in"><i></i><i></i><i></i></span>
                                            <div className="cv-balao cv-balao--in">
                                                <b className="cv-quem">Theo</b>
                                                <p>Prontinho, Bia. Sua conta foi conectada e o escritório inteiro já te atende.</p>
                                                <span className="cv-meta">09:12</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="cv-ato cv-ato--desvio cv-ato--convites">
                                    <span className="cv-puxador"></span>

                                    <div className="cv-folha-topo">
                                        <b>Convites</b>
                                        <span className="cv-fechar cv-fechar--vez">fechar ×</span>
                                    </div>

                                    <div className="cv-lista-vao">
                                        <ul className="cv-lista">
                                            <li className="cv-conv">
                                                <span className="cv-conv-ponto"></span>
                                                <span className="cv-conv-txt">
                                                    <b className="cv-conv-cod">COD-CONVITE-K4TP9M</b>
                                                    <i className="cv-conv-meta">Convite pendente · 22/08/2026</i>
                                                </span>
                                                <span className="cv-conv-acoes">
                                                    <span className="cv-mini cv-mini--copiar">
                                                        <svg className="cv-mini-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/><path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/></svg>
                                                        <svg className="cv-mini-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                                    </span>
                                                    <span className="cv-mini cv-mini--apagar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/></svg>
                                                    </span>
                                                </span>
                                            </li>

                                            <li className="cv-conv">
                                                <span className="cv-conv-ponto"></span>
                                                <span className="cv-conv-txt">
                                                    <b className="cv-conv-cod">COD-CONVITE-R7XD2B</b>
                                                    <i className="cv-conv-meta">Convite pendente · 19/08/2026</i>
                                                </span>
                                                <span className="cv-conv-acoes">
                                                    <span className="cv-mini cv-mini--copiar">
                                                        <svg className="cv-mini-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/><path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/></svg>
                                                        <svg className="cv-mini-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                                    </span>
                                                    <span className="cv-mini cv-mini--apagar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/></svg>
                                                    </span>
                                                </span>
                                            </li>

                                            <li className="cv-conv">
                                                <span className="cv-conv-ponto"></span>
                                                <span className="cv-conv-txt">
                                                    <b className="cv-conv-cod">COD-CONVITE-93HQVL</b>
                                                    <i className="cv-conv-meta">Convite pendente · 11/08/2026</i>
                                                </span>
                                                <span className="cv-conv-acoes">
                                                    <span className="cv-mini cv-mini--copiar">
                                                        <svg className="cv-mini-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/><path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/></svg>
                                                        <svg className="cv-mini-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                                    </span>
                                                    <span className="cv-mini cv-mini--apagar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/></svg>
                                                    </span>
                                                </span>
                                            </li>

                                            <li className="cv-conv">
                                                <span className="cv-conv-ponto"></span>
                                                <span className="cv-conv-txt">
                                                    <b className="cv-conv-cod">COD-CONVITE-ZN5FT6</b>
                                                    <i className="cv-conv-meta">Convite pendente · 04/08/2026</i>
                                                </span>
                                                <span className="cv-conv-acoes">
                                                    <span className="cv-mini cv-mini--copiar">
                                                        <svg className="cv-mini-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/><path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/></svg>
                                                        <svg className="cv-mini-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                                    </span>
                                                    <span className="cv-mini cv-mini--apagar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/></svg>
                                                    </span>
                                                </span>
                                            </li>

                                            <li className="cv-conv">
                                                <span className="cv-conv-ponto"></span>
                                                <span className="cv-conv-txt">
                                                    <b className="cv-conv-cod">COD-CONVITE-B8WC4R</b>
                                                    <i className="cv-conv-meta">Convite pendente · 28/07/2026</i>
                                                </span>
                                                <span className="cv-conv-acoes">
                                                    <span className="cv-mini cv-mini--copiar">
                                                        <svg className="cv-mini-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/><path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/></svg>
                                                        <svg className="cv-mini-v" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                                    </span>
                                                    <span className="cv-mini cv-mini--apagar">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4"/></svg>
                                                    </span>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="cv-ato cv-ato--desvio cv-ato--contador">
                                    <span className="cv-puxador"></span>

                                    <div className="cv-folha-topo">
                                        <b>Área do contador</b>
                                        <span className="cv-fechar cv-fechar--vez">fechar ×</span>
                                    </div>

                                    <div className="cv-ct-corpo">
                                        
                                        <div className="cv-ct-estado">
                                            <span className="cv-ponto cv-ponto--vazio"></span>
                                            <span className="cv-fila-txt"><b>Nenhum contador conectado</b><i>ninguém tem acesso ao dossiê ainda</i></span>
                                        </div>

                                        <div className="cv-ct-mes">
                                            <span className="cv-ct-rot">Dossiê fiscal</span>
                                            <span className="cv-ct-nav">
                                                <span className="cv-ct-seta cv-ct-seta--tras">&lsaquo;</span>
                                                <b className="cv-ct-nome">Agosto de 2026</b>
                                                <span className="cv-ct-seta cv-ct-seta--frente is-off">&rsaquo;</span>
                                            </span>
                                        </div>

                                        <ul className="cv-ct-lista">
                                            <li><span>Movimento do mês</span><b className="cv-ct-n1">236 lançamentos</b></li>
                                            <li><span>Documentos guardados</span><b className="cv-ct-n2">18 arquivos</b></li>
                                        </ul>

                                        <div className="cv-ct-pe">
                                            <span className="cv-btn cv-ct-btn">Convidar meu contador →</span>
                                            <div className="cv-ct-feito">
                                                <b className="cv-ct-cod">COD-CONVITE-000000</b>
                                                <i className="cv-ct-nota">Convite pendente. Ele está em Convites e pode ser cancelado antes de a pessoa entrar.</i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="exp-text">
                        <h3 className="exp-title">Adicione seu sócio, sua família ou a equipe inteira na mesma conta.</h3>
                        <p className="exp-desc">Cada participante usa o próprio WhatsApp e alimenta a mesma conta. Convide quantas pessoas quiser, sem custo adicional.</p>
                    </div>
                </article>

            </div>

            <div className="exp-linha exp-linha--base">

                <article className="exp-card">
                    
                    <button type="button" className="exp-abrir" id="expAbrirCobranca"
                            aria-haspopup="dialog" aria-controls="cbmModalCobranca"
                            aria-label="Abrir detalhes sobre as cobranças e os recados">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                                  stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="exp-vao exp-vao--cobranca" aria-hidden="true">
                        <div className="cb-palco">

                            <div className="cb-cena cb-cena--pedido">
                                <span className="cb-chip">hoje</span>

                                <div className="cb-fala cb-fala--out">
                                    <span className="cb-dig cb-dig--out cb-dig--a1"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--out cb-ent--a1">
                                        <p>Simplific Pro, todo dia 5, lembra o João de pagar as aulas de personal, R$ 350 🙏</p>
                                        <span className="cb-meta">18:42<svg className="cb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="cb-fala cb-fala--in">
                                    <span className="cb-dig cb-dig--in cb-dig--a2"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--in cb-ent--a2">
                                        <b className="cb-quem">Martin</b>
                                        <p>Combinado. Todo dia 5 o João recebe o lembrete com o link de pagamento. Te aviso quando cair.</p>
                                        <span className="cb-meta">18:42</span>
                                    </div>
                                </div>
                            </div>

                            <div className="cb-cena cb-cena--carga">
                                <span className="cb-carga cb-ent--l1">
                                    <svg className="cb-anel" viewBox="0 0 24 24">
                                        <circle className="cb-anel-trilho" cx="12" cy="12" r="9.2"/>
                                        <circle className="cb-anel-arco" cx="12" cy="12" r="9.2"/>
                                    </svg>
                                    <span className="cb-carga-t">Procurando João</span>
                                </span>
                            </div>

                            <div className="cb-cena cb-cena--joao">
                                <div className="cb-fala cb-fala--in">
                                    <span className="cb-dig cb-dig--in cb-dig--b1"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--in cb-ent--b1">
                                        <p>Oi, João, tudo bem? Chegou a mensalidade do personal, R$ 350,00. Já te mando o link.</p>
                                        <span className="cb-meta">09:02</span>
                                    </div>
                                </div>

                                <div className="cb-fala cb-fala--in cb-fala--segue">
                                    <span className="cb-dig cb-dig--in cb-dig--segue cb-dig--b2"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--in cb-balao--link cb-balao--segue cb-ent--b2">
                                        <p>Segue o link. É só abrir e pagar.</p>
                                        <span className="cb-link">
                                            <svg className="cb-glifo" viewBox="0 0 20 13"><rect x="0.85" y="0.85" width="18.3" height="11.3" rx="2.4"/><path d="M0.85 4.9h18.3"/><path d="M4.1 9.1h3.4"/></svg>
                                            <span className="cb-url">meuassessor.com/pagar/8kx2</span>
                                        </span>
                                        <span className="cb-meta">09:03</span>
                                    </div>
                                </div>

                                <div className="cb-fala cb-fala--out">
                                    <span className="cb-dig cb-dig--out cb-dig--b3"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--out cb-balao--doc cb-ent--b3">
                                        
                                        <span className="cb-arq">
                                            <svg className="cb-folha" viewBox="0 0 13 16" aria-hidden="true"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                            <span className="cb-arq-col">
                                                <span className="cb-arq-t">Comprovante-de-pagamento.pdf</span>
                                                <span className="cb-arq-d">PDF • 82 KB</span>
                                            </span>
                                        </span>
                                        <span className="cb-meta">09:06<svg className="cb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>
                            </div>

                            <div className="cb-cena cb-cena--carga">
                                <span className="cb-carga cb-ent--l2">
                                    <svg className="cb-anel" viewBox="0 0 24 24">
                                        <circle className="cb-anel-trilho" cx="12" cy="12" r="9.2"/>
                                        <circle className="cb-anel-arco" cx="12" cy="12" r="9.2"/>
                                    </svg>
                                    <span className="cb-carga-t">Trocando de conversa</span>
                                </span>
                            </div>

                            <div className="cb-cena cb-cena--volta">
                                <div className="cb-fala cb-fala--out">
                                    <div className="cb-balao cb-balao--out">
                                        <p>Simplific Pro, todo dia 5, lembra o João de pagar as aulas de personal, R$ 350 🙏</p>
                                        <span className="cb-meta">18:42<svg className="cb-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="cb-fala cb-fala--in">
                                    <div className="cb-balao cb-balao--in">
                                        <b className="cb-quem">Martin</b>
                                        <p>Combinado. Todo dia 5 o João recebe o lembrete com o link de pagamento. Te aviso quando cair.</p>
                                        <span className="cb-meta">18:42</span>
                                    </div>
                                </div>

                                <span className="cb-chip">sexta, 5 de setembro</span>

                                <div className="cb-fala cb-fala--in">
                                    <span className="cb-dig cb-dig--in cb-dig--c1"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--in cb-ent--c1">
                                        <b className="cb-quem">Martin</b>
                                        <p>O João pagou. R$ 350,00 já caiu na sua conta.</p>
                                        <span className="cb-meta">09:07</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="exp-text">
                        <h3 className="exp-title">Precisa avisar, lembrar ou combinar alguma coisa com alguém? Peça ao Simplific Pro e ele chama a pessoa por você.</h3>
                        <p className="exp-desc">Escolha o contato e diga o que precisa. Seu assessor inicia a conversa pelo WhatsApp, resolve o assunto e te conta o que ficou combinado.</p>
                    </div>
                </article>

                <article className="exp-card">
                    
                    <button type="button" className="exp-abrir" id="expAbrirDocumentos"
                            aria-haspopup="dialog" aria-controls="gdmModalDocumentos"
                            aria-label="Abrir detalhes sobre os documentos">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                                  stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="exp-vao exp-vao--docs" aria-hidden="true">
                        <div className="dc-palco">

                            <div className="dc-cena dc-cena--manda">
                                <span className="dc-chip">hoje</span>

                                <div className="dc-fala dc-fala--out">
                                    <span className="dc-dig dc-dig--out dc-dig--a1"><i></i><i></i><i></i></span>
                                    <div className="dc-balao dc-balao--out dc-balao--doc dc-ent--a1">
                                        <span className="dc-arq">
                                            <svg className="dc-folha" viewBox="0 0 13 16" aria-hidden="true"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                            <span className="dc-arq-t">documento-4471.pdf</span>
                                            <span className="dc-arq-d">12 págs</span>
                                        </span>
                                        <p>Simplific Pro, guarda esse pra mim.</p>
                                        <span className="dc-meta">14:20<svg className="dc-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="dc-fala dc-fala--in">
                                    <span className="dc-dig dc-dig--in dc-dig--a2"><i></i><i></i><i></i></span>
                                    <div className="dc-balao dc-balao--in dc-ent--a2">
                                        <b className="dc-quem">Luna</b>
                                        <p>Guardado. Quando precisar, é só me pedir.</p>
                                        <span className="dc-meta">14:20</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dc-cena dc-cena--tempo">
                                <span className="dc-passa dc-ent--t1">
                                    <span className="dc-chip dc-dia dc-dia--1">hoje</span>
                                    <span className="dc-chip dc-dia dc-dia--2">sexta, 17 de abril</span>
                                    <span className="dc-chip dc-dia dc-dia--3">segunda, 11 de maio</span>
                                    <span className="dc-chip dc-dia dc-dia--4">quinta, 4 de junho</span>
                                    <span className="dc-chip dc-dia dc-dia--5">terça, 14 de julho</span>
                                    <span className="dc-chip dc-dia dc-dia--6">domingo, 9 de agosto</span>
                                    <span className="dc-chip dc-dia dc-dia--7">sábado, 12 de setembro</span>
                                    <span className="dc-chip dc-dia dc-dia--8">quarta, 21 de outubro</span>
                                    <span className="dc-chip dc-dia dc-dia--9">quinta, 5 de novembro</span>
                                </span>
                            </div>

                            <div className="dc-cena dc-cena--acha">
                                <div className="dc-fala dc-fala--in">
                                    <div className="dc-balao dc-balao--in">
                                        <b className="dc-quem">Luna</b>
                                        <p>Guardado. Quando precisar, é só me pedir.</p>
                                        <span className="dc-meta">14:20</span>
                                    </div>
                                </div>

                                <span className="dc-chip">quinta, 5 de novembro</span>

                                <div className="dc-fala dc-fala--out">
                                    <span className="dc-dig dc-dig--out dc-dig--b1"><i></i><i></i><i></i></span>
                                    <div className="dc-balao dc-balao--out dc-ent--b1">
                                        <p>Luna, acha aquele contrato do apartamento que eu assinei em março.</p>
                                        <span className="dc-meta">09:15<svg className="dc-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="dc-fala dc-fala--in">
                                    <span className="dc-dig dc-dig--in dc-dig--c1"><i></i><i></i><i></i></span>
                                    <div className="dc-balao dc-balao--in dc-balao--doc dc-balao--nu dc-ent--c1">
                                        <b className="dc-quem">Luna</b>
                                        <span className="dc-arq">
                                            <svg className="dc-folha" viewBox="0 0 13 16" aria-hidden="true"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                            <span className="dc-arq-t">documento-4471.pdf</span>
                                            <span className="dc-arq-d">12 págs</span>
                                        </span>
                                        <span className="dc-meta">09:15</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="exp-text">
                        <h3 className="exp-title">Vive confiando na memória para não esquecer coisas importantes? A Luna lembra e guarda tudo por você.</h3>
                        <p className="exp-desc">Envie uma data, uma anotação, uma foto ou um documento. Ela mantém tudo salvo e devolve quando você pedir.</p>
                    </div>
                </article>

                <article className="exp-card">
                    
                    <button type="button" className="exp-abrir" id="expAbrirDrive"
                            aria-haspopup="dialog" aria-controls="drmModalDrive"
                            aria-label="Abrir detalhes sobre o drive do escritório">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M9.6 2H14v4.4M14 2 9.2 6.8M6.4 14H2V9.6M2 14l4.8-4.8"
                                  stroke="currentColor" strokeWidth="1.6"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div className="exp-vao exp-vao--drive" aria-hidden="true">
                        <div className="dv-peca">
                            <div className="dv-palco">
                                <div className="dv-ato is-pousado" data-tela="raiz">
                                    <div className="dv-topo">
                                        <p className="dv-migalha"><b>Meu Drive</b></p>
                                        <div className="dv-botoes">
                                            <span className="dv-bt" data-ir="grade" data-toque="bt">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                                                    <rect x="3.6" y="3.6" width="7" height="7" rx="1.8"/>
                                                    <rect x="13.4" y="3.6" width="7" height="7" rx="1.8"/>
                                                    <rect x="3.6" y="13.4" width="7" height="7" rx="1.8"/>
                                                    <rect x="13.4" y="13.4" width="7" height="7" rx="1.8"/>
                                                </svg>
                                            </span>
                                            <span className="dv-bt" data-ir="hist" data-toque="bt">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3.7 12a8.3 8.3 0 1 0 2.6-6"/>
                                                    <path d="M3.5 3.4v3.4h3.4"/>
                                                    <path d="M12 7.7V12l2.9 1.7"/>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <p className="dv-rot"><span>PASTAS &middot; 4</span></p>

                                    <ul className="dv-lista">
                                        <li className="dv-fila" style={{'--i': '0'}} data-ir="pasta:boletos" data-toque="fila">
                                            <span className="dv-glifo">
                                                <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                            </span>
                                            <span className="dv-txt"><b>Boletos</b><i className="dv-meta">PASTA &middot; 3 ITENS &middot; 1,3 MB</i></span>
                                            <span className="dv-chev">&rsaquo;</span>
                                        </li>

                                        <li className="dv-fila" style={{'--i': '1'}} data-ir="pasta:notas" data-toque="fila">
                                            <span className="dv-glifo">
                                                <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                            </span>
                                            <span className="dv-txt"><b>Notas fiscais</b><i className="dv-meta">PASTA &middot; 42 ITENS &middot; 26 MB</i></span>
                                            <span className="dv-chev">&rsaquo;</span>
                                        </li>

                                        <li className="dv-fila" style={{'--i': '2'}} data-ir="pasta:contratos" data-toque="fila">
                                            <span className="dv-glifo">
                                                <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                            </span>
                                            <span className="dv-txt"><b>Contratos</b><i className="dv-meta">PASTA &middot; 8 ITENS &middot; 11 MB</i></span>
                                            <span className="dv-chev">&rsaquo;</span>
                                        </li>

                                        <li className="dv-fila" style={{'--i': '3'}} data-ir="pasta:casa" data-toque="fila">
                                            <span className="dv-glifo">
                                                <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                            </span>
                                            <span className="dv-txt"><b>Casa</b><i className="dv-meta">PASTA &middot; 17 ITENS &middot; 9,4 MB</i></span>
                                            <span className="dv-chev">&rsaquo;</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="exp-text">
                        <h3 className="exp-title">Seus arquivos vivem espalhados entre conversas e pastas? O Drive do Simplific Pro organiza tudo sozinho.</h3>
                        <p className="exp-desc">Fotos, boletos, comprovantes e documentos são separados automaticamente e ficam disponíveis no navegador.</p>
                    </div>
                </article>

            </div>

        </div>

        <a className="hero-btn exp-btn" href="/funcionalidades"><span>Conhecer todas as funcionalidades</span></a>
    </section>

    <section className="intg-section" id="integracoesSection" data-header="claro">
        <div className="intg-grade">
            <figure className="intg-figura" aria-hidden="true">
                <div className="intg-palco">
                    <svg className="intg-fios" width="620" height="545" viewBox="0 0 620 545" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#e3e3e3" strokeWidth="1.5">
                    <path d="M310 136 L310 178"/>
                    <path d="M310 178 L97 178 A22 22 0 0 0 75 200 L75 268"/>
                    <path d="M310 178 L253 178 A22 22 0 0 0 231 200 L231 268"/>
                    <path d="M310 178 L367 178 A22 22 0 0 1 389 200 L389 268"/>
                    <path d="M310 178 L523 178 A22 22 0 0 1 545 200 L545 268"/>
                    <path d="M310 178 L175 178 A22 22 0 0 0 153 200 L153 413"/>
                    <path d="M310 178 L445 178 A22 22 0 0 1 467 200 L467 413"/>
                    </svg>
                    
                    <div className="intg-hub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="16 17 142 140"><path fill="#25D366" stroke="#ffffff" strokeWidth="11" paint-order="stroke" strokeLinejoin="round" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/><path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/></svg></div>
                <div className="intg-card intg-card--of"><div className="intg-logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="1049.3 485.3 86.6 93.0">
<path fill="#34383a" fillRule="evenodd" d="M1128.65 518.23 C1125.22 512.28 1120.46 507.57 1114.35 504.09 C1108.97 501.04 1103.27 499.33 1097.25 498.96 L1097.25 516.36 C1102.15 516.80 1106.24 518.74 1109.54 522.19 C1113.31 526.13 1115.19 531.26 1115.19 537.57 C1115.19 543.89 1113.27 549.05 1109.44 553.06 C1105.60 557.07 1100.79 559.08 1095.01 559.08 C1089.72 559.08 1085.27 557.41 1081.67 554.09 L1069.32 566.44 C1076.48 572.98 1084.99 576.26 1094.84 576.26 C1102.01 576.26 1108.57 574.55 1114.52 571.15 C1120.53 567.71 1125.26 562.93 1128.72 556.80 C1131.99 551.02 1133.74 544.44 1133.79 537.79 C1133.84 530.79 1132.13 524.26 1128.65 518.23Z"/>
<path fill="#1b8094" fillRule="evenodd" d="M1081.38 521.62 C1084.57 518.56 1088.38 516.81 1092.84 516.38 L1092.84 487.25 C1081.48 488.09 1070.70 493.55 1063.14 503.38 L1081.38 521.62Z"/>
<path fill="#1b8094" fillRule="evenodd" d="M1075.08 535.80 C1075.33 531.68 1076.49 528.08 1078.54 525.01 L1059.99 506.47 C1053.58 515.44 1051.26 526.87 1052.49 535.80 L1075.08 535.80Z"/>
<path fill="#1b8094" fillRule="evenodd" d="M1075.14 540.21 L1052.49 540.21 C1054.22 550.51 1060.01 558.20 1066.23 563.30 L1078.76 550.77 C1076.70 547.80 1075.49 544.28 1075.14 540.21Z"/>
</svg></div></div>
                <div className="intg-card intg-card--cal"><div className="intg-logo">
<svg version="1.1" id="intg-cal-Livello_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 200 200" enable-background="new 0 0 200 200" xmlSpace="preserve">
<g>
	<g transform="translate(3.75 3.75)">
		<path fill="#FFFFFF" d="M148.882,43.618l-47.368-5.263l-57.895,5.263L38.355,96.25l5.263,52.632l52.632,6.579l52.632-6.579
			l5.263-53.947L148.882,43.618z"/>
		<path fill="#1A73E8" d="M65.211,125.276c-3.934-2.658-6.658-6.539-8.145-11.671l9.132-3.763c0.829,3.158,2.276,5.605,4.342,7.342
			c2.053,1.737,4.553,2.592,7.474,2.592c2.987,0,5.553-0.908,7.697-2.724s3.224-4.132,3.224-6.934c0-2.868-1.132-5.211-3.395-7.026
			s-5.105-2.724-8.5-2.724h-5.276v-9.039H76.5c2.921,0,5.382-0.789,7.382-2.368c2-1.579,3-3.737,3-6.487
			c0-2.447-0.895-4.395-2.684-5.855s-4.053-2.197-6.803-2.197c-2.684,0-4.816,0.711-6.395,2.145s-2.724,3.197-3.447,5.276
			l-9.039-3.763c1.197-3.395,3.395-6.395,6.618-8.987c3.224-2.592,7.342-3.895,12.342-3.895c3.697,0,7.026,0.711,9.974,2.145
			c2.947,1.434,5.263,3.421,6.934,5.947c1.671,2.539,2.5,5.382,2.5,8.539c0,3.224-0.776,5.947-2.329,8.184
			c-1.553,2.237-3.461,3.947-5.724,5.145v0.539c2.987,1.25,5.421,3.158,7.342,5.724c1.908,2.566,2.868,5.632,2.868,9.211
			s-0.908,6.776-2.724,9.579c-1.816,2.803-4.329,5.013-7.513,6.618c-3.197,1.605-6.789,2.421-10.776,2.421
			C73.408,129.263,69.145,127.934,65.211,125.276z"/>
		<path fill="#1A73E8" d="M121.25,79.961l-9.974,7.25l-5.013-7.605l17.987-12.974h6.895v61.197h-9.895L121.25,79.961z"/>
		<path fill="#EA4335" d="M148.882,196.25l47.368-47.368l-23.684-10.526l-23.684,10.526l-10.526,23.684L148.882,196.25z"/>
		<path fill="#34A853" d="M33.092,172.566l10.526,23.684h105.263v-47.368H43.618L33.092,172.566z"/>
		<path fill="#4285F4" d="M12.039-3.75C3.316-3.75-3.75,3.316-3.75,12.039v136.842l23.684,10.526l23.684-10.526V43.618h105.263
			l10.526-23.684L148.882-3.75H12.039z"/>
		<path fill="#188038" d="M-3.75,148.882v31.579c0,8.724,7.066,15.789,15.789,15.789h31.579v-47.368H-3.75z"/>
		<path fill="#FBBC04" d="M148.882,43.618v105.263h47.368V43.618l-23.684-10.526L148.882,43.618z"/>
		<path fill="#1967D2" d="M196.25,43.618V12.039c0-8.724-7.066-15.789-15.789-15.789h-31.579v47.368H196.25z"/>
	</g>
</g>
</svg></div></div>
                <div className="intg-card intg-card--meet"><div className="intg-logo"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 87.5 72">
	<path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"/>
	<path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
	<path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
	<path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
	<path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"/>
	<path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"/>
</svg></div></div>
                <div className="intg-card intg-card--gmail"><div className="intg-logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66">
<path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
<path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
<path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
<path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
<path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
</svg></div></div>
                <div className="intg-card intg-card--sheets"><div className="intg-logo"><svg width="49px" height="67px" viewBox="0 0 49 67" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    
    <title>Sheets-icon</title>
    <desc>Created with Sketch.</desc>
    <defs>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-1"></path>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-3"></path>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-5"></path>
        <linearGradient x1="50.0053945%" y1="8.58610612%" x2="50.0053945%" y2="100.013939%" id="intg-sheets-linearGradient-7">
            <stop stop-color="#263238" stop-opacity="0.2" offset="0%"></stop>
            <stop stop-color="#263238" stop-opacity="0.02" offset="100%"></stop>
        </linearGradient>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-8"></path>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-10"></path>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-12"></path>
        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-path-14"></path>
        <radialGradient cx="3.16804688%" cy="2.71744318%" fx="3.16804688%" fy="2.71744318%" r="161.248516%" gradientTransform="translate(0.031680,0.027174),scale(1.000000,0.727273),translate(-0.031680,-0.027174)" id="intg-sheets-radialGradient-16">
            <stop stop-color="#FFFFFF" stop-opacity="0.1" offset="0%"></stop>
            <stop stop-color="#FFFFFF" stop-opacity="0" offset="100%"></stop>
        </radialGradient>
    </defs>
    <g id="intg-sheets-Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="intg-sheets-Consumer-Apps-Sheets-Large-VD-R8-" transform="translate(-451.000000, -451.000000)">
            <g id="intg-sheets-Hero" transform="translate(0.000000, 63.000000)">
                <g id="intg-sheets-Personal" transform="translate(277.000000, 299.000000)">
                    <g id="intg-sheets-Sheets-icon" transform="translate(174.833333, 89.958333)">
                        <g id="intg-sheets-Group">
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-2" fill="white">
                                    <use xlink:href="#intg-sheets-path-1"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L36.9791667,10.3541667 L29.5833333,0 Z" id="intg-sheets-Path" fill="#0F9D58" fillRule="nonzero" mask="url(#intg-sheets-mask-2)"></path>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-4" fill="white">
                                    <use xlink:href="#intg-sheets-path-3"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <path d="M11.8333333,31.8020833 L11.8333333,53.25 L35.5,53.25 L35.5,31.8020833 L11.8333333,31.8020833 Z M22.1875,50.2916667 L14.7916667,50.2916667 L14.7916667,46.59375 L22.1875,46.59375 L22.1875,50.2916667 Z M22.1875,44.375 L14.7916667,44.375 L14.7916667,40.6770833 L22.1875,40.6770833 L22.1875,44.375 Z M22.1875,38.4583333 L14.7916667,38.4583333 L14.7916667,34.7604167 L22.1875,34.7604167 L22.1875,38.4583333 Z M32.5416667,50.2916667 L25.1458333,50.2916667 L25.1458333,46.59375 L32.5416667,46.59375 L32.5416667,50.2916667 Z M32.5416667,44.375 L25.1458333,44.375 L25.1458333,40.6770833 L32.5416667,40.6770833 L32.5416667,44.375 Z M32.5416667,38.4583333 L25.1458333,38.4583333 L25.1458333,34.7604167 L32.5416667,34.7604167 L32.5416667,38.4583333 Z" id="intg-sheets-Shape" fill="#F1F1F1" fillRule="nonzero" mask="url(#intg-sheets-mask-4)"></path>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-6" fill="white">
                                    <use xlink:href="#intg-sheets-path-5"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <polygon id="intg-sheets-Path" fill="url(#intg-sheets-linearGradient-7)" fillRule="nonzero" mask="url(#intg-sheets-mask-6)" points="30.8813021 16.4520313 47.3333333 32.9003646 47.3333333 17.75"></polygon>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-9" fill="white">
                                    <use xlink:href="#intg-sheets-path-8"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <g id="intg-sheets-Group" mask="url(#intg-sheets-mask-9)">
                                    <g transform="translate(26.625000, -2.958333)">
                                        <path d="M2.95833333,2.95833333 L2.95833333,16.2708333 C2.95833333,18.7225521 4.94411458,20.7083333 7.39583333,20.7083333 L20.7083333,20.7083333 L2.95833333,2.95833333 Z" id="intg-sheets-Path" fill="#87CEAC" fillRule="nonzero"></path>
                                    </g>
                                </g>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-11" fill="white">
                                    <use xlink:href="#intg-sheets-path-10"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <path d="M4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,4.80729167 C0,2.36666667 1.996875,0.369791667 4.4375,0.369791667 L29.5833333,0.369791667 L29.5833333,0 L4.4375,0 Z" id="intg-sheets-Path" fill-opacity="0.2" fill="#FFFFFF" fillRule="nonzero" mask="url(#intg-sheets-mask-11)"></path>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-13" fill="white">
                                    <use xlink:href="#intg-sheets-path-12"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <path d="M42.8958333,64.7135417 L4.4375,64.7135417 C1.996875,64.7135417 0,62.7166667 0,60.2760417 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,60.2760417 C47.3333333,62.7166667 45.3364583,64.7135417 42.8958333,64.7135417 Z" id="intg-sheets-Path" fill-opacity="0.2" fill="#263238" fillRule="nonzero" mask="url(#intg-sheets-mask-13)"></path>
                            </g>
                            <g id="intg-sheets-Clipped">
                                <mask id="intg-sheets-mask-15" fill="white">
                                    <use xlink:href="#intg-sheets-path-14"></use>
                                </mask>
                                <g id="intg-sheets-SVGID_1_"></g>
                                <path d="M34.0208333,17.75 C31.5691146,17.75 29.5833333,15.7642188 29.5833333,13.3125 L29.5833333,13.6822917 C29.5833333,16.1340104 31.5691146,18.1197917 34.0208333,18.1197917 L47.3333333,18.1197917 L47.3333333,17.75 L34.0208333,17.75 Z" id="intg-sheets-Path" fill-opacity="0.1" fill="#263238" fillRule="nonzero" mask="url(#intg-sheets-mask-15)"></path>
                            </g>
                        </g>
                        <path d="M29.5833333,0 L4.4375,0 C1.996875,0 0,1.996875 0,4.4375 L0,60.6458333 C0,63.0864583 1.996875,65.0833333 4.4375,65.0833333 L42.8958333,65.0833333 C45.3364583,65.0833333 47.3333333,63.0864583 47.3333333,60.6458333 L47.3333333,17.75 L29.5833333,0 Z" id="intg-sheets-Path" fill="url(#intg-sheets-radialGradient-16)" fillRule="nonzero"></path>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg></div></div>
                <div className="intg-card intg-card--nfe"><div className="intg-logo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 58">
<path d="M4 3 h28 l12 12 v40 a3 3 0 0 1 -3 3 H7 a3 3 0 0 1 -3 -3 Z" fill="#fff" stroke="#aab0b8" strokeWidth="2"/>
<path d="M32 3 l12 12 h-10 a2 2 0 0 1 -2 -2 Z" fill="#e3e6e9"/>
<rect x="10" y="22" width="20" height="3.4" rx="1.7" fill="#ced3d9"/>
<rect x="10" y="30" width="28" height="3.4" rx="1.7" fill="#ced3d9"/>
<rect x="10" y="38" width="24" height="3.4" rx="1.7" fill="#ced3d9"/>
<circle cx="34" cy="47" r="10" fill="#00a884"/>
<path d="M29 47 l3.5 3.5 6.3-7" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
</svg></div></div>
                </div>
            </figure>
            <header className="intg-texto">
                
                <h2 className="intg-headline">Esqueça ter que baixar um aplicativo novo para cada coisa que precisa resolver.<span className="intg-headline-complemento"> Com o Simplific Pro, você faz tudo em um só lugar.</span></h2>
                <p className="intg-passo">Seus assessores se conectam ao banco, ao Google Agenda, ao Meet, ao Gmail e às outras ferramentas de que precisam para trabalhar. Você continua pedindo tudo pelo WhatsApp, sem precisar aprender a usar cada uma delas.</p>
                <a href="#planos" className="hero-btn promise-btn"><span>Contratar minha equipe</span></a>
            </header>
        </div>
    </section>

    <section className="cli-section" id="clientesSection">

        <header className="cli-topo">
            <h2 className="cli-headline">Seus assessores respondem, marcam e confirmam por você.</h2>
            <p className="cli-sub">Quem precisa falar com você fala com a sua equipe. Os assessores entram em contato, marcam o horário, nunca se atrasam e nunca esquecem.</p>
        </header>

        <div className="cli-grade">

            <div className="cli-linha">

                <article className="cli-card ag-card" data-ag="4" data-fase="montado">
                    
                    <div className="cli-vao cli-vao--horarios" aria-hidden="true">
                        <div className="mk-peca">
                            <div className="mk-cartao">

                                <div className="mk-esq">
                                    <span className="mk-avatar"><b>J</b></span>
                                    <span className="mk-rotulo">Agendar horário com</span>
                                    <span className="mk-nome">Júlia Andrade</span>

                                    <span className="mk-mes">
                                        <i className="mk-seta">&lsaquo;</i>
                                        <b>Agosto de 2026</b>
                                        <i className="mk-seta">&rsaquo;</i>
                                    </span>

                                    <span className="mk-semana">
                                        <span>Dom</span>
                                        <span>Seg</span>
                                        <span>Ter</span>
                                        <span>Qua</span>
                                        <span>Qui</span>
                                        <span>Sex</span>
                                        <span>Sab</span>
                                    </span>

                                    <span className="mk-dias">
                                        <span className="mk-vago"></span>
                                        <span className="mk-vago"></span>
                                        <span className="mk-vago"></span>
                                        <span className="mk-vago"></span>
                                        <span className="mk-vago"></span>
                                        <span className="mk-vago"></span>
                                        <span className="mk-dia mk-dia--ido">1</span>
                                        <span className="mk-dia mk-dia--ido">2</span>
                                        <span className="mk-dia mk-dia--ido">3</span>
                                        <span className="mk-dia mk-dia--ido">4</span>
                                        <span className="mk-dia mk-dia--ido">5</span>
                                        <span className="mk-dia mk-dia--ido">6</span>
                                        <span className="mk-dia mk-dia--ido">7</span>
                                        <span className="mk-dia mk-dia--ido">8</span>
                                        <span className="mk-dia mk-dia--ido">9</span>
                                        <span className="mk-dia mk-dia--ido">10</span>
                                        <span className="mk-dia mk-dia--ido">11</span>
                                        <span className="mk-dia mk-dia--ido">12</span>
                                        <span className="mk-dia mk-dia--ido">13</span>
                                        <span className="mk-dia mk-dia--ido">14</span>
                                        <span className="mk-dia mk-dia--ido">15</span>
                                        <span className="mk-dia mk-dia--ido">16</span>
                                        <span className="mk-dia mk-dia--ido">17</span>
                                        <span className="mk-dia mk-dia--ido">18</span>
                                        <span className="mk-dia mk-dia--ido">19</span>
                                        <span className="mk-dia mk-dia--ido">20</span>
                                        <span className="mk-dia mk-dia--ido">21</span>
                                        <span className="mk-dia mk-dia--ido">22</span>
                                        <span className="mk-dia mk-dia--livre">23</span>
                                        <span className="mk-dia mk-dia--ido">24</span>
                                        <span className="mk-dia mk-dia--ido">25</span>
                                        
                                        <span className="mk-dia mk-dia--alvo"><i className="mk-disco"></i><b className="mk-dia-n">26</b></span>
                                        <span className="mk-dia mk-dia--livre">27</span>
                                        <span className="mk-dia mk-dia--livre">28</span>
                                        <span className="mk-dia mk-dia--ido">29</span>
                                        <span className="mk-dia mk-dia--livre">30</span>
                                        <span className="mk-dia mk-dia--ido">31</span>
                                    </span>
                                </div>

                                <div className="mk-dir">

                                    <div className="mk-ato mk-ato--passo1">
                                        <span className="mk-topo">
                                            <b className="mk-titulo">Você precisa de quanto tempo?</b>
                                            <i className="mk-etapa">Etapa 1 de 2</i>
                                        </span>
                                        <span className="mk-apoio">Escolha a duração e depois selecione um horário disponível.</span>

                                        <span className="mk-duracoes">
                                            <span className="mk-dur">15 min</span>
                                            <span className="mk-dur mk-dur--alvo">30 min</span>
                                            <span className="mk-dur">1h</span>
                                            <span className="mk-dur">1h30</span>
                                            <span className="mk-dur">2h</span>
                                        </span>

                                        <b className="mk-titulo mk-titulo--dois">Qual horário é melhor?</b>
                                        <span className="mk-apoio mk-apoio--dia">Mostrando horários para <b>Quarta-feira, 26 de agosto</b></span>

                                        <span className="mk-horas">
                                            <span className="mk-hora mk-hora--alvo" style={{'--i': '0'}}>19:00</span>
                                            <span className="mk-hora" style={{'--i': '1'}}>19:30</span>
                                            <span className="mk-hora" style={{'--i': '2'}}>20:00</span>
                                            <span className="mk-hora" style={{'--i': '3'}}>20:30</span>
                                        </span>
                                    </div>

                                    <div className="mk-ato mk-ato--passo2">

                                        <span className="mk-topo">
                                            <b className="mk-titulo">Insira seus detalhes</b>
                                            <i className="mk-etapa">Etapa 2 de 2</i>
                                        </span>

                                        <span className="mk-resumo">
                                            <span className="mk-resumo-l">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.2" y="5" width="17.6" height="16" rx="2.6"/><path d="M3.2 9.8h17.6"/><path d="M8.2 3v4"/><path d="M15.8 3v4"/></svg>
                                                Quarta-feira, 26 de agosto
                                            </span>
                                            <span className="mk-resumo-l">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/></svg>
                                                19:00 - 19:30
                                            </span>
                                        </span>

                                        <span className="mk-grupo">
                                            <i className="mk-rot">Nome <em>*</em></i>
                                            <span className="mk-campo mk-campo--nome">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20c0-3.6 3.2-6 7.2-6s7.2 2.4 7.2 6"/></svg>
                                                <span className="mk-campo-val">
                                                    <i className="mk-ph mk-ph--nome">Seu nome completo</i>
                                                    <b className="mk-tec mk-tec--nome" style={{'--w': '7.05em'}}>Camila Prado</b>
                                                </span>
                                            </span>
                                        </span>

                                        <span className="mk-grupo">
                                            <i className="mk-rot">E-mail <em>*</em></i>
                                            <span className="mk-campo mk-campo--mail">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2.8" y="5" width="18.4" height="14" rx="2.6"/><path d="M3.4 7.4 12 13.2l8.6-5.8"/></svg>
                                                <span className="mk-campo-val">
                                                    <i className="mk-ph mk-ph--mail">seuemail@dominio.com</i>
                                                    <b className="mk-tec mk-tec--mail" style={{'--w': '13.36em'}}>camila.prado@email.com</b>
                                                </span>
                                            </span>
                                        </span>

                                        <span className="mk-grupo">
                                            <i className="mk-rot">WhatsApp <em>*</em></i>
                                            <span className="mk-campo mk-campo--zap">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 11.6c0 4.2-3.8 7.6-8.4 7.6-1 0-2-.16-2.9-.46L4 20l1.4-4.1a7.2 7.2 0 0 1-1.4-4.3C4 7.4 7.8 4 12.4 4s8 3.4 8 7.6z"/></svg>
                                                <span className="mk-campo-val">
                                                    <i className="mk-ph mk-ph--zap">(00) 00000-0000</i>
                                                    <b className="mk-tec mk-tec--zap" style={{'--w': '7.94em'}}>(11) 91234-5678</b>
                                                </span>
                                            </span>
                                        </span>

                                        <span className="mk-agendar"><b>Agendar horário</b></span>
                                    </div>

                                    <div className="mk-ato mk-ato--fim">
                                        <span className="mk-selo">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5.6 12.4 10 16.8l8.4-9.2"/></svg>
                                        </span>
                                        <b className="mk-fim-t mk-fim-l" style={{'--i': '0'}}>Horário confirmado</b>
                                        <span className="mk-resumo mk-resumo--fim mk-fim-l" style={{'--i': '1'}}>
                                            <span className="mk-resumo-l">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.2" y="5" width="17.6" height="16" rx="2.6"/><path d="M3.2 9.8h17.6"/><path d="M8.2 3v4"/><path d="M15.8 3v4"/></svg>
                                                Quarta-feira, 26 de agosto
                                            </span>
                                            <span className="mk-resumo-l">
                                                <svg className="mk-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/></svg>
                                                19:00 - 19:30
                                            </span>
                                        </span>
                                        <span className="mk-fim-p mk-fim-l" style={{'--i': '2'}}>A Sofi manda a confirmação no seu WhatsApp antes do horário.</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="cli-text">
                        <h3 className="cli-title">Compartilhe sua agenda e as pessoas marcam sozinhas.</h3>
                        
                        <p className="cli-desc">Você manda o link, o cliente escolhe a duração, o dia e um horário realmente livre, e o compromisso entra direto na sua agenda.</p>
                    </div>
                </article>

                <article className="cli-card">
                    <div className="cli-vao cli-vao-sofi" aria-hidden="true" style={{position: 'relative'}}>
                        <div className="cli-papel cli-papel-sofi" style={{position: 'absolute', '--inset': '0'}}>

                            <div className="sf-palco">
                                <div className="sf-fone">
                                    <div className="sf-tela">

                                        <header className="sf-topo">
                                            <svg className="sf-voltar" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>
                                            <span className="sf-av">
                                                <img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" />
                                            </span>
                                            <span className="sf-id">
                                                <b>Simplific Pro<svg className="sf-selo" viewBox="0 0 24 24">
                                                    <path d="M12 1.4l2.4 1.75 2.94-.29 1.18 2.72 2.66 1.31-.63 2.9L22 12l-1.45 2.21.63 2.9-2.66 1.31-1.18 2.72-2.94-.29L12 22.6l-2.4-1.75-2.94.29-1.18-2.72-2.66-1.31.63-2.9L2 12l1.45-2.21-.63-2.9 2.66-1.31 1.18-2.72 2.94.29L12 1.4z" fill="#1d9bf0"/>
                                                    <path d="M10.6 15.5L7.4 12.3l1.3-1.3 1.9 1.9 4.7-4.7 1.3 1.3-6 6z" fill="#ffffff"/>
                                                </svg></b>
                                                <em>online</em>
                                            </span>
                                        </header>

                                        <div className="sf-fluxo">
                                            <span className="sf-dia">Hoje</span>

                                            <div className="sf-atos">

                                                <div className="sf-cena sf-cena--1">

                                                    <div className="sf-fala sf-fala--in">
                                                        <span className="sf-dig sf-dig--in sf-dig--1"><i></i><i></i><i></i></span>
                                                        <div className="sf-bolha sf-bolha--in sf-ent--1">
                                                            
                                                            <b className="sf-quem">Sofi</b>
                                                            <p>Oi, Camila! Confirmando seu horário de amanhã com a Júlia: quarta, 26, às 19:00.</p>
                                                            <span className="sf-meta">18:05</span>
                                                        </div>
                                                    </div>

                                                    <div className="sf-fala sf-fala--out">
                                                        <span className="sf-dig sf-dig--out sf-dig--2"><i></i><i></i><i></i></span>
                                                        <div className="sf-bolha sf-bolha--out sf-ent--2">
                                                            <p>Confirmado! 👍</p>
                                                            <span className="sf-meta">18:07<svg className="sf-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                                        </div>
                                                    </div>

                                                </div>

                                                <div className="sf-cena sf-cena--2">

                                                    <div className="sf-fala sf-fala--in">
                                                        <span className="sf-dig sf-dig--in sf-dig--3"><i></i><i></i><i></i></span>
                                                        <div className="sf-bolha sf-bolha--in sf-ent--3">
                                                            
                                                            <b className="sf-quem">Sofi</b>
                                                            <p>Camila, a Júlia precisou remarcar o horário de amanhã. Pode às 19:00 na quinta, 27?</p>
                                                            <span className="sf-meta">18:32</span>
                                                        </div>
                                                    </div>

                                                    <div className="sf-fala sf-fala--out">
                                                        <span className="sf-dig sf-dig--out sf-dig--4"><i></i><i></i><i></i></span>
                                                        <div className="sf-bolha sf-bolha--out sf-ent--4">
                                                            <p>Pode sim!</p>
                                                            <span className="sf-meta">18:34<svg className="sf-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                                        </div>
                                                    </div>

                                                    <div className="sf-fala sf-fala--in">
                                                        <span className="sf-dig sf-dig--in sf-dig--5"><i></i><i></i><i></i></span>
                                                        <div className="sf-bolha sf-bolha--in sf-ent--5">
                                                            <p>Prontinho! Quinta, 27 de agosto, às 19:00. Te lembro no dia.</p>
                                                            <span className="sf-meta">18:34</span>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>

                                    </div>

                                    <img className="sf-png" src="/meuassessor/images/iphone.webp" alt="" aria-hidden="true" />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className="cli-text">
                        <h3 className="cli-title">A Sofi confirma o horário com o cliente e remarca quando você não pode.</h3>
                        
                        <p className="cli-desc">Antes de cada atendimento, ela manda a confirmação. Surgiu imprevisto? Ela explica ao cliente e oferece um novo horário.</p>
                    </div>
                </article>

            </div>

        </div>

    </section>

    <section className="preco-section" id="planos" data-header="claro">

        <svg className="preco-defs" aria-hidden="true" focusable="false">
            <symbol id="preco-tique" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7.4" fill="var(--preco-disco)" stroke="none"/>
                <path d="M5 8.15 7.05 10.2 11 5.85" fill="none" stroke="var(--preco-risco)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </symbol>
        </svg>

        <div className="preco-grade">

            <header className="preco-topo">
                <h2 className="preco-headline">Contrate o seu time completo.</h2>
                <p className="preco-sub">Uma equipe de assessores trabalhando 24 horas por dia, por menos de R$ 1 por dia. E sem limite de uso em nada.</p>
            </header>

            <div className="preco-cards">

                <article className="preco2-card">

                    <h3 className="preco2-nome">Equipe completa</h3>
                    <p className="preco2-apoio">Um plano só, tudo liberado e sem limites desde o primeiro dia.</p>

                    <div className="preco2-preco">
                        <p className="preco2-kicker">Plano anual · 12x de</p>
                        <p className="preco2-valor">
                            <span className="preco2-moeda" aria-hidden="true">R$</span><span className="preco2-numero" aria-hidden="true">29,90</span><span className="preco2-periodo" aria-hidden="true">/mês</span><span className="preco-leitor">R$ 29,90 por mês no plano anual</span>
                        </p>
                    </div>

                    <ul className="preco2-lista">
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Todos os assessores no seu WhatsApp</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Contas de banco sem limite no Open Finance</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Usuários sem limite: família, sócios e equipe</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Notas fiscais sem limite, direto no WhatsApp</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Lembretes, tarefas e arquivos sem limite</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Google Agenda conectado + painel completo</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Links de cobrança e +140 funcionalidades</li>
                    </ul>

                    <a className="preco2-btn" href="/checkout">Contratar equipe</a>

                    <ul className="preco2-selos">
                        <li><strong>7 dias para testar.</strong> Não gostou, devolvemos tudo.</li>
                    </ul>

                </article>

            </div>
        </div>
    </section>

    <section className="emb-section" id="embaixadores" data-header="claro">
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
    </section>

    <section className="faq-section" id="perguntas" data-header="claro">

        <svg className="faq-defs" aria-hidden="true" focusable="false">
            <symbol id="faq-seta" viewBox="0 0 16 16">
                <path d="M3 6 8 11 13 6"/>
            </symbol>
        </svg>

        <div className="faq-grade">

            <header className="faq-topo">
                <h2 className="faq-headline">Perguntas frequentes.</h2>
                <p className="faq-sub">Não achou a sua? O suporte humano <a className="faq-link" href="https://wa.me/5547992921005" target="_blank" rel="noopener">responde no WhatsApp</a>.</p>
            </header>

            <div className="faq-colunas">

                <div className="faq-coluna">

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Os clientes gostam do Simplific Pro?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Numa pesquisa respondida por 50 mil clientes dentro do WhatsApp, 98% disseram que estão satisfeitos e usam o produto. É a nossa medida mais honesta: quem responde é quem já convive com os assessores todo dia. Se não for para você, a garantia de 7 dias devolve o valor integral, sem fidelidade e sem multa.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq" open>
                        <summary className="faq-pergunta">
                            <span>O que acontece depois que eu assino?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sua conversa com o Simplific Pro é criada no WhatsApp no mesmo dia, com os seus assessores dentro, e eles se apresentam. Dali em diante é só conversar. Conectar o banco e o Google Agenda é opcional e você faz quando quiser, ali mesmo. Não tem instalação, reunião de implantação nem manual para ler.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso instalar algum aplicativo?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Funciona no WhatsApp que você já usa, e a conversa com os seus assessores nasce no primeiro dia. Se você quiser ver tudo organizado em tela grande, existe um painel no navegador, mas ele é opção e não obrigação.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Como eu peço as coisas?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Você manda uma mensagem na conversa, como mandaria para qualquer pessoa. Pode ser texto, áudio ou foto: um 'gastei 62 na farmácia', um áudio pedindo para marcar o dentista, a foto da nota fiscal do almoço. Não existe comando nem formato certo. O assessor do assunto entende o pedido, executa e responde com o próprio nome.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Os assessores falam com outras pessoas por mim?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Falam, quando você pede. Cobrar um cliente todo dia 10, lembrar seu irmão de um aniversário, convidar os participantes de uma reunião e avisar todo mundo antes da hora. Você diz o que precisa e o assessor cuida da conversa.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso conectar meu banco para usar?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Dá para registrar tudo por mensagem, áudio e foto, e o Martin organiza do mesmo jeito. A conexão pelo Open Finance do Banco Central é um passo opcional que automatiza a entrada dos gastos, funciona com 114 bancos e instituições e é somente leitura: ninguém além de você movimenta a sua conta.</p>
                        </div>
                    </details>

                </div>

                <div className="faq-coluna">

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Meus dados estão seguros?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, e vale saber o que isso quer dizer na prática. Seus dados são criptografados no caminho e onde ficam guardados, o tratamento segue a LGPD, e nada é vendido, alugado ou entregue para anunciante nenhum. Está tudo detalhado na <a className="faq-link" href="/seguranca">página de segurança</a> e na <a className="faq-link" href="/pages/politica-de-privacidade">política de privacidade</a>.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Eu fico no controle do que os assessores fazem?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Fica. Pedido importante volta para você confirmar antes de virar ação, e todo registro gera um recibo na conversa para você conferir. Se algo sair errado, corrigir é responder dizendo o certo, e o assessor ajusta na hora. Para o que a inteligência artificial não resolver, o suporte tem gente de verdade.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Posso usar com minha esposa, meu sócio ou minha equipe?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, a conta é compartilhada. Você adiciona a sua esposa, os seus sócios ou a sua equipe, cada um fala com o Simplific Pro do próprio WhatsApp, e o que qualquer um pedir entra na mesma conta organizada.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>É pra mim se eu não tenho empresa?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>É. Dá pra usar só pra vida pessoal: os gastos da casa, o dentista de quinta, o boleto do IPTU, os documentos da família. Empresa só faz falta na hora de emitir nota fiscal; todo o resto funciona igual.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Serve pra uso pessoal e pro meu negócio ao mesmo tempo?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Serve. A vida e o trabalho ficam na mesma conversa: o Martin separa o gasto da farmácia do gasto da empresa nas categorias, e no painel cada um aparece no seu lugar.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso de CNPJ pra emitir nota fiscal?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Para emitir nota fiscal de serviço, sim: a nota sai no nome de uma empresa. A Rita cuida do cadastro da empresa e da emissão, tudo pelo WhatsApp.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Tem limite de mensagens ou de pedidos?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Tudo é ilimitado desde o primeiro dia: mensagens, lembretes, cobranças, notas fiscais, documentos e projetos. Não existe pacote de créditos nem cobrança extra por uso.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Posso cancelar quando quiser?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, e você mesmo cancela, em poucos passos no painel ou pedindo ao assessor no WhatsApp. Ninguém vai te segurar numa ligação de retenção. Nos primeiros 7 dias vale a garantia, com devolução integral do que você pagou.</p>
                        </div>
                    </details>

                </div>

            </div>
        </div>
    </section>

    <footer className="site-footer is-branco" data-header="claro">
        <div className="footer-inner">
            <div className="footer-top">

                <div className="footer-brand">
                    <a href="/" className="footer-logo-link">
                        
                        <img src={logo} alt="Simplific Pro" className="footer-logo" />
                    </a>
                    <p className="footer-about">Um escritório de assessores de inteligência artificial dentro do seu WhatsApp. Dinheiro, agenda, tarefas e documentos entram organizados, numa conversa só.</p>
                    <div className="footer-social">
                        <a href="https://www.instagram.com/meuassessor.ia/" target="_blank" rel="noopener" aria-label="Instagram do Simplific Pro">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2"/>
                                <circle cx="12" cy="12" r="4.1"/>
                                <circle cx="17.1" cy="6.9" r="1.15" className="is-solid"/>
                            </svg>
                        </a>
                        <a href="https://web.facebook.com/p/Meu-Assessor-61574060255535" target="_blank" rel="noopener" aria-label="Facebook do Simplific Pro">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M13.6 21v-8.2h2.7l.4-3.1h-3.1V7.6c0-.9.25-1.5 1.55-1.5h1.65V3.3c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.16V9.7H7.6v3.1h2.7V21Z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <nav className="footer-col footer-links" aria-labelledby="footerColEscritorio">
                    <h3 className="footer-col-title" id="footerColEscritorio">Simplific Pro</h3>
                    <a href="/beneficios">Benefícios</a>
                    <a href="/inteligencia">Inteligência</a>
                    <a href="/seguranca">Segurança</a>
                    <a href="/contato">Contato</a>
                </nav>

                <nav className="footer-col footer-links" aria-labelledby="footerColConta">
                    <h3 className="footer-col-title" id="footerColConta">Conta</h3>
                    <a href="/login">Login</a>
                    
                    <a href="#planos">Começar agora</a>
                </nav>

                <div className="footer-col footer-support" aria-labelledby="footerColSuporte">
                    <h3 className="footer-col-title" id="footerColSuporte">Suporte humano</h3>
                    
                    <a href="mailto:contato@simplific.pro" className="footer-mail">contato@simplific.pro</a>
                    <p className="footer-support-text">Plano, cobrança e acesso à conta são com o nosso time, não com os assessores.</p>
                    <a href="https://wa.me/5547992921005" target="_blank" rel="noopener" className="footer-wa">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
                        <span>Falar com o suporte</span>
                    </a>
                </div>

            </div>

            <div className="footer-bottom">
                <p className="footer-legal">© 2026 Simplific Pro LTDA. Empresa do grupo Tittanium. Todos os direitos reservados.</p>
                <nav className="footer-terms">
                    <a href="/privacidade">Política de privacidade</a>
                    <a href="/termos">Termos de uso</a>
                </nav>
            </div>
        </div>
    </footer>

    <div className="of-modal" id="ofModalCartao" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="ofModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Open Finance</span>
                <h2 className="of-modal-titulo" id="ofModalTitulo">Seus bancos entram na conversa.</h2>
                <p className="of-modal-lead">A conexão é feita uma vez, dentro do aplicativo do seu banco. Do dia seguinte em diante o Martin começa o expediente já sabendo quanto entrou, quanto saiu e o que vence essa semana.</p>
            </header>

            <div className="of-modal-corpo" id="ofModalCorpo">
            <div className="of-modal-grade">
                
                <section className="of-modal-bloco">
                    <div className="ofm-palco ofm-palco-auth" aria-hidden="true">
                        <div className="ofm-peca ofm-fone">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="M3.5 5.9V4.1a2.5 2.5 0 0 1 5 0v1.8"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                </svg>
                                <span>Aplicativo do seu banco</span>
                            </div>

                            <p className="ofm-fone-titulo">Compartilhar com o escritório</p>

                            <ul className="ofm-itens">
                                <li>
                                    <i className="ofm-tique">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="m2.6 6.3 2.4 2.4 4.4-5.1" stroke="currentColor"
                                                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                    <span>Conta corrente</span>
                                </li>
                                <li>
                                    <i className="ofm-tique">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="m2.6 6.3 2.4 2.4 4.4-5.1" stroke="currentColor"
                                                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                    <span>Cartão de crédito</span>
                                </li>
                            </ul>

                            <div className="ofm-bio">
                                <span className="ofm-bio-marca">
                                    <svg viewBox="0 0 16 16" fill="none">
                                        <path d="M2.6 8.2a5.4 5.4 0 0 1 10.8 0v2.2M5.2 8.2a2.8 2.8 0 0 1 5.6 0v3.6M8 8.2v5"
                                              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <span>Confirmar com biometria</span>
                            </div>
                        </div>
                    </div>

                    <h3>A autorização é sua e acontece no seu banco</h3>
                    <p>Você escolhe quais contas e cartões quer compartilhar e confirma com a sua biometria, dentro do aplicativo do próprio banco. O escritório não participa dessa etapa. A sua senha não passa por aqui em momento nenhum.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-painel">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Saldo em contas</span>
                                <span className="ofm-selo">
                                    <svg viewBox="0 0 14 10" fill="none">
                                        <path d="M1 5s2.2-3.6 6-3.6S13 5 13 5s-2.2 3.6-6 3.6S1 5 1 5Z"
                                              stroke="currentColor" strokeWidth="1"/>
                                        <circle cx="7" cy="5" r="1.5" stroke="currentColor" strokeWidth="1"/>
                                    </svg>
                                    somente leitura
                                </span>
                            </div>

                            <strong className="ofm-valor">R$ 12.480,35</strong>

                            <ul className="ofm-extrato">
                                <li><span>Fatura Visa · vence dia 10</span><b>R$ 1.204,90</b></li>
                                <li><span>Mercado São Bento</span><b>R$ 238,17</b></li>
                                <li><span>Recebimento de cliente</span><b className="is-entrada">R$ 3.500,00</b></li>
                                <li><span>Assinatura de software</span><b>R$ 89,90</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O que o escritório passa a enxergar</h3>
                    <p>Chega uma cópia de leitura: saldo, extrato e faturas de cartão. É o bastante para o Martin fechar o mês sem você abrir aplicativo de banco. A conexão não tem permissão para transferir, pagar ou movimentar valor nenhum, e esse limite está nas regras do Open Finance, não em uma promessa nossa.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-rede">
                            <div className="ofm-busca">
                                <svg viewBox="0 0 12 12" fill="none">
                                    <circle cx="5.2" cy="5.2" r="3.6" stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="m8 8 2.6 2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                </svg>
                                <span>Buscar instituição</span>
                            </div>

                            <div className="ofm-fichas">
                                <i><img src="/meuassessor/images/bancos/itau.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/bb.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/bradesco.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-caixa"><img src="/meuassessor/images/bancos/caixa.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/santander.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-nubank"><img src="/meuassessor/images/bancos/nubank.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/btg.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/inter.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/c6.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-xp"><img src="/meuassessor/images/bancos/xp.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/sicredi.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/sicoob.svg" alt="" loading="lazy" decoding="async" /></i>
                            </div>
                        </div>
                    </div>

                    <h3>114 instituições disponíveis</h3>
                    <p>O Open Finance é o sistema oficial de compartilhamento de dados bancários do Brasil, criado pelo Banco Central e em operação desde 2021. Os principais bancos do país estão dentro, e hoje são 114 bancos e instituições que você pode conectar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco ofm-palco-fim" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofm-fone-fim">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="M3.5 5.9V4.1a2.5 2.5 0 0 1 5 0v1.8"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                </svg>
                                <span>Autorizações</span>
                            </div>

                            <div className="ofm-linha-chave">
                                <div>
                                    <b>Compartilhamento de dados</b>
                                    <span>Válido até 12 de agosto de 2027</span>
                                </div>
                                <span className="ofm-chave"><i></i></span>
                            </div>

                            <span className="ofm-cancelar">Cancelar compartilhamento</span>
                        </div>
                    </div>

                    <h3>O desligamento também é seu</h3>
                    <p>O compartilhamento tem prazo e fica registrado na área de autorizações do aplicativo do seu banco. O cancelamento é feito por lá, sem depender do escritório. A partir desse momento os assessores deixam de receber os seus dados.</p>
                </section>
            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                
                <a href="/seguranca" className="of-modal-link">Ler sobre a segurança da ferramenta&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal" id="ofModalOrg" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="ofModalOrgTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Organização dos gastos</span>
                <h2 className="of-modal-titulo" id="ofModalOrgTitulo">O seu extrato chega arrumado.</h2>
                <p className="of-modal-lead">O banco manda a linha em caixa alta e cheia de código. O Martin lê cada uma delas, descobre a loja, põe o gasto na categoria certa e guarda o que se repete. Quando você pergunta para onde foi o mês, o número já está pronto.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">
                
                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-mes">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Agosto por categoria</span>
                                <span className="ofm-selo">R$ 6.957</span>
                            </div>

                            <ul className="ofm-cats">
                                <li><span>Mercado</span><i style={{'--w': '100%'}}></i><b>R$ 1.240</b></li>
                                <li><span>Restaurante</span><i style={{'--w': '74%'}}></i><b>R$ 918</b></li>
                                <li><span>Transporte</span><i style={{'--w': '58%'}}></i><b>R$ 720</b></li>
                                <li><span>Saúde</span><i style={{'--w': '44%'}}></i><b>R$ 546</b></li>
                                <li><span>Assinaturas</span><i style={{'--w': '31%'}}></i><b>R$ 384</b></li>
                                <li><span>Beleza</span><i style={{'--w': '22%'}}></i><b>R$ 272</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O mês inteiro já vem repartido</h3>
                    <p>Cada categoria vai fechando sozinha enquanto o mês corre. Para onde foi o dinheiro deixa de ser uma pergunta de planilha e vira uma linha pronta, com o maior gasto em cima.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fixa">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Conta fixa</span>
                                <span className="ofm-selo">Assinaturas</span>
                            </div>

                            <span className="ofm-fixa-nome">Netflix</span>

                            <ul className="ofm-serie">
                                <li><i className="ofm-ponto"></i><span>12 de junho</span><b>R$ 44,90</b></li>
                                <li><i className="ofm-ponto"></i><span>12 de julho</span><b>R$ 44,90</b></li>
                                <li><i className="ofm-ponto"></i><span>12 de agosto</span><b>R$ 44,90</b></li>
                                <li className="is-prevista"><i className="ofm-ponto"></i><span>12 de setembro <em>previsto</em></span><b>R$ 44,90</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O que se repete ele passa a esperar</h3>
                    <p>Assinatura, mensalidade, aluguel, conta de luz. Depois de ver a mesma cobrança voltar no mesmo dia, o Martin marca ela como conta fixa e já conta com ela antes de a fatura fechar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-proj">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Previsão de setembro</span>
                                <span className="ofm-selo">média de 6 meses</span>
                            </div>

                            <strong className="ofm-valor">R$ 7.180,00</strong>

                            <div className="ofm-barras">
                                <i style={{'--h': '62%'}}></i>
                                <i style={{'--h': '78%'}}></i>
                                <i style={{'--h': '70%'}}></i>
                                <i style={{'--h': '88%'}}></i>
                                <i style={{'--h': '74%'}}></i>
                                <i className="is-prevista" style={{'--h': '92%'}}></i>
                            </div>

                            <div className="ofm-meses">
                                <span>abr</span>
                                <span>mai</span>
                                <span>jun</span>
                                <span>jul</span>
                                <span>ago</span>
                                <span className="is-prevista">set</span>
                            </div>
                        </div>
                    </div>

                    <h3>O mês que vem já tem número</h3>
                    <p>Com as contas fixas de um lado e a média dos seus meses do outro, o Martin projeta quanto deve sair até o fim de setembro. É o número que responde à pergunta de sempre, se dá para gastar agora ou se é melhor esperar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofm-conversa">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-ic-chat" viewBox="0 0 14 13" fill="none">
                                    <path d="M1.8 3.8A2.2 2.2 0 0 1 4 1.6h6a2.2 2.2 0 0 1 2.2 2.2v3.6A2.2 2.2 0 0 1 10 9.6H5.6L2.9 11.6V9.4A2.2 2.2 0 0 1 1.8 7.4V3.8Z"
                                          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                </svg>
                                <span>Simplific Pro</span>
                            </div>

                            <div className="ofm-bolhas">
                                <span className="ofm-bolha is-sua">O Outback de ontem foi jantar com cliente</span>
                                <span className="ofm-bolha">Movi para Despesas do trabalho. Toda vez que o Outback aparecer, já entra assim.</span>
                            </div>
                        </div>
                    </div>

                    <h3>Quando ele erra, você corrige numa frase</h3>
                    <p>Categoria trocada acontece, e o conserto é uma mensagem na conversa. O Martin refaz o lançamento na hora e guarda a correção, então o mesmo estabelecimento entra certo da próxima vez.</p>
                </section>
            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/assessores" className="of-modal-link">Conhecer o trabalho do Martin&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal" id="ofModalConversa" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="ofModalConversaTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">WhatsApp</span>
                <h2 className="of-modal-titulo" id="ofModalConversaTitulo">O financeiro cabe numa conversa.</h2>
                <p className="of-modal-lead">Você pergunta em português, na hora que der na cabeça. O Martin responde ali mesmo, com o número que ele acabou de ler nos seus bancos.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofw-chat">
                            <div className="ofw-topo">
                                <span className="ofw-avatar">
                                    <svg viewBox="0 0 16 16" fill="none">
                                        <circle cx="6.1" cy="5.4" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
                                        <path d="M1.6 13.4c0-2.3 2-3.7 4.5-3.7s4.5 1.4 4.5 3.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                        <path d="M11 3.4a2.2 2.2 0 0 1 0 4.1M12.2 9.9c1.5.4 2.5 1.6 2.5 3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <div>
                                    <b>Simplific Pro</b>
                                    <span>Theo, Martin, Sofi, Luna</span>
                                </div>
                            </div>

                            <div className="ofw-fio">
                                <div className="ofw-bolha is-sai">
                                    Quanto gastei de mercado esse mês?
                                    <i>09:41
                                        <svg className="ofw-visto" viewBox="0 0 16 11" fill="none">
                                            <path d="M1 6.1 3.6 8.7 8.7 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M6.4 6.1 9 8.7 14.6 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                </div>

                                <div className="ofw-bolha is-sai ofw-audio">
                                    <span className="ofw-play">
                                        <svg viewBox="0 0 10 12" fill="currentColor"><path d="M1.4 1.2 8.8 6l-7.4 4.8z"/></svg>
                                    </span>
                                    <span className="ofw-onda">
                                        <i style={{'--h': '30%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '86%'}}></i>
                                        <i style={{'--h': '48%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '100%'}}></i>
                                        <i style={{'--h': '62%'}}></i><i style={{'--h': '36%'}}></i><i style={{'--h': '80%'}}></i>
                                        <i style={{'--h': '54%'}}></i><i style={{'--h': '26%'}}></i><i style={{'--h': '68%'}}></i>
                                        <i style={{'--h': '44%'}}></i><i style={{'--h': '30%'}}></i>
                                    </span>
                                    <span className="ofw-dur">0:06</span>
                                </div>

                                <div className="ofw-bolha is-entra ofw-digitando">
                                    <em>Martin</em>
                                    <span className="ofw-pontos"><i></i><i></i><i></i></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>A pergunta é do jeito que você falaria</h3>
                    <p>Não tem menu, comando nem aplicativo novo para abrir. Você escreve ou manda um áudio na mesma conversa de sempre, e a pergunta pode ser solta, do jeito que ela nasce na cabeça.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofw-resposta">
                            <div className="ofw-quem">
                                <span className="ofw-mono">M</span>
                                <b>Martin</b>
                                <span className="ofw-hora">09:41</span>
                            </div>

                            <span className="ofm-rot">Mercado · 1 a 16 de agosto</span>
                            <strong className="ofm-valor">R$ 1.284,60</strong>

                            <ul className="ofm-extrato">
                                <li><span>Mercado São Bento</span><b>R$ 612,40</b></li>
                                <li><span>Hortifruti da Vila</span><b>R$ 318,20</b></li>
                                <li><span>Padaria Central</span><b>R$ 204,00</b></li>
                                <li><span>Empório do Bairro</span><b>R$ 150,00</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>A resposta vem com os seus números</h3>
                    <p>Antes de responder, o Martin olha o extrato e a fatura que chegam pela conexão com os bancos. O valor que aparece na conversa é o do seu banco naquele minuto, com o detalhe por estabelecimento quando você pede.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofw-avisos">
                            <span className="ofw-dia">hoje</span>

                            <div className="ofw-fio">
                                <div className="ofw-bolha is-entra">
                                    <em>Martin</em>
                                    <span className="ofw-chip">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="M6 1.4 11 10.6H1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                            <path d="M6 4.9v2.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                            <circle cx="6" cy="8.9" r="0.55" fill="currentColor"/>
                                        </svg>
                                        fora do padrão
                                    </span>
                                    <span className="ofw-txt">A assinatura do software subiu de R$ 89,90 para R$ 149,90.</span>
                                    <i>07:12</i>
                                </div>

                                <div className="ofw-bolha is-entra">
                                    <em>Martin</em>
                                    <span className="ofw-chip">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="M6 1.4 11 10.6H1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                            <path d="M6 4.9v2.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                            <circle cx="6" cy="8.9" r="0.55" fill="currentColor"/>
                                        </svg>
                                        acima da média
                                    </span>
                                    <span className="ofw-txt">A fatura do Visa já passou a média do mês em R$ 320,00.</span>
                                    <i>12:40</i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>O aviso chega sem você perguntar</h3>
                    <p>O escritório conhece o que se repete todo mês. Assinatura que mudou de preço, cobrança duplicada e fatura acima da média aparecem na conversa no dia em que acontecem.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofw-grupo">
                            <div className="ofw-topo">
                                <span className="ofw-avatar">
                                    <svg viewBox="0 0 16 16" fill="none">
                                        <circle cx="6.1" cy="5.4" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
                                        <path d="M1.6 13.4c0-2.3 2-3.7 4.5-3.7s4.5 1.4 4.5 3.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                        <path d="M11 3.4a2.2 2.2 0 0 1 0 4.1M12.2 9.9c1.5.4 2.5 1.6 2.5 3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <div>
                                    <b>Simplific Pro</b>
                                    <span>seus assessores e você</span>
                                </div>
                            </div>

                            <ul className="ofw-membros">
                                <li>
                                    <span className="ofw-mono">T</span>
                                    <div><b>Theo</b><span>Diretor de operações</span></div>
                                </li>
                                <li>
                                    <span className="ofw-mono">M</span>
                                    <div><b>Martin</b><span>Gerente financeiro</span></div>
                                </li>
                                <li>
                                    <span className="ofw-mono">S</span>
                                    <div><b>Sofi</b><span>Agenda e compromissos</span></div>
                                </li>
                                <li>
                                    <span className="ofw-mono">L</span>
                                    <div><b>Luna</b><span>Organização e documentos</span></div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>Na mesma conversa trabalha o escritório inteiro</h3>
                    <p>Dinheiro é com o Martin, mas agenda, tarefas e documentos moram ali também. Você fala uma vez e quem cuida do assunto responde.</p>
                </section>
            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/assessores" className="of-modal-link">Conhecer a equipe de assessores&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal of-modal--claro" id="pnmModalPainel" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="pnmModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">O painel</span>
                <h2 className="of-modal-titulo" id="pnmModalTitulo">O Simplific Pro também em tela grande.</h2>
                <p className="of-modal-lead">Tudo o que os assessores organizam no WhatsApp vira um painel no navegador. Você entra quando quiser ver o mês de uma vez, sem instalar nada.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca pnm-passagem">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Na conversa</span>
                                <span className="ofm-selo">19/08</span>
                            </div>

                            <div className="pnm-balao-zap">
                                <p>gastei 62 na farmácia agora</p>
                                <span className="pnm-hora">08:14
                                    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                </span>
                            </div>

                            <span className="pnm-desce" aria-hidden="true">
                                <svg viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 1.5v15M1.7 12.4 6 16.8l4.3-4.4"/></svg>
                            </span>

                            <p className="ofm-rot pnm-rot-baixo">No painel</p>

                            <ul className="pnm-lanc">
                                <li>
                                    <span className="pnm-ponto"></span>
                                    <span className="pnm-lanc-txt">
                                        <b>Farmácia São João</b>
                                        <i>SAÚDE · 19/08</i>
                                    </span>
                                    <span className="pnm-lanc-val">−R$ 62,00</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>O que entra na conversa aparece no painel</h3>
                    <p>Você manda a mensagem e segue o seu dia. Quando abrir o painel, o gasto já está lá, com categoria, data e forma de pagamento.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca pnm-mesas">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">As mesas do escritório</span>
                            </div>

                            <ul className="pnm-abas">
                                <li className="is-ativa">
                                    <span className="pnm-aba-foto"><img src="/meuassessor/images/martin.jpg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>FINANÇAS</b><i>por Martin</i></span>
                                </li>
                                <li>
                                    <span className="pnm-aba-foto"><img src="/meuassessor/images/sofi.jpg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>AGENDA</b><i>por Sofi</i></span>
                                </li>
                                <li>
                                    <span className="pnm-aba-foto"><img src="/meuassessor/images/luna.jpg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>TAREFAS</b><i>por Luna</i></span>
                                </li>
                                <li>
                                    <span className="pnm-aba-foto"><img src="/meuassessor/images/theo.jpg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>OPERAÇÃO</b><i>por Theo</i></span>
                                </li>
                            </ul>

                            <span className="pnm-fio-marca"></span>
                        </div>
                    </div>

                    <h3>Uma mesa para cada assessor</h3>
                    <p>Finanças com o Martin, agenda com a Sofi, tarefas com a Luna e a operação inteira com o Theo. Você troca de mesa num clique e o assunto muda de dono.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca pnm-nav">
                            <div className="pnm-nav-pastilhas" aria-hidden="true">
                                <i></i><i></i><i></i>
                            </div>

                            <div className="pnm-nav-barra">
                                <svg className="pnm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.2"/>
                                    <path d="M3.5 5.9V4.2a2.5 2.5 0 0 1 5 0v1.7"
                                          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                                <span className="pnm-url">app.meuassessor.com</span>
                            </div>

                            <p className="pnm-nav-nota">A sua conta, aberta em qualquer computador.</p>
                        </div>
                    </div>

                    <h3>No navegador, sem instalar nada</h3>
                    <p>O painel abre em qualquer computador, no endereço da sua conta. Não tem aplicativo para baixar nem atualização para acompanhar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca pnm-recado-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Recado do painel</span>
                                <span className="ofm-selo">Hoje</span>
                            </div>

                            <div className="pnm-recado">
                                <span className="pnm-recado-foto"><img src="/meuassessor/images/martin.jpg" alt="" /></span>
                                <div className="pnm-balao">
                                    <p className="pnm-balao-quem"><b>Martin</b> · Gerente financeiro</p>
                                    <p className="pnm-balao-txt">seu saldo está <b>18% acima</b> do saldo de julho, com <b>Mercado</b> puxando os gastos.</p>
                                    <p className="pnm-balao-sync">sincronizado às 00:06
                                        <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6.6 4.2 10 11 2.3"/><path d="M8.4 6.9 10.6 10 18 2"/></svg>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Sempre do dia, nunca de ontem</h3>
                    <p>O painel e a conversa são a mesma conta. O que os assessores registram de um lado aparece do outro, com a hora da última sincronização escrita nela.</p>
                </section>

            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/assessores" className="of-modal-link">Conhecer a equipe de assessores&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal of-modal--claro" id="cvmModalConta" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="cvmModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Conta compartilhada</span>
                <h2 className="of-modal-titulo" id="cvmModalTitulo">A conta é sua, e cabe a sua família e a sua equipe.</h2>
                <p className="of-modal-lead">Você convida com um código, cada pessoa fala com o escritório do próprio WhatsApp, e todo mundo usa a mesma assinatura.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cvm-menu-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Sua equipe de acesso</span>
                            </div>

                            <ul className="cvm-menu">
                                <li>
                                    <span className="cvm-icone">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9.4" cy="8.6" r="3.3"/>
                                            <path d="M3.5 19.4c0-3.2 2.6-5.3 5.9-5.3s5.9 2.1 5.9 5.3"/>
                                            <path d="M16.6 6.3a3 3 0 0 1 0 5.9"/>
                                            <path d="M17.9 14.6c2 .5 3.4 2.1 3.4 4.2"/>
                                        </svg>
                                    </span>
                                    <span className="cvm-fila-txt"><b>Usuários conectados</b><i>quem o Theo atende nesta conta</i></span>
                                    <span className="cvm-chev">›</span>
                                </li>

                                <li>
                                    <span className="cvm-icone">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2.8" y="6" width="13.4" height="10" rx="2.1"/>
                                            <path d="M3.4 7.2 9.5 11.6 15.6 7.2"/>
                                            <path d="M18.9 13.6v5.6"/>
                                            <path d="M16.1 16.4h5.6"/>
                                        </svg>
                                    </span>
                                    <span className="cvm-fila-txt"><b>Convites</b><i>códigos de acesso à sua conta</i></span>
                                    <span className="cvm-chev">›</span>
                                </li>

                                <li>
                                    <span className="cvm-icone">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2.9" y="7.6" width="18.2" height="11.6" rx="2.3"/>
                                            <path d="M8.9 7.6V6.3a1.8 1.8 0 0 1 1.8-1.8h2.6a1.8 1.8 0 0 1 1.8 1.8v1.3"/>
                                            <path d="M2.9 12.4h18.2"/>
                                        </svg>
                                    </span>
                                    <span className="cvm-fila-txt"><b>Área do contador</b><i>dossiê fiscal e ponte com seu contador</i></span>
                                    <span className="cvm-chev">›</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>O convite nasce na sua conta</h3>
                    <p>Em Usuários conectados você vê quem o Theo atende hoje. Para trazer alguém, você gera um código de convite e manda para a pessoa. Não existe senha compartilhada nem aparelho emprestado.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cvm-folha">
                            <div className="cvm-folha-topo">
                                <b>Convite pronto</b>
                                <span className="cvm-fechar">fechar ×</span>
                            </div>

                            <p className="cvm-lead">Quem usar este código no cadastro entra na sua conta, e o Theo passa a atender essa pessoa também.</p>

                            <p className="cvm-rot-codigo">Código de convite</p>
                            <p className="cvm-codigo">COD-CONVITE-7QF3ZD</p>

                            <div className="cvm-acoes">
                                <span className="cvm-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="8.4" y="8.4" width="12.2" height="12.2" rx="2.4"/>
                                        <path d="M15.6 5.2a2.4 2.4 0 0 0-2.2-1.6H5.8a2.4 2.4 0 0 0-2.4 2.4v7.6c0 1 .6 1.8 1.6 2.2"/>
                                    </svg>Copiar</span>
                                <span className="cvm-btn cvm-btn--zap">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>Enviar no WhatsApp</span>
                            </div>
                        </div>
                    </div>

                    <h3>Um código, uma pessoa</h3>
                    <p>Quem usa o código no cadastro entra na sua conta, e o Theo passa a atender essa pessoa também. Convite pendente aparece na sua lista e pode ser cancelado antes de a pessoa entrar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cvm-zap">
                            <div className="cvm-zap-topo">
                                <span className="cvm-zap-av">
                                    <img src="/meuassessor/images/perfi-fundo-preto.png" alt="" aria-hidden="true" />
                                </span>
                                <span className="cvm-zap-id">
                                    <b>Simplific Pro<svg className="cvm-selo" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 1.4l2.4 1.75 2.94-.29 1.18 2.72 2.66 1.31-.63 2.9L22 12l-1.45 2.21.63 2.9-2.66 1.31-1.18 2.72-2.94-.29L12 22.6l-2.4-1.75-2.94.29-1.18-2.72-2.66-1.31.63-2.9L2 12l1.45-2.21-.63-2.9 2.66-1.31 1.18-2.72 2.94.29L12 1.4z" fill="#1d9bf0"/>
                                        <path d="M10.6 15.5L7.4 12.3l1.3-1.3 1.9 1.9 4.7-4.7 1.3 1.3-6 6z" fill="#ffffff"/>
                                    </svg></b>
                                    <i>online</i>
                                </span>
                            </div>

                            <div className="cvm-chat">
                                <span className="cvm-chip">hoje</span>

                                <div className="cvm-fala cvm-fala--out">
                                    <div className="cvm-balao cvm-balao--out">
                                        <p>COD-CONVITE-7QF3ZD</p>
                                        <span className="cvm-meta">09:12<svg className="cvm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="cvm-fala cvm-fala--in">
                                    <div className="cvm-balao cvm-balao--in">
                                        <b className="cvm-quem">Theo</b>
                                        <p>Prontinho, Bia. Sua conta foi conectada e o escritório inteiro já te atende.</p>
                                        <span className="cvm-meta">09:12</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Cada um fala do próprio número</h3>
                    <p>A pessoa convidada conversa com o escritório pelo WhatsApp dela, sem entrar no seu aparelho e sem ver a sua conversa. O que ela pede cai na mesma conta organizada.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cvm-gente-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Quem está na conta</span>
                            </div>

                            <ul className="cvm-gente">
                                <li>
                                    <span className="cvm-av cvm-av--voce">V</span>
                                    <span className="cvm-gente-txt"><b>Você</b><i>titular da conta</i></span>
                                </li>
                                <li>
                                    <span className="cvm-av">D</span>
                                    <span className="cvm-gente-txt"><b>Douglas</b><i>sócio</i></span>
                                </li>
                                <li>
                                    <span className="cvm-av">B</span>
                                    <span className="cvm-gente-txt"><b>Bia</b><i>família</i></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>Convide quantas pessoas quiser, sem custo adicional</h3>
                    <p>Não existe limite de participantes nem cobrança por pessoa: a assinatura é uma só para o sócio, a família ou a equipe inteira.</p>
                </section>

            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/funcionalidades" className="of-modal-link">Ver todas as funcionalidades&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal of-modal--claro" id="cbmModalCobranca" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="cbmModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Cobranças e recados</span>
                <h2 className="of-modal-titulo" id="cbmModalTitulo">Você pede e o assessor cuida da conversa.</h2>
                <p className="of-modal-lead">Cobrar um cliente, lembrar um aluno, avisar quem vem na reunião. Você diz o que precisa uma vez e o assessor fala com a pessoa, na conversa dela.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cbm-peca">
                            <div className="cbm-chat">
                                <span className="cbm-chip">hoje</span>

                                <div className="cbm-fala cbm-fala--out">
                                    <div className="cbm-balao cbm-balao--out">
                                        <p>Simplific Pro, todo dia 5, lembra o João de pagar as aulas de personal, R$ 350 🙏</p>
                                        <span className="cbm-meta">18:42<svg className="cbm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="cbm-fala cbm-fala--in">
                                    <div className="cbm-balao cbm-balao--in">
                                        <b className="cbm-quem">Martin</b>
                                        <p>Combinado. Todo dia 5 o João recebe o lembrete com o link de pagamento. Te aviso quando cair.</p>
                                        <span className="cbm-meta">18:42</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>O pedido é uma frase</h3>
                    <p>Você escreve como falaria e o Martin confirma com o combinado por extenso. Pode ser uma vez ou repetir sozinho, todo dia 5, até você mandar parar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cbm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Na conversa do João</span>
                                <span className="ofm-selo">05/09</span>
                            </div>

                            <div className="cbm-chat">

                                <div className="cbm-fala cbm-fala--in">
                                    <div className="cbm-balao cbm-balao--in">
                                        <p>Oi, João, tudo bem? Chegou a mensalidade do personal, R$ 350,00. Já te mando o link.</p>
                                        <span className="cbm-meta">09:02</span>
                                    </div>
                                </div>

                                <div className="cbm-fala cbm-fala--in">
                                    <div className="cbm-balao cbm-balao--in cbm-balao--link cbm-balao--segue">
                                        <p>Segue o link. É só abrir e pagar.</p>
                                        <span className="cbm-link">
                                            <svg className="cbm-glifo" viewBox="0 0 20 13"><rect x="0.85" y="0.85" width="18.3" height="11.3" rx="2.4"/><path d="M0.85 4.9h18.3"/><path d="M4.1 9.1h3.4"/></svg>
                                            <span className="cbm-url">meuassessor.com/pagar/8kx2</span>
                                        </span>
                                        <span className="cbm-meta">09:03</span>
                                    </div>
                                </div>

                                <div className="cbm-fala cbm-fala--out">
                                    <div className="cbm-balao cbm-balao--out cbm-balao--doc">
                                        <div className="cbm-recibo">
                                            <div className="cbm-recibo-cab">
                                                <svg className="cbm-selo" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8"/><path d="M4.4 8.2 6.9 10.6 11.6 5.4"/></svg>
                                                <span className="cbm-recibo-t">Comprovante de pagamento</span>
                                                <span className="cbm-recibo-d">05/09</span>
                                            </div>
                                            <p className="cbm-recibo-v">R$ 350,00</p>
                                            <p className="cbm-recibo-l">Aulas de personal · 09:06</p>
                                        </div>
                                        <span className="cbm-meta">09:06<svg className="cbm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>O recado chega com o link de pagamento</h3>
                    <p>No dia certo o escritório fala com a pessoa pelo WhatsApp dela, com o valor e o motivo escritos e o link para pagar na mesma mensagem.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cbm-peca">
                            <div className="cbm-chat">

                                <span className="cbm-chip">sexta, 5 de setembro</span>

                                <div className="cbm-fala cbm-fala--in">
                                    <div className="cbm-balao cbm-balao--in">
                                        <b className="cbm-quem">Martin</b>
                                        <p>O João pagou. R$ 350,00 já caiu na sua conta.</p>
                                        <span className="cbm-meta">09:07</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>O recibo volta para a sua conversa</h3>
                    <p>Quando a pessoa paga, você fica sabendo sem perguntar. O comprovante fica guardado com o resto, e a cobrança do mês seguinte já está de pé.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca cbm-peca">
                            <div className="cbm-chat">
                                <div className="cbm-fala cbm-fala--out">
                                    <div className="cbm-balao cbm-balao--out">
                                        <p>lembra meu irmão do aniversário da mãe dia 27</p>
                                        <span className="cbm-meta">21:15<svg className="cbm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="cbm-fala cbm-fala--in">
                                    <div className="cbm-balao cbm-balao--in">
                                        <b className="cbm-quem cbm-quem--sofi">Sofi</b>
                                        <p>Combinado. No dia 27 eu mando o recado para ele.</p>
                                        <span className="cbm-meta">21:15</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Nem toda conversa é sobre dinheiro</h3>
                    <p>O mesmo vale para lembrar alguém de um compromisso, de uma data ou de um documento. Você escolhe quem, o quê e quando, e o assessor manda o recado na hora certa.</p>
                </section>

            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/funcionalidades" className="of-modal-link">Ver todas as funcionalidades&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal of-modal--claro" id="gdmModalDocumentos" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="gdmModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Documentos</span>
                <h2 className="of-modal-titulo" id="gdmModalTitulo">O documento entra na conversa e sai guardado.</h2>
                <p className="of-modal-lead">Foto, PDF, print ou arquivo do computador. Você manda do jeito que estiver, e a Luna guarda com a confirmação de onde ficou.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca gdm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Na sua conversa</span>
                            </div>

                            <div className="gdm-chat">
                                <div className="gdm-fala gdm-fala--out">
                                    <div className="gdm-balao gdm-balao--out">
                                        <span className="gdm-arq">
                                            <svg className="gdm-folha" viewBox="0 0 13 16" aria-hidden="true"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                            <span className="gdm-arq-t">nota-fiscal-8842.pdf</span>
                                            <span className="gdm-arq-d">2 págs</span>
                                        </span>
                                        <p>guarda essa aqui</p>
                                        <span className="gdm-meta">17:09<svg className="gdm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Qualquer formato, do jeito que vier</h3>
                    <p>Não precisa renomear nem converter nada. A foto da nota, o PDF do contrato e o print do comprovante valem igual. Você manda e segue o seu dia.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca gdm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">A resposta da Luna</span>
                            </div>

                            <div className="gdm-chat">
                                <div className="gdm-fala gdm-fala--in">
                                    <div className="gdm-balao gdm-balao--in">
                                        <b className="gdm-quem">Luna</b>
                                        <p>Guardei em Notas fiscais. Quando precisar, é só me pedir.</p>
                                        <span className="gdm-meta">17:09</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>A confirmação diz onde ficou</h3>
                    <p>A Luna responde na conversa dizendo em que pasta o arquivo entrou. É o recibo de sempre do escritório: você sabe que aconteceu sem abrir nada.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca gdm-peca">
                            <div className="gdm-chat">
                                <div className="gdm-fala gdm-fala--out">
                                    <div className="gdm-balao gdm-balao--out">
                                        <p>acha o contrato do apartamento</p>
                                        <span className="gdm-meta">21:04<svg className="gdm-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                                    </div>
                                </div>

                                <div className="gdm-fala gdm-fala--in">
                                    <div className="gdm-balao gdm-balao--in gdm-balao--doc">
                                        <span className="gdm-arq gdm-arq--in">
                                            <svg className="gdm-folha" viewBox="0 0 13 16" aria-hidden="true"><path d="M1.1 1.5h6.2L11.9 6v8.5H1.1Z"/><path d="M7.3 1.5V6h4.6"/></svg>
                                            <span className="gdm-arq-t">contrato-apartamento.pdf</span>
                                            <span className="gdm-arq-d">12 págs</span>
                                        </span>
                                        <span className="gdm-meta">21:04</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3>Para achar, é só descrever</h3>
                    <p>Você pede o arquivo pelo que ele é, o contrato do apartamento, a nota da geladeira, e ele volta na conversa. Não precisa lembrar nome de arquivo nem data.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca gdm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Guardado com prazo</span>
                                <span className="ofm-selo">vence 12/03</span>
                            </div>

                            <div className="gdm-doc">
                                <span className="gdm-capa">PDF</span>
                                <span className="gdm-doc-txt">
                                    <b>Apólice do seguro do carro</b>
                                    <i>Veículo · 4 páginas · válida até 12/03</i>
                                </span>
                            </div>

                            <p className="gdm-aviso">
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="8" cy="8" r="6.4"/>
                                    <path d="M8 4.5V8l2.4 1.6"/>
                                </svg>
                                A Luna avisa antes do vencimento.
                            </p>
                        </div>
                    </div>

                    <h3>Documento com prazo vira lembrete</h3>
                    <p>Apólice, alvará e o que mais tiver validade, a Luna avisa antes do prazo. Guardar e lembrar andam juntos.</p>
                </section>

            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/funcionalidades" className="of-modal-link">Ver todas as funcionalidades&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

    <div className="of-modal of-modal--claro" id="drmModalDrive" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="drmModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">O drive</span>
                <h2 className="of-modal-titulo" id="drmModalTitulo">O drive nasce com a conta e se organiza sozinho.</h2>
                <p className="of-modal-lead">Cada arquivo que passa pela conversa entra no lugar certo de um drive que já vem no plano, sem custo à parte e sem você criar pasta.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca drm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">O seu drive</span>
                            </div>

                            <ul className="drm-pastas">
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Contratos</span>
                                    <span className="drm-pasta-n">8 arquivos</span>
                                </li>
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Notas fiscais</span>
                                    <span className="drm-pasta-n">42 arquivos</span>
                                </li>
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Veículo</span>
                                    <span className="drm-pasta-n">5 arquivos</span>
                                </li>
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Casa</span>
                                    <span className="drm-pasta-n">17 arquivos</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>Cada coisa na sua pasta</h3>
                    <p>Contrato vai para contratos, nota fiscal vai para notas, documento do carro vai para veículo. A organização acontece na entrada, não num mutirão de fim de ano.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca drm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Sua assinatura</span>
                            </div>

                            <div className="drm-plano">
                                <span className="drm-glifo">
                                    <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                </span>
                                <span className="drm-plano-t">Drive do escritório</span>
                                <span className="drm-plano-n">incluído no plano</span>
                            </div>
                        </div>
                    </div>

                    <h3>Já vem no plano</h3>
                    <p>O drive faz parte da assinatura. Não existe cobrança à parte pelos seus arquivos nem plano extra para destravar espaço.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca drm-nav">
                            <div className="drm-nav-pastilhas" aria-hidden="true">
                                <i></i><i></i><i></i>
                            </div>

                            <div className="drm-nav-barra">
                                <svg className="drm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.2"/>
                                    <path d="M3.5 5.9V4.2a2.5 2.5 0 0 1 5 0v1.7"
                                          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                </svg>
                                <span className="drm-url">app.meuassessor.com</span>
                            </div>

                            <ul className="drm-pastas drm-pastas--nav">
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Contratos</span>
                                    <span className="drm-pasta-n">8 arquivos</span>
                                </li>
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Notas fiscais</span>
                                    <span className="drm-pasta-n">42 arquivos</span>
                                </li>
                                <li>
                                    <span className="drm-glifo">
                                        <svg viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M1.4 3.4a1.8 1.8 0 0 1 1.8-1.8h3.9l2 2.2h7.7a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8H3.2a1.8 1.8 0 0 1-1.8-1.8Z"/></svg>
                                    </span>
                                    <span className="drm-pasta-t">Veículo</span>
                                    <span className="drm-pasta-n">5 arquivos</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <h3>Em tela grande também</h3>
                    <p>O drive aparece no painel do navegador, com as pastas abertas em lista. O que entrou pelo WhatsApp está lá quando você abre.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca drm-peca">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Contratos</span>
                            </div>

                            <div className="drm-arq">
                                <span className="drm-capa">PDF</span>
                                <span className="drm-arq-txt">
                                    <b>Contrato do apartamento</b>
                                    <i>12 páginas · guardado em março</i>
                                </span>
                            </div>

                            <div className="drm-acoes">
                                <span className="drm-btn">
                                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M8 2.4v7.4"/>
                                        <path d="M4.9 6.9 8 10l3.1-3.1"/>
                                        <path d="M2.9 12.6h10.2"/>
                                    </svg>Baixar</span>
                                <span className="drm-btn">
                                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M2.9 4.3h10.2"/>
                                        <path d="M6.3 4.3V3a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.3"/>
                                        <path d="M4.3 4.3v8.3a1.4 1.4 0 0 0 1.4 1.4h4.6a1.4 1.4 0 0 0 1.4-1.4V4.3"/>
                                    </svg>Apagar</span>
                            </div>
                        </div>
                    </div>

                    <h3>Os arquivos são seus</h3>
                    <p>Tudo fica na sua conta e sob o seu controle. Você baixa e apaga quando quiser, e a página de Segurança explica onde cada coisa mora.</p>
                </section>

            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/funcionalidades" className="of-modal-link">Ver todas as funcionalidades&nbsp;&rarr;</a>
            </footer>
        </div>
    </div>

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
