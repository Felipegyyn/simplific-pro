import os
import glob

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")

replacements = {
    "Cada assessor é especialista em uma área, mas todos trabalham juntos. Você envia uma mensagem pelo WhatsApp e a equipe transforma o pedido em algo resolvido.": "O Simplific integra dezenas de funcionalidades numa única IA. Você envia uma mensagem pelo WhatsApp e ela processa dados financeiros complexos em algo simples e resolvido na hora.",
    "A conta é sua, e cabe a sua família e a sua equipe.": "A conta é sua. Centralize sua vida financeira num só lugar.",
    "Não existe limite de participantes nem cobrança por pessoa: a assinatura é uma só para o sócio, a família ou a equipe inteira.": "Faça o acompanhamento integral do seu patrimônio: carteiras, limites, faturas e orçamentos, de forma unificada e simples pelo WhatsApp.",
    "três batidas: o pedido, a equipe": "três batidas: o pedido, a IA",
    "SUA EQUIPE DE ACESSO": "SEU ACESSO DIRETO",
    "is-equipe": "is-ia"
}

files = glob.glob('frontend/src/components/home/*.jsx')
for f in files:
    replace_in_file(f, replacements)

print("Copy refactoring 2 complete.")
