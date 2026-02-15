import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Row, Col, Empty, Tooltip, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, MailOutlined, MobileOutlined, ReloadOutlined, KeyOutlined, FilterOutlined, UploadOutlined, IdcardOutlined } from '@ant-design/icons';
import { userService } from '../services/user.service';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const selectedRole = Form.useWatch('role', form);
  const selectedDesignation = Form.useWatch('designation', form);

  const myRole = authService.getRole()?.toLowerCase() || '';
  const myEmpId = authService.getEmployeeId();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedDesignation === 'team_member') {
      fetchTeamLeads();
    }
  }, [selectedDesignation]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers();
      if (res.success) {
        if (res.data && Array.isArray(res.data.data)) {
          setAllUsers(res.data.data);
        } else if (Array.isArray(res.data)) {
          setAllUsers(res.data);
        } else {
          setAllUsers([]);
        }
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setAllUsers([]);
    }
    setLoading(false);
  };

  const fetchTeamLeads = async () => {
    try {
      const res = await userService.getTeamLeads();
      if (res.success) {
        const leads = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setTeamLeads(leads);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    }
  };

  const getFilterOptions = () => {
    if (myRole === 'superadmin') return ['admin', 'hr', 'recruiter'];
    if (myRole === 'admin') return ['hr', 'recruiter'];
    if (myRole === 'hr') return ['recruiter'];
    return [];
  };

  const getCreatableRoles = () => {
    if (myRole === 'superadmin') return ['admin', 'hr', 'recruiter'];
    if (myRole === 'admin') return ['hr', 'recruiter'];
    if (myRole === 'hr') return ['recruiter'];
    return [];
  };

  const getFilteredUsers = () => {
    if (!allUsers.length) return [];
    return allUsers.filter(user => {
      const targetRole = user.role ? user.role.trim().toLowerCase() : '';
      let isAllowed = false;

      if (myRole === 'superadmin') isAllowed = true;
      else if (myRole === 'admin') isAllowed = ['hr', 'recruiter', 'employee', 'developer'].some(r => targetRole.includes(r));
      else if (myRole === 'hr') isAllowed = ['recruiter', 'employee', 'developer'].some(r => targetRole.includes(r));

      if (!isAllowed) return false;
      if (roleFilter !== 'all') return targetRole.includes(roleFilter);
      return true;
    });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) message.error('You can only upload JPG/PNG file!');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error('Image must smaller than 2MB!');
    return isJpgOrPng && isLt2M ? false : Upload.LIST_IGNORE;
  };

 const handleFinish = async (values) => {
  console.log('=== FORM SUBMIT STARTED ===');
  console.log('Form Values:', values);
  console.log('Editing User:', editingUser);
  
  setLoading(true);

  let result;
  try {
    if (editingUser) {
      // ============ EDIT MODE - SEND JSON ============
      const updateData = {};
      
      // Only include fields that are present
      if (values.name) updateData.name = values.name;
      if (values.email) updateData.email = values.email;
      if (values.office_mail) updateData.office_mail = values.office_mail;
      if (values.role) updateData.role = values.role;
      if (values.mobile) updateData.mobile = values.mobile;
      
      // Optional fields for recruiter
      if (values.role === 'recruiter' && values.designation) {
        updateData.designation = values.designation;
      }
      
      if (values.role === 'recruiter' && values.designation === 'team_member' && values.team_lead_id) {
        updateData.team_lead_id = values.team_lead_id;
      }

      console.log('=== UPDATE JSON DATA ===');
      console.log(JSON.stringify(updateData, null, 2));

      result = await userService.updateUser(editingUser.id, updateData);
      
    } else {
      // ============ CREATE MODE - SEND FORMDATA ============
      const formData = new FormData();

      // REQUIRED FIELDS - with explicit checks
      if (values.employ_id) {
        formData.append('employ_id', values.employ_id.trim());
        console.log('Adding employ_id:', values.employ_id.trim());
      }
      if (values.name) formData.append('name', values.name.trim());
      if (values.email) formData.append('email', values.email.trim());
      if (values.office_mail) formData.append('office_mail', values.office_mail.trim());
      if (values.role) formData.append('role', values.role);
      if (values.mobile) formData.append('mobile', values.mobile.trim());
      
      // Created by
      formData.append('created_by', myEmpId || 'dev');

      // Optional fields for recruiter
      if (values.role === 'recruiter' && values.designation) {
        formData.append('designation', values.designation);
      }

      if (values.role === 'recruiter' && values.designation === 'team_member' && values.team_lead_id) {
        formData.append('team_lead_id', values.team_lead_id);
      }

      // Profile Picture
      if (values.profile_picture && values.profile_picture.length > 0) {
        if (values.profile_picture[0].originFileObj) {
          formData.append('profile_picture', values.profile_picture[0].originFileObj);
        }
      }

      console.log('=== FormData Contents ===');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      result = await userService.createUser(formData);
    }

    console.log('=== API RESULT ===');
    console.log('Success:', result.success);
    console.log('Data:', result.data);
    console.log('Error:', result.error);

    if (result.success) {
      message.success(editingUser ? "User updated successfully" : "User created successfully");
      setIsModalOpen(false);
      form.resetFields();
      setEditingUser(null);
      fetchAllUsers();
    } else {
      console.error('Operation failed:', result.error);
      message.error(result.error || "Operation failed");
    }
  } catch (err) {
    console.error('=== EXCEPTION CAUGHT ===');
    console.error('Error:', err);
    message.error("Something went wrong: " + err.message);
  }
  
  setLoading(false);
  console.log('=== FORM SUBMIT ENDED ===');
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

  const handleResetPassword = async (userId) => {
    Modal.confirm({
      title: 'Reset Password?',
      content: 'User will be forced to set a new password on next login.',
      okText: 'Yes, Reset',
      okType: 'primary',
      onOk: async () => {
        const result = await userService.resetUserPassword(userId);
        if (result.success) message.success("Password reset successfully");
        else message.error("Failed to reset");
      }
    });
  };

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        employ_id: user.employ_id,
        name: user.name,
        email: user.email,
        office_mail: user.office_mail,
        role: user.role,
        mobile: user.mobile,
        designation: user.designation,
        team_lead_id: user.team_lead_id,
        // Show existing image in preview (disabled in edit mode)
        profile_picture: user.user_profile_picture ? [{
          uid: '-1',
          name: 'Profile Picture',
          status: 'done',
          url: user.user_profile_picture,
        }] : []
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const columns = [
    {
      title: 'Emp ID',
      dataIndex: 'employ_id',
      key: 'employ_id',
      width: 120,
      render: (text) => <Text strong>{text || 'N/A'}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <Space><UserOutlined />{text}</Space>
    },
    {
      title: 'Office Mail',
      dataIndex: 'office_mail',
      key: 'office_mail',
      width: 250,
      ellipsis: true,
      responsive: ['md']
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role) => {
        const r = role ? role.trim().toLowerCase() : '';
        let color = r === 'superadmin' ? 'gold' : r === 'admin' ? 'purple' : r === 'hr' ? 'green' : 'cyan';
        return <Tag color={color}>{r.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 180,
      render: (desig) => desig ? <Tag color="blue">{desig.replace('_', ' ').toUpperCase()}</Tag> : '-'
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 150
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
          </Tooltip>
          <Tooltip title="Reset Password">
            <Button 
              icon={<KeyOutlined />} 
              size="small" 
              style={{ color: '#faad14', borderColor: '#faad14' }}
              onClick={() => handleResetPassword(record.id)} 
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => handleDelete(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              <UserOutlined /> User Management
            </Title>
            <Text type="secondary">Logged in as: {myRole.toUpperCase()}</Text>
          </div>

          <Row gutter={16} align="middle">
            <Col>
              <Space>
                <FilterOutlined />
                <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 150 }}>
                  <Option value="all">Show All</Option>
                  {getFilterOptions().map(role => (
                    <Option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col flex="auto" />
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchAllUsers} loading={loading}>
                  Refresh
                </Button>
                {getCreatableRoles().length > 0 && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
                    Add New User
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={getFilteredUsers()}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <Modal
        title={editingUser ? "Edit User" : "Create New User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="employ_id"
            label="Employee ID"
            rules={[{ required: true, message: 'Employee ID is required' }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="e.g. EMP001" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Personal Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Personal Email" />
          </Form.Item>

          <Form.Item
            name="office_mail"
            label="Office Email"
            rules={[
              { required: true, message: 'Office email is required' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Office Email" />
          </Form.Item>

       <Form.Item
  name="mobile"
  label="Mobile Number"
  rules={[{ required: true, message: 'Mobile is required' }]}
>
  <Input prefix={<MobileOutlined />} placeholder="Mobile Number" />
</Form.Item>

{/* PROFILE PICTURE - MANDATORY IN CREATE MODE */}
<Form.Item
  name="profile_picture"
  label={
    <span>
      Profile Picture {!editingUser && <span style={{ color: 'red' }}>*</span>}
    </span>
  }
  valuePropName="fileList"
  getValueFromEvent={normFile}
  rules={[
    {
      required: !editingUser,
      message: 'Please upload a profile picture'
    }
  ]}
>
  <Upload
    listType="picture-card"
    beforeUpload={beforeUpload}
    maxCount={1}
    disabled={editingUser !== null}
  >
    {!editingUser && (
      <div>
        <UploadOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    )}
  </Upload>
</Form.Item>

{editingUser ? (
  <Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16 }}>
    Profile picture cannot be changed in edit mode
  </Text>
) : (
  <Text type="secondary" style={{ display: 'block', marginTop: -16, marginBottom: 16 }}>
    Upload JPG or PNG (Max 2MB)
  </Text>
)}

<Form.Item
  name="role"
  label="Role"
  rules={[{ required: true, message: 'Role is required' }]}
>
  <Select placeholder="Select Role">
    {getCreatableRoles().map(role => (
      <Option key={role} value={role}>
        {role.toUpperCase()}
      </Option>
    ))}
  </Select>
</Form.Item>

          {selectedRole === 'recruiter' && (
            <Form.Item
              name="designation"
              label="Designation"
              rules={[{ required: true, message: 'Designation is required' }]}
            >
              <Select placeholder="Select Designation">
                <Option value="team_lead">Team Leader</Option>
                <Option value="team_member">Team Member</Option>
              </Select>
            </Form.Item>
          )}

          {selectedRole === 'recruiter' && selectedDesignation === 'team_member' && (
            <Form.Item
              name="team_lead_id"
              label="Team Lead"
              rules={[{ required: true, message: 'Team lead is required' }]}
            >
              <Select placeholder="Select Team Lead">
                {teamLeads.map(lead => (
                  <Option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.employ_id})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;