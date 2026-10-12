import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  Smartphone, 
  Monitor,
  Activity
} from 'lucide-react';

export const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Hospital Manages ICU Bed Inventory',
      actor: 'Hospital Portal',
      desc: 'Hospitals sign into the institutional dashboard. The hospital manages ICU bed status (Available, Occupied, Reserved, Maintenance) across specialized units (Ventilator, Cardiac ICU, ECMO, Pediatric ICU, Trauma ICU, Isolation ICU).',
      highlight: 'Bed counts are computed directly from database records.',
      icon: Building2
    },
    {
      num: '02',
      title: 'User Searches Hospitals with ICU Availability',
      actor: 'User / Attendant Portal',
      desc: 'Users search hospitals by location, distance, hospital type, and facility requirements. Indicators display ready ICU bed counts, address, and specialized facilities.',
      highlight: 'Database-backed availability provides transparent hospital capacity.',
      icon: Search
    },
    {
      num: '03',
      title: 'User Submits ICU Booking Request',
      actor: 'User Portal',
      desc: 'The user submits an ICU booking request specifying patient name, mobile number, severity (Critical, High, Moderate, Stable), beds required, facilities, and current location.',
      highlight: 'Initial request status is set to PENDING (Waiting for Hospital Decision).',
      icon: Send
    },
    {
      num: '04',
      title: 'Hospital Accepts or Rejects Request',
      actor: 'Hospital Portal',
      desc: 'The hospital reviews pending requests. If accepted, an available bed is reserved (preventing double booking) and booking becomes CONFIRMED. If rejected, the user receives rule-based alternative recommendations.',
      highlight: 'User receives notification and can manually select another hospital.',
      icon: CheckCircle2
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
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
          SYSTEM ARCHITECTURE & PROTOCOL
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>
          How ICU Share Coordination Works
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          A full-stack web-based platform connecting users with hospitals having ICU availability, allowing hospitals to manage ICU beds and respond to booking requests.
        </p>
      </div>

      {/* 4-Step Interactive Workflow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          return (
            <div
              key={step.num}
              onClick={() => setActiveStep(idx)}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)',
                background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-glass)',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'
                }}>
                  {step.num}
                </span>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}>
                  <Icon size={18} />
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {step.actor}
              </div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {step.desc}
              </p>
              <div style={{
                fontSize: '0.74rem',
                color: isSelected ? '#38bdf8' : 'var(--text-muted)',
                fontStyle: 'italic',
                borderTop: '1px dashed var(--border-color)',
                paddingTop: '0.5rem'
              }}>
                ✦ {step.highlight}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Portal Communication Architecture Diagram */}
      <section className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-color-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Cross-Portal Communication Architecture</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Real-time reactive synchronization connecting User/Ambulance and Hospital Command perspectives
            </p>
          </div>
          <span className="badge badge-stable" style={{ gap: '0.4rem' }}>
            <Activity size={12} />
            <span>Bi-Directional Event Bus Active</span>
          </span>
        </div>

        {/* Interactive Visual SVG Diagram */}
        <div style={{
          background: 'rgba(7, 12, 20, 0.8)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            width: '100%',
            maxWidth: '1100px'
          }}>
            {/* Left Node: Ambulance / User */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <Smartphone size={20} color="var(--accent-cyan)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>USER & AMBULANCE PORTAL</span>
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', listStyle: 'none' }}>
                <li>✓ Live hospital bed query</li>
                <li>✓ Acuity triage submission</li>
                <li>✓ Real-time status ticket tracking</li>
                <li>✓ Instant transit corridor routing</li>
              </ul>
            </div>

            {/* Center Node: Reactive Shared State Store */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
              border: '2px dashed var(--accent-cyan)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>
                <Database size={20} />
                <span>UNIFIED SQLALCHEMY & WEBSOCKET ENGINE</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                FastAPI REST APIs + Live WebSocket Matrix
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                Authoritative SQLite database synchronizes seamlessly across all connected portals in real time.
              </p>

            </div>

            {/* Right Node: Hospital Command Center */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <Monitor size={20} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>HOSPITAL COMMAND CENTER</span>
              </div>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', listStyle: 'none' }}>
                <li>✓ Unit-level bed state management</li>
                <li>✓ Audible incoming triage queue</li>
                <li>✓ Dynamic bed allocation & lock</li>
                <li>✓ Automated surge diversion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <Link to="/portal" className="btn btn-primary btn-lg">
          Experience Live Dual-Perspective Workflow Now
        </Link>
      </div>
    </div>
  );
};
