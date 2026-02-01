import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { CreditCard, AlertTriangle, Users } from 'lucide-react'; // Adicionei 'Users'

const Settings = () => {
  const navigate = useNavigate();
  
  // Estados do Titular
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Estados da Conta Compartilhada (NOVO)
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryWhatsapp, setSecondaryWhatsapp] = useState('');

  const [feedback, setFeedback] = useState('');
  
  const { theme, toggleTheme } = useTheme(); 
  const [responseFormat, setResponseFormat] = useState('text');

  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    // Busca os dados do usuário
    apiService.getCurrentUser().then(user => {
      setName(user.name || '');
      setWhatsapp(user.whatsapp || '');
      
      // Carrega dados secundários (NOVO)
      setSecondaryName(user.secondary_name || '');
      setSecondaryWhatsapp(user.secondary_whatsapp || '');
      
      setResponseFormat(user.preferred_response_format || 'text');
    });

    setLoadingSub(true);
    apiService.get('/api/payment/subscription_status')
      .then(data => {
        setSubscription(data);
      })
      .catch(err => console.error("Erro ao buscar assinatura:", err))
      .finally(() => setLoadingSub(false));
   
  }, []);

  const handlePreferenceChange = async (newFormat) => {
    setResponseFormat(newFormat);
    try {
      await apiService.put('/api/user/preference', {
        response_format: newFormat
      });
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      alert('Não foi possível salvar sua escolha. Tente novamente.');
    }
  };

  const handleSave = async () => {
    try {
      // Envia também os dados secundários (NOVO)
      await apiService.put('/api/profile', { 
        name, 
        whatsapp,
        secondary_name: secondaryName,
        secondary_whatsapp: secondaryWhatsapp
      });
      setFeedback('Dados salvos com sucesso!');
    } catch (error) {
      // Tratamento de erro específico para duplicidade de WhatsApp
      if (error.response && error.response.data && error.response.data.error) {
         setFeedback(error.response.data.error);
      } else {
         setFeedback('Erro ao salvar os dados.');
      }
    } finally {
      setTimeout(() => setFeedback(''), 5000);
    }
  };

  const handleCancelSubscription = async () => {
    const confirm = window.confirm("Tem certeza que deseja cancelar a renovação automática? Você continuará com acesso até o fim do período pago.");
    if (!confirm) return;

    try {
      const response = await apiService.post('/api/payment/cancel_subscription');
      alert(response.message || "Assinatura cancelada com sucesso.");
      setSubscription(prev => ({ ...prev, mp_status: 'cancelled' }));
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro ao cancelar assinatura. Tente novamente ou contate o suporte.");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      {/* CARD 1: PERFIL TITULAR */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Titular</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Principal</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: +5511999999999" />
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: CONTA COMPARTILHADA (NOVO) */}
      <Card className="border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Users className="w-5 h-5" />
            Conta Compartilhada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione uma segunda pessoa (cônjuge, sócio, etc.) para gerenciar esta conta pelo WhatsApp.
          </p>
          <div className="space-y-2">
            <Label htmlFor="sec_name">Nome do Segundo Responsável</Label>
            <Input 
                id="sec_name" 
                value={secondaryName} 
                onChange={(e) => setSecondaryName(e.target.value)} 
                placeholder="Nome da pessoa"
                className="bg-white dark:bg-slate-950"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sec_whatsapp">WhatsApp Adicional</Label>
            <Input 
                id="sec_whatsapp" 
                value={secondaryWhatsapp} 
                onChange={(e) => setSecondaryWhatsapp(e.target.value)} 
                placeholder="Ex: 5511988888888" 
                className="bg-white dark:bg-slate-950"
            />
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO SALVAR GERAL */}
      <div className="flex flex-col items-start gap-2">
        <Button onClick={handleSave} size="lg" className="w-full sm:w-auto">
            Salvar Todas as Alterações
        </Button>
        {feedback && (
            <p className={`text-sm font-medium ${feedback.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                {feedback}
            </p>
        )}
      </div>

      <div className="h-px bg-border my-6" />

      {/* CARD 3: APARÊNCIA */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-lg">
              Modo Escuro
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: PREFERÊNCIAS ASSISTENTE */}
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

      {/* CARD 5: ASSINATURA */}
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
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Status do Plano</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {subscription.mp_status === 'cancelled' ? 'Cancelado (Acesso Ativo)' : 'Ativo'}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    Válido até: {new Date(subscription.user_valid_until).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {subscription.mp_status !== 'cancelled' && subscription.next_payment_date && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-slate-800 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Próxima Cobrança</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      R$ {subscription.amount ? subscription.amount.toFixed(2).replace('.', ',') : '0,00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Data: {new Date(subscription.next_payment_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>

              {subscription.mp_status !== 'cancelled' && (
                <div className="border-t pt-4 dark:border-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Zona de Perigo
                      </p>
                      <p>Ao cancelar, você perde a renovação automática, mas mantém o acesso até o fim do ciclo.</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                    >
                      Cancelar Assinatura
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-gray-600 dark:text-gray-400">Você está utilizando o plano Gratuito.</p>
              <Button 
                onClick={() => navigate('/planos')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Fazer Upgrade para o PRO
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;