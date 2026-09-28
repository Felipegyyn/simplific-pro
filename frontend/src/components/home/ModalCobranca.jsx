import React from 'react';\n\nconst ModalCobranca = () => {\n  return (\n    <><div className="of-modal of-modal--claro" id="cbmModalCobranca" hidden>
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
                                        <b className="cbm-quem">Simplific</b>
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
                                        <b className="cbm-quem">Simplific</b>
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
    </div></>\n  );\n};\n\nexport default ModalCobranca;\n