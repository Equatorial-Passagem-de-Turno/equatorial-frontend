import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { MOCK_OCCURRENCES } from '../../mocks/data';
import ReminderManager from '../../features/occurrences/components/ReminderManager';
import { api } from '@/services/api';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const [isCheckingLogout, setIsCheckingLogout] = useState(false);
  const [showShiftOpenLogoutModal, setShowShiftOpenLogoutModal] = useState(false);
  const [hasActiveShiftOnLogout, setHasActiveShiftOnLogout] = useState(false);

  const accountRole = String(user?.role || '').toLowerCase();
  const isOperator = accountRole === 'operador' || accountRole === 'operator';

  const doLogout = async () => {
    try {
      await logout();
    } finally {
      setShowShiftOpenLogoutModal(false);
      setIsCheckingLogout(false);
    }
  };

  const handleLogout = async () => {
    if (!isOperator) {
      await doLogout();
      return;
    }

    try {
      setIsCheckingLogout(true);
      const response = await api.get('/shifts/current');
      const currentShift = response?.data;
      const hasActiveShift = Boolean(currentShift);
      setHasActiveShiftOnLogout(hasActiveShift);
      setShowShiftOpenLogoutModal(true);
    } catch (error) {
      console.error('Falha ao verificar turno atual no logout:', error);
      setHasActiveShiftOnLogout(false);
      setShowShiftOpenLogoutModal(true);
    } finally {
      setIsCheckingLogout(false);
    }
  };
  
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
        onLogout={handleLogout} 
      />
      
      {/* AJUSTE 2: Padding Top no Mobile 
          - pt-20: Dá espaço para o botão flutuante no mobile
          - lg:pt-0: Remove o espaço no desktop (lado a lado)
      */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-20 lg:pt-0">
        <Outlet />
        <ReminderManager />
      </main>

      {showShiftOpenLogoutModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isCheckingLogout && setShowShiftOpenLogoutModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/15">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Turno em andamento
              </h3>
            </div>

            <div className="p-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                O sistema recomenda encerrar o turno antes de sair para evitar perda de contexto e pendencias sem repasse.
              </p>
              {hasActiveShiftOnLogout ? (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Detectamos turno em andamento neste usuario.
                </p>
              ) : (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  Nenhum turno em andamento detectado. Voce pode sair normalmente.
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Se preferir, você pode sair agora e continuar esse turno ao retornar.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
              <button
                onClick={() => setShowShiftOpenLogoutModal(false)}
                disabled={isCheckingLogout}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
              >
                Continuar no sistema
              </button>
              <button
                onClick={doLogout}
                disabled={isCheckingLogout}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isCheckingLogout ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Sair mesmo assim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};