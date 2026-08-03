// src/pages/Achievements.jsx

import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Trophy } from 'lucide-react';
import DynamicIcon from '../components/DynamicIcon'; // Importa nosso novo componente
import styles from './Achievements.module.css';

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
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle + " flex items-center gap-2"}>
             <Trophy className="text-yellow-500" /> Sala de Troféus
          </h1>
          <p className={styles.pageSubtitle}>
            Acompanhe seu progresso e as conquistas que você desbloqueou em sua jornada financeira!
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`${styles.premiumCard} ${ach.unlocked ? 'border-emerald-500/50 dark:border-emerald-400/50' : 'opacity-60 grayscale'}`}
          >
            <div className={`${styles.cardContent} flex flex-col items-center text-center p-6`}>
              <div className={`relative h-16 w-16 flex items-center justify-center rounded-full mb-4 ${ach.unlocked ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-slate-200 dark:bg-slate-800'}`}>
                <DynamicIcon 
                  name={ach.icon} 
                  className={`h-8 w-8 ${ach.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} 
                />
                {!ach.unlocked && (
                  <Lock className="absolute -bottom-1 -right-1 h-5 w-5 p-1 bg-white dark:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400" />
                )}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${ach.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {ach.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{ach.description}</p>
              
              {ach.unlocked && (
                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  Desbloqueado em {formatDate(ach.unlocked_at)}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;