import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import apiService from '../services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './HomePage.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de recuperação não encontrado. Por favor, acesse novamente a partir do link enviado ao seu e-mail.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas informadas não conferem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await apiService.post('/api/auth/reset-password', {
        token,
        new_password: password
      });

      setMessage('Senha redefinida com sucesso! Redirecionando para o login em 5 segundos...');

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ocorreu um erro. O token pode ser inválido ou ter expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    backgroundColor: '#080a09',
    border: '1px solid #242e28',
    borderRadius: '4px',
    color: '#f3f6f4',
    fontSize: '14px',
    outline: 'none'
  };

  return (
    <div className="sp-home">
      <Navbar />

      <main>
        <section className="sp-hero" style={{ paddingBottom: '96px' }} aria-labelledby="reset-heading">
          <div className="sp-frame">
            <div className="sp-grid-12" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: '1 / span 5' }}>
                <h1 id="reset-heading" className="sp-h1">
                  <span className="sp-line"><span>Definir sua</span></span>
                  <span className="sp-line"><span>nova senha.</span></span>
                </h1>

                <p className="sp-hero-lead">
                  Escolha uma nova credencial segura com pelo menos 6 caracteres para acessar o Painel Vision do Simplific Pro.
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
                  data-ui="reset-password-form"
                  className="sp-ui-fragment"
                  style={{ padding: '28px', backgroundColor: '#0c100e', display: 'grid', gap: '18px' }}
                >
                  <div style={{ fontSize: '17px', fontWeight: 600, color: '#f3f6f4', paddingBottom: '10px', borderBottom: '1px solid #1e2621' }}>
                    Atualização de Credenciais
                  </div>

                  {error && (
                    <div
                      role="alert"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        backgroundColor: '#2a1215',
                        border: '1px solid #f87171',
                        color: '#fca5a5'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      role="status"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '4px',
                        backgroundColor: '#0d281e',
                        border: '1px solid #10b981',
                        color: '#10b981'
                      }}
                    >
                      {message}
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px', fontWeight: 500 }}>
                      Nova Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" style={{ display: 'block', color: '#d8e1dc', marginBottom: '6px', fontWeight: 500 }}>
                      Confirme a Nova Senha
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repita a nova senha"
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !token || Boolean(message)}
                      className="sp-btn-primary"
                      style={{ opacity: isLoading || !token || message ? 0.55 : 1 }}
                    >
                      <span>{isLoading ? 'Salvando nova senha...' : 'Redefinir Senha'}</span>
                      <ArrowRight size={15} />
                    </button>
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

export default ResetPassword;
