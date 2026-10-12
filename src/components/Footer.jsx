import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
      padding: '3rem 1.5rem 1.5rem',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '2.5rem',
        paddingBottom: '2.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Network Identity & Mission */}
        <div style={{ maxWidth: '340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'var(--teal-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                ICU<span style={{ fontWeight: 400, color: 'var(--teal-primary)' }}>Share</span>
              </div>
              <div style={{ fontSize: '0.625rem', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                REGIONAL CRITICAL CARE NETWORK
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Regional Critical Care Coordination Network. Real-time ICU bed visibility, priority transfer triaging, and surge management across healthcare systems.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="var(--teal-primary)" />
            <span>Designed with healthcare privacy & security principles in mind. Academic & research demonstration.</span>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            PLATFORM
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/" style={{ color: 'var(--text-secondary)' }}>Regional Matrix</Link></li>
            <li><Link to="/how-it-works" style={{ color: 'var(--text-secondary)' }}>How It Works</Link></li>
            <li><Link to="/clinical-impact" style={{ color: 'var(--text-secondary)' }}>Clinical Impact</Link></li>
            <li><Link to="/portal" style={{ color: 'var(--text-secondary)' }}>Portal Selector</Link></li>
          </ul>
        </div>

        {/* Portals Links */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            PORTALS
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/user/dashboard" style={{ color: 'var(--text-secondary)' }}>User & Ambulance Portal</Link></li>
            <li><Link to="/hospital/dashboard" style={{ color: 'var(--text-secondary)' }}>Hospital Command Login</Link></li>
            <li><Link to="/hospital/signup" style={{ color: 'var(--text-secondary)' }}>Register New Facility</Link></li>
            <li><Link to="/user/signup" style={{ color: 'var(--text-secondary)' }}>Create Attendant Account</Link></li>
          </ul>
        </div>

        {/* Regional Dispatch */}
        <div>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '1rem' }}>
            REGIONAL DISPATCH
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={14} color="var(--teal-primary)" />
              <span>24/7 Hotline: +91 (044) 4000-ICUS</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={14} color="var(--teal-primary)" />
              <span>dispatch@icushare.network</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} color="var(--teal-primary)" />
              <span>Tamil Nadu State Emergency Command Matrix</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Sub-footer */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <div>
          © 2026 ICUShare Regional Critical Care Network. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-primary)', fontWeight: 500 }}>
          <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
          <span>Demo Network Connected</span>
        </div>
      </div>
    </footer>
  );
};
