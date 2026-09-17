import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { LeadsPage } from './pages/LeadsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { SalesFunnelPage } from './pages/SalesFunnelPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { CEOUpdatesPage } from './pages/CEOUpdatesPage';
import { SalesTeamUpdatesPage } from './pages/SalesTeamUpdatesPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/sales-funnel" element={<SalesFunnelPage />} />
              <Route path="/opportunities" element={<OpportunitiesPage />} />
              <Route path="/ceo-updates" element={<CEOUpdatesPage />} />
              <Route path="/sales-team-updates" element={<SalesTeamUpdatesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
