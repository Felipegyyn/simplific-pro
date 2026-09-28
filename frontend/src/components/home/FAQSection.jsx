import React from 'react';\n\nconst FAQSection = () => {\n  return (\n    <><section className="faq-section" id="perguntas" data-header="claro">

        <svg className="faq-defs" aria-hidden="true" focusable="false">
            <symbol id="faq-seta" viewBox="0 0 16 16">
                <path d="M3 6 8 11 13 6"/>
            </symbol>
        </svg>

        <div className="faq-grade">

            <header className="faq-topo">
                <h2 className="faq-headline">Perguntas frequentes.</h2>
                <p className="faq-sub">Não achou a sua? O suporte humano <a className="faq-link" href="https://wa.me/5547992921005" target="_blank" rel="noopener">responde no WhatsApp</a>.</p>
            </header>

            <div className="faq-colunas">

                <div className="faq-coluna">

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Os clientes gostam do Simplific Pro?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Numa pesquisa respondida por 50 mil clientes dentro do WhatsApp, 98% disseram que estão satisfeitos e usam o produto. É a nossa medida mais honesta: quem responde é quem já convive com os assessores todo dia. Se não for para você, a garantia de 7 dias devolve o valor integral, sem fidelidade e sem multa.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq" open>
                        <summary className="faq-pergunta">
                            <span>O que acontece depois que eu assino?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sua conversa com o Simplific Pro é criada no WhatsApp no mesmo dia, com os seus assessores dentro, e eles se apresentam. Dali em diante é só conversar. Conectar o banco e o Google Agenda é opcional e você faz quando quiser, ali mesmo. Não tem instalação, reunião de implantação nem manual para ler.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso instalar algum aplicativo?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Funciona no WhatsApp que você já usa, e a conversa com os seus assessores nasce no primeiro dia. Se você quiser ver tudo organizado em tela grande, existe um painel no navegador, mas ele é opção e não obrigação.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Como eu peço as coisas?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Você manda uma mensagem na conversa, como mandaria para qualquer pessoa. Pode ser texto, áudio ou foto: um 'gastei 62 na farmácia', um áudio pedindo para marcar o dentista, a foto da nota fiscal do almoço. Não existe comando nem formato certo. O assessor do assunto entende o pedido, executa e responde com o próprio nome.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Os assessores falam com outras pessoas por mim?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Falam, quando você pede. Cobrar um cliente todo dia 10, lembrar seu irmão de um aniversário, convidar os participantes de uma reunião e avisar todo mundo antes da hora. Você diz o que precisa e o assessor cuida da conversa.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso conectar meu banco para usar?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Dá para registrar tudo por mensagem, áudio e foto, e o Martin organiza do mesmo jeito. A conexão pelo Open Finance do Banco Central é um passo opcional que automatiza a entrada dos gastos, funciona com 114 bancos e instituições e é somente leitura: ninguém além de você movimenta a sua conta.</p>
                        </div>
                    </details>

                </div>

                <div className="faq-coluna">

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Meus dados estão seguros?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, e vale saber o que isso quer dizer na prática. Seus dados são criptografados no caminho e onde ficam guardados, o tratamento segue a LGPD, e nada é vendido, alugado ou entregue para anunciante nenhum. Está tudo detalhado na <a className="faq-link" href="/seguranca">página de segurança</a> e na <a className="faq-link" href="/pages/politica-de-privacidade">política de privacidade</a>.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Eu fico no controle do que os assessores fazem?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Fica. Pedido importante volta para você confirmar antes de virar ação, e todo registro gera um recibo na conversa para você conferir. Se algo sair errado, corrigir é responder dizendo o certo, e o assessor ajusta na hora. Para o que a inteligência artificial não resolver, o suporte tem gente de verdade.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Posso usar com minha esposa, meu sócio ou minha equipe?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, a conta é compartilhada. Você adiciona a sua esposa, os seus sócios ou a sua equipe, cada um fala com o Simplific Pro do próprio WhatsApp, e o que qualquer um pedir entra na mesma conta organizada.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>É pra mim se eu não tenho empresa?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>É. Dá pra usar só pra vida pessoal: os gastos da casa, o dentista de quinta, o boleto do IPTU, os documentos da família. Empresa só faz falta na hora de emitir nota fiscal; todo o resto funciona igual.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Serve pra uso pessoal e pro meu negócio ao mesmo tempo?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Serve. A vida e o trabalho ficam na mesma conversa: o Martin separa o gasto da farmácia do gasto da empresa nas categorias, e no painel cada um aparece no seu lugar.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Preciso de CNPJ pra emitir nota fiscal?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Para emitir nota fiscal de serviço, sim: a nota sai no nome de uma empresa. A Rita cuida do cadastro da empresa e da emissão, tudo pelo WhatsApp.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Tem limite de mensagens ou de pedidos?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Não. Tudo é ilimitado desde o primeiro dia: mensagens, lembretes, cobranças, notas fiscais, documentos e projetos. Não existe pacote de créditos nem cobrança extra por uso.</p>
                        </div>
                    </details>

                    <details className="faq-item" name="faq">
                        <summary className="faq-pergunta">
                            <span>Posso cancelar quando quiser?</span>
                            <span className="faq-circulo" aria-hidden="true"><svg className="faq-seta"><use href="#faq-seta"/></svg></span>
                        </summary>
                        <div className="faq-corpo">
                            <p>Sim, e você mesmo cancela, em poucos passos no painel ou pedindo ao assessor no WhatsApp. Ninguém vai te segurar numa ligação de retenção. Nos primeiros 7 dias vale a garantia, com devolução integral do que você pagou.</p>
                        </div>
                    </details>

                </div>

            </div>
        </div>
    </section></>\n  );\n};\n\nexport default FAQSection;\n