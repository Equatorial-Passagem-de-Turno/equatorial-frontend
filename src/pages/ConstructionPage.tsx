import { Hammer, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const ConstructionPage = () => {
  const { user, logout, role } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="text-center max-w-lg">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 rounded-full"></div>
          <Hammer className="w-24 h-24 text-yellow-500 relative z-10 animate-bounce" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Área em Desenvolvimento</h1>
        <p className="text-slate-400 text-lg mb-8">
          Olá <span className="text-emerald-400">{user?.name}</span>. O módulo de 
          <span className="font-bold text-white uppercase mx-1">{role}</span> 
          ainda está sendo construído pela nossa equipe.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-2">O que vem por aí?</h3>
          <ul className="text-slate-400 text-sm space-y-2 list-disc list-inside">
            <li>Dashboards analíticos avançados</li>
            <li>Aprovação de manobras complexas</li>
            <li>Gestão de equipes de campo</li>
          </ul>
        </div>

        <button 
          onClick={logout}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </div>
  );
};