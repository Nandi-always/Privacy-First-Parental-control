import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      notify.success('Login successful!');
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
      const payload = { name: childName || 'User', email, password, role };
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
            <span className="brand-name">SafeGuard</span>
          </div>
          <nav className="header-nav">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="login-hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Smart Digital Safety for Families</h1>
            <p className="hero-subtitle">
              Protect your children with privacy-first monitoring, transparent rules, and real-time insights
            </p>
            
            <div className="hero-features">
              <div className="hero-feature">
                <div className="feature-icon">⏱️</div>
                <h3>Screen Time Control</h3>
                <p>Set daily limits, app-specific timers, and time slots for healthy device usage</p>
              </div>
              <div className="hero-feature">
                <div className="feature-icon">🚫</div>
                <h3>Smart App Rules</h3>
                <p>Block/allow apps by category, set custom rules, and approve new downloads</p>
              </div>
              <div className="hero-feature">
                <div className="feature-icon">📍</div>
                <h3>Location Tracking</h3>
                <p>Live GPS tracking, location history, and most visited places</p>
              </div>
              <div className="hero-feature">
                <div className="feature-icon">🆘</div>
                <h3>Emergency SOS</h3>
                <p>Children can send emergency alerts with location to parents instantly</p>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <div className="auth-card">
            <div className="auth-card-inner">
              {/* Tab Switcher */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
                <button
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

                {/* Role Selection */}
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
                        <span className="role-icon">👨‍👩‍👧</span>
                        <span className="role-label">Parent</span>
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
                        <span className="role-icon">👧</span>
                        <span className="role-label">Child</span>
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
                        max="18"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        required
                        className="form-input"
                        style={{ width: '100%', padding: '10px 12px' }}
                      />
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
    </div>
  );
};

export default LoginPage;
