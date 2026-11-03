import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificando sua conta...');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      setStatus('error');
      setMessage('Nenhum token de verificação foi fornecido na URL.');
      return;
    }

    const verifyAccount = async () => {
      try {
        const response = await apiService.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.message || 'Sua conta foi verificada com sucesso!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Não foi possível verificar sua conta. O link pode ter expirado.');
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="verify-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }}>
                <h1 id="verify-heading" className="sp-h1">
                  <span className="sp-line"><span>Verificação</span></span>
                  <span className="sp-line"><span>de e-mail.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Validamos seu endereço de e-mail para liberar o acesso seguro ao Painel Vision e à integração com o Assessor IA no WhatsApp.
                </p>
              </div>

              <div style={{ gridColumn: '6 / span 7' }}>
                <div
                  data-ui="verify-email-card"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '18px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1e2621' }}>
                    <span style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4' }}>
                      Status da Ativação de Conta
                    </span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: status === 'error' ? '#fca5a5' : '#10b981'
                      }}
                    >
                      {status === 'loading' ? 'Validando Token...' : status === 'success' ? 'Verificado' : 'Token Inválido'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '17px', color: '#f3f6f4', lineHeight: 1.6 }}>
                    {message}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', paddingTop: '8px' }}>
                    <Link to="/login" className="sp-btn-primary">
                      <span>Ir para o Login</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link to="/contato" className="sp-btn-quiet">
                      <span>Precisa de ajuda? Fale conosco</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
