import React, { useState, useMemo, useCallback } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, Mail, Phone } from 'lucide-react';

// --- FIX 1: Inicialização Global (Fora do Componente) ---
// Isso garante que o SDK carregue apenas uma vez na memória do navegador.
initMercadoPago('APP_USR-24f00d18-dd10-431f-930c-e309aba17683', { locale: 'pt-BR' });

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAnnual = searchParams.get('plan') === 'annual';

  const [amount] = useState(isAnnual ? 198.90 : 4.90);
  
  const planName = isAnnual 
    ? "Plano Anual" 
    : "Plano Mensal - 1º mês. 24,90 a partir do 2º mês";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const initialization = useMemo(() => ({
    amount: amount,
    payer: {
      email: "cliente_novo@simplificpro.com",
    },
  }), [amount]);

  const customization = useMemo(() => ({
    paymentMethods: { minInstallments: 1, maxInstallments: 1 },
    visual: { 
      style: { theme: 'default' }, 
      hidePaymentButton: false 
    },
  }), []);

  // --- FIX 2: Callbacks Memorizados ---
  // O uso de useCallback impede que essas funções sejam recriadas,
  // o que evita que o Brick do Mercado Pago "pense" que mudou algo e tente recarregar.
  
  const onSubmit = useCallback(async (mpFormData) => {
    // Validação
    if (!formData.name || !formData.email || !formData.whatsapp) {
        alert("Por favor, preencha seus dados pessoais (Nome, E-mail e WhatsApp) antes de pagar.");
        return Promise.reject(); 
    }

    return new Promise(async (resolve, reject) => {
      try {
        const { token } = mpFormData;
        console.log("Enviando pagamento...");

        // A URL deve bater exatamente com seu backend no Render
        const response = await fetch('https://simplific-pro-backend.onrender.com/api/payment/process_subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            card_token: token,
            payer_data: formData,
            plan_type: isAnnual ? 'annual' : 'monthly'
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Pagamento Aprovado! Enviamos os dados de acesso para seu e-mail.");
          navigate('/login'); 
          resolve(); 
        } else {
          console.error("Erro API:", data);
          alert("Erro ao processar pagamento: " + (data.error || "Verifique os dados do cartão."));
          reject(); 
        }
      } catch (error) {
        console.error("Erro Network:", error);
        // Se cair aqui, é 99% de chance de ser o Backend não atualizado (CORS)
        alert("Erro de conexão com o servidor. Verifique se o backend está online.");
        reject(); 
      }
    });
  }, [formData, isAnnual, navigate]); // Dependências controladas

  const onError = useCallback(async (error) => { 
      console.log("Erro MP Brick:", error); 
  }, []);

  const onReady = useCallback(async () => { 
      console.log("Brick pronto e carregado (Callback Único)"); 
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Coluna da Esquerda */}
          <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
                <p className="text-gray-600">Preencha seus dados para criar sua conta.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2">Seus Dados</h3>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><User size={16}/> Nome Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Como você quer ser chamado?" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Mail size={16}/> E-mail</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Seu melhor e-mail para login" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Phone size={16}/> WhatsApp</label>
                        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="(00) 00000-0000" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Resumo do Pedido</h3>
               <div className="flex justify-between items-center mb-2">
              <span>Assinatura Simplific Pro ({planName})</span>
             <span className="font-bold">R$ {amount.toFixed(2).replace('.', ',')}</span>
            </div>
              <div className="text-sm text-green-600 mb-4">
                {isAnnual ? "Renovação automática anual." : "Renovação automática mensal."} Cancele quando quiser.
                </div>
                <div className="flex justify-between items-center border-t pt-4 text-xl font-bold text-gray-900">
                    <span>Total Hoje:</span>
                    <span>R$ {amount.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
          </div>

          {/* Coluna da Direita */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium">
                <Lock size={18} /> Dados de Pagamento (Mercado Pago)
            </div>
            
            <div id="payment-brick-container">
                <CardPayment
                    initialization={initialization}
                    customization={customization}
                    onSubmit={onSubmit}
                    onReady={onReady}
                    onError={onError}
                />
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} /> Pagamento processado em ambiente seguro
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
