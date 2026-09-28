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
    # Buttons
    "Contratar minha equipe": "Falar com o Simplific",
    "Contratar equipe": "Assinar Agora",
    "Conhecer a equipe de assessores": "Conhecer a Inteligência Artificial",
    
    # HeroSection
    "+ 250 mil usuários aprovam": "Sua Vida Financeira Organizada",
    "Sua vida organizada começa numa conversa.": "Mais que um App, um Assessor Inteligente no WhatsApp.",
    "Uma equipe de assessores no seu WhatsApp cuida do seu dinheiro, da sua agenda e das suas notas. Você só manda mensagem.": "A Inteligência Artificial do Simplific cuida das suas despesas, limites, investimentos e agenda. Você manda um áudio ou texto, e ela organiza.",
    "Assessores no seu WhatsApp cuidam do dinheiro, da agenda e das notas. Você só manda mensagem.": "Uma IA no WhatsApp cuida do seu dinheiro e agenda. Você só manda mensagem.",

    # PromiseSection
    "Vive esquecendo onde foi parar o dinheiro ou qual é o próximo compromisso?<span className=\"hl-so-desktop\"> Mande uma mensagem ou áudio e deixe tudo organizado.</span>": "Quer saber o saldo real, limite do cartão ou o preço de uma ação na B3?<span className=\"hl-so-desktop\"> Mande uma mensagem e tenha a resposta na hora.</span>",
    "Basta enviar uma simples mensagem por texto ou áudio no WhatsApp. A equipe registra tudo, organiza, e não deixa você esquecer de nada.": "Basta enviar um áudio ou texto. A IA registra receitas, despesas, consultas de ações (B3) e atualiza seu orçamento em tempo real.",

    # ShowcaseSection
    "Fale com seus assessores do mesmo jeito que fala com qualquer pessoa. Peça com as palavras que vierem à cabeça. Sua equipe entende o que você precisa.": "Fale com a IA do mesmo jeito que fala com um amigo. Peça com as palavras que vierem à cabeça, por texto ou áudio. Ela entende o que você precisa.",

    # PricingSection
    "Uma equipe de assessores trabalhando 24 horas por dia, por menos de R$ 1 por dia. E sem limite de uso em nada.": "Um Assessor Financeiro Inteligente trabalhando 24 horas por dia para você. Sem burocracia e totalmente no WhatsApp.",
    "Equipe completa": "IA Completa",
    "Usuários sem limite: família, sócios e equipe": "Sem limites de registros de gastos ou consultas",

    # FAQSection
    "Posso usar com minha esposa, meu sócio ou minha equipe?": "Posso usar para finanças pessoais e também consultar investimentos?",
    "Sim, a conta é compartilhada. Você adiciona a sua esposa, os seus sócios ou a sua equipe, cada um fala com o Simplific Pro do próprio WhatsApp, e o que qualquer um pedir entra na mesma conta organizada.": "Sim! O Simplific não só anota gastos, mas consulta saldos, limites, preços de ativos da Bolsa (B3), e simula investimentos na mesma interface via WhatsApp.",

    # DaySection
    "Cinco momentos de um dia comum, e o que a sua equipe resolve em cada um deles pelo WhatsApp.": "Cinco momentos de um dia comum, e o que a IA do Simplific resolve para você pelo WhatsApp.",
    "Sua equipe reúne as atividades realizadas em um resumo enviado pelo WhatsApp. A Sofi também envia os compromissos, as prioridades e os prazos da agenda a cada manhã.": "A Inteligência Artificial reúne as movimentações do dia e te dá um panorama claro das suas finanças e metas financeiras.",
    "Sua equipe fechou o dia": "Resumo Financeiro Gerado",

    # ClientsSection
    "Quem precisa falar com você fala com a sua equipe. Os assessores entram em contato, marcam o horário, nunca se atrasam e nunca esquecem.": "Seu parceiro financeiro 24/7. Consulte limites de cartão, metas financeiras, e gerencie orçamentos num piscar de olhos.",

    # AmbassadorsSection
    "Gente que você conhece já tem uma equipe.": "Simplific Pro: O braço direito do seu dinheiro.",

    # ExpedientSection / EnterpriseSection / etc - Generic Team mentions
    "a equipe manteve o registro vivo": "a IA manteve o registro vivo",
    "Sua equipe de acesso": "Seu controle financeiro",
    "Só você por enquanto. Gere um convite para trazer alguém da família ou da equipe.": "Centralize seu controle financeiro com segurança total.",
    "Adicione seu sócio, sua família ou a equipe inteira na mesma conta.": "Acompanhe seus investimentos e finanças em uma mesma conta.",
    "três batidas: o pedido, a equipe": "três batidas: o pedido, a IA"
}

files = glob.glob('frontend/src/components/home/*.jsx')
for f in files:
    replace_in_file(f, replacements)

print("Copy refactoring complete.")
