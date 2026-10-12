import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useICUStore, parseJwt } from '../../store/icuStore';
import { 
  Ambulance, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Activity, 
  Sliders,
  CheckCircle,
  Zap
} from 'lucide-react';

export const PortalSelectorPage = () => {
  const { hospitals, bookings } = useICUStore();
  const navigate = useNavigate();

  const handleUserPortalClick = () => {
    const token = localStorage.getItem('icu_auth_token');
    const decoded = parseJwt(token);
    if (token && decoded && decoded.role === 'USER') {
      navigate('/user/dashboard');
    } else {
      navigate('/user/login');
    }
  };

  const handleHospitalPortalClick = () => {
    const token = localStorage.getItem('icu_auth_token');
    const decoded = parseJwt(token);
    if (token && decoded && decoded.role === 'HOSPITAL') {
      navigate('/hospital/dashboard');
    } else {
      navigate('/hospital/login');
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '1rem auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          padding: '0.3rem 0.8rem',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          ROLE-BASED ACCESS GATEWAY
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>Select Your Operational Role</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Test the dual-perspective reactive workflow from either the ambulance transport or hospital command perspective.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* User / Ambulance Portal Card */}
        <div 
          className="glass-panel card-clickable" 
          onClick={handleUserPortalClick}
          style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            borderTop: '4px solid var(--accent-cyan)',
            position: 'relative'
          }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <Ambulance size={30} />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              Perspective 1
            </div>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
              User & Ambulance Portal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              For paramedics, ambulance drivers, emergency dispatchers, and patient family attendants needing immediate bed reservations.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              OPERATIONAL CAPABILITIES:
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="var(--accent-cyan)" />
                <span>Search nearest ICU beds by city & equipment</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="var(--accent-cyan)" />
                <span>Submit structured triage booking tickets</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="var(--accent-cyan)" />
                <span>Live status tracking with assigned bed unit</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="var(--accent-cyan)" />
                <span>Turn-by-turn emergency navigation & GPS corridor telemetry</span>
              </li>

            </ul>
          </div>

          <button onClick={handleUserPortalClick} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', gap: '0.5rem' }}>
            <span>Enter User Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Hospital Command Center Card */}
        <div 
          className="glass-panel card-clickable" 
          onClick={handleHospitalPortalClick}
          style={{
            padding: '2.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            borderTop: '4px solid #10b981',
            position: 'relative'
          }}
        >
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}>
              <Activity size={12} />
              <span>{pendingCount} INCOMING REQUESTS</span>
            </span>
          )}

          <div style={{
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(14, 165, 233, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <Building2 size={30} />
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
              Perspective 2
            </div>
            <h2 style={{ fontSize: '1.5rem', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
              Hospital Command Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              For chief medical officers, ICU nurses, and emergency room bed managers reviewing inbound transfer cases.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              OPERATIONAL CAPABILITIES:
            </div>
            <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Live telemetry matrix & surge threshold alarms</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Unit-level ICU bed management (ICU-101...)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Accept modal with dynamic bed assignment</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#10b981" />
                <span>Smart diversion with automated rationale</span>
              </li>
            </ul>
          </div>

          <button onClick={handleHospitalPortalClick} className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <span>Enter Command Center</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
