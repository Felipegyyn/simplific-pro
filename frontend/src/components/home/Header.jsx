import React from 'react';\nimport logo from '../../assets/LOGO.png';\n\nconst Header = () => {\n  return (\n    <><header className="glass-header">
        
        <a href="/" className="logo-link logo-troca">
            <img src={logo} alt="Simplific Pro Logo" className="header-logo logo-no-escuro" />
            <img src={logo} alt="" aria-hidden="true" className="header-logo logo-no-claro" />
        </a>
        <nav className="header-nav">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>
        </nav>
        
        <a href="/checkout" className="header-cta">Começar agora &rarr;</a>

        <button className="header-menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu-do-celular">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <nav className="menu-movel" id="menu-do-celular" aria-label="Menu do site">
            <a href="/beneficios">Benefícios</a>
            <a href="/inteligencia">Inteligência</a>
            <a href="/planos">Planos</a>
            <a href="/seguranca">Segurança</a>
            <a href="/contato">Contato</a>
            
            <a href="/checkout" className="mm-acao">Começar agora &rarr;</a>
            <a href="/login" className="mm-login">Fazer login</a>
        </nav>
    </header></>\n  );\n};\n\nexport default Header;\n