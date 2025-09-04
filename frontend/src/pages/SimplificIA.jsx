// src/pages/SimplificIA.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import logo from '../assets/LOGO.png';
import apiService from '../services/api';

const SimplificIA = () => {
  // Estado para guardar o histórico de mensagens
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Olá! Eu sou seu assistente financeiro Simplific. Como posso te ajudar hoje? Estou disponível 24 horas pode dia'
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
    <div className="p-4 sm:p-6 h-full flex flex-col" style={{maxHeight: 'calc(100vh - 80px)'}}>
      <div className="mb-6">
          <h1 className="text-2xl font-bold">Simplific IA</h1>
          <p className="text-gray-600 dark:text-gray-400">
              Converse com seu assistente para registrar despesas, consultar saldos e tirar dúvidas.
          </p>
      </div>
      
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Área de exibição das mensagens */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Ícone da IA */}
                {message.sender === 'ai' && (
                  <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
                
                {/* Balão da Mensagem */}
                <div className={`max-w-md p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  {/* ▼▼▼ COLE ESTE BLOCO NO LUGAR DA LINHA <p>...</p> ▼▼▼ */}
{
  message.sender === 'ai' ? (
    // Se a mensagem for da IA, usa o ReactMarkdown para formatar
    <ReactMarkdown className="prose dark:prose-invert text-sm">
      {message.text}
    </ReactMarkdown>
  ) : (
    // Se a mensagem for do usuário, continua usando um parágrafo normal
    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
  )
}
{/* ▲▲▲ FIM DO BLOCO ▲▲▲ */}
                </div>

                {/* Ícone do Usuário */}
                {message.sender === 'user' && (
                  <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full">
                    <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                )}
              </div>
            ))}
            {/* Indicador de "Digitando..." */}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full">
                    <Bot className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="max-w-md p-3 rounded-lg bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-bl-none">
                     <div className="flex items-center justify-center space-x-1">
                        <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                     </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de digitação da mensagem */}
          <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 border-t dark:border-slate-700 pt-4">
            <Input
              type="text"
              placeholder="Digite sua mensagem aqui..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplificIA;