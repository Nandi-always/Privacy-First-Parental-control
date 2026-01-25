import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Shield, Eye, EyeOff, Users, Baby, MapPin, Clock, ShieldCheck, Zap, BookOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const notify = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('parent');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Modals state
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  // Effect to toggle theme based on role - DISABLED to keep consistent dark theme
  /* React.useEffect(() => {
    const loginPage = document.querySelector('.login-page');
    if (loginPage) {
      if (role === 'child') {
        loginPage.classList.add('child-mode');
      } else {
        loginPage.classList.remove('child-mode');
      }
    }
  }, [role]); */


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password, role);
      notify.success('Login successful!');
      // Route based on backend's confirmed role (after validation)
      if (user.role === 'parent') navigate('/parent-dashboard');
      else navigate('/child-dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      notify.error(errorMsg);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: childName || (role === 'parent' ? 'Parent' : 'Child'),
        email,
        password,
        role,
        age: role === 'child' ? childAge : undefined,
        parentEmail: role === 'child' ? parentEmail : undefined
      };
      const user = await register(payload);
      notify.success('Registration successful!');
      if (user?.role === 'parent') navigate('/parent-dashboard');
      else navigate('/child-dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
      notify.error(errorMsg);
    }
  };

  return (
    <div className="login-page">
      {/* Header/Navigation */}
      <header className="login-header">
        <div className="header-container">
          <div className="header-brand">
            <Shield size={32} className="brand-icon" />
            <span className="brand-name">Privacy First</span>
          </div>
          <nav className="header-nav" style={{ display: 'flex', gap: '24px' }}>
            <button className="nav-link-btn" onClick={() => setShowFeaturesModal(true)}>Features</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="login-hero">
        <div className="hero-container">
          <h1 className="centered-tagline">Privacy-First Digital Safety</h1>


          {/* Auth Card */}
          <div className="auth-card">
            <div className="auth-card-inner">
              {/* Tab Switcher */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(false)}
                >
                  Create Account
                </button>
              </div>

              {/* Auth Form */}
              <form className="auth-form" onSubmit={isLogin ? handleLogin : handleRegister}>
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-field">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-field">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>




                {/* Role Selection - Shows on login and registration */}
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <div className="role-options">
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="parent"
                        checked={role === 'parent'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span className="role-content">
                        <span className="role-icon">
                          {/* Simple Parent Icon */}
                          <svg className="role-svg simple-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <span className="role-label">PARENT</span>
                      </span>
                    </label>
                    <label className="role-option">
                      <input
                        type="radio"
                        name="role"
                        value="child"
                        checked={role === 'child'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      <span className="role-content">
                        <span className="role-icon">
                          {/* Simple Child Icon */}
                          <svg className="role-svg simple-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                          </svg>
                        </span>
                        <span className="role-label">CHILD</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Additional Fields for Registration */}
                {!isLogin && role === 'child' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div className="input-field">
                        <User size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        placeholder="Enter age"
                        min="5"
                        max="23"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        required={!isLogin && role === 'child'}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Parent's Email (to link accounts)</label>
                      <div className="input-field">
                        <Mail size={18} className="input-icon" />
                        <input
                          type="email"
                          placeholder="parent@example.com"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          required={!isLogin && role === 'child'}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {!isLogin && role === 'parent' && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-field">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                )}


                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Footer */}
                <div className="auth-footer">
                  <p className="footer-text">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      className="footer-link"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                  </p>
                  <p className="terms-text">
                    By continuing, you agree to our
                    <a href="#privacy"> Privacy Policy</a> and
                    <a href="#terms"> Terms of Service</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Modal */}
      <Modal
        isOpen={showFeaturesModal}
        onClose={() => setShowFeaturesModal(false)}
        title="Nandi: Key Project Features"
        size="lg"
      >
        <div className="features-modal-content">
          <div className="feature-grid">
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <MapPin size={24} className="classic-icon" />
              </div>
              <h3>Privacy-First Geofencing</h3>
              <p>Safe zones (Home, School) trigger alerts to parents without invasive live tracking. Locations are only shared during SOS events.</p>
            </div>
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <Clock size={24} className="classic-icon" />
              </div>
              <h3>Smart Screen Time</h3>
              <p>Collaborative time management where children can see their limits and request extensions, fostering healthy digital habits.</p>
            </div>
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <Shield size={24} className="classic-icon" />
              </div>
              <h3>Monitoring Transparency</h3>
              <p>No hidden spies. Children see exactly what data is shared with parents and what stays private (messages, camera, etc.).</p>
            </div>
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <Zap size={24} className="classic-icon" />
              </div>
              <h3>Emergency SOS</h3>
              <p>One-tap emergency alert system that notifies parents instantly with GPS coordinates when the child feels unsafe.</p>
            </div>
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={24} className="classic-icon" />
              </div>
              <h3>Privacy Center</h3>
              <p>Educational portal for children to understand their data rights and learn how the system protects their digital identity.</p>
            </div>
            <div className="feature-item-v2">
              <div className="feature-icon-wrapper">
                <ClipboardList size={24} className="classic-icon" />
              </div>
              <h3>Mutual Rule Agreements</h3>
              <p>Parents and children agree on rules together, creating a digital contract that builds trust through shared commitment.</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
