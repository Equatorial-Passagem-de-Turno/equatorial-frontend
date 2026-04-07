import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, Eye, EyeOff, Sun, Moon, ShieldCheck, Clock3, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const REMEMBER_EMAIL_KEY = 'remember-login-email';
  const initialRememberedEmail = (() => {
    try {
      return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '';
    } catch {
      return '';
    }
  })();

  const [email, setEmail] = useState(initialRememberedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(initialRememberedEmail.length > 0);
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Função auxiliar para validar formato de e-mail
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Simplificado: Agora repassa a mensagem limpa que vem do Laravel
  const getFriendlyErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message; 
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  };  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validação de campos vazios
    if (!email || !password) {
      toast.warning('Campos incompletos', {
        description: 'Por favor, preencha seu e-mail e senha para continuar.'
      });
      return;
    }

    // 2. Validação de formato de e-mail
    if (!isValidEmail(email)) {
      toast.warning('E-mail inválido', {
        description: 'Por favor, verifique se digitou o endereço corretamente (ex: nome@empresa.com).'
      });
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      await login(email, password);
      toast.success('Bem-vindo!', {
        description: 'Login realizado com sucesso.'
      });
    } catch (error: unknown) { 
      // 3. Tratamento de erros do servidor (Ex: 401 do Laravel)
      const friendlyMessage = getFriendlyErrorMessage(error);
      
      toast.error('Falha no acesso', {
        description: friendlyMessage
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f6ff] text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 dark:bg-[#070b18] dark:text-slate-100 [font-family:'Poppins',sans-serif]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/moks/login-bg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#070b18]/55 backdrop-blur-[1px] dark:bg-[#070b18]/72" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(5,150,105,0.24),transparent_38%),radial-gradient(circle_at_72%_92%,rgba(13,148,136,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-20 bg-[linear-gradient(to_right,rgba(100,116,139,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.16)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-lg shadow-emerald-200/50 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-black/40 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
        title="Alterar tema"
        aria-label="Alterar tema"
      >
        {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span>{theme === 'light' ? 'Claro' : 'Escuro'}</span>
      </button>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="order-2 rounded-[30px] border border-white/60 bg-white/65 p-6 shadow-[0_24px_70px_rgba(6,95,70,0.2)] backdrop-blur-xl dark:border-emerald-900/30 dark:bg-slate-900/55 dark:shadow-[0_24px_70px_rgba(2,6,23,0.85)] sm:p-8 lg:order-1 lg:p-10">
            <div className="mt-7 space-y-4">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Olá!
                <span className="mt-2 block text-emerald-600 dark:text-emerald-400">Faça login para continuar</span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Tenha visibilidade total da operação em um só lugar: ocorrências, histórico de turno e acompanhamento em tempo real com contexto completo.
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/75">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Confiabilidade</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Acesso seguro por perfil</p>
              </article>
              <article className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/75">
                <Clock3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Tempo Real</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Indicadores ao vivo</p>
              </article>
              <article className="rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/75">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Produtividade</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Menos fricção no turno</p>
              </article>
            </div>
          </div>

          <div className="order-1 rounded-[30px] border border-slate-200/90 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-[0_24px_70px_rgba(2,6,23,0.8)] sm:p-8 lg:order-2">
            <div className="mb-8 text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">Bem-vindo</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-200 dark:text-white">
                <span className="text-emerald-400 dark:text-emerald-400">EQ</span>Continuum
              </h2>
              <p className="mt-2 text-sm text-slate-300 dark:text-slate-300">Use suas credenciais corporativas para continuar.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors group-focus-within:text-emerald-600 dark:text-slate-400 dark:group-focus-within:text-emerald-300">
                  E-mail Corporativo
                </label>
                <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all group-focus-within:border-emerald-500 group-focus-within:ring-4 group-focus-within:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950/55">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    autoComplete="email"
                    className="w-full bg-transparent py-3.5 pl-11 pr-3 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-emerald-600 dark:text-slate-500 dark:group-focus-within:text-emerald-300" />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors group-focus-within:text-emerald-600 dark:text-slate-400 dark:group-focus-within:text-emerald-300">
                  Senha
                </label>
                <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all group-focus-within:border-emerald-500 group-focus-within:ring-4 group-focus-within:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-950/55">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full bg-transparent py-3.5 pl-11 pr-11 text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-emerald-600 dark:text-slate-500 dark:group-focus-within:text-emerald-300" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 transition-colors hover:text-emerald-700 focus:outline-none dark:text-slate-400 dark:hover:text-emerald-300"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <label className="mr-auto inline-flex items-center gap-2 text-sm text-slate-300 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Lembre de mim
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-semibold text-slate-300 underline-offset-4 transition-colors hover:text-emerald-600 hover:underline dark:text-slate-400 dark:hover:text-emerald-300"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/35 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Acessar Sistema</span>
                      <svg className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              <p className="pt-1 text-center text-xs text-slate-300 dark:text-slate-400">
                Ambiente operacional.
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};