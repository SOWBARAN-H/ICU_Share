import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useICUStore, parseJwt } from '../store/icuStore';
import { 
  Activity, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronDown, 
  User, 
  Building2 
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentHospitalId, 
    setCurrentHospitalId, 
    hospitals, 
    userNotifications, 
    hospitalNotifications, 
    theme, 
    toggleTheme,
    user,
    backendOnline,
    realtimeConnected,
    logout
  } = useICUStore();

  const [showHospSelect, setShowHospSelect] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHospitalRoute = location.pathname.startsWith('/hospital');
  const isUserRoute = location.pathname.startsWith('/user');
  const currentHospital = hospitals.find(h => h.id === currentHospitalId) || hospitals[0] || { name: 'Command Center', city: 'Chennai' };

  const unreadUserNotifs = userNotifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.65rem 1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Left: Brand Logo & Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              background: 'var(--teal-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}>
                ICU<span style={{ fontWeight: 500, color: 'var(--teal-primary)' }}>Share</span>
              </div>
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                lineHeight: 1
              }}>
                {isHospitalRoute 
                  ? 'ICU COMMAND MATRIX' 
                  : isUserRoute 
                    ? 'USER & AMBULANCE DISPATCH' 
                    : 'REGIONAL CRITICAL CARE NETWORK'}
              </div>
            </div>
          </Link>

          {/* Hospital Switcher dropdown (Shown on Hospital Portal) */}
          {isHospitalRoute && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowHospSelect(!showHospSelect)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Building2 size={15} color="var(--text-secondary)" />
                <span>{currentHospital.name} ({currentHospital.city === 'Chennai' ? 'Chennai Central' : currentHospital.city})</span>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {showHospSelect && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  width: '280px',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, padding: '0.35rem 0.6rem', textTransform: 'uppercase' }}>
                    SELECT COMMAND HOSPITAL NODE
                  </div>
                  {hospitals.map(h => (
                    <div
                      key={h.id}
                      onClick={() => {
                        setCurrentHospitalId(h.id);
                        setShowHospSelect(false);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        background: h.id === currentHospitalId ? 'var(--teal-light)' : 'transparent',
                        color: h.id === currentHospitalId ? 'var(--teal-text)' : 'var(--text-primary)',
                        fontWeight: h.id === currentHospitalId ? 600 : 400,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{h.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.availableBeds} beds</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isUserRoute && (
            <>
              <Link 
                to="/user/dashboard" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/user/dashboard' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/user/dashboard' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                Dashboard
              </Link>
              <Link 
                to="/user/bookings" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/user/bookings' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/user/bookings' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                My Bookings
              </Link>
              <Link 
                to="/user/notifications" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: location.pathname === '/user/notifications' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/user/notifications' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                <span>Notifications</span>
                <span style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadUserNotifs || 1}
                </span>
              </Link>
            </>
          )}

          {isHospitalRoute && (
            <>
              <Link 
                to="/hospital/dashboard" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/hospital/dashboard' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/hospital/dashboard' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                Dashboard
              </Link>
              <Link 
                to="/hospital/beds" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/hospital/beds' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/hospital/beds' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                ICU Beds
              </Link>
              <Link 
                to="/hospital/bookings" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/hospital/bookings' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/hospital/bookings' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                Incoming Requests
              </Link>
              <Link 
                to="/hospital/notifications" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/hospital/notifications' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/hospital/notifications' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                Alerts
              </Link>
              <Link 
                to="/hospital/settings" 
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: location.pathname === '/hospital/settings' ? 'var(--teal-light)' : 'transparent',
                  color: location.pathname === '/hospital/settings' ? 'var(--teal-text)' : 'var(--text-secondary)'
                }}
              >
                Settings
              </Link>
            </>
          )}

          {!isHospitalRoute && !isUserRoute && (
            <>
              <Link to="/" className="btn btn-secondary btn-sm" style={{ border: 'none' }}>Overview</Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-sm" style={{ border: 'none' }}>How It Works</Link>
              <Link to="/clinical-impact" className="btn btn-secondary btn-sm" style={{ border: 'none' }}>Clinical Impact</Link>
              <Link to="/portal" className="btn btn-primary btn-sm">Enter Portal</Link>
            </>
          )}
        </div>

        {/* Right side: Theme, Profile, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Live API Telemetry Badge */}
          <div 
            title={realtimeConnected ? "Live WebSocket Stream + Real-Time SQLite Database Connected" : (backendOnline ? "Connected to Backend REST Database Matrix" : "Backend Offline or Reconnecting...")}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.22rem 0.65rem',
              borderRadius: '999px',
              background: realtimeConnected ? 'rgba(16, 185, 129, 0.15)' : (backendOnline ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.12)'),
              border: `1px solid ${realtimeConnected ? 'rgba(16, 185, 129, 0.4)' : (backendOnline ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.35)')}`,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: realtimeConnected ? '#10b981' : (backendOnline ? '#0284c7' : '#dc2626')
            }}
          >
            <span className={realtimeConnected ? "pulse-indicator green" : (backendOnline ? "pulse-indicator green" : "pulse-indicator red")} style={{ width: 6, height: 6 }}></span>
            <span>{realtimeConnected ? 'LIVE REAL-TIME (DB)' : (backendOnline ? 'DB SYNCED' : 'OFFLINE')}</span>
          </div>


          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Low-Light Dark Mode"}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Portal Profile chip */}
          {isUserRoute && user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--teal-light)',
                color: 'var(--teal-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={15} />
              </div>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name || 'User'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {user.role || 'User / Patient Attendant'}
                </div>
              </div>
            </div>
          )}

          {/* Hospital Portal Live Node Badge */}
          {isHospitalRoute && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              background: 'var(--status-available-bg)',
              color: 'var(--status-available-text)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em'
            }}>
              <span className="pulse-indicator green" style={{ width: 6, height: 6 }}></span>
              <span>LIVE NODE</span>
            </div>
          )}

          {/* Logout button */}
          {(isUserRoute || isHospitalRoute) && (
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
