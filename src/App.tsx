import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import { RecentActivityProvider } from './contexts/RecentActivityContext';
import PageTransition from './components/common/PageTransition';
import LoadingState from './components/common/LoadingState';
import BackToTop from './components/common/BackToTop';
import TopProgressBar from './components/common/TopProgressBar';
import CommandPalette from './components/common/CommandPalette';

// Code-split every route except the landing page, which should paint immediately.
const Auth = lazy(() => import('./pages/Auth'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Resume = lazy(() => import('./pages/ResumeTailoring'));
const InterviewChatbot = lazy(() => import('./pages/InterviewChatbot'));
const AITools = lazy(() => import('./pages/AITools'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));

function RouteFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingState message="Loading page..." />
    </div>
  );
}

function AnimatedRoutes() {
  return (
    <PageTransition>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/chat" element={<InterviewChatbot />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* Add more routes here as we create more pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <NotificationProvider>
      <RecentActivityProvider>
        <Router>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <TopProgressBar />
          <AnimatedRoutes />
          <BackToTop />
          <CommandPalette />
        </Router>
      </RecentActivityProvider>
      </NotificationProvider>
    </ThemeModeProvider>
  );
}

export default App;
