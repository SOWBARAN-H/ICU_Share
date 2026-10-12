import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Navigation,
  ArrowRight,
  X
} from 'lucide-react';

export const UserBookingsPage = () => {
  const { bookings, cancelBooking, getAlternativeHospitals } = useICUStore();
  const navigate = useNavigate();
  const [selectedRejected, setSelectedRejected] = useState(null);

  const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const pastBookings = bookings.filter(b => b.status === 'REJECTED' || b.status === 'COMPLETED');

  const alternatives = selectedRejected
    ? getAlternativeHospitals(selectedRejected.hospitalId, selectedRejected.requiredFacilities || [])
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            My ICU Bookings & Requests
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track real-time booking confirmation, bed reservation, and demo route estimate.
          </p>
        </div>

        <Link to="/user/dashboard" className="btn btn-primary" style={{ fontWeight: 600 }}>
          <Plus size={16} />
          <span>New ICU Request</span>
        </Link>
      </div>

      {/* Active Bookings Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.85rem'
        }}>
          <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
          <span>ACTIVE BOOKINGS ({activeBookings.length})</span>
        </div>

        {activeBookings.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active emergency bookings in queue.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeBookings.map(b => (
              <div 
                key={b.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Top header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal-primary)' }}>
                      {b.id}
                    </span>
                    <span style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {b.acuity}
                    </span>
                  </div>

                  <span style={{
                    background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7',
                    color: b.status === 'CONFIRMED' ? '#15803d' : '#b45309',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: b.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'
                    }}></span>
                    <span>{b.status}</span>
                  </span>
                </div>

                {/* Hospital & Patient Info */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {b.hospitalName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Patient: {b.patientName} • {b.bedsRequested || 1} Bed Requested
                  </div>
                </div>

                {/* Status Notice Banner */}
                {b.status === 'PENDING' ? (
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px',
                    padding: '0.85rem 1.15rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <Zap size={14} />
                      <span>WAITING FOR HOSPITAL RESPONSE</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#78350f' }}>
                      {b.note || 'Hospital coordination desk notified. Estimated response < 2 mins.'}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '0.85rem 1.15rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 700, fontSize: '0.8125rem' }}>
                        <CheckCircle2 size={14} />
                        <span>BED CONFIRMED & ALLOCATED: {b.assignedBedId || 'ICU-104'}</span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#166534', marginTop: '0.15rem' }}>
                        Critical care unit reserved. Ambulance emergency transit corridor cleared.
                      </div>
                    </div>
                    <Link to={`/user/route/${b.hospitalId}`} className="btn btn-sm btn-primary" style={{ fontWeight: 600 }}>
                      <Navigation size={13} />
                      <span>Transit Navigation</span>
                    </Link>
                  </div>
                )}

                {/* Facilities */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Facilities:</span>
                  {(b.requiredFacilities || ['Ventilator', 'Cardiac ICU']).map(fac => (
                    <span 
                      key={fac}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '4px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem'
                      }}
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                {/* Cancel action */}
                {b.status === 'PENDING' && (
                  <div>
                    <button
                      onClick={() => cancelBooking(b.id)}
                      style={{
                        background: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fecdd3',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past & Resolved Tickets */}
      <div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.85rem'
        }}>
          PAST & RESOLVED BOOKINGS ({pastBookings.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pastBookings.map(b => (
            <div 
              key={b.id}
              className="card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal-primary)' }}>
                  {b.id}
                </span>

                <span style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }}></span>
                  <span>{b.status}</span>
                </span>
              </div>

              {/* Hospital & Patient */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {b.hospitalName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Patient: {b.patientName}
                </div>
              </div>

              {/* Notice Box for Rejection */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                padding: '0.85rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.8125rem' }}>
                  <AlertTriangle size={14} />
                  <span>Booking Unavailable</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#991b1b' }}>
                  Reason: {b.rejectionReason || 'No suitable ICU bed available due to emergency surge.'}
                </div>
                <div>
                  <button
                    onClick={() => setSelectedRejected(b)}
                    className="btn btn-sm btn-primary"
                    style={{ fontWeight: 600, fontSize: '0.78rem', marginTop: '0.25rem' }}
                  >
                    Find Alternative Hospital
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Recommendations Modal */}
      {selectedRejected && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Alternative Nearby ICU Facilities
              </h3>
              <button onClick={() => setSelectedRejected(null)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              The regional matrix located {alternatives.length} nearby critical care centers with available intake beds:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {alternatives.map(alt => (
                <div key={alt.id} style={{
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{alt.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{alt.distanceKm} km • {alt.availableBeds} beds available</div>
                  </div>
                  <Link to={`/user/book/${alt.id}`} className="btn btn-sm btn-primary">
                    Book Now
                  </Link>
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedRejected(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
