import React from 'react';
import { Link } from 'react-router-dom';

const ShowcaseSection = () => {
  return (
    <section className="mostra-section" id="mostraSection" data-header="claro">
      <div className="mostra-grade">
        <header className="mostra-topo">
          <h2 className="mostra-headline">
            Se você sabe mandar uma mensagem no WhatsApp, já sabe usar o Simplific Pro.
          </h2>
          <p className="mostra-sub">
            Fale com o Pierre do mesmo jeito que fala com um amigo. Mande texto, áudio ou a foto da conta. A IA entende e organiza tudo.
          </p>
        </header>
      </div>

      <div className="mostra-esteiras">

        {/* Trilho 1 */}
        <div className="mostra-trilho">
          <div className="mostra-fita mostra-f1">
            <div className="mostra-fila">
              <span className="mostra-bolha"><span className="mostra-txt">bom dia! o que eu tenho de compromisso hoje?</span><span className="mostra-meta">07:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">gastei 62 na farmácia agora no débito</span><span className="mostra-meta">09:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">minha fatura do Nubank já fechou?</span><span className="mostra-meta">23:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">cria o link do Google Meet da call de amanhã</span><span className="mostra-meta">17:35<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">quanto tá a PETR4 e meus FIIs hoje?</span><span className="mostra-meta">17:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">adiciona a minha esposa na conta ❤️</span><span className="mostra-meta">20:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">puxa minha semana do Google Agenda</span><span className="mostra-meta">08:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Almoço R$ 141,60 no cartão Itaú.</span><span className="mostra-meta">13:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Quanto foi de mercado este mês?</span><span className="mostra-meta">21:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">reunião de alinhamento toda terça 9h</span><span className="mostra-meta">09:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>

            <div className="mostra-fila" aria-hidden="true">
              <span className="mostra-bolha"><span className="mostra-txt">bom dia! o que eu tenho de compromisso hoje?</span><span className="mostra-meta">07:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">gastei 62 na farmácia agora no débito</span><span className="mostra-meta">09:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">minha fatura do Nubank já fechou?</span><span className="mostra-meta">23:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">cria o link do Google Meet da call de amanhã</span><span className="mostra-meta">17:35<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">quanto tá a PETR4 e meus FIIs hoje?</span><span className="mostra-meta">17:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">adiciona a minha esposa na conta ❤️</span><span className="mostra-meta">20:33<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">puxa minha semana do Google Agenda</span><span className="mostra-meta">08:41<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Almoço R$ 141,60 no cartão Itaú.</span><span className="mostra-meta">13:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Quanto foi de mercado este mês?</span><span className="mostra-meta">21:04<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">reunião de alinhamento toda terça 9h</span><span className="mostra-meta">09:09<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>
          </div>
        </div>

        {/* Trilho 2 */}
        <div className="mostra-trilho">
          <div className="mostra-fita mostra-f2">
            <div className="mostra-fila">
              <span className="mostra-bolha"><span className="mostra-txt">Uber 23,90, débito.</span><span className="mostra-meta">22:51<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Marca meu almoço com a Cláudia sexta.</span><span className="mostra-meta">10:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Me avisa antes de vencer a fatura do cartão.</span><span className="mostra-meta">08:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Quanto rendeu meus investimentos este mês?</span><span className="mostra-meta">10:52<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Marca uma conversa com o médico quinta 14h30.</span><span className="mostra-meta">08:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">vou te mandar a foto da nota do posto de gasolina</span><span className="mostra-meta">15:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">no crédito, quanto já foi este mês?</span><span className="mostra-meta">12:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">me lembra do remédio todo dia às 20h</span><span className="mostra-meta">19:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>

            <div className="mostra-fila" aria-hidden="true">
              <span className="mostra-bolha"><span className="mostra-txt">Uber 23,90, débito.</span><span className="mostra-meta">22:51<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Marca meu almoço com a Cláudia sexta.</span><span className="mostra-meta">10:05<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Me avisa antes de vencer a fatura do cartão.</span><span className="mostra-meta">08:55<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Quanto rendeu meus investimentos este mês?</span><span className="mostra-meta">10:52<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Marca uma conversa com o médico quinta 14h30.</span><span className="mostra-meta">08:47<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">vou te mandar a foto da nota do posto de gasolina</span><span className="mostra-meta">15:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">no crédito, quanto já foi este mês?</span><span className="mostra-meta">12:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">me lembra do remédio todo dia às 20h</span><span className="mostra-meta">19:58<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>
          </div>
        </div>

        {/* Trilho 3 */}
        <div className="mostra-trilho">
          <div className="mostra-fita mostra-f3">
            <div className="mostra-fila">
              <span className="mostra-bolha"><span className="mostra-txt">quanto sobrou para fechar o mês? 😬</span><span className="mostra-meta">21:36<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">poe o dentista no meu Google Agenda</span><span className="mostra-meta">15:02<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Paguei 1.240,00 de aluguel hoje via PIX.</span><span className="mostra-meta">13:31<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Compara meu gasto deste mês com o anterior.</span><span className="mostra-meta">09:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Pierre, me manda o resumo do dia às 7h.</span><span className="mostra-meta">07:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">toda segunda tem 89,90 da academia</span><span className="mostra-meta">07:38<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">a reunião de sexta com o cliente pode virar 15h?</span><span className="mostra-meta">14:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>

            <div className="mostra-fila" aria-hidden="true">
              <span className="mostra-bolha"><span className="mostra-txt">quanto sobrou para fechar o mês? 😬</span><span className="mostra-meta">21:36<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">poe o dentista no meu Google Agenda</span><span className="mostra-meta">15:02<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Paguei 1.240,00 de aluguel hoje via PIX.</span><span className="mostra-meta">13:31<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Compara meu gasto deste mês com o anterior.</span><span className="mostra-meta">09:44<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">Pierre, me manda o resumo do dia às 7h.</span><span className="mostra-meta">07:22<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">toda segunda tem 89,90 da academia</span><span className="mostra-meta">07:38<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
              <span className="mostra-bolha"><span className="mostra-txt">a reunião de sexta com o cliente pode virar 15h?</span><span className="mostra-meta">14:12<svg className="mostra-visto" viewBox="0 0 17 11" aria-hidden="true"><path d="M1.2 6.4 4.1 9.2 9.9 2.1" /><path d="M7.4 9.2 13.2 2.1" /></svg></span></span>
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-center mt-10">
        <Link to="/beneficios" className="hero-btn mostra-btn">
          <span>Veja todos os recursos detalhados &rarr;</span>
        </Link>
      </div>
    </section>
  );
};

export default ShowcaseSection;
