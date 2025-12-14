import React, { useState } from 'react';
import { PluggyConnect } from 'react-pluggy-connect';
import apiService from '../services/api'; // <--- Importamos o seu serviço oficial

const ConnectBankButton = () => {
  const [connectToken, setConnectToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1. Busca o Token no seu Backend
  const handleStartConnection = async () => {
    setIsConnecting(true);
    try {
      // USAMOS O APISERVICE (Ele já injeta o token/cookie automaticamente)
      const response = await apiService.post('/api/pluggy/create-token', {});

      // O apiService geralmente retorna os dados direto (sem precisar de .json())
      // Se der erro, ele cai no catch.
      
      // Ajuste de segurança: Verifica se a resposta veio no formato { accessToken: ... }
      const token = response.accessToken || response.data?.accessToken;
      
      if (token) {
        setConnectToken(token);
      } else {
        throw new Error("Token não encontrado na resposta");
      }

    } catch (error) {
      console.error("Erro detalhado:", error);
      alert("Erro ao iniciar conexão. Tente fazer Logout e Login novamente.");
      setIsConnecting(false);
    }
  };

  const handleSuccess = (itemData) => {
    console.log("Sucesso! Item ID:", itemData.item.id);
    alert(`Conexão realizada com sucesso! ID: ${itemData.item.id}`);
    
    // Aqui vamos implementar a sincronização automática depois
    setConnectToken(null);
    setIsConnecting(false);
  };

  const handleError = (error) => {
    console.error("Erro no Widget:", error);
    setConnectToken(null);
    setIsConnecting(false);
  };

  return (
    <div>
      {connectToken ? (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={() => {
            setConnectToken(null);
            setIsConnecting(false);
          }}
        />
      ) : (
        <button 
          onClick={handleStartConnection}
          disabled={isConnecting}
          style={{
            backgroundColor: '#00D09C',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isConnecting ? 'Carregando...' : '+ Conectar Cartão Automático'}
        </button>
      )}
    </div>
  );
};

export default ConnectBankButton;