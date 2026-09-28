import React from 'react';\n\nconst ModalDocumentos = () => {\n  return (\n    <><div className="of-modal of-modal--claro" id="gdmModalDocumentos" hidden>
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
                                        <b className="gdm-quem">Simplific</b>
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
    </div></>\n  );\n};\n\nexport default ModalDocumentos;\n