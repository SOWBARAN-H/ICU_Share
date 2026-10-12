import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Bed, 
  Activity, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export const HospitalDetailPage = () => {
  const { hospitalId } = useParams();
  const { hospitals, beds } = useICUStore();
  const navigate = useNavigate();

  const hospital = hospitals.find(h => h.id === hospitalId) || hospitals[0];
  const hospitalBeds = beds[hospital.id] || [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Bed Locator</span>
        </button>
      </div>

      {/* Hospital Hero Banner */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className={`badge ${hospital.type === 'Government' ? 'badge-high' : 'badge-stable'}`}>
                {hospital.type} Trauma Center
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} />
                <span>Last Telemetry Sync: {hospital.lastSynced}</span>
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', marginTop: '0.4rem', color: 'var(--text-primary)' }}>
              {hospital.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              <MapPin size={15} color="var(--accent-cyan)" />
              <span>{hospital.area}, {hospital.city}</span>
              <span>•</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{hospital.distanceKm} km from current GPS</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Link to={`/user/book/${hospital.id}`} className="btn btn-primary btn-lg" style={{ gap: '0.5rem' }}>
              <span>Initiate ICU Intake</span>
              <ChevronRight size={18} />
            </Link>
            <Link to={`/user/route/${hospital.id}`} className="btn btn-outline btn-sm">
              <span>View Route Corridor</span>
            </Link>
          </div>
        </div>

        {/* Quick Contacts Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          background: 'rgba(0,0,0,0.25)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EMERGENCY HOTLINE</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
              <Phone size={15} />
              <span>{hospital.emergencyContact}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CASUALTY RECEPTION</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {hospital.phone}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CRITICAL CARE HEAD</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {hospital.doctorInCharge}
            </div>
          </div>
        </div>
      </div>

      {/* Bed Telemetry & Unit Capabilities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Real-time Inventory Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Live Bed Inventory</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{hospital.availableBeds}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>AVAILABLE NOW</div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{hospital.reservedBeds}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>RESERVED (IN-TRANSIT)</div>
            </div>
            <div style={{ background: 'rgba(100, 116, 139, 0.08)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{hospital.occupiedBeds}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>OCCUPIED</div>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>{hospital.maintenanceBeds || 1}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6' }}>STERILIZING / MAINT</div>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            All available units are equipped with standard multi-channel telemetry monitors, defibrillators, arterial line transducers, and centralized nurse alarms.
          </p>
        </div>

        {/* Specialized Facilities List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Life-Support Unit Capabilities</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hospital.facilities.map(f => (
              <div key={f} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{f}</span>
                </div>
                <span className="badge badge-stable" style={{ fontSize: '0.7rem' }}>Certified Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bed Unit Grid Inspection */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Designated Bed Units Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem' }}>
          Upon hospital acceptance, one of these specific units is locked and linked to the ambulance booking ticket.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {hospitalBeds.map(bed => {
            const isAvail = bed.status === 'AVAILABLE';
            const isRes = bed.status === 'RESERVED';
            const isOcc = bed.status === 'OCCUPIED';

            return (
              <div key={bed.id} style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: isAvail ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${isAvail ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{bed.unitNumber}</span>
                  <span className={`badge ${
                    isAvail ? 'badge-available' : isRes ? 'badge-reserved' : isOcc ? 'badge-occupied' : 'badge-maintenance'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {bed.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{bed.type}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{bed.floor}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
