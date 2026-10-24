import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowUp, Plus, Sun, Moon, RotateCcw, 
  Terminal, Sparkles, Check
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
  const [selectedMode, setSelectedMode] = useState('Computer'); // '>_ Computer'

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

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

  // Enviar mensagem
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

    try {
      const response = await apiService.post('/api/chat', {
        message: text
      });

      const aiText = response?.reply || response?.data?.reply || 'Entendido. Estou processando sua análise financeira.';
      const visuals = response?.visuals || response?.data?.visuals || [];
      
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
                      <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {/* Renderizador de Gráficos e Widgets Explicativos */}
                      {msg.visuals && msg.visuals.length > 0 && (
                        <VisionVisualRenderer visuals={msg.visuals} />
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap m-0">{msg.text}</p>
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
            placeholder="Envie uma mensagem..."
            className={styles.textInput}
          />

          {/* Barra de Ações Interna */}
          <div className={styles.inputToolbar}>
            <div className={styles.toolbarLeft}>
              {/* Botão + */}
              <button 
                type="button" 
                className={styles.plusButton}
                title="Adicionar anexo ou comando"
                onClick={() => setInputValue(prev => prev ? `${prev} + ` : '+ ')}
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
