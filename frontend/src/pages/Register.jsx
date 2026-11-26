import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import StarfieldBackground from '../three/StarfieldBackground.jsx';
import EstelarCharacter from '../components/EstelarCharacter.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Preencha todos os campos, terráqueo!');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível criar sua conta. Tente novamente.');
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
          <p className="auth-visual-text">“Que alegria luminosa será conhecer você, terráqueo!”</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Bem-vindo ao universo da Estelar!</h1>
          <p className="subtitle">Crie sua conta e prepare-se para conhecer uma nova amiga intergaláctica.</p>

          {error && <div className="error-message">{error}</div>}

          <label>
            Nome de usuário
            <input name="username" value={form.username} onChange={handleChange} placeholder="seu-nome" autoComplete="username" />
          </label>

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
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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

          <label>
            Confirmar senha
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repita sua senha"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="spin" size={18} /> : 'CRIAR MINHA CONTA'}
          </button>

          <p className="auth-switch">
            Já possui uma conta? <Link to="/login">Fazer login.</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
