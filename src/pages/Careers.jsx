import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Table, Tag, Button, Modal, Form, Input, Select, message, Space, Tabs, DatePicker, Row, Col 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, BankOutlined, EnvironmentOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { careerService } from '../services/career.service';
import { authService } from '../services/auth.service';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Careers = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('internal'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form] = Form.useForm();

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'internal') {
        res = await careerService.getInternalJobs();
      } else {
        res = await careerService.getExternalJobs();
      }

      if (res.success) {
        if (res.data && Array.isArray(res.data.data)) {
            setJobs(res.data.data);
        } else if (Array.isArray(res.data)) {
            setJobs(res.data);
        } else {
            setJobs([]);
        }
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to load jobs");
    }
    setLoading(false);
  };

  // --- MAIN LOGIC UPDATE: SEND ONLY CHANGES FOR PATCH ---
  const handleFinish = async (values) => {
    setLoading(true);
    let result;

    // 1. Process Values (Dates & Numbers)
    const formattedValues = {
        ...values,
        // Convert Date to String (YYYY-MM-DD)
        posted_date: values.posted_date ? values.posted_date.format('YYYY-MM-DD') : null,
        // Ensure Openings is a Number
        openings: Number(values.openings),
        // Ensure job_type is set
        job_type: values.job_type || activeTab
    };

    try {
      if (editingJob) {
        // --- UPDATE MODE (PATCH) ---
        
        // Calculate Differences (Diff)
        const changes = {};
        
        // List of fields allowed to update
        const fieldsToCheck = [
            'job_title', 'experience', 'salary', 'job_location', 'job_description',
            'key_skills', 'employment_type', 'work_mode', 'company_name',
            'company_location', 'openings', 'posted_date', 'job_status', 'job_type'
        ];

        fieldsToCheck.forEach(key => {
            // Compare New Value vs Old Value
            // JSON.stringify helps compare Arrays (key_skills) and Objects easily
            const newValue = formattedValues[key];
            const oldValue = editingJob[key];

            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                changes[key] = newValue;
            }
        });

        // If no changes, don't call API
        if (Object.keys(changes).length === 0) {
            message.info("No changes detected");
            setLoading(false);
            setIsModalOpen(false);
            return;
        }

        console.log("Sending PATCH Payload (Changes Only):", changes); // Debugging

        // Call Update API with ONLY changes
        // Note: editingJob.id and editingJob.job_type are needed for URL, not Body
        const typeForUrl = editingJob.job_type || activeTab;
        result = await careerService.updateJob(editingJob.id, typeForUrl, changes);

      } else {
        // --- CREATE MODE (POST) ---
        // Send Full Data + Created By
        const payload = {
            ...formattedValues,
            created_by: currentUser?.id
        };
        result = await careerService.createJob(payload);
      }

      // Result Handling
      if (result.success) {
        message.success(editingJob ? "Job Updated Successfully" : "Job Created Successfully");
        setIsModalOpen(false);
        form.resetFields();
        setEditingJob(null);
        fetchJobs(); 
      } else {
        message.error(result.error || "Operation failed");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      message.error("Something went wrong");
    }
    setLoading(false);
  };

  const handleDelete = async (job) => {
    Modal.confirm({
      title: 'Delete Job Posting?',
      content: `Are you sure you want to delete "${job.job_title}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        const typeToDelete = job.job_type || activeTab;
        const result = await careerService.deleteJob(job.id, typeToDelete);
        
        if (result.success) {
          message.success("Job deleted");
          fetchJobs();
        } else {
          message.error("Failed to delete");
        }
      }
    });
  };

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      form.setFieldsValue({
        ...job,
        posted_date: job.posted_date ? dayjs(job.posted_date) : null,
        key_skills: Array.isArray(job.key_skills) ? job.key_skills : [],
        job_type: job.job_type || activeTab 
      });
    } else {
      setEditingJob(null);
      form.resetFields();
      form.setFieldValue('job_type', activeTab);
      form.setFieldValue('posted_date', dayjs());
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Job Title', dataIndex: 'job_title', key: 'job_title',
      render: (text) => <Text strong>{text}</Text>
    },
    { 
      title: 'Experience', dataIndex: 'experience', key: 'experience',
      responsive: ['md']
    },
    { 
      title: 'Location', dataIndex: 'job_location', key: 'job_location',
      render: (text) => <span><EnvironmentOutlined /> {text}</span>
    },
    {
      title: 'Status', dataIndex: 'job_status', key: 'job_status',
      render: (status) => {
        const color = status === 'open' ? 'green' : 'red';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Type', dataIndex: 'employment_type', key: 'employment_type',
      responsive: ['lg']
    },
    {
      title: 'Action', key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openModal(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record)} />
        </Space>
      )
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Careers</Title>
          <Text type="secondary">Manage Job Openings</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>
          Post Job
        </Button>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        items={[
          { label: 'Internal Hirings', key: 'internal' },
          { label: 'External Hirings', key: 'external' }
        ]}
      />

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <div style={{ textAlign: 'right', marginBottom: 10 }}>
            <Button icon={<ReloadOutlined />} onClick={fetchJobs} size="small">Refresh</Button>
        </div>
        <Table 
          columns={columns} 
          dataSource={jobs} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Modal
        title={editingJob ? "Edit Job Posting" : "Create New Job"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 20 }}>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="job_title" label="Job Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Senior React Developer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company_name" label="Company Name" rules={[{ required: true }]}>
                <Input prefix={<BankOutlined />} placeholder="TechCorp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="experience" label="Experience" rules={[{ required: true }]}>
                <Input placeholder="e.g. 2-4 Years" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
                <Input placeholder="e.g. $100k - $120k" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="job_type" label="Hiring Type" rules={[{ required: true }]}>
                <Select>
                  <Option value="internal">Internal</Option>
                  <Option value="external">External</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="job_location" label="Job Location" rules={[{ required: true }]}>
                    <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Hyderabad" />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="company_location" label="Company Location" rules={[{ required: true }]}>
                    <Input prefix={<EnvironmentOutlined />} placeholder="e.g. USA" />
                </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
                <Form.Item name="employment_type" label="Employment Type" rules={[{ required: true }]}>
                    <Select>
                        <Option value="Full-time">Full-time</Option>
                        <Option value="Part-time">Part-time</Option>
                        <Option value="Contract">Contract</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="work_mode" label="Work Mode" rules={[{ required: true }]}>
                    <Select>
                        <Option value="Remote">Remote</Option>
                        <Option value="On-site">On-site</Option>
                        <Option value="Hybrid">Hybrid</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={8}>
                <Form.Item name="job_status" label="Status" rules={[{ required: true }]}>
                    <Select>
                        <Option value="open">Open</Option>
                        <Option value="closed">Closed</Option>
                    </Select>
                </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
                <Form.Item name="openings" label="No. of Openings" rules={[{ required: true }]}>
                    <Input type="number" min={1} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="posted_date" label="Posted Date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>
            </Col>
          </Row>

          <Form.Item name="key_skills" label="Key Skills" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="Type skill and press enter">
            </Select>
          </Form.Item>

          <Form.Item name="job_description" label="Job Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Detailed description..." />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            {editingJob ? "Update Job" : "Create Job"}
          </Button>

        </Form>
      </Modal>
    </div>
  );
};

export default Careers;