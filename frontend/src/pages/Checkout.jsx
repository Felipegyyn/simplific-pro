import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, CreditCard, MapPin, Calendar, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAnnual = searchParams.get('plan') === 'annual';
  
  // Preço Base
  const totalAmount = isAnnual ? 199.90 : 29.90;
  
  // Estado para parcelas (Padrão 1x)
  const [installments, setInstallments] = useState(1);
  
  // Calcula valor da parcela atual
  const installmentValue = totalAmount / installments;

  // Se mudar de plano, reseta para 1x
  useEffect(() => {
    setInstallments(1);
  }, [isAnnual]);

  const planName = isAnnual 
    ? "Plano Anual (12 Meses)" 
    : "Plano Mensal - Assinatura Recorrente";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', cpfCnpj: '', mobilePhone: '', 
    postalCode: '', addressNumber: '',
    cardHolderName: '', cardNumber: '', cardExpiry: '', cardCcv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setFormData(prev => ({ ...prev, cardExpiry: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.cpfCnpj || !formData.cardNumber || !formData.cardCcv) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    const [expMonth, expYear] = formData.cardExpiry.split('/');
    if (!expMonth || !expYear || expMonth > 12) {
       alert("Data de validade inválida. Use MM/AA.");
       setLoading(false);
       return;
    }

    // Payload Atualizado: Envia o número de parcelas escolhido
    const payload = {
      plan_type: isAnnual ? 'yearly' : 'monthly',
      installments: parseInt(installments), // <--- NOVA VARIÁVEL ENVIADA
      payer: {
        name: formData.name,
        email: formData.email,
        cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
        mobilePhone: formData.mobilePhone.replace(/\D/g, ''),
        postalCode: formData.postalCode.replace(/\D/g, ''),
        addressNumber: formData.addressNumber
      },
      card: {
        holderName: formData.cardHolderName || formData.name,
        number: formData.cardNumber.replace(/\s/g, ''),
        expiryMonth: expMonth,
        expiryYear: `20${expYear}`,
        ccv: formData.cardCcv
      }
    };

    try {
      const response = await fetch('https://simplificpro-backend.onrender.com/api/payment/process_subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (window.fbq) window.fbq('track', 'Purchase', { value: totalAmount, currency: 'BRL' });
        alert("Sucesso! Pagamento aprovado. Verifique seu e-mail.");
        navigate('/login');
      } else {
        console.error("Erro Pagamento:", data);
        alert(`Pagamento recusado: ${data.detail || data.message || "Verifique os dados."}`);
      }
    } catch (error) {
      console.error("Erro Conexão:", error);
      alert("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* ESQUERDA: DADOS */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finalizar Assinatura</h1>
              <p className="text-gray-600">Preencha seus dados para liberar o acesso.</p>
            </div>

            {/* RESUMO DO PLANO */}
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Você escolheu o</p>
                 <h2 className="text-2xl font-bold mt-1">{planName}</h2>
                 
                 <div className="mt-4 pt-4 border-t border-blue-400">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-blue-200 text-sm">Valor Total</p>
                            <p className="text-3xl font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="text-right">
                             {/* SELETOR DE PARCELAS (Só aparece se for anual) */}
                             {isAnnual ? (
                                 <div className="flex flex-col items-end">
                                     <label className="text-xs text-blue-200 mb-1">Parcelamento:</label>
                                     <select 
                                        value={installments}
                                        onChange={(e) => setInstallments(e.target.value)}
                                        className="bg-blue-700 text-white text-sm font-bold p-2 rounded border border-blue-400 outline-none cursor-pointer"
                                     >
                                         <option value="1">À vista (1x)</option>
                                         <option value="2">2x de R$ {(totalAmount/2).toFixed(2)}</option>
                                         <option value="3">3x de R$ {(totalAmount/3).toFixed(2)}</option>
                                         <option value="4">4x de R$ {(totalAmount/4).toFixed(2)}</option>
                                         <option value="5">5x de R$ {(totalAmount/5).toFixed(2)}</option>
                                         <option value="6">6x de R$ {(totalAmount/6).toFixed(2)}</option>
                                         <option value="10">10x de R$ {(totalAmount/10).toFixed(2)}</option>
                                         <option value="12">12x de R$ {(totalAmount/12).toFixed(2)}</option>
                                     </select>
                                 </div>
                             ) : (
                                 <span className="bg-white text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                     Recorrente Mensal
                                 </span>
                             )}
                        </div>
                    </div>
                 </div>
               </div>
               <CheckCircle className="absolute -bottom-6 -right-6 text-blue-500 opacity-50" size={120} />
            </div>

            {/* FORMULÁRIO DE DADOS (Igual ao anterior) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <User size={18} className="text-blue-600"/> Dados do Titular
              </h3>
              
              <div className="grid gap-4">
                <input type="text" name="name" placeholder="Nome Completo" required value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
                <input type="email" name="email" placeholder="E-mail" required value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="cpfCnpj" placeholder="CPF/CNPJ" required maxLength="18" value={formData.cpfCnpj} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
                  <input type="tel" name="mobilePhone" placeholder="Celular (com DDD)" required value={formData.mobilePhone} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <h3 className="font-bold text-gray-800 border-b pb-2 pt-2 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600"/> Endereço
              </h3>
              <div className="grid grid-cols-3 gap-4">
                 <input type="text" name="postalCode" placeholder="CEP" required maxLength="9" value={formData.postalCode} onChange={handleInputChange} className="col-span-1 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
                  <input type="text" name="addressNumber" placeholder="Número" required value={formData.addressNumber} onChange={handleInputChange} className="col-span-2 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* DIREITA: CARTÃO */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-gray-700 font-medium border-b pb-4">
                <Lock size={18} className="text-green-600" /> Pagamento Seguro
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 ml-1">Número do Cartão</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                      <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" required maxLength="19" value={formData.cardNumber} onChange={handleInputChange} className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono" />
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-500 ml-1">Nome no Cartão</label>
                    <input type="text" name="cardHolderName" placeholder="COMO NO CARTAO" required value={formData.cardHolderName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1">Validade</label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                           <input type="text" name="cardExpiry" placeholder="MM/AA" required maxLength="5" value={formData.cardExpiry} onChange={handleExpiryChange} className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1">CCV</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                           <input type="password" name="cardCcv" placeholder="123" required maxLength="4" value={formData.cardCcv} onChange={handleInputChange} className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-center" />
                        </div>
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-white text-lg mt-4 transition-all flex flex-col items-center justify-center
                      ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'}
                    `}
                 >
                    {loading ? (
                        <span>Processando...</span>
                    ) : (
                        <>
                            <span>Pagar R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
                            {installments > 1 && (
                                <span className="text-xs font-normal opacity-90 mt-1">
                                    em {installments}x de R$ {installmentValue.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </>
                    )}
                 </button>

                 <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <ShieldCheck size={14} /> Ambiente Seguro • Criptografia SSL
                 </div>
              </div>
            </div>
          </div>

        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;