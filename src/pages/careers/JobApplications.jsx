import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Select, Typography, Tag, Button, Empty, Space } from 'antd';
import { DownloadOutlined, UserOutlined, ReloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { careerService } from '../../services/career.service';

const { Title, Text } = Typography;
const { Option } = Select;

const JobApplications = () => {
  const [activeTab, setActiveTab] = useState('internal');
  const [jobs, setJobs] = useState([]); // List of jobs to select
  const [selectedJobId, setSelectedJobId] = useState(null); // Selected Job
  const [applications, setApplications] = useState([]); // Applications for selected job
  const [loading, setLoading] = useState(false);

  // 1. Load Jobs list first (For Dropdown)
  useEffect(() => {
    loadJobsList();
    setApplications([]); // Clear table on tab change
    setSelectedJobId(null);
  }, [activeTab]);

  // 2. Fetch Jobs List
  const loadJobsList = async () => {
    try {
        let res;
        if (activeTab === 'internal') res = await careerService.getInternalJobs();
        else res = await careerService.getExternalJobs();

        if (res.success) {
            // Handle both structure types { data: [...] } or { data: { data: [...] } }
            const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            setJobs(list);
        }
    } catch (error) {
        console.error("Error fetching jobs list", error);
    }
  };

  // 3. Fetch Applications when Job Selected
  const handleJobSelect = async (jobId) => {
    setSelectedJobId(jobId);
    setLoading(true);
    try {
        const res = await careerService.getJobApplications(jobId, activeTab);
        console.log("Applications Data:", res); // Debugging

        if (res.success) {
            // Handle response structure { data: [...] }
            const apps = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            setApplications(apps);
        } else {
            setApplications([]);
        }
    } catch (error) {
        console.error("Error fetching applications", error);
    }
    setLoading(false);
  };

  // --- UPDATED COLUMNS BASED ON YOUR JSON ---
  const columns = [
    {
        title: 'Candidate Name', 
        key: 'candidate_name',
        // Data is inside 'applicant_data' object
        render: (_, record) => (
            <Space>
                <UserOutlined style={{ color: '#1677ff' }} />
                <Text strong>{record.applicant_data?.candidate_name || 'N/A'}</Text>
            </Space>
        )
    },
    { 
        title: 'Email', 
        dataIndex: 'email', 
        key: 'email' 
    },
    { 
        title: 'Mobile', 
        dataIndex: 'mobile', 
        key: 'mobile' 
    },
    { 
        title: 'Exp.', 
        key: 'total_experience',
        render: (_, record) => record.applicant_data?.total_experience || '-'
    },
    { 
        title: 'Skills', 
        key: 'primary_skill',
        render: (_, record) => (
            <Tag color="cyan">{record.applicant_data?.primary_skill || 'N/A'}</Tag>
        )
    },
    { 
        title: 'Expected CTC', 
        key: 'expected_ctc',
        render: (_, record) => record.applicant_data?.expected_ctc || '-'
    },
    {
        title: 'Status', 
        dataIndex: 'application_status', 
        key: 'application_status',
        render: status => {
            let color = 'blue';
            if (status === 'shortlisted') color = 'green';
            if (status === 'rejected') color = 'red';
            return <Tag color={color}>{status?.toUpperCase() || 'APPLIED'}</Tag>;
        }
    },
    {
        title: 'Resume', 
        key: 'resume',
        render: (_, record) => (
            record.resume_link ? (
                <Button 
                    type="primary" 
                    ghost
                    size="small"
                    icon={<FilePdfOutlined />} 
                    // Backend returns full URL with token
                    href={record.resume_link} 
                    target="_blank"
                >
                    View PDF
                </Button>
            ) : <Text type="secondary">No File</Text>
        )
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
        <Title level={3} style={{ marginBottom: 16 }}>Job Applications</Title>

        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" 
            items={[{ label: 'Internal Hirings', key: 'internal' }, { label: 'External Hirings', key: 'external' }]} 
        />

        <Card bordered={false} style={{ borderRadius: 12 }}>
            <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
                <Text strong>Select Job Post:</Text>
                <Select 
                    style={{ width: 300 }} 
                    placeholder="Select a Job to view applications"
                    onChange={handleJobSelect}
                    value={selectedJobId}
                    showSearch
                    optionFilterProp="children"
                >
                    {jobs.map(job => (
                        <Option key={job.id} value={job.id}>
                            {job.job_title} ({job.job_id || 'No ID'})
                        </Option>
                    ))}
                </Select>
                
                <Button icon={<ReloadOutlined />} onClick={() => selectedJobId && handleJobSelect(selectedJobId)}>
                    Refresh List
                </Button>
            </div>

            {selectedJobId ? (
                <Table 
                    columns={columns} 
                    dataSource={applications} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    scroll={{ x: 1000 }} // Horizontal scroll for smaller screens
                    locale={{ emptyText: <Empty description="No applications received yet" /> }}
                />
            ) : (
                <Empty description="Please select a job to view candidates" />
            )}
        </Card>
    </div>
  );
};

export default JobApplications;