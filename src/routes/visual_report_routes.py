# src/routes/visual_report_routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.visual_report_service import generate_visual_report
from datetime import datetime
from src.services.visual_report_service import _collect_financial_data # <-- Adicione esta importação

visual_report_bp = Blueprint('visual_report', __name__)

@visual_report_bp.route('/visual-reports', methods=['POST'])
@jwt_required()
def handle_generate_visual_report():
    """
    Gera um relatório visual e retorna tanto a URL da imagem de fundo
    quanto os dados brutos para o frontend renderizar.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        year = data.get('year', datetime.now().year)
        month = data.get('month', datetime.now().month)
        target_date = datetime(year, month, 1).date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Mês ou ano inválido.'}), 400

    # 1. Coleta os dados financeiros (reutilizando nossa função de serviço)
    financial_data = _collect_financial_data(user_id, target_date)

    # 2. Gera a imagem de fundo
    image_url, error = generate_visual_report(user_id, target_date)

    if error:
        return jsonify({'error': error}), 500

    # 3. Retorna AMBOS os dados em uma única resposta
    return jsonify({
        'background_image_url': image_url,
        'financial_data': financial_data
    }), 200

# ▲▲▲ FIM DO BLOCO ▲▲▲
