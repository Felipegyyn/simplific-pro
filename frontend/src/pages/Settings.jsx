import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
    });
  }, []);

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
    <div className="p-6 space-y-6">
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
    </div>
  );
};

export default Settings;