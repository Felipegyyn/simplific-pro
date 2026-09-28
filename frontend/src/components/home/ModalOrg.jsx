import React from 'react';

const ModalOrg = () => {
  return (
    <><div className="of-modal" id="ofModalOrg" hidden>
        <div className="of-modal-veu" data-fechar></div>

        <div className="of-modal-caixa" role="dialog" aria-modal="true"
             aria-labelledby="ofModalOrgTitulo" tabIndex="-1">

            <button type="button" className="of-modal-x" data-fechar aria-label="Fechar">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" stroke="currentColor"
                          strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
            </button>

            <header className="of-modal-topo">
                <span className="of-modal-etiqueta">Organização dos gastos</span>
                <h2 className="of-modal-titulo" id="ofModalOrgTitulo">O seu extrato chega arrumado.</h2>
                <p className="of-modal-lead">O banco manda a linha em caixa alta e cheia de código. O Martin lê cada uma delas, descobre a loja, põe o gasto na categoria certa e guarda o que se repete. Quando você pergunta para onde foi o mês, o número já está pronto.</p>
            </header>

            <div className="of-modal-corpo">
            <div className="of-modal-grade">
                
                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-mes">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Agosto por categoria</span>
                                <span className="ofm-selo">R$ 6.957</span>
                            </div>

                            <ul className="ofm-cats">
                                <li><span>Mercado</span><i style={{'--w': '100%'}}></i><b>R$ 1.240</b></li>
                                <li><span>Restaurante</span><i style={{'--w': '74%'}}></i><b>R$ 918</b></li>
                                <li><span>Transporte</span><i style={{'--w': '58%'}}></i><b>R$ 720</b></li>
                                <li><span>Saúde</span><i style={{'--w': '44%'}}></i><b>R$ 546</b></li>
                                <li><span>Assinaturas</span><i style={{'--w': '31%'}}></i><b>R$ 384</b></li>
                                <li><span>Beleza</span><i style={{'--w': '22%'}}></i><b>R$ 272</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O mês inteiro já vem repartido</h3>
                    <p>Cada categoria vai fechando sozinha enquanto o mês corre. Para onde foi o dinheiro deixa de ser uma pergunta de planilha e vira uma linha pronta, com o maior gasto em cima.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fixa">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Conta fixa</span>
                                <span className="ofm-selo">Assinaturas</span>
                            </div>

                            <span className="ofm-fixa-nome">Netflix</span>

                            <ul className="ofm-serie">
                                <li><i className="ofm-ponto"></i><span>12 de junho</span><b>R$ 44,90</b></li>
                                <li><i className="ofm-ponto"></i><span>12 de julho</span><b>R$ 44,90</b></li>
                                <li><i className="ofm-ponto"></i><span>12 de agosto</span><b>R$ 44,90</b></li>
                                <li className="is-prevista"><i className="ofm-ponto"></i><span>12 de setembro <em>previsto</em></span><b>R$ 44,90</b></li>
                            </ul>
                        </div>
                    </div>

                    <h3>O que se repete ele passa a esperar</h3>
                    <p>Assinatura, mensalidade, aluguel, conta de luz. Depois de ver a mesma cobrança voltar no mesmo dia, o Martin marca ela como conta fixa e já conta com ela antes de a fatura fechar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-proj">
                            <div className="ofm-painel-topo">
                                <span className="ofm-rot">Previsão de setembro</span>
                                <span className="ofm-selo">média de 6 meses</span>
                            </div>

                            <strong className="ofm-valor">R$ 7.180,00</strong>

                            <div className="ofm-barras">
                                <i style={{'--h': '62%'}}></i>
                                <i style={{'--h': '78%'}}></i>
                                <i style={{'--h': '70%'}}></i>
                                <i style={{'--h': '88%'}}></i>
                                <i style={{'--h': '74%'}}></i>
                                <i className="is-prevista" style={{'--h': '92%'}}></i>
                            </div>

                            <div className="ofm-meses">
                                <span>abr</span>
                                <span>mai</span>
                                <span>jun</span>
                                <span>jul</span>
                                <span>ago</span>
                                <span className="is-prevista">set</span>
                            </div>
                        </div>
                    </div>

                    <h3>O mês que vem já tem número</h3>
                    <p>Com as contas fixas de um lado e a média dos seus meses do outro, o Martin projeta quanto deve sair até o fim de setembro. É o número que responde à pergunta de sempre, se dá para gastar agora ou se é melhor esperar.</p>
                </section>

                <section className="of-modal-bloco">
                    <div className="ofm-palco" aria-hidden="true">
                        <div className="ofm-peca ofm-fone ofm-conversa">
                            <div className="ofm-fone-topo">
                                <svg className="ofm-ic-chat" viewBox="0 0 14 13" fill="none">
                                    <path d="M1.8 3.8A2.2 2.2 0 0 1 4 1.6h6a2.2 2.2 0 0 1 2.2 2.2v3.6A2.2 2.2 0 0 1 10 9.6H5.6L2.9 11.6V9.4A2.2 2.2 0 0 1 1.8 7.4V3.8Z"
                                          stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                </svg>
                                <span>Simplific Pro</span>
                            </div>

                            <div className="ofm-bolhas">
                                <span className="ofm-bolha is-sua">O Outback de ontem foi jantar com cliente</span>
                                <span className="ofm-bolha">Movi para Despesas do trabalho. Toda vez que o Outback aparecer, já entra assim.</span>
                            </div>
                        </div>
                    </div>

                    <h3>Quando ele erra, você corrige numa frase</h3>
                    <p>Categoria trocada acontece, e o conserto é uma mensagem na conversa. O Martin refaz o lançamento na hora e guarda a correção, então o mesmo estabelecimento entra certo da próxima vez.</p>
                </section>
            </div>
            </div>

            <footer className="of-modal-pe">
                <button type="button" className="of-modal-voltar" data-fechar>Voltar</button>
                <a href="/assessores" className="of-modal-link">Conhecer o trabalho do Martin&nbsp;&rarr;</a>
            </footer>
        </div>
    </div></>
  );
};

export default ModalOrg;
