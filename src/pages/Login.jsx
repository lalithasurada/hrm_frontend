import React, { useState } from 'react';
import { message } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  ArrowRightOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const LoginPage = ({ onLogin }) => {
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Login Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Password Change Modal Data
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState(null); 
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- 1. LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    if(!email || !password) return message.warning("Please enter your credentials");

    setLoading(true);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        const user = result.user;
        
        // CHECK: Is this the first time logging in?
        if (user.firstlogin === true) {
          setTempUser(user);
          setIsPasswordModalOpen(true); 
        } else {
          message.success('Welcome back!');
          if (onLogin) onLogin(); 
        }
        
      } else {
        message.error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      message.error("Network error. Please try again.");
    }
    
    setLoading(false);
  };

  // --- 2. PASSWORD CHANGE LOGIC ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return message.warning("Please fill all fields");
    if (newPassword !== confirmPassword) return message.error("Passwords do not match");
    if (newPassword.length < 6) return message.error("Password must be at least 6 characters");

    setPasswordLoading(true);
    try {
        // Send user ID (from tempUser) and new password
        const res = await userService.changePassword(tempUser.id, newPassword);
        
        if (res.success) {
          message.success("Password updated successfully! Redirecting...");
          setIsPasswordModalOpen(false);
          // Force reload to clear cache and require fresh login with new password
          window.location.reload(); 
        } else {
          message.error(res.error || "Failed to update password");
        }
    } catch (err) {
        message.error("Something went wrong");
    }
    setPasswordLoading(false);
  };

  return (
    <div className="hrm-login-wrapper">
      <style>
        {`
          /* --- RESET & FONTS --- */
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }

          /* --- MAIN BACKGROUND --- */
          .hrm-login-wrapper {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            display: flex; align-items: center; justify-content: center;
            /* Professional Office Background */
            background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop');
            background-size: cover; background-position: center;
          }

          /* --- BLUE GRADIENT OVERLAY --- */
          .hrm-login-wrapper::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            /* Deep Corporate Blue Gradient */
            background: linear-gradient(135deg, rgba(10, 25, 47, 0.95) 0%, rgba(23, 42, 69, 0.9) 100%);
            z-index: 1;
          }

          /* --- LAYOUT CONTAINER --- */
          .content-container {
            position: relative; z-index: 2;
            width: 90%; max-width: 1200px;
            display: grid; grid-template-columns: 1.2fr 1fr; /* Left takes more space */
            gap: 80px; align-items: center;
          }

          /* --- LEFT SIDE: BRANDING --- */
          .branding-section { color: white; animation: slideInLeft 0.8s ease-out; }
          
          .logo-badge {
            display: inline-flex; align-items: center; gap: 10px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 16px; border-radius: 50px;
            font-size: 14px; font-weight: 600; letter-spacing: 1px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 25px; backdrop-filter: blur(5px);
          }

          .main-heading {
            font-size: 3.5rem; font-weight: 700; line-height: 1.1; margin-bottom: 20px;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          }

          .highlight { color: #3b82f6; -webkit-text-fill-color: #3b82f6; }

          .sub-heading {
            font-size: 1.1rem; color: #cbd5e1; line-height: 1.6; max-width: 500px; margin-bottom: 40px; font-weight: 300;
          }

          .stats-grid { display: flex; gap: 40px; }
          .stat-item h3 { font-size: 1.8rem; font-weight: 700; color: white; margin-bottom: 2px; }
          .stat-item p { color: #94a3b8; font-size: 0.9rem; }

          /* --- RIGHT SIDE: GLASS CARD --- */
          .login-card-section {
            display: flex; justify-content: flex-end;
            animation: slideInRight 0.8s ease-out;
          }

          .glass-card {
            width: 100%; max-width: 420px;
            background: rgba(255, 255, 255, 0.07); /* Very transparent white */
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 24px; padding: 48px 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          .card-header h2 { color: white; font-size: 28px; margin-bottom: 8px; font-weight: 600; }
          .card-header p { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }

          /* --- INPUT FIELDS --- */
          .input-group { position: relative; margin-bottom: 20px; }
          
          .input-icon {
            position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
            color: #94a3b8; font-size: 18px; pointer-events: none; transition: color 0.3s;
          }

          .glass-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.4); /* Dark input background */
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px 16px 16px 48px; /* Space for icon */
            color: white; font-size: 15px; outline: none;
            transition: all 0.3s ease;
          }

          .glass-input:focus {
            border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.8);
          }
          
          .glass-input:focus + .input-icon { color: #3b82f6; }
          .glass-input::placeholder { color: #64748b; font-weight: 300; }

          .password-toggle {
            position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
            color: #94a3b8; cursor: pointer; transition: color 0.2s;
          }
          .password-toggle:hover { color: white; }

          /* --- ACTION LINKS --- */
          .actions {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; font-size: 13px;
          }
          .forgot-pass { color: #60a5fa; text-decoration: none; font-weight: 500; cursor: pointer; }
          .forgot-pass:hover { text-decoration: underline; }

          /* --- BUTTONS --- */
          .login-btn {
            width: 100%; padding: 16px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white; font-size: 16px; font-weight: 600; cursor: pointer;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5); }
          .login-btn:disabled { opacity: 0.7; cursor: wait; }

          .sso-btn {
            width: 100%; padding: 14px; margin-top: 15px;
            background: transparent; border: 1px solid rgba(255, 255, 255, 0.2);
            color: #cbd5e1; font-size: 14px; font-weight: 500; border-radius: 12px;
            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: all 0.3s;
          }
          .sso-btn:hover { border-color: #60a5fa; color: white; background: rgba(255, 255, 255, 0.05); }

          /* --- ANIMATIONS --- */
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

          /* --- RESPONSIVE --- */
          @media (max-width: 968px) {
            .content-container { grid-template-columns: 1fr; text-align: center; }
            .branding-section { display: none; } /* Hide text on mobile for clean look */
            .login-card-section { justify-content: center; }
          }

          /* --- MODAL STYLES --- */
          .modal-backdrop {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
            z-index: 20000; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.3s;
          }
          .modal-content {
            background: #0f172a; padding: 40px; border-radius: 20px;
            width: 100%; max-width: 400px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            text-align: center;
          }
        `}
      </style>

      <div className="content-container">
        
        {/* LEFT SECTION: BRANDING & INFO */}
        <div className="branding-section">
          <div className="logo-badge">
            <GlobalOutlined /> HRM PORTAL
          </div>
          
          <h1 className="main-heading">
            Smart & Simple <br />
            <span className="highlight">Workforce Mgmt.</span>
          </h1>
          
          <p className="sub-heading">
            Experience the future of HR. Manage payroll, attendance, recruitment, and employee performance in one unified, secure platform.
          </p>

          <div className="stats-grid">
            <div className="stat-item">
              <h3>10k+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-item">
              <h3>99.9%</h3>
              <p>Uptime Guarantee</p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: LOGIN CARD */}
        <div className="login-card-section">
          <form className="glass-card" onSubmit={handleLogin}>
            <div className="card-header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {/* Email Input */}
            <div className="input-group">
              <input 
                type="email" 
                className="glass-input" 
                placeholder="Corporate Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <UserOutlined className="input-icon" />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <input 
                type={passwordVisible ? "text" : "password"} 
                className="glass-input" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <LockOutlined className="input-icon" />
              <div className="password-toggle" onClick={() => setPasswordVisible(!passwordVisible)}>
                {passwordVisible ? <EyeTwoTone twoToneColor="#3b82f6" /> : <EyeInvisibleOutlined />}
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <span style={{ color: '#94a3b8' }}>Need help?</span>
              <a className="forgot-pass">Reset Password</a>
            </div>

            {/* Buttons */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <button type="button" className="sso-btn">
              <SafetyCertificateOutlined /> Single Sign-On (SSO)
            </button>
          </form>
        </div>

      </div>

      {/* --- PASSWORD CHANGE MODAL (Overlay) --- */}
      {isPasswordModalOpen && (
        <div className="modal-backdrop">
          <form className="modal-content" onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ color: 'white', marginBottom: 10 }}>Update Password</h2>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                    For security reasons, please set a new password for your first login.
                </p>
            </div>

            <div className="input-group">
              <input 
                type="password" className="glass-input" placeholder="New Password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
              />
              <LockOutlined className="input-icon" />
            </div>

            <div className="input-group">
              <input 
                type="password" className="glass-input" placeholder="Confirm Password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
              />
              <LockOutlined className="input-icon" />
            </div>

            <button type="submit" className="login-btn" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Set Password & Login'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default LoginPage;