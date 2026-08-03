import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { 
  CreditCard, AlertTriangle, Users, User, Palette, Bot, Save, CheckCircle2, Mail 
} from 'lucide-react';
import styles from './Settings.module.css';

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
    <div className={styles.pageContainer}>
      
      {/* Header da Página */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            Configurações
          </h1>
          <p className={styles.pageSubtitle}>Gerencie seus dados pessoais, preferências e assinatura.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
             {feedback && (
                <span className={cn("text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-5 px-3 py-1.5 rounded-lg border", 
                  feedback.includes('Erro') ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2')}>
                  {!feedback.includes('Erro') && <CheckCircle2 size={14} />}
                  {feedback}
                </span>
             )}
             <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg shadow-cyan-900/20 px-6">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
             </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (2/3): DADOS */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className={`${styles.premiumCard} p-8 relative group`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 dark:bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-cyan-200 dark:group-hover:bg-cyan-500/10 transition-all duration-700"></div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
                    <User size={20} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Perfil do Titular</h3>
                    <p className="text-xs text-slate-500">Seus dados principais de acesso.</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome Completo</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-cyan-500/50 h-11 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp Principal</Label>
                <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55..." className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-cyan-500/50 h-11 text-slate-800 dark:text-slate-200" />
              </div>
            </div>
          </div>

          <div className={`${styles.premiumCard} p-8 bg-gradient-to-br from-blue-50 dark:from-blue-500/5 to-transparent relative group`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 dark:bg-blue-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-blue-200 dark:group-hover:bg-blue-500/10 transition-all duration-700"></div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 shadow-inner">
                    <Users size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Conta Compartilhada</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400/60 uppercase font-bold tracking-tighter">Adicione um sócio ou cônjuge ao Simplific.</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="sec_name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Segundo Nome</Label>
                <Input 
                  id="sec_name" 
                  value={secondaryName} 
                  onChange={(e) => setSecondaryName(e.target.value)} 
                  placeholder="Ex: Maria"
                  className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-blue-500/50 h-11 text-slate-800 dark:text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sec_whatsapp" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">WhatsApp Adicional</Label>
                <Input 
                  id="sec_whatsapp" 
                  value={secondaryWhatsapp} 
                  onChange={(e) => setSecondaryWhatsapp(e.target.value)} 
                  placeholder="+55..." 
                  className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-blue-500/50 h-11 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className={`${styles.premiumCard} p-0 overflow-hidden shadow-2xl relative`}>
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
            
            <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
                    <CreditCard size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Plano e Assinatura</h3>
                </div>
            </div>

            <div className="p-8 relative z-10">
              {loadingSub ? (
                <div className="h-32 flex flex-col items-center justify-center gap-4">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 dark:border-cyan-400"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sincronizando assinatura...</p>
                </div>
              ) : subscription?.status === 'ativo' ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 p-6 border border-slate-200 dark:border-white/10 rounded-2xl relative overflow-hidden bg-white dark:bg-transparent">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 dark:bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Plano Ativo</p>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                          Simplific PRO <span className="text-emerald-600 dark:text-emerald-400">/ {subscription.plan_type}</span>
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-3 uppercase tracking-wider">
                        Vencimento: <span className="text-slate-700 dark:text-slate-200">{new Date(subscription.valid_until).toLocaleDateString('pt-BR')}</span>
                      </p>
                    </div>
                    
                    <div className="relative z-10">
                       <Button variant="outline" size="sm" className="bg-white dark:bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest h-10 px-6 text-slate-700 dark:text-slate-200">
                          <Mail size={14} className="mr-2 text-cyan-600 dark:text-cyan-400"/> Faturas via E-mail
                       </Button>
                    </div>
                  </div>

                  {subscription.gateway === 'mercadopago' ? (
                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-6 flex gap-5">
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-xl h-fit border border-amber-200 dark:border-amber-500/10">
                           <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">Migração de Sistema</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            Estamos atualizando nosso ecossistema de pagamentos. Você receberá um convite exclusivo por e-mail para migrar para a nova infraestrutura. 
                            <span className="block mt-2 text-emerald-600 dark:text-emerald-400">Seu acesso continua 100% garantido.</span>
                          </p>
                        </div>
                    </div>
                  ) : subscription.is_subscription ? (
                    <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="flex gap-4">
                        <div className="p-3 bg-rose-100 dark:bg-rose-500/10 rounded-xl h-fit border border-rose-200 dark:border-rose-500/10">
                            <AlertTriangle className="text-rose-600 dark:text-rose-400" size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Renovação Automática</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                                O cancelamento encerra as cobranças futuras, mas você mantém todos os benefícios do Simplific Pro até o final do ciclo contratado.
                            </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleCancelSubscription} className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/10 h-10 px-6 shrink-0 border border-rose-200 dark:border-rose-500/20">
                        Cancelar Renovação
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex items-center gap-5">
                       <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/10">
                          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-1">Plano Anual Liquidado</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                             Sua assinatura anual foi processada. Acesso vitalício por este ciclo garantido até <span className="text-slate-800 dark:text-white font-bold">{new Date(subscription.valid_until).toLocaleDateString('pt-BR')}</span>.
                          </p>
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 shadow-2xl">
                      <CreditCard size={32} className="text-slate-500 dark:text-slate-400 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-widest text-xs italic">Nenhuma assinatura ativa encontrada.</p>
                  <Button onClick={() => navigate('/planos')} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black uppercase tracking-widest px-10 h-12 shadow-xl shadow-emerald-900/20 animate-pulse">
                    Assinar Agora
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (1/3): PREFS */}
        <div className="space-y-8">
          
          <div className={`${styles.premiumCard} p-8 relative group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-8">
                <Palette size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Visual e Interface</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/2 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                <Label htmlFor="dark-mode" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Dark Mode (V2.0)</Label>
                <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-cyan-600 dark:data-[state=checked]:bg-cyan-500" />
            </div>
          </div>

          <div className={`${styles.premiumCard} p-8 relative group`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 dark:bg-indigo-500/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            
            <div className="flex items-center gap-3 mb-6">
                <Bot size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white">Configuração da IA</h3>
            </div>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">Formato de Resposta</p>
            
            <RadioGroup value={responseFormat} onValueChange={handlePreferenceChange} className="space-y-4">
              <div 
                className={cn("flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden", 
                  responseFormat === 'text' 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-200 dark:ring-indigo-500/20" 
                    : "bg-white dark:bg-white/2 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5")}
                onClick={() => handlePreferenceChange('text')}
              >
                {responseFormat === 'text' && <div className="absolute left-0 inset-y-0 w-1 bg-indigo-600 dark:bg-indigo-500"></div>}
                <div className="flex flex-col gap-0.5">
                    <Label htmlFor="r_text" className="cursor-pointer font-bold text-slate-700 dark:text-slate-200">Texto</Label>
                    <span className="text-[10px] text-slate-500 font-medium">Processamento instantâneo</span>
                </div>
                <RadioGroupItem value="text" id="r_text" className="border-slate-300 dark:border-white/20 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 data-[state=checked]:text-indigo-600 dark:data-[state=checked]:text-indigo-500" />
              </div>

              <div 
                className={cn("flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden", 
                  responseFormat === 'audio' 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-200 dark:ring-indigo-500/20" 
                    : "bg-white dark:bg-white/2 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5")}
                onClick={() => handlePreferenceChange('audio')}
              >
                {responseFormat === 'audio' && <div className="absolute left-0 inset-y-0 w-1 bg-indigo-600 dark:bg-indigo-500"></div>}
                <div className="flex flex-col gap-0.5">
                    <Label htmlFor="r_audio" className="cursor-pointer font-bold text-slate-700 dark:text-slate-200">Áudio Voz</Label>
                    <span className="text-[10px] text-slate-500 font-medium">Interação mais natural</span>
                </div>
                <RadioGroupItem value="audio" id="r_audio" className="border-slate-300 dark:border-white/20 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 data-[state=checked]:text-indigo-600 dark:data-[state=checked]:text-indigo-500" />
              </div>
            </RadioGroup>
          </div>

          <div className="p-6 text-center opacity-40">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Simplific Pro Cloud © 2026</p>
             <p className="text-[8px] font-medium text-slate-600 mt-2 tracking-widest uppercase">Versão de Sistema 2.0.4-beta</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
