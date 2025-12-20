import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { 
  AppstoreOutlined, TeamOutlined, UserOutlined, FileTextOutlined, RocketOutlined, 
  PlusCircleOutlined, UnorderedListOutlined, FileSearchOutlined 
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ collapsed, onMenuSelect }) => {
  const { currentTheme, isDarkMode } = useTheme();
  
  // Menu Items Structure
  const items = [
    { key: 'dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: 'users', icon: <TeamOutlined />, label: 'User Management' },
    
    // CAREERS SUB-MENU
    { 
      key: 'careers', 
      icon: <RocketOutlined />, 
      label: 'Careers & Jobs',
      children: [
        { key: 'create-job', icon: <PlusCircleOutlined />, label: 'Create Job' },
        { key: 'job-posts', icon: <UnorderedListOutlined />, label: 'Job Posts' },
        { key: 'applications', icon: <FileSearchOutlined />, label: 'Applications' }
      ]
    },
    
    { key: 'attendance', icon: <FileTextOutlined />, label: 'Attendance' },
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile' },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={250}
      style={{ 
        background: currentTheme.colorBgContainer,
        borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        height: '100vh',
        position: 'sticky', top: 0, left: 0, zIndex: 1001
      }}
    >
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Title level={4} style={{ margin: 0, color: currentTheme.colorPrimary }}>HRM Portal</Title>
      </div>
      
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        items={items}
        onClick={({ key }) => onMenuSelect(key)}
        style={{ marginTop: 10, background: 'transparent', borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;