import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // <-- LINHA ADICIONADA
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext'; // 1. Importa o hook do tema
import { CreditCard, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // 2. Usa o hook para pegar o tema atual e a função para trocá-lo
  const { theme, toggleTheme } = useTheme(); 
  const [responseFormat, setResponseFormat] = useState('text'); // 'text' é o padrão inicial

  // ▼▼▼ NOVOS ESTADOS DA ASSINATURA ▼▼▼
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  // ▲▲▲ FIM NOVOS ESTADOS ▲▲▲

  useEffect(() => {
    // Busca os dados do usuário
    apiService.getCurrentUser().then(user => {
      setName(user.name || '');
      setWhatsapp(user.whatsapp || '');
      setResponseFormat(user.preferred_response_format || 'text');
    });

    // ▼▼▼ NOVA CHAMADA: BUSCAR ASSINATURA ▼▼▼
    setLoadingSub(true);
    apiService.get('/api/payment/subscription_status')
      .then(data => {
        setSubscription(data);
      })
      .catch(err => console.error("Erro ao buscar assinatura:", err))
      .finally(() => setLoadingSub(false));
    // ▲▲▲ FIM NOVA CHAMADA ▲▲▲
  }, []);

  useEffect(() => {
    // Busca os dados do usuário ao carregar a página
    apiService.getCurrentUser().then(user => {
      setName(user.name || '');
      setWhatsapp(user.whatsapp || '');
      setResponseFormat(user.preferred_response_format || 'text'); // Carrega a preferência salva
    });
  }, []);

  // ▼▼▼ COLE ESTA NOVA FUNÇÃO ABAIXO DO SEU useEffect ▼▼▼
  const handlePreferenceChange = async (newFormat) => {
    // Atualiza a tela imediatamente para uma experiência mais fluida
    setResponseFormat(newFormat);
    try {
      // Envia a alteração para a nossa nova rota na API
      await apiService.put('/api/user/preference', {
        response_format: newFormat
      });
      // Poderíamos adicionar um feedback de sucesso aqui se quiséssemos
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      // Em caso de erro, poderíamos reverter o estado e mostrar um alerta
      alert('Não foi possível salvar sua escolha. Tente novamente.');
    }
  };
  // ▲▲▲ FIM DA NOVA FUNÇÃO ▲▲▲

  const handleSave = async () => {
    try {
      await apiService.put('/api/profile', { name, whatsapp });
      setFeedback('Dados salvos com sucesso!');
    } catch (error) {
      setFeedback('Erro ao salvar os dados.');
    } finally {
      setTimeout(() => setFeedback(''), 3000); // Limpa o feedback após 3s
    }
  };

// ▼▼▼ COLE AQUI (ENTRE O handleSave E O return) ▼▼▼
  const handleCancelSubscription = async () => {
    // 1. Confirmação de segurança
    const confirm = window.confirm("Tem certeza que deseja cancelar a renovação automática? Você continuará com acesso até o fim do período pago.");
    if (!confirm) return;

    try {
      // 2. Chama a rota de cancelamento no backend
      const response = await apiService.post('/api/payment/cancel_subscription');
      
      alert(response.message || "Assinatura cancelada com sucesso.");
      
      // 3. Atualiza o visual para mostrar 'Cancelado' sem precisar dar F5
      setSubscription(prev => ({ ...prev, mp_status: 'cancelled' }));
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro ao cancelar assinatura. Tente novamente ou contate o suporte.");
    }
  };
  // ▲▲▲ FIM DO CÓDIGO COLADO ▲▲▲
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nº do WhatsApp</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <div className="pt-2">
            <Button onClick={handleSave}>Salvar Alterações</Button>
            {feedback && <p className="text-sm text-green-600 mt-4">{feedback}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-lg">
              Modo Escuro
            </Label>
            {/* 3. O Switch agora está conectado à lógica do tema */}
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      
      {/* ▼▼▼ COLE TODO ESTE NOVO CARD AQUI ▼▼▼ */}
    <Card>
      <CardHeader>
        <CardTitle>Preferências do Assistente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-base">Respostas no WhatsApp</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Escolha como você prefere receber as respostas do assistente Simplific.
          </p>
          <RadioGroup
            value={responseFormat}
            onValueChange={handlePreferenceChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="r_text" />
              <Label htmlFor="r_text">Receber por Texto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="audio" id="r_audio" />
              <Label htmlFor="r_audio">Receber por Áudio</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
    {/* ▲▲▲ FIM DO NOVO CARD ▲▲▲ */}


      {/* ▼▼▼ NOVO CARD: MINHA ASSINATURA ▼▼▼ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Minha Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSub ? (
            <p className="text-sm text-gray-500">Carregando informações da assinatura...</p>
          ) : subscription?.status === 'active' ? (
            <div className="space-y-6">
              
              {/* Status e Próxima Fatura */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Status do Plano</p>
                  <p className="text-2xl font-bold text-green-700">
                    {subscription.mp_status === 'cancelled' ? 'Cancelado (Acesso Ativo)' : 'Ativo'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Válido até: {new Date(subscription.user_valid_until).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {subscription.mp_status !== 'cancelled' && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Próxima Cobrança</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {subscription.amount ? subscription.amount.toFixed(2).replace('.', ',') : '0,00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Data: {new Date(subscription.next_payment_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {/* Botão de Cancelamento (Zona de Perigo) */}
              {subscription.mp_status !== 'cancelled' && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Zona de Perigo
                      </p>
                      <p>Ao cancelar, você perde a renovação automática, mas mantém o acesso até o fim do ciclo.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                    >
                      Cancelar Assinatura
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Caso não tenha assinatura ativa
            <div className="text-center py-6 space-y-3">
              <p className="text-gray-600">Você está utilizando o plano Gratuito.</p>
              <Button 
                onClick={() => window.location.href = '/planos'} // Ou navigate('/planos') se usar react-router
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Fazer Upgrade para o PRO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* ▲▲▲ FIM NOVO CARD ▲▲▲ */}
    </div>
  );
};

export default Settings;
