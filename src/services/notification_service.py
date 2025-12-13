from flask_mail import Message
from src.extensions import mail
from src.services.whatsapp_service import send_whatsapp_message, send_whatsapp_template, template_sids
from flask import render_template # Para usar templates HTML no futuro

def _send_welcome_email(user_credentials):
    """Envia o e-mail de boas-vindas com os dados de acesso."""
    try:
        # Cria a mensagem de e-mail
        msg = Message(
            subject="Bem-vindo ao Simplific Pro! Seus dados de acesso chegaram.",
            recipients=[user_credentials['email']]
        )
        # Corpo do e-mail em texto simples (podemos usar HTML no futuro)
        msg.body = (
            f"Olá, {user_credentials['name']}!\n\n"
            f"Sua jornada para uma vida financeira mais organizada começa agora. Seja muito bem-vindo(a) ao Simplific Pro!\n\n"
            f"Aqui estão seus dados para o primeiro acesso:\n"
            f"Login: {user_credentials['email']}\n"
            f"Senha Provisória: {user_credentials['password']}\n\n"
            f"Acesse: www.simplificpro.com para realizar o primeiro acesso.\n\n"
            f"Acesse o Simplific.Ai no número - +55 11 5199-1373  .\n\n"
            f"Como sugestão: Pergunte ao Simplific IA tudo o que ele pode fazer por você e veja todas as funcionalidades\n\n"
            f"Recomendamos que você altere sua senha no primeiro login.\n\n"
            f"O guia de TUTORIAIS com vídeo aulas está dispoível na área de 'Dashboard' \n\n"
            f"Até breve,\n"
            f"Equipe Simplific Pro"
        )

        mail.send(msg)
        print(f"✅ E-mail de boas-vindas enviado para {user_credentials['email']}.")
        return True
    except Exception as e:
        print(f"ERRO CRÍTICO ao enviar e-mail de boas-vindas: {e}")
        return False

# Em src/services/notification_service.py
# Substitua a função inteira por esta versão

def _send_welcome_whatsapp(user_credentials):
    """Envia a mensagem de boas-vindas via WhatsApp usando um Template."""
    whatsapp_number_twilio = f"whatsapp:{user_credentials['whatsapp']}"

    # Busca o ID (SID) do nosso template de boas-vindas
    welcome_template_sid = template_sids.get('welcome_simplific')
    if not welcome_template_sid:
        print("ERRO: Template SID para 'welcome_simplific' não encontrado.")
        return False

    # Chama a função com os parâmetros corretos
    resultado = send_whatsapp_template(
        to=whatsapp_number_twilio,
        template_sid=welcome_template_sid, # <-- Parâmetro corrigido
        content_variables={
            "1": user_credentials['name'],
            "2": user_credentials['email'],
            "3": user_credentials['password']
        }
    )

    if resultado.get('status') == 'success':
        print(f"✅ WhatsApp de boas-vindas enviado para {user_credentials['whatsapp']}.")
        return True
    else:
        print(f"ERRO ao enviar WhatsApp de boas-vindas: {resultado.get('message')}")
        return False

def send_welcome_credentials(user_credentials):
    """
    Função principal da Central. Orquestra o envio por ambos os canais.
    """
    print(f"Iniciando envio de credenciais para o usuário: {user_credentials['name']}")
    # Envia por ambos os canais
    email_sent = _send_welcome_email(user_credentials)
    whatsapp_sent = _send_welcome_whatsapp(user_credentials)

    return email_sent and whatsapp_sent

# COLE ESTE BLOCO NO FINAL DO ARQUIVO notification_service.py

def send_password_reset_email(user_email, user_name, token):
    """Envia o e-mail de recuperação de senha com o link."""
    try:
        # O URL do frontend para a página de redefinição de senha
        reset_url = f"https://simplificpro.com/#/reset-password?token={token}"

        msg = Message(
            subject="Recuperação de Senha - Simplific Pro",
            recipients=[user_email]
        )

        msg.body = (
            f"Olá, {user_name}!\n\n"
            f"Recebemos uma solicitação para redefinir sua senha. Se foi você, por favor, clique no link abaixo para criar uma nova senha:\n\n"
            f"{reset_url}\n\n"
            f"Este link é válido por 1 hora. Após esse período, você precisará solicitar uma nova recuperação.\n\n"
            f"Se você não solicitou esta alteração, por favor, ignore este e-mail.\n\n"
            f"Atenciosamente,\n"
            f"Equipe Simplific Pro"
        )

        mail.send(msg)
        print(f"✅ E-mail de recuperação de senha enviado para {user_email}.")
        return True
    except Exception as e:
        print(f"ERRO CRÍTICO ao enviar e-mail de recuperação: {e}")
        return False

# --- MÁQUINA DE VENDAS (VERSÃO ONLY CARDS) ---

def send_payment_failed_notification(name, whatsapp):
    """Envia aviso de falha de cartão via Template (Seguro)."""
    if not whatsapp: return False
    
    target = f"whatsapp:{whatsapp}"
    first_name = name.split()[0] if name else "Visitante"
    
    # --- PONTO DE ATENÇÃO: SUBSTITUA PELO SID GERADO NO TWILIO ---
    # Crie o template: "card_failed_v2"
    card_template_sid = "HX9ef48ae05557d8f5a9d0e9e9e2aac3d6"

    if "HX_" not in card_template_sid:
         print("⚠️ AVISO: Template de Cartão não configurado. Pule o envio.")
         return False
    
    try:
        resultado = send_whatsapp_template(
            to=target,
            template_sid=card_template_sid,
            content_variables={
                "1": first_name # Variável {{1}} do template (Nome)
            }
        )
        
        if resultado.get('status') == 'success':
            print(f"✅ WhatsApp Falha Cartão enviado para {whatsapp}.")
            return True
        else:
            print(f"❌ Erro Twilio Cartão: {resultado.get('message')}")
            return False

    except Exception as e:
        print(f"❌ Erro Crítico Cartão: {e}")
        return False