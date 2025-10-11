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
# A importação do cloudinary é feita no main.py, mas precisamos do objeto aqui
import cloudinary
import cloudinary.uploader


def _collect_financial_data(user_id, target_date):
    """
    Coleta e sumariza os dados financeiros de um usuário para um mês específico.
    """
    start_of_month = target_date.replace(day=1)
    end_of_month = (start_of_month + relativedelta(months=1)) - relativedelta(days=1)

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
    taxa_poupanca = ((total_receitas - total_despesas) / total_receitas) * 100 if total_receitas > 0 else 0

    top_expenses = db.session.query(
        Category.name,
        func.sum(Transaction.value).label('total')
    ).join(Category, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.date.between(start_of_month, end_of_month),
        Transaction.type == 'saida',
        Transaction.status == 'confirmada'
    ).group_by(Category.name).order_by(func.sum(Transaction.value).desc()).limit(3).all()

    financial_data = {
        'mes_ano': start_of_month.strftime("%B de %Y").capitalize(),
        'total_receitas': total_receitas,
        'total_despesas': total_despesas,
        'saldo_liquido': total_receitas - total_despesas,
        'taxa_poupanca': taxa_poupanca,
        'top_3_despesas': [{'categoria': cat, 'valor': val} for cat, val in top_expenses]
    }
    
    return financial_data


def _create_image_generation_prompt(financial_data, user_name):
    """
    Cria um prompt de texto para o modelo de imagem gerar um TEMPLATE DE FUNDO,
    sem nenhum texto ou número.
    """
    prompt = f"""
    Create a background image for a stylish and modern personal finance infographic.
    The style must be clean, minimalist, with a dark blue background (#1E293B).
    The layout should have clear placeholder areas for text and charts.

    The layout must contain:
    1.  At the top, an empty area for a main title.
    2.  Below the title, three empty card shapes side-by-side: the first one vibrant green, the second one soft red, the third one amber yellow.
    3.  In the middle section, on the left, a large empty circular area as a placeholder for a pie chart or text.
    4.  In the middle section, on the right, an empty placeholder area for an icon and a large percentage number.
    5.  A subtle, clean footer area.

    CRITICAL RULE: The image must be a template only. Generate NO text, NO numbers, NO words, NO letters. It must be a completely blank template with only shapes and colors.
    """
    
    return prompt


def _draw_data_on_image(image_bytes, data, user_name):
    """
    Abre uma imagem de fundo, desenha os dados financeiros por cima
    e retorna os bytes da nova imagem finalizada.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    draw = ImageDraw.Draw(image)

    try:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        font_path = os.path.join(base_dir, 'assets', 'fonts', 'Roboto-Regular.ttf')
        
        font_title = ImageFont.truetype(font_path, 60)
        font_card_title = ImageFont.truetype(font_path, 28)
        font_card_value = ImageFont.truetype(font_path, 48)
        font_section_title = ImageFont.truetype(font_path, 32)
        font_text = ImageFont.truetype(font_path, 24)
    except IOError:
        print("ERRO: Ficheiro da fonte não encontrado! A usar fonte padrão.")
        font_title = ImageFont.load_default()
        font_card_title = ImageFont.load_default()
        font_card_value = ImageFont.load_default()
        font_section_title = ImageFont.load_default()
        font_text = ImageFont.load_default()

    WHITE = (255, 255, 255, 255)
    
    image_width, _ = image.size
    center_x = image_width / 2

    # Título Principal
    title_text = f"Resumo de {data['mes_ano']}"
    draw.text((center_x, 150), title_text, font=font_title, fill=WHITE, anchor="ms")
    
    # Cards (posições baseadas em percentagens da largura)
    draw.text((image_width * 0.25, 320), "Receitas Totais", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((image_width * 0.25, 380), format_currency_brl(data['total_receitas']), font=font_card_value, fill=WHITE, anchor="ms")

    draw.text((center_x, 320), "Despesas Totais", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((center_x, 380), format_currency_brl(data['total_despesas']), font=font_card_value, fill=WHITE, anchor="ms")

    draw.text((image_width * 0.75, 320), "Saldo do Mês", font=font_card_title, fill=WHITE, anchor="ms")
    draw.text((image_width * 0.75, 380), format_currency_brl(data['saldo_liquido']), font=font_card_value, fill=WHITE, anchor="ms")

    # Seção de Maiores Despesas
    draw.text((image_width * 0.25, 600), "Maiores Despesas", font=font_section_title, fill=WHITE, anchor="ms")
    y_position = 650
    for despesa in data['top_3_despesas']:
        draw.text((image_width * 0.1, y_position), f"• {despesa['categoria']}", font=font_text, fill=WHITE, anchor="ls")
        draw.text((image_width * 0.4, y_position), format_currency_brl(despesa['valor']), font=font_text, fill=WHITE, anchor="rs")
        y_position += 40

    # Seção de Taxa de Poupança
    draw.text((image_width * 0.75, 600), "Taxa de Poupança", font=font_section_title, fill=WHITE, anchor="ms")
    draw.text((image_width * 0.75, 680), f"{data['taxa_poupanca']:.0f}%", font=ImageFont.truetype(font_path, 80), fill=WHITE, anchor="ms")
    
    # Rodapé
    draw.text((center_x, image.height - 50), f"Relatório de {user_name}", font=font_text, fill=WHITE, anchor="ms")

    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    return buffer.getvalue()


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
        print(f"--- [Relatório Visual] Coletando dados para {user.email}...")
        financial_data = _collect_financial_data(user_id, target_date)

        print("--- [Relatório Visual] Criando prompt para o template de fundo...")
        prompt = _create_image_generation_prompt(financial_data, user.name)

        print("--- [Relatório Visual] Solicitando template de fundo à API do Imagen...")
        api_key = os.getenv('GEMINI_API_KEY')
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key={api_key}"
        payload = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1}}
        
        response = requests.post(api_url, json=payload)
        response_data = response.json()
        
        base64_image_data = response_data['predictions'][0]['bytesBase64Encoded']
        background_image_bytes = base64.b64decode(base64_image_data)

        print("--- [Relatório Visual] Desenhando dados sobre o template...")
        final_image_bytes = _draw_data_on_image(background_image_bytes, financial_data, user.name)

        # ▼▼▼ SUBSTITUA O BLOCO DE UPLOAD POR ESTE ▼▼▼
        print("--- [Relatório Visual] Enviando imagem final para o Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            io.BytesIO(final_image_bytes),
            public_id=f"simplific-pro/visual-reports/{user_id}/resumo_{target_date.strftime('%Y_%m')}",
            overwrite=True,
            resource_type="image"
        )

        # --- VERIFICAÇÃO DE SUCESSO ADICIONADA ---
        if upload_result and upload_result.get('secure_url'):
            image_url = upload_result.get('secure_url')
            print(f"--- [Relatório Visual] Sucesso! URL da imagem: {image_url}")
            return image_url, None
        else:
            # Se o upload falhou, logamos o que o Cloudinary nos retornou e enviamos um erro claro.
            print(f"ERRO: Falha no upload para o Cloudinary. Resposta recebida: {upload_result}")
            return None, "Não foi possível guardar a imagem final no nosso servidor. Por favor, tente novamente."
        # ▲▲▲ FIM DO BLOCO ▲▲▲

    except Exception as e:
        print(f"ERRO CRÍTICO durante a geração do relatório visual: {e}")
        return None, "Ocorreu um erro ao gerar o seu relatório visual. Tente novamente."
