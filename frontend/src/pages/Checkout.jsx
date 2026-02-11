import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, User, CreditCard, MapPin, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

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
    : "Plano Mensal - Recorrente";

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

    // Payload para o Backend
    const payload = {
      plan_type: isAnnual ? 'yearly' : 'monthly',
      installments: parseInt(installments),
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
        alert("Sucesso! Acesso liberado. Verifique seu e-mail.");
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

  // Estilos comuns para inputs (Dark Theme)
  const inputClass = "w-full p-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all";

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-green-500 selection:text-black">
      <div className="bg-black/90 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="flex-grow container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          
          {/* ESQUERDA: DADOS PESSOAIS */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Finalizar Assinatura</h1>
              <p className="text-gray-400">Você está a um passo de organizar sua vida financeira.</p>
            </div>

            {/* RESUMO DO PLANO (DARK) */}
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-700"></div>
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-green-500 text-xs font-bold uppercase tracking-widest mb-1">Resumo do Pedido</p>
                        <h2 className="text-2xl font-bold text-white">{planName}</h2>
                    </div>
                    {isAnnual && <span className="bg-green-900/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">45% OFF</span>}
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Valor Total</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-gray-400 font-medium">R$</span>
                                <p className="text-4xl font-bold text-white tracking-tight">{totalAmount.toFixed(2).replace('.', ',')}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             {/* SELETOR DE PARCELAS */}
                             {isAnnual ? (
                                 <div className="flex flex-col items-end">
                                     <label className="text-xs text-green-500 font-bold mb-2 uppercase tracking-wide">Parcelamento</label>
                                     <div className="relative">
                                         <select 
                                            value={installments}
                                            onChange={(e) => setInstallments(e.target.value)}
                                            className="appearance-none bg-gray-950 text-white text-sm font-medium pl-4 pr-10 py-2.5 rounded-lg border border-gray-700 hover:border-green-500 cursor-pointer outline-none focus:ring-1 focus:ring-green-500 transition-all"
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
                                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                          </div>
                                     </div>
                                 </div>
                             ) : (
                                 <span className="text-gray-400 text-sm font-medium">Cobrança Mensal</span>
                             )}
                        </div>
                    </div>
                 </div>
               </div>
               {/* Background Glow */}
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            </div>

            {/* FORMULÁRIO DADOS PESSOAIS */}
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
              <h3 className="font-bold text-white border-b border-gray-800 pb-4 flex items-center gap-2">
                <User size={18} className="text-green-500"/> Dados do Titular
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">Nome Completo</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Ex: João da Silva" />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">E-mail</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="seu@email.com" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">CPF/CNPJ</label>
                    <input type="text" name="cpfCnpj" required maxLength="18" value={formData.cpfCnpj} onChange={handleInputChange} className={inputClass} placeholder="000.000.000-00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 ml-1">Celular</label>
                    <input type="tel" name="mobilePhone" required value={formData.mobilePhone} onChange={handleInputChange} className={inputClass} placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-white border-b border-gray-800 pb-4 pt-4 flex items-center gap-2">
                <MapPin size={18} className="text-green-500"/> Endereço
              </h3>
              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1 space-y-1">
                    <label className="text-xs text-gray-500 ml-1">CEP</label>
                    <input type="text" name="postalCode" required maxLength="9" value={formData.postalCode} onChange={handleInputChange} className={inputClass} placeholder="00000-000" />
                 </div>
                 <div className="col-span-2 space-y-1">
                    <label className="text-xs text-gray-500 ml-1">Número</label>
                    <input type="text" name="addressNumber" required value={formData.addressNumber} onChange={handleInputChange} className={inputClass} placeholder="Ex: 123" />
                 </div>
              </div>
            </div>
          </div>

          {/* DIREITA: CARTÃO DE CRÉDITO */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl h-fit sticky top-28">
              <div className="flex items-center gap-2 mb-8 text-white font-bold border-b border-gray-800 pb-4">
                <Lock size={18} className="text-green-500" /> Pagamento Seguro
              </div>

              <div className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Número do Cartão</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 text-gray-500" size={20}/>
                      <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" required maxLength="19" value={formData.cardNumber} onChange={handleInputChange} className={`${inputClass} pl-10 font-mono tracking-wide`} />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Nome Impresso</label>
                    <input type="text" name="cardHolderName" placeholder="COMO NO CARTAO" required value={formData.cardHolderName} onChange={handleInputChange} className={`${inputClass} uppercase`} />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Validade</label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                           <input type="text" name="cardExpiry" placeholder="MM/AA" required maxLength="5" value={formData.cardExpiry} onChange={handleExpiryChange} className={`${inputClass} pl-10 text-center`} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">CCV</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                           <input type="password" name="cardCcv" placeholder="123" required maxLength="4" value={formData.cardCcv} onChange={handleInputChange} className={`${inputClass} pl-10 text-center`} />
                        </div>
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-5 rounded-xl font-bold text-black text-lg mt-6 transition-all flex flex-col items-center justify-center shadow-lg hover:shadow-green-900/20 hover:-translate-y-1
                      ${loading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-green-500 hover:bg-green-400'}
                    `}
                 >
                    {loading ? (
                        <span>Processando...</span>
                    ) : (
                        <>
                            <span className="flex items-center gap-2">Pagar R$ {totalAmount.toFixed(2).replace('.', ',')} <ArrowRight size={18}/></span>
                            {installments > 1 && (
                                <span className="text-xs font-normal opacity-80 mt-0.5">
                                    em {installments}x de R$ {installmentValue.toFixed(2).replace('.', ',')}
                                </span>
                            )}
                        </>
                    )}
                 </button>

                 <div className="mt-6 border-t border-gray-800 pt-4 flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <ShieldCheck size={14} className="text-green-500"/> Ambiente Seguro 256-bit SSL
                    </div>
                    
                    {/* INFO ASAAS */}
                    <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Processado por</span>
                        {/* Logo Asaas (Texto estilizado simulando logo) */}
                        <div className="flex items-center gap-1 font-bold text-gray-400 text-sm tracking-tight">
                            <div className="w-3 h-3 bg-blue-900 rounded-sm"></div> asaas
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

        </form>
      </div>
      
      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default Checkout;