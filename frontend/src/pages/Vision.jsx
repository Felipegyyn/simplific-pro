import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowUp, Plus, Sun, Moon, RotateCcw, 
  Terminal, Sparkles, Check, FileText, ExternalLink
} from 'lucide-react';
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
  const [selectedMode, setSelectedMode] = useState('Computer'); // '>_ Computer'

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

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
      label: '🚀 Seja Pro', 
      isPro: true, 
      action: () => navigate('/planos') 
    },
    { 
      label: '📊 Balanço e gastos deste mês', 
      prompt: 'Como estão minhas finanças e meus gastos este mês?' 
    },
    { 
      label: '💳 Status dos cartões e fatura', 
      prompt: 'Como está a fatura e o limite dos meus cartões de crédito?' 
    },
    { 
      label: '🎯 Progresso das metas', 
      prompt: 'Como está o andamento das minhas metas financeiras?' 
    },
    { 
      label: '📅 Agenda e reuniões', 
      prompt: 'Quais são meus próximos compromissos e reuniões na agenda?' 
    },
    { 
      label: '🏨 Pesquisar hotéis em Gramado', 
      prompt: 'Pesquise opções de hotéis em Gramado com diárias e fotos' 
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
                        <VisionVisualRenderer visuals={msg.visuals} />
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

              {/* Pílula de modo/ferramenta (ex: >_ Computer / Vision) */}
              <button 
                type="button"
                className={styles.modeBadge}
                title="Modo de análise inteligente"
                onClick={() => setSelectedMode(prev => prev === 'Computer' ? 'Vision' : 'Computer')}
              >
                <Terminal size={12} />
                <span>{selectedMode}</span>
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

    </div>
  );
};

export default Vision;
