# src/routes/visual_report_routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.visual_report_service import generate_visual_report
from datetime import datetime

visual_report_bp = Blueprint('visual_report', __name__)

@visual_report_bp.route('/visual-reports', methods=['POST'])
@jwt_required()
def handle_generate_visual_report():
    """
    Gatilho da API para gerar um relatório visual.
    Aceita 'month' e 'year' no corpo da requisição.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        year = data.get('year', datetime.now().year)
        month = data.get('month', datetime.now().month)
        target_date = datetime(year, month, 1).date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Mês ou ano inválido.'}), 400

    image_url, error = generate_visual_report(user_id, target_date)

    if error:
        return jsonify({'error': error}), 500

    return jsonify({'image_url': image_url}), 200