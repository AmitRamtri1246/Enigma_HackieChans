import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CircularityProvider } from "@/contexts/CircularityContext";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { OnboardingPage } from "@/pages/OnboardingPage";

// Citizen
import { AppPage } from "@/pages/AppPage";
import { ScanPage } from "@/pages/citizen/ScanPage";
import { ExchangePage } from "@/pages/citizen/ExchangePage";
import { MatchDetailPage } from "@/pages/citizen/MatchDetailPage";
import { ListingsPage } from "@/pages/citizen/ListingsPage";
import { PassportsPage } from "@/pages/citizen/PassportsPage";
import { PassportDetailPage } from "@/pages/citizen/PassportDetailPage";
import { ImpactPage } from "@/pages/citizen/ImpactPage";
import { CommunityPage } from "@/pages/citizen/CommunityPage";
import { MapPage } from "@/pages/citizen/MapPage";

// Organization
import { OrgDashboardPage } from "@/pages/org/OrgDashboardPage";
import { OrgNeedsPage } from "@/pages/org/OrgNeedsPage";
import { OrgMatchesPage } from "@/pages/org/OrgMatchesPage";
import { OrgMatchDetailPage } from "@/pages/org/OrgMatchDetailPage";
import { OrgReceiptsPage } from "@/pages/org/OrgReceiptsPage";

// Collector
import { CollectorTasksPage } from "@/pages/collector/CollectorTasksPage";
import { CollectorTaskDetailPage } from "@/pages/collector/CollectorTaskDetailPage";

// Municipality
import { AdminOverviewPage } from "@/pages/admin/AdminOverviewPage";
import { AdminBinsPage } from "@/pages/admin/AdminBinsPage";
import { AdminTasksPage } from "@/pages/admin/AdminTasksPage";
import { AdminTaskDetailPage } from "@/pages/admin/AdminTaskDetailPage";

/** Wraps every authenticated workspace route with shared demo providers. */
const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute>
    <CircularityProvider>
      <ToastProvider>{children}</ToastProvider>
    </CircularityProvider>
  </ProtectedRoute>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Citizen workspace */}
          <Route path="/app" element={<Protected><AppPage /></Protected>} />
          <Route path="/scan" element={<Protected><ScanPage /></Protected>} />
          <Route path="/exchange" element={<Protected><ExchangePage /></Protected>} />
          <Route path="/exchange/:id" element={<Protected><MatchDetailPage /></Protected>} />
          <Route path="/listings" element={<Protected><ListingsPage /></Protected>} />
          <Route path="/passports" element={<Protected><PassportsPage /></Protected>} />
          <Route path="/passports/:id" element={<Protected><PassportDetailPage /></Protected>} />
          <Route path="/impact" element={<Protected><ImpactPage /></Protected>} />
          <Route path="/community" element={<Protected><CommunityPage /></Protected>} />
          <Route path="/map" element={<Protected><MapPage /></Protected>} />

          {/* Organization workspace */}
          <Route path="/org" element={<Protected><OrgDashboardPage /></Protected>} />
          <Route path="/org/needs" element={<Protected><OrgNeedsPage /></Protected>} />
          <Route path="/org/matches" element={<Protected><OrgMatchesPage /></Protected>} />
          <Route path="/org/matches/:id" element={<Protected><OrgMatchDetailPage /></Protected>} />
          <Route path="/org/receipts" element={<Protected><OrgReceiptsPage /></Protected>} />

          {/* Collector workspace */}
          <Route path="/collector" element={<Protected><CollectorTasksPage /></Protected>} />
          <Route path="/collector/tasks/:id" element={<Protected><CollectorTaskDetailPage /></Protected>} />

          {/* Municipality workspace */}
          <Route path="/admin" element={<Protected><AdminOverviewPage /></Protected>} />
          <Route path="/admin/bins" element={<Protected><AdminBinsPage /></Protected>} />
          <Route path="/admin/tasks" element={<Protected><AdminTasksPage /></Protected>} />
          <Route path="/admin/tasks/:id" element={<Protected><AdminTaskDetailPage /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
