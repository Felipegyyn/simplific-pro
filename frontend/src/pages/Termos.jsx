import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Termos de Uso</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-600">
            <p><strong>1. Aceitação:</strong> Ao acessar e usar o Simplific Pro, você concorda com estes termos.</p>
            <p><strong>2. O Serviço:</strong> O Simplific Pro é uma ferramenta de gestão financeira pessoal e empresarial.</p>
            <p><strong>3. Responsabilidades:</strong> O usuário é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
            <p><strong>4. Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. O acesso permanecerá ativo até o fim do período pago.</p>
            <p><strong>5. Alterações:</strong> Reservamo-nos o direito de alterar estes termos mediante aviso prévio.</p>
            <p className="text-sm italic mt-8">Última atualização: Novembro de 2025.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Termos;