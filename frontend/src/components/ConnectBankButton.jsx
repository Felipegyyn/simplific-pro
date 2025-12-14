import React, { useState } from 'react';
import { PluggyConnect } from 'react-pluggy-connect';

const ConnectBankButton = () => {
  const [connectToken, setConnectToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 1. Busca o Token no seu Backend
  const handleStartConnection = async () => {
    setIsConnecting(true);
    try {
      // Pega o token do usuário logado (ajuste a chave se necessário, ex: 'auth_token')
      const userToken = localStorage.getItem('token'); 

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pluggy/create-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Envia o JWT para o backend saber quem é
        }
      });

      if (!response.ok) throw new Error('Erro ao obter token');

      const data = await response.json();
      setConnectToken(data.accessToken); // Salva o token da Pluggy
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao iniciar conexão. Tente novamente.");
      setIsConnecting(false);
    }
  };

  // 2. O que acontece quando o usuário termina de conectar no Widget
  const handleSuccess = (itemData) => {
    console.log("Sucesso! Item ID:", itemData.item.id);
    alert(`Conexão realizada com sucesso! ID: ${itemData.item.id}`);
    
    // AQUI VAMOS CHAMAR A ETAPA 6 (Sincronizar dados)
    // Por enquanto, só fecha o widget
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
      {/* Se já temos o token, mostramos o Widget (invisível ou pop-up) */}
      {connectToken ? (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true} // True para testes, False para produção
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={() => {
            setConnectToken(null);
            setIsConnecting(false);
          }}
        />
      ) : (
        /* Se não, mostramos o botão */
        <button 
          onClick={handleStartConnection}
          disabled={isConnecting}
          style={{
            backgroundColor: '#00D09C', // Verde Nubank/Pluggy
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