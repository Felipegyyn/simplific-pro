# src/services/visual_report_service.py

from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, case
from src.models.db import db
import io
import base64
from src.models.user import User
from src.models.financial import Transaction, Category
from src.utils.formatters import format_currency_brl
import google.generativeai as genai
from src.services.image_service import cloudinary # Importamos o objeto já configurado

# Inicializa o modelo de geração de imagem
image_model = genai.GenerativeModel('gemini-2.5-flash-image-preview')

def _collect_financial_data(user_id, target_date):
    """
    Coleta e sumariza os dados financeiros de um usuário para um mês específico.
    Esta é a base para a criação do nosso prompt de imagem.
    """
    start_of_month = target_date.replace(day=1)
    end_of_month = (start_of_month + relativedelta(months=1)) - relativedelta(days=1)

    # 1. Busca os totais de Receitas e Despesas com uma única query eficiente
    totals = db.session.query(
        func.sum(case((Transaction.type == 'entrada', Transaction.value), else_=0)).label('total_revenue'),
        func.sum(case((Transaction.type == 'saida', Transaction.value), else_=0)).label('total_expense')
    ).filter(
        Transaction.user_id == user_id,
        Transaction.date.between(start_of_month, end_of_month),
        Transaction.status == 'confirmada'
    ).one()

    total_receitas = totals.total_revenue or 0
    total_despesas = totals.total_expense or 0

    # 2. Calcula a taxa de poupança
    taxa_poupanca = ((total_receitas - total_despesas) / total_receitas) * 100 if total_receitas > 0 else 0

    # 3. Busca as 3 categorias com os maiores gastos
    top_expenses = db.session.query(
        Category.name,
        func.sum(Transaction.value).label('total')
    ).join(Category, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.date.between(start_of_month, end_of_month),
        Transaction.type == 'saida',
        Transaction.status == 'confirmada'
    ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).limit(3).all()

    # 4. Monta um dicionário limpo e organizado com todos os dados
    financial_data = {
        'mes_ano': start_of_month.strftime("%B de %Y").capitalize(),
        'total_receitas': total_receitas,
        'total_despesas': total_despesas,
        'saldo_liquido': total_receitas - total_despesas,
        'taxa_poupanca': taxa_poupanca,
        'top_3_despesas': [{'categoria': cat, 'valor': val} for cat, val in top_expenses]
    }

    return financial_data

# (As próximas funções, como a que gera o prompt e a imagem, virão aqui nas próximas etapas)

# ▼▼▼ COLE A NOVA FUNÇÃO ABAIXO NO FINAL DO ARQUIVO ▼▼▼

def _create_image_generation_prompt(financial_data, user_name):
    """
    Pega os dados financeiros sumarizados e os transforma em um prompt de texto
    detalhado para o modelo de geração de imagem.
    """
    # Formata os dados numéricos para serem incluídos no texto
    receitas_str = format_currency_brl(financial_data['total_receitas'])
    despesas_str = format_currency_brl(financial_data['total_despesas'])
    saldo_str = format_currency_brl(financial_data['saldo_liquido'])
    poupanca_str = f"{financial_data['taxa_poupanca']:.0f}%"

    # Cria a parte do prompt que descreve o gráfico de pizza
    top_despesas_prompt = "um gráfico de pizza moderno mostrando as 3 maiores despesas:"
    for despesa in financial_data['top_3_despesas']:
        categoria = despesa['categoria']
        valor_str = format_currency_brl(despesa['valor'])
        top_despesas_prompt += f" fatia para '{categoria}' com o valor '{valor_str}',"

    # O prompt principal. É uma descrição detalhada da imagem que queremos.
    prompt = f"""
    Crie um infográfico de finanças pessoais elegante e moderno para {user_name}, com o título 'Resumo Financeiro de {financial_data['mes_ano']}'.
    O estilo deve ser limpo, minimalista, com um fundo azul escuro (#1E293B), texto principal em branco e destaques em verde esmeralda (#10B981) e amarelo âmbar (#F59E0B). Use uma fonte sans-serif moderna e legível.

    O layout deve ser organizado em seções claras:

    1. No topo, três cartões lado a lado:
       - Cartão 1 (verde esmeralda): título 'Receitas Totais', valor em destaque '{receitas_str}'.
       - Cartão 2 (vermelho suave): título 'Despesas Totais', valor em destaque '{despesas_str}'.
       - Cartão 3 (amarelo âmbar): título 'Saldo do Mês', valor em destaque '{saldo_str}'.

    2. Na seção do meio, à esquerda:
       - {top_despesas_prompt}. Use cores vibrantes e contrastantes para as fatias.

    3. Na seção do meio, à direita:
       - Um ícone grande de um cofrinho estilizado. Ao lado, o texto 'Taxa de Poupança' e o valor '{poupanca_str}' em destaque.

    4. No rodapé, o logo 'Simplific Pro' de forma sutil.
    """

    return prompt

