import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

// Inicialização Única
initMercadoPago('APP_USR-24f00d18-dd10-431f-930c-e309aba17683', { locale: 'pt-BR' });

const PaymentBrick = memo(({ amount, maxInstallments, onSubmit, onError, onReady }) => {
  const initialization = {
    amount: amount,
    payer: { email: "cliente@simplificpro.com" },
  };

  const customization = {
    paymentMethods: { 
        minInstallments: 1, 
        maxInstallments: maxInstallments
    },
    visual: { 
      style: { theme: 'default' }, 
      hidePaymentButton: false 
    },
  };

  return (
    <div id="payment-brick-container">
       {maxInstallments > 1 && (
         <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-center">
            <span className="text-green-800 text-sm font-semibold">
               💳 Opção de parcelamento em até {maxInstallments}x disponível após o preechimento do número do cartão.
            </span>
         </div>
       )}

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
    return prevProps.amount === nextProps.amount && prevProps.maxInstallments === nextProps.maxInstallments;
});

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAnnual = searchParams.get('plan') === 'annual';
  
  const [amount] = useState(isAnnual ? 199.00 : 29.90);
  
  const planName = isAnnual 
    ? "Plano Anual (Parcele em até 12x)" 
    : "Plano Mensal - Assinatura (R$ 29,90)";

  // --- MUDANÇA 1: Estado expandido para CPF e Endereço ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '', // Novo
    zip_code: '', // Novo
    street_name: '', // Novo
    street_number: '', // Novo
    neighborhood: '', // Novo
    city: '', // Novo
    state: '' // Novo
  });

  const formDataRef = useRef(formData);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Função Auxiliar para buscar CEP (Opcional, mas melhora UX) ---
  const handleBlurCep = async (e) => {
      const cep = e.target.value.replace(/\D/g, '');
      if (cep.length === 8) {
          try {
              const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
              const data = await res.json();
              if (!data.erro) {
                  setFormData(prev => ({
                      ...prev,
                      street_name: data.logradouro,
                      neighborhood: data.bairro,
                      city: data.localidade,
                      state: data.uf
                  }));
              }
          } catch (error) {
              console.error("Erro CEP:", error);
          }
      }
  }

  const onSubmit = useCallback(async (mpFormData) => {
    const currentData = formDataRef.current;
    
    // Validação básica dos novos campos
    if (!currentData.name || !currentData.email || !currentData.cpf || !currentData.street_number || !currentData.zip_code) {
        alert("Por favor, preencha todos os dados pessoais e de endereço. O CPF e Endereço são obrigatórios para a segurança do pagamento.");
        return Promise.reject(); 
    }

    const selectedInstallments = mpFormData.installments || 1;

    console.log("Iniciando pagamento seguro...", { email: currentData.email });

    return new Promise(async (resolve, reject) => {
      try {
        // --- MUDANÇA 2: Payload estruturado para o novo Backend ---
        const payload = {
            card_token: mpFormData.token,
            device_id: mpFormData.deviceId, // O Brick gera isso automaticamente
            plan_type: isAnnual ? 'annual' : 'monthly',
            installments: selectedInstallments,
            payer_data: {
                name: currentData.name,
                email: currentData.email,
                whatsapp: currentData.whatsapp,
                cpf: currentData.cpf.replace(/\D/g, '') // Remove pontuação
            },
            address: {
                zip_code: currentData.zip_code.replace(/\D/g, ''),
                street_name: currentData.street_name,
                street_number: currentData.street_number,
                neighborhood: currentData.neighborhood,
                city: currentData.city,
                state: currentData.state
            }
        };

        const response = await fetch('https://simplificpro-backend.onrender.com/api/payment/process_subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(payload), // Envia o payload completo
        });

        const data = await response.json();

        if (response.ok) {
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: amount,
              currency: 'BRL',
              content_name: planName
            });
          }
          alert("Sucesso! Pagamento aprovado. Verifique seu e-mail.");
          navigate('/login'); 
          resolve(); 
        } else {
          console.error("Erro Backend:", data);
          // Mostra o detalhe do erro se houver
          alert("Pagamento recusado: " + (data.detail || data.error || "Verifique os dados do cartão."));
          reject(); 
        }
      } catch (error) {
        console.error("Erro de Conexão:", error);
        alert("Erro de comunicação. Tente novamente.");
        reject(); 
      }
    });
  }, [isAnnual, navigate, amount, planName]);

  const onError = useCallback((error) => console.log("Erro Brick:", error), []);
  const onReady = useCallback(() => console.log("Brick Pronto"), []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Formulário de Dados */}
          <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
                <p className="text-gray-600">Dados obrigatórios para emissão da nota e segurança.</p>
            </div>
            
            {/* MUDANÇA 3: Novos Inputs no HTML */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <User size={18}/> Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome Completo" className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="E-mail" className="w-full p-3 border border-gray-300 rounded-lg" required />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="WhatsApp (com DDD)" className="w-full p-3 border border-gray-300 rounded-lg" required />
                        <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} placeholder="CPF (Apenas números)" maxLength="14" className="w-full p-3 border border-gray-300 rounded-lg" required />
                    </div>
                </div>

                <h3 className="font-bold text-gray-800 border-b pb-2 pt-2 flex items-center gap-2">
                    <MapPin size={18}/> Endereço de Cobrança
                </h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <input type="text" name="zip_code" value={formData.zip_code} onChange={handleInputChange} onBlur={handleBlurCep} placeholder="CEP" maxLength="9" className="w-full p-3 border border-gray-300 rounded-lg col-span-1" required />
                        <input type="text" name="street_name" value={formData.street_name} onChange={handleInputChange} placeholder="Rua / Avenida" className="w-full p-3 border border-gray-300 rounded-lg col-span-2" required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="text" name="street_number" value={formData.street_number} onChange={handleInputChange} placeholder="Número" className="w-full p-3 border border-gray-300 rounded-lg col-span-1" required />
                        <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} placeholder="Bairro" className="w-full p-3 border border-gray-300 rounded-lg col-span-2" required />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Cidade" className="w-full p-3 border border-gray-300 rounded-lg col-span-2" required />
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="UF" maxLength="2" className="w-full p-3 border border-gray-300 rounded-lg col-span-1" required />
                    </div>
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
            
            <PaymentBrick 
                amount={amount}
                maxInstallments={isAnnual ? 12 : 1} 
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