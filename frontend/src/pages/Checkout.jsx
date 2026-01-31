import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, Mail, Phone } from 'lucide-react';

// Inicialização Única
initMercadoPago('APP_USR-24f00d18-dd10-431f-930c-e309aba17683', { locale: 'pt-BR' });

// --- COMPONENTE ISOLADO DO MERCADO PAGO ----
// Usamos memo() para que este componente NUNCA renderize novamente
// a menos que o preço mude. Isso resolve o erro 'removeChild'.
// --- ALTERAÇÃO 1: Adicionamos 'maxInstallments' nas props e na configuração ---
const PaymentBrick = memo(({ amount, maxInstallments, onSubmit, onError, onReady }) => {
  const initialization = {
    amount: amount,
    payer: { email: "cliente@simplificpro.com" },
  };

  const customization = {
    paymentMethods: { 
        minInstallments: 1, 
        maxInstallments: maxInstallments // <--- AGORA É DINÂMICO
    },
    visual: { 
      style: { theme: 'default' }, 
      hidePaymentButton: false 
    },
  };

  return (
    <div id="payment-brick-container">
       <CardPayment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
       />
    </div>
  );
}, (prevProps, nextProps) => {
    // Atualiza se o preço OU o número de parcelas mudar
    return prevProps.amount === nextProps.amount && prevProps.maxInstallments === nextProps.maxInstallments;
});

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAnnual = searchParams.get('plan') === 'annual';
  
  // --- ALTERAÇÃO 2: NOVOS VALORES ---
  const [amount] = useState(isAnnual ? 199.00 : 13.45);
  
  const planName = isAnnual 
    ? "Plano Anual (Parcele em até 12x)" 
    : "Plano Mensal - 1º mês por R$ 13,45 (depois R$ 29,90)";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  // Ref para acessar dados sem recriar funções
  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

// Funções de Callback (Estáveis)
  const onSubmit = useCallback(async (mpFormData) => {
    const currentData = formDataRef.current;
    
    if (!currentData.name || !currentData.email || !currentData.whatsapp) {
        alert("Por favor, preencha seus dados pessoais acima antes de pagar.");
        return Promise.reject(); 
    }

    // --- ALTERAÇÃO 3: Captura as parcelas escolhidas no Brick ---
    // Se o usuário não escolheu (ex: plano mensal), assume 1.
    const selectedInstallments = mpFormData.installments || 1;

    console.log("Iniciando pagamento...", { email: currentData.email, installments: selectedInstallments });

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('https://simplific-pro-backend.onrender.com/api/payment/process_subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            card_token: mpFormData.token,
            payer_data: currentData,
            plan_type: isAnnual ? 'annual' : 'monthly',
            installments: selectedInstallments // <--- ENVIANDO PARA O BACKEND
          }),
        });

        const data = await response.json();

        if (response.ok) {

          // --- RASTREAMENTO DA VENDA (GOL) ---
        if (window.fbq) {
          window.fbq('track', 'Purchase', {
            value: amount, // Usa o valor real (4.90 ou 198.90)
            currency: 'BRL',
            content_name: planName
          });
        }
          
          alert("Sucesso! Enviamos os dados de acesso para seu e-mail e contato cadastrado. Aproveite!");
          navigate('/login'); 
          resolve(); 
        } else {
          console.error("Erro Backend:", data);
          alert("Pagamento recusado: " + (data.error || "Verifique o cartão."));
          reject(); 
        }
      } catch (error) {
        console.error("Erro de Conexão:", error);
        alert("Não foi possível conectar ao servidor. Tente novamente em instantes.");
        reject(); 
      }
    });
  }, [isAnnual, navigate]);

  const onError = useCallback((error) => console.log("Erro Brick:", error), []);
  const onReady = useCallback(() => console.log("Brick Pronto"), []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Formulário */}
          <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
                <p className="text-gray-600">Preencha seus dados para criar sua conta.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2">Seus Dados</h3>
                <div className="space-y-3">
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" className="w-full p-3 border border-gray-300 rounded-lg" />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail" className="w-full p-3 border border-gray-300 rounded-lg" />
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="WhatsApp" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                   <span>Total:</span>
                   <span>R$ {amount.toFixed(2).replace('.', ',')}</span>
                </div>
                 <p className="text-sm text-gray-500 mt-2">{planName}</p>
             </div>
          </div>

          {/* Pagamento (Isolado) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium">
                <Lock size={18} /> Pagamento Seguro
            </div>
            
            {/* Componente Blindado */}
            <PaymentBrick 
                amount={amount}
                maxInstallments={isAnnual ? 12 : 1} // <--- ALTERAÇÃO 4: Lógica das parcelas
                onSubmit={onSubmit} 
                onError={onError} 
                onReady={onReady} 
            />
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} /> Ambiente Criptografado
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
