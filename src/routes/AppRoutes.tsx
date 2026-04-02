import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Layouts & Auth
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { RoleSelector } from "@/features/auth/components/RoleSelector";
import { TableSelector } from "@/features/auth/components/TableSelector";

// Pages - Operator
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { NewOccurrencePage } from "@/features/occurrences/pages/NewOccurrencePage";
import { OccurrenceDetailPage } from "@/features/occurrences/pages/OccurrenceDetailPage";
import { MyShiftOccurrencesPage } from "@/features/occurrences/pages/MyShiftOccurrencesPage";
import { ShiftControlPage } from "@/features/shifts/pages/ShiftControlPage";
import { ShiftPreviousPage } from "@/features/shifts/pages/ShiftPreviousPage";

// Pages - Supervisor
import { DashboardSupervisorPage } from "@/features/supervisor/pages/DashboardSupervisorPage";
import { AnalyticsPage } from "@/features/supervisor/pages/AnalyticsPage";
import { ManegementPage } from "@/features/supervisor/pages/ManagementPage";
import { TimelinePage } from "@/features/supervisor/pages/TimelinePage";
import { SupervisorOccurenceDetailsPage } from "@/features/supervisor/components/SupervisorOccurrenceDetailPage";
import { ConstructionPage } from "@/pages/ConstructionPage";

export const AppRoutes = () => {
  const { isAuthenticated, role, table } = useAuth();

  if (!isAuthenticated) return <AuthPage />;
  if (!role) return <RoleSelector />;
  if (role !== "supervisor" && !table) return <TableSelector />;

  switch (role) {
    // ==============================
    // OPERADORES (BT, MT, AT, PRE-OP)
    // ==============================

    case "bt":
    case "mt":
    case "at":
    case "pre_op":
      return (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />

            <Route path="occurrences">
              <Route path="new" element={<NewOccurrencePage />} />
              <Route path="my-shift" element={<MyShiftOccurrencesPage />} />
              <Route path=":id" element={<OccurrenceDetailPage />} />
            </Route>

            <Route path="shifts">
              <Route path="control" element={<ShiftControlPage />} />
              <Route path="previous" element={<ShiftPreviousPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );

    // ==============================
    // SUPERVISOR
    // ==============================

    case "supervisor":
      return (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardSupervisorPage />} />

            <Route path="analytics" element={<AnalyticsPage />} />

            <Route path="management" element={<ManegementPage />} />

            <Route path="timeline" element={<TimelinePage />} />

            <Route path="occurrences">
              <Route path=":id" element={<SupervisorOccurenceDetailsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );

    default:
      return <ConstructionPage />;
  }
};