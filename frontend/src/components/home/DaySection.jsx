import React from 'react';

const DaySection = () => {
  return (
    <><section className="dia2-section" id="diaSection">
        <div className="dia2-grade">
            <div className="dia2-texto">
                <header className="dia2-topo">
                    <h2 className="dia2-headline">Um dia normal. Só que alguém cuidou de tudo.</h2>
                    <p className="dia2-sub">Cinco momentos de um dia comum, e o que a IA do Simplific resolve para você pelo WhatsApp.</p>
                </header>
                <ol className="dia2-lista" id="dia2Lista">
                    <li className="dia2-item is-ativo" data-ato="1" aria-current="true">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">07:40</span><span className="dia2-titulo">O aviso da fatura chega antes de você terminar o café.</span></button>
                        <div className="dia2-corpo"><p>Seus assessores acompanham contas, compromissos e documentos. Eles enviam avisos, trazem atualizações e sugerem análises pelo WhatsApp, sem esperar você pedir.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="2" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">09:15</span><span className="dia2-titulo">Um áudio no caminho, e a consulta entra na agenda.</span></button>
                        <div className="dia2-corpo"><p>A Sofi cria compromissos no Google Agenda a partir de mensagens ou áudios enviados pelo WhatsApp, com data, horário e lembrete. A agenda também pode ser consultada pela conversa.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="3" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">12:30</span><span className="dia2-titulo">Pagou o almoço? Já está registrado.</span></button>
                        <div className="dia2-corpo"><p>Com o banco conectado pelo Open Finance, o Martin importa as movimentações e organiza os gastos por categoria. Você também pode registrar despesas por mensagem, áudio ou foto.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="4" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">15:30</span><span className="dia2-titulo">Não encontra um documento? É só mandar uma mensagem.</span></button>
                        <div className="dia2-corpo"><p>A Luna organiza os arquivos enviados pelo WhatsApp em pastas. Você pode buscar um documento descrevendo o que precisa e recebê-lo na própria conversa.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                    <li className="dia2-item" data-ato="5" aria-current="false">
                        <button type="button" className="dia2-botao"><span className="dia2-hora">22:00</span><span className="dia2-titulo">Antes de dormir, o resumo do dia já está pronto.</span></button>
                        <div className="dia2-corpo"><p>A Inteligência Artificial reúne as movimentações do dia e te dá um panorama claro das suas finanças e metas financeiras.</p></div>
                        <i className="dia2-barra" aria-hidden="true"></i>
                    </li>
                </ol>
            </div>
            <div className="dia2-palco">
                <div className="dia2-quadro" id="dia2Quadro" aria-hidden="true">
                    <div className="dia2-cena is-ativa" data-ato="1">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">07:40</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'/meuassessor/images/7-40.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti">
                        <span className="dia-noti-icone is-nubank"><img src="/meuassessor/images/bancos/nubank.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Fatura de cartão</strong>
                        <span className="dia-noti-hora">7:40</span>
                        </span>
                        <span className="dia-noti-sub">Simplific: Sua fatura do Nubank vence hoje!<span className="dia-noti-pergunta">Quer que eu gere o relatório dos gastos?</span></span>
                        </span>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="2">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">09:15</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'/meuassessor/images/9-15.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-zap" aria-hidden="true">
                        <div className="dia-zap-audio">
                        <div className="dia-zap-linha">
                        <span className="dia-zap-play"><svg viewBox="0 0 12 14" focusable="false"><path d="M2.2 1.5 10.6 7 2.2 12.5Z"/></svg></span>
                        <span className="dia-zap-onda"><i style={{'--h': '22%'}}></i><i style={{'--h': '30%'}}></i><i style={{'--h': '40%'}}></i><i style={{'--h': '54%'}}></i><i style={{'--h': '68%'}}></i><i style={{'--h': '82%'}}></i><i style={{'--h': '94%'}}></i><i style={{'--h': '88%'}}></i><i style={{'--h': '74%'}}></i><i style={{'--h': '60%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '26%'}}></i><i style={{'--h': '36%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '66%'}}></i><i style={{'--h': '80%'}}></i><i style={{'--h': '92%'}}></i><i style={{'--h': '100%'}}></i><i style={{'--h': '90%'}}></i><i style={{'--h': '76%'}}></i><i style={{'--h': '62%'}}></i><i style={{'--h': '50%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '28%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '72%'}}></i><i style={{'--h': '86%'}}></i><i style={{'--h': '96%'}}></i><i style={{'--h': '84%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '56%'}}></i><i style={{'--h': '44%'}}></i><i style={{'--h': '32%'}}></i><i style={{'--h': '26%'}}></i><i style={{'--h': '38%'}}></i><i style={{'--h': '52%'}}></i><i style={{'--h': '64%'}}></i><i style={{'--h': '78%'}}></i><i style={{'--h': '70%'}}></i><i style={{'--h': '58%'}}></i><i style={{'--h': '46%'}}></i><i style={{'--h': '34%'}}></i><i style={{'--h': '24%'}}></i></span>
                        <span className="dia-zap-dur">0:08</span>
                        </div>
                        <div className="dia-zap-fio"></div>
                        <p className="dia-zap-tr">Marca o pediatra da Alice na quinta 10 horas.</p>
                        <p className="dia-zap-meta">9:15<svg className="dia-zap-visto" viewBox="0 0 17 11" focusable="false"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></p>
                        </div>
                        <div className="dia-zap-resp">
                        <p className="dia-zap-quem"><span className="dia-zap-nome"><b>Sofi</b> &middot; Secretária executiva</span></p>
                        <p className="dia-zap-txt">Marcado ✅ Já está no seu Google Agenda.</p>
                        <p className="dia-zap-meta">9:15</p>
                        </div>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="3">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">12:30</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'/meuassessor/images/12-30.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti">
                        <span className="dia-noti-icone is-ifood"><img src="/meuassessor/images/bancos/ifood.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Gasto registrado</strong>
                        <span className="dia-noti-hora">12:30</span>
                        </span>
                        <span className="dia-noti-sub">Simplific: Registrei seu almoço no iFood: R$38 em Alimentação.</span>
                        </span>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="4">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">15:30</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'/meuassessor/images/15-30.webp\')'}} aria-hidden="true"></div>
                        <div className="zap4-fio" aria-hidden="true">
                        <div className="zap4-bolha is-voce">
                        <span className="zap4-txt">Preciso do contrato assinado do Rodrigo.</span>
                        <span className="zap4-meta">15:30<svg className="zap4-visto" viewBox="0 0 17 11" focusable="false"><path d="M1.2 6.4 4.1 9.2 9.9 2.1"/><path d="M7.4 9.2 13.2 2.1"/></svg></span>
                        </div>
                        <div className="zap4-bolha is-luna">
                        <span className="zap4-quem"><span className="zap4-nome">Simplific</span><span className="zap4-cargo">Organização &amp; Docs</span></span>
                        <span className="zap4-txt">Achei! 📄 <span className="zap4-arq">contrato-rodrigo.pdf</span> estava na pasta de Contratos<span className="zap4-envio-desktop"> — acabei de te enviar</span>.</span>
                        <span className="zap4-meta">15:30</span>
                        </div>
                        </div>
                        </div>
                    </div>
                    <div className="dia2-cena" data-ato="5">
                        <div className="dia-foto">
                        <span className="dia-agua" aria-hidden="true">22:00</span>
                        <div className="dia-arte" style={{'--dia-arte': 'url(\'/meuassessor/images/22-00.webp\')'}} aria-hidden="true"></div>
                        <div className="dia-noti is-ia">
                        <span className="dia-noti-icone is-ia"><img src="favicon.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" /></span>
                        <span className="dia-noti-corpo">
                        <span className="dia-noti-linha">
                        <strong className="dia-noti-titulo">Resumo Financeiro Gerado</strong>
                        <span className="dia-noti-hora">22:00</span>
                        </span>
                        <span className="dia-noti-sub">1 fatura avisada, 1 consulta marcada, 1 gasto registrado e 1 documento encontrado.</span>
                        </span>
                        </div>
                        </div>
                    </div>
                </div>
                <ol className="dia2-trilho" id="dia2Trilho" aria-hidden="true">
                    <li><button type="button" className="dia2-marco is-ativo" data-ato="1">07:40</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="2">09:15</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="3">12:30</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="4">15:30</button></li>
                    <li><button type="button" className="dia2-marco" data-ato="5">22:00</button></li>
                </ol>
                <div className="dia2-legenda" id="dia2Legenda" aria-hidden="true">
                    <div className="dia2-legenda-item is-ativo" data-ato="1"><h3>O aviso da fatura chega antes de você terminar o café.</h3><p>Receba avisos de contas e compromissos sem precisar pedir.</p></div>
                    <div className="dia2-legenda-item" data-ato="2"><h3>Um áudio no caminho, e a consulta entra na agenda.</h3><p>Mande um áudio e a Sofi agenda, com data, horário e lembrete.</p></div>
                    <div className="dia2-legenda-item" data-ato="3"><h3>Pagou o almoço? Já está registrado.</h3><p>O Martin importa os gastos do banco e organiza por categoria.</p></div>
                    <div className="dia2-legenda-item" data-ato="4"><h3>Não encontra um documento? É só mandar uma mensagem.</h3><p>Descreva o arquivo que precisa. A Luna encontra e envia no WhatsApp.</p></div>
                    <div className="dia2-legenda-item" data-ato="5"><h3>Antes de dormir, o resumo do dia já está pronto.</h3><p>Receba o resumo do dia e os próximos compromissos pelo WhatsApp.</p></div>
                </div>
            </div>
            <a className="hero-btn dia2-btn cta-forte" href="#planos"><span>Falar com o Simplific</span></a>
        </div>
    </section></>
  );
};

export default DaySection;
