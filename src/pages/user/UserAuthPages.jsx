import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { Ambulance, Shield, ArrowRight, CheckCircle2, User, AlertCircle, Loader } from 'lucide-react';

export const UserLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loginUser } = useICUStore();
  const navigate = useNavigate();
  const location = useLocation();

  const roleMismatch = location.state?.roleMismatch;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser({ email, password });
      const destination = location.state?.from?.pathname || '/user/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email/phone and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('user@icushare.org');
    setPassword('UserPass123!');
    setLoading(true);
    setError(null);
    try {
      await loginUser({ email: 'user@icushare.org', password: 'UserPass123!' });
      const destination = location.state?.from?.pathname || '/user/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo authentication failed. Please ensure the backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
            marginBottom: '0.75rem'
          }}>
            <User size={24} />
          </div>
          <h1 style={{ fontSize: '1.6rem' }}>User & Attendant Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Access regional ICU bed search and submit bed booking requests
          </p>
        </div>

        {roleMismatch && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#f59e0b',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>User Portal authorization required. Please sign in with a User account.</span>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginBottom: '1.25rem',
            borderColor: 'var(--accent-cyan)',
            color: 'var(--accent-cyan)',
            background: 'rgba(6, 182, 212, 0.08)'
          }}
        >
          {loading ? <Loader size={15} className="spin" /> : <User size={15} />}
          <span>One-Click Demo Login (Rahul Sharma)</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span>OR SIGN IN WITH CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or Mobile Number</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. user@icushare.org or 9876543210"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Authenticating...' : 'Sign In to ICU Share'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/user/signup" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export const UserSignupPage = () => {
  const navigate = useNavigate();
  const { registerUser } = useICUStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('Patient Attendant / Family');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser({
        name,
        mobile,
        email,
        password,
        designation
      });
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. User with this email or mobile may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem' }}>Register User / Attendant</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Create an account to search ICU availability and submit booking requests
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              placeholder="e.g. Ramesh Kumar"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              required 
              className="form-input" 
              placeholder="e.g. ramesh@example.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              required 
              className="form-input" 
              placeholder="e.g. +91 98401 23456"
              value={mobile} 
              onChange={e => setMobile(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              className="form-input" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Category</label>
            <select 
              className="form-select" 
              value={designation} 
              onChange={e => setDesignation(e.target.value)}
            >
              <option>Patient Attendant / Family</option>
              <option>Individual User</option>
              <option>Ambulance Dispatcher</option>
              <option>Healthcare Coordinator</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Registering...' : 'Register & Continue to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/user/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
