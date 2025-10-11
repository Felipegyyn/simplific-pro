# src/routes/visual_report_routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.visual_report_service import generate_visual_report
from datetime import datetime
from src.services.visual_report_service import _collect_financial_data # <-- Adicione esta importação

visual_report_bp = Blueprint('visual_report', __name__)

# ▼▼▼ SUBSTITUA A FUNÇÃO 'handle_generate_visual_report' INTEIRA POR ESTA ▼▼▼

@visual_report_bp.route('/visual-reports', methods=['POST'])
@jwt_required()
def handle_generate_visual_report():
    """
    Gatilho da API para gerar um relatório visual finalizado e retornar sua URL.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        year = data.get('year', datetime.now().year)
        month = data.get('month', datetime.now().month)
        target_date = datetime(year, month, 1).date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Mês ou ano inválido.'}), 400

    # Chama o motor, que agora faz todo o trabalho
    image_url, error = generate_visual_report(user_id, target_date)

    if error:
        return jsonify({'error': error}), 500

    # Retorna apenas a URL da imagem final
    return jsonify({'image_url': image_url}), 200

# ▲▲▲ FIM DO BLOCO ▲▲▲