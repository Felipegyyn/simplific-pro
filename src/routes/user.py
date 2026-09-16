from flask import Blueprint, jsonify, request
from functools import wraps # <-- ADICIONE ESTA LINHA
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
)
from datetime import datetime, timedelta
from src.models.user import User, db
from src.extensions import bcrypt # <-- LINHA ADICIONADA

print("--- DEBUG: O arquivo src/routes/user.py foi carregado com sucesso. ---")

user_bp = Blueprint('user', __name__)

# ▼▼▼ DECORADOR DE VERIFICAÇÃO DE USUÁRIO ATIVO ▼▼▼
def active_user_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Pula a verificação para requisições OPTIONS (preflight de CORS)
        if request.method == 'OPTIONS':
            return fn(*args, **kwargs)

        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if user and user.status == 'ativo':
            return fn(*args, **kwargs)
        else:
            return jsonify({"error": "Acesso não autorizado. Sua conta está inativa."}), 403
    return wrapper
# ▲▲▲ FIM DO DECORADOR ▲▲▲

# === AUTH ROUTES ===

@user_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200  # responde OK para o preflight
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email e senha são obrigatórios'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Email ou senha inválidos'}), 401

    # ▼▼▼ ADICIONE ESTE BLOCO DE CÓDIGO AQUI ▼▼▼
    # Verificação de status do usuário
    if user.status != 'ativo':
         jsonify({'error': 'Esta conta de usuário está inativa ou bloqueada.'}), 403
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Email ou senha inválidos'}), 401

    # ▼▼▼ AJUSTE CRÍTICO E DEFINITIVO AQUI ▼▼▼
    # Verificamos o status ANTES de criar os tokens e dar o OK.
    if user.status != 'ativo':
        # Se o usuário não estiver ativo, barramos o login aqui.
        return jsonify({'error': 'Sua conta está inativa. Entre em contato com o suporte.'}), 403 # Retorna 403 Proibido

    # ▼▼▼ TRAVA DE VERIFICAÇÃO DE E-MAIL ▼▼▼
    if not user.is_verified:
        return jsonify({'error': 'Por favor, confirme seu e-mail antes de fazer login. Verifique sua caixa de entrada.'}), 403

    # Disparo de boas-vindas do WhatsApp no primeiro login após a verificação
    if user.first_login:
        try:
            from src.services.notification_service import _send_welcome_whatsapp
            # O template espera email, password e name, mas não temos a senha em texto plano aqui.
            # O template 'welcome_simplific' usa {{1}} Nome, {{2}} Email, {{3}} Senha.
            # Como a senha já foi definida pelo usuário no cadastro, podemos mandar algo como 'A senha que você cadastrou' ou omitir.
            # Vamos mandar "***" ou "Sua senha cadastrada".
            creds = {
                'name': user.name,
                'email': user.email,
                'whatsapp': user.whatsapp,
                'password': 'Sua senha cadastrada'
            }
            _send_welcome_whatsapp(creds)
            user.first_login = False
        except Exception as e:
            print(f"Erro ao enviar WA de boas-vindas: {e}")

    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create tokens
    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=24))
    refresh_token = create_refresh_token(identity=str(user.id))

    print(f"access_token: {access_token}")
    print(f"refresh_token: {refresh_token}")

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    })

@user_bp.route('/auth/refresh', methods=['POST', 'OPTIONS'])
def refresh_token():
    if request.method == 'OPTIONS':
        return '', 200  # responde OK para o preflight

    # Agora sim, protege com JWT refresh token
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, create_access_token
    verify_jwt_in_request(refresh=True)

    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id, expires_delta=timedelta(hours=24))
    
    return jsonify({'access_token': access_token})


@user_bp.route('/auth/me', methods=['GET', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def get_current_user():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify(user.to_dict())

# === PROFILE ===

@user_bp.route('/auth/change-password', methods=['POST']) # <-- CORREÇÃO 1: A URL agora está correta
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # CORREÇÃO 2: Lógica ajustada para o primeiro login.
    # Removemos a verificação da "senha atual", que não faz sentido aqui.
    data = request.json
    new_password = data.get('new_password')
    
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'A nova senha é obrigatória e deve ter pelo menos 6 caracteres'}), 400
    
    # Atualiza a senha do usuário com o novo hash
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    # MUITO IMPORTANTE: Marca que o primeiro login foi concluído
    user.first_login = False
    
    db.session.commit()
    
    return jsonify({'message': 'Senha alterada com sucesso!'}), 200

# === ADMIN ROUTES ===

