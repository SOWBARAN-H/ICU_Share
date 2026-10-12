import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useICUStore, parseJwt } from '../../store/icuStore';
import { 
  Activity, 
  Bed, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Zap, 
  Layers, 
  HeartHandshake,
  CheckCircle,
  Building2,
  Navigation,
  Ambulance
} from 'lucide-react';

export const LandingPage = () => {
  const { hospitals } = useICUStore();
  const navigate = useNavigate();

  const totalTracked = hospitals.reduce((acc, h) => acc + (h.totalBeds || 0), 0);
  const totalAvailable = hospitals.reduce((acc, h) => acc + (h.availableBeds || 0), 0);
  const totalOccupied = hospitals.reduce((acc, h) => acc + (h.occupiedBeds || 0), 0);
  const totalReserved = hospitals.reduce((acc, h) => acc + (h.reservedBeds || 0), 0);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 1rem',
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '450px',
          height: '250px',
          background: 'radial-gradient(ellipse, rgba(6, 182, 212, 0.18) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 80%)',
          filter: 'blur(50px)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1.25rem',
          letterSpacing: '0.04em'
        }}>
          <Activity size={14} className="pulse-indicator green" style={{ width: 8, height: 8 }} />
          <span>ACADEMIC PROTOTYPE • REGIONAL CRITICAL CARE MATRIX</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          Multi-Hospital ICU Resource &{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--teal-primary, #0d9488) 0%, #0284c7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Life-Support Allocation Matrix
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Bridging the critical golden-hour gap between ALS ambulance triage and hospital ICU admission with reactive, real-time inventory synchronization across public and private hospitals.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={handleUserPortalClick} 
            className="btn btn-primary btn-lg" 
            style={{ gap: '0.65rem' }}
          >
            <Ambulance size={19} />
            <span>User Portal</span>
          </button>
          <button 
            onClick={handleHospitalPortalClick} 
            className="btn btn-secondary btn-lg" 
            style={{ gap: '0.65rem', borderColor: '#10b981', color: '#10b981' }}
          >
            <Building2 size={19} />
            <span>Hospital Portal</span>
          </button>
          <Link to="/how-it-works" className="btn btn-secondary btn-lg">
            <span>Explore 4-Step Architecture</span>
          </Link>
          <Link to="/portal" className="btn btn-outline btn-lg" style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}>
            <span>Portal Gateway</span>
          </Link>
        </div>
      </section>

      {/* Real-time Telemetry Stat Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid var(--accent-cyan)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Regional Beds Tracked
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {totalTracked}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <Activity size={13} />
            <span>Across 6 connected hubs</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #10b981' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Available & Ready
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
            {totalAvailable}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Sterilized & staff-allocated
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Reserved In-Transit
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
            {totalReserved}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Locked for ALS ambulance transit
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Average Allocation Time
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
            &lt; 90s
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            vs 28 mins traditional phone triage
          </div>
        </div>
      </section>

      {/* Live Regional Hospitals Snapshot */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Live Regional Telemetry Hubs</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Real-time synchronization across critical care centers in Chennai and Coimbatore
            </p>
          </div>
          <Link to="/user/dashboard" className="btn btn-secondary btn-sm" style={{ gap: '0.35rem' }}>
            <span>View Full Matrix</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {hospitals.slice(0, 3).map(h => (
            <div key={h.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{h.name}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <MapPin size={12} />
                    <span>{h.area}, {h.city}</span>
                  </div>
                </div>
                <span className={`badge ${h.type === 'Government' ? 'badge-high' : 'badge-stable'}`}>
                  {h.type}
                </span>
              </div>

              {/* Bed Metrics bar */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ready ICU Beds:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{h.availableBeds} / {h.totalBeds} AVAILABLE</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${(h.availableBeds / h.totalBeds) * 100}%`, background: '#10b981' }} />
                  <div style={{ width: `${(h.reservedBeds / h.totalBeds) * 100}%`, background: '#f59e0b' }} />
                  <div style={{ width: `${(h.occupiedBeds / h.totalBeds) * 100}%`, background: '#64748b' }} />
                </div>
              </div>

              {/* Facilities tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {h.facilities.slice(0, 4).map(f => (
                  <span key={f} style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)'
                  }}>
                    {f}
                  </span>
                ))}
                {h.facilities.length > 4 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.15rem' }}>
                    +{h.facilities.length - 4} more
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                  Synced {h.lastSynced}
                </span>
                <Link to={`/user/book/${h.id}`} className="btn btn-primary btn-sm">
                  Request Intake
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Innovation Pillars */}
      <section className="glass-panel" style={{ padding: '2.5rem 1.5rem', border: '1px solid var(--border-color-light)' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Core Network Capabilities</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Built specifically to solve multi-casualty transit uncertainty, equipment mismatch, and hospital capacity blindness.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              flexShrink: 0
            }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Zero-Latency Sync Matrix</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Ambulance dispatchers and hospital doctors share the identical synchronized state layer. Any admission or bed hold updates in milliseconds.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              flexShrink: 0
            }}>
              <Bed size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Unit-Level Bed Locking</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Rather than generic headcounts, allocations lock specific sterilized units (e.g. ICU-102 Ventilator Suite), preventing dual-booking conflicts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Acuity-Based Triage Protocol</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Categorizes intakes by Critical, High, Moderate, and Stable tiers, routing high-urgency cardiac and polytrauma patients to verified ECMO/CCU hubs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0
            }}>
              <Navigation size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Smart Diversion & Corridor Routing</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                If a hospital triggers a surge rejection, the platform automatically recalculates alternative regional hubs and plots emergency transit routes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
