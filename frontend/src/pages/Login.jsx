import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import StarfieldBackground from '../three/StarfieldBackground.jsx';
import EstelarCharacter from '../components/EstelarCharacter.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.error || 'E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <StarfieldBackground />
      <div className="auth-card glass">
        <div className="auth-visual">
          <EstelarCharacter size={150} />
          <p className="auth-visual-text">“A Estelar está esperando para conversar com você.”</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Que bom ter você de volta!</h1>
          <p className="subtitle">A Estelar está esperando para conversar com você.</p>

          {location.state?.registered && (
            <div className="success-message">Conta criada! Agora faça login para continuar.</div>
          )}
          {error && <div className="error-message">{error}</div>}

          <label>
            E-mail
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </label>

          <label>
            Senha
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : 'ENTRAR NO UNIVERSO'}
          </button>

          <p className="auth-switch">
            Não possui uma conta? <Link to="/register">Cadastre-se.</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
