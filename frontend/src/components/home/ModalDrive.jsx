import React from 'react';

const ModalDrive = () => {
  return (
    <><div className="of-modal of-modal--claro" id="drmModalDrive" hidden>
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
    </div></>
  );
};

export default ModalDrive;
