import os
import time
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.adspixel import AdsPixel

class MetaAdsService:
    def __init__(self):
        self.app_id = os.getenv('META_APP_ID')
        self.app_secret = os.getenv('META_APP_SECRET')
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('META_AD_ACCOUNT_ID')
        # ID do Pixel Mestre que você configurou
        self.pixel_id = '1112555667491819' 

        if self.app_id and self.access_token:
            try:
                FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
            except Exception as e:
                print(f"--- [META ADS] ERRO ao conectar: {e} ---")

    def get_account_insights(self):
        """Busca Saldo da Conta e Dados do Pixel."""
        if not self.ad_account_id: return {}

        data = {
            'balance': 0.0,
            'currency': 'BRL',
            'pixel_data': []
        }

        try:
            # 1. BUSCAR SALDO DA CONTA
            account = AdAccount(self.ad_account_id)
            account_data = account.api_get(fields=['balance', 'currency', 'amount_spent'])
            
            # O Facebook retorna o balance em centavos (ex: 1500 = R$ 15,00)
            # Em contas pós-pagas, 'balance' é o quanto você deve.
            # Em contas pré-pagas, a lógica varia, mas geralmente é saldo devedor.
            if 'balance' in account_data:
                data['balance'] = float(account_data['balance']) / 100
            
            data['currency'] = account_data.get('currency', 'BRL')

            # 2. BUSCAR DADOS DO PIXEL (Últimos 7 dias)
            # Nota: A API de Stats do Pixel nem sempre está disponível para todas as contas via API direta.
            # Se der erro, retornamos lista vazia para não quebrar o front.
            try:
                pixel = AdsPixel(self.pixel_id)
                # Buscamos estatísticas agregadas
                stats = pixel.get_stats(params={
                    'aggregation': 'event',
                    'start_time': int(time.time()) - (7 * 24 * 60 * 60), # 7 dias atrás
                    'end_time': int(time.time())
                })
                
                # A API retorna dados brutos, vamos tentar simplificar para o front
                # Se a API direta falhar ou vier vazia, o front vai mostrar zerado, mas não quebra.
                data['pixel_data'] = stats
                
            except Exception as e:
                print(f"⚠️ Erro ao buscar Pixel Stats: {e}")
                data['pixel_data'] = []

        except Exception as e:
            print(f"❌ Erro geral no Account Insights: {e}")
        
        return data

    def get_campaigns(self):
        """Busca campanhas (Código mantido da versão anterior)"""
        if not self.ad_account_id: return []
        try:
            account = AdAccount(self.ad_account_id)
            fields = [Campaign.Field.name, Campaign.Field.status, Campaign.Field.daily_budget, Campaign.Field.id]
            campaigns = account.get_campaigns(fields=fields, params={'limit': 50, 'effective_status': ['ACTIVE', 'PAUSED']})
            
            results = []
            for camp in campaigns:
                insights = camp.get_insights(fields=['spend', 'cpc', 'actions', 'clicks'], params={'date_preset': 'maximum'})
                
                spend, clicks, cpc, leads, purchases = 0.0, 0, 0.0, 0, 0
                
                if insights:
                    d = insights[0]
                    spend = float(d.get('spend', 0))
                    clicks = int(d.get('clicks', 0))
                    cpc = float(d.get('cpc', 0)) if 'cpc' in d else 0.0
                    actions = d.get('actions', [])
                    for action in actions:
                        if 'lead' in action.get('action_type', ''): leads += int(action.get('value', 0))
                        if 'purchase' in action.get('action_type', ''): purchases += int(action.get('value', 0))

                daily = float(camp.get('daily_budget')) / 100 if camp.get('daily_budget') else 0
                results.append({
                    'id': camp['id'], 'name': camp['name'], 'status': camp['status'],
                    'daily_budget': daily, 'total_spend': spend, 'clicks': clicks,
                    'cpc': cpc, 'leads': leads, 'purchases': purchases
                })
            return results
        except Exception as e:
            print(f"❌ Erro: {e}")
            return []

    def toggle_campaign_status(self, campaign_id, new_status):
        try:
            Campaign(campaign_id).api_update(params={Campaign.Field.status: new_status})
            return True
        except: return False

    def update_budget(self, campaign_id, new_budget):
        try:
            Campaign(campaign_id).api_update(params={Campaign.Field.daily_budget: int(float(new_budget)*100)})
            return True
        except: return False