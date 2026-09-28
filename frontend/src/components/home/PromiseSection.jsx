import React from 'react';

const PromiseSection = () => {
  return (
    <><section className="promise-section" id="promiseSection">
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
                                <p><b>Simplific</b> · alimentação está <b>15% acima</b> de julho. No ritmo de agora, o mês fecha perto de R$ 1.430.</p>
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
                                <p><b>Simplific</b> · quinta sua tarde já é da Ana, então te lembro <b>na quarta</b>. Ainda dá tempo de pagar sem multa.</p>
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
    </section></>
  );
};

export default PromiseSection;
