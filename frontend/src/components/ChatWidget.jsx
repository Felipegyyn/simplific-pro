import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User as UserIcon, X, Minimize2 } from 'lucide-react';
import apiService from '../services/api';
import { cn } from "@/lib/utils";

const ChatWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Olá! Eu sou seu assistente financeiro Simplific. Como posso te ajudar hoje?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessageText = inputValue.trim();
    if (!userMessageText) return;

    const userMessage = { sender: 'user', text: userMessageText };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiService.post('/api/chat', {
        message: userMessageText
      });
      const aiMessage = { sender: 'ai', text: response.reply };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Erro ao comunicar com a IA:", error);
      const errorMessage = { sender: 'ai', text: 'Desculpe, tive um problema para me conectar. Tente novamente em instantes.' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[400px] h-[500px] max-h-[70vh] animate-in slide-in-from-bottom-5 duration-300">
      <Card className="h-full flex flex-col shadow-2xl border-white/10 glass-panel overflow-hidden">
        <CardHeader className="p-4 border-b border-white/5 bg-slate-900/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/20 p-1.5 rounded-lg border border-cyan-500/20">
              <Bot className="h-4 w-4 text-cyan-400" />
            </div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Simplific IA</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-white/5 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-slate-950/20">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'ai' && (
                  <div className="bg-slate-800 p-1.5 rounded-lg shrink-0 border border-white/5">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  message.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                )}>
                  {message.sender === 'ai' ? (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none break-words">
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>

                {message.sender === 'user' && (
                  <div className="bg-cyan-600/20 p-1.5 rounded-lg shrink-0 border border-cyan-600/20">
                    <UserIcon className="h-4 w-4 text-cyan-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <div className="bg-slate-800 p-1.5 rounded-lg border border-white/5">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-800 text-slate-200 rounded-tl-none border border-white/5">
                     <div className="flex items-center space-x-1 px-2 py-1">
                        <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                     </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Pergunte qualquer coisa..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white/5 border-white/10 focus:border-cyan-500/50 text-sm h-10"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()} 
              size="icon"
              className="h-10 w-10 bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-900/20"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatWidget;