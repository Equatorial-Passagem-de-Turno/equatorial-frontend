import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle, Shield, Zap, Activity, Radio, ClipboardList } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRolesApi } from '../../occurrences/services/shiftService'; // Ajuste o import se necessário

// 1. Dicionário Visual (Mapeado pelo NOME exato que está no banco de dados)
const VISUAL_MAPPING: Record<string, any> = {
  'Baixa Tensão (BT)': {
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-500',
    borderColor: 'group-hover:border-yellow-500',
  },
  'Média Tensão (MT)': {
    icon: Activity,
    gradient: 'from-blue-400 to-indigo-600',
    borderColor: 'group-hover:border-blue-500',
  },
  'Alta Tensão (AT)': {
    icon: Radio,
    gradient: 'from-red-500 to-rose-700',
    borderColor: 'group-hover:border-red-500',
  },
  'Eng. Pré-Operação': {
    icon: ClipboardList,
    gradient: 'from-emerald-400 to-teal-600',
    borderColor: 'group-hover:border-emerald-500',
  }
};

// Tipo baseado no que a API vai retornar
type DbRole = {
  id: string | number;
  name: string;
  description: string;
};

export const RoleSelector = () => {
  const { user, selectRole, logout } = useAuth();
  const displayName = user?.name || 'Colaborador';

  // Estados da API
  const [dbRoles, setDbRoles] = useState<DbRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Busca os perfis no banco assim que a tela abre
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Chama a rota GET /api/roles que criamos no Laravel
        const data = await getRolesApi(); 
        setDbRoles(data);
      } catch (err) {
        console.error("Erro ao carregar perfis:", err);
        setError("Não foi possível carregar os perfis de operação. Verifique sua conexão.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // 3. Função para juntar os dados do Banco com o Visual do React
  const getVisualConfig = (roleName: string) => {
    // Procura no dicionário pelo nome exato. Se não achar, usa um genérico.
    return VISUAL_MAPPING[roleName] || {
      icon: Shield, 
      gradient: 'from-slate-400 to-slate-600',
      borderColor: 'group-hover:border-slate-500'
    };
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-theme-bg text-theme-text p-6 animate-fade-in dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="w-full max-w-6xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme-text mb-4">
            Olá, <span className="text-emerald-400">{displayName}</span>
          </h1>
          <p className="text-theme-muted text-lg">
            Qual será o seu perfil de operação no turno de hoje?
          </p>
        </div>

        {/* Tratamento de Estados: Carregando, Erro ou Lista */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 mb-10">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Buscando perfis autorizados...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 mb-10 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-800/50 max-w-lg mx-auto text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : dbRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 mb-10 text-slate-500 dark:text-slate-400 text-center">
            <p>Você não possui perfis de operação cadastrados ou ativos no momento.</p>
          </div>
        ) : (
          /* Grid Gerado Dinamicamente do Banco */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbRoles.map((role) => {
              // Fazemos o match entre o NOME do banco e o visual do React
              const visual = getVisualConfig(role.name);
              const Icon = visual.icon;

              return (
                <button
                  key={role.id}
                  // Salvamos o NOME (ex: 'Baixa Tensão (BT)') no Zustand, já que você tirou o code
                  onClick={() => selectRole(role.name)} 
                  className={`
                    group relative overflow-hidden
                    bg-theme-panel backdrop-blur-xl
                    border border-theme-border ${visual.borderColor}
                    rounded-2xl p-6
                    transition-all duration-300
                    hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20
                  `}
                >
                  {/* Efeito de brilho no fundo ao passar o mouse */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${visual.gradient}`} />

                  <div className="relative z-10 flex flex-col items-center text-center h-full justify-between space-y-6">
                    
                    {/* Ícone com Gradiente */}
                    <div className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center 
                      bg-gradient-to-br ${visual.gradient} 
                      shadow-lg transform group-hover:scale-110 transition-transform duration-300
                    `}>
                      <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    
                    {/* Textos que vêm exclusivamente do Banco de Dados! */}
                    <div>
                      <h3 className="text-xl font-bold text-theme-text mb-2">
                        {role.name}
                      </h3>
                      <p className="text-sm text-theme-muted leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    
                    {/* Seta de Ação */}
                    <div className="pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center text-sm font-medium text-theme-muted group-hover:text-theme-text">
                        Acessar Painel <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>
        )}

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