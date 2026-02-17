"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Alert, alertsApi } from '@/lib/api/alerts';
import { toast } from 'sonner';

interface NotificationContextType {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  markRead: (alertId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isTeacher } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshAlerts = useCallback(async () => {
    if (!user || !isTeacher) return;
    try {
      const [recentAlerts, count] = await Promise.all([
        alertsApi.getTeacherAlerts(user.uid),
        alertsApi.getUnreadCount(user.uid),
      ]);
      setAlerts(recentAlerts);
      setUnreadCount(count);
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setLoading(false);
    }
  }, [user, isTeacher]);

  // SSE connection
  useEffect(() => {
    if (!user || !isTeacher) {
      setLoading(false);
      return;
    }

    const connect = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const url = `${API_BASE_URL}/api/v1/alerts/stream/${user.uid}?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        console.log('SSE connected');
      });

      es.addEventListener('alert', (event) => {
        try {
          const alert: Alert = JSON.parse(event.data);

          setAlerts(prev => [alert, ...prev].slice(0, 50));
          setUnreadCount(prev => prev + 1);

          if (alert.severity === 'CRITICAL') {
            toast.error(alert.message, {
              description: `${alert.studentName} — ${alert.type.replace(/_/g, ' ').toLowerCase()}`,
              duration: 10000,
            });
          } else if (alert.severity === 'HIGH') {
            toast.warning(alert.message, {
              description: `${alert.studentName} — ${alert.type.replace(/_/g, ' ').toLowerCase()}`,
              duration: 7000,
            });
          }
        } catch (e) {
          console.error('Failed to parse SSE alert:', e);
        }
      });

      es.addEventListener('heartbeat', () => {
        // Connection alive
      });

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        // Only reconnect if the token still exists (not cleared by a 401 handler)
        const currentToken = localStorage.getItem('auth_token');
        if (currentToken && currentToken !== 'undefined' && currentToken !== 'null') {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
      };
    };

    refreshAlerts();
    connect();

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, isTeacher, refreshAlerts]);

  const markRead = useCallback(async (alertId: string) => {
    try {
      await alertsApi.markRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark alert read:', e);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    try {
      await alertsApi.markAllRead(user.uid);
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  }, [user]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await alertsApi.dismiss(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to dismiss alert:', e);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      alerts,
      unreadCount,
      loading,
      markRead,
      markAllRead,
      dismissAlert,
      refreshAlerts,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
