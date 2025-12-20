import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // 1. Import Routes
import { ThemeProvider } from './context/ThemeContext';
import { authService } from './services/auth.service';
import { Spin } from 'antd';

// Pages
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicJobApply from './pages/public/PublicJobApply'; // 2. Import Public Page

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check Auth on Load
  useEffect(() => {
    const isAuth = authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* CASE 1: Public Route (Candidate Apply Page) - No Login Required */}
        <Route path="/apply/:type/:id" element={<PublicJobApply />} />

        {/* CASE 2: Main App Logic (Catch-all) */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;