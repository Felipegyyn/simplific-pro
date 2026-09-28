import React from 'react';\n\nconst TeamSection = () => {\n  return (\n    <><section className="team-section" id="teamSection">
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
                        <img src="/favicon.svg" alt="Martin" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="sofi" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/meuassessor/images/sofi.jpg" alt="Sofi" className="team-selector-avatar" />
                    </div>
                    <div className="team-selector-card" data-assessor="luna" role="button" tabIndex="0" aria-pressed="false">
                        <img src="/favicon.svg" alt="Luna" className="team-selector-avatar" />
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
                            <img src="/favicon.svg" alt="Martin" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Simplific</span>

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
                            <img src="/favicon.svg" alt="Luna" className="team-portrait-img" loading="lazy" decoding="async" />
                        </div>
                        <div className="team-main-card-footer">
                            <div className="team-main-name">
                                <span>Simplific</span>

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
                                <p>a <b>Simplific</b> puxou o mês: 46 tarefas fechadas, 12 delas hoje.</p>
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
    </section></>\n  );\n};\n\nexport default TeamSection;\n