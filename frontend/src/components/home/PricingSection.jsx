import React from 'react';

const PricingSection = () => {
  return (
    <><section className="preco-section" id="planos" data-header="claro">

        <svg className="preco-defs" aria-hidden="true" focusable="false">
            <symbol id="preco-tique" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="7.4" fill="var(--preco-disco)" stroke="none"/>
                <path d="M5 8.15 7.05 10.2 11 5.85" fill="none" stroke="var(--preco-risco)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </symbol>
        </svg>

        <div className="preco-grade">

            <header className="preco-topo">
                <h2 className="preco-headline">Contrate o seu time completo.</h2>
                <p className="preco-sub">Um Assessor Financeiro Inteligente trabalhando 24 horas por dia para você. Sem burocracia e totalmente no WhatsApp.</p>
            </header>

            <div className="preco-cards">

                <article className="preco2-card">

                    <h3 className="preco2-nome">IA Completa</h3>
                    <p className="preco2-apoio">Um plano só, tudo liberado e sem limites desde o primeiro dia.</p>

                    <div className="preco2-preco">
                        <p className="preco2-kicker">Plano anual · 12x de</p>
                        <p className="preco2-valor">
                            <span className="preco2-moeda" aria-hidden="true">R$</span><span className="preco2-numero" aria-hidden="true">29,90</span><span className="preco2-periodo" aria-hidden="true">/mês</span><span className="preco-leitor">R$ 29,90 por mês no plano anual</span>
                        </p>
                    </div>

                    <ul className="preco2-lista">
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Todos os assessores no seu WhatsApp</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Contas de banco sem limite no Open Finance</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Sem limites de registros de gastos ou consultas</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Notas fiscais sem limite, direto no WhatsApp</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Lembretes, tarefas e arquivos sem limite</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Google Agenda conectado + painel completo</li>
                        <li><svg className="preco2-icone" aria-hidden="true"><use href="#preco-tique"/></svg>Links de cobrança e +140 funcionalidades</li>
                    </ul>

                    <a className="preco2-btn" href="/checkout">Assinar Agora</a>

                    <ul className="preco2-selos">
                        <li><strong>7 dias para testar.</strong> Não gostou, devolvemos tudo.</li>
                    </ul>

                </article>

            </div>
        </div>
    </section></>
  );
};

export default PricingSection;
