import os
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign

class MetaAdsService:
    def __init__(self):
        self.app_id = os.getenv('META_APP_ID')
        self.app_secret = os.getenv('META_APP_SECRET')
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('META_AD_ACCOUNT_ID')

        if self.app_id and self.access_token:
            try:
                FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
                print("--- [META ADS] Conexão iniciada. ---")
            except Exception as e:
                print(f"--- [META ADS] ERRO ao conectar: {e} ---")

    def get_campaigns(self):
        """Busca campanhas com métricas VITALÍCIAS e RESULTADOS (Leads/Vendas)."""
        if not self.ad_account_id: return []

        try:
            account = AdAccount(self.ad_account_id)
            fields = [
                Campaign.Field.name,
                Campaign.Field.status,
                Campaign.Field.daily_budget,
                Campaign.Field.lifetime_budget,
                Campaign.Field.id
            ]
            
            campaigns = account.get_campaigns(
                fields=fields, 
                params={
                    'limit': 50,
                    'effective_status': ['ACTIVE', 'PAUSED']
                }
            )
            
            results = []
            for camp in campaigns:
                # Busca insights VITALÍCIOS
                insights = camp.get_insights(
                    fields=['spend', 'cpc', 'cpm', 'actions', 'clicks', 'impressions'],
                    params={'date_preset': 'maximum'} 
                )
                
                spend = 0.0
                clicks = 0
                cpc = 0.0
                leads = 0
                purchases = 0
                
                if insights:
                    data = insights[0]
                    spend = float(data.get('spend', 0))
                    clicks = int(data.get('clicks', 0))
                    cpc = float(data.get('cpc', 0)) if 'cpc' in data else 0.0
                    
                    # --- LÓGICA DE RESULTADOS ---
                    # O Facebook retorna uma lista: [{'action_type': 'lead', 'value': '10'}, ...]
                    actions = data.get('actions', [])
                    if actions:
                        for action in actions:
                            tipo = action.get('action_type', '')
                            valor = int(action.get('value', 0))
                            
                            # Soma Leads (pode vir como 'lead' ou outros eventos personalizados de cadastro)
                            if 'lead' in tipo: 
                                leads += valor
                            
                            # Soma Compras (purchase, offsite_conversion.fb_pixel_purchase)
                            if 'purchase' in tipo:
                                purchases += valor

                # Tratamento de orçamento
                daily_budget_cents = camp.get('daily_budget')
                daily_budget_real = float(daily_budget_cents) / 100 if daily_budget_cents else 0

                results.append({
                    'id': camp['id'],
                    'name': camp['name'],
                    'status': camp['status'],
                    'daily_budget': daily_budget_real,
                    'total_spend': spend,
                    'clicks': clicks,
                    'cpc': cpc,
                    'leads': leads,          # <--- NOVO
                    'purchases': purchases   # <--- NOVO
                })
                
            return results

        except Exception as e:
            print(f"❌ Erro ao buscar campanhas Meta: {e}")
            return []

    def toggle_campaign_status(self, campaign_id, new_status):
        """
        CORREÇÃO: Usa api_update para forçar a mudança no servidor.
        """
        try:
            campaign = Campaign(campaign_id)
            # api_update envia um POST direto para a API
            campaign.api_update(params={
                Campaign.Field.status: new_status
            })
            print(f"✅ Campanha {campaign_id} atualizada via API para {new_status}")
            return True
        except Exception as e:
            print(f"❌ Erro CRÍTICO ao atualizar status da campanha {campaign_id}: {e}")
            # Aqui podemos ver se o erro é por causa de regras de negócio (ex: AdSet incompleto)
            return False

    def update_budget(self, campaign_id, new_budget_brl):
        """
        Atualiza o orçamento diário via api_update.
        """
        try:
            campaign = Campaign(campaign_id)
            budget_cents = int(float(new_budget_brl) * 100)
            
            campaign.api_update(params={
                Campaign.Field.daily_budget: budget_cents
            })
            print(f"✅ Orçamento da campanha {campaign_id} atualizado para {budget_cents} cents")
            return True
        except Exception as e:
            print(f"❌ Erro ao atualizar orçamento: {e}")
            return False