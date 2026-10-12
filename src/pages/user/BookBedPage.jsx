import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Activity, 
  ArrowLeft, 
  AlertCircle, 
  ShieldAlert, 
  Send, 
  Check, 
  MapPin, 
  User, 
  Clock,
  Phone
} from 'lucide-react';

export const BookBedPage = () => {
  const { hospitalId } = useParams();
  const { hospitals, createBooking } = useICUStore();
  const navigate = useNavigate();

  const hospital = hospitals.find(h => h.id === hospitalId) || hospitals[0];

  const [patientName, setPatientName] = useState('Kavitha Sundaram');
  const [age, setAge] = useState('54');
  const [gender, setGender] = useState('Female');
  const [acuity, setAcuity] = useState('Critical'); // 'Critical' | 'High' | 'Moderate' | 'Stable'
  const [requiredFacilities, setRequiredFacilities] = useState(['Ventilator', 'Cardiac ICU']);
  const [callerName, setCallerName] = useState('Ramesh K. (Attendant)');
  const [callerPhone, setCallerPhone] = useState('+91 98401 23456');
  const [pickupLocation, setPickupLocation] = useState('Panagal Park, T. Nagar, Chennai');
  const [transitEta, setTransitEta] = useState('12 mins');
  const [notes, setNotes] = useState('Patient experiencing acute cardiac symptoms. Urgent ICU bed reservation requested.');

  const toggleFacility = (facility) => {
    setRequiredFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const bookingPayload = {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      patientName,
      age: parseInt(age, 10) || 50,
      gender,
      acuity,
      requiredFacilities,
      callerName,
      callerPhone,
      pickupLocation,
      transitEta,
      clinicalNotes: notes
    };

    createBooking(bookingPayload);
    // Navigate immediately to bookings tracker
    navigate('/user/bookings');
  };

  const acuityOptions = [
    {
      level: 'Critical',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      title: 'CRITICAL (Tier 1)',
      desc: 'Immediate life threat, unstable vitals, mechanical ventilation or resuscitation required.'
    },
    {
      level: 'High',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.4)',
      title: 'HIGH (Tier 2)',
      desc: 'Severe distress, continuous cardiac monitoring, high potential for acute deterioration.'
    },
    {
      level: 'Moderate',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)',
      title: 'MODERATE (Tier 3)',
      desc: 'Sub-acute specialized observation, hemodynamic stability under high-risk conditions.'
    },
    {
      level: 'Stable',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      title: 'STABLE (Tier 4)',
      desc: 'Step-down transfer, elective or recovery monitoring without immediate intervention.'
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Hospital</span>
        </button>
      </div>

      {/* Target Hospital Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
          ICU BED BOOKING REQUEST FORM
        </div>
        <h1 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>
          Request ICU Bed at {hospital.name}
        </h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          <span>{hospital.area}, {hospital.city}</span>
          <span>•</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>{hospital.availableBeds} Ready Beds Available</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Patient Details */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="var(--accent-cyan)" />
            <span>1. Patient Identification & Demographics</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Patient Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input
                type="number"
                required
                min="0"
                max="120"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Acuity Level (Crucial for Triage) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>2. Clinical Acuity Tier (Emergency Priority)</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select the patient condition acuity. Critical and High priority requests trigger audible alarms on the hospital console.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {acuityOptions.map(opt => {
              const selected = acuity === opt.level;
              return (
                <div
                  key={opt.level}
                  onClick={() => setAcuity(opt.level)}
                  style={{
                    border: `2px solid ${selected ? opt.color : 'var(--border-color)'}`,
                    background: selected ? opt.bg : 'rgba(0,0,0,0.2)',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selected ? `0 0 15px ${opt.border}` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: opt.color }}>
                      {opt.title}
                    </span>
                    {selected && <Check size={16} color={opt.color} />}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {opt.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Required Life-Support Facilities */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-cyan)" />
            <span>3. Required Life-Support & Specialized Units</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Check all specialized units that must be operational upon patient arrival.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
            {hospital.facilities.map(fac => {
              const active = requiredFacilities.includes(fac);
              return (
                <div
                  key={fac}
                  onClick={() => toggleFacility(fac)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: active ? 'rgba(6, 182, 212, 0.15)' : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '4px',
                    border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color-light)'}`,
                    background: active ? 'var(--accent-cyan)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {active && <Check size={13} color="#000" />}
                  </div>
                  <span>{fac}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Dispatcher / Transit Coordinates */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--accent-cyan)" />
            <span>4. Ambulance Transit Coordinates & Contact</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Calling Team / Dispatcher</label>
              <input
                type="text"
                required
                className="form-input"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Mobile</label>
              <input
                type="tel"
                required
                className="form-input"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Estimated Transit ETA</label>
              <input
                type="text"
                required
                className="form-input"
                value={transitEta}
                onChange={(e) => setTransitEta(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Current Ambulance Pickup Location / Landmark</label>
            <input
              type="text"
              required
              className="form-input"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Brief Clinical Presentation & Triage Notes</label>
            <textarea
              rows={2}
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-lg">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" style={{ gap: '0.65rem', padding: '0.85rem 2rem' }}>
            <Send size={18} />
            <span>Transmit ICU Booking Request</span>
          </button>
        </div>
      </form>
    </div>
  );
};
