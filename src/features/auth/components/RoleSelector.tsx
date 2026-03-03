import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLES_CONFIG } from '@/config/roles';

export const RoleSelector = () => {
  // 1. Conecta ao Estado Global (Zustand)
  // Adicionamos 'logout' aqui para o botão "Não é você?" funcionar
  const { user, selectRole, logout } = useAuth();

  // Proteção visual caso o nome não carregue
  const displayName = user?.name || 'Colaborador';

  return (
    <div className="min-h-screen w-full flex items-center justify-center
  bg-theme-bg text-theme-text p-6 animate-fade-in
  dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">

    <div className="w-full max-w-6xl"> {/* Aumentei um pouco a largura máxima para caber 4 cards bem */}
        
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme-text mb-4">
            Olá, <span className="text-emerald-400">{displayName}</span>
          </h1>
          <p className="text-theme-muted text-lg">
            Em qual mesa de operação você assumirá o turno hoje?
          </p>
        </div>

        {/* Grid Gerado Dinamicamente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES_CONFIG.map((role) => (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              className={`
                group relative overflow-hidden
                bg-theme-panel backdrop-blur-xl
                border border-theme-border ${role.borderColor}
                rounded-2xl p-6
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20
              `}

            >
              {/* Efeito de brilho no fundo ao passar o mouse */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${role.gradient}`} />

              <div className="relative z-10 flex flex-col items-center text-center h-full justify-between space-y-6">
                
                {/* Ícone com Gradiente */}
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center 
                  bg-gradient-to-br ${role.gradient} 
                  shadow-lg transform group-hover:scale-110 transition-transform duration-300
                `}>
                  <role.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                
                {/* Textos */}
                <div>
                  <h3 className="text-xl font-bold text-theme-text mb-2">
                  {role.label}
                  </h3>
                  <p className="text-sm text-theme-muted leading-relaxed">
                    {role.description}
                  </p>
                </div>
                
                {/* Seta de Ação (Aparece/Move no Hover) */}
                <div className="pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                   <div className="flex items-center text-sm font-medium text-theme-muted group-hover:text-theme-text">
                     Acessar Painel <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>

              </div>
            </button>
          ))}
        </div>

        {/* Footer com Logout Funcional */}
        <div className="mt-16 text-center">
            <button 
                onClick={logout}
                className="text-theme-muted hover:text-red-500 text-sm transition-colors flex items-center justify-center mx-auto gap-2 group"
              >
                <span className="underline decoration-theme-border underline-offset-4 group-hover:decoration-red-500/50">
                  Encerrar sessão
                </span>
            </button>
        </div>

      </div>
    </div>
  );
};