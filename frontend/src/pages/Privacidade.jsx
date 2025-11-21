import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock } from 'lucide-react';

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-green-600"/> Política de Privacidade
        </h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-600">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                <Lock className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-green-800">Segurança de Ponta a Ponta</h3>
                    <p className="text-green-700 text-sm">Seus dados são 100% criptografados. Nem nossa equipe tem acesso às suas senhas ou dados bancários brutos.</p>
                </div>
            </div>
            
            <p><strong>1. Coleta de Dados:</strong> Coletamos apenas as informações necessárias para o funcionamento do sistema (nome, e-mail, telefone para WhatsApp e dados financeiros inseridos).</p>
            <p><strong>2. Uso das Informações:</strong> Seus dados são usados exclusivamente para gerar seus relatórios e dashboards. Não vendemos seus dados para terceiros.</p>
            <p><strong>3. Armazenamento:</strong> Utilizamos servidores seguros com backups diários e protocolos de segurança de nível bancário.</p>
            <p><strong>4. Seus Direitos:</strong> Você pode solicitar a exclusão completa dos seus dados a qualquer momento entrando em contato com nosso suporte.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacidade;