import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useICUStore, parseJwt } from '../store/icuStore';
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  User, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Zap,
  Activity,
  Database
} from 'lucide-react';

export const EvaluatorToolbar = () => {
  const { 
    bookings, 
    quickAcceptPendingBooking, 
    quickRejectPendingBooking, 
    resetDatabase,
    realtimeConnected,
    backendOnline
  } = useICUStore();

  const [expanded, setExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHospital = location.pathname.startsWith('/hospital');
  const isUser = location.pathname.startsWith('/user');
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  const handleUserNav = () => {
    const token = localStorage.getItem('icu_auth_token');
    const decoded = parseJwt(token);
    if (token && decoded && decoded.role === 'USER') {
      navigate('/user/dashboard');
    } else {
      navigate('/user/login');
    }
  };

  const handleHospitalNav = () => {
    const token = localStorage.getItem('icu_auth_token');
    const decoded = parseJwt(token);
    if (token && decoded && decoded.role === 'HOSPITAL') {
      navigate('/hospital/dashboard');
    } else {
      navigate('/hospital/login');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLiveAccept = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const bookingId = await quickAcceptPendingBooking();
      if (bookingId) {
        showToast(`Allocated available ICU Bed for ${bookingId} via Live Database Transaction!`);
      } else {
        showToast('No pending bookings to accept in current queue.');
      }
    } catch (err) {
      showToast(`Error accepting booking: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLiveReject = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const bookingId = await quickRejectPendingBooking(null, 'No suitable ICU bed available due to emergency surge.');
      if (bookingId) {
        showToast(`Declined ${bookingId} on Live DB. Rule-based alternatives computed.`);
      } else {
        showToast('No pending bookings to reject.');
      }
    } catch (err) {
      showToast(`Error rejecting booking: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDatabase = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const success = await resetDatabase();
      if (success) {
        showToast('SQLite Database reset to pristine baseline with real hospitals & beds.');
      } else {
        showToast('Reset completed.');
      }
    } catch (err) {
      showToast('Error resetting database.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '0.65rem 1.25rem',
          borderRadius: '999px',
          border: '1px solid #0d9488',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Zap size={14} color="#2dd4bf" />
          <span>{toastMessage}</span>
        </div>
      )}

      <aside style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        width: '620px',
        maxWidth: '94vw'
      }}>
        <div style={{
          background: '#111827',
          color: '#ffffff',
          border: '1px solid #1f2937',
          borderRadius: '14px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}>
          {/* Header Row */}
          <div 
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '0.55rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              background: '#111827'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                <Activity size={13} color="#38bdf8" />
                <span>LIVE ICU REAL-TIME CONTROL BAR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: realtimeConnected ? '#10b981' : '#f59e0b' }}>
                <span className={`pulse-indicator ${realtimeConnected ? 'green' : 'amber'}`} style={{ width: 6, height: 6 }}></span>
                <span>{realtimeConnected ? 'WebSocket & DB Connected' : (backendOnline ? 'REST DB Synced' : 'Offline Cache')}</span>
              </div>
            </div>

            <button 
              style={{
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.1rem'
              }}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {/* Expanded Drawer Content */}
          {expanded && (
            <div style={{
              padding: '0.75rem 1rem 0.9rem',
              borderTop: '1px solid #1f2937',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              {/* Row 1: Quick Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  PORTAL NAVIGATION:
                </span>
                <button
                  onClick={handleUserNav}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: isUser ? '#0d9488' : '#1f2937',
                    color: '#ffffff',
                    border: '1px solid ' + (isUser ? '#0d9488' : '#374151')
                  }}
                >
                  <User size={13} />
                  <span>User Portal</span>
                </button>
                <button
                  onClick={handleHospitalNav}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: isHospital ? '#0d9488' : '#1f2937',
                    color: '#ffffff',
                    border: '1px solid ' + (isHospital ? '#0d9488' : '#374151')
                  }}
                >
                  <Building2 size={13} />
                  <span>Hospital Portal</span>
                </button>
              </div>

              {/* Row 2: Live Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                    INCOMING QUEUE ({pendingCount}):
                  </span>
                  <button
                    onClick={handleLiveAccept}
                    disabled={isProcessing || pendingCount === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.32rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: pendingCount > 0 ? '#10b981' : '#374151',
                      color: '#ffffff',
                      cursor: pendingCount > 0 ? 'pointer' : 'not-allowed',
                      opacity: pendingCount > 0 ? 1 : 0.6
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Accept Inbound Request (Reserve Bed)</span>
                  </button>
                  <button
                    onClick={handleLiveReject}
                    disabled={isProcessing || pendingCount === 0}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.32rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: pendingCount > 0 ? '#ef4444' : '#374151',
                      color: '#ffffff',
                      cursor: pendingCount > 0 ? 'pointer' : 'not-allowed',
                      opacity: pendingCount > 0 ? 1 : 0.6
                    }}
                  >
                    <XCircle size={13} />
                    <span>Reject & Recommend Alternatives</span>
                  </button>
                </div>

                <button
                  onClick={handleResetDatabase}
                  disabled={isProcessing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.32rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#d1d5db',
                    border: '1px solid #374151',
                    background: '#1f2937',
                    cursor: 'pointer'
                  }}
                  title="Reseeds the real SQLite database to clean baseline"
                >
                  <Database size={12} color="#38bdf8" />
                  <span>Reset Database</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
