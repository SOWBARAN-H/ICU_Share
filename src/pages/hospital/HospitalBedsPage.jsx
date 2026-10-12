import React, { useState } from 'react';
import { useICUStore } from '../../store/icuStore';
import { 
  Bed, 
  Search, 
  Plus, 
  Edit3, 
  Clock, 
  X, 
  Check, 
  Save,
  CheckCircle2
} from 'lucide-react';

export const HospitalBedsPage = () => {
  const { currentHospitalId, hospitals, beds, updateBedStatus, addBed } = useICUStore();

  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0];
  const hospitalBeds = beds[currentHospital.id] || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState(null);

  // Modal edit state
  const [editingBed, setEditingBed] = useState(null);
  const [modalStatus, setModalStatus] = useState('AVAILABLE');
  const [modalPatient, setModalPatient] = useState('');
  const [modalFreeEta, setModalFreeEta] = useState('');

  // Register new bed modal state
  const [isRegistering, setIsRegistering] = useState(false);
  const [newBedCode, setNewBedCode] = useState('');
  const [newBedWard, setNewBedWard] = useState('Ward 14 - Trauma Care Center');
  const [newBedType, setNewBedType] = useState('Trauma ICU');

  const counts = {
    ALL: hospitalBeds.length,
    AVAILABLE: hospitalBeds.filter(b => b.status === 'AVAILABLE').length,
    OCCUPIED: hospitalBeds.filter(b => b.status === 'OCCUPIED').length,
    RESERVED: hospitalBeds.filter(b => b.status === 'RESERVED').length,
    MAINTENANCE: hospitalBeds.filter(b => b.status === 'MAINTENANCE').length,
  };

  const filteredBeds = hospitalBeds.filter(b => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchWard = (b.ward || '').toLowerCase().includes(q);
      const matchType = (b.type || '').toLowerCase().includes(q);
      const matchPatient = (b.patientName || '').toLowerCase().includes(q);
      if (!matchId && !matchWard && !matchType && !matchPatient) return false;
    }
    return true;
  });

  const handleOpenEdit = (bed) => {
    setEditingBed(bed);
    setModalStatus(bed.status);
    setModalPatient(bed.patientName || '');
    setModalFreeEta(bed.freeETA || 'Today, 8:30 PM');
  };

  const handleSaveEdit = () => {
    if (!editingBed) return;
    const details = {};
    if (modalStatus === 'OCCUPIED') {
      details.patientName = modalPatient || 'Admitted Patient';
      details.patientLabel = `Admitted Patient (${modalPatient || 'Critical Care'})`;
      details.freeETA = modalFreeEta || 'Tomorrow, 12:00 PM';
    } else if (modalStatus === 'AVAILABLE') {
      details.patientName = null;
      details.patientLabel = null;
      details.note = 'Available now (Ready for Intake)';
    } else if (modalStatus === 'MAINTENANCE') {
      details.note = 'Sterilization cycle in progress';
    }
    updateBedStatus(currentHospital.id, editingBed.id, modalStatus, details);
    setEditingBed(null);
  };

  const handleRegisterBed = async (e) => {
    e.preventDefault();
    if (!newBedCode) return;
    const bedIdClean = newBedCode.trim().toUpperCase();
    const newBed = {
      id: bedIdClean,
      bed_number: bedIdClean,
      unitNumber: bedIdClean,
      ward: newBedWard,
      type: newBedType,
      bed_type: newBedType,
      status: 'AVAILABLE',
      note: 'Available now (Ready for Intake)',
      facilities: ['Ventilator']
    };
    try {
      await addBed(currentHospital.id, newBed);
      setIsRegistering(false);
      setNewBedCode('');
      setRegisterSuccessMessage(`ICU Bed ${newBed.id} successfully added to ${currentHospital.name}!`);
      setTimeout(() => setRegisterSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Failed to register new bed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
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
            ICU Bed Capacity & Unit Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Update individual bed availability, expected release times, and maintenance schedules.
          </p>
        </div>

        <button 
          onClick={() => {
            setNewBedCode(`ICU-${300 + hospitalBeds.length + 1}`);
            setIsRegistering(true);
          }}
          className="btn btn-primary"
          style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} />
          <span>Register New ICU Bed</span>
        </button>
      </div>

      {registerSuccessMessage && (
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
          <span>{registerSuccessMessage}</span>
        </div>
      )}

      {/* Search and Filters Bar (Screenshot 5) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
            placeholder="Search by bed code, unit, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']).map(st => {
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: isActive ? '#0f766e' : 'var(--bg-card)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid ' + (isActive ? '#0f766e' : 'var(--border-color)'),
                  cursor: 'pointer'
                }}
              >
                {st} ({counts[st] || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Bed Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredBeds.map(b => {
          const isAvail = b.status === 'AVAILABLE';
          return (
            <div 
              key={b.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              {/* Card top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Bed size={16} color="var(--text-muted)" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {b.id}
                  </span>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: isAvail ? '#dcfce7' : '#fef3c7',
                  color: isAvail ? '#15803d' : '#b45309'
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: isAvail ? '#10b981' : '#f59e0b' }}></span>
                  <span>{b.status}</span>
                </span>
              </div>

              {/* Ward & Unit */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  {b.ward || 'Ward 14 - Trauma Care Center'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {b.type || 'Trauma ICU'}
                </div>
              </div>

              {/* Status Box */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 0.85rem',
                minHeight: '56px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.2rem'
              }}>
                {isAvail ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                    <span>{b.note || 'Available now (Ready for Intake)'}</span>
                  </div>
                ) : b.status === 'RESERVED' ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span>
                      <span>Reserved: {b.patientName || 'Emergency Intake'}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {b.note || 'Locked for incoming ambulance transfer'}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {b.patientLabel || b.patientName || 'Admitted Patient (Polytrauma)'}
                    </div>
                    {b.freeETA && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        <span>Expected free: {b.freeETA}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Equipment Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)'
                }}>
                  Ventilator
                </span>
              </div>

              {/* Update Status Button (Full width) */}
              <button
                onClick={() => handleOpenEdit(b)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  marginTop: '0.25rem',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Edit3 size={13} />
                <span>Update Status</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Bed Modal */}
      {editingBed && (
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
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Update Bed {editingBed.id}
              </h3>
              <button onClick={() => setEditingBed(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label">CURRENT STATUS</label>
                <select
                  className="form-select"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="OCCUPIED">OCCUPIED</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              {modalStatus === 'OCCUPIED' && (
                <>
                  <div>
                    <label className="form-label">ADMITTED PATIENT</label>
                    <input
                      type="text"
                      className="form-input"
                      value={modalPatient}
                      onChange={(e) => setModalPatient(e.target.value)}
                      placeholder="e.g. Polytrauma, Bronchiolitis..."
                    />
                  </div>
                  <div>
                    <label className="form-label">EXPECTED FREE DATE & TIME</label>
                    <input
                      type="text"
                      className="form-input"
                      value={modalFreeEta}
                      onChange={(e) => setModalFreeEta(e.target.value)}
                      placeholder="e.g. Tomorrow, 4:00 PM"
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={handleSaveEdit} className="btn btn-primary" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button onClick={() => setEditingBed(null)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Bed Modal */}
      {isRegistering && (
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
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Register New ICU Bed
              </h3>
              <button onClick={() => setIsRegistering(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterBed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">BED CODE</label>
                <input
                  type="text"
                  className="form-input"
                  value={newBedCode}
                  onChange={(e) => setNewBedCode(e.target.value)}
                  placeholder="e.g. ICU-306"
                  required
                />
              </div>

              <div>
                <label className="form-label">WARD UNIT</label>
                <input
                  type="text"
                  className="form-input"
                  value={newBedWard}
                  onChange={(e) => setNewBedWard(e.target.value)}
                  placeholder="e.g. Ward 14 - Trauma Care Center"
                />
              </div>

              <div>
                <label className="form-label">CRITICAL CARE TYPE</label>
                <select
                  className="form-select"
                  value={newBedType}
                  onChange={(e) => setNewBedType(e.target.value)}
                >
                  <option value="Trauma ICU">Trauma ICU</option>
                  <option value="Pediatric ICU">Pediatric ICU</option>
                  <option value="Isolation ICU">Isolation ICU</option>
                  <option value="Cardiac CCU">Cardiac CCU</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Register Bed
                </button>
                <button type="button" onClick={() => setIsRegistering(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
