import React from 'react';
import { Link } from 'react-router-dom';

const PromiseSection = () => {
  return (
    <section className="promise-section" id="promiseSection">
      <div className="promise-container">

        <div className="promise-text">
          <h2 className="promise-headline">
            Vive esquecendo onde foi parar o dinheiro ou qual é o próximo compromisso?
            <span className="hl-so-desktop"> Mande uma mensagem ou áudio e deixe tudo organizado.</span>
          </h2>
          <p className="promise-description">
            Basta enviar uma simples mensagem de texto ou áudio no WhatsApp. O Simplific Pro categoriza gastos, calcula faturas de cartões, monitora seus ativos da B3 e sincroniza sua agenda.
          </p>

          <Link to="/planos" className="hero-btn promise-btn">
            <span>Começar minha organização &rarr;</span>
          </Link>
        </div>

        <div className="promise-stage" aria-hidden="true">
          <div className="flow" id="promiseFlow" data-ato="1">
            <div className="flow-drift">

              <div className="reg-phone">
                <div className="reg-screen">

                  <div className="reg-tags" data-ato="1">
                    <span className="is-on">Alimentação</span>
                    <span>Crédito</span>
                    <span>Organizado</span>
                  </div>

                  <div className="reg-chart" data-ato="1">
                    <span className="reg-chart-top">Alimentação · este mês</span>
                    <ul className="reg-rows">
                      <li><em>jul</em><span className="reg-track"><i style={{ '--w': '87%' }}></i></span><b>R$ 1.079</b></li>
                      <li className="is-now"><em>ago</em><span className="reg-track"><i style={{ '--w': '100%' }}></i></span><b>R$ 1.240</b></li>
                    </ul>
                  </div>

                  <div className="reg-insight" data-ato="1">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z" />
                      <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z" />
                    </svg>
                    <p><b>Simplific Pro</b> · alimentação está <b>15% acima</b> de julho. No ritmo atual, seu mês fecha dentro do limite previsto.</p>
                  </div>

                  <div className="reg-tags" data-ato="2">
                    <span className="is-on">Google Meet</span>
                    <span>Investimentos</span>
                    <span>45 min</span>
                  </div>

                  <div className="reg-done" data-ato="2">
                    <span className="reg-chart-top">Já está agendado</span>
                    <ul className="reg-steps">
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Reunião no Google Agenda · 15:00 às 15:45</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Sala do Google Meet gerada automaticamente</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Lembrete no WhatsApp 15 min antes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="reg-insight" data-ato="2">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z" />
                      <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z" />
                    </svg>
                    <p><b>Pierre</b> · seu compromisso foi adicionado à sua agenda com link de videoconferência pronto para compartilhar.</p>
                  </div>

                  <div className="reg-tags" data-ato="3">
                    <span className="is-on">Fatura Cartão</span>
                    <span>Nubank</span>
                    <span>Vencimento</span>
                  </div>

                  <div className="reg-done" data-ato="3">
                    <span className="reg-chart-top">Controle de Cartão</span>
                    <ul className="reg-steps">
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Melhor dia de compra calculado</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Fatura atual: R$ 1.840,00</span>
                      </li>
                      <li>
                        <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7.3 5.8 10.1 11 4.4" /></svg>
                        <span>Aviso 3 dias antes do fechamento</span>
                      </li>
                    </ul>
                  </div>

                  <div className="reg-insight" data-ato="3">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5c-1 4-3 6-7 7 4 1 6 3 7 7 1-4 3-6 7-7-4-1-6-3-7-7Z" />
                      <path d="M17 14.5c-.4 2-1.5 3-3.5 3.5 2 .5 3 1.5 3.5 3.5.5-2 1.5-3 3.5-3.5-2-.5-3-1.5-3.5-3.5Z" />
                    </svg>
                    <p><b>Pierre</b> · fatura sob controle! Você tem <b>64% de limite disponível</b> para o próximo ciclo.</p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PromiseSection;
