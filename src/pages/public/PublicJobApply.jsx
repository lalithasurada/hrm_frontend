import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Input, Button, Upload, message, Typography, Row, Col, Divider, Tag } from 'antd';
import { UploadOutlined, SolutionOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { careerService } from '../../services/career.service';

const { Title, Text } = Typography;

const PublicJobApply = () => {
  const { type, id } = useParams(); 
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id, type]);

  const fetchJobDetails = async () => {
    try {
        const res = await careerService.getJobDetails(id, type);
        if (res.success) {
            const jobData = res.data?.data || res.data;
            setJob(jobData);
        }
    } catch (error) {
        console.error("Error fetching job details:", error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    const formData = new FormData();

    // 1. Application Data
    const applicationData = {
        candidate_name: values.candidate_name,
        position_applied_for: job?.job_title,
        primary_skill: values.primary_skill,
        secondary_skills: values.secondary_skills ? values.secondary_skills.split(',') : [],
        total_experience: values.total_experience,
        current_company: values.current_company,
        current_location: values.current_location,
        preferred_location: values.preferred_location,
        current_ctc: values.current_ctc,
        expected_ctc: values.expected_ctc,
        notice_period: values.notice_period,
        source: values.source,
        expected_doj: values.expected_doj,
    };

    formData.append('application_data', JSON.stringify(applicationData));
    formData.append('email', values.email);
    formData.append('mobile', values.mobile);
    formData.append('application_status', 'applied');

    if (values.resume_file && values.resume_file.length > 0) {
        formData.append('resume_file', values.resume_file[0].originFileObj);
    }

    const res = await careerService.submitApplication(id, type, formData);
    
    if (res.success) {
        setSubmitted(true);
    } else {
        message.error('Application failed. Please try again.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            width: '100vw',
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#f5f7fa' 
        }}>
            <div style={{ textAlign: 'center', maxWidth: 600, padding: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 60, color: '#52c41a', marginBottom: 20 }} />
                <Title level={2}>Application Submitted!</Title>
                <Text>Thank you for applying for <b>{job?.job_title}</b> at {job?.company_name}.</Text>
            </div>
        </div>
    );
  }

  if (!job) return (
    <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', 
        position: 'absolute', top: 0, left: 0 
    }}>
        Loading Job Details...
    </div>
  );

  return (
    // FIX: Using absolute position and 100vw to force full width and center alignment
    <div style={{ 
        background: '#f5f7fa', 
        minHeight: '100vh', 
        width: '100vw', 
        position: 'absolute', // Breaks out of any parent restrictions
        top: 0,
        left: 0,
        padding: '40px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto' // Enables scrolling for long forms
    }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            
            {/* Job Header */}
            <Card style={{ marginBottom: 20, borderRadius: 12, borderTop: '4px solid #1677ff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Title level={2}>{job.job_title}</Title>
                <Text type="secondary" style={{ fontSize: 16 }}>{job.company_name} | {job.job_location} | {job.employment_type}</Text>
                <Divider />
                <Title level={5}>Job Description</Title>
                <p style={{ whiteSpace: 'pre-line' }}>{job.job_description}</p>
                <div style={{ marginTop: 15 }}>
                    {job.key_skills?.map((skill, index) => <Tag color="blue" key={index} style={{ marginBottom: 5 }}>{skill}</Tag>)}
                </div>
            </Card>

            {/* Application Form */}
            <Card title="Apply for this Position" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Form layout="vertical" onFinish={onFinish}>
                    <Title level={5} style={{ color: '#1677ff' }}><UserOutlined /> Personal Details</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item name="candidate_name" label="Full Name" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input size="large" /></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="current_location" label="Current Location" rules={[{ required: true }]}><Input size="large" /></Form.Item></Col>
                    </Row>

                    <Divider />
                    <Title level={5} style={{ color: '#1677ff' }}><SolutionOutlined /> Professional Details</Title>
                    <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item name="total_experience" label="Total Experience" rules={[{ required: true }]}><Input placeholder="e.g. 5 Years" size="large" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="current_company" label="Current Company"><Input size="large" /></Form.Item></Col>
                    </Row>
                    
                    <Form.Item name="primary_skill" label="Primary Skill" rules={[{ required: true }]}><Input size="large" /></Form.Item>
                    <Form.Item name="secondary_skills" label="Secondary Skills (comma separated)"><Input placeholder="Java, AWS, Docker" size="large" /></Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} md={8}><Form.Item name="current_ctc" label="Current CTC"><Input /></Form.Item></Col>
                        <Col xs={24} md={8}><Form.Item name="expected_ctc" label="Expected CTC"><Input /></Form.Item></Col>
                        <Col xs={24} md={8}><Form.Item name="notice_period" label="Notice Period"><Input /></Form.Item></Col>
                    </Row>

                    <Form.Item name="resume_file" label="Upload Resume (PDF/DOC)" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList} rules={[{ required: true, message: 'Please upload resume' }]}>
                        <Upload maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />} size="large" block>Select File</Button>
                        </Upload>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 20, height: 45, fontSize: 16 }}>
                        Submit Application
                    </Button>
                </Form>
            </Card>
        </div>
    </div>
  );
};

export default PublicJobApply;