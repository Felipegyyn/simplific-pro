import re

def update_links():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update header-nav
    old_header = """<nav className="header-nav">
            <a href="/assessores">Conheça os assessores</a>
            <a href="/como-usar">O que pedir</a>
            <a href="/funcionalidades">Funcionalidades</a>
            <a href="/sobre">Sobre nós</a>
            <a href="/seguranca">Segurança</a>
        </nav>"""
    new_header = """<nav className="header-nav">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>
        </nav>"""
    content = content.replace(old_header, new_header)

    # 2. Update menu-movel
    old_mobile = """<nav className="menu-movel" id="menu-do-celular" aria-label="Menu do site">
            <a href="/assessores">Conheça os assessores</a>
            <a href="/como-usar">O que pedir</a>
            <a href="/funcionalidades">Funcionalidades</a>
            <a href="/sobre">Sobre nós</a>
            <a href="/seguranca">Segurança</a>"""
    new_mobile = """<nav className="menu-movel" id="menu-do-celular" aria-label="Menu do site">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>"""
    content = content.replace(old_mobile, new_mobile)

    # 3. Update footer escritorio
    old_footer_esc = """<nav className="footer-col footer-links" aria-labelledby="footerColEscritorio">
                    <h3 className="footer-col-title" id="footerColEscritorio">Escritório</h3>
                    <a href="/assessores">Conheça os assessores</a>
                    <a href="/sobre">Sobre nós</a>
                    <a href="/seguranca">Segurança</a>
                    <a href="https://ajuda.meuassessor.com/pt-BR/">Central de ajuda</a>
                </nav>"""
    
    # Replacing exact matches can sometimes fail due to spaces/newlines or encoding issues like Escritrio. Let's use regex instead.
    
    content = re.sub(
        r'<nav className="footer-col footer-links" aria-labelledby="footerColEscritorio">.*?<h3 className="footer-col-title" id="footerColEscritorio">.*?</h3>.*?</nav>',
        """<nav className="footer-col footer-links" aria-labelledby="footerColEscritorio">
                    <h3 className="footer-col-title" id="footerColEscritorio">Simplific Pro</h3>
                    <a href="/beneficios">Benefícios</a>
                    <a href="/inteligencia">Inteligência</a>
                    <a href="/seguranca">Segurança</a>
                    <a href="/contato">Contato</a>
                </nav>""",
        content, flags=re.DOTALL
    )
    
    # 4. Update privacy links
    content = re.sub(
        r'<nav className="footer-terms">.*?<a href="/pages/politica-de-privacidade">.*?</a>.*?<a href="/pages/termos-de-uso">.*?</a>.*?</nav>',
        """<nav className="footer-terms">
                    <a href="/privacidade">Política de privacidade</a>
                    <a href="/termos">Termos de uso</a>
                </nav>""",
        content, flags=re.DOTALL
    )

    # Replace specific emails
    content = content.replace('contato@meuassessor.com', 'contato@simplific.pro')

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Links updated")

if __name__ == "__main__":
    update_links()
