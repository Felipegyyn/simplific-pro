import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowUp, Plus, Sun, Moon, RotateCcw, 
  Sparkles, Check, FileText, ExternalLink,
  Landmark, ShieldCheck, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';
import SimplificMascot from '../components/SimplificMascot';
import VisionVisualRenderer from '../components/vision/VisionVisuals';
import apiService from '../services/api';
import styles from './Vision.module.css';

const Vision = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Nome do usuário para a saudação
  const userName = user?.name ? user.name.split(' ')[0] : 'Felipe';

  // Histórico de mensagens do chat
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processando...');

  // Estado do Modal de Conexão Direta Open Finance
  const [isOpenFinanceModalOpen, setIsOpenFinanceModalOpen] = useState(false);
  const [ofLoading, setOfLoading] = useState(false);
  const [ofStatusMessage, setOfStatusMessage] = useState('');
  const [ofCpf, setOfCpf] = useState(user?.cpf || '');
  const [ofPopupWindow, setOfPopupWindow] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Carrega CPF prévio para agilizar conexão
  useEffect(() => {
    const fetchKlaviCpf = async () => {
      try {
        const res = await apiService.get('/api/klavi/status');
        if (res?.cpf && !ofCpf) {
          setOfCpf(res.cpf);
        }
      } catch (e) {
        // Silencioso
      }
    };
    fetchKlaviCpf();
  }, []);

  // Monitora o popup da Klavi quando aberto pelo botão Open Finance
  useEffect(() => {
    if (!ofPopupWindow) return;

    const interval = setInterval(async () => {
      if (ofPopupWindow.closed) {
        clearInterval(interval);
        setOfPopupWindow(null);
        setOfLoading(true);
        setOfStatusMessage('Sincronizando contas e extratos com o banco...');

        let attempts = 0;
        const maxAttempts = 6;
        const pollVisionStatus = async () => {
          attempts++;
          try {
            const statusRes = await apiService.get('/api/klavi/status');
            const hasData = (statusRes?.accounts && statusRes.accounts.length > 0) || (statusRes?.cards && statusRes.cards.length > 0);
            if (hasData || attempts >= maxAttempts) {
              toast.success('Instituição bancária conectada com sucesso via Klavi Open Finance!');
              setIsOpenFinanceModalOpen(false);
              setOfLoading(false);
              setOfStatusMessage('');

              setMessages(prev => [
                ...prev,
                {
                  sender: 'ai',
                  text: '🎉 **Instituição conectada com sucesso!** Seus saldos, extratos e cartões foram sincronizados no Simplific Pro.',
                  visuals: [
                    {
                      type: 'open_finance',
                      data: {
                        has_connections: true,
                        total_institutions: (statusRes?.accounts?.length || 0) + (statusRes?.cards?.length || 0),
                        accounts: statusRes?.accounts || [],
                        cards: statusRes?.cards || [],
                        provider: 'Klavi Open Finance',
                        regulated_by: 'Banco Central do Brasil (BACEN)'
                      }
                    }
                  ]
                }
              ]);
              return;
            }
          } catch (e) {
            console.error("Erro ao validar sincronização no Vision:", e);
          }

          if (attempts < maxAttempts) {
            setTimeout(pollVisionStatus, 3000);
          } else {
            setOfLoading(false);
            setOfStatusMessage('');
            setIsOpenFinanceModalOpen(false);
          }
        };

        pollVisionStatus();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [ofPopupWindow]);

  const handleStartOpenFinance = async () => {
    setOfLoading(true);
    setOfStatusMessage('Iniciando ambiente seguro Klavi...');

    try {
      const currentUrl = window.location.href.split('?')[0];
      const redirectURL = `${currentUrl}?klavi_status=success`;

      const response = await apiService.post('/api/klavi/create-link', {
        redirectURL,
        cpf: ofCpf ? ofCpf.replace(/\D/g, '') : null
      });

      const linkURL = response?.linkURL || response?.data?.linkURL;
      if (!linkURL) {
        throw new Error('URL da sessão Klavi não retornada.');
      }

      setOfStatusMessage('Abrindo ambiente seguro do Open Finance...');
      const width = 580;
      const height = 740;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        linkURL,
        'KlaviOpenFinanceVision',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = linkURL;
      } else {
        setOfPopupWindow(popup);
        setOfStatusMessage('Aguardando autorização no seu banco...');
      }
    } catch (err) {
      console.error('Erro ao conectar Open Finance:', err);
      toast.error('Não foi possível iniciar o Open Finance. Tente novamente.');
      setOfLoading(false);
      setOfStatusMessage('');
    }
  };

  // Ajusta altura do textarea dinamicamente
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Upload e registro de comprovantes financeiros (Imagem ou PDF)
  const handleReceiptUpload = async (file) => {
    if (!file || isLoading) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      alert('Por favor, selecione um comprovante em formato de imagem (PNG, JPG, WebP) ou PDF.');
      return;
    }

    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    const userMessage = {
      sender: 'user',
      text: `🧾 Enviou um comprovante para registro: ${file.name}`,
      attachment: {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        previewUrl,
        isPdf
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingText('Lendo comprovante com IA e registrando lançamento...');

    try {
      const formData = new FormData();
      formData.append('comprovante', file);

      const response = await apiService.upload('/api/chat/upload-comprovante', formData);
      const aiText = response?.reply || response?.mensagem || 'Comprovante processado com sucesso.';
      const visuals = response?.visuals || [];

      setMessages(prev => [...prev, { sender: 'ai', text: aiText, visuals }]);
    } catch (error) {
      console.error('Erro ao enviar comprovante no Vision:', error);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: error?.message || 'Não consegui processar seu comprovante. Tente uma foto mais nítida ou em PDF.',
          visuals: []
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingText('Processando...');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleReceiptUpload(file);
    }
  };

  // Suporte a Colar imagem direto do Clipboard (Ctrl + V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleReceiptUpload(file);
          break;
        }
      }
    }
  };

  // Enviar mensagem de texto normal
  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputValue).trim();
    if (!text || isLoading) return;

    // Adiciona a mensagem do usuário
    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);
    setLoadingText('Pensando...');

    try {
      const response = await apiService.post('/api/chat', {
        message: text
      });

      const visuals = response?.visuals || response?.data?.visuals || [];
      const rawReply = response?.reply ?? response?.data?.reply;
      const aiText = rawReply !== undefined && rawReply !== null
        ? rawReply
        : (visuals.length > 0 ? '' : 'Entendido. Estou processando sua análise financeira.');
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiText, visuals }]);
    } catch (error) {
      console.error('Erro ao comunicar com a IA do Vision:', error);
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: 'Não consegui me conectar ao serviço no momento. Por favor, tente novamente em instantes.',
          visuals: []
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingText('Processando...');
    }
  };

  // Disparo com tecla Enter (sem Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset para a tela inicial
  const handleNewConversation = () => {
    setMessages([]);
    setInputValue('');
  };

  // Sugestões de pílulas inspiradas no Pierre + Finanças
  const suggestionPills = [
    { 
      label: 'Balanço e gastos deste mês', 
      prompt: 'Como estão minhas finanças e meus gastos este mês?' 
    },
    { 
      label: 'Status dos cartões e fatura', 
      prompt: 'Como está a fatura e o limite dos meus cartões de crédito?' 
    },
    { 
      label: 'Progresso das metas', 
      prompt: 'Como está o andamento das minhas metas financeiras?' 
    },
    { 
      label: 'Agenda e reuniões', 
      prompt: 'Quais são meus próximos compromissos e reuniões na agenda?' 
    },
    { 
      label: 'Pesquisar', 
      prompt: 'Quero fazer uma pesquisa na internet' 
    }
  ];

  return (
    <div className={`${styles.visionContainer} ${theme === 'dark' ? 'dark' : ''} bg-white dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100`}>
      
      {/* 1. Barra Superior Minimalista */}
      <header className={styles.topBar}>
        <div className={styles.brandPill}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Simplific Vision</span>
        </div>

        <div className={styles.topBarActions}>
          {/* Alternador de tema claro / escuro */}
          <button
            onClick={toggleTheme}
            className={styles.actionButton}
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>

          {/* Botão de nova conversa quando houver mensagens */}
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className={styles.actionButton}
              title="Nova conversa"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Área Central de Conteúdo */}
      <main className={styles.contentArea}>
        
        {/* ESTADO INICIAL (EXATAMENTE COMO O MODELO DO PIERRE) */}
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            {/* Nosso Mascote Simplific Pro no estilo de traço Pierre com óculos e reflexo */}
            <SimplificMascot size={78} />

            <h1 className={styles.greetingTitle}>
              Olá {userName}
            </h1>
            <p className={styles.greetingSubtitle}>
              Como eu posso te ajudar hoje?
            </p>
          </div>
        ) : (
          /* FLUXO DO CHAT QUANDO HÁ MENSAGENS */
          <div className={styles.messagesStream}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAi}
              >
                {msg.sender === 'ai' && (
                  <div className="flex-shrink-0 mt-1">
                    <SimplificMascot size={32} />
                  </div>
                )}
                
                <div className={msg.sender === 'user' ? styles.userBubble : styles.aiBubble}>
                  {msg.sender === 'ai' ? (
                    <div className="w-full">
                      {msg.text && msg.text.trim() !== '' && (
                        <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}

                      {/* Renderizador de Gráficos e Widgets Explicativos */}
                      {msg.visuals && msg.visuals.length > 0 && (
                        <VisionVisualRenderer visuals={msg.visuals} onSendMessage={handleSendMessage} />
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                      {msg.attachment && (
                        <div className="mt-2.5 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-900/60 p-2 max-w-xs shadow-sm">
                          {msg.attachment.previewUrl ? (
                            <img 
                              src={msg.attachment.previewUrl} 
                              alt={msg.attachment.name} 
                              className="w-full h-auto object-cover rounded max-h-48 mb-1.5 border border-zinc-200 dark:border-zinc-800" 
                            />
                          ) : (
                            <div className="flex items-center gap-2 py-1.5 px-1">
                              <FileText size={24} className="text-emerald-500 flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{msg.attachment.name}</span>
                                <span className="text-[10px] text-zinc-500 font-mono">{msg.attachment.size}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de Digitação do Mascote */}
            {isLoading && (
              <div className={styles.messageRowAi}>
                <div className="flex-shrink-0 mt-1">
                  <SimplificMascot size={32} />
                </div>
                <div className={styles.typingIndicator}>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <div className={styles.typingDot}></div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 font-medium animate-pulse">{loadingText}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </main>

      {/* 3. Área Inferior: Pílulas de Sugestão + Input Box Pierre */}
      <div className={styles.bottomContainer}>
        
        {/* Linha de pílulas horizontais */}
        <div className={styles.pillsRow}>
          {suggestionPills.map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (pill.action) {
                  pill.action();
                } else if (pill.prompt) {
                  handleSendMessage(pill.prompt);
                }
              }}
              className={`${styles.pillButton} ${pill.isPro ? styles.proPill : ''}`}
            >
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* Caixa de Input Arredondada (Chat Input Box) */}
        <div className={styles.chatInputBox}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Envie uma mensagem ou cole um comprovante (Ctrl + V)..."
            className={styles.textInput}
          />

          {/* Barra de Ações Interna */}
          <div className={styles.inputToolbar}>
            <div className={styles.toolbarLeft}>
              {/* Input Invisível para Upload de Comprovantes */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
              />

              {/* Botão + para Envio de Comprovantes de Pagamento */}
              <button 
                type="button" 
                className={styles.plusButton}
                title="Enviar comprovante de pagamento (Foto ou PDF)"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Plus size={18} />
              </button>

              {/* Botão de Atalho Open Finance (Abre conexão direta) */}
              <button 
                type="button" 
                className={styles.openFinanceToolButton}
                title="Conectar bancos e cartões via Open Finance (Klavi)"
                onClick={() => setIsOpenFinanceModalOpen(true)}
                disabled={isLoading}
              >
                <Landmark size={14} />
                <span className="hidden sm:inline">Open Finance</span>
              </button>


            </div>

            {/* Botão de envio (seta para cima) */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`${styles.sendButton} ${inputValue.trim() && !isLoading ? styles.sendButtonActive : ''}`}
              aria-label="Enviar mensagem"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Interativo de Conexão Open Finance acionado pelo botão na barra */}
      <Dialog open={isOpenFinanceModalOpen} onOpenChange={setIsOpenFinanceModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#0c0d0e] border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Landmark size={18} />
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 font-mono text-[10px]">
                Open Finance Oficial
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold">
              Conectar Instituição Bancária
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Ambiente seguro regulamentado pelo Banco Central do Brasil. Seus dados financeiros são lidos com total sigilo e criptografia de ponta a ponta.
            </DialogDescription>
          </DialogHeader>

          {ofLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {ofStatusMessage}
              </div>
              <p className="text-xs text-zinc-500 max-w-xs">
                Autorize o compartilhamento na janela aberta do seu banco. Ao concluir, o Simplific Pro sincronizará seus dados automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  O que será sincronizado no Simplific Pro:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-500 dark:text-zinc-400">
                  <li>Consultar saldos e extratos da sua conta corrente com categorização automática.</li>
                  <li>Importar despesas do cartão de crédito, faturas abertas e limites.</li>
                  <li>Identificar parcelas de empréstimos futuros como lançamentos pendentes.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="of-cpf-direct" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  CPF do titular (opcional — agiliza a localização da sua conta):
                </Label>
                <Input
                  id="of-cpf-direct"
                  type="text"
                  placeholder="000.000.000-00"
                  value={ofCpf}
                  onChange={(e) => setOfCpf(e.target.value)}
                  className="h-9 text-xs font-mono bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpenFinanceModalOpen(false)}
              disabled={ofLoading}
              className="text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleStartOpenFinance}
              disabled={ofLoading}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {ofLoading ? (
                <>
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Iniciar Conexão Segura'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vision;
