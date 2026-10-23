// src/pages/SimplificIA.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import logo from '../assets/LOGO.png';
import apiService from '../services/api';
import styles from './SimplificIA.module.css';

const SimplificIA = () => {
  // Estado para guardar o histórico de mensagens
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Olá! Eu sou seu assistente financeiro Simplific. Como posso te ajudar hoje? Estou disponível 24 horas por dia'
    }
  ]);
  // Estado para controlar o que o usuário está digitando
  const [inputValue, setInputValue] = useState('');
  // Estado para mostrar um indicador de "pensando..."
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null); // <-- Adicione esta linha

  // Este useEffect vai cuidar do auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]); // Roda sempre que uma mensagem nova chega

  // Lógica para enviar a mensagem (vamos preencher a seguir)
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();

    if (!userMessageText) return; // Não envia mensagens vazias

    // 1. Adiciona a mensagem do usuário na tela
    const userMessage = { sender: 'user', text: userMessageText };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue(''); // Limpa o campo de texto
    setIsLoading(true); // Ativa o indicador de "carregando"

    try {
      // 2. Envia a mensagem para o nosso novo endpoint no backend
      const response = await apiService.post('/api/chat', {
        message: userMessageText
        // Não precisamos enviar o histórico, o backend já gerencia a sessão!
      });

      // 3. Adiciona a resposta da IA na tela
      const aiMessage = { sender: 'ai', text: response.reply };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Erro ao comunicar com a IA:", error);
      const errorMessage = { sender: 'ai', text: 'Desculpe, tive um problema para me conectar. Tente novamente em instantes.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false); // Desativa o indicador de "carregando"
    }
  };

// Em src/pages/SimplificIA.jsx

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Simplific IA</h1>
        <p className={styles.pageSubtitle}>Assistente financeiro institucional para lançamentos, consultas e orientações.</p>
      </header>
      
      <div className={styles.chatCard}>
        {/* Área de exibição das mensagens */}
        <div className={styles.messageArea}>
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Ícone da IA */}
              {message.sender === 'ai' && (
                <div className={styles.avatarBox}>
                  <Bot size={15} />
                </div>
              )}
              
              {/* Balão da Mensagem */}
              <div className={message.sender === 'user' ? styles.userBubble : styles.aiBubble}>
                {message.sender === 'ai' ? (
                  <ReactMarkdown className="prose dark:prose-invert text-sm max-w-none">
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm whitespace-pre-wrap m-0">{message.text}</p>
                )}
              </div>

              {/* Ícone do Usuário */}
              {message.sender === 'user' && (
                <div className={styles.avatarBox}>
                  <UserIcon size={15} />
                </div>
              )}
            </div>
          ))}

          {/* Indicador de "Digitando..." */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className={styles.avatarBox}>
                <Bot size={15} />
              </div>
              <div className={styles.aiBubble}>
                <div className="flex items-center space-x-1.5 py-1">
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Área de digitação da mensagem */}
        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input
            type="text"
            placeholder="Pergunte ao assistente ou registre uma despesa..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className={styles.chatInput}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()} className={styles.sendBtn} title="Enviar">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SimplificIA;