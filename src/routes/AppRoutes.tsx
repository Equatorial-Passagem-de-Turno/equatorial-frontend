import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Layouts & Auth
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthPage } from '@/features/auth/pages/AuthPage'; 
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import { TableSelector } from "@/features/auth/components/TableSelector";
import { HandoverRouteGuard } from '@/features/auth/components/HandoverRouteGuard';
import { ShiftFinishLockGuard } from '@/features/auth/components/ShiftFinishLockGuard';

// Pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { NewOccurrencePage } from '@/features/occurrences/pages/NewOccurrencePage';
import { MyShiftOccurrencesPage } from '@/features/occurrences/pages/MyShiftOccurrencesPage';
import { OccurrenceDetailPage } from '@/features/occurrences/pages/OccurrenceDetailPage';
import { ShiftControlPage } from '@/features/shifts/pages/ShiftControlPage';
import { ShiftPreviousPage } from '@/features/shifts/pages/ShiftPreviousPage';
import { DashboardSupervisorPage } from '@/features/supervisor/pages/DashboardSupervisorPage';
import { TimelinePage } from '@/features/supervisor/pages/TimelinePage';
import { AnalyticsPage } from '@/features/supervisor/pages/AnalyticsPage';
import { ManegementPage } from '@/features/supervisor/pages/ManagementPage';
import { SupervisorOccurenceDetailsPage } from '@/features/supervisor/components/SupervisorOccurrenceDetailPage';

export const AppRoutes = () => {
  const { isAuthenticated, role, table, user } = useAuth();
  const accountRole = String((user as { role?: string } | null)?.role || '').toLowerCase();
  const isSupervisor = accountRole === 'supervisor' || accountRole === 'admin' || accountRole === 'adm';

  if (!isAuthenticated) return <AuthPage />;

  if (!isSupervisor && !role) return <RoleSelector />;
  if (!isSupervisor && !table) return <TableSelector />;


  return (
    <Routes>
      <Route path="/" element={<ShiftFinishLockGuard><MainLayout /></ShiftFinishLockGuard>}>
        {/* Dashboard Principal */}
        <Route
          index
          element={
            isSupervisor
              ? <ShiftFinishLockGuard><DashboardSupervisorPage /></ShiftFinishLockGuard>
              : <ShiftFinishLockGuard><DashboardPage /></ShiftFinishLockGuard>
          }
        />
        
        {/* Módulo de Ocorrências */}
        <Route path="occurrences">
          <Route path="new" element={<ShiftFinishLockGuard><HandoverRouteGuard><NewOccurrencePage /></HandoverRouteGuard></ShiftFinishLockGuard>} />
          <Route path="my-shift" element={<ShiftFinishLockGuard><HandoverRouteGuard><MyShiftOccurrencesPage /></HandoverRouteGuard></ShiftFinishLockGuard>} />
          <Route path=":id" element={<ShiftFinishLockGuard><HandoverRouteGuard><OccurrenceDetailPage /></HandoverRouteGuard></ShiftFinishLockGuard>} />
        </Route>

        {/* Módulo de Turnos */}
        <Route path="shifts">
          <Route path="control" element={<HandoverRouteGuard><ShiftControlPage /></HandoverRouteGuard>} />
          <Route path="previous" element={<ShiftFinishLockGuard><HandoverRouteGuard><ShiftPreviousPage /></HandoverRouteGuard></ShiftFinishLockGuard>} />
        </Route>

        {/* Dashboard do Supervisor */}
        <Route path="supervisor" element={isSupervisor ? <ShiftFinishLockGuard><DashboardSupervisorPage /></ShiftFinishLockGuard> : <Navigate to="/" replace />} />
        <Route path="supervisor/timeline" element={isSupervisor ? <ShiftFinishLockGuard><TimelinePage /></ShiftFinishLockGuard> : <Navigate to="/" replace />} />
        <Route path="supervisor/analytics" element={isSupervisor ? <ShiftFinishLockGuard><AnalyticsPage /></ShiftFinishLockGuard> : <Navigate to="/" replace />} />
        <Route path="supervisor/management" element={isSupervisor ? <ShiftFinishLockGuard><ManegementPage /></ShiftFinishLockGuard> : <Navigate to="/" replace />} />
        <Route path="supervisor/occurrences/:id" element={isSupervisor ? <ShiftFinishLockGuard><SupervisorOccurenceDetailsPage /></ShiftFinishLockGuard> : <Navigate to="/" replace />} />
      </Route>

      {/* Redireciona qualquer rota inválida para a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};