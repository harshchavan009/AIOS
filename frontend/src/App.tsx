import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layouts/AppLayout';
import { PageSkeletonLoader } from './components/common/SkeletonLoader';
import { useAuthStore } from './store/useAuthStore';

// Eagerly loaded Auth & System pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ServerErrorPage } from './pages/ServerErrorPage';

// Eagerly loaded Studio Modules for Instant Rendering
import { DashboardPage } from './pages/DashboardPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { PromptStudioPage } from './pages/PromptStudioPage';
import { AgentBuilderPage } from './pages/AgentBuilderPage';
import { ModelManagementPage } from './pages/ModelManagementPage';
import { EvaluationStudioPage } from './pages/EvaluationStudioPage';
import { KnowledgeManagementPage } from './pages/KnowledgeManagementPage';
import { AgentMarketplacePage } from './pages/AgentMarketplacePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AgentsPage } from './pages/AgentsPage';
import { GraphRAGPage } from './pages/GraphRAGPage';
import { AutoDevPage } from './pages/AutoDevPage';
import { SecondBrainPage } from './pages/SecondBrainPage';
import { SettingsPage } from './pages/SettingsPage';
import { BillingPage } from './pages/BillingPage';
import { ApiExplorerPage } from './pages/ApiExplorerPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] p-8">
        <PageSkeletonLoader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageSkeletonLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Protected AI Platform Studio Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/prompt-studio" element={<PromptStudioPage />} />
              <Route path="/prompts" element={<PromptStudioPage />} />
              <Route path="/agent-builder" element={<AgentBuilderPage />} />
              <Route path="/models" element={<ModelManagementPage />} />
              <Route path="/evaluation" element={<EvaluationStudioPage />} />
              <Route path="/knowledge" element={<KnowledgeManagementPage />} />
              <Route path="/marketplace" element={<AgentMarketplacePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              <Route path="/workspace" element={<AgentsPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/knowledge-graph" element={<GraphRAGPage />} />
              <Route path="/graph-rag" element={<GraphRAGPage />} />
              <Route path="/rag" element={<GraphRAGPage />} />
              <Route path="/repositories" element={<AutoDevPage />} />
              <Route path="/autodev" element={<AutoDevPage />} />
              <Route path="/documents" element={<SecondBrainPage />} />
              <Route path="/second-brain" element={<SecondBrainPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/docs" element={<ApiExplorerPage />} />
              <Route path="/documentation" element={<ApiExplorerPage />} />
              <Route path="/api-explorer" element={<ApiExplorerPage />} />
              <Route path="/docs/api" element={<ApiExplorerPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
