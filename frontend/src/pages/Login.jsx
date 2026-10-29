import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '../assets/LOGO.png';
import SimplificMascot from '../components/SimplificMascot';
import apiService from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
  // Controle de Tabs: 'login' (01 ENTRAR) ou 'register' (02 CADASTRAR)
  const [activeTab, setActiveTab] = useState('login');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Estados Form Login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Estados Form Register (7 dias grátis)
  const [registerData, setRegisterData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    password: ''
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  // Efeito reativo do Mascote na digitação
  const [ripples, setRipples] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Estados para troca de senha no 1º acesso
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  // Canvas de fundo com poeira estelar sutil
  const starsCanvasRef = useRef(null);

  // Trigger para a reação do mascote na digitação
  const triggerMascotReaction = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 350);

    const newRipple = { id: Date.now() + Math.random() };
    setRipples((prev) => [...prev.slice(-2), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1600);
  };

  // Efeito sutil de estrelas no fundo (substituindo o antigo sky do planeta com elegância)
  useEffect(() => {
    const canvas = starsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.008 + 0.003
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.alpha += Math.sin(Date.now() * star.speed) * 0.01;
        const boundedAlpha = Math.max(0.1, Math.min(0.85, star.alpha));
        ctx.fillStyle = `rgba(240, 245, 255, ${boundedAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Handlers Login
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
    triggerMascotReaction();
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiService.login(loginData.email, loginData.password);

      if (data.user && data.user.first_login) {
        setTempPassword(loginData.password);
        setIsChangePasswordModalOpen(true);
      } else if (onLogin) {
        onLogin(data.user);
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      if (err.response && err.response.status === 403) {
        setError(err.response.data.error || 'Acesso suspenso ou não autorizado.');
      } else {
        setError(
          err.response?.data?.error ||
          'Acesso negado. Verifique suas credenciais ou contate o suporte: contato@simplificpro.com'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers Register (7 dias grátis)
  const handleRegisterChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'whatsapp') {
      value = value.replace(/\D/g, '');
    }
    setRegisterData({ ...registerData, [e.target.name]: value });
    setError('');
    triggerMascotReaction();
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.post('/api/auth/register', registerData);
      setRegisterSuccess(true);
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError(err.response?.data?.error || 'Erro ao realizar o cadastro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Troca de senha no 1º acesso
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangePasswordError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setChangePasswordError('');

    try {
      await apiService.post('/api/auth/change-password', {
        current_password: tempPassword,
        new_password: newPassword
      });
      alert('Senha alterada com sucesso! Faça login novamente com sua nova senha.');
      apiService.logout();
      window.location.reload();
    } catch (err) {
      setChangePasswordError(err.response?.data?.error || 'Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meridian-login">
      {/* Fundo dinâmico com estrelas sutis */}
      <div className="sky" aria-hidden="true">
        <canvas ref={starsCanvasRef} />
      </div>
      <div className="veil" aria-hidden="true" />

      {/* Mascote Simplific Pro reagindo na lateral direita */}
      <div className="mascot-stage">
        <div className="mascot-aura">
          {/* Brilho esmeralda de fundo */}
          <div className="mascot-glow-bg" />

          {/* Ondas expansivas na digitação */}
          {ripples.map((ripple) => (
            <div key={ripple.id} className="mascot-ripple" />
          ))}

          {/* Mascote Pierre com reflexo animado e reação */}
          <div className={`mascot-interactive ${isTyping ? 'reactive' : ''}`}>
            <SimplificMascot size={290} />
          </div>
        </div>

        {/* Card informativo abaixo do mascote */}
        <div className="mascot-hero-card">
          <span className="mascot-hero-badge">✦ Inteligência Artificial</span>
          <h2 className="mascot-hero-title">Simplific Pro</h2>
          <p className="mascot-hero-desc">
            Controle financeiro inteligente, relatórios automáticos e assistência em tempo real.
          </p>
        </div>
      </div>

      <div className="shell">
        {/* Painel lateral sólido escuro */}
        <div className="pane" aria-hidden="true" />

        {/* Barra Superior com Logo Oficial Simplific Pro */}
        <header className="bar">
          <a className="brand" href="#/" aria-label="Simplific Pro">
            <img src={logo} alt="Simplific Pro" className="brand-logo-img" />
            <b>
              Simplific <span>Pro</span>
            </b>
          </a>
        </header>

        {/* Área Central com o Formulário */}
        <main className="main" id="main">
          <div className="card">
            {/* Steps Progress Tracker: 01 ENTRAR e 02 CADASTRAR */}
            <ol className="track" aria-label="Navegação de acesso">
              <li>
                <button
                  type="button"
                  id="tab-login"
                  className={`track-item ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                  }}
                >
                  01 Entrar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="tab-register"
                  className={`track-item ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                  }}
                >
                  02 Cadastrar
                </button>
              </li>
            </ol>

            {/* Banner de Erro Geral */}
            {error && (
              <div className="err-banner" role="alert">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* ABA 01: ENTRAR                                                 */}
            {/* ============================================================== */}
            {activeTab === 'login' && (
              <section className="panel enter" aria-labelledby="h-login">
                <h1 id="h-login">
                  Acesse sua <em>conta</em>.
                </h1>
                <p className="lede">
                  Digite suas credenciais para gerenciar suas finanças na plataforma Simplific Pro.
                </p>

                <form onSubmit={handleSubmitLogin} noValidate>
                  <div className="field">
                    <label className="mono" htmlFor="login-email">
                      E-mail
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="off"
                      spellCheck="false"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      disabled={loading}
                      className="input"
                    />
                  </div>

                  <div className="field">
                    <div className="field-header">
                      <label className="mono" htmlFor="login-password">
                        Senha
                      </label>
                      <Link to="/forgot-password" className="link text-xs">
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="input-wrapper">
                      <input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        disabled={loading}
                        className="input input-with-action"
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? 'Ocultar senha' : 'Ver senha'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    <span className="lbl">
                      {loading ? (
                        <>
                          Entrando na plataforma{' '}
                          <span className="dots" aria-hidden="true">
                            <i>.</i>
                            <i>.</i>
                            <i>.</i>
                          </span>
                        </>
                      ) : (
                        'Entrar na Plataforma'
                      )}
                    </span>
                    <svg
                      className="go"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                      aria-hidden="true"
                    >
                      <path d="M3 10h13M11 5l5 5-5 5" />
                    </svg>
                  </button>
                </form>

                {/* Opções de Acesso Alternativas (Google com 'Em breve') */}
                <div className="alts" role="group" aria-label="Outras formas de acesso">
                  <h2 className="mono">Outras formas de acesso</h2>
                  <div className="sso">
                    <button
                      className="btn alt"
                      type="button"
                      onClick={() => setGoogleNotice(true)}
                    >
                      <span className="ico">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="#4285F4"
                            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.880c2.27-2.09 3.58-5.17 3.58-8.81z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.96-1.070 7.94-2.9l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.38-2.29V6.6H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4l4.01-3.11z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.6l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z"
                          />
                        </svg>
                      </span>
                      <span className="lbl">
                        Continuar com o Google <span className="badge-soon">Em breve</span>
                      </span>
                      <svg
                        className="chev"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="square"
                        aria-hidden="true"
                      >
                        <path d="M2 8h11M9 4l4 4-4 4" />
                      </svg>
                    </button>
                  </div>

                  {googleNotice && (
                    <p className="msg" style={{ color: 'var(--amber-ink)', marginTop: '8px' }}>
                      A autenticação via Google estará disponível em breve. Por enquanto, utilize seu e-mail e senha cadastrados.
                    </p>
                  )}
                </div>

                <p className="legal">
                  ao acessar você concorda com os <a href="#/termos" target="_blank" rel="noopener noreferrer">termos de uso</a> e <a href="#/privacidade" target="_blank" rel="noopener noreferrer">privacidade</a>.
                </p>
              </section>
            )}

            {/* ============================================================== */}
            {/* ABA 02: CADASTRAR (7 Dias Grátis)                             */}
            {/* ============================================================== */}
            {activeTab === 'register' && (
              <section className="panel enter" aria-labelledby="h-register">
                {registerSuccess ? (
                  <div className="success-box">
                    <CheckCircle2 className="success-icon" />
                    <h2 className="success-title">Cadastro realizado com sucesso!</h2>
                    <p className="success-desc">
                      Enviamos as instruções de confirmação para o seu <strong>WhatsApp</strong>.
                      Após confirmar, acesse a plataforma com seu e-mail e senha.
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '20px' }}
                      type="button"
                      onClick={() => {
                        setRegisterSuccess(false);
                        setActiveTab('login');
                      }}
                    >
                      <span className="lbl">Ir para o Login</span>
                      <svg
                        className="go"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="square"
                        aria-hidden="true"
                      >
                        <path d="M3 10h13M11 5l5 5-5 5" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 id="h-register">
                      Garantir <em>7 dias grátis</em>.
                    </h1>
                    <p className="lede">
                      Cadastre-se agora e libere a Inteligência Artificial para organizar e transformar sua vida financeira.
                    </p>

                    <form onSubmit={handleSubmitRegister} noValidate>
                      <div className="field">
                        <label className="mono" htmlFor="register-name">
                          Nome Completo
                        </label>
                        <input
                          id="register-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Seu nome ou da sua empresa"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          required
                          disabled={loading}
                          className="input"
                        />
                      </div>

                      <div className="field">
                        <label className="mono" htmlFor="register-whatsapp">
                          WhatsApp
                        </label>
                        <input
                          id="register-whatsapp"
                          name="whatsapp"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="DDD + Número (ex: 11999999999)"
                          value={registerData.whatsapp}
                          onChange={handleRegisterChange}
                          required
                          disabled={loading}
                          className="input"
                        />
                      </div>

                      <div className="field">
                        <label className="mono" htmlFor="register-email">
                          E-mail
                        </label>
                        <input
                          id="register-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="off"
                          spellCheck="false"
                          placeholder="seu@email.com"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          required
                          disabled={loading}
                          className="input"
                        />
                      </div>

                      <div className="field">
                        <label className="mono" htmlFor="register-password">
                          Senha
                        </label>
                        <div className="input-wrapper">
                          <input
                            id="register-password"
                            name="password"
                            type={showRegisterPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Crie uma senha segura (mín. 6 caracteres)"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            required
                            disabled={loading}
                            className="input input-with-action"
                          />
                          <button
                            type="button"
                            className="input-toggle-btn"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            aria-label={showRegisterPassword ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button className="btn btn-primary" type="submit" disabled={loading}>
                        <span className="lbl">
                          {loading ? (
                            <>
                              Criando sua conta{' '}
                              <span className="dots" aria-hidden="true">
                                <i>.</i>
                                <i>.</i>
                                <i>.</i>
                              </span>
                            </>
                          ) : (
                            'Garantir 7 Dias Grátis'
                          )}
                        </span>
                        <svg
                          className="go"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="square"
                          aria-hidden="true"
                        >
                          <path d="M3 10h13M11 5l5 5-5 5" />
                        </svg>
                      </button>
                    </form>

                    <p className="legal">
                      ao acessar você concorda com os <a href="#/termos" target="_blank" rel="noopener noreferrer">termos de uso</a> e <a href="#/privacidade" target="_blank" rel="noopener noreferrer">privacidade</a>.
                    </p>
                  </>
                )}
              </section>
            )}
          </div>
        </main>

        {/* Rodapé Limpo (sem frase preview e sem info celestial) */}
        <footer className="foot">
          <p style={{ color: 'var(--ink-3)', fontSize: '0.8125rem', margin: 0 }}>
            © {new Date().getFullYear()} Simplific Pro • Todos os direitos reservados
          </p>
        </footer>
      </div>

      {/* Modal de Primeiro Acesso: Definição de nova senha obrigatória */}
      <Dialog open={isChangePasswordModalOpen}>
        <DialogContent className="rounded-2xl max-w-md bg-slate-900 border border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2">
              🔒 Segurança em Primeiro Lugar
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Detectamos que este é seu primeiro acesso. Por favor, defina uma nova senha segura para prosseguir.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword" style={{ color: 'var(--ink-2)' }}>
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-slate-950 border-slate-700 text-white rounded-xl"
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" style={{ color: 'var(--ink-2)' }}>
                Confirme a Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-slate-950 border-slate-700 text-white rounded-xl"
                placeholder="Repita a nova senha"
              />
            </div>

            {changePasswordError && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 p-2.5 rounded-lg">
                {changePasswordError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;