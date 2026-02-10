import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Opcional, se quiser abas
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CreditCard, AlertTriangle, Users, User, Palette, Bot, Save, CheckCircle2 
} from 'lucide-react';
import PageHeader from '@/components/PageHeader'; // Importe o PageHeader novo!

const Settings = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados do Titular
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Estados da Conta Compartilhada
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryWhatsapp, setSecondaryWhatsapp] = useState('');

  const [feedback, setFeedback] = useState('');
  const { theme, toggleTheme } = useTheme(); 
  const [responseFormat, setResponseFormat] = useState('text');

  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiService.getCurrentUser().then(userData => {
      setName(userData.name || '');
      setWhatsapp(userData.whatsapp || '');
      setSecondaryName(userData.secondary_name || '');
      setSecondaryWhatsapp(userData.secondary_whatsapp || '');
      setResponseFormat(userData.preferred_response_format || 'text');
    });

    setLoadingSub(true);
    apiService.get('/api/payment/subscription_status')
      .then(data => setSubscription(data))
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
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback('');
    try {
      await apiService.put('/api/profile', { 
        name, 
        whatsapp,
        secondary_name: secondaryName,
        secondary_whatsapp: secondaryWhatsapp
      });
      setFeedback('Dados salvos com sucesso!');
    } catch (error) {
      if (error.response?.data?.error) {
         setFeedback(error.response.data.error);
      } else {
         setFeedback('Erro ao salvar os dados.');
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar?")) return;
    try {
      const response = await apiService.post('/api/payment/cancel_subscription');
      alert(response.message || "Assinatura cancelada.");
      setSubscription(prev => ({ ...prev, mp_status: 'cancelled' }));
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro ao cancelar assinatura.");
    }
  };
  
  return (
    <div className="bg-gray-50/50 dark:bg-slate-900 min-h-screen pb-20">
      
      {/* Novo Cabeçalho Padrão */}
      <PageHeader user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Título e Botão de Salvar no Topo (Mobile Friendly) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie seus dados pessoais e preferências.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
             {feedback && (
                <span className={`text-sm font-medium animate-in fade-in slide-in-from-right-5 ${feedback.includes('Erro') ? 'text-red-600' : 'text-green-600 flex items-center gap-1'}`}>
                  {!feedback.includes('Erro') && <CheckCircle2 size={16} />}
                  {feedback}
                </span>
             )}
             <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
             </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA (2/3): DADOS DO PERFIL */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Seção Pessoal */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700"><User size={20} /></div>
                  <CardTitle className="text-lg">Perfil do Titular</CardTitle>
                </div>
                <CardDescription>Seus dados principais de acesso.</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-50/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Principal</Label>
                  <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55..." className="bg-gray-50/50" />
                </div>
              </CardContent>
            </Card>

            {/* Seção Conta Compartilhada */}
            <Card className="border-blue-100 bg-blue-50/30 dark:bg-blue-900/5 dark:border-blue-900/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700 dark:bg-blue-900 dark:text-blue-300"><Users size={20} /></div>
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Conta Compartilhada</CardTitle>
                </div>
                <CardDescription className="text-blue-700/80 dark:text-blue-300/70">
                  Adicione um sócio ou cônjuge para interagir com o bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sec_name" className="text-blue-900 dark:text-blue-200">Segundo Nome</Label>
                  <Input 
                    id="sec_name" 
                    value={secondaryName} 
                    onChange={(e) => setSecondaryName(e.target.value)} 
                    placeholder="Ex: Maria"
                    className="bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sec_whatsapp" className="text-blue-900 dark:text-blue-200">WhatsApp Adicional</Label>
                  <Input 
                    id="sec_whatsapp" 
                    value={secondaryWhatsapp} 
                    onChange={(e) => setSecondaryWhatsapp(e.target.value)} 
                    placeholder="+55..." 
                    className="bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção Assinatura - DESCOMENTAR DEPOIS */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-gray-500" />
                  <CardTitle className="text-lg">Plano e Assinatura</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingSub ? (
                  <div className="h-20 flex items-center justify-center text-gray-400">Carregando...</div>
                ) : subscription?.status === 'active' ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Status Atual</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${subscription.mp_status === 'cancelled' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {subscription.mp_status === 'cancelled' ? 'Cancelado (Acesso Liberado)' : 'Ativo - PRO'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Válido até: {new Date(subscription.user_valid_until).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      {subscription.mp_status !== 'cancelled' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Próxima Fatura</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            R$ {subscription.amount ? subscription.amount.toFixed(2).replace('.', ',') : '0,00'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(subscription.next_payment_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>

                    {subscription.mp_status !== 'cancelled' && (
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                          <div className="text-sm text-red-800 dark:text-red-300">
                            <strong>Zona de Perigo:</strong> Cancelar a renovação automática encerrará cobranças futuras, mas você mantém o acesso até o fim do ciclo.
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleCancelSubscription} className="shrink-0">
                          Cancelar Renovação
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Você está no plano Gratuito.</p>
                    <Button onClick={() => navigate('/planos')} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      Fazer Upgrade para PRO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* COLUNA DIREITA (1/3): PREFERÊNCIAS */}
          <div className="space-y-6">
            
            {/* Aparência */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Palette size={18} className="text-purple-600" />
                  <CardTitle className="text-base">Aparência</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-lg border">
                  <Label htmlFor="dark-mode" className="cursor-pointer">Modo Escuro</Label>
                  <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>

            {/* Preferências IA */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={18} className="text-indigo-600" />
                  <CardTitle className="text-base">Assistente Simplific</CardTitle>
                </div>
                <CardDescription className="text-xs">Como o bot deve responder?</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={responseFormat} onValueChange={handlePreferenceChange} className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${responseFormat === 'text' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                    <Label htmlFor="r_text" className="cursor-pointer flex-1 font-normal">Texto (Mais rápido)</Label>
                    <RadioGroupItem value="text" id="r_text" />
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${responseFormat === 'audio' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                    <Label htmlFor="r_audio" className="cursor-pointer flex-1 font-normal">Áudio (Mais natural)</Label>
                    <RadioGroupItem value="audio" id="r_audio" />
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;