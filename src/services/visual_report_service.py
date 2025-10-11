# ▼▼▼ SUBSTITUA SUAS IMPORTAÇÕES ATUAIS POR ESTE BLOCO COMPLETO ▼▼▼
import os
import requests
import io
import base64
from datetime import date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, case
from PIL import Image, ImageDraw, ImageFont

from src.models.db import db
from src.models.user import User
from src.models.financial import Transaction, Category
from src.utils.formatters import format_currency_brl
from src.services.image_service import cloudinary # Importamos o objeto já configurado
# ▲▲▲ FIM DO BLOCO ▲▲▲


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

# ▼▼▼ COLE A NOVA FUNÇÃO DE DESENHO AQUI ▼▼▼

def _draw_data_on_image(image_bytes, data, user_name):
    """
    Abre uma imagem de fundo, desenha os dados financeiros por cima
    e retorna os bytes da nova imagem finalizada.
    """
    # Abre a imagem a partir dos bytes recebidos
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    draw = ImageDraw.Draw(image)

    # Define os caminhos para as nossas fontes
    # (Este caminho relativo funciona a partir de 'src/services/')
    base_path = os.path.dirname(__file__)
    font_path = os.path.join(base_path, '..', 'assets', 'fonts', 'Roboto-Regular.ttf')

    # Carrega as fontes em diferentes tamanhos
    font_title = ImageFont.truetype(font_path, 60)
    font_card_title = ImageFont.truetype(font_path, 28)
    font_card_value = ImageFont.truetype(font_path, 48)
    font_section_title = ImageFont.truetype(font_path, 32)
    font_text = ImageFont.truetype(font_path, 24)

    # Cores
    WHITE = (255, 255, 255, 255)

    # --- DESENHANDO OS TEXTOS (Coordenadas X, Y) ---
    # As coordenadas foram estimadas para uma imagem de 1200x1697.

    # Título Principal
    title_text = f"Resumo de {data['mes_ano']}"
    draw.text((600, 150), title_text, font=font_title, fill=WHITE, anchor="ms")

    # Card de Receitas
    draw.text((300, 320), "Receitas Totais", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((300, 380), format_currency_brl(data['total_receitas']), font=font_card_value, fill=WHITE, anchor="ms")

    # Card de Despesas
    draw.text((600, 320), "Despesas Totais", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((600, 380), format_currency_brl(data['total_despesas']), font=font_card_value, fill=WHITE, anchor="ms")

    # Card de Saldo
    draw.text((900, 320), "Saldo do Mês", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((900, 380), format_currency_brl(data['saldo_liquido']), font=font_card_value, fill=WHITE, anchor="ms")

    # Seção de Maiores Despesas
    draw.text((300, 600), "Maiores Despesas", font=font_section_title, fill=WHITE, anchor="ms")
    y_position = 650
    for despesa in data['top_3_despesas']:
        draw.text((150, y_position), f"• {despesa['categoria']}", font=font_text, fill=WHITE, anchor="ls")
        draw.text((450, y_position), format_currency_brl(despesa['valor']), font=font_text, fill=WHITE, anchor="rs")
        y_position += 40

    # Seção de Taxa de Poupança
    draw.text((900, 600), "Taxa de Poupança", font=font_section_title, fill=WHITE, anchor="ms")
    draw.text((900, 680), f"{data['taxa_poupanca']:.0f}%", font=ImageFont.truetype(font_path, 80), fill=WHITE, anchor="ms")

    # Rodapé
    draw.text((600, 1600), f"Relatório de {user_name}", font=font_text, fill=WHITE, anchor="ms")

    # Salva a imagem finalizada em um buffer de memória
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return buffer.getvalue()

# ▲▲▲ FIM DO BLOCO ▲▲▲


# ▼▼▼ SUBSTITUA A FUNÇÃO 'generate_visual_report' INTEIRA POR ESTA ▼▼▼

def generate_visual_report(user_id, target_date=None):
    """
    Orquestra o novo fluxo de geração de relatório visual:
    1. Coleta os dados.
    2. Cria o prompt para o TEMPLATE de fundo.
    3. Chama a IA para gerar o TEMPLATE.
    4. DESENHA os dados sobre o template.
    5. Salva a imagem FINAL no Cloudinary.
    6. Retorna a URL.
    """
    if target_date is None:
        target_date = date.today()

    user = User.query.get(user_id)
    if not user:
        return None, "Utilizador não encontrado."

    try:
        # 1. Coleta os dados financeiros
        print(f"--- [Relatório Visual] Coletando dados para {user.email}...")
        financial_data = _collect_financial_data(user_id, target_date)

        # 2. Cria o prompt para o TEMPLATE de fundo
        print("--- [Relatório Visual] Criando prompt para o template de fundo...")
        prompt = _create_image_generation_prompt(financial_data, user.name)

        # 3. Chama a API do Imagen para gerar o TEMPLATE de fundo
        print("--- [Relatório Visual] Solicitando template de fundo à API do Imagen...")
        api_key = os.getenv('GEMINI_API_KEY')
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={api_key}"
        payload = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1}}

        response = requests.post(api_url, json=payload)
        response_data = response.json()

        base64_image_data = response_data['predictions'][0]['bytesBase64Encoded']
        background_image_bytes = base64.b64decode(base64_image_data)

        # 4. DESENHA os dados sobre a imagem de fundo
        print("--- [Relatório Visual] Desenhando dados sobre o template...")
        final_image_bytes = _draw_data_on_image(background_image_bytes, financial_data, user.name)

        # 5. Faz o upload da imagem FINALIZADA para o Cloudinary
        print("--- [Relatório Visual] Enviando imagem final para o Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            io.BytesIO(final_image_bytes),
            public_id=f"simplific-pro/visual-reports/{user_id}/resumo_{target_date.strftime('%Y_%m')}",
            overwrite=True,
            resource_type="image"
        )

        image_url = upload_result.get('secure_url')
        print(f"--- [Relatório Visual] Sucesso! URL da imagem: {image_url}")

        return image_url, None

    except Exception as e:
        print(f"ERRO CRÍTICO durante a geração do relatório visual: {e}")
        return None, "Ocorreu um erro ao gerar o seu relatório visual. Tente novamente."

# ▲▲▲ FIM DO BLOCO ▲▲▲