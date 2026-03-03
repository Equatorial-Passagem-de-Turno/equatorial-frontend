import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}
const API_URL = 'http://localhost:8000/api';

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warning('Por favor, digite seu e-mail.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.errors?.email?.[0] || data.message || 'Erro ao processar solicitação.';
        throw new Error(errorMsg);
      } 
      console.log("Link para testar localmente:", data.debug_link);

      setIsEmailSent(true);
      toast.success('Solicitação enviada com sucesso!');

    } catch (error: unknown) { 
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Verifique se o e-mail está correto e tente novamente.';
      
      toast.error('Erro na solicitação', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div className="p-8 bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-500/10 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Verifique seu E-mail</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Enviamos um link de recuperação para <br/>
            <span className="text-white font-medium">{email}</span>
          </p>

          <div className="space-y-3">
             <p className="text-xs text-slate-500 mb-4">
               Clique no link enviado para a sua caixa de entrada para redefinir sua senha de acesso.
             </p>

            <button 
              onClick={onBack}
              className="w-full p-3 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-slate-900 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl">
        <button 
          type="button" 
          onClick={onBack}
          className="flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>

        <h1 className="text-2xl font-bold mb-2">Recuperar Senha</h1>
        <p className="text-slate-400 mb-6 text-sm">
          Digite seu e-mail cadastrado para receber o link de redefinição.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">E-mail Corporativo</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@demo.com"
                className="w-full p-3 pl-10 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading} 
            className="w-full bg-emerald-500 p-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processando...
              </>
            ) : 'Enviar Link de Recuperação'}
          </button>
        </div>
      </form>
    </div>
  );
};