import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppShell } from '../layouts/AppShell';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { MandiIntelligencePage } from '../pages/MandiIntelligencePage';
import { SellingRecommendationsPage } from '../pages/SellingRecommendationsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { ProfitCoachPage } from '../pages/ProfitCoachPage';
import { SarvamAssistantPage } from '../pages/SarvamAssistantPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-charcoal-700">लोड होत आहे... / Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="mandi-intelligence" element={<MandiIntelligencePage />} />
        <Route path="selling-recommendations" element={<SellingRecommendationsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="profit-coach" element={<ProfitCoachPage />} />
        <Route path="sarvam-assistant" element={<SarvamAssistantPage />} />
        <Route path="selling-lots" element={<DashboardPage />} />
        <Route path="lots" element={<DashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