@user_bp.route('/admin/users', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def manage_users():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
 
    # Ajuste para verificar perfil, não mais 'is_admin'
    if not admin or admin.profile != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403
 
    if request.method == 'GET':
        users = User.query.order_by(User.id).all() # Ordena para consistência
        return jsonify([user.to_dict() for user in users])

    if request.method == 'POST':
        data = request.json

        # Novos campos recebidos do frontend
        name = data.get('name')
        email = data.get('email')
        whatsapp = data.get('whatsapp')
        profile = data.get('profile')
        password = data.get('password')

        if not all([name, email, profile, password]):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email já está em uso'}), 400

        if whatsapp and User.query.filter_by(whatsapp=whatsapp).first():
            return jsonify({'error': 'WhatsApp já está em uso'}), 400

        new_user = User(
            name=name,
            email=email,
            whatsapp=whatsapp,
            profile=profile
        )

        # Hasheia a senha usando o método do modelo
        new_user.set_password(password)
        new_user.first_login = True

        db.session.add(new_user)
        db.session.commit()

        return jsonify(new_user.to_dict()), 201


@user_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@active_user_required
def update_user(user_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)

    if not admin or admin.profile != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403

    user = User.query.get_or_404(user_id)
    data = request.json

    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        # Check if email is used by another user
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'error': 'Email já está em uso por outro usuário'}), 400
        user.email = data['email']
    if 'whatsapp' in data:
        existing_user = User.query.filter_by(whatsapp=data['whatsapp']).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({'error': 'WhatsApp já está em uso por outro usuário'}), 400
        user.whatsapp = data['whatsapp']
    if 'subscription_plan' in data:
        user.subscription_plan = data['subscription_plan']
    if 'subscription_valid_until' in data:
        date_str = data['subscription_valid_until']
        if date_str:
            try:
                # Expecting format YYYY-MM-DD
                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                user.subscription_valid_until = parsed_date
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        else:
            user.subscription_valid_until = None

    db.session.commit()
    return jsonify(user.to_dict()), 200


@user_bp.route('/admin/users/<int:user_id>/status', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_user_status(user_id):
    admin_id = get_jwt_identity()
    admin = User.query.get(admin_id)

    if not admin or admin.profile != 'admin':
        return jsonify({'error': 'Acesso negado'}), 403

    user = User.query.get_or_404(user_id)

    if user.id == admin.id:
        return jsonify({'error': 'Não é possível alterar o status da sua própria conta'}), 400

    data = request.json
    new_status = data.get('status')

    if new_status not in ['ativo', 'inativo', 'bloqueado']:
        return jsonify({'error': "Status inválido. Use 'ativo', 'inativo' ou 'bloqueado'."}), 400

    user.status = new_status
    db.session.commit()

    return jsonify(user.to_dict())

# === TEST ROUTE ===

@user_bp.route('/auth/test_identity', methods=['GET'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def test_identity():
    user_id = get_jwt_identity()
    return jsonify({'user_id': user_id})


@user_bp.route('/profile', methods=['GET', 'PUT', 'OPTIONS'])
@jwt_required()
@active_user_required
def manage_profile():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404

    if request.method == 'GET':
        return jsonify(user.to_dict())

    if request.method == 'PUT':
        data = request.json
        name = data.get('name')
        whatsapp = data.get('whatsapp')
        
        # --- NOVOS CAMPOS ---
        secondary_name = data.get('secondary_name')
        secondary_whatsapp = data.get('secondary_whatsapp')

        if not name:
            return jsonify({'error': 'O nome do titular é obrigatório.'}), 400

        # Atualiza titular
        user.name = name
        user.whatsapp = whatsapp
        
        # Atualiza conta compartilhada
        user.secondary_name = secondary_name
        user.secondary_whatsapp = secondary_whatsapp
        
        try:
            db.session.commit()
            return jsonify(user.to_dict())
        except Exception as e:
            db.session.rollback()
            # Tratamento básico para erro de duplicidade (se o número já existir em outra conta)
            if 'unique constraint' in str(e).lower():
                return jsonify({'error': 'Este número de WhatsApp já está cadastrado em outra conta.'}), 400
            return jsonify({'error': 'Erro ao salvar dados.'}), 500

# ▼▼▼ COLE TODO ESTE BLOCO NO FINAL DO ARQUIVO ▼▼▼
@user_bp.route('/user/preference', methods=['PUT'])
@jwt_required()
@active_user_required # <-- TRAVA APLICADA
def update_user_preference():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    data = request.json
    new_format = data.get('response_format')

    if new_format not in ['text', 'audio']:
        return jsonify({"error": "Formato inválido. Use 'text' ou 'audio'."}), 400

    user.preferred_response_format = new_format
    db.session.commit()

    return jsonify({"message": "Preferência atualizada com sucesso", "new_format": new_format}), 200





