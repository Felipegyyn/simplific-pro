import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialAnnual = searchParams.get('plan') === 'annual';

  const [isAnnual, setIsAnnual] = useState(initialAnnual);
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    mobilePhone: '',
    postalCode: '',
    addressNumber: '',
    cardHolderName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCcv: ''
  });

  useEffect(() => {
    setIsAnnual(searchParams.get('plan') === 'annual');
  }, [location.search]);

  useEffect(() => {
    setInstallments(1);
  }, [isAnnual]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const totalAmount = isAnnual ? 199.90 : 29.90;
  const installmentValue = totalAmount / installments;
  const planName = isAnnual ? 'Plano Anual (12 Meses)' : 'Plano Mensal · Recorrente';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setFormData((prev) => ({ ...prev, cardExpiry: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    if (!termsAccepted) {
      setStatusMessage({
        type: 'error',
        text: 'Você precisa concordar com os Termos de Uso e Política de Privacidade para prosseguir.'
      });
      setLoading(false);
      return;
    }

    if (!formData.name || !formData.email || !formData.cpfCnpj || !formData.cardNumber || !formData.cardCcv) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor, preencha todos os campos obrigatórios.'
      });
      setLoading(false);
      return;
    }

    const [expMonth, expYear] = formData.cardExpiry.split('/');
    if (!expMonth || !expYear || Number(expMonth) > 12) {
      setStatusMessage({
        type: 'error',
        text: 'Data de validade inválida. Use o formato MM/AA.'
      });
      setLoading(false);
      return;
    }

    const payload = {
      plan_type: isAnnual ? 'yearly' : 'monthly',
      installments: parseInt(installments, 10),
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
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (window.fbq) window.fbq('track', 'Purchase', { value: totalAmount, currency: 'BRL' });
        setStatusMessage({
          type: 'success',
          text: 'Assinatura confirmada! Acesso liberado. Verifique seu e-mail.'
        });
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setStatusMessage({
          type: 'error',
          text: `Pagamento recusado: ${data.detail || data.message || 'Verifique os dados informados.'}`
        });
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Erro de comunicação com o servidor de pagamentos. Tente novamente em instantes.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    backgroundColor: '#080a09',
    border: '1px solid #242e28',
    borderRadius: '4px',
    color: '#f3f6f4',
    fontSize: '14px',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#d8e1dc',
    marginBottom: '6px'
  };

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="checkout-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              {/* Left Column: Summary & Plan Selector */}
              <div style={{ gridColumn: '1 / span 5' }}>
                <h1 id="checkout-heading" className="sp-h1">
                  <span className="sp-line"><span>Finalizar sua</span></span>
                  <span className="sp-line"><span>assinatura.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Você está a um passo de conectar o Assessor IA ao seu WhatsApp e liberar o Painel Vision completo com garantia incondicional de 7 dias.
                </p>

                <div
                  data-ui="checkout-summary-card"
                  className="sp-ui-fragment"
                  style={{ padding: '22px', backgroundColor: '#0c100e', marginTop: '24px' }}
                >
                  <div
                    role="group"
                    aria-label="Alternar ciclo de cobrança"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginBottom: '18px'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setIsAnnual(true)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: isAnnual ? '#10b981' : '#242e28',
                        backgroundColor: isAnnual ? '#10b981' : '#121714',
                        color: isAnnual ? '#05120c' : '#f3f6f4',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Plano Anual · -45% OFF
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAnnual(false)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: !isAnnual ? '#10b981' : '#242e28',
                        backgroundColor: !isAnnual ? '#10b981' : '#121714',
                        color: !isAnnual ? '#05120c' : '#f3f6f4',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Plano Mensal
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ color: '#10b981', fontWeight: 600 }}>Resumo do Pedido</div>
                      <div style={{ fontSize: '20px', fontWeight: 600, color: '#f3f6f4', marginTop: '4px' }}>
                        {planName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#a8b4ac' }}>Valor Total</div>
                      <div style={{ fontSize: '28px', fontWeight: 600, color: '#10b981' }}>
                        R$ {totalAmount.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>

                  {isAnnual && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e2621' }}>
                      <label htmlFor="checkout-installments" style={labelStyle}>
                        Opções de Parcelamento no Cartão
                      </label>
                      <select
                        id="checkout-installments"
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        style={fieldStyle}
                      >
                        <option value={1}>À vista (1x de R$ {totalAmount.toFixed(2).replace('.', ',')})</option>
                        <option value={2}>2x de R$ {(totalAmount / 2).toFixed(2).replace('.', ',')}</option>
                        <option value={3}>3x de R$ {(totalAmount / 3).toFixed(2).replace('.', ',')}</option>
                        <option value={4}>4x de R$ {(totalAmount / 4).toFixed(2).replace('.', ',')}</option>
                        <option value={5}>5x de R$ {(totalAmount / 5).toFixed(2).replace('.', ',')}</option>
                        <option value={6}>6x de R$ {(totalAmount / 6).toFixed(2).replace('.', ',')}</option>
                        <option value={10}>10x de R$ {(totalAmount / 10).toFixed(2).replace('.', ',')}</option>
                        <option value={12}>12x de R$ {(totalAmount / 12).toFixed(2).replace('.', ',')}</option>
                      </select>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #1e2621', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', color: '#a8b4ac' }}>
                    <span>Ambiente Seguro 256-bit SSL</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Processado por Asaas · 7 dias de garantia</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment & Holder Form */}
              <div style={{ gridColumn: '6 / span 7' }}>
                <form
                  onSubmit={handleSubmit}
                  data-ui="checkout-payment-form"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '20px' }}
                >
                  {statusMessage && (
                    <div
                      role="alert"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        backgroundColor: statusMessage.type === 'success' ? '#0d281e' : '#2a1215',
                        border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : '#f87171'}`,
                        color: statusMessage.type === 'success' ? '#10b981' : '#fca5a5',
                        fontWeight: 500
                      }}
                    >
                      {statusMessage.text}
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #1e2621' }}>
                      1. Dados do Titular e Endereço
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div>
                        <label htmlFor="chk-name" style={labelStyle}>Nome Completo</label>
                        <input
                          id="chk-name"
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ex: João da Silva"
                          style={fieldStyle}
                        />
                      </div>

                      <div>
                        <label htmlFor="chk-email" style={labelStyle}>E-mail de Acesso</label>
                        <input
                          id="chk-email"
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="seu@email.com"
                          style={fieldStyle}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <div>
                          <label htmlFor="chk-cpf" style={labelStyle}>CPF ou CNPJ</label>
                          <input
                            id="chk-cpf"
                            type="text"
                            name="cpfCnpj"
                            required
                            maxLength="18"
                            value={formData.cpfCnpj}
                            onChange={handleInputChange}
                            placeholder="000.000.000-00"
                            style={fieldStyle}
                          />
                        </div>
                        <div>
                          <label htmlFor="chk-phone" style={labelStyle}>Celular (WhatsApp)</label>
                          <input
                            id="chk-phone"
                            type="tel"
                            name="mobilePhone"
                            required
                            value={formData.mobilePhone}
                            onChange={handleInputChange}
                            placeholder="(11) 99999-9999"
                            style={fieldStyle}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label htmlFor="chk-cep" style={labelStyle}>CEP</label>
                          <input
                            id="chk-cep"
                            type="text"
                            name="postalCode"
                            required
                            maxLength="9"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                            style={fieldStyle}
                          />
                        </div>
                        <div>
                          <label htmlFor="chk-num" style={labelStyle}>Número da Residência</label>
                          <input
                            id="chk-num"
                            type="text"
                            name="addressNumber"
                            required
                            value={formData.addressNumber}
                            onChange={handleInputChange}
                            placeholder="Ex: 123"
                            style={fieldStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #1e2621' }}>
                      2. Dados do Cartão de Crédito
                    </div>

                    <div style={{ display: 'grid', gap: '14px' }}>
                      <div>
                        <label htmlFor="chk-card-num" style={labelStyle}>Número do Cartão</label>
                        <input
                          id="chk-card-num"
                          type="text"
                          name="cardNumber"
                          required
                          maxLength="19"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="0000 0000 0000 0000"
                          style={fieldStyle}
                        />
                      </div>

                      <div>
                        <label htmlFor="chk-card-holder" style={labelStyle}>Nome Impresso no Cartão</label>
                        <input
                          id="chk-card-holder"
                          type="text"
                          name="cardHolderName"
                          required
                          value={formData.cardHolderName}
                          onChange={handleInputChange}
                          placeholder="COMO NO CARTÃO"
                          style={fieldStyle}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label htmlFor="chk-expiry" style={labelStyle}>Validade (MM/AA)</label>
                          <input
                            id="chk-expiry"
                            type="text"
                            name="cardExpiry"
                            required
                            maxLength="5"
                            value={formData.cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/AA"
                            style={fieldStyle}
                          />
                        </div>
                        <div>
                          <label htmlFor="chk-ccv" style={labelStyle}>Código de Segurança (CCV)</label>
                          <input
                            id="chk-ccv"
                            type="password"
                            name="cardCcv"
                            required
                            maxLength="4"
                            value={formData.cardCcv}
                            onChange={handleInputChange}
                            placeholder="123"
                            style={fieldStyle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory LGPD & Terms Consent */}
                  <div
                    style={{
                      padding: '14px',
                      backgroundColor: '#111613',
                      border: '1px solid #1f2823',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={{ color: '#d8e1dc', lineHeight: 1.5, cursor: 'pointer' }}>
                      Li e concordo com os{' '}
                      <Link to="/termos" style={{ color: '#10b981', fontWeight: 600 }}>
                        Termos de Uso
                      </Link>{' '}
                      e a{' '}
                      <Link to="/privacidade" style={{ color: '#10b981', fontWeight: 600 }}>
                        Política de Privacidade
                      </Link>{' '}
                      do Simplific Pro, autorizando o tratamento dos meus dados para a prestação dos serviços.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !termsAccepted}
                    className="sp-btn-primary"
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      opacity: loading || !termsAccepted ? 0.55 : 1,
                      cursor: loading || !termsAccepted ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span>
                      {loading
                        ? 'Processando pagamento seguro...'
                        : `Pagar R$ ${totalAmount.toFixed(2).replace('.', ',')}${
                            installments > 1 ? ` (em ${installments}x de R$ ${installmentValue.toFixed(2).replace('.', ',')})` : ''
                          }`}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
