'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Toast } from '../../components/ui/Toast';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Navigation,
  Car,
  Layers,
  TrendingUp,
  Activity,
  CheckCircle2,
  Bell,
  RefreshCw,
  Plus,
  Trash2,
  LogOut,
  AlertTriangle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Vehicle {
  id: string;
  licensePlate: string;
  make?: string;
  model?: string;
  color?: string;
  isEV: boolean;
}

interface Facility {
  id: string;
  name: string;
  address: string;
  totalCapacity: number;
  availableSlots: number;
  occupiedSlots: number;
  reservedSlots: number;
  occupancyPercentage: number;
}

interface Reservation {
  id: string;
  facilityId: string;
  slotId: string;
  vehicleId?: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  facility: {
    name: string;
    address: string;
  };
  slot: {
    slotNumber: string;
    floor: {
      label: string;
    };
  };
  vehicle?: Vehicle;
}

interface Booking {
  id: string;
  facilityId: string;
  slotId: string;
  reservationId?: string;
  startTime: string;
  endTime: string;
  entryTime?: string;
  exitTime?: string;
  status: string;
  price: number;
  facility: {
    name: string;
    address: string;
  };
  slot: {
    slotNumber: string;
    floor: {
      label: string;
    };
  };
  reservation?: {
    vehicle?: Vehicle;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Page States
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'info' | 'warning' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ isOpen: true, message, type });
  };

  // Auth Guard
  useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Fetch all dashboard data
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMsg(null);

    try {
      const [facRes, resRes, bookRes, vehRes, notifRes] = await Promise.all([
        api.get('/api/facilities'),
        api.get('/api/reservations'),
        api.get('/api/bookings'),
        api.get('/api/vehicles'),
        api.get('/api/notifications')
      ]);

      if (facRes.success) setFacilities(facRes.data);
      if (resRes.success) setReservations(resRes.data);
      if (bookRes.success) setBookings(bookRes.data);
      if (vehRes.success) setVehicles(vehRes.data);
      if (notifRes.success) setNotifications(notifRes.data);

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setErrorMsg('Failed to sync dashboard data with server gateway. Click retry to refresh.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Handle Reservation Cancellation
  const handleCancelReservation = async (reservationId: string) => {
    try {
      await api.delete(`/api/reservations/${reservationId}`);
      triggerToast('Reservation cancelled successfully.', 'success');
      fetchDashboardData(true);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to cancel reservation.', 'error');
    }
  };

  // Handle Convert Reservation to Booking & Check-In
  const handleCheckInReservation = async (reservationId: string) => {
    try {
      // 1. Create booking
      const bookRes = await api.post('/api/bookings', { reservationId });
      if (!bookRes.success) throw new Error(bookRes.error?.message || 'Failed to initialize booking.');

      const bookingId = bookRes.data.id;

      // 2. Perform check-in
      await api.post(`/api/bookings/${bookingId}/check-in`);
      triggerToast('Checked in successfully! Slot is now occupied.', 'success');
      fetchDashboardData(true);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to check-in.', 'error');
    }
  };

  // Handle Active Booking Check-In
  const handleCheckInBooking = async (bookingId: string) => {
    try {
      await api.post(`/api/bookings/${bookingId}/check-in`);
      triggerToast('Checked in successfully! Bay is occupied.', 'success');
      fetchDashboardData(true);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to check-in.', 'error');
    }
  };

  // Handle Active Booking Check-Out
  const handleCheckOutBooking = async (bookingId: string) => {
    try {
      await api.post(`/api/bookings/${bookingId}/check-out`);
      triggerToast('Checked out successfully! Thank you for using SmartPark.', 'success');
      fetchDashboardData(true);
    } catch (err: any) {
      triggerToast(err.message || 'Failed to check-out.', 'error');
    }
  };

  // Filter lists
  const activeReservation = reservations.find(r => r.status === 'CONFIRMED' && new Date(r.endTime) > new Date());
  const activeBooking = bookings.find(b => b.status === 'ACTIVE' && !b.exitTime);

  // Compute stats
  const totalSlotsAvailable = facilities.reduce((sum, f) => sum + f.availableSlots, 0);
  const totalCapacity = facilities.reduce((sum, f) => sum + f.totalCapacity, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round(((totalCapacity - totalSlotsAvailable) / totalCapacity) * 100) : 0;
  const unreadAlerts = notifications.filter(n => !n.isRead).length;

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary">
        Synchronizing credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 selection:bg-signature selection:text-smartBg relative overflow-x-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#181D21_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-signature/5 blur-[150px] rounded-full pointer-events-none z-0" />

      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 relative z-10 space-y-8 text-left">
        
        {/* Header Title Section with Sync */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-signature">
              DRIVER TELEMETRY CONSOLE
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-white tracking-tight">
              YOUR MOBILITY COCKPIT
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="text-[10px] uppercase font-mono tracking-wider h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync API Data
            </Button>
            <Link href="/search">
              <Button variant="primary" size="sm" className="text-[10px] uppercase font-mono tracking-wider h-8 px-4">
                Discover Parking <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Error Notice */}
        {errorMsg && (
          <div className="p-4 rounded-smart bg-occupied/10 border border-occupied/35 text-occupied text-xs font-sans flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Gateway Sync Warning</span>
              {errorMsg}
              <button onClick={() => fetchDashboardData()} className="mt-2 text-signature underline font-mono text-[10px] uppercase tracking-wider block">
                Force Reload Session
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          /* LOADING SKELETON */
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 h-[220px] bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
              <div className="lg:col-span-4 h-[220px] bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
            </div>
          </div>
        ) : (
          <>
            {/* 1. KEY KPI STATS METRIC GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'REGION OPEN BAYS', val: `${totalSlotsAvailable} spots`, sub: `${avgOccupancy}% regional load`, color: 'text-available' },
                { label: 'MY VEHICLES', val: `${vehicles.length} active`, sub: `${vehicles.filter(v => v.isEV).length} EV registered`, color: 'text-white' },
                { label: 'PENDING RESERVES', val: `${reservations.filter(r => r.status === 'CONFIRMED').length}`, sub: 'Ready for check-in', color: 'text-signature' },
                { label: 'ACTIVE CHECK-INS', val: activeBooking ? '1 Spot' : '0 Spots', sub: activeBooking ? activeBooking.slot.slotNumber : 'No check-in active', color: 'text-aiBlue' }
              ].map((kpi, idx) => (
                <Card key={idx} variant="elevated" className="p-4 space-y-1">
                  <span className="text-[9px] font-mono text-smartTextSecondary tracking-widest block uppercase">{kpi.label}</span>
                  <span className={`text-xl font-display font-bold uppercase tracking-wider block ${kpi.color}`}>{kpi.val}</span>
                  <span className="text-[9px] font-mono text-smartTextSecondary/60 block">{kpi.sub}</span>
                </Card>
              ))}
            </div>

            {/* 2. MAIN ACTIVE CONTROL COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column - Active Actions & Discovery */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Active Booking Card (Checked In / Active Occupancy) */}
                {activeBooking && (
                  <Card variant="default" className="border-aiBlue/30 bg-smartSurface/70 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-aiBlue" />
                        <span className="text-xs font-mono font-semibold text-white uppercase">ACTIVE OCCUPANCY SESSION</span>
                      </div>
                      <Badge variant="ai">CHECKED IN</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">FACILITY</span>
                        <span className="text-white block font-bold mt-0.5">{activeBooking.facility.name}</span>
                      </div>
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">ASSIGNED BAY</span>
                        <span className="text-signature block font-bold mt-0.5">{`${activeBooking.slot.floor.label} • Slot ${activeBooking.slot.slotNumber}`}</span>
                      </div>
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">CHECK-IN TIME</span>
                        <span className="text-white block font-bold mt-0.5">
                          {activeBooking.entryTime ? new Date(activeBooking.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-smartBorder/40">
                      <p className="text-xs text-smartTextSecondary text-center sm:text-left">
                        Rate index applied: <span className="text-white font-bold">₹5.00/hr</span>. System tracking active barrier locks.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCheckOutBooking(activeBooking.id)}
                        className="w-full sm:w-auto text-[10px] uppercase font-mono tracking-wider"
                      >
                        Release Slot & Check Out
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Active Reservation Card (Upcoming Trip) */}
                {activeReservation && !activeBooking && (
                  <Card variant="default" className="border-signature/30 bg-smartSurface/70 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-signature" />
                        <span className="text-xs font-mono font-semibold text-white uppercase">UPCOMING RESERVATION READY</span>
                      </div>
                      <Badge variant="signature">CONFIRMED</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">GARAGE</span>
                        <span className="text-white block font-bold mt-0.5">{activeReservation.facility.name}</span>
                      </div>
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">RESERVED BAY</span>
                        <span className="text-signature block font-bold mt-0.5">{`${activeReservation.slot.floor.label} • Slot ${activeReservation.slot.slotNumber}`}</span>
                      </div>
                      <div>
                        <span className="text-smartTextSecondary text-[9px] block">RESERV TIMES</span>
                        <span className="text-white block font-bold mt-0.5">
                          {new Date(activeReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4 pt-3 border-t border-smartBorder/40">
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCheckInReservation(activeReservation.id)}
                          className="text-[10px] uppercase font-mono tracking-wider"
                        >
                          Check In Now
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelReservation(activeReservation.id)}
                          className="text-[10px] uppercase font-mono tracking-wider border-occupied/30 hover:border-occupied text-occupied"
                        >
                          Cancel Reservation
                        </Button>
                      </div>
                      <p className="text-[10px] text-smartTextSecondary font-mono">
                        Security code: {activeReservation.id.split('-')[0].toUpperCase()}
                      </p>
                    </div>
                  </Card>
                )}

                {/* If neither active booking nor active reservation exist */}
                {!activeBooking && !activeReservation && (
                  <Card variant="default" className="p-8 text-center space-y-4 border-dashed border-smartBorder bg-smartSurface/30">
                    <div className="h-10 w-10 rounded-full bg-smartElevated flex items-center justify-center mx-auto text-smartTextSecondary">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-white uppercase">No Active Trips Found</h3>
                      <p className="text-xs text-smartTextSecondary max-w-sm mx-auto mt-1 leading-relaxed">
                        You do not have any active parking check-ins or pending reservations. Explore facilities to secure your space before arriving.
                      </p>
                    </div>
                    <Link href="/search" className="inline-block">
                      <Button variant="primary" size="sm" className="text-[10px] uppercase font-mono px-5">
                        Discover Nearby Bays
                      </Button>
                    </Link>
                  </Card>
                )}

                {/* Facilities List Panel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-smartTextSecondary">Active Parking Facilities</h3>
                    <Link href="/search" className="text-[10px] font-mono text-signature hover:underline flex items-center gap-0.5">
                      Open Search Directory <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facilities.slice(0, 4).map(facility => (
                      <Card key={facility.id} variant="elevated" className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-semibold text-sm text-white">{facility.name}</h4>
                            <p className="text-[10px] text-smartTextSecondary flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {facility.address}
                            </p>
                          </div>
                          <Badge variant={facility.availableSlots > 0 ? 'available' : 'occupied'} className="text-[8px]">
                            {facility.availableSlots > 0 ? 'OPEN' : 'FULL'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono border-t border-smartBorder/40 pt-2 text-smartTextSecondary">
                          <span>OCCUPANCY LOAD</span>
                          <span className="text-white font-bold">{facility.occupancyPercentage}%</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column - User Vehicles & Notifications */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Vehicles Management Panel */}
                <Card variant="elevated" className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-smartBorder/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Car className="h-4 w-4 text-signature" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">My Garage</h3>
                    </div>
                    <Link href="/profile">
                      <span className="text-[9px] font-mono text-smartTextSecondary hover:text-signature cursor-pointer transition-colors flex items-center gap-0.5">
                        EDIT <Plus className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>

                  {vehicles.length > 0 ? (
                    <div className="space-y-3">
                      {vehicles.map(v => (
                        <div key={v.id} className="p-3 bg-smartBg/60 border border-smartBorder/80 rounded-smart flex items-center justify-between font-mono text-xs">
                          <div>
                            <span className="font-bold text-white block">{v.licensePlate}</span>
                            <span className="text-[9px] text-smartTextSecondary block mt-0.5">
                              {v.make || v.model ? `${v.color || ''} ${v.make || ''} ${v.model || ''}`.trim() : 'Standard Vehicle'}
                            </span>
                          </div>
                          <Badge variant={v.isEV ? 'signature' : 'default'} className="text-[8px] px-1.5 py-0 h-auto">
                            {v.isEV ? 'EV' : 'GAS'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2 font-sans">
                      <p className="text-xs text-smartTextSecondary">No vehicles registered yet.</p>
                      <Link href="/profile" className="inline-block">
                        <Button variant="secondary" size="sm" className="text-[9px] uppercase font-mono h-7">
                          Add First Vehicle
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* AI Recommendation Hook */}
                  {vehicles.length > 0 && (
                    <div className="p-3 rounded bg-signature/5 border border-signature/20 space-y-2">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-signature font-bold">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI CO-PILOT ROUTER
                      </div>
                      <p className="text-[10px] text-smartTextSecondary leading-relaxed">
                        {vehicles.some(v => v.isEV)
                          ? 'EV vehicles detected. Recommender prioritizing charger spaces at Cyber City Hub Tower C.'
                          : 'Prioritizing proximity standard slots near Cyber City Metro Concourse.'}
                      </p>
                      <Link href="/intelligence" className="text-[9px] font-mono text-signature underline block">
                        Open Intelligence Analytics
                      </Link>
                    </div>
                  )}
                </Card>

                {/* Notifications Alert Panel */}
                <Card variant="elevated" className="p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-smartBorder/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-aiBlue" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Alert Logs</h3>
                    </div>
                    {unreadAlerts > 0 && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-occupied/10 border border-occupied/30 text-occupied uppercase animate-pulse">
                        {unreadAlerts} NEW
                      </span>
                    )}
                  </div>

                  {notifications.length > 0 ? (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-none">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className={`p-3 bg-smartBg/40 border rounded-smart flex items-start gap-2.5 ${n.isRead ? 'border-smartBorder/40 opacity-70' : 'border-smartBorder'}`}>
                          <div className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1.5 ${n.priority === 'IMPORTANT' ? 'bg-occupied' : 'bg-signature'}`} />
                          <div className="font-sans text-xs">
                            <span className="font-bold text-white block">{n.title}</span>
                            <span className="text-[10px] text-smartTextSecondary block mt-0.5">{n.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-smartTextSecondary font-sans">
                      No notifications or operational alerts at this time.
                    </div>
                  )}
                </Card>

              </div>

            </div>
          </>
        )}

      </main>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
