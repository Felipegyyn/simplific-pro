import React from 'react';
import logo from '../../assets/LOGO.png';

const Footer = () => {
  return (
    <><footer className="site-footer is-branco" data-header="claro">
        <div className="footer-inner">
            <div className="footer-top">

                <div className="footer-brand">
                    <a href="/" className="footer-logo-link">
                        
                        <img src={logo} alt="Simplific Pro" className="footer-logo" />
                    </a>
                    <p className="footer-about">Um escritório de assessores de inteligência artificial dentro do seu WhatsApp. Dinheiro, agenda, tarefas e documentos entram organizados, numa conversa só.</p>
                    <div className="footer-social">
                        <a href="https://www.instagram.com/meuassessor.ia/" target="_blank" rel="noopener" aria-label="Instagram do Simplific Pro">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2"/>
                                <circle cx="12" cy="12" r="4.1"/>
                                <circle cx="17.1" cy="6.9" r="1.15" className="is-solid"/>
                            </svg>
                        </a>
                        <a href="https://web.facebook.com/p/Meu-Assessor-61574060255535" target="_blank" rel="noopener" aria-label="Facebook do Simplific Pro">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M13.6 21v-8.2h2.7l.4-3.1h-3.1V7.6c0-.9.25-1.5 1.55-1.5h1.65V3.3c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.16V9.7H7.6v3.1h2.7V21Z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <nav className="footer-col footer-links" aria-labelledby="footerColEscritorio">
                    <h3 className="footer-col-title" id="footerColEscritorio">Simplific Pro</h3>
                    <a href="/beneficios">Benefícios</a>
                    <a href="/inteligencia">Inteligência</a>
                    <a href="/seguranca">Segurança</a>
                    <a href="/contato">Contato</a>
                </nav>

                <nav className="footer-col footer-links" aria-labelledby="footerColConta">
                    <h3 className="footer-col-title" id="footerColConta">Conta</h3>
                    <a href="/login">Login</a>
                    
                    <a href="#planos">Começar agora</a>
                </nav>

                <div className="footer-col footer-support" aria-labelledby="footerColSuporte">
                    <h3 className="footer-col-title" id="footerColSuporte">Suporte humano</h3>
                    
                    <a href="mailto:contato@simplific.pro" className="footer-mail">contato@simplific.pro</a>
                    <p className="footer-support-text">Plano, cobrança e acesso à conta são com o nosso time, não com os assessores.</p>
                    <a href="https://wa.me/5547992921005" target="_blank" rel="noopener" className="footer-wa">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
                        <span>Falar com o suporte</span>
                    </a>
                </div>

            </div>

            <div className="footer-bottom">
                <p className="footer-legal">© 2026 Simplific Pro LTDA. Empresa do grupo Tittanium. Todos os direitos reservados.</p>
                <nav className="footer-terms">
                    <a href="/privacidade">Política de privacidade</a>
                    <a href="/termos">Termos de uso</a>
                </nav>
            </div>
        </div>
    </footer></>
  );
};

export default Footer;
