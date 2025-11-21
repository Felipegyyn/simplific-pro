import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageCircle } from 'lucide-react';

const Contato = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Fale Conosco</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <Mail size={32} />
            </div>
            <h2 className="text-xl font-bold mb-4">Atendimento via E-mail</h2>
            <p className="text-gray-600 mb-6">
                Tem alguma dúvida, sugestão ou precisa de ajuda técnica? Nossa equipe está pronta para te atender.
            </p>
            <a 
                href="mailto:contato@simplificpro.com" 
                className="text-2xl font-bold text-green-600 hover:text-green-700 hover:underline transition-all"
            >
                contato@simplificpro.com
            </a>
            <p className="text-sm text-gray-400 mt-8">
                Tempo médio de resposta: 24 horas úteis.
            </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contato;