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
import { MOCK_BOOKINGS, Booking, BookingStatus } from '../../lib/bookingsData';

export default function BookingsPage() {
  // --- States ---
  const [bookings, setBookings] = React.useState<Booking[]>(MOCK_BOOKINGS);

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem('smartpark_prototype_reservation');
      if (stored) {
        const protoRes = JSON.parse(stored);
        const startHour = parseInt(protoRes.selection.startTime.split(':')[0]) || 9;
        const durationHours = parseInt(protoRes.selection.duration) || 2;
        const endTimeStr = `${(startHour + durationHours).toString().padStart(2, '0')}:00`;

        const mappedBooking: Booking = {
          id: protoRes.reference,
          facilityName: protoRes.facility.name,
          facilityAddress: protoRes.facility.address,
          date: protoRes.selection.date,
          startTime: protoRes.selection.startTime,
          endTime: endTimeStr,
          slotNumber: protoRes.selection.slotId.split('-').pop() || protoRes.selection.slotId,
          floor: protoRes.floorLabel,
          vehicle: protoRes.selection.vehicleId.startsWith('veh-1') ? 'MH-01-DR-4829 (Honda City)' : 'MH-01-EE-9021 (Nexon EV)',
          amount: protoRes.pricing.totalAmount,
          bookingStatus: 'UPCOMING',
          bookingReference: protoRes.reference,
          distanceKm: protoRes.facility.distanceKm,
          walkMinutes: protoRes.facility.walkingEta,
          amenities: protoRes.facility.hasEv ? ['EV Charging', 'Covered Parking'] : ['Covered Parking'],
          createdDate: protoRes.createdAt
        };

        setBookings((prev) => {
          if (prev.some((b) => b.id === mappedBooking.id)) return prev;
          return [mappedBooking, ...prev];
        });
      }
    } catch (e) {
      console.error('Failed to load prototype booking', e);
    }
  }, []);

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

  // Find the primary booking for the Pass (Upcoming or Active)
  const primaryPassBooking = React.useMemo(() => {
    if (focusedPassBooking) return focusedPassBooking;
    // Prefer ACTIVE then UPCOMING
    const active = bookings.find(b => b.bookingStatus === 'ACTIVE');
    if (active) return active;
    return bookings.find(b => b.bookingStatus === 'UPCOMING') || null;
  }, [bookings, focusedPassBooking]);

  // Calculations for Metrics from current state
  const metrics = React.useMemo(() => {
    const upcoming = bookings.filter(b => b.bookingStatus === 'UPCOMING').length;
    const completed = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
    
    // Estimate hours (we default to hours difference, or hardcode a sum for the mock)
    // book-03: 8 hours, book-04: 4 hours = 12 total.
    const completedBookings = bookings.filter(b => b.bookingStatus === 'COMPLETED');
    const parkingHours = completedBookings.length * 5; // average mock duration
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

  // Cancel reservation callback
  const handleCancelBooking = () => {
    if (!bookingToCancel) return;

    // Update bookingStatus in local state
    setBookings(prev => prev.map(b => {
      if (b.id === bookingToCancel.id) {
        return { ...b, bookingStatus: 'CANCELLED' };
      }
      return b;
    }));

    // If cancelling the focused pass, reset it
    if (focusedPassBooking?.id === bookingToCancel.id) {
      setFocusedPassBooking(null);
    }

    showToast(`Reservation ${bookingToCancel.bookingReference} cancelled in prototype mode.`, 'success');
    setBookingToCancel(null);
  };

  // Focus pass helper
  const handleFocusPass = (booking: Booking) => {
    setFocusedPassBooking(booking);
    // Scroll pass into view on mobile if needed
    const passElement = document.getElementById('digital-pass-card');
    passElement?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Loaded digital pass for ${booking.facilityName}`, 'info');
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 relative">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">

        {/* ==================================================
            1. PAGE HEADER
           ================================================== */}
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

        {/* ==================================================
            2. BOOKINGS SUMMARY METRICS
           ================================================== */}
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
            label="Total Spent (Proto)"
            value={`₹${metrics.totalSpent}`}
            trend={{ value: 'Processed via account', direction: 'neutral' }}
          />
        </div>

        {/* ==================================================
            3. TWO-COLUMN: DIGITAL PASS vs INSIGHTS
           ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left / Center 2 Columns: Digital Parking Pass Card */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Active Access Permit
            </h3>

            {primaryPassBooking ? (
              <div id="digital-pass-card" className="relative overflow-hidden bg-gradient-to-br from-smartSurface to-smartElevated border border-signature/20 rounded-smart-lg p-6 flex flex-col md:flex-row justify-between gap-6 shadow-xl">
                
                {/* Visual Pass Overlay lines */}
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
                        {primaryPassBooking.bookingStatus === 'ACTIVE' ? 'ACTIVE PERMIT' : 'UPCOMING RESERVATION'}
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
                    <Link href="/map">
                      <Button variant="primary" size="sm" className="text-[10.5px] uppercase tracking-wider font-semibold">
                        <Map className="h-3 w-3 mr-1" />
                        View Route
                      </Button>
                    </Link>
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
                        Cancel Reservation
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Side: QR Pattern Code Placeholder */}
                <div className="w-full md:w-44 flex flex-col items-center justify-center bg-smartBg/70 border border-smartBorder/60 p-4 rounded-xl relative z-10">
                  <div className="h-28 w-28 border-2 border-dashed border-smartBorder/95 flex items-center justify-center bg-smartSurface relative rounded p-2">
                    <QrCode className="h-20 w-20 text-smartTextPrimary opacity-80" />
                    {/* Simulated scanning indicator line */}
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-signature/60 shadow-lg animate-pulse" />
                  </div>
                  <span className="text-[9px] font-mono text-smartTextSecondary mt-3 tracking-wider text-center">
                    SHOW PASS AT BARRIER
                  </span>
                  <span className="text-[8px] font-mono text-smartTextSecondary/60 mt-1 text-center">
                    Digital preview (simulation)
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

          {/* Right Column: SmartPark Booking Insight Panel */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Reservations Assistant
            </h3>

            <Card variant="default" className="flex flex-col gap-4 h-full justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-signature">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">
                    SmartPark Assistant
                  </span>
                </div>
                
                {primaryPassBooking ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-smartTextSecondary leading-relaxed">
                      Your upcoming bay assignment <span className="text-white font-semibold">{primaryPassBooking.slotNumber}</span> at {primaryPassBooking.facilityName} is in a zone with <span className="text-available font-semibold">stable predicted availability</span>.
                    </p>
                    <div className="text-[10px] font-mono text-smartTextSecondary/80 bg-smartBg/65 border border-smartBorder/45 p-2 rounded leading-relaxed">
                      AI recommendation confidence for this dispatch route: <span className="text-signature font-bold">96.8% Match</span>.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-smartTextSecondary leading-relaxed">
                    No scheduled reservations detected. Our AI dispatch system monitors destination spaces in real-time to save you an average of 14 minutes per commute.
                  </p>
                )}
              </div>

              <div className="border-t border-smartBorder/45 pt-3">
                <span className="text-[9px] font-mono text-smartTextSecondary/60 block">
                  * Dynamic forecast estimates. Validation will be fully connected during API integration setup.
                </span>
              </div>
            </Card>
          </div>

        </div>

        {/* ==================================================
            4. BOOKING HISTORY FILTER TABS
           ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/40 pb-2">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'ALL', label: 'All Logs' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => {
              const count = tab.id === 'ALL' 
                ? bookings.length 
                : bookings.filter(b => b.bookingStatus === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`text-[10.5px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all ${
                    activeFilter === tab.id
                      ? 'bg-smartSurface border-smartBorder text-signature'
                      : 'border-transparent text-smartTextSecondary hover:text-smartTextPrimary'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {activeFilter !== 'ALL' && (
            <button 
              className="text-[10.5px] font-mono text-signature hover:underline text-left self-start"
              onClick={() => setActiveFilter('ALL')}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ==================================================
            5. BOOKING HISTORY GRID/LIST
           ================================================== */}
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => {
              const statusColors = {
                UPCOMING: 'bg-aiBlue/10 border-aiBlue/30 text-aiBlue',
                ACTIVE: 'bg-signature/10 border-signature/30 text-signature',
                COMPLETED: 'bg-available/10 border-available/30 text-available',
                CANCELLED: 'bg-occupied/10 border-occupied/30 text-occupied'
              };

              return (
                <Card 
                  key={booking.id} 
                  variant="default"
                  className={`transition-all ${
                    focusedPassBooking?.id === booking.id 
                      ? 'border-signature bg-signature/[0.01]' 
                      : 'hover:border-smartBorder/90'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[8.5px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border ${statusColors[booking.bookingStatus]}`}>
                          {booking.bookingStatus}
                        </span>
                        <span className="text-[10.5px] font-mono text-smartTextSecondary">
                          REF: {booking.bookingReference}
                        </span>
                      </div>

                      <h4 className="text-sm font-display font-bold uppercase text-white tracking-wide">
                        {booking.facilityName}
                      </h4>
                      <p className="text-[11px] text-smartTextSecondary mt-0.5 truncate max-w-[280px]">
                        {booking.facilityAddress}
                      </p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-smartBorder/30 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-smartTextSecondary">
                          <Calendar className="h-3.5 w-3.5 text-signature" />
                          <span className="text-white">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-smartTextSecondary">
                          <Clock className="h-3.5 w-3.5 text-signature" />
                          <span className="text-white">{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-smartTextSecondary">
                          <Layers className="h-3.5 w-3.5 text-aiBlue" />
                          <span>Slot: <span className="text-white font-bold">{booking.slotNumber} ({booking.floor})</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-smartTextSecondary">
                          <Car className="h-3.5 w-3.5 text-aiBlue" />
                          <span className="truncate max-w-[120px]">{booking.vehicle.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end h-full min-h-[110px]">
                      <span className="font-mono text-sm font-bold text-white">
                        ₹{booking.amount}
                      </span>

                      {/* Card Action Buttons */}
                      <div className="flex flex-col gap-1.5 mt-4 w-28">
                        {booking.bookingStatus === 'UPCOMING' && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-[10px] w-full uppercase py-1"
                              onClick={() => setSelectedBookingDetails(booking)}
                            >
                              Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] w-full uppercase text-occupied hover:bg-occupied/5 border border-smartBorder/30 py-1"
                              onClick={() => setBookingToCancel(booking)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {booking.bookingStatus === 'ACTIVE' && (
                          <>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="text-[10px] w-full uppercase py-1"
                              onClick={() => handleFocusPass(booking)}
                            >
                              View Pass
                            </Button>
                            <Link href="/map" className="w-full">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="text-[10px] w-full uppercase py-1"
                              >
                                Route
                              </Button>
                            </Link>
                          </>
                        )}

                        {booking.bookingStatus === 'COMPLETED' && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-[10px] w-full uppercase py-1"
                              onClick={() => setSelectedBookingDetails(booking)}
                            >
                              Details
                            </Button>
                            <Link href="/search" className="w-full">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] w-full uppercase border border-smartBorder/30 py-1"
                              >
                                Book Again
                              </Button>
                            </Link>
                          </>
                        )}

                        {booking.bookingStatus === 'CANCELLED' && (
                          <>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-[10px] w-full uppercase py-1"
                              onClick={() => setSelectedBookingDetails(booking)}
                            >
                              Details
                            </Button>
                            <Link href="/search" className="w-full">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[10px] w-full uppercase border border-smartBorder/30 py-1"
                              >
                                Rebook
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            title="No Bookings Found"
            description={`You have no reservations currently matching the filter "${activeFilter}".`}
            actionText="Find Parking Spots"
            onAction={() => window.location.href = '/search'}
          />
        )}

      </main>

      {/* ==================================================
          6. BOOKING DETAILS MODAL
         ================================================== */}
      <Modal
        isOpen={selectedBookingDetails !== null}
        onClose={() => setSelectedBookingDetails(null)}
        title="Reservation Permit Details"
        size="md"
      >
        {selectedBookingDetails && (
          <div className="flex flex-col gap-4 font-sans text-xs">
            
            <div className="flex items-center justify-between border-b border-smartBorder/45 pb-3">
              <div>
                <span className="text-[10px] font-mono text-smartTextSecondary block uppercase">Reference ID</span>
                <span className="font-mono text-sm font-bold text-white">{selectedBookingDetails.bookingReference}</span>
              </div>
              <Badge variant={
                selectedBookingDetails.bookingStatus === 'UPCOMING' ? 'ai' :
                selectedBookingDetails.bookingStatus === 'ACTIVE' ? 'signature' :
                selectedBookingDetails.bookingStatus === 'COMPLETED' ? 'available' : 'occupied'
              }>
                {selectedBookingDetails.bookingStatus}
              </Badge>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[9.5px] font-mono text-smartTextSecondary uppercase">Location</span>
              <h4 className="text-sm font-bold text-white">{selectedBookingDetails.facilityName}</h4>
              <p className="text-[11px] text-smartTextSecondary">{selectedBookingDetails.facilityAddress}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-smartBorder/30 py-3 font-mono">
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Scheduled Date</span>
                <span className="text-white text-xs font-semibold">{selectedBookingDetails.date}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Time Frame</span>
                <span className="text-white text-xs font-semibold">{selectedBookingDetails.startTime} - {selectedBookingDetails.endTime}</span>
              </div>
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
                <span className="text-[8px] font-mono text-smartTextSecondary block uppercase">Amount Paid</span>
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

      {/* ==================================================
          7. CANCEL RESERVATION CONFIRMATION MODAL
         ================================================== */}
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
                  You are about to cancel your reservation for spot <span className="font-bold">{bookingToCancel.slotNumber}</span>. This action is irreversible on this client instance.
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

            <p className="text-[9.5px] text-smartTextSecondary/70 leading-relaxed">
              * prototype Mode Note: Since backend servers are currently offline in this design preview checkpoint, this action updates client state only.
            </p>

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

      {/* Global Application Toast */}
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
