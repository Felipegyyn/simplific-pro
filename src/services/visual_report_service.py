# src/services/visual_report_service.py

from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, case
from src.models.db import db
import requests
import os
import io
import base64
from src.models.user import User
from src.models.financial import Transaction, Category
from src.utils.formatters import format_currency_brl
import google.generativeai as genai
from src.services.image_service import cloudinary # Importamos o objeto já configurado


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

# ▼▼▼ SUBSTITUA TODA A FUNÇÃO '_create_image_generation_prompt' POR ESTA ▼▼▼

def _create_image_generation_prompt(financial_data, user_name):
    """
    Cria um prompt de texto para o modelo de imagem gerar um TEMPLATE DE FUNDO,
    sem nenhum texto ou número.
    """
    prompt = f"""
    Create a background image for a stylish and modern personal finance infographic.
    The style must be clean, minimalist, with a dark blue background (#1E293B).
    The layout should have clear placeholder areas for text and charts. DO NOT write any text or numbers.

    The layout must contain:
    1.  At the top, a placeholder for a main title.
    2.  Below the title, three card shapes side-by-side: the first one vibrant green, the second one soft red, the third one amber yellow. These cards should be empty placeholders.
    3.  In the middle section, on the left, a large circular area as a placeholder for a pie chart.
    4.  In the middle section, on the right, a placeholder area for an icon and a percentage number.
    5.  A subtle, clean footer area.

    CRITICAL RULE: The image must be a template only. Generate NO text, NO numbers, NO words.
    """
    
    return prompt
# ▲▲▲ FIM DO BLOCO ▲▲▲


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

    # ▼▼▼ SUBSTITUA TODO O BLOCO A PARTIR DA CHAMADA DO GEMINI ▼▼▼

        # 3. Prepara a chamada para a API do Imagen 3
        print("--- [Relatório Visual] Solicitando imagem à API do Imagen 3...")
        api_key = os.getenv('GEMINI_API_KEY')
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={api_key}"

        payload = {
            "instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": 1}
        }

        # 4. Executa a chamada para a API
        response = requests.post(api_url, json=payload)
        response_data = response.json()

        # --- DEBUG: Imprime a resposta completa do Imagen para análise ---
        print(f"--- [DEBUG] Resposta completa da API do Imagen: {response_data}")

        # 5. Extrai os dados da imagem da resposta (que vem em base64)
        try:
            base64_image_data = response_data['predictions'][0]['bytesBase64Encoded']
            image_bytes = base64.b64decode(base64_image_data)
        except (KeyError, IndexError) as e:
            print(f"ERRO: Não foi possível extrair os dados da imagem da resposta do Imagen. Erro: {e}")
            return None, "A IA não retornou uma imagem válida."

        # 6. Cria um "arquivo virtual" em memória
        image_file = io.BytesIO(image_bytes)

        # 7. Faz o upload do arquivo virtual para o Cloudinary
        print("--- [Relatório Visual] Enviando imagem gerada para o Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            image_file,
            public_id=f"simplific-pro/visual-reports/{user_id}/resumo_{target_date.strftime('%Y_%m')}",
            overwrite=True,
            resource_type="image"
        )

        image_url = upload_result.get('secure_url')
        print(f"--- [Relatório Visual] Sucesso! URL da imagem: {image_url}")

        # 8. Retorna a URL final
        return image_url, None

# ▲▲▲ FIM DO BLOCO ▲▲▲


    except Exception as e:
        print(f"ERRO CRÍTICO durante a geração do relatório visual: {e}")
        return None, "Ocorreu um erro ao gerar o seu relatório visual. Tente novamente."

# ▲▲▲ FIM DO BLOCO ▲▲▲