# ▲▲▲ FIM DO BLOCO ▲▲▲

# ▼▼▼ COLE A FUNÇÃO PRINCIPAL ABAIXO NO FINAL DO ARQUIVO ▼▼▼

def generate_visual_report(user_id, target_date=None):
    """
    Orquestra todo o processo de geração de um relatório visual:
    1. Coleta os dados.
    2. Cria o prompt de texto.
    3. Chama a IA para gerar a imagem.
    4. Salva a imagem no Cloudinary.
    5. Retorna a URL final da imagem.
    """
    if target_date is None:
        target_date = date.today()

    user = User.query.get(user_id)
    if not user:
        return None, "Utilizador não encontrado."

    try:
        # 1. Coleta os dados financeiros
        print(f"--- [Relatório Visual] Coletando dados para o utilizador {user.email}...")
        financial_data = _collect_financial_data(user_id, target_date)

        # 2. Cria o prompt para a IA
        print("--- [Relatório Visual] Criando prompt de geração de imagem...")
        prompt = _create_image_generation_prompt(financial_data, user.name)

        # 3. Chama a API do Gemini para gerar a imagem
        print("--- [Relatório Visual] Solicitando imagem à API do Gemini (nano-banana)...")
        response = image_model.generate_content(prompt)

        # --- DEBUG: Imprime a estrutura da resposta para análise ---
        print(f"--- [DEBUG] Estrutura da resposta do Gemini: {response.candidates[0].content}")
        # --- FIM DO DEBUG ---

        # 4. Extrai os bytes brutos da imagem da resposta da IA
        try:
            image_bytes = response.candidates[0].content.parts[0].inline_data.data
        except (IndexError, AttributeError) as e:
            print(f"ERRO: Não foi possível extrair os dados da imagem da resposta do Gemini. Erro: {e}")
            return None, "A IA não retornou uma imagem válida."

        # 5. Cria um "arquivo virtual" em memória a partir dos bytes da imagem
        image_file = io.BytesIO(image_bytes)

        # 6. Faz o upload do ARQUIVO VIRTUAL para o Cloudinary
        print("--- [Relatório Visual] Enviando imagem gerada para o Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            image_file, # <-- A MUDANÇA CRÍTICA: passamos o objeto que se comporta como um arquivo
            public_id=f"simplific-pro/visual-reports/{user_id}/resumo_{target_date.strftime('%Y_%m')}",
            overwrite=True,
            resource_type="image"
        )

        image_url = upload_result.get('secure_url')
        print(f"--- [Relatório Visual] Sucesso! URL da imagem: {image_url}")

        # 7. Retorna a URL da imagem guardada na nuvem
        return image_url, None


    except Exception as e:
        print(f"ERRO CRÍTICO durante a geração do relatório visual: {e}")
        return None, "Ocorreu um erro ao gerar o seu relatório visual. Tente novamente."

# ▲▲▲ FIM DO BLOCO ▲▲▲