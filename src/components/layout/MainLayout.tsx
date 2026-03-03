import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { MOCK_OCCURRENCES } from '../../mocks/data';
import ReminderManager from '../../features/occurrences/components/ReminderManager';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  
  const stats = {
    openOccurrences: MOCK_OCCURRENCES.length,
    criticalOccurrences: MOCK_OCCURRENCES.filter(o => o.priority === 'crítica').length
  };

  return (
    // AJUSTE 1: Cores de fundo dinâmicas (Light: bg-slate-100 / Dark: bg-slate-950)
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      <Sidebar 
        operatorName={user?.name || 'Operador'} 
        stats={stats} 
        onLogout={logout} 
      />
      
      {/* AJUSTE 2: Padding Top no Mobile 
          - pt-20: Dá espaço para o botão flutuante no mobile
          - lg:pt-0: Remove o espaço no desktop (lado a lado)
      */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-20 lg:pt-0">
        <Outlet />
        <ReminderManager />
      </main>
    </div>
  );
};