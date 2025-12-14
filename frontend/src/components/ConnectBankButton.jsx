import React, { useState } from 'react';
import { PluggyConnect } from 'react-pluggy-connect';
import apiService from '../services/api'; 

const ConnectBankButton = () => {
  const [connectToken, setConnectToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // Para mostrar "Sincronizando..."

  // 1. Inicia o processo (Pede o Token)
  const handleStartConnection = async () => {
    setIsConnecting(true);
    setStatusMessage('Iniciando...');
    try {
      const response = await apiService.post('/api/pluggy/create-token', {});
      const token = response.accessToken || response.data?.accessToken;
      
      if (token) {
        setConnectToken(token);
        setStatusMessage('');
      } else {
        throw new Error("Token não veio");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao iniciar. Tente novamente.");
      setIsConnecting(false);
    }
  };

  // 2. O usuário conectou com sucesso! Agora vamos sincronizar.
  const handleSuccess = async (itemData) => {
    console.log("Conexão feita! ID:", itemData.item.id);
    setConnectToken(null); // Fecha o widget visualmente
    setIsConnecting(true); // Mantém o botão em loading
    setStatusMessage('Sincronizando dados...');

    try {
      // CHAMA A ROTA MÁGICA DE SINCRONIZAÇÃO
      await apiService.post('/api/pluggy/sync', { 
        itemId: itemData.item.id 
      });

      alert(`Sucesso! Seus dados foram importados.`);
      
      // Recarrega a página para aparecer o cartão novo
      window.location.reload();

    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Conexão feita, mas houve um erro ao baixar as transações. Tente novamente mais tarde.");
    } finally {
      setIsConnecting(false);
      setStatusMessage('');
    }
  };

  const handleError = (error) => {
    console.error("Erro no Widget:", error);
    setConnectToken(null);
    setIsConnecting(false);
    alert("Erro na conexão com o banco.");
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
            backgroundColor: isConnecting ? '#ccc' : '#00D09C',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: isConnecting ? 'wait' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isConnecting ? (statusMessage || 'Carregando...') : '+ Conectar Cartão Automático'}
        </button>
      )}
    </div>
  );
};

export default ConnectBankButton;