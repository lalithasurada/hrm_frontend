import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Row, Col, Empty 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, MailOutlined, MobileOutlined, ReloadOutlined, TeamOutlined 
} from '@ant-design/icons';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]); // State for Leads
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Watch Form Values to Trigger Dropdowns
  const selectedRole = Form.useWatch('role', form);
  const selectedDesignation = Form.useWatch('designation', form);

  const myRole = authService.getRole()?.toLowerCase() || '';
  const myEmpId = authService.getEmployeeId();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch Team Leads whenever "Team Member" is selected
  useEffect(() => {
    if (selectedDesignation === 'team_member') {
        fetchTeamLeads();
    }
  }, [selectedDesignation]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        const filtered = res.data.filter(user => {
            const targetRole = user.role?.toLowerCase() || '';
            if (myRole === 'superadmin') return true;
            if (myRole === 'admin') return ['hr', 'recruiter', 'employee'].includes(targetRole);
            if (myRole === 'hr') return ['recruiter', 'employee'].includes(targetRole);
            return false;
        });
        setAllUsers(filtered);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
    setLoading(false);
  };

  const fetchTeamLeads = async () => {
      try {
          const res = await userService.getTeamLeads();
          if (res.success && Array.isArray(res.data)) {
              console.log("Team Leads Fetched:", res.data); // Console Log as requested
              setTeamLeads(res.data);
          }
      } catch (error) {
          console.error("Failed to fetch leads", error);
      }
  };

  const getCreatableRoles = () => {
    // Replacing 'employee' with 'recruiter' in logic
    if (myRole === 'superadmin') return ['admin', 'hr', 'recruiter'];
    if (myRole === 'admin') return ['hr', 'recruiter'];
    if (myRole === 'hr') return ['recruiter'];
    return [];
  };

  const handleFinish = async (values) => {
    // Prepare Payload
    const payload = { 
      name: values.name,
      email: values.email,
      office_mail: values.office_mail,
      role: values.role,
      mobile: values.mobile,
      created_by: myEmpId || 'dev',
      // Send Designation only if Recruiter
      designation: values.role === 'recruiter' ? values.designation : null,
      // Send Team Lead ID only if Team Member
      team_lead_id: (values.role === 'recruiter' && values.designation === 'team_member') ? values.team_lead_id : null
    };

    console.log("Final Payload Sending to Backend:", payload); // Debugging

    setLoading(true);
    let result;
    
    try {
        if (editingUser) {
            result = await userService.updateUser(editingUser.id, payload);
        } else {
            result = await userService.createUser(payload);
        }

        if (result.success) {
            message.success(editingUser ? "User updated" : "User created successfully");
            setIsModalOpen(false);
            form.resetFields();
            setEditingUser(null);
            fetchAllUsers();
        } else {
            message.error(result.error || "Operation failed");
        }
    } catch (err) {
        message.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleDelete = async (userId) => {
    Modal.confirm({
      title: 'Delete User?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          message.success("User deleted");
          fetchAllUsers();
        } else {
          message.error("Failed to delete");
        }
      }
    });
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
        form.setFieldsValue(user);
    } else {
        form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Emp ID', 
      dataIndex: 'employ_id', 
      key: 'employ_id',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Name', dataIndex: 'name', key: 'name',
      render: (text) => <Space><UserOutlined style={{ color: '#1890ff' }} /><Text strong>{text}</Text></Space>
    },
    { title: 'Office Mail', dataIndex: 'office_mail', key: 'office_mail', responsive: ['md'] },
    { title: 'Role', dataIndex: 'role', key: 'role',
      render: (role) => {
        let color = role === 'superadmin' ? 'gold' : role === 'admin' ? 'purple' : role === 'hr' ? 'green' : 'cyan';
        return <Tag color={color}>{role?.toUpperCase()}</Tag>;
      }
    },
    // Show Designation only if exists
    { title: 'Designation', dataIndex: 'designation', key: 'designation',
      render: (desig) => desig ? <Tag>{desig.replace('_', ' ').toUpperCase()}</Tag> : '-'
    },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <Space>
            <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
            <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
            <Title level={3} style={{ margin: 0 }}>User Management</Title>
            <Text type="secondary">Manage system access (Logged in as: <b>{myRole.toUpperCase()}</b>)</Text>
        </div>
        <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchAllUsers} loading={loading}>Refresh</Button>
            {getCreatableRoles().length > 0 && (
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                    Add New User
                </Button>
            )}
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table 
            columns={columns} 
            dataSource={allUsers} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 800 }}
            locale={{ emptyText: <Empty description="No users found" /> }}
        />
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Create New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
            </Form.Item>
            
            <Row gutter={16}>
                <Col span={12}>
                     <Form.Item name="email" label="Personal Email" rules={[{ required: true, type: 'email' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Personal Email" size="large" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                     <Form.Item name="office_mail" label="Office Email" rules={[{ required: true, type: 'email' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Office Email" size="large" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true }]}>
                <Input prefix={<MobileOutlined />} placeholder="Mobile Number" size="large" />
            </Form.Item>

            {/* --- ROLE SELECT --- */}
            <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
                <Select placeholder="Select Role" size="large">
                    {getCreatableRoles().map(role => (
                        <Option key={role} value={role}>
                            {/* Chnaged 'Employee' text to 'Recruiter' */}
                            {role === 'recruiter' ? 'Recruiter' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            {/* --- DESIGNATION (Only if Role is Recruiter) --- */}
            {selectedRole === 'recruiter' && (
                <Form.Item 
                    name="designation" 
                    label="Designation" 
                    rules={[{ required: true, message: 'Select designation' }]}
                >
                    <Select placeholder="Select Designation" size="large">
                        <Option value="team_lead">Team Leader</Option>
                        <Option value="team_member">Team Member</Option>
                    </Select>
                </Form.Item>
            )}

            {/* --- TEAM LEAD (Only if Designation is Team Member) --- */}
            {selectedRole === 'recruiter' && selectedDesignation === 'team_member' && (
                <Form.Item 
                    name="team_lead_id" 
                    label="Assign Team Lead" 
                    rules={[{ required: true, message: 'Assign a lead' }]}
                >
                    <Select placeholder="Select Team Lead" size="large" loading={teamLeads.length === 0}>
                        {teamLeads.map(lead => (
                            // IMPORTANT: Value is ID (UUID), Not Employ ID
                            <Option key={lead.id} value={lead.id}>
                                {lead.name} ({lead.employ_id})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            )}

            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 10 }}>
                {editingUser ? "Update User" : "Create User"}
            </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;