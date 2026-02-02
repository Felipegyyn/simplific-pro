import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const BusinessAccess = ({ user, onLogout }) => {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      {/* Reutilizamos o PageHeader para manter o padrão */}
      <PageHeader user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Card className="border-cyan-200 bg-cyan-50/50 dark:bg-cyan-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
              <Building2 className="h-6 w-6" />
              Simplific Empresas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Módulo Empresarial em construção. <br />
              Em breve você poderá gerenciar o fluxo de caixa da sua empresa separadamente da sua conta pessoal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessAccess;