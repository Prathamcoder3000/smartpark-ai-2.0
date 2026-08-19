'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  CreditCard, 
  Hash, 
  QrCode, 
  Map, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
  Compass,
  XCircle,
  Sparkles
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui/EmptyState';
import { Booking, BookingStatus } from '../../lib/bookingsData';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';
import { api } from '../../lib/api';

export default function BookingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  const [activeFilter, setActiveFilter] = React.useState<string>('ALL');
  const [selectedBookingDetails, setSelectedBookingDetails] = React.useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = React.useState<Booking | null>(null);
  const [focusedPassBooking, setFocusedPassBooking] = React.useState<Booking | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMsg, setToastMsg] = React.useState<string>('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const mapBookingToFrontend = (b: any): Booking => {
    const isCheckedIn = !!b.entryTime;
    
    let bookingStatus: BookingStatus = 'UPCOMING';
    if (b.status === 'COMPLETED') {
      bookingStatus = 'COMPLETED';
    } else if (b.status === 'CANCELLED') {
      bookingStatus = 'CANCELLED';
    } else if (b.status === 'ACTIVE') {
      bookingStatus = isCheckedIn ? 'ACTIVE' : 'UPCOMING';
    }

    const startD = b.reservation?.startTime ? new Date(b.reservation.startTime) : new Date(b.createdAt);
    const endD = b.reservation?.endTime ? new Date(b.reservation.endTime) : new Date(b.createdAt);

    const dateStr = startD.toISOString().split('T')[0];
    const startTimeStr = startD.toTimeString().split(' ')[0].substring(0, 5);
    const endTimeStr = endD.toTimeString().split(' ')[0].substring(0, 5);

    return {
      id: b.id,
      facilityName: b.facility?.name || 'SmartPark Facility',
      facilityAddress: b.facility?.address || 'Near Downtown',
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      slotNumber: b.slot?.slotNumber || 'A-101',
      floor: b.slot?.floor?.name || 'Level 1',
      vehicle: b.reservation?.vehicle 
        ? `${b.reservation.vehicle.licensePlate} (${b.reservation.vehicle.make} ${b.reservation.vehicle.model})`
        : 'No vehicle associated',
      amount: b.finalAmount || b.reservation?.price || 5.00,
      bookingStatus,
      bookingReference: b.id.substring(0, 8).toUpperCase(),
      distanceKm: 0.5,
      walkMinutes: 5,
      amenities: b.slot?.isEVCharging ? ['EV Fast Charger', 'CCTV 24/7', 'Covered Deck'] : ['CCTV 24/7', 'Covered Deck'],
      createdDate: new Date(b.createdAt).toLocaleString()
    };
  };

  const loadBookings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings');
      if (res.success && Array.isArray(res.data)) {
        setBookings(res.data.map(mapBookingToFrontend));
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to load bookings.', 'error');
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
      loadBookings();
    }
  }, [router, loadBookings]);

  // Find the primary booking for the Pass (Upcoming or Active)
  const primaryPassBooking = React.useMemo(() => {
    if (focusedPassBooking) {
      // Find updated booking in the list
      return bookings.find(b => b.id === focusedPassBooking.id) || focusedPassBooking;
    }
    const active = bookings.find(b => b.bookingStatus === 'ACTIVE');
    if (active) return active;
    return bookings.find(b => b.bookingStatus === 'UPCOMING') || null;
  }, [bookings, focusedPassBooking]);

  const metrics = React.useMemo(() => {
    const upcoming = bookings.filter(b => b.bookingStatus === 'UPCOMING').length;
    const completed = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED');
    const parkingHours = completedBookings.length * 2; // Simulated hours
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.amount, 0);

    return {
      upcoming,
      completed,
      parkingHours,
      totalSpent
    };
  }, [bookings]);

  // Filtered booking lists
  const filteredBookings = React.useMemo(() => {
    if (activeFilter === 'ALL') return bookings;
    return bookings.filter(b => b.bookingStatus === activeFilter);
  }, [bookings, activeFilter]);

  // Check In Handler
  const handleCheckIn = async (bookingId: string) => {
    try {
      const res = await api.post(`/api/bookings/${bookingId}/check-in`);
      if (res.success) {
        showToast('Successfully checked in! Physical gate opened.', 'success');
        await loadBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Check-in failed.', 'error');
    }
  };

  // Check Out Handler
  const handleCheckOut = async (bookingId: string) => {
    try {
      const res = await api.post(`/api/bookings/${bookingId}/check-out`);
      if (res.success) {
        showToast(`Successfully checked out! Charged: ₹${res.data.finalAmount}.`, 'success');
        await loadBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Check-out failed.', 'error');
    }
  };

  // Cancel reservation callback
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      const res = await api.post(`/api/bookings/${bookingToCancel.id}/cancel`);
      if (res.success) {
        showToast(`Booking ${bookingToCancel.bookingReference} cancelled successfully.`, 'success');
        setBookingToCancel(null);
        await loadBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.', 'error');
    }
  };

  const handleFocusPass = (booking: Booking) => {
    setFocusedPassBooking(booking);
    const passElement = document.getElementById('digital-pass-card');
    passElement?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Loaded digital pass for ${booking.facilityName}`, 'info');
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">

        {/* 1. PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-smartBorder/40 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white">
              Reservations
            </h1>
            <p className="text-xs text-smartTextSecondary font-sans mt-0.5">
              Manage your active parking passes, upcoming sessions, and historic logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-smartTextSecondary uppercase">
              NETWORK STATE: <span className="text-available">CONNECTED</span>
            </span>
            <div className="bg-smartSurface border border-smartBorder px-2.5 py-1 rounded text-[9.5px] font-mono text-smartTextPrimary">
              UPCOMING RES: <span className="text-signature font-bold">{metrics.upcoming}</span>
            </div>
          </div>
        </div>

        {/* 2. BOOKINGS SUMMARY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard 
            label="Upcoming Reservations"
            value={metrics.upcoming}
            trend={{ value: 'Scheduled entry gates', direction: 'neutral' }}
          />
          <MetricCard 
            label="Completed Trips"
            value={metrics.completed}
            trend={{ value: 'Total telemetry logs', direction: 'neutral' }}
          />
          <MetricCard 
            label="Simulated Parking Hours"
            value={`${metrics.parkingHours} hrs`}
            trend={{ value: 'Estimated duration', direction: 'neutral' }}
          />
          <MetricCard 
            label="Total Spent (Real)"
            value={`₹${metrics.totalSpent}`}
            trend={{ value: 'Processed via account', direction: 'neutral' }}
          />
        </div>

        {/* 3. TWO-COLUMN: DIGITAL PASS vs INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left / Center 2 Columns: Digital Parking Pass Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Active Access Permit
            </h3>

            {primaryPassBooking ? (
              <div id="digital-pass-card" className="relative overflow-hidden bg-gradient-to-br from-smartSurface to-smartElevated border border-signature/20 rounded-smart-lg p-6 flex flex-col md:flex-row justify-between gap-6 shadow-xl">
                
                <div className="absolute top-0 right-0 h-32 w-32 bg-signature/5 blur-2xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-24 w-24 bg-aiBlue/5 blur-2xl rounded-full pointer-events-none" />

                {/* Left Side: Pass details */}
                <div className="flex-1 flex flex-col justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                        primaryPassBooking.bookingStatus === 'ACTIVE' 
                          ? 'text-signature border-signature/30 bg-signature/10' 
                          : 'text-aiBlue border-aiBlue/30 bg-aiBlue/10'
                      }`}>
                        {primaryPassBooking.bookingStatus === 'ACTIVE' ? 'ACTIVE PERMIT (PARKED)' : 'UPCOMING RESERVATION (PERMIT READY)'}
                      </span>
                      <span className="text-[10px] font-mono text-smartTextSecondary">
                        REF: {primaryPassBooking.bookingReference}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-display font-bold uppercase text-white tracking-wide">
                      {primaryPassBooking.facilityName}
                    </h2>
                    <p className="text-xs text-smartTextSecondary flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {primaryPassBooking.facilityAddress}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-smartBg/60 border border-smartBorder/40 p-3 rounded-lg max-w-md">
                    <div>
                      <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Floor</span>
                      <span className="font-mono text-xs font-bold text-white">{primaryPassBooking.floor}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Bay Assign</span>
                      <span className="font-mono text-xs font-bold text-signature">{primaryPassBooking.slotNumber}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Vehicle Reg</span>
                      <span className="font-mono text-[10px] font-bold text-white truncate max-w-[80px]" title={primaryPassBooking.vehicle}>
                        {primaryPassBooking.vehicle.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {/* Live Check-in / Check-out dynamic triggers */}
                    {primaryPassBooking.bookingStatus === 'UPCOMING' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="text-[10.5px] uppercase tracking-wider font-semibold bg-available hover:bg-available/85 text-black border-transparent"
                        onClick={() => handleCheckIn(primaryPassBooking.id)}
                      >
                        Check In Now
                      </Button>
                    )}
                    {primaryPassBooking.bookingStatus === 'ACTIVE' && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="text-[10.5px] uppercase tracking-wider font-semibold bg-occupied hover:bg-occupied/85 text-white border-transparent"
                        onClick={() => handleCheckOut(primaryPassBooking.id)}
                      >
                        Check Out
                      </Button>
                    )}
                    
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-[10.5px] uppercase tracking-wider font-semibold"
                      onClick={() => setSelectedBookingDetails(primaryPassBooking)}
                    >
                      Permit details
                    </Button>

                    {primaryPassBooking.bookingStatus === 'UPCOMING' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10.5px] uppercase tracking-wider font-semibold text-occupied hover:bg-occupied/10 border border-transparent hover:border-occupied/20"
                        onClick={() => setBookingToCancel(primaryPassBooking)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Side: QR Pattern Code */}
                <div className="w-full md:w-44 flex flex-col items-center justify-center bg-smartBg/70 border border-smartBorder/60 p-4 rounded-xl relative z-10">
                  <div className="h-28 w-28 border-2 border-dashed border-smartBorder/95 flex items-center justify-center bg-smartSurface relative rounded p-2">
                    <QrCode className="h-20 w-20 text-smartTextPrimary opacity-80" />
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-signature/60 shadow-lg animate-pulse" />
                  </div>
                  <span className="text-[9px] font-mono text-smartTextSecondary mt-3 tracking-wider text-center">
                    SHOW PASS AT BARRIER
                  </span>
                  <span className="text-[8px] font-mono text-smartTextSecondary/60 mt-1 text-center">
                    Live Real-time Permit
                  </span>
                </div>

              </div>
            ) : (
              <Card variant="outlined" className="h-56 flex flex-col items-center justify-center border-dashed border-smartBorder/60">
                <Info className="h-8 w-8 text-smartTextSecondary/40 mb-2" />
                <span className="text-xs font-sans text-smartTextSecondary">No active access permits found.</span>
                <Link href="/search" className="mt-3">
                  <Button variant="primary" size="sm" className="text-xs uppercase tracking-wider font-semibold">
                    Reserve Parking Spot
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Right Column: AI Intel */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              AI Parking Intelligence
            </h3>
            
            <Card className="flex-1 flex flex-col gap-4 justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-signature/10 text-signature shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-sans">Dynamic Pricing Active</h4>
                  <p className="text-[10px] text-smartTextSecondary mt-1 leading-relaxed">
                    Peak surcharge is currently NOT active. Capped hourly billing of ₹60/hr applies to all live garages.
                  </p>
                </div>
              </div>

              <div className="border-t border-smartBorder/30 pt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-smartTextSecondary font-sans">Current Demand Level:</span>
                  <span className="font-mono text-white font-bold uppercase">Moderate</span>
                </div>
                <div className="w-full bg-smartBg h-1.5 rounded overflow-hidden">
                  <div className="bg-signature h-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div className="bg-smartBg/60 border border-smartBorder/45 p-3 rounded-lg flex flex-col gap-2">
                <h5 className="text-[9px] font-mono text-white uppercase tracking-wider">AI Recommender Tip</h5>
                <p className="text-[9.5px] text-smartTextSecondary leading-relaxed">
                  Metro Central Garage currently has the highest available bays close to central station gate. Access barrier opens automatically via registered license plates.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* 4. HISTORY / LOG LIST */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-smartBorder/40 pb-3 gap-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Reservation Archives
            </h3>
            <div className="flex gap-1">
              {['ALL', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((filter) => (
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

          {loading ? (
            <div className="text-center py-10 font-mono text-xs text-smartTextSecondary animate-pulse">
              Loading reservation logs...
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map((b) => (
                <Card key={b.id} className="flex flex-col justify-between gap-4 p-5 hover:border-smartBorder/90 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-[12.5px] font-sans font-bold text-white line-clamp-1">{b.facilityName}</h4>
                      <p className="text-[10px] text-smartTextSecondary flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {b.facilityAddress}
                      </p>
                    </div>
                    <Badge variant={
                      b.bookingStatus === 'ACTIVE' ? 'occupied' :
                      b.bookingStatus === 'UPCOMING' ? 'ai' :
                      b.bookingStatus === 'COMPLETED' ? 'available' : 'default'
                    } className="uppercase font-mono tracking-wider font-semibold text-[8px]">
                      {b.bookingStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-smartBg/60 border border-smartBorder/30 p-2.5 rounded text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-white">
                      <Calendar className="h-3.5 w-3.5 text-signature" />
                      <span>{b.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <Clock className="h-3.5 w-3.5 text-signature" />
                      <span>{b.startTime} - {b.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <Layers className="h-3.5 w-3.5 text-signature" />
                      <span>Slot {b.slotNumber} ({b.floor})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <Car className="h-3.5 w-3.5 text-signature" />
                      <span className="truncate max-w-[120px]">{b.vehicle}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-smartBorder/30 pt-3">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-smartTextSecondary" />
                      <span className="text-[11px] font-bold text-signature">₹{b.amount}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => handleFocusPass(b)}>
                        Digital Pass
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white hover:text-signature" onClick={() => setSelectedBookingDetails(b)}>
                        Inspect
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No Reservations Found"
              description={`You currently have no ${activeFilter === 'ALL' ? '' : activeFilter.toLowerCase()} reservation logs logged on this account.`}
              actionText="Book Spot Now"
              onAction={() => router.push('/search')}
            />
          )}
        </div>
      </main>

      {/* 6. BOOKING DETAILS INSPECTOR MODAL */}
      <Modal
        isOpen={selectedBookingDetails !== null}
        onClose={() => setSelectedBookingDetails(null)}
        title="Parking Permit Details"
        size="md"
      >
        {selectedBookingDetails && (
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-smartBorder/30 pb-3">
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Facility Name</span>
                <span className="text-white text-xs font-semibold">{selectedBookingDetails.facilityName}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Pass Reference</span>
                <span className="text-white text-xs font-semibold font-mono">{selectedBookingDetails.bookingReference}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b border-smartBorder/30 pb-3">
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Date</span>
                <span className="text-white text-[11px] font-semibold">{selectedBookingDetails.date}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Time Range</span>
                <span className="text-white text-[11px] font-semibold">{selectedBookingDetails.startTime} - {selectedBookingDetails.endTime}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Status</span>
                <Badge variant={selectedBookingDetails.bookingStatus === 'ACTIVE' ? 'occupied' : 'available'} className="uppercase text-[8px] font-semibold">
                  {selectedBookingDetails.bookingStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-smartBorder/30 pb-3">
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Bay & Floor</span>
                <span className="text-signature text-xs font-semibold">{selectedBookingDetails.slotNumber} ({selectedBookingDetails.floor})</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Assigned Vehicle</span>
                <span className="text-white text-[11px] truncate block" title={selectedBookingDetails.vehicle}>
                  {selectedBookingDetails.vehicle}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9.5px] font-mono text-smartTextSecondary uppercase">Amenities Included</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBookingDetails.amenities.map(amenity => (
                  <span key={amenity} className="text-[9.5px] font-mono bg-smartBg border border-smartBorder px-2 py-0.5 rounded text-white">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-smartBg/50 border border-smartBorder/60 p-3 rounded-lg text-center mt-1">
              <div>
                <span className="text-[8px] font-mono text-smartTextSecondary block uppercase">Transit</span>
                <span className="text-white font-bold block">{selectedBookingDetails.distanceKm} km</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-smartTextSecondary block uppercase">Walk ETA</span>
                <span className="text-white font-bold block">{selectedBookingDetails.walkMinutes} min</span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-smartTextSecondary block uppercase">Amount</span>
                <span className="text-signature font-bold block">₹{selectedBookingDetails.amount}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t border-smartBorder/30 pt-3 text-[9px] font-mono text-smartTextSecondary/60">
              <span>CREATED TIMESTAMP: {selectedBookingDetails.createdDate}</span>
              <span>GATE REGISTRATION INDEX: automated-ANPR-scanner-v2</span>
            </div>

            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-smartBorder/45">
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs uppercase tracking-wider font-semibold"
                onClick={() => setSelectedBookingDetails(null)}
              >
                Close
              </Button>
              <Link href="/map">
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="text-xs uppercase tracking-wider font-semibold"
                  onClick={() => setSelectedBookingDetails(null)}
                >
                  Launch Route
                </Button>
              </Link>
            </div>

          </div>
        )}
      </Modal>

      {/* 7. CANCEL RESERVATION CONFIRMATION MODAL */}
      <Modal
        isOpen={bookingToCancel !== null}
        onClose={() => setBookingToCancel(null)}
        title="Cancel Parking Reservation?"
        size="sm"
      >
        {bookingToCancel && (
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="flex items-start gap-2.5 bg-occupied/5 border border-occupied/30 p-3 rounded-lg text-occupied">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[11.5px] uppercase">Warning: Cancellation Policy</h4>
                <p className="text-[10px] mt-0.5 text-occupied/90 leading-relaxed">
                  You are about to cancel your reservation for spot <span className="font-bold">{bookingToCancel.slotNumber}</span>. This action is irreversible.
                </p>
              </div>
            </div>

            <div className="bg-smartBg border border-smartBorder/60 p-3.5 rounded-lg flex flex-col gap-2 font-mono">
              <div className="flex justify-between border-b border-smartBorder/30 pb-1.5">
                <span className="text-smartTextSecondary">Facility:</span>
                <span className="text-white text-right max-w-[180px] truncate">{bookingToCancel.facilityName}</span>
              </div>
              <div className="flex justify-between border-b border-smartBorder/30 pb-1.5">
                <span className="text-smartTextSecondary">Reference:</span>
                <span className="text-white">{bookingToCancel.bookingReference}</span>
              </div>
              <div className="flex justify-between border-b border-smartBorder/30 pb-1.5">
                <span className="text-smartTextSecondary">Schedule:</span>
                <span className="text-white">{bookingToCancel.date} @ {bookingToCancel.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-smartTextSecondary">Refund Amount:</span>
                <span className="text-available font-bold">₹{bookingToCancel.amount}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-smartBorder/45">
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs uppercase tracking-wider font-semibold"
                onClick={() => setBookingToCancel(null)}
              >
                Keep Reservation
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs uppercase tracking-wider font-semibold text-white bg-occupied hover:bg-occupied/80"
                onClick={handleCancelBooking}
              >
                Cancel Booking
              </Button>
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
