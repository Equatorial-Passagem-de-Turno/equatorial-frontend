import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getShiftHandoverDataCached } from '@/features/occurrences/services/shiftService';
import type { ShiftHandoverSummary } from '@/features/occurrences/services/shiftService';
import { hasCompletedInheritedSelection } from '@/features/occurrences/utils/handoverPersistence';

type HandoverRouteGuardProps = {
  children: ReactNode;
};

export const HandoverRouteGuard = ({ children }: HandoverRouteGuardProps) => {
  const { user, role } = useAuth();
  const location = useLocation();

  const [isChecking, setIsChecking] = useState(true);
  const [mustCompleteHandover, setMustCompleteHandover] = useState(false);
  const roleNormalized = String(role || '').toLowerCase();

  useEffect(() => {
    const checkHandoverStatus = async () => {
      if (!user?.id || !role || roleNormalized === 'admin' || roleNormalized === 'adm' || roleNormalized === 'supervisor') {
        setMustCompleteHandover(false);
        setIsChecking(false);
        return;
      }

      try {
        const data: ShiftHandoverSummary = await getShiftHandoverDataCached();
        const hasPendingHandover = Array.isArray(data?.occurrences) && data.occurrences.length > 0;

        if (!hasPendingHandover) {
          setMustCompleteHandover(false);
          return;
        }

        const isCompleted = hasCompletedInheritedSelection(String(user.id));
        setMustCompleteHandover(!isCompleted);
      } catch {
        // Se a verificação falhar, não bloqueia toda a aplicação.
        setMustCompleteHandover(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHandoverStatus();
  }, [user?.id, role, roleNormalized]);

  if (isChecking) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          Validando fluxo obrigatório de entrada...
        </div>
      </div>
    );
  }

  const isDashboard = location.pathname === '/';

  if (mustCompleteHandover && !isDashboard) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
