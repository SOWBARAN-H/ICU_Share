import React, { useState } from 'react';
import { useICUStore } from '../../store/icuStore';
import { 
  CheckCircle2, 
  XCircle, 
  X, 
  Eye, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Bed,
  Check,
  Ban
} from 'lucide-react';
import { Footer } from '../../components/Footer';

export const HospitalBookingsPage = () => {
  const { currentHospitalId, setCurrentHospitalId, hospitals, bookings, beds, acceptBooking, rejectBooking } = useICUStore();

  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];
  const hospitalBeds = beds[currentHospital.id] || [];
  const availableBeds = hospitalBeds.filter(b => b.status === 'AVAILABLE');

  // Bookings destined for this hospital
  const hospitalBookings = bookings.filter(b => b.hospitalId === currentHospital.id);

  const [activeTab, setActiveTab] = useState('PENDING'); // Default to 'PENDING' triage queue so accepted/rejected tickets disappear immediately
  const [viewingBooking, setViewingBooking] = useState(null);
  const [allocatedBedId, setAllocatedBedId] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  const counts = {
    ALL: hospitalBookings.length,
    PENDING: hospitalBookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: hospitalBookings.filter(b => b.status === 'CONFIRMED').length,
    REJECTED: hospitalBookings.filter(b => b.status === 'REJECTED').length,
  };

  const filteredBookings = hospitalBookings.filter(b => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  const availableBedsForModal = viewingBooking 
    ? (beds[viewingBooking.hospitalId || currentHospital.id] || []).filter(b => b.status === 'AVAILABLE')
    : availableBeds;

  const handleOpenDetails = (b) => {
    setViewingBooking(b);
    const targetHospId = b.hospitalId || currentHospital.id;
    const targetHospitalBeds = beds[targetHospId] || [];
    const availBeds = targetHospitalBeds.filter(bed => bed.status === 'AVAILABLE');
    setAllocatedBedId(availBeds.length > 0 ? availBeds[0].id : '');
    setRejectReasonInput('No suitable ICU bed available due to emergency surge.');
    setActionSuccessMessage(null);
  };

  const handleQuickAccept = async (booking) => {
    const targetHospId = booking.hospitalId || currentHospital.id;
    const targetHospitalBeds = beds[targetHospId] || [];
    const availBeds = targetHospitalBeds.filter(b => b.status === 'AVAILABLE');

    if (availBeds.length === 0) {
      alert(`Cannot accept booking: No ICU beds currently in AVAILABLE status at ${currentHospital.name}. Please register or free a bed first.`);
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
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleModalAccept = async () => {
    if (!viewingBooking) return;
    const targetHospId = viewingBooking.hospitalId || currentHospital.id;
    const targetHospitalBeds = beds[targetHospId] || [];
    const availBeds = targetHospitalBeds.filter(b => b.status === 'AVAILABLE');

    let bedId = allocatedBedId;
    if (!bedId || !availBeds.some(b => b.id === bedId)) {
      bedId = availBeds.length > 0 ? availBeds[0].id : null;
    }

    if (!bedId) {
      alert('Cannot accept request: No ICU beds currently available in this facility.');
      return;
    }

    try {
      const res = await acceptBooking(viewingBooking.id, bedId);
      const assignedId = res?.assignedBedId || res?.assigned_bed_id || bedId;
      setViewingBooking(null);
      setActionSuccessMessage(`Successfully accepted ${viewingBooking.id} and allocated ICU Bed: ${assignedId}!`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to accept booking from modal', err);
    }
  };

  const handleModalReject = async () => {
    if (!viewingBooking) return;
    await rejectBooking(viewingBooking.id, rejectReasonInput || 'ICU ward capacity reached.');
    setViewingBooking(null);
    setActionSuccessMessage(`Declined request ${viewingBooking.id}.`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header (Screenshot 6) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            ICU Booking Requests
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Review incoming ICU booking requests, allocate available beds, or decline requests.
          </p>
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
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Tab Filters (Screenshot 6: All Requests (3), Pending Triage (1), Confirmed (1), Rejected (1)) */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'PENDING', label: `Pending Triage (${counts.PENDING})` },
            { id: 'CONFIRMED', label: `Confirmed (${counts.CONFIRMED})` },
            { id: 'REJECTED', label: `Rejected (${counts.REJECTED})` },
            { id: 'ALL', label: `All Requests (${counts.ALL})` },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Booking Cards List */}
        {filteredBookings.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No Requests Found</h3>
            <p style={{ fontSize: '0.85rem' }}>There are no transfer requests matching the selected filter for {currentHospital.name}.</p>
            {bookings.length > 0 && (
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                  Requests exist at other hospital nodes in your network:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {Array.from(new Set(bookings.map(b => b.hospitalId))).filter(hId => hId !== currentHospital.id).map(hId => {
                    const hObj = hospitals.find(h => h.id === hId);
                    const count = bookings.filter(b => b.hospitalId === hId).length;
                    return (
                      <button
                        key={hId}
                        onClick={() => setCurrentHospitalId(hId)}
                        className="btn btn-sm btn-secondary"
                        style={{ fontSize: '0.78rem', fontWeight: 600, borderColor: '#f59e0b', color: '#b45309', background: '#fffbeb' }}
                      >
                        Switch to {hObj?.name || hId} ({count} tickets)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBookings.map(b => (
              <div 
                key={b.id} 
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                {/* Left side: Ticket ID, patient name, location */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal-primary)' }}>
                      {b.id}
                    </span>
                    <span style={{
                      background: '#f59e0b',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {b.acuity || 'MODERATE'}
                    </span>
                    <span style={{
                      background: b.status === 'REJECTED' ? '#fee2e2' : b.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7',
                      color: b.status === 'REJECTED' ? '#dc2626' : b.status === 'CONFIRMED' ? '#15803d' : '#b45309',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: b.status === 'REJECTED' ? '#dc2626' : b.status === 'CONFIRMED' ? '#10b981' : '#f59e0b'
                      }}></span>
                      <span>{b.status}</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {b.patientName}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {b.locationText || 'Egmore, Chennai • 1 hr ago'}
                  </div>
                  {b.assignedBedId && (
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                      Allocated Bed: {b.assignedBedId}
                    </div>
                  )}
                </div>

                {/* Middle details: Beds requested, facilities */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      BEDS REQUESTED
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {b.bedsRequested || 1} ICU Bed
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      FACILITIES
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }}>
                      {(b.requiredFacilities || ['Trauma ICU']).map(fac => (
                        <span 
                          key={fac}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {b.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleQuickAccept(b)}
                        className="btn btn-primary btn-sm"
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
                        onClick={() => handleQuickReject(b)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 600, gap: '0.3rem' }}
                      >
                        <Ban size={14} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleOpenDetails(b)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: 600 }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details & Bed Allocation Modal */}
      {viewingBooking && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal-primary)' }}>{viewingBooking.id}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewingBooking.patientName}
                </h3>
              </div>
              <button onClick={() => setViewingBooking(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div><strong>Status:</strong> <span className={`badge ${viewingBooking.status === 'CONFIRMED' ? 'badge-available' : viewingBooking.status === 'REJECTED' ? 'badge-critical' : 'badge-high'}`}>{viewingBooking.status}</span></div>
              <div><strong>Acuity / Severity:</strong> {viewingBooking.acuity}</div>
              <div><strong>Age / Gender:</strong> {viewingBooking.age || 50} yrs • {viewingBooking.gender || 'Female'}</div>
              <div><strong>Caller / Transit Unit:</strong> {viewingBooking.callerName || 'Private Transit'} ({viewingBooking.callerPhone})</div>
              <div><strong>Pickup Location:</strong> {viewingBooking.pickupLocation}</div>
              {viewingBooking.assignedBedId && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '6px', color: '#059669', fontWeight: 700 }}>
                  Allocated Bed: {viewingBooking.assignedBedId}
                </div>
              )}
              {viewingBooking.rejectionReason && (
                <div style={{ background: '#fff1f2', border: '1px solid #fee2e2', padding: '0.75rem', borderRadius: '8px', color: '#991b1b' }}>
                  <strong>Rejection Rationale:</strong> {viewingBooking.rejectionReason}
                </div>
              )}

              {/* Triage Action Section for PENDING */}
              {viewingBooking.status === 'PENDING' && (
                <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      Select Available ICU Bed for Allocation:
                    </label>
                    {availableBedsForModal.length > 0 ? (
                      <select 
                        className="form-select"
                        value={allocatedBedId}
                        onChange={e => setAllocatedBedId(e.target.value)}
                        style={{ fontWeight: 600 }}
                      >
                        {availableBedsForModal.map(bed => (
                          <option key={bed.id} value={bed.id}>
                            Bed ID: {bed.id} — {bed.ward} ({bed.bed_type || bed.type}) [AVAILABLE]
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 600, padding: '0.6rem 0.8rem', background: '#fef2f2', borderRadius: '6px' }}>
                        No beds currently in AVAILABLE status at this hospital.
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={handleModalAccept} 
                      disabled={availableBedsForModal.length === 0}
                      className="btn btn-primary" 
                      style={{ 
                        flex: 1, 
                        background: availableBedsForModal.length > 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#9ca3af', 
                        fontWeight: 700,
                        opacity: availableBedsForModal.length === 0 ? 0.6 : 1,
                        cursor: availableBedsForModal.length === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Check size={16} />
                      <span>{availableBedsForModal.length > 0 ? `Confirm & Reserve ${allocatedBedId || availableBedsForModal[0]?.id}` : 'No Beds Available'}</span>
                    </button>
                    <button 
                      onClick={handleModalReject} 
                      className="btn btn-secondary" 
                      style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontWeight: 600 }}
                    >
                      <Ban size={16} />
                      <span>Decline Request</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setViewingBooking(null)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
