import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Typography, Badge, Switch } from 'antd';
import { 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = ({ collapsed, onToggle, onLogout }) => {
  const { currentTheme, isDarkMode, toggleTheme } = useTheme();
  const user = authService.getCurrentUser();

  const userMenuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: onLogout }
  ];

  return (
    <Header style={{ 
      padding: '0 24px', 
      background: isDarkMode ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: 16, color: currentTheme.colorText }}
        />
        <Text strong style={{ fontSize: 18, color: currentTheme.colorText }}>
          HRM Dashboard
        </Text>
      </div>
      
      <Space size={20}>
        {/* Theme Toggle Switch */}
        <Switch 
          checkedChildren={<MoonOutlined />} 
          unCheckedChildren={<SunOutlined />} 
          checked={isDarkMode} 
          onChange={toggleTheme}
          style={{ background: isDarkMode ? '#1677ff' : '#bfbfbf' }}
        />

        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: currentTheme.colorText }} />
        </Badge>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', padding: '4px 8px' }}>
            <Avatar style={{ background: currentTheme.colorPrimary }} icon={<UserOutlined />} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <Text strong style={{ color: currentTheme.colorText, fontSize: 14 }}>
                {user?.name || 'User'}
              </Text>
              <Text style={{ color: currentTheme.colorTextSecondary, fontSize: 11 }}>
                {user?.role || 'Employee'}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Navbar;