import re

with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a setInterval to redimensiona for the first 2 seconds to handle dynamic CSS/font loading
patch = """
        conversa.style.setProperty('--conversa-escala', escala.toFixed(5));
        conversa.style.setProperty('--conversa-desvio', desvio.toFixed(1) + 'px');
"""

new_patch = """
        conversa.style.setProperty('--conversa-escala', escala.toFixed(5));
        conversa.style.setProperty('--conversa-desvio', desvio.toFixed(1) + 'px');
        
        // Simplific patch: retry dimensioning in case CSS/images loaded late
        if (!window.__redim_interval) {
            window.__redim_interval = setInterval(() => {
                if (window.innerWidth !== quadro.width || document.getElementById('global-celular-bg').getBoundingClientRect().width !== aparelho.getBoundingClientRect().width) {
                    redimensiona();
                }
            }, 200);
            setTimeout(() => clearInterval(window.__redim_interval), 2000);
        }
"""

content = content.replace(patch, new_patch)

# Also force revelar() aggressively
patch2 = """        if (espera > 0) {
            setTimeout(revelar, espera);
        } else if (celularBg.complete && celularBg.naturalHeight) {
            revelar();
        } else {
            celularBg.addEventListener('load', revelar, { once: true });
        }"""

new_patch2 = """        if (espera > 0) {
            setTimeout(revelar, espera);
        } else {
            revelar(); // Simplific patch: force reveal
            celularBg.addEventListener('load', revelar, { once: true });
        }"""

content = content.replace(patch2, new_patch2)

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched meuassessor_script.js for mobile resize and reveal.")
