import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // <-- LINHA ADICIONADA
import apiService from '../services/api';
import { useTheme } from '../contexts/ThemeContext'; // 1. Importa o hook do tema

const Settings = () => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [feedback, setFeedback] = useState('');
  
  // 2. Usa o hook para pegar o tema atual e a função para trocá-lo
  const { theme, toggleTheme } = useTheme(); 

  useEffect(() => {
    // Busca os dados do usuário ao carregar a página
    apiService.getCurrentUser().then(user => {
      setName(user.name || '');
      setWhatsapp(user.whatsapp || '');
      setResponseFormat(user.preferred_response_format || 'text'); // Carrega a preferência salva
    });
  }, []);

  // ▼▼▼ COLE ESTA NOVA FUNÇÃO ABAIXO DO SEU useEffect ▼▼▼
  const handlePreferenceChange = async (newFormat) => {
    // Atualiza a tela imediatamente para uma experiência mais fluida
    setResponseFormat(newFormat);
    try {
      // Envia a alteração para a nossa nova rota na API
      await apiService.put('/api/user/preference', {
        response_format: newFormat
      });
      // Poderíamos adicionar um feedback de sucesso aqui se quiséssemos
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      // Em caso de erro, poderíamos reverter o estado e mostrar um alerta
      alert('Não foi possível salvar sua escolha. Tente novamente.');
    }
  };
  // ▲▲▲ FIM DA NOVA FUNÇÃO ▲▲▲

  const handleSave = async () => {
    try {
      await apiService.put('/api/profile', { name, whatsapp });
      setFeedback('Dados salvos com sucesso!');
    } catch (error) {
      setFeedback('Erro ao salvar os dados.');
    } finally {
      setTimeout(() => setFeedback(''), 3000); // Limpa o feedback após 3s
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nº do WhatsApp</Label>
            <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <Button onClick={handleSave}>Salvar Alterações</Button>
          {feedback && <p className="text-sm text-green-600 mt-2">{feedback}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-lg">
              Modo Escuro
            </Label>
            {/* 3. O Switch agora está conectado à lógica do tema */}
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>
      {/* ▼▼▼ COLE TODO ESTE NOVO CARD AQUI ▼▼▼ */}
    <Card>
      <CardHeader>
        <CardTitle>Preferências do Assistente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-base">Respostas no WhatsApp</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Escolha como você prefere receber as respostas do assistente Simplific.
          </p>
          <RadioGroup
            value={responseFormat}
            onValueChange={handlePreferenceChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="r_text" />
              <Label htmlFor="r_text">Receber por Texto</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="audio" id="r_audio" />
              <Label htmlFor="r_audio">Receber por Áudio</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
    {/* ▲▲▲ FIM DO NOVO CARD ▲▲▲ */}
    </div>
  );
};

export default Settings;