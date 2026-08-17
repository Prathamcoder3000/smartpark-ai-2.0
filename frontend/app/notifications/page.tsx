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
import {
  INITIAL_MOCK_NOTIFICATIONS,
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationFilter
} from '../../lib/notificationData';
import { authService } from '../../lib/auth';

export default function NotificationsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  // State management for notifications
  const [notifications, setNotifications] = React.useState<Notification[]>(INITIAL_MOCK_NOTIFICATIONS);

  React.useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);
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

  // Calculations
  const metrics = React.useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const booking = notifications.filter((n) => n.type === 'BOOKING').length;
    const aiInsight = notifications.filter((n) => n.type === 'AI_INSIGHT').length;
    return { total, unread, booking, aiInsight };
  }, [notifications]);

  // Handle Mark as Read
  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
    const notif = notifications.find((n) => n.id === id);
    if (notif) {
      triggerToast(
        `Notification marked as ${!notif.isRead ? 'read' : 'unread'}.`,
        'success'
      );
    }
  };

  // Handle Delete
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    triggerToast('Notification permanently dismissed.', 'warning');
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  // Handle Mark All as Read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    triggerToast('All notifications marked as read.', 'success');
  };

  // Filtered list
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'UNREAD') return !n.isRead;
      return n.type === activeFilter;
    });
  }, [notifications, activeFilter]);

  // Get matching Lucide icon for notification type
  const getIcon = (type: NotificationType, priority: NotificationPriority) => {
    const classes = {
      CRITICAL: 'text-occupied bg-occupied/10 border-occupied/25',
      IMPORTANT: 'text-limited bg-limited/10 border-limited/25',
      INFO: 'text-signature bg-signature/10 border-signature/25'
    }[priority];

    switch (type) {
      case 'BOOKING':
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <Calendar className="h-4 w-4" />
          </div>
        );
      case 'AVAILABILITY':
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <MapPin className="h-4 w-4" />
          </div>
        );
      case 'AI_INSIGHT':
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <Sparkles className="h-4 w-4" />
          </div>
        );
      case 'SYSTEM':
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <Info className="h-4 w-4" />
          </div>
        );
      case 'PROMOTION':
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <Zap className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${classes}`}>
            <Bell className="h-4 w-4" />
          </div>
        );
    }
  };

  // Click on related action
  const handleActionClick = (notif: Notification) => {
    setSelectedNotification(null);
    if (notif.relatedFacilityId) {
      router.push(`/facility/${notif.relatedFacilityId}`);
    } else if (notif.relatedRoute) {
      router.push(notif.relatedRoute);
    } else {
      triggerToast('No additional action available for this notification.', 'info');
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
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-smartBorder/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
              <Bell className="h-5 w-5 text-signature" />
              NOTIFICATIONS
            </h1>
            <p className="text-xs sm:text-sm text-smartTextSecondary">
              Stay informed about parking availability, reservations, and SmartPark intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-smartSurface border border-smartBorder px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-mono">
              <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
              <span>SYNC ACTIVE</span>
            </div>
            {metrics.unread > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="text-[10px] h-8 gap-1.5 font-mono"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5 text-signature" />
                MARK ALL READ
              </Button>
            )}
          </div>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart font-mono">
            <span className="text-[9px] text-smartTextSecondary block uppercase">TOTAL NOTIFS</span>
            <span className="text-base font-bold text-smartTextPrimary">{metrics.total}</span>
          </div>

          <div className="p-3 bg-signature/10 border border-signature/30 rounded-smart font-mono">
            <span className="text-[9px] text-signature block uppercase">UNREAD</span>
            <span className="text-base font-bold text-signature">{metrics.unread}</span>
          </div>

          <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart font-mono">
            <span className="text-[9px] text-smartTextSecondary block uppercase">BOOKINGS ALERTS</span>
            <span className="text-base font-bold text-smartTextPrimary">{metrics.booking}</span>
          </div>

          <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart font-mono">
            <span className="text-[9px] text-smartTextSecondary block uppercase">AI INSIGHTS</span>
            <span className="text-base font-bold text-smartTextPrimary">{metrics.aiInsight}</span>
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="space-y-4">
          
          {/* HORIZONTAL FILTERS SCROLL */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-smartBorder/40">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'UNREAD', label: `Unread (${metrics.unread})` },
              { id: 'BOOKING', label: 'Bookings' },
              { id: 'AVAILABILITY', label: 'Availability' },
              { id: 'AI_INSIGHT', label: 'AI Intelligence' },
              { id: 'SYSTEM', label: 'System' },
              { id: 'PROMOTION', label: 'Promotions' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as NotificationFilter)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-sans transition-all shrink-0 border uppercase font-medium ${
                  activeFilter === f.id
                    ? 'bg-signature border-signature text-smartBg font-bold'
                    : 'bg-smartSurface border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* NOTIFICATION LIST OR EMPTY STATE */}
          {filteredNotifications.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No notifications found"
                description={`There are no alerts matching the filter "${activeFilter.toLowerCase()}".`}
                actionText="View All Alerts"
                onAction={() => setActiveFilter('ALL')}
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotification(notif)}
                  className={`group relative p-4 rounded-smart border transition-all cursor-pointer flex items-start gap-4 hover:border-smartBorder/90 ${
                    notif.isRead
                      ? 'bg-smartSurface/50 border-smartBorder/45'
                      : 'bg-smartElevated border-signature/30 shadow-md ring-1 ring-signature/10'
                  }`}
                  aria-label={`Notification: ${notif.title}, Priority: ${notif.priority}, State: ${notif.isRead ? 'Read' : 'Unread'}`}
                >
                  {/* Left priority visual tick for unread */}
                  {!notif.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-signature rounded-l-smart" />
                  )}

                  {/* Icon */}
                  {getIcon(notif.type, notif.priority)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-smartTextSecondary tracking-widest uppercase">
                          {notif.type.replace('_', ' ')}
                        </span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          notif.priority === 'CRITICAL' ? 'text-occupied bg-occupied/10 border-occupied/25' :
                          notif.priority === 'IMPORTANT' ? 'text-limited bg-limited/10 border-limited/25' :
                          'text-smartTextSecondary bg-smartBg border-smartBorder'
                        }`}>
                          {notif.priority}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-smartTextSecondary shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>

                    <h3 className={`text-xs font-bold ${notif.isRead ? 'text-smartTextPrimary/80' : 'text-smartTextPrimary group-hover:text-signature'} transition-colors`}>
                      {notif.title}
                    </h3>
                    <p className="text-xs text-smartTextSecondary leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0 self-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleRead(notif.id, e)}
                      title={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      aria-label={notif.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      {notif.isRead ? (
                        <Bookmark className="h-3.5 w-3.5 text-smartTextSecondary" />
                      ) : (
                        <BookmarkCheck className="h-3.5 w-3.5 text-signature" />
                      )}
                    </IconButton>

                    <IconButton
                      variant="ghost"
                      size="sm"
                      className="hover:text-occupied"
                      onClick={(e) => handleDelete(notif.id, e)}
                      title="Dismiss Alert"
                      aria-label="Dismiss Alert"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-smartTextSecondary hover:text-occupied" />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* NOTIFICATION DETAIL MODAL */}
      {selectedNotification && (
        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title="Notification Details"
          size="md"
        >
          <div className="space-y-4 text-xs font-sans text-smartTextSecondary">
            
            {/* Header Meta */}
            <div className="flex justify-between items-center border-b border-smartBorder/45 pb-3">
              <div>
                <span className="text-[9px] font-mono uppercase block text-smartTextSecondary">Alert Type</span>
                <strong className="text-sm text-smartTextPrimary uppercase tracking-wider font-display">
                  {selectedNotification.type.replace('_', ' ')}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono block text-smartTextSecondary">Priority Level</span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                  selectedNotification.priority === 'CRITICAL' ? 'text-occupied bg-occupied/10 border-occupied/25' :
                  selectedNotification.priority === 'IMPORTANT' ? 'text-limited bg-limited/10 border-limited/25' :
                  'text-smartTextSecondary bg-smartBg border-smartBorder'
                }`}>
                  {selectedNotification.priority}
                </span>
              </div>
            </div>

            {/* Notification Core Card */}
            <div className="p-4 bg-smartBg border border-smartBorder rounded-smart space-y-2">
              <div className="text-[10px] font-mono text-smartTextSecondary">
                Received {selectedNotification.timestamp}
              </div>
              <h3 className="text-xs font-bold text-smartTextPrimary">
                {selectedNotification.title}
              </h3>
              <p className="leading-relaxed text-smartTextSecondary text-xs">
                {selectedNotification.description}
              </p>
            </div>

            {/* Actions Panel */}
            <div className="pt-4 border-t border-smartBorder flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleToggleRead(selectedNotification.id)}
                className="w-full sm:w-auto text-[10px]"
              >
                {selectedNotification.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </Button>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="hover:text-occupied border-smartBorder hover:border-occupied/40 text-[10px] w-1/2 sm:w-auto"
                >
                  Dismiss Alert
                </Button>

                {(selectedNotification.relatedFacilityId || selectedNotification.relatedRoute) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleActionClick(selectedNotification)}
                    className="gap-1.5 text-[10px] w-1/2 sm:w-auto"
                  >
                    View Destination
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* TOAST SYSTEM */}
      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        type={toastType}
      />
    </div>
  );
}
