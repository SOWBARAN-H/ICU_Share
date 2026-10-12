import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useICUStore } from '../../store/icuStore';
import { 
  Navigation, 
  MapPin, 
  Building2, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  Radio, 
  Volume2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const RouteNavigationPage = () => {
  const { hospitalId } = useParams();
  const { hospitals } = useICUStore();
  const navigate = useNavigate();

  const hospital = hospitals.find(h => h.id === hospitalId) || hospitals[0];

  // Navigation telemetry states
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [speed, setSpeed] = useState(58); // km/h
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const routeSteps = [
    { text: 'Depart Pickup point, head east toward main road', dist: '400 m' },
    { text: 'Continue straight onto Anna Salai toward medical center', dist: '900 m' },
    { text: 'Pass junction flyover underpass, continue in direct hospital transit lane', dist: '600 m' },
    { text: 'Turn onto Greams Road hospital entrance', dist: '200 m' },
    { text: 'Arrive at Hospital Receiving Gate. ICU bed reservation verified.', dist: '0 m' }
  ];

  useEffect(() => {
    let interval = null;
    if (isNavigating) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsNavigating(false);
            return 100;
          }
          const next = prev + 4;
          const stepIdx = Math.min(
            routeSteps.length - 1,
            Math.floor((next / 100) * routeSteps.length)
          );
          setCurrentStepIndex(stepIdx);
          setSpeed(Math.floor(48 + Math.random() * 8));
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handleResetNavigation = () => {
    setIsNavigating(false);
    setProgress(0);
    setCurrentStepIndex(0);
    setSpeed(0);
  };

  const remainingDist = Math.max(0, (hospital.distanceKm * (1 - progress / 100))).toFixed(1);
  const remainingTimeMinutes = Math.max(1, Math.round((hospital.distanceKm * (1 - progress / 100)) / (45 / 60)));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Bookings</span>
        </button>
      </div>

      {/* Route Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        borderLeft: '4px solid var(--accent-cyan)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-indicator green"></span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase' }}>
              LIVE EMERGENCY TRANSIT CORRIDOR • GPS TELEMETRY
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginTop: '0.2rem' }}>
            Route to {hospital.name}
          </h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Confirmed Destination: {hospital.area}, {hospital.city} • ICU Facility (Lat: {hospital.latitude || 13.06}, Lng: {hospital.longitude || 80.24})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!isNavigating ? (
            <button
              onClick={() => setIsNavigating(true)}
              className="btn btn-primary"
              style={{ gap: '0.5rem' }}
            >
              <Play size={16} />
              <span>{progress === 0 ? 'Start Route Guidance' : 'Resume Route Guidance'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNavigating(false)}
              className="btn btn-secondary"
              style={{ gap: '0.5rem', borderColor: '#f59e0b', color: '#f59e0b' }}
            >
              <Pause size={16} />
              <span>Pause Guidance</span>
            </button>
          )}

          <button onClick={handleResetNavigation} className="btn btn-secondary btn-sm" title="Reset Guidance">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Telemetry HUD Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>REMAINING DISTANCE</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            {remainingDist} <span style={{ fontSize: '1rem', fontWeight: 600 }}>km</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total: {hospital.distanceKm} km</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ESTIMATED TRANSIT TIME</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
            {progress === 100 ? '0' : remainingTimeMinutes} <span style={{ fontSize: '1rem', fontWeight: 600 }}>min</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Live GPS Transit ETA</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ACTIVE VEHICLE VELOCITY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
            {isNavigating ? speed : 0} <span style={{ fontSize: '1rem', fontWeight: 600 }}>km/h</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Live Transit Corridor Speed</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RESERVATION STATUS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>
            BED RESERVED
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ICU Bed Ready for Patient Arrival</div>
        </div>
      </div>

      {/* Interactive Map Visual with Path Telemetry */}
      <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.2rem' }}>Live Emergency Transit Corridor (Patient Location → Confirmed Hospital)</h2>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ROUTE PROGRESS: {progress}%
          </div>
        </div>

        {/* SVG Map Canvas */}
        <div style={{
          width: '100%',
          height: '340px',
          background: 'radial-gradient(ellipse at center, #0f1c30 0%, #080d16 100%)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Map Grid Lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* SVG Road Network & Moving Vehicle */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <path
              d="M 50 100 C 150 120, 220 50, 350 90 S 550 160, 700 80"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              fill="none"
            />
            <path
              d="M 80 280 C 220 260, 300 320, 480 250 S 700 300, 850 220"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              fill="none"
            />

            {/* Active Emergency Corridor Route (Curved Path) */}
            <path
              id="corridor-path"
              d="M 80 280 C 180 200, 280 260, 420 180 S 620 190, 820 100"
              stroke="#06b6d4"
              strokeWidth="5"
              fill="none"
              strokeDasharray="8 4"
            />

            {/* Route Glow */}
            <path
              d="M 80 280 C 180 200, 280 260, 420 180 S 620 190, 820 100"
              stroke="rgba(6, 182, 212, 0.25)"
              strokeWidth="14"
              fill="none"
            />

            {/* Start Landmark: Pickup Point */}
            <circle cx="80" cy="280" r="10" fill="#3b82f6" />
            <circle cx="80" cy="280" r="18" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
            <text x="80" y="315" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              Patient Pickup Location
            </text>

            {/* End Landmark: Receiving Hospital */}
            <circle cx="820" cy="100" r="12" fill="#10b981" />
            <circle cx="820" cy="100" r="22" fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="820" y="65" fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">
              {hospital.name} (Reserved Bed)
            </text>

            {/* Moving Transit Marker based on progress */}
            {(() => {
              const t = progress / 100;
              const cx = 80 + (820 - 80) * t;
              const cy = (1 - t) * (1 - t) * 280 + 2 * (1 - t) * t * 180 + t * t * 100;

              return (
                <g transform={`translate(${cx}, ${cy})`}>
                  <circle r="14" fill="#06b6d4" />
                  <circle r="22" fill="none" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.6">
                    <animate attributeName="r" values="14;28;14" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <text y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    TRANSIT
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Turn-by-turn Instruction Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            right: '15px',
            background: 'rgba(13, 21, 36, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}>
                <Navigation size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  CURRENT ROUTE WAYPOINT:
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {routeSteps[currentStepIndex].text}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {routeSteps[currentStepIndex].dist}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>to next waypoint</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
