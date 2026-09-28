import React from 'react';\n\nconst ModalConta = () => {\n  return (\n    <><div className="of-modal of-modal--claro" id="cvmModalConta" hidden>
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
    </div></>\n  );\n};\n\nexport default ModalConta;\n