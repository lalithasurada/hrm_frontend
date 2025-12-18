import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme, Card, Typography, Spin } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

// --- IMPORTANT: Importing the New Separate Files ---
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UserManagement from './UserManagement'; // Meeru create chesina UserManagement file
import DashboardHome from './DashboardHome';   // Meeru create chesina DashboardHome file
import Careers from './Careers';

const { Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const { currentTheme, isDarkMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  // State to control which page is shown
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // 1. Get Profile once on load
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.success) {
        setCurrentUser(res.data);
      }
    } catch (error) {
      console.error("Profile Error", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  // --- VIEW ROUTING LOGIC ---
  const renderContent = () => {
    if (loadingProfile) {
      return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}><Spin size="large" /></div>;
    }

    switch (currentView) {
  case 'dashboard':
    return <DashboardHome currentUser={currentUser} onViewChange={setCurrentView} />;
  
  case 'users':
    return <UserManagement currentUser={currentUser} />;
  
  // NEW CASE FOR CAREERS
  case 'careers':
    return <Careers />;
      
      case 'profile':
        return (
          <Card>
            <Title level={3}>My Profile</Title>
            <p><strong>Name:</strong> {currentUser?.name}</p>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>Role:</strong> {currentUser?.role}</p>
          </Card>
        );
        
      default:
        return <DashboardHome currentUser={currentUser} />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: currentTheme.colorPrimary, colorBgContainer: currentTheme.colorBgContainer },
      }}
    >
      <Layout style={{ minHeight: '100vh', width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
        
        {/* Sidebar Controls the 'currentView' State */}
        <Sidebar collapsed={collapsed} onMenuSelect={(key) => setCurrentView(key)} />
        
        {/* Main Content Area */}
        <Layout style={{ background: currentTheme.colorBgLayout, overflowY: 'auto', height: '100vh' }}>
          
          <Navbar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onLogout={handleLogout} />
          
          <Content style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
            {renderContent()}
          </Content>

        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;