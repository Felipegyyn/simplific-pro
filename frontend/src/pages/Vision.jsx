import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, Sparkles } from 'lucide-react';

const Vision = ({ user, onLogout }) => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <PageHeader user={user} onLogout={onLogout} />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Eye size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Vision</h1>
            <p className="text-sm text-muted-foreground">
              Módulo de visão estratégica e inteligência visual.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-border/40 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Módulo Vision
          </CardTitle>
          <CardDescription>
            Ambiente inicial preparado para as novas funcionalidades de visão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Eye size={32} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Pronto para implementação</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              O submenu Vision foi conectado com sucesso à navegação do menu Início.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vision;
