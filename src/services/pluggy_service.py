import requests
import os
import json

class PluggyService:
    BASE_URL = "https://api.pluggy.ai"

    def __init__(self):
        self.client_id = os.getenv('PLUGGY_CLIENT_ID')
        self.client_secret = os.getenv('PLUGGY_CLIENT_SECRET')
        self.api_key = None

    def _get_api_key(self):
        """
        Autentica na Pluggy e pega a API Key temporária.
        """
        url = f"{self.BASE_URL}/auth"
        payload = {
            "clientId": self.client_id,
            "clientSecret": self.client_secret
        }
        headers = {"Content-Type": "application/json"}

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data['apiKey']
        except Exception as e:
            print(f"Erro ao autenticar na Pluggy: {e}")
            return None

    def create_connect_token(self, item_id=None):
        """
        Gera um token para abrir o Widget no Frontend.
        Se passar item_id, serve para editar uma conexão existente.
        """
        api_key = self._get_api_key()
        if not api_key:
            raise Exception("Falha na autenticação com a Pluggy")

        url = f"{self.BASE_URL}/connect_token"
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": api_key
        }
        
        # Se for atualização de conexão, enviamos o itemId
        payload = {"itemId": item_id} if item_id else {}

        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        return response.json()['accessToken']

    def fetch_accounts(self, item_id):
        """
        Busca as contas vinculadas a uma conexão (Item).
        """
        api_key = self._get_api_key()
        url = f"{self.BASE_URL}/accounts?itemId={item_id}"
        headers = {"X-API-KEY": api_key}
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()['results']

    
    def fetch_transactions(self, account_id):
        """
        Busca as transações de uma conta específica (Account ID).
        """
        api_key = self._get_api_key()
        # Busca transações dos últimos 90 dias (padrão)
        url = f"{self.BASE_URL}/transactions?accountId={account_id}&from=2024-01-01" 
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