import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Loader2,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import apiService from '../services/api';
import { toast } from 'sonner';

const ConnectBankButton = ({ onSuccess, className = '', label = '+ Conectar Open Finance' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [cpf, setCpf] = useState('');
  const [popupWindow, setPopupWindow] = useState(null);
  const [statusData, setStatusData] = useState(null);

  const checkUserStatus = async () => {
    try {
      const res = await apiService.get('/api/klavi/status');
      setStatusData(res);
      if (res && res.cpf) {
        setCpf(res.cpf);
      }
    } catch (err) {
      // Silencioso se não carregado
    }
  };

  // 1. Carrega dados prévios do usuário
  useEffect(() => {
    checkUserStatus();

    // 2. Se a tela recarregou com retorno de sucesso do Klavi
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('klavi_status') === 'success') {
      toast.success('Instituição conectada com sucesso via Klavi Open Finance!');
      // Limpa a URL sem dar reload
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
      if (onSuccess) onSuccess();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkUserStatus();
    }
  }, [isOpen]);

  const handleCleanData = async () => {
    if (!window.confirm("Deseja realmente desconectar e remover todas as contas, cartões e lançamentos importados pelo Open Finance?")) {
      return;
    }
    setCleaning(true);
    try {
      await apiService.post('/api/klavi/clean-data');
      toast.success("Dados do Open Finance removidos com sucesso!");
      setStatusData(null);
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Erro ao limpar dados do Open Finance.");
    } finally {
      setCleaning(false);
    }
  };

  // Monitora o fechamento da janela de popup
  useEffect(() => {
    if (!popupWindow) return;

    const interval = setInterval(async () => {
      if (popupWindow.closed) {
        clearInterval(interval);
        setPopupWindow(null);
        setLoading(true);
        setStatusMessage('Sincronizando contas e extratos com o banco...');

        let attempts = 0;
        const maxAttempts = 6;
        const pollStatus = async () => {
          attempts++;
          try {
            const statusRes = await apiService.get('/api/klavi/status');
            if (statusRes && ((statusRes.accounts && statusRes.accounts.length > 0) || (statusRes.cards && statusRes.cards.length > 0))) {
              toast.success('Instituição e extratos sincronizados com sucesso!');
              setIsOpen(false);
              setLoading(false);
              setStatusMessage('');
              if (onSuccess) onSuccess(statusRes);
              return;
            }
          } catch (e) {
            console.error("Erro ao validar sincronização:", e);
          }

          if (attempts < maxAttempts) {
            setTimeout(pollStatus, 3000);
          } else {
            setLoading(false);
            setStatusMessage('');
            setIsOpen(false);
            if (onSuccess) onSuccess();
            else window.location.reload();
          }
        };

        pollStatus();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [popupWindow, onSuccess]);

  // Inicia a jornada Advanced Whitelabel
  const handleStartConnection = async () => {
    setLoading(true);
    setStatusMessage('Gerando ambiente seguro com a Klavi...');

    try {
      // 1. Chama a API do Simplific para criar o link session
      const currentUrl = window.location.href.split('?')[0];
      const redirectURL = `${currentUrl}?klavi_status=success`;

      const response = await apiService.post('/api/klavi/create-link', {
        redirectURL,
        cpf: cpf ? cpf.replace(/\D/g, '') : null
      });

      const linkURL = response?.linkURL || response?.data?.linkURL;

      if (!linkURL) {
        throw new Error('URL da sessão Klavi não foi retornada.');
      }

      setStatusMessage('Abrindo ambiente de autorização bancária...');

      // 2. Abre a URL Whitelabel em um popup centralizado
      const width = 580;
      const height = 740;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        linkURL,
        'KlaviOpenFinance',
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Se o navegador bloqueou popup, redireciona diretamente
        window.location.href = linkURL;
      } else {
        setPopupWindow(popup);
        setStatusMessage('Aguardando autorização no banco...');
      }

    } catch (error) {
      console.error('Erro ao iniciar conexão Klavi:', error);
      toast.error('Não foi possível iniciar a conexão Open Finance. Tente novamente.');
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className={`bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md flex items-center gap-2 ${className}`}
          >
            <Sparkles className="w-4 h-4 text-emerald-100 animate-pulse" />
            {label}
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[520px] bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs">
                Open Finance Oficial
              </Badge>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 bg-cyan-500/10 text-xs">
                Klavi Conecte
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              Conexão Automática de Bancos & Cartões
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm">
              Sincronize seus dados bancários em tempo real com a tecnologia Open Finance regulamentada pelo Banco Central do Brasil.
            </DialogDescription>
          </DialogHeader>

          {/* O QUE SERÁ IMPORTADO */}
          <div className="space-y-3 my-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Contas Correntes & Saldos</h4>
                <p className="text-xs text-slate-400">
                  Importa saldos consolidados e histórico de lançamentos do extrato com categorização automática inteligente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Cartões de Crédito & Faturas</h4>
                <p className="text-xs text-slate-400">
                  Lê faturas em aberto e fechadas, limites disponíveis e compras parceladas em tempo real.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <div className="p-2 rounded-md bg-amber-500/10 text-amber-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Empréstimos & Lançamentos Futuros</h4>
                <p className="text-xs text-slate-400">
                  Mapeia parcelas a vencer como lançamentos pendentes no fluxo de caixa e agenda de pagamentos.
                </p>
              </div>
            </div>
          </div>

          {/* CAMPO CPF (OPCIONAL/FACILITADOR) */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="cpf-klavi" className="text-xs text-slate-300">
              CPF do Titular da Conta (opcional para agilizar a busca):
            </Label>
            <Input
              id="cpf-klavi"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              disabled={loading}
            />
          </div>

          {/* BADGE DE SEGURANÇA */}
          <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Criptografia ponta a ponta. O Simplific Pro <strong>não tem acesso às suas senhas</strong> de banco.
            </span>
          </div>

          {/* PAINEL DE CONEXÕES ATIVAS / DESCONECTAR */}
          {statusData && (statusData.total_connected_accounts > 0 || statusData.total_connected_cards > 0) && (
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 flex items-center justify-between gap-2">
              <div className="text-xs text-rose-300">
                <span className="font-semibold">Conexões ativas:</span> {statusData.total_connected_accounts} conta(s), {statusData.total_connected_cards} cartão(ões).
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCleanData}
                disabled={cleaning || loading}
                className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                {cleaning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Desconectar & Limpar Dados
              </Button>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStartConnection}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{statusMessage || 'Processando...'}</span>
                </>
              ) : (
                <>
                  <span>Autorizar Conexão Segura</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConnectBankButton;
