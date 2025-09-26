// src/pages/Achievements.jsx

import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import DynamicIcon from '../components/DynamicIcon'; // Importa nosso novo componente

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await apiService.get('/api/gamification/achievements');
        setAchievements(data || []);
      } catch (err) {
        setError('Não foi possível carregar as conquistas. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Carregando Conquistas...</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-8 w-8 bg-gray-300 dark:bg-slate-700 rounded-full mx-auto"></div>
              </CardHeader>
              <CardContent className="text-center">
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-600 rounded mx-auto"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-50">Sala de Troféus</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-slate-400">
          Acompanhe seu progresso e as conquistas que você desbloqueou em sua jornada financeira!
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {achievements.map((ach) => (
          <Card 
            key={ach.id} 
            className={`transition-all duration-300 ${ach.unlocked ? 'border-green-500/50 dark:border-green-400/50 shadow-lg' : 'opacity-60 grayscale'}`}
          >
            <CardHeader className="items-center text-center">
              <div className={`relative h-16 w-16 flex items-center justify-center rounded-full mb-4 ${ach.unlocked ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-200 dark:bg-slate-700'}`}>
                <DynamicIcon 
                  name={ach.icon} 
                  className={`h-8 w-8 ${ach.unlocked ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`} 
                />
                {!ach.unlocked && (
                  <Lock className="absolute -bottom-1 -right-1 h-5 w-5 p-1 bg-white dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400" />
                )}
              </div>
              <CardTitle className={`text-lg ${ach.unlocked ? 'text-gray-900 dark:text-slate-50' : 'text-gray-600 dark:text-slate-400'}`}>
                {ach.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{ach.description}</p>
              {ach.unlocked && (
                <Badge variant="secondary" className="text-green-700 dark:text-green-300">
                  Desbloqueado em {formatDate(ach.unlocked_at)}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Achievements;