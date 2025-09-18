import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/appContext';

// Tela de login mockada que valida credenciais seed e armazena sessão no localStorage.
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from = location.state?.from?.pathname ?? '/admin';

  useEffect(() => {
    document.title = 'Acessar portal | LAF';
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    try {
      login({ email, password });
      navigate(from, { replace: true });
    } catch (exception) {
      setError(exception.message ?? 'Não foi possível autenticar');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Portal Gerencial</h1>
          <p className="text-sm text-slate-500">Entre com seu e-mail institucional</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            Entrar
          </button>
        </form>
        <div className="mt-6 text-xs text-slate-400">
          <p className="font-semibold">Usuários de teste:</p>
          <ul className="mt-2 space-y-1">
            <li>admin@organizacao.local / 123456</li>
            <li>secretaria@organizacao.local / 123456</li>
            <li>tjd@organizacao.local / 123456</li>
            <li>editor@organizacao.local / 123456</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
