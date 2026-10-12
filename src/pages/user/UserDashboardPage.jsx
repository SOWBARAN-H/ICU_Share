import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Search, 
  MapPin, 
  Check, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { hospitals, bookings, user } = useICUStore();
  const navigate = useNavigate();

  const [locationQuery, setLocationQuery] = useState('');
  const [patientSeverity, setPatientSeverity] = useState('Critical (Immediate Life Support)');
  const [requiredFacility, setRequiredFacility] = useState('All');
  const [hospitalType, setHospitalType] = useState('All');
  const [sortBy, setSortBy] = useState('availability'); // 'availability' | 'nearest' | 'match'

  const activeTicket = bookings.find(b => b.status === 'PENDING') || bookings[0];

  const quickCities = ['Chennai', 'Coimbatore', 'Erode', 'Salem', 'Madurai'];

  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter(h => {
        // Location filter
        if (locationQuery.trim() !== '') {
          const q = locationQuery.toLowerCase();
          const matchCity = h.city.toLowerCase().includes(q);
          const matchArea = h.area.toLowerCase().includes(q);
          const matchName = h.name.toLowerCase().includes(q);
          if (!matchCity && !matchArea && !matchName) return false;
        }

        // Hospital Type
        if (hospitalType === 'Government' && h.type !== 'Government') return false;
        if (hospitalType === 'Private' && h.type !== 'Private') return false;

        // Facility
        if (requiredFacility !== 'All') {
          if (!h.facilities.some(f => f.toLowerCase().includes(requiredFacility.toLowerCase()))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'availability') return b.availableBeds - a.availableBeds;
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        return 0;
      });
  }, [hospitals, locationQuery, hospitalType, requiredFacility, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Greeting & Active Ticket Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        {/* Left: Greeting */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span className="pulse-indicator green" style={{ width: 7, height: 7 }}></span>
              <span style={{ fontSize: '0.8125rem', color: '#0f766e', fontWeight: 600 }}>
                ICU Database Connected
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
              <span>API LIVE • PORT 8000</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Good afternoon, {user?.name || 'User'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Search hospitals with ICU availability, submit booking requests, and manage bed reservations.
          </p>
        </div>

        {/* Right: Active Ticket Card (Screenshot 1) */}
        {activeTicket && (
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fee2e2',
            borderRadius: '12px',
            padding: '0.85rem 12px',
            minWidth: '280px',
            maxWidth: '340px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.04em' }}>
                Active Booking: {activeTicket.id}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {activeTicket.hospitalName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }}></span>
                {activeTicket.status}
              </span>

              <Link 
                to="/user/bookings"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View Status</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--teal-light)',
            color: 'var(--teal-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={16} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Find an available ICU bed
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Search regional hospitals by location, patient severity, and required facilities
            </p>
          </div>
        </div>

        {/* Inputs 3-column row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1rem'
        }}>
          {/* Location input */}
          <div>
            <label className="form-label">ENTER LOCATION / CITY</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.1rem' }}
                placeholder="e.g. Chennai, Coimbatore, Salem..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Patient Severity */}
          <div>
            <label className="form-label">PATIENT SEVERITY</label>
            <select
              className="form-select"
              value={patientSeverity}
              onChange={(e) => setPatientSeverity(e.target.value)}
            >
              <option value="Critical (Immediate Life Support)">Critical (Immediate Life Support)</option>
              <option value="High (Ventilator / CCU Priority)">High (Ventilator / CCU Priority)</option>
              <option value="Moderate (Step-Down / Observation)">Moderate (Step-Down / Observation)</option>
              <option value="Stable (Standard Transfer)">Stable (Standard Transfer)</option>
            </select>
          </div>

          {/* Required Facility */}
          <div>
            <label className="form-label">REQUIRED FACILITY</label>
            <select
              className="form-select"
              value={requiredFacility}
              onChange={(e) => setRequiredFacility(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Ventilator">Ventilator</option>
              <option value="Cardiac ICU">Cardiac ICU</option>
              <option value="ECMO">ECMO</option>
              <option value="Trauma ICU">Trauma ICU</option>
              <option value="PICU">PICU</option>
              <option value="Isolation">Isolation</option>
            </select>
          </div>
        </div>

        {/* Quick locations pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Quick Locations:</span>
          {quickCities.map(city => (
            <button
              key={city}
              onClick={() => setLocationQuery(city)}
              style={{
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital Type & Sort By Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Hospital Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            HOSPITAL TYPE:
          </span>
          <button
            onClick={() => setHospitalType('All')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: hospitalType === 'All' ? '#0f766e' : 'var(--bg-card)',
              color: hospitalType === 'All' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (hospitalType === 'All' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            All Hospitals
          </button>
          <button
            onClick={() => setHospitalType('Government')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: hospitalType === 'Government' ? '#0f766e' : 'var(--bg-card)',
              color: hospitalType === 'Government' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (hospitalType === 'Government' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            Government Facilities
          </button>
          <button
            onClick={() => setHospitalType('Private')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: hospitalType === 'Private' ? '#0f766e' : 'var(--bg-card)',
              color: hospitalType === 'Private' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (hospitalType === 'Private' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            Private Facilities
          </button>
        </div>

        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            SORT BY:
          </span>
          <button
            onClick={() => setSortBy('availability')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: sortBy === 'availability' ? '#0f766e' : 'var(--bg-card)',
              color: sortBy === 'availability' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (sortBy === 'availability' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            Most Available
          </button>
          <button
            onClick={() => setSortBy('nearest')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: sortBy === 'nearest' ? '#0f766e' : 'var(--bg-card)',
              color: sortBy === 'nearest' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (sortBy === 'nearest' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            Nearest
          </button>
          <button
            onClick={() => setSortBy('match')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: sortBy === 'match' ? '#0f766e' : 'var(--bg-card)',
              color: sortBy === 'match' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid ' + (sortBy === 'match' ? '#0f766e' : 'var(--border-color)')
            }}
          >
            Best Facility Match
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          NEARBY ICU AVAILABILITY ({filteredHospitals.length} Facilities Found)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>
          <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
          <span>Auto-syncing with regional dispatch</span>
        </div>
      </div>

      {/* Hospital Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredHospitals.map(h => (
          <div 
            key={h.id}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Top row: tags, hospital name, beds counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    background: h.type === 'Private' ? '#e0f2fe' : '#f0fdf4',
                    color: h.type === 'Private' ? '#0369a1' : '#15803d',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {h.type} FACILITY
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={13} />
                    <span>{h.distanceKm} km • {h.travelTime || '~6 mins'}</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  {h.name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {h.area}
                </div>
              </div>

              {/* Bed Count Stat Box */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0d9488', lineHeight: 1.1 }}>
                  {h.availableBeds} ICU Beds Free
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  of {h.totalBeds} total capacity
                </div>
              </div>
            </div>

            {/* Facilities row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                FACILITIES:
              </span>
              {h.facilities.slice(0, 4).map(fac => (
                <span
                  key={fac}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Check size={12} color="#0d9488" strokeWidth={3} />
                  <span>{fac}</span>
                </span>
              ))}
              {h.facilities.length > 4 && (
                <span style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)'
                }}>
                  +{h.facilities.length - 4} more
                </span>
              )}
            </div>

            {/* Bottom row: Last synced + Action buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-color-light)',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
                <span>Last synchronized live</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link 
                  to={`/user/hospital/${h.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  View Details
                </Link>
                <Link 
                  to={`/user/book/${h.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  Book ICU Bed
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
