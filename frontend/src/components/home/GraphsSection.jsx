import React from 'react';

const GraphsSection = () => {
  return (
    <><section className="gd-section" id="graficosSection">

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
    </section></>
  );
};

export default GraphsSection;
