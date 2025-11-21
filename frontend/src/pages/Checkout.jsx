import React, { useState, useEffect } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock } from 'lucide-react';

// INICIALIZA O MERCADO PAGO
// Substitua pela sua PUBLIC KEY (aquela que começa com APP_USR-...)
initMercadoPago('APP_USR-24f00d18-dd10-431f-930c-e309aba17683', { locale: 'pt-BR' });

const Checkout = () => {
  const navigate = useNavigate();
  const [amount] = useState(24.90); // Valor da assinatura
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('simplific_token');
    const user = localStorage.getItem('simplific_user');

    if (!token || !user) {
      // Se não estiver logado, manda para o login e salva que ele queria fazer checkout
      alert("Para sua segurança, faça login ou crie uma conta antes de assinar.");
      navigate('/login');
    } else {
      setUserToken(token);
    }
  }, [navigate]);

  const onSubmit = async (formData) => {
    // Callback chamado quando o usuário clica em "Pagar" no formulário do MP
    try {
      const { token } = formData; // O 'token' do cartão gerado pelo MP

      const response = await fetch('https://simplific-pro-backend.onrender.com/api/payment/process_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Envia o token de login para o backend saber quem é
        },
        body: JSON.stringify({
          card_token: token
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCESSO!
        alert("Pagamento Aprovado! Bem-vindo ao Simplific Pro Premium.");
        navigate('/dashboard'); // Redireciona para o painel
      } else {
        // ERRO DO BACKEND
        console.error(data);
        alert("Erro ao processar pagamento: " + (data.error || "Tente novamente."));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão. Verifique sua internet.");
    }
  };

  const onError = async (error) => {
    console.log(error);
  };

  const onReady = async () => {
    // O formulário carregou e está pronto
    console.log("Brick pronto");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Coluna da Esquerda: Resumo do Pedido */}
          <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
                <p className="text-gray-600">Você está a um passo de transformar sua vida financeira.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Resumo do Pedido</h3>
                <div className="flex justify-between items-center mb-2">
                    <span>Assinatura Simplific Pro (Mensal)</span>
                    <span className="font-bold">R$ 24,90</span>
                </div>
                <div className="text-sm text-green-600 mb-4">Renovação automática mensal. Cancele quando quiser.</div>
                
                <div className="flex justify-between items-center border-t pt-4 text-xl font-bold text-gray-900">
                    <span>Total Hoje:</span>
                    <span>R$ 24,90</span>
                </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 bg-green-50 p-4 rounded-xl border border-green-100">
                <ShieldCheck className="text-green-600 w-6 h-6" />
                <div>
                    <p className="font-bold text-green-800">Pagamento 100% Seguro</p>
                    <p>Seus dados são processados diretamente pelo Mercado Pago. Nós não armazenamos os números do seu cartão.</p>
                </div>
            </div>
          </div>

          {/* Coluna da Direita: Formulário do Mercado Pago */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium">
                <Lock size={18} /> Dados de Pagamento
            </div>
            
            {/* O COMPONENTE MÁGICO DO MERCADO PAGO */}
            <CardPayment
              initialization={{ amount: amount }}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
              customization={{
                paymentMethods: {
                  minInstallments: 1,
                  maxInstallments: 1, // Assinatura geralmente é 1x
                },
                visual: {
                  style: {
                    theme: 'default', // 'default', 'dark', 'bootstrap' or 'flat'
                  },
                  hidePaymentButton: false,
                },
              }}
            />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;