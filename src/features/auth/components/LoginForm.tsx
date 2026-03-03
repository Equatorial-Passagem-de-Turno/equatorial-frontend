import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#10b98115,transparent)]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 p-6">
        <form 
          onSubmit={handleSubmit} 
          noValidate
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-emerald-900/10 hover:border-slate-700/50"
        >
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">EQDemo</h1>
            <p className="text-slate-400 text-sm mt-2">Identifique-se para continuar</p>
          </div>
          
          <div className="space-y-5">
            
            {/* Campo de E-mail */}
            <div className="space-y-1.5 group">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-emerald-400 transition-colors">
                E-mail Corporativo
              </label>
              <div className="relative group-focus-within:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] transition-shadow rounded-lg">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="w-full p-3.5 pl-11 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-950/80 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                />
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-emerald-400" />
              </div>
            </div>

            {/* Campo de Senha */}
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-focus-within:text-emerald-400 transition-colors">
                  Senha
                </label>
              </div>
              
              <div className="relative group-focus-within:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] transition-shadow rounded-lg">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3.5 pl-11 pr-11 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-950/80 focus:ring-1 focus:ring-emerald-500/50 transition-all duration-300"
                />
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-emerald-400" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
               <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm font-medium text-slate-500 hover:text-emerald-400 transition-colors hover:underline decoration-emerald-500/30 underline-offset-4"
                >
                  Esqueceu a senha?
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading} 
              className="w-full relative group overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 rounded-lg font-bold text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/30 hover:to-emerald-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Sistema</span>
                    <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </div>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};