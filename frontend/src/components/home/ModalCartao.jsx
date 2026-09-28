import React from 'react';

const ModalCartao = () => {
  return (
    <><div className="of-modal" id="ofModalCartao" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="ofModalTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Open Finance</span>
                <h2 className="of-modal-titulo" id="ofModalTitulo">Seus bancos entram na conversa.</h2>
                <p className="of-modal-lead">A conexão é feita uma vez, dentro do aplicativo do seu banco. Do dia seguinte em diante o Martin começa o expediente já sabendo quanto entrou, quanto saiu e o que vence essa semana.</p>
            </header>

            <div className="of-modal-corpo" id="ofModalCorpo">
            <div className="of-modal-grade">
                
                <section className="of-modal-bloco">
                    <div className="ofm-palco ofm-palco-auth" aria-hidden="true">
                        <div className="ofm-peca ofm-fone">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="M3.5 5.9V4.1a2.5 2.5 0 0 1 5 0v1.8"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                </svg>
                                <span>Aplicativo do seu banco</span>
                            </div>

                            <p className="ofm-fone-titulo">Compartilhar com o escritório</p>

                            <ul className="ofm-itens">
                                <li>
                                    <i className="ofm-tique">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="m2.6 6.3 2.4 2.4 4.4-5.1" stroke="currentColor"
                                                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                    <span>Conta corrente</span>
                                </li>
                                <li>
                                    <i className="ofm-tique">
                                        <svg viewBox="0 0 12 12" fill="none">
                                            <path d="m2.6 6.3 2.4 2.4 4.4-5.1" stroke="currentColor"
                                                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </i>
                                    <span>Cartão de crédito</span>
                                </li>
                            </ul>

                            <div className="ofm-bio">
                                <span className="ofm-bio-marca">
                                    <svg viewBox="0 0 16 16" fill="none">
                                        <path d="M2.6 8.2a5.4 5.4 0 0 1 10.8 0v2.2M5.2 8.2a2.8 2.8 0 0 1 5.6 0v3.6M8 8.2v5"
                                              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                    </svg>
                                </span>
                                <span>Confirmar com biometria</span>
                            </div>
                        </div>
                    </div>

                    <h3>A autorização é sua e acontece no seu banco</h3>
                    <p>Você escolhe quais contas e cartões quer compartilhar e confirma com a sua biometria, dentro do aplicativo do próprio banco. O escritório não participa dessa etapa. A sua senha não passa por aqui em momento nenhum.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-painel">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Saldo em contas</span>
                                <span className="ofm-selo">
                                    <svg viewBox="0 0 14 10" fill="none">
                                        <path d="M1 5s2.2-3.6 6-3.6S13 5 13 5s-2.2 3.6-6 3.6S1 5 1 5Z"
                                              stroke="currentColor" strokeWidth="1"/>
                                        <circle cx="7" cy="5" r="1.5" stroke="currentColor" strokeWidth="1"/>
                                    </svg>
                                    somente leitura
                                </span>
                            </div>

                            <strong className="ofm-valor">R$ 12.480,35</strong>

                            <ul className="ofm-extrato">
                                <li><span>Fatura Visa · vence dia 10</span><b>R$ 1.204,90</b></li>
                                <li><span>Mercado São Bento</span><b>R$ 238,17</b></li>
                                <li><span>Recebimento de cliente</span><b className="is-entrada">R$ 3.500,00</b></li>
                                <li><span>Assinatura de software</span><b>R$ 89,90</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O que o escritório passa a enxergar</h3>
                    <p>Chega uma cópia de leitura: saldo, extrato e faturas de cartão. É o bastante para o Martin fechar o mês sem você abrir aplicativo de banco. A conexão não tem permissão para transferir, pagar ou movimentar valor nenhum, e esse limite está nas regras do Open Finance, não em uma promessa nossa.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-rede">
                            <div className="ofm-busca">
                                <svg viewBox="0 0 12 12" fill="none">
                                    <circle cx="5.2" cy="5.2" r="3.6" stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="m8 8 2.6 2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                                </svg>
                                <span>Buscar instituição</span>
                            </div>

                            <div className="ofm-fichas">
                                <i><img src="/meuassessor/images/bancos/itau.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/bb.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/bradesco.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-caixa"><img src="/meuassessor/images/bancos/caixa.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/santander.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-nubank"><img src="/meuassessor/images/bancos/nubank.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/btg.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/inter.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/c6.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i className="ficha-xp"><img src="/meuassessor/images/bancos/xp.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/sicredi.svg" alt="" loading="lazy" decoding="async" /></i>
                                <i><img src="/meuassessor/images/bancos/sicoob.svg" alt="" loading="lazy" decoding="async" /></i>
                            </div>
                        </div>
                    </div>

                    <h3>114 instituições disponíveis</h3>
                    <p>O Open Finance é o sistema oficial de compartilhamento de dados bancários do Brasil, criado pelo Banco Central e em operação desde 2021. Os principais bancos do país estão dentro, e hoje são 114 bancos e instituições que você pode conectar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco ofm-palco-fim" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofm-fone-fim">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-cadeado" viewBox="0 0 12 14" fill="none">
                                    <rect x="1.1" y="5.9" width="9.8" height="7.2" rx="2.2"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                    <path d="M3.5 5.9V4.1a2.5 2.5 0 0 1 5 0v1.8"
                                          stroke="currentColor" strokeWidth="1.1"/>
                                </svg>
                                <span>Autorizações</span>
                            </div>

                            <div className="ofm-linha-chave">
                                <div>
                                    <b>Compartilhamento de dados</b>
                                    <span>Válido até 12 de agosto de 2027</span>
                                </div>
                                <span className="ofm-chave"><i></i></span>
                            </div>

                            <span className="ofm-cancelar">Cancelar compartilhamento</span>
                        </div>
                    </div>

                    <h3>O desligamento também é seu</h3>
                    <p>O compartilhamento tem prazo e fica registrado na área de autorizações do aplicativo do seu banco. O cancelamento é feito por lá, sem depender do escritório. A partir desse momento os assessores deixam de receber os seus dados.</p>
                </section>
            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                
                <a href="/seguranca" className="of-modal-link">Ler sobre a segurança da ferramenta&nbsp;&rarr;</a>
            </footer>
        </div>
    </div></>
  );
};

export default ModalCartao;
