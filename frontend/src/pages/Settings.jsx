import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CreditCard, AlertTriangle, Users, User, Palette, Bot, Save, CheckCircle2, Mail 
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

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

    carregarAssinatura();
  }, []);

  const carregarAssinatura = () => {
    setLoadingSub(true);
    apiService.get('/api/payment/subscription_status')
      .then(data => setSubscription(data))
      .catch(err => console.error("Erro ao buscar assinatura:", err))
      .finally(() => setLoadingSub(false));
  };

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
    if (!window.confirm("Tem certeza que deseja cancelar a renovação automática? Seu acesso continuará apenas até o fim do ciclo atual.")) return;
    try {
      const response = await apiService.post('/api/payment/cancel_subscription');
      alert(response.message || "Assinatura cancelada.");
      carregarAssinatura(); // Recarrega status
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      const msg = error.response?.data?.error || "Erro ao cancelar assinatura.";
      alert(msg);
    }
  };
  
  return (
    <div className="bg-gray-50/50 dark:bg-slate-900 min-h-screen pb-20">
      
      <PageHeader user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minha Conta</h1>
            <p className="text-gray-500 text-sm mt-1">Gerencie seus dados pessoais e assinatura.</p>
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
          
          {/* COLUNA ESQUERDA (2/3): DADOS */}
          <div className="lg:col-span-2 space-y-6">
            
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

            <Card className="border-blue-100 bg-blue-50/30 dark:bg-blue-900/5 dark:border-blue-900/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-700 dark:bg-blue-900 dark:text-blue-300"><Users size={20} /></div>
                  <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Conta Compartilhada</CardTitle>
                </div>
                <CardDescription className="text-blue-700/80 dark:text-blue-300/70">
                  Adicione um sócio ou cônjuge para interagir com o Simplific.
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

            {/* SEÇÃO ASSINATURA (DESCOMENTADA E CORRIGIDA) */}
            <Card className="border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b bg-gray-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-gray-500" />
                  <CardTitle className="text-lg">Plano e Assinatura</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingSub ? (
                  <div className="h-20 flex items-center justify-center text-gray-400">Carregando informações...</div>
                ) : subscription?.status === 'ativo' ? (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Plano Atual</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Simplific PRO - {subscription.plan_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Próximo vencimento/validade: {new Date(subscription.valid_until).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                         <div className="flex flex-col items-end gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-8">
                               <Mail size={12} className="mr-2"/> Faturas via E-mail
                            </Button>
                         </div>
                      </div>
                    </div>

                    {/* LÓGICA DE STATUS DA ASSINATURA (NOVA) */}
                    {subscription.gateway === 'mercadopago' ? (
                      // CASO 1: CLIENTE LEGADO (MERCADO PAGO)
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full h-fit">
                             <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-1">
                              Atualização de Sistema
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 leading-relaxed">
                              Mudamos o formato da sua assinatura para melhorar a experiência. 
                              Você receberá um e-mail em breve com os próximos passos para migrar para o novo sistema.
                              Seu acesso continua normal.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : subscription.is_subscription ? (
                      // CASO 2: ASAAS MENSAL (Cancelável)
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                          <div className="text-sm text-red-800 dark:text-red-300">
                            <strong>Zona de Perigo:</strong> Cancelar a renovação encerrará cobranças futuras, mas você mantém o acesso até o fim do período atual.
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleCancelSubscription} className="shrink-0">
                          Cancelar Renovação
                        </Button>
                      </div>
                    ) : (
                      // CASO 3: ASAAS ANUAL (Pago/Parcelado)
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg p-4 flex items-center gap-3">
                         <CheckCircle2 className="text-green-600 shrink-0" size={20} />
                         <div className="text-sm text-green-800 dark:text-green-300">
                            <strong>Plano Anual Ativo:</strong> Seu plano anual está pago/parcelado. Você tem acesso garantido até {new Date(subscription.valid_until).toLocaleDateString('pt-BR')} sem novas cobranças.
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Você não possui uma assinatura ativa.</p>
                    <Button onClick={() => navigate('/planos')} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      Assinar Agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* COLUNA DIREITA (1/3): PREFS */}
          <div className="space-y-6">
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