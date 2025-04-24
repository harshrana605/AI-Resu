import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import CongratsPage from './pages/CongratsPage';
import { ResumeProvider } from './contexts/ResumeContext';
import './index.css'; // Import global styles

function App() {
  return (
    <ResumeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Redirect /get-started to dashboard */}
          <Route path="/get-started" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/build/:resumeId" element={<ResumeBuilder />} />
          <Route path="/congrats/:resumeId" element={<CongratsPage />} />

          {/* Optional: Add a view-only route if sharing is implemented */}
          {/* <Route path="/view/:resumeId" element={<ResumeViewer />} /> */}

          {/* Fallback route - redirect to landing or dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ResumeProvider>
  );
}

export default App;