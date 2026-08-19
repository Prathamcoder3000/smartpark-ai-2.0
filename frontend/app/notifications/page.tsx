'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Zap,
  Sparkles,
  Info,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Inbox,
  Shield,
  Smartphone,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { Notification, NotificationType, NotificationFilter } from '../../lib/notificationData';
import { authService } from '../../lib/auth';
import { api } from '../../lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [activeFilter, setActiveFilter] = React.useState<NotificationFilter>('ALL');
  const [selectedNotification, setSelectedNotification] = React.useState<Notification | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const mapNotificationToFrontend = (n: any): Notification => {
    return {
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      description: n.message || '',
      timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(n.createdAt).toLocaleDateString(),
      isRead: n.isRead,
      priority: 'INFO',
    };
  };

  const loadNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data.map(mapNotificationToFrontend));
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      loadNotifications();
    }
  }, [router, loadNotifications]);

  const metrics = React.useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const booking = notifications.filter((n) => n.type === 'BOOKING').length;
    const aiInsight = notifications.filter((n) => n.type === 'AI_INSIGHT').length;
    return { total, unread, booking, aiInsight };
  }, [notifications]);

  // Handle Mark as Read
  const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.put(`/api/notifications/${id}/read`);
      if (res.success) {
        triggerToast('Notification marked as read.', 'success');
        await loadNotifications();
      }
    } catch (err: any) {
      triggerToast(err.message || 'Action failed.', 'error');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.delete(`/api/notifications/${id}`);
      if (res.success) {
        triggerToast('Notification permanently dismissed.', 'warning');
        if (selectedNotification?.id === id) {
          setSelectedNotification(null);
        }
        await loadNotifications();
      }
    } catch (err: any) {
      triggerToast(err.message || 'Delete failed.', 'error');
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/api/notifications/read-all');
      if (res.success) {
        triggerToast('All notifications marked as read.', 'success');
        await loadNotifications();
      }
    } catch (err: any) {
      triggerToast(err.message || 'Action failed.', 'error');
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      // Dismiss all one by one or filter locally if needed
      for (const n of notifications) {
        await api.delete(`/api/notifications/${n.id}`);
      }
      triggerToast('All notifications cleared.', 'warning');
      await loadNotifications();
    } catch (err: any) {
      triggerToast(err.message || 'Action failed.', 'error');
    }
  };

  // Filtered List
  const filteredNotifications = React.useMemo(() => {
    if (activeFilter === 'ALL') return notifications;
    if (activeFilter === 'UNREAD') return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const getIcon = (type: NotificationType) => {
    switch (type as string) {
      case 'BOOKING':
        return <Calendar className="h-4.5 w-4.5 text-signature" />;
      case 'AI_INSIGHT':
        return <Sparkles className="h-4.5 w-4.5 text-aiBlue" />;
      case 'SECURITY':
        return <Shield className="h-4.5 w-4.5 text-occupied" />;
      case 'SYSTEM':
        return <Zap className="h-4.5 w-4.5 text-limited" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-smartTextSecondary" />;
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">

        {/* 1. PAGE TITLE & GLOBAL ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-smartBorder/40 pb-5 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
              Notifications
              {metrics.unread > 0 && (
                <span className="text-[10px] bg-signature text-black font-mono font-bold px-2 py-0.5 rounded-full">
                  {metrics.unread} NEW
                </span>
              )}
            </h1>
            <p className="text-xs text-smartTextSecondary font-sans mt-0.5">
              Access real-time IoT alerts, AI space recommendations, and active permit schedules.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-[9.5px] uppercase tracking-wider font-semibold"
              disabled={metrics.unread === 0 || loading}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark All Read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[9.5px] uppercase tracking-wider font-semibold text-occupied hover:bg-occupied/10 border border-smartBorder/20 hover:border-occupied/35"
              disabled={notifications.length === 0 || loading}
              onClick={handleClearAll}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Dismiss All
            </Button>
          </div>
        </div>

        {/* 2. SUMMARY COUNTER BLOCKS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-smartSurface border border-smartBorder/60 p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[8.5px] font-mono text-smartTextSecondary uppercase block">Total Messages</span>
              <span className="text-lg font-bold text-white font-mono mt-0.5 block">{metrics.total}</span>
            </div>
            <Inbox className="h-5 w-5 text-smartTextSecondary/50" />
          </div>
          <div className="bg-smartSurface border border-smartBorder/60 p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[8.5px] font-mono text-smartTextSecondary uppercase block">Unread Alerts</span>
              <span className="text-lg font-bold text-signature font-mono mt-0.5 block">{metrics.unread}</span>
            </div>
            <Bell className="h-5 w-5 text-signature/70" />
          </div>
          <div className="bg-smartSurface border border-smartBorder/60 p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[8.5px] font-mono text-smartTextSecondary uppercase block">Permit Updates</span>
              <span className="text-lg font-bold text-aiBlue font-mono mt-0.5 block">{metrics.booking}</span>
            </div>
            <Calendar className="h-5 w-5 text-aiBlue/70" />
          </div>
          <div className="bg-smartSurface border border-smartBorder/60 p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[8.5px] font-mono text-smartTextSecondary uppercase block">AI Insights</span>
              <span className="text-lg font-bold text-available font-mono mt-0.5 block">{metrics.aiInsight}</span>
            </div>
            <Sparkles className="h-5 w-5 text-available/70" />
          </div>
        </div>

        {/* 3. LIST CONTROLS */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-smartBorder/30 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Message Feeds
            </h3>
            <div className="flex gap-1">
              {(['ALL', 'UNREAD', 'BOOKING', 'AI_INSIGHT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded text-[9.5px] font-mono font-semibold uppercase tracking-wider transition-all ${
                    activeFilter === filter 
                      ? 'bg-signature text-black font-bold' 
                      : 'bg-smartSurface text-smartTextSecondary border border-smartBorder hover:border-smartBorder/80 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ALERTS LIST */}
          {loading ? (
            <div className="text-center py-12 font-mono text-xs text-smartTextSecondary animate-pulse">
              Loading notification feed...
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNotification(n)}
                  className={`p-4 border rounded-smart-md cursor-pointer transition-all flex justify-between items-start gap-4 hover:border-smartBorder/80 ${
                    n.isRead 
                      ? 'bg-smartSurface/50 border-smartBorder/40 opacity-70' 
                      : 'bg-smartSurface border-signature/30 shadow-md shadow-signature/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2 rounded mt-0.5 shrink-0 ${
                      n.isRead ? 'bg-smartBg text-smartTextSecondary/60' : 'bg-smartBg text-white'
                    }`}>
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-[12px] font-sans font-bold leading-snug ${
                          n.isRead ? 'text-smartTextSecondary' : 'text-white'
                        }`}>{n.title}</h4>
                        {!n.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
                        )}
                      </div>
                      <p className="text-[10px] text-smartTextSecondary mt-1 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                      <span className="text-[8.5px] font-mono text-smartTextSecondary/50 mt-2 block">
                        {n.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!n.isRead && (
                      <IconButton 
                        onClick={(e) => handleToggleRead(n.id, e)}
                        title="Mark as Read"
                      >
                        <BookmarkCheck className="h-3.5 w-3.5" />
                      </IconButton>
                    )}
                    <IconButton 
                      onClick={(e) => handleDelete(n.id, e)}
                      title="Dismiss"
                      className="text-occupied/60 hover:text-occupied"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="Inbox Empty"
              description={`No notifications matching "${activeFilter.toLowerCase()}" in your archive.`}
            />
          )}
        </div>
      </main>

      {/* 5. MODAL INSPECTOR */}
      <Modal
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        title="Alert Details"
        size="sm"
      >
        {selectedNotification && (
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="flex items-start gap-3 border-b border-smartBorder/30 pb-3">
              <div className="p-2.5 rounded bg-smartBg text-white shrink-0">
                {getIcon(selectedNotification.type)}
              </div>
              <div>
                <h4 className="font-bold text-white text-[12px]">{selectedNotification.title}</h4>
                <span className="text-[8.5px] font-mono text-smartTextSecondary mt-0.5 block">
                  {selectedNotification.timestamp}
                </span>
              </div>
            </div>

            <p className="text-[10.5px] text-smartTextSecondary leading-relaxed bg-smartBg/60 border border-smartBorder/45 p-3 rounded-lg">
              {selectedNotification.description}
            </p>

            <div className="flex justify-between items-center border-t border-smartBorder/30 pt-3">
              <div className="flex items-center gap-1 font-mono text-[9px] text-smartTextSecondary/60">
                <span>FEED: {selectedNotification.type}</span>
              </div>
              <div className="flex gap-2">
                {!selectedNotification.isRead && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-[9.5px] uppercase font-semibold"
                    onClick={() => {
                      handleToggleRead(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[9.5px] uppercase font-semibold text-white bg-occupied hover:bg-occupied/85"
                  onClick={() => {
                    handleDelete(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Toast 
        isOpen={toastOpen} 
        message={toastMsg} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
        duration={3500}
      />
    </div>
  );
}
