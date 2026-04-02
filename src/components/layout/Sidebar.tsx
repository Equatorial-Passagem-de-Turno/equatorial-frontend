import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Radio, Sun, Moon, ChevronLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { SIDEBAR_ITEMS } from '../../config/navigation';
import { useAuth } from '../../features/auth/hooks/useAuth';

// --- Interfaces ---
interface SidebarStats {
  openOccurrences: number;
  criticalOccurrences: number;
}

interface SidebarProps {
  operatorName: string;
  stats: SidebarStats;
  onLogout: () => void;
}

interface ToggleButtonProps {
  onClick: () => void;
  isOpen: boolean;
  isMobile?: boolean;
}

// --- Componente Auxiliar ---
const ToggleButton = ({ onClick, isOpen, isMobile = false }: ToggleButtonProps) => (
  <button 
    onClick={onClick} 
    className={`
      relative group flex items-center justify-center flex-shrink-0
      /* Tamanho */
      w-10 h-10 rounded-xl
      /* Cores Base */
      bg-white border border-slate-200 text-slate-500 shadow-sm
      dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
      /* Hover Effects */
      hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400
      hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]
      /* Transições */
      transition-all duration-300 active:scale-95
      /* Ajuste de margem para centralizar quando colapsado */
      ${!isOpen && !isMobile ? 'mx-auto' : ''}
    `}
    aria-label={isOpen ? "Recolher" : "Expandir"}
  >
    {isMobile ? (
      <X className="w-5 h-5" />
    ) : (
      <div className={`transition-transform duration-500 ${!isOpen ? 'rotate-180' : ''}`}>
        <ChevronLeft className="w-5 h-5" />
      </div>
    )}
  </button>
);

