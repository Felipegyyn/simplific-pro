import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await apiService.post('/api/auth/forgot-password', { email });
      setMessage(
        'Se existir uma conta com este e-mail, um link de recuperação foi enviado. Por favor, verifique sua caixa de entrada e spam.'
      );
    } catch (error) {
      setMessage(
        'Se existir uma conta com este e-mail, um link de recuperação foi enviado. Por favor, verifique sua caixa de entrada e spam.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="forgot-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }}>
                <h1 id="forgot-heading" className="sp-h1">
                  <span className="sp-line"><span>Recuperar</span></span>
                  <span className="sp-line"><span>sua senha.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Informe o e-mail vinculado à sua conta do Simplific Pro para receber o link seguro de redefinição de credenciais.
                </p>

                <div style={{ marginTop: '24px' }}>
                  <Link to="/login" className="sp-btn-quiet">
                    <span>← Voltar para o Login</span>
                  </Link>
                </div>
              </div>

              <div style={{ gridColumn: '6 / span 7' }}>
                <form
                  onSubmit={handleSubmit}
                  data-ui="forgot-password-form"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '18px' }}
                >
                  <div style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', paddingBottom: '10px', borderBottom: '1px solid #1e2621' }}>
                    Solicitação de Redefinição de Senha
                  </div>

                  <div>
                    <label htmlFor="email" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px', fontWeight: 500 }}>
                      E-mail Cadastrado
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 14px',
                        backgroundColor: '#080a09',
                        border: '1px solid #242e28',
                        borderRadius: '4px',
                        color: '#f3f6f4',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {message && (
                    <div
                      role="status"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        backgroundColor: '#0d281e',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        lineHeight: 1.5
                      }}
                    >
                      {message}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button type="submit" disabled={isLoading} className="sp-btn-primary">
                      <span>{isLoading ? 'Enviando instruções...' : 'Enviar Link de Recuperação'}</span>
                      <ArrowRight size={15} />
                    </button>

                    <Link to="/contato" className="sp-btn-quiet">
                      <span>Precisa de suporte?</span>
                    </Link>
                  </div>
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

export default ForgotPassword;
