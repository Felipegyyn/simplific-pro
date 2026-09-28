import React from 'react';

const ModalConversa = () => {
  return (
    <><div className="of-modal" id="ofModalConversa" hidden>
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
                                    <em>Simplific</em>
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
                                <b>Simplific</b>
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
                                    <em>Simplific</em>
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
                                    <em>Simplific</em>
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
                                    <div><b>Simplific</b><span>Gerente financeiro</span></div>
                                </li>
                                <li>
                                    <span className="ofw-mono">S</span>
                                    <div><b>Sofi</b><span>Agenda e compromissos</span></div>
                                </li>
                                <li>
                                    <span className="ofw-mono">L</span>
                                    <div><b>Simplific</b><span>Organização e documentos</span></div>
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
                <a href="/assessores" className="of-modal-link">Conhecer a Inteligência Artificial&nbsp;&rarr;</a>
            </footer>
        </div>
    </div></>
  );
};

export default ModalConversa;
