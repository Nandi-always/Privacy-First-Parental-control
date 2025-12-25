import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import '../styles/LoginPage.css';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const userData = { email, role, type: 'login' };
    setUser(userData);
    
    if (role === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/child-dashboard');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const userData = { 
      email, 
      role, 
      type: 'register',
      childName: role === 'child' ? childName : null,
      childAge: role === 'child' ? childAge : null
    };
    setUser(userData);
    
    if (role === 'parent') {
      navigate('/parent-dashboard');
    } else {
      navigate('/child-dashboard');
    }
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo-container">
              <div className="logo-icon">🛡️</div>
              <h1>SafeGuard</h1>
            </div>
            <h2>Privacy-First Parental Control</h2>
            <p>Transparent • Trust-Based • Secure</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Age-Appropriate Rules</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Real-time Monitoring</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Emergency SOS</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Activity Reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="login-form-container">
          <div className="form-wrapper">
            <div className="tabs">
              <button 
                className={`tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button 
                className={`tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {/* Email */}
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={20} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={20} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label>I am a</label>
                <div className="role-selector">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="parent"
                      checked={role === 'parent'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span className="radio-icon">👨‍👩‍👧</span>
                    <span>Parent</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="child"
                      checked={role === 'child'}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span className="radio-icon">👧</span>
                    <span>Child</span>
                  </label>
                </div>
              </div>

              {/* Child Info (Register only, when child selected) */}
              {!isLogin && role === 'child' && (
                <>
                  <div className="form-group">
                    <label>Child Name</label>
                    <div className="input-wrapper">
                      <User size={20} />
                      <input
                        type="text"
                        placeholder="Enter child's name"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Child Age</label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        placeholder="Enter child's age"
                        min="1"
                        max="18"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                <span>{isLogin ? 'Login to Dashboard' : 'Create Account'}</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="login-footer">
              <p>Safe, secure, and transparent family management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
