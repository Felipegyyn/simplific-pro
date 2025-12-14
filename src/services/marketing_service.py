import os
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign

class MetaAdsService:
    def __init__(self):
        # O Python vai buscar isso lá nas configurações do Render que você acabou de criar
        self.app_id = os.getenv('META_APP_ID')
        self.app_secret = os.getenv('META_APP_SECRET')
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('META_AD_ACCOUNT_ID')

        # Inicializa a conexão com a API
        if self.app_id and self.access_token:
            try:
                FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
                print("--- [META ADS] Conexão com Facebook iniciada com sucesso. ---")
            except Exception as e:
                print(f"--- [META ADS] ERRO ao conectar: {e} ---")
        else:
            print("⚠️ AVISO: Credenciais do Meta Ads não configuradas no Render.")

    def get_campaigns(self):
        """Busca todas as campanhas ativas e seus dados."""
        if not self.ad_account_id: return []

        try:
            account = AdAccount(self.ad_account_id)
            
            # Campos que queremos buscar
            fields = [
                Campaign.Field.name,
                Campaign.Field.status,
                Campaign.Field.daily_budget,
                Campaign.Field.id
            ]
            
            # Busca as campanhas (Status ACTIVE ou PAUSED)
            campaigns = account.get_campaigns(
                fields=fields, 
                params={
                    'limit': 50,
                    'effective_status': ['ACTIVE', 'PAUSED'] # Traz só o que importa
                }
            )
            
            results = []
            for camp in campaigns:
                # Busca insights (gastos) APENAS desta campanha
                insights = camp.get_insights(fields=['spend', 'cpc', 'actions'])
                
                spend = insights[0]['spend'] if insights else 0
                
                # Tratamento do orçamento (vem em centavos)
                daily_budget_cents = camp.get('daily_budget')
                daily_budget_real = float(daily_budget_cents) / 100 if daily_budget_cents else 0

                results.append({
                    'id': camp['id'],
                    'name': camp['name'],
                    'status': camp['status'],
                    'daily_budget': daily_budget_real, # Já convertido para Reais
                    'total_spend': spend
                })
                
            return results

        except Exception as e:
            print(f"❌ Erro ao buscar campanhas Meta: {e}")
            return []

    def toggle_campaign_status(self, campaign_id, new_status):
        """
        Muda o status.
        new_status deve ser 'ACTIVE' ou 'PAUSED'
        """
        try:
            campaign = Campaign(campaign_id)
            campaign.update({
                Campaign.Field.status: new_status
            })
            print(f"✅ Campanha {campaign_id} atualizada para {new_status}")
            return True
        except Exception as e:
            print(f"❌ Erro ao atualizar status da campanha: {e}")
            return False

    def update_budget(self, campaign_id, new_budget_brl):
        """
        Atualiza o orçamento diário.
        Recebe valor em Reais (ex: 50.00) e converte para Centavos pro Facebook.
        """
        try:
            campaign = Campaign(campaign_id)
            
            # Converte Reais para Centavos
            budget_cents = int(float(new_budget_brl) * 100)
            
            campaign.update({
                Campaign.Field.daily_budget: budget_cents
            })
            print(f"✅ Orçamento da campanha {campaign_id} atualizado para {budget_cents} cents")
            return True
        except Exception as e:
            print(f"❌ Erro ao atualizar orçamento: {e}")
            return False