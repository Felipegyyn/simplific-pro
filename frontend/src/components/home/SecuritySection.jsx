import React from 'react';

const SecuritySection = () => {
  return (
    <><section className="conf-faixa" aria-label="Segurança e regulação">

        <svg className="conf-defs" aria-hidden="true" focusable="false">
            {/* O laço da Meta: geometria oficial da marca, em uma cor só. O
                 viewBox recorta a altura real do desenho (y de 3,9 a 20,1) para
                 o laço nascer do mesmo tamanho ótico das outras marcas. */}
            <symbol id="conf-m-meta" viewBox="0 3.9 24 16.2"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></symbol>
            {/* Banco Central: NÃO é o brasão oficial, e de propósito. Um brasão
                 refeito de memória sai amador; aqui vai um edifício de colunas
                 em traço fino, que é o sinal institucional sem falsificar marca. */}
            <symbol id="conf-m-bacen" viewBox="0 0 24 24"><path d="M1.6 9.6 12 3.2l10.4 6.4Z"/><path d="M5.9 10.6v9.1M9.95 10.6v9.1M14.05 10.6v9.1M18.1 10.6v9.1"/><path d="M2.6 20.5h18.8"/></symbol>
            {/* Glifo oficial do WhatsApp, o mesmo path do rodapé: desenhado em
                 massa, não em traço, daí o modificador .is-cheio no <use>. */}
            <symbol id="conf-m-whatsapp" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></symbol>
            <symbol id="conf-m-olho" viewBox="0 0 24 24"><path d="M1.6 12C5 7.4 8.4 5.1 12 5.1s7 2.3 10.4 6.9c-3.4 4.6-6.8 6.9-10.4 6.9S5 16.6 1.6 12Z"/><circle cx="12" cy="12" r="3.05"/></symbol>
            {/* O CARIMBO da LGPD: caixa arredondada com a sigla dentro, único
                 desenho da fita que é letra e não figura. Tinha um irmão — o
                 carimbo "114", mesma caixa e mesmo peso — que saiu na 6a
                 rodada; ficou o molde, caso outro carimbo volte um dia. O fill
                 e o stroke do <text> vão em ATRIBUTO e não na folha de estilo,
                 porque CSS de documento não atravessa o conteúdo clonado pelo
                 <use> — só a herança passa. */}
            <symbol id="conf-m-lgpd" viewBox="0 0 24 24"><rect x="1.3" y="5.4" width="21.4" height="13.2" rx="3.4"/><text x="12.15" y="14.1" text-anchor="middle" fill="currentColor" stroke="none" font-family="Poppins, sans-serif" font-size="5.9" font-weight="600" letter-spacing="0.3">LGPD</text></symbol>
        </svg>

        <div className="conf-trilho">
            <div className="conf-fita">

            <ul className="conf-fila">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            <ul className="conf-fila" aria-hidden="true">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            <ul className="conf-fila" aria-hidden="true">
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-meta"/></svg><span className="conf-lockup"><span className="conf-alega">Plataforma homologada pela Meta</span><span className="conf-apoio">WhatsApp Business API oficial</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-bacen"/></svg><span className="conf-lockup"><span className="conf-alega">Regulado pelo Banco Central</span><span className="conf-apoio">Open Finance Brasil</span></span></li>
                <li className="conf-selo"><svg className="conf-marca is-cheio" aria-hidden="true" focusable="false"><use href="#conf-m-whatsapp"/></svg><span className="conf-lockup"><span className="conf-alega">Conta verificada no WhatsApp</span><span className="conf-apoio">Selo oficial da Meta</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-olho"/></svg><span className="conf-lockup"><span className="conf-alega">Acesso somente leitura</span><span className="conf-apoio">Ninguém movimenta seu dinheiro</span></span></li>
                <li className="conf-selo"><svg className="conf-marca" aria-hidden="true" focusable="false"><use href="#conf-m-lgpd"/></svg><span className="conf-lockup"><span className="conf-alega">Dados protegidos pela LGPD</span><span className="conf-apoio">Criptografia de ponta a ponta</span></span></li>
            </ul>

            </div>
        </div>
    </section></>
  );
};

export default SecuritySection;
