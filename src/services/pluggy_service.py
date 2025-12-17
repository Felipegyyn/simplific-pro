import requests
import os
from datetime import datetime, timedelta

class PluggyService:
    def __init__(self):
        self.CLIENT_ID = os.getenv('PLUGGY_CLIENT_ID')
        self.CLIENT_SECRET = os.getenv('PLUGGY_CLIENT_SECRET')
        self.BASE_URL = 'https://api.pluggy.ai'
        self._api_key = None

    def _get_api_key(self):
        if self._api_key:
            return self._api_key
        
        url = f"{self.BASE_URL}/auth"
        payload = {
            "clientId": self.CLIENT_ID,
            "clientSecret": self.CLIENT_SECRET
        }
        response = requests.post(url, json=payload)
        response.raise_for_status()
        self._api_key = response.json()['apiKey']
        return self._api_key

    def create_connect_token(self, item_id=None):
        api_key = self._get_api_key()
        url = f"{self.BASE_URL}/connect_token"
        headers = {"X-API-KEY": api_key}
        payload = {}
        if item_id:
            payload['itemId'] = item_id
            
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()['accessToken']

    def fetch_accounts(self, item_id):
        api_key = self._get_api_key()
        url = f"{self.BASE_URL}/accounts?itemId={item_id}"
        headers = {"X-API-KEY": api_key}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()['results']
    
    # --- NOVO MÉTODO: Busca detalhes da conexão (Nome do Banco) ---
    def fetch_item(self, item_id):
        api_key = self._get_api_key()
        url = f"{self.BASE_URL}/items/{item_id}"
        headers = {"X-API-KEY": api_key}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()

    # --- ATUALIZADO: Busca apenas transações recentes ---
    def fetch_transactions(self, account_id):
        api_key = self._get_api_key()
        
        # Pega a data de 45 dias atrás (para garantir pegar a fatura aberta inteira)
        data_inicio = (datetime.now() - timedelta(days=45)).strftime('%Y-%m-%d')
        
        url = f"{self.BASE_URL}/transactions?accountId={account_id}&from={data_inicio}"
        headers = {"X-API-KEY": api_key}
        
        all_transactions = []
        page = 1
        
        while True:
            response = requests.get(f"{url}&page={page}", headers=headers)
            response.raise_for_status()
            data = response.json()
            results = data.get('results', [])
            
            if not results:
                break
                
            all_transactions.extend(results)
            page += 1
            
            if page > data.get('totalPages', 1):
                break
                
        return all_transactions