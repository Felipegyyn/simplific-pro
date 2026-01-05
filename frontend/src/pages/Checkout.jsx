import React, { useState, useMemo } from 'react'; // <--- IMPORTANTE: useMemo adicionado
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, Mail, Phone, Star } from 'lucide-react';

// INICIALIZA O MERCADO PAGO
initMercadoPago('APP_USR-24f00d18-dd10-431f-930c-e309aba17683', { locale: 'pt-BR' });

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAnnual = searchParams.get('plan') === 'annual';

  // Define o valor APENAS UMA VEZ
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

  // --- O PULO DO GATO (FIX PARA removeChild) ---
  // Usamos useMemo para criar essas configurações apenas UMA VEZ.
  // Assim, quando você digita no formulário, o React NÃO recarrega o Mercado Pago.
  const initialization = useMemo(() => ({
    amount: amount,
    payer: {
      email: "cliente_novo@simplificpro.com", // Email fixo para inicialização visual
    },
  }), [amount]); // Só recria se o PREÇO mudar

  const customization = useMemo(() => ({
    paymentMethods: { minInstallments: 1, maxInstallments: 1 },
    visual: { 
      style: { theme: 'default' }, 
      hidePaymentButton: false 
    },
  }), []);
  // ---------------------------------------------

  const onSubmit = async (mpFormData) => {
    if (!formData.name || !formData.email || !formData.whatsapp) {
        alert("Por favor, preencha seus dados pessoais (Nome, E-mail e WhatsApp) antes de pagar.");
        return; // Interrompe o envio se faltar dados
    }

    try {
      const { token } = mpFormData;

      console.log("Enviando pagamento...");

      const response = await fetch('https://simplific-pro-backend.onrender.com/api/payment/process_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          card_token: token,
          payer_data: formData, // Aqui vão os dados reais digitados pelo usuário
          plan_type: isAnnual ? 'annual' : 'monthly'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Pagamento Aprovado! Enviamos os dados de acesso para seu e-mail.");
        navigate('/login'); 
      } else {
        console.error("Erro API:", data);
        alert("Erro ao processar pagamento: " + (data.error || "Verifique os dados do cartão."));
      }
    } catch (error) {
      console.error("Erro Network:", error);
      alert("Erro de conexão com o servidor. Tente novamente.");
    }
  };

  const onError = async (error) => { console.log("Erro MP Brick:", error); };
  const onReady = async () => { console.log("Brick pronto"); };

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

          {/* Coluna da Direita: Pagamento */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium">
                <Lock size={18} /> Dados de Pagamento (Mercado Pago)
            </div>
            
            {/* Componente Blindado com useMemo */}
            {amount > 0 && (
              <CardPayment
                key={amount} 
                initialization={initialization} // Passando o objeto memorizado
                customization={customization}   // Passando o objeto memorizado
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
              />
            )}
            
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
