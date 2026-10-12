import React from 'react';
import { useICUStore } from '../../store/icuStore';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const HospitalNotificationsPage = () => {
  const { 
    hospitalNotifications, 
    markAllHospitalNotificationsRead, 
    clearHospitalNotifications 
  } = useICUStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              ICU Command Alerts & Notifications
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Incoming critical transfer tickets, bed reservation notices, and regional alarms.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={markAllHospitalNotificationsRead}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Mark All Read
            </button>
            <button
              onClick={clearHospitalNotifications}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Empty state or Notifications list */}
        {hospitalNotifications.length === 0 ? (
          <div className="card" style={{
            padding: '4.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-card)'
          }}>
            <Bell size={40} color="var(--text-muted)" style={{ marginBottom: '1.25rem', strokeWidth: 1.5 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No hospital alerts
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Your emergency dispatch notification queue is clear.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {hospitalNotifications.map(notif => (
              <div 
                key={notif.id}
                className="card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ marginTop: '0.15rem' }}>
                  <ShieldAlert size={20} color="var(--teal-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {notif.timeAgo || 'Just now'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
