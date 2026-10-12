import React from 'react';
import { useICUStore } from '../../store/icuStore';
import { CheckCircle2, AlertCircle, Bell, Clock } from 'lucide-react';
import { Footer } from '../../components/Footer';

export const UserNotificationsPage = () => {
  const { 
    userNotifications, 
    markAllUserNotificationsRead, 
    clearUserNotifications 
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
          marginBottom: '1.75rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Notifications & Triage Alerts
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Real-time alerts for booking status updates, bed confirmations, and route dispatches.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={markAllUserNotificationsRead}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Mark All Read
            </button>
            <button
              onClick={clearUserNotifications}
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 600 }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Notifications list */}
        {userNotifications.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Bell size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>No notifications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Your notification queue is currently empty.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {userNotifications.map(notif => {
              const isConfirmed = notif.type === 'confirmed';
              return (
                <div 
                  key={notif.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.5rem 0'
                  }}
                >
                  <div style={{ marginTop: '0.15rem' }}>
                    {isConfirmed ? (
                      <CheckCircle2 size={18} color="var(--text-primary)" />
                    ) : (
                      <AlertCircle size={18} color="var(--text-primary)" />
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {notif.timeAgo || '30 mins ago'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {notif.message}
                    </p>

                    {notif.ref && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Ref: {notif.ref}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
