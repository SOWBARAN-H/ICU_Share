import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Bed, 
  CheckCircle2, 
  Users, 
  Clock, 
  AlertCircle,
  Siren,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Check,
  Ban
} from 'lucide-react';

export const HospitalDashboardPage = () => {
  const { 
    currentHospitalId, 
    setCurrentHospitalId,
    hospitals, 
    bookings, 
    beds,
    acceptBooking,
    rejectBooking 
  } = useICUStore();

  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];
  const hospitalBeds = beds[currentHospital.id] || [];

  const hospitalBookings = bookings.filter(b => b.hospitalId === currentHospital.id);
  const pendingRequests = hospitalBookings.filter(b => b.status === 'PENDING');

  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  const availableBeds = hospitalBeds.filter(b => b.status === 'AVAILABLE');
  const allNetworkPending = bookings.filter(b => b.status === 'PENDING');
  const otherPending = bookings.filter(b => b.status === 'PENDING' && b.hospitalId !== currentHospital.id);

  const handleQuickAccept = async (booking) => {
    const targetHospId = booking.hospitalId || currentHospital.id;
    const targetHospitalBeds = beds[targetHospId] || [];
    const availBeds = targetHospitalBeds.filter(b => b.status === 'AVAILABLE');
    
    if (availBeds.length === 0) {
      alert(`Cannot accept booking: No ICU beds in AVAILABLE status at ${currentHospital.name}. Please register or free a bed first.`);
      return;
    }

    const targetBed = availBeds[0].id;
    try {
      const res = await acceptBooking(booking.id, targetBed);
      const allocatedBedId = res?.assignedBedId || res?.assigned_bed_id || targetBed;
      setActionSuccessMessage(`Accepted ${booking.id} and allocated available ICU Bed: ${allocatedBedId} for ${booking.patientName}!`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to accept booking', err);
    }
  };

  const handleQuickReject = async (booking) => {
    await rejectBooking(booking.id, 'No suitable ICU bed available due to emergency surge.');
    setActionSuccessMessage(`Declined transfer request ${booking.id}. Attendant alerted.`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const totalBedsCount = currentHospital.totalBeds || hospitalBeds.length || 0;
  const occupiedBedsCount = currentHospital.occupiedBeds ?? hospitalBeds.filter(b => b.status === 'OCCUPIED').length;
  const occupancyPercent = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Command Center Banner (Screenshot 4) */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="pulse-indicator green" style={{ width: 7, height: 7 }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                HOSPITAL DESK ONLINE
              </span>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.12rem 0.55rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#059669'
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }}></span>
              <span>API CONNECTED • PORT 8000 (SQLite LIVE)</span>
            </div>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
            {currentHospital.name}
          </h1>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {currentHospital.area || currentHospital.city} • Institutional ICU Portal
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link 
            to="/hospital/beds"
            className="btn btn-secondary"
            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Bed size={16} />
            <span>Manage All Beds ({currentHospital.totalBeds ?? 50})</span>
          </Link>
          <Link 
            to="/hospital/bookings"
            className="btn btn-primary"
            style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Siren size={16} />
            <span>Pending Requests ({pendingRequests.length})</span>
          </Link>
        </div>
      </div>

      {actionSuccessMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          color: '#10b981',
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* 5 Critical Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        {/* Total Beds */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <Bed size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL ICU BEDS</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {currentHospital.totalBeds ?? 50}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Registered units
          </div>
        </div>

        {/* Available Now */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>AVAILABLE NOW</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {currentHospital.availableBeds ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Immediate intake ready
          </div>
        </div>

        {/* Occupied */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
            <Users size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>OCCUPIED</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {currentHospital.occupiedBeds ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {occupancyPercent}% ward capacity
          </div>
        </div>

        {/* Reserved Incoming */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', marginBottom: '0.5rem' }}>
            <Clock size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>RESERVED BEDS</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {currentHospital.reservedBeds ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Reserved for confirmed bookings
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '0.5rem' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>PENDING REQUESTS</span>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ef4444', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Action required
          </div>
        </div>
      </div>

      {/* Incoming ICU Booking Requests Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
            <span>INCOMING ICU BOOKING REQUESTS ({pendingRequests.length} Pending for {currentHospital.name})</span>
          </div>

          <Link to="/hospital/bookings" style={{ fontSize: '0.8125rem', color: 'var(--teal-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>Manage All Requests</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="card" style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '2px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem'
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              No pending requests for {currentHospital.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '500px' }}>
              Your triaging queue for this node is clear. Inbound emergency and transfer requests will stream in real time.
            </p>

            {otherPending.length > 0 && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1.25rem',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                textAlign: 'left',
                width: '100%',
                maxWidth: '650px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={15} />
                  <span>Network Notice: {otherPending.length} pending request(s) waiting at other hospitals:</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {otherPending.map(op => {
                    const hospObj = hospitals.find(h => h.id === op.hospitalId);
                    return (
                      <button
                        key={op.id}
                        onClick={() => setCurrentHospitalId(op.hospitalId)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.78rem', fontWeight: 700, borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb' }}
                      >
                        Switch to {hospObj?.name || op.hospitalId} ({op.id} • {op.patientName})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map(req => (
              <div 
                key={req.id} 
                className="card" 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--teal-primary)', fontSize: '0.95rem' }}>{req.id}</span>
                    <span className="badge badge-critical">{req.acuity}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• ETA {req.transitEta || '10 mins'}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{req.patientName} ({req.age || 50}y, {req.gender || 'F'})</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {req.callerName || 'EMS Attendant'} ({req.callerPhone}) • From: {req.pickupLocation || req.currentLocation}
                  </div>
                  {req.requiredFacilities && req.requiredFacilities.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {req.requiredFacilities.map(f => (
                        <span key={f} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => handleQuickAccept(req)}
                    className="btn btn-sm btn-primary"
                    disabled={availableBeds.length === 0}
                    style={{ 
                      background: availableBeds.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#9ca3af', 
                      fontWeight: 700, 
                      gap: '0.3rem',
                      opacity: availableBeds.length === 0 ? 0.6 : 1,
                      cursor: availableBeds.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                    title={availableBeds.length > 0 ? `Allocate bed ${availableBeds[0].id}` : 'No available beds'}
                  >
                    <Check size={14} />
                    <span>{availableBeds.length > 0 ? `Accept & Assign (${availableBeds[0].id})` : 'No Beds Available'}</span>
                  </button>
                  <button 
                    onClick={() => handleQuickReject(req)}
                    className="btn btn-sm btn-secondary"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 600, gap: '0.3rem' }}
                  >
                    <Ban size={14} />
                    <span>Decline</span>
                  </button>
                  <Link to="/hospital/bookings" className="btn btn-sm btn-secondary" style={{ fontWeight: 600 }}>
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ICU Bed Inventory Quickview */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.85rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ICU Bed Inventory Quickview
          </h3>
          <Link to="/hospital/beds" style={{ fontSize: '0.8125rem', color: 'var(--teal-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span>View All Beds</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {hospitalBeds.slice(0, 5).map(b => (
            <div key={b.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.id}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  background: b.status === 'AVAILABLE' ? '#dcfce7' : '#fef3c7',
                  color: b.status === 'AVAILABLE' ? '#15803d' : '#b45309'
                }}>
                  ● {b.status}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {b.ward || 'Trauma Care'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
