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
        fallback_visuals = []
        if any(term in user_message.lower() for term in ['open finance', 'conectar banco', 'conectar conta', 'sincronizar banco', 'sincronizar conta', 'sincronizar meus bancos', 'cartões', 'cartao', 'klavi']):
            try:
                from src.services.vision_orchestrator_service import coletar_status_open_finance
                of_data = coletar_status_open_finance(user_id)
                if of_data:
                    fallback_visuals.append({"type": "open_finance", "data": of_data})
            except Exception as of_err:
                print(f"Erro ao recuperar status Open Finance no fallback: {of_err}")

        return jsonify({
            "reply": ai_response,
            "visuals": fallback_visuals
        })


@chat_bp.route('/chat/upload-comprovante', methods=['POST'])
@jwt_required()
def handle_upload_comprovante():
    """
    Recebe um comprovante financeiro (imagem ou PDF) enviado pelo botão '+' do chat Vision,
    extrai os dados via OCR + IA, registra o lançamento no banco de dados e retorna o recibo digital.
    """
    from src.services.transacoes_service import processar_comprovante_bytes

    user_id = get_jwt_identity()
    usuario = User.query.get(user_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado."}), 404

    arquivo = request.files.get('comprovante') or request.files.get('file')
    if not arquivo:
        return jsonify({"error": "Nenhum arquivo de comprovante enviado."}), 400

    file_bytes = arquivo.read()
    filename = arquivo.filename or "comprovante.jpg"
    content_type = arquivo.content_type or "image/jpeg"

    if len(file_bytes) == 0:
        return jsonify({"error": "O arquivo enviado está vazio."}), 400

    resultado = processar_comprovante_bytes(
        user_id=user_id,
        file_bytes=file_bytes,
        filename=filename,
        content_type=content_type
    )

    visuals = []
    if resultado.get("transacao"):
        visuals.append({
            "type": "receipt",
            "data": resultado["transacao"]
        })

    return jsonify({
        "reply": resultado.get("mensagem", "Comprovante processado."),
        "visuals": visuals,
        "status": resultado.get("status", "sucesso")
    })