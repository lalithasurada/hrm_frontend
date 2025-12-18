import React from 'react';
import { Card, Typography, Row, Col, Statistic, Button, Space } from 'antd';
import { 
  TeamOutlined, CheckCircleOutlined, UserAddOutlined, ClockCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DashboardHome = ({ currentUser, onViewChange }) => {
  
  // Future lo ivi API nundi vastayi
  const stats = [
      { title: 'Total Employees', value: 128, icon: <TeamOutlined />, color: '#1677ff' },
      { title: 'Present Today', value: 112, icon: <CheckCircleOutlined />, color: '#52c41a' },
      { title: 'On Leave', value: 8, icon: <UserAddOutlined />, color: '#faad14' },
      { title: 'Late Arrivals', value: 5, icon: <ClockCircleOutlined />, color: '#ff4d4f' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>Dashboard Overview</Title>
            <Text type="secondary">Welcome back, <span style={{ fontWeight: 'bold', color: '#1677ff' }}>{currentUser?.name || 'Admin'}</span>. Here's what's happening today.</Text>
        </div>

        <Row gutter={[24, 24]}>
            {stats.map((stat, idx) => (
                <Col xs={24} sm={12} lg={6} key={idx}>
                    <Card bordered={false} style={{ borderRadius: 12, height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <Statistic 
                            title={stat.title} 
                            value={stat.value} 
                            prefix={<span style={{ color: stat.color, marginRight: 8, fontSize: 20 }}>{stat.icon}</span>}
                            valueStyle={{ fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>

        <Row gutter={24} style={{ marginTop: 24 }}>
            <Col xs={24} lg={16}>
                <Card title="Quick Analytics" bordered={false} style={{ borderRadius: 12, minHeight: 350 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, color: '#999', flexDirection: 'column' }}>
                        <Text>Charts & Attendance Graph will appear here.</Text>
                    </div>
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                 <Card title="Shortcuts" bordered={false} style={{ borderRadius: 12, minHeight: 350 }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Button block size="large" onClick={() => onViewChange('users')} style={{ textAlign: 'left', height: 'auto', padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>Add Employee</Text><br/>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Create new user account</Text>
                                </div>
                                <ArrowRightOutlined />
                            </div>
                        </Button>
                        <Button block size="large" style={{ textAlign: 'left', height: 'auto', padding: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text strong>Mark Attendance</Text><br/>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Log today's entry</Text>
                                </div>
                                <ArrowRightOutlined />
                            </div>
                        </Button>
                    </Space>
                </Card>
            </Col>
        </Row>
    </div>
  );
};

export default DashboardHome;