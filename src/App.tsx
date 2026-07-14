import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MockInterview from './pages/MockInterview';
import Resume from './pages/ResumeTailoring';
import InterviewChatbot from './pages/InterviewChatbot';
import { RecentActivityProvider } from './contexts/RecentActivityContext';

function App() {
  return (
    <ThemeModeProvider>
      <NotificationProvider>
      <RecentActivityProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/chat" element={<InterviewChatbot />} />
            {/* Add more routes here as we create more pages */}
          </Routes>
        </Router>
      </RecentActivityProvider>
      </NotificationProvider>
    </ThemeModeProvider>
  );
}

export default App;
