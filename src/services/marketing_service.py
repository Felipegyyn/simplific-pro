import os
import time
from datetime import datetime, timedelta
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign

class MetaAdsService:
    def __init__(self):
        self.app_id = os.getenv('META_APP_ID')
        self.app_secret = os.getenv('META_APP_SECRET')
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('META_AD_ACCOUNT_ID')
        # ID do Pixel (Mantido para referência, mas usaremos Insights da Conta para o gráfico)
        self.pixel_id = '1112555667491819' 

        if self.app_id and self.access_token:
            try:
                FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
            except Exception as e:
                print(f"--- [META ADS] ERRO ao conectar: {e} ---")

    def get_account_insights(self):
        """Busca Saldo e Performance Diária (Gráfico)."""
        if not self.ad_account_id: return {}

        data = {
            'balance': 0.0,            # Valor Devido (Post-paid) ou Saldo (Pre-paid)
            'available_funds': 0.0,    # O que o usuário quer ver
            'currency': 'BRL',
            'daily_chart': []          # Dados para o gráfico
        }

        try:
            # 1. DADOS FINANCEIROS
            account = AdAccount(self.ad_account_id)
            account_data = account.api_get(fields=['balance', 'currency', 'spend_cap', 'amount_spent'])
            
            balance = float(account_data.get('balance', 0)) / 100
            spend_cap = float(account_data.get('spend_cap', 0)) / 100
            amount_spent = float(account_data.get('amount_spent', 0)) / 100

            data['balance'] = balance
            data['currency'] = account_data.get('currency', 'BRL')

            # Lógica para "Fundos Disponíveis":
            # Se tiver Limite definido (spend_cap > 0), o disponível é Limite - Gasto.
            # Se não tiver limite (0), assume-se conta Pós-paga ou Ilimitada, 
            # então mostramos o próprio balance como referência ou 0 se for dívida.
            # (Ajuste conforme seu tipo de conta: Pré ou Pós)
            if spend_cap > 0:
                data['available_funds'] = spend_cap - amount_spent
            else:
                # Se for pré-pago, o balance é o fundo disponível.
                # Se for pós-pago, isso é dívida. Vamos enviar o balance e tratar no front.
                data['available_funds'] = balance 

            # 2. GRÁFICO (INSIGHTS DIÁRIOS - INFALÍVEL)
            # Em vez de pixel stats, pegamos a performance real dos anúncios nos últimos 7 dias
            today = datetime.now()
            date_start = (today - timedelta(days=7)).strftime('%Y-%m-%d')
            date_end = today.strftime('%Y-%m-%d')

            params = {
                'time_range': {'since': date_start, 'until': date_end},
                'time_increment': 1, # Quebra por dia
                'level': 'account'
            }
            fields = ['spend', 'actions', 'clicks', 'date_start']
            
            insights = account.get_insights(fields=fields, params=params)
            
            chart_data = []
            for day in insights:
                # Processa as ações (Leads, Compras, Checkouts)
                actions = {a['action_type']: int(a['value']) for a in day.get('actions', [])}
                
                chart_data.append({
                    'name': datetime.strptime(day['date_start'], '%Y-%m-%d').strftime('%d/%m'),
                    'Clicks': int(day.get('clicks', 0)),
                    'Leads': actions.get('lead', 0),
                    'Purchases': actions.get('purchase', 0) + actions.get('offsite_conversion.fb_pixel_purchase', 0),
                    'InitiateCheckout': actions.get('initiate_checkout', 0)
                })
            
            # Ordena por data (o FB às vezes devolve desordenado)
            data['daily_chart'] = sorted(chart_data, key=lambda x: x['name'])

        except Exception as e:
            print(f"❌ Erro geral no Account Insights: {e}")
        
        return data

    def get_campaigns(self):
        # ... (MANTENHA O CÓDIGO DA FUNÇÃO GET_CAMPAIGNS IGUAL AO ANTERIOR) ...
        # (Vou resumir aqui para economizar espaço, mas você deve manter a lógica de buscar campanhas que já estava funcionando)
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

    # ... (MANTENHA TOGGLE E UPDATE_BUDGET IGUAIS) ...
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