import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('estelar_token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('estelar_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('estelar_token', token);
    else localStorage.removeItem('estelar_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('estelar_user', JSON.stringify(user));
    else localStorage.removeItem('estelar_user');
  }, [user]);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