// --- Componente Principal ---
export const Sidebar = ({ operatorName, stats, onLogout }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isShiftLocked, setIsShiftLocked] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const readShiftLock = () => {
    if (!user?.id) {
      setIsShiftLocked(false);
      return;
    }
    const key = `shift_finish_locked_${user.id}`;
    setIsShiftLocked(localStorage.getItem(key) === '1');
  };

  useEffect(() => {
    readShiftLock();

    const handleStorage = () => readShiftLock();
    const handleShiftLockChanged = () => readShiftLock();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('shift-lock-changed', handleShiftLockChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('shift-lock-changed', handleShiftLockChanged as EventListener);
    };
  }, [user?.id]);

  const handleNavigation = (path: string) => {
    if (isShiftLocked && path !== '/shifts/control') {
      navigate('/shifts/control');
      setMobileOpen(false);
      return;
    }
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // Helper para controlar visibilidade do texto
  const showLabel = !collapsed || mobileOpen;

  return (
    <>
      {/* BOTÃO MOBILE FLUTUANTE */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`
          lg:hidden fixed top-4 left-4 z-[110] 
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-white dark:bg-slate-900 
          border border-slate-200 dark:border-slate-700 
          text-slate-600 dark:text-white 
          shadow-lg shadow-slate-200/50 dark:shadow-black/50
          transition-all duration-300 transform
          ${mobileOpen ? '-translate-x-[200%] opacity-0' : 'translate-x-0 opacity-100'}
        `}
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Container Principal */}
      <aside 
        className={`
          fixed lg:relative z-[100] h-full flex flex-col transition-all duration-300 ease-in-out
          bg-slate-50 dark:bg-slate-900 
          border-r border-slate-200 dark:border-slate-800
          /* IMPORTANTE: overflow-hidden previne que o conteúdo estoure durante a animação */
          overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed && !mobileOpen ? 'w-20' : 'w-72'}
        `}
      >
        {/* Header da Sidebar */}
        <div className={`
          flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300
          ${collapsed && !mobileOpen ? 'p-4 justify-center' : 'p-6 justify-between'}
          h-24
        `}>
            {/* Logo Wrapper - Animação de Largura e Opacidade */}
            <div className={`
              flex items-center gap-3 overflow-hidden transition-all duration-300
              ${collapsed && !mobileOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 dark:ring-black/20 flex-shrink-0">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap">
                EQ<span className="text-emerald-600 dark:text-emerald-500">Demo</span>
              </span>
            </div>

            {/* Botão de Toggle - Sempre renderizado, ajusta posição via CSS do pai */}
            <div className={`${collapsed && !mobileOpen ? 'absolute' : ''}`}>
               {/* Mobile: Fecha Menu | Desktop: Alterna Colapso */}
               <div className="lg:hidden">
                  <ToggleButton onClick={() => setMobileOpen(false)} isOpen={true} isMobile={true} />
               </div>
               <div className="hidden lg:block">
                  <ToggleButton onClick={() => setCollapsed(!collapsed)} isOpen={!collapsed} />
               </div>
            </div>
        </div>

        {/* Info do Operador */}
        <div className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${collapsed && !mobileOpen ? 'max-h-0 opacity-0 mb-0' : 'max-h-20 opacity-100 mb-2 px-6 pt-2'}
        `}>
          <div className="space-y-1 animate-fade-in pl-1 whitespace-nowrap">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Operador</div>
            <div className="text-slate-800 dark:text-white font-semibold truncate text-lg" title={operatorName}>
              {operatorName}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className={`
          flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden
          ${collapsed && !mobileOpen
            ? '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
            : 'custom-scrollbar'
          }
        `}>
          {SIDEBAR_ITEMS.map((item) => {
            const active = isActive(item.path);
            const isDisabledByShiftLock = isShiftLocked && item.path !== '/shifts/control';
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                disabled={isDisabledByShiftLock}
                className={`
                  w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
                  /* Gap dinâmico ajuda na suavidade */
                  ${collapsed && !mobileOpen ? 'justify-center gap-0' : 'gap-3'}
                  ${isDisabledByShiftLock
                    ? 'text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed'
                    : active 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-medium' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-white hover:shadow-sm'
                  } 
                `}
                title={!showLabel ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                
                {/* Texto com Animação de Opacidade e Largura */}
                <span className={`
                  truncate whitespace-nowrap transition-all duration-300 origin-left
                  ${collapsed && !mobileOpen ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
                `}>
                  {item.label}
                </span>
                
                {/* Tooltip Desktop */}
                {collapsed && !mobileOpen && (
                  <div className="hidden lg:block absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-slate-700">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer com Stats */}
        <div className={`
           border-t border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden transition-all duration-300
           ${collapsed && !mobileOpen ? 'max-h-0 opacity-0 p-0' : 'max-h-32 opacity-100 p-4 space-y-3'}
        `}>
           {isShiftLocked && (
             <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
               Turno encerrado: navegação bloqueada. Use "Controle de Turnos" para reabrir.
             </div>
           )}
           {/* Conteúdo Stats mantido igual, apenas wrapper anima */}
            <div className="flex justify-between items-center whitespace-nowrap">
              <span className="text-slate-500 dark:text-slate-400">Abertas</span>
              <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-200 font-bold min-w-[30px] text-center shadow-sm">
                {stats.openOccurrences}
              </span>
            </div>
            <div className="flex justify-between items-center whitespace-nowrap">
              <span className="text-slate-500 dark:text-slate-400">Críticas</span>
              <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold min-w-[30px] text-center border border-red-200 dark:border-red-500/30">
                {stats.criticalOccurrences}
              </span>
            </div>
        </div>

        {/* Footer de Ações */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Botão Tema */}
          <button 
            onClick={toggleTheme}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl 
              text-slate-500 dark:text-slate-400 
              hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-yellow-400
              border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm
              transition-all duration-200
              ${collapsed && !mobileOpen ? 'justify-center' : ''}
            `}
            title="Alterar Tema"
          >
            {theme === 'light' && <Sun className="w-5 h-5 flex-shrink-0" />}
            {theme === 'dark' && <Moon className="w-5 h-5 flex-shrink-0" />}
            
            <span className={`
                truncate whitespace-nowrap transition-all duration-300 origin-left
                ${collapsed && !mobileOpen ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3 font-medium text-sm'}
            `}>
                Tema
            </span>
          </button>

          {/* Botão Sair */}
          <button 
            onClick={onLogout} 
            className={`
              w-full flex items-center px-4 py-3 rounded-xl 
              text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400
              border border-transparent hover:border-red-200 dark:hover:border-red-500/30
              transition-all duration-200
              ${collapsed && !mobileOpen ? 'justify-center' : ''}
            `}
            title="Sair"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`
                truncate whitespace-nowrap transition-all duration-300 origin-left
                ${collapsed && !mobileOpen ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3 font-medium'}
            `}>
                Sair
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[90] animate-fade-in" 
          onClick={() => setMobileOpen(false)} 
          aria-hidden="true"
        />
      )}
    </>
  );
};