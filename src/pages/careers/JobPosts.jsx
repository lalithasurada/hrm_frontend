import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Button, Tag, Space, message, Modal, Input, Typography } from 'antd';
import { ShareAltOutlined, CopyOutlined, RocketOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { careerService } from '../../services/career.service';

// FIX: Title and Text extracted correctly
const { Title, Text } = Typography;

const JobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('internal');
  const [loading, setLoading] = useState(false);
  
  // Modal for Public Link
  const [linkModal, setLinkModal] = useState({ open: false, url: '' });

  useEffect(() => {
    loadJobs();
  }, [activeTab]);

  const loadJobs = async () => {
    setLoading(true);
    try {
        let res;
        if (activeTab === 'internal') res = await careerService.getInternalJobs();
        else res = await careerService.getExternalJobs();

        if (res.success) {
            // Check for nested data structure from backend
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

  const handlePostJob = async (job) => {
    const today = dayjs().format('YYYY-MM-DD');
    
    // 1. Update Posted Date in Backend
    const res = await careerService.postJob(job.id, activeTab, today);
    
    if (res.success) {
        message.success('Job Posted Successfully!');
        
        // 2. Generate Public URL
        const publicLink = `${window.location.origin}/apply/${activeTab}/${job.id}`;
        
        setLinkModal({ open: true, url: publicLink });
        loadJobs(); // Refresh list
    } else {
        message.error('Failed to post job');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkModal.url);
    message.success('Link copied to clipboard!');
  };

  const columns = [
    { 
      title: 'Job ID', 
      dataIndex: 'job_id', 
      key: 'job_id', 
      render: text => <Tag>{text || 'N/A'}</Tag> 
    },
    { 
      title: 'Job Title', 
      dataIndex: 'job_title', 
      key: 'job_title', 
      render: text => <Text strong>{text}</Text> 
    },
    { 
      title: 'Location', 
      dataIndex: 'job_location', 
      key: 'job_location' 
    },
    { 
      title: 'Experience', 
      dataIndex: 'experience', 
      key: 'experience' 
    },
    { 
        title: 'Status', 
        dataIndex: 'posted_date', 
        key: 'posted_date',
        render: date => date ? <Tag color="green">Active (Posted: {date})</Tag> : <Tag color="orange">Draft</Tag>
    },
    {
        title: 'Action', 
        key: 'action',
        render: (_, record) => (
            <Space>
                {record.posted_date ? (
                    <Button 
                        type="default"
                        icon={<ShareAltOutlined />} 
                        onClick={() => {
                            const link = `${window.location.origin}/apply/${activeTab}/${record.id}`;
                            setLinkModal({ open: true, url: link });
                        }}
                    >
                        Share Link
                    </Button>
                ) : (
                    <Button type="primary" icon={<RocketOutlined />} onClick={() => handlePostJob(record)}>
                        Post Job
                    </Button>
                )}
            </Space>
        )
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Job Posts</Title>
            <Button icon={<ReloadOutlined />} onClick={loadJobs}>Refresh</Button>
        </div>

        <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            type="card" 
            items={[
                { label: 'Internal Jobs', key: 'internal' }, 
                { label: 'External Jobs', key: 'external' }
            ]} 
        />
        
        <Card bordered={false} style={{ borderRadius: 12 }}>
            <Table 
                dataSource={jobs} 
                columns={columns} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 6 }}
            />
        </Card>

        {/* Share Link Modal */}
        <Modal 
            title="Job Public Link" 
            open={linkModal.open} 
            onCancel={() => setLinkModal({ open: false, url: '' })}
            footer={null}
            centered
        >
            <p>Copy this link and share it with candidates:</p>
            <Space.Compact style={{ width: '100%' }}>
                <Input value={linkModal.url} readOnly />
                <Button icon={<CopyOutlined />} type="primary" onClick={copyToClipboard}>Copy</Button>
            </Space.Compact>
        </Modal>
    </div>
  );
};

export default JobPosts;