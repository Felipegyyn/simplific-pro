from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User

# Importa o orquestrador visual do Vision e o fallback do WhatsApp
from src.services.vision_orchestrator_service import processar_interacao_vision
from src.routes.routes_whatsapp import tratar_nova_interacao

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@jwt_required()
def handle_chat_message():
    """
    Recebe a mensagem do chat Vision, processa pelo orquestrador e retorna
    o texto humanizado acompanhado de dados visuais (gráficos, recibos, cartões e imagens).
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    user_message = data.get('message')
    if not user_message:
        return jsonify({"error": "A mensagem não pode estar vazia."}), 400

    usuario = User.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado."}), 404

    try:
        # Orquestrador com suporte a gráficos, recibos, agenda, metas e cards com imagem
        resultado = processar_interacao_vision(user_id, user_message, usuario)
        return jsonify({
            "reply": resultado.get("reply", ""),
            "visuals": resultado.get("visuals", [])
        })
    except Exception as e:
        print(f"⚠️ [VISION CHAT] Falha no orquestrador ({e}). Usando fallback simples...")
        session_key = f"platform_user_{user_id}"
        ai_response = tratar_nova_interacao(user_message, None, session_key, usuario)
        return jsonify({
            "reply": ai_response,
            "visuals": []
        })