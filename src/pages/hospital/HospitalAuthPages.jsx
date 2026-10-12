import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { Building2, Shield, ArrowRight, CheckCircle2, Loader, AlertCircle } from 'lucide-react';

export const HospitalLoginPage = () => {
  const { setCurrentHospitalId, hospitals, loginHospital } = useICUStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [instId, setInstId] = useState('TN-CMC-APOLLO-9021');
  const [pin, setPin] = useState('HospitalPass123!');

  const roleMismatch = location.state?.roleMismatch;

  const hospitalCredentials = {
    'hosp-1': { reg: 'TN-CMC-APOLLO-9021', pass: 'HospitalPass123!' },
    'hosp-2': { reg: 'TN-CMC-GV-1100', pass: 'HospitalPass123!' },
    'hosp-3': { reg: 'TN-CMC-GH-003', pass: 'HospitalPass123!' },
    'hosp-4': { reg: 'TN-CMC-KM-4000', pass: 'HospitalPass123!' },
    'hosp-5': { reg: 'TN-CMC-CMCH-5000', pass: 'HospitalPass123!' },
    'hosp-6': { reg: 'TN-CMC-GANGA-6000', pass: 'HospitalPass123!' }
  };

  const handleSelectHospital = async (hospId) => {
    setLoading(true);
    setError(null);
    const creds = hospitalCredentials[hospId] || { reg: 'TN-CMC-GH-003', pass: 'HospitalPass123!' };
    setInstId(creds.reg);
    setPin(creds.pass);
    try {
      await loginHospital({
        registration_id: creds.reg,
        password: creds.pass
      });
      const destination = location.state?.from?.pathname || '/hospital/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Institutional authentication failed. Ensure backend server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginHospital({
        registration_id: instId,
        password: pin || 'HospitalPass123!'
      });
      const destination = location.state?.from?.pathname || '/hospital/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid institutional credentials. Please check your registration ID and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            marginBottom: '0.75rem'
          }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.7rem' }}>Hospital Portal Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Hospital gateway for ICU Bed Management and Booking Request Processing
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
            <span>Hospital Command authorization required. Please sign in with institutional credentials.</span>
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

        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.75rem' }}>
          SELECT DEMO HOSPITAL TO SIGN IN:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {hospitals.slice(0, 3).map(h => (
            <button
              key={h.id}
              disabled={loading}
              onClick={() => handleSelectHospital(h.id)}
              className="btn btn-secondary"
              style={{
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color)',
                textAlign: 'left',
                opacity: loading ? 0.7 : 1
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{h.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.area}, {h.city} • {h.type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>{h.availableBeds} Ready Beds</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span>OR SIGN IN WITH INSTITUTIONAL CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleFormLogin}>
          <div className="form-group">
            <label className="form-label">Registration ID or Work Email</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              placeholder="e.g. TN-CMC-APOLLO-9021"
              value={instId}
              onChange={e => setInstId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              required 
              className="form-input" 
              value={pin}
              onChange={e => setPin(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Hospital Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Need to onboard a new hospital node?{' '}
          <Link to="/hospital/signup" style={{ color: '#10b981', fontWeight: 600 }}>
            Register Hospital
          </Link>
        </div>
      </div>
    </div>
  );
};

export const HospitalSignupPage = () => {
  const { registerHospital } = useICUStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    registration_id: '',
    email: '',
    password: '',
    city: 'Chennai',
    area: '',
    address: '',
    type: 'Government',
    phone: '',
    emergency_contact: '',
    doctor_in_charge: '',
    total_beds: 50
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerHospital({
        ...formData,
        total_beds: parseInt(formData.total_beds, 10) || 50
      });
      navigate('/hospital/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Hospital registration failed. Registration ID or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            marginBottom: '0.75rem'
          }}>
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.7rem' }}>Register Hospital Node</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Onboard an institutional critical care facility into the regional ICU matrix
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
            <label className="form-label">Hospital Name</label>
            <input 
              type="text" 
              required 
              className="form-input" 
              placeholder="e.g. SRM Medical Center"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Institutional Registration ID</label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="e.g. TN-CMC-SRM-8800"
                value={formData.registration_id}
                onChange={e => handleChange('registration_id', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Institutional Type</label>
              <select 
                className="form-select"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Work / Command Email</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                placeholder="icu@hospital.org"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                required 
                className="form-input" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="e.g. Chennai"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area / Locality</label>
              <input 
                type="text" 
                required 
                className="form-input" 
                placeholder="e.g. Kattankulathur"
                value={formData.area}
                onChange={e => handleChange('area', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total ICU Beds</label>
              <input 
                type="number" 
                min="1"
                required 
                className="form-input" 
                value={formData.total_beds}
                onChange={e => handleChange('total_beds', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Desk Phone</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. +91 44 2829 0200"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? 'Registering...' : 'Register Hospital & Open Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link to="/hospital/login" style={{ color: '#10b981', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
