import React from 'react';

const ExpedientSection = () => {
  return (
    <><section className="exp-section" id="expedienteSection" data-header="claro">

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
                                        <span className="pn-aba-foto"><img src="/favicon.svg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>FINANÇAS</b><i>por Martin</i></span>
                                    </span>
                                    <span className="pn-aba" data-aba="agenda">
                                        <span className="pn-aba-foto"><img src="/meuassessor/images/sofi.jpg" alt="" /></span>
                                        <span className="pn-aba-txt"><b>AGENDA</b><i>por Sofi</i></span>
                                    </span>
                                    <span className="pn-aba" data-aba="tarefas">
                                        <span className="pn-aba-foto"><img src="/favicon.svg" alt="" /></span>
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
                                            <span className="pn-recado-foto"><img src="/favicon.svg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b>Simplific</b> · Gerente financeiro</p>
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
                                            <span className="pn-recado-foto"><img src="/favicon.svg" alt="" /></span>
                                            <div className="pn-balao">
                                                <p className="pn-balao-quem"><b className="is-luna">Simplific</b> · Organização &amp; Docs</p>
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
                                        <b className="cb-quem">Simplific</b>
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
                                        <b className="cb-quem">Simplific</b>
                                        <p>Combinado. Todo dia 5 o João recebe o lembrete com o link de pagamento. Te aviso quando cair.</p>
                                        <span className="cb-meta">18:42</span>
                                    </div>
                                </div>

                                <span className="cb-chip">sexta, 5 de setembro</span>

                                <div className="cb-fala cb-fala--in">
                                    <span className="cb-dig cb-dig--in cb-dig--c1"><i></i><i></i><i></i></span>
                                    <div className="cb-balao cb-balao--in cb-ent--c1">
                                        <b className="cb-quem">Simplific</b>
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
                                        <b className="dc-quem">Simplific</b>
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
                                        <b className="dc-quem">Simplific</b>
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
                                        <b className="dc-quem">Simplific</b>
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
    </section></>
  );
};

export default ExpedientSection;
