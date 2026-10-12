import React, { useState } from 'react';
import { useICUStore } from '../../store/icuStore';
import { 
  Building2, 
  Moon, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  RefreshCw 
} from 'lucide-react';
import { Footer } from '../../components/Footer';

export const HospitalSettingsPage = () => {
  const { 
    currentHospitalId, 
    hospitals, 
    theme, 
    toggleTheme 
  } = useICUStore();

  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];

  const [surgeAlarmActive, setSurgeAlarmActive] = useState(true);
  const [autoAcceptStepDown, setAutoAcceptStepDown] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: '1080px', width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Hospital Command Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Facility identity, surge thresholds, and emergency telemetry configuration.
          </p>
        </div>

        {/* 4 Cards in 2x2 Grid (Screenshot 8) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1: Institutional Identity */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Institutional Identity
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Facility details registered on regional dispatch
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  FACILITY NAME:
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {currentHospital.name}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  REGIONAL NODE ID:
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--teal-primary)', marginTop: '0.1rem' }}>
                  {currentHospital.nodeId || 'H003 (TN-DISPATCH)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  CHIEF ICU ADMINISTRATOR:
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {currentHospital.doctorInCharge || 'ICU Medical Director'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  LOCATION / DISTRICT:
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  Chennai Central
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Theme & Command Display */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                <Moon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Theme & Command Display
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Display controls for intensive care monitoring
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  Low-Light Command Theme (Dark Mode)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Optimized for ICU control rooms and night shifts
                </div>
              </div>

              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={theme === 'dark'} 
                  onChange={toggleTheme} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Card 3: Surge Thresholds & Triage Protocols */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Surge Thresholds & Triage Protocols
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Automated rules for critical patient transfers
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    High-Occupancy Surge Alarm (&gt; 85%)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Send regional broadcast when facility exceeds 85% capacity
                  </div>
                </div>

                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={surgeAlarmActive} 
                    onChange={(e) => setSurgeAlarmActive(e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color-light)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Auto-Accept Step-Down Transfers
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Automatically approve Priority 3 stable transfers if beds &gt; 5
                  </div>
                </div>

                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={autoAcceptStepDown} 
                    onChange={(e) => setAutoAcceptStepDown(e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Card 4: Telemetry & Sync Health */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                <Activity size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Telemetry & Sync Health
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  State matrix and cross-tab event synchronization
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Real-Time State Layer</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
                  <span>Connected & Reactive</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>LocalStorage Data Bus</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
                  <span>Active (Cross-Tab Synced)</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sync Frequency</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
                  <span>20s Polling Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
