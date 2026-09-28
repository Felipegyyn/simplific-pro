import React from 'react';

const ModalPainel = () => {
  return (
    <><div className="of-modal of-modal--claro" id="pnmModalPainel" hidden>
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
                                    <span className="pnm-aba-foto"><img src="/favicon.svg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>FINANÇAS</b><i>por Martin</i></span>
                                </li>
                                <li>
                                    <span className="pnm-aba-foto"><img src="/meuassessor/images/sofi.jpg" alt="" /></span>
                                    <span className="pnm-aba-txt"><b>AGENDA</b><i>por Sofi</i></span>
                                </li>
                                <li>
                                    <span className="pnm-aba-foto"><img src="/favicon.svg" alt="" /></span>
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
                                <span className="pnm-recado-foto"><img src="/favicon.svg" alt="" /></span>
                                <div className="pnm-balao">
                                    <p className="pnm-balao-quem"><b>Simplific</b> · Gerente financeiro</p>
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
    </div></>
  );
};

export default ModalPainel;
