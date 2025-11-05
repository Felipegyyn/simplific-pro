from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User

# Importa a função principal de interação da IA que já usamos no WhatsApp
from src.routes.routes_whatsapp import tratar_nova_interacao

# Cria o nosso novo "Blueprint" para as rotas de chat
chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@jwt_required() # Protege a rota, apenas usuários logados podem acessar
def handle_chat_message():
    """
    Recebe uma mensagem do chat da plataforma web, processa com a IA 
    e retorna a resposta.
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    user_message = data.get('message')
    if not user_message:
        return jsonify({"error": "A mensagem não pode estar vazia."}), 400

    # Busca o objeto do usuário para passar para a função de IA
    usuario = User.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado."}), 404

    # AQUI ESTÁ A MÁGICA:
    # Reutilizamos 100% da lógica do WhatsApp.
    # A função 'tratar_nova_interacao' espera (mensagem, media_url, from_number, usuario).
    # Passamos 'None' para media_url e um ID de sessão único para from_number.
    
    # Usar o ID do usuário garante que o histórico da conversa na plataforma
    # seja separado do histórico do WhatsApp.
    session_key = f"platform_user_{user_id}" 
    
    ai_response = tratar_nova_interacao(user_message, None, session_key, usuario)
    
    # Retornamos a resposta da IA em um formato JSON para o frontend
    return jsonify({"reply": ai_response})