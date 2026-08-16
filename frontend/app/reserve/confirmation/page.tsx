'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  Car,
  Layers,
  ArrowLeft,
  Search,
  BookOpen,
  Download,
  AlertTriangle,
  Info,
  Map
} from 'lucide-react';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Toast } from '../../../components/ui/Toast';
import { ReservationSummary } from '../../../lib/reservationData';

export default function ConfirmationPage() {
  const router = useRouter();
  const [summary, setSummary] = React.useState<ReservationSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Toast
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Retrieve reservation details from sessionStorage
  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem('smartpark_pending_reservation');
      if (stored) {
        const parsed = JSON.parse(stored) as ReservationSummary;
        setSummary(parsed);

        // Save into prototype confirmed store so /bookings can display it
        sessionStorage.setItem('smartpark_prototype_reservation', JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('Failed to retrieve pending reservation', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save pass helper
  const handleSavePass = () => {
    triggerToast('Pass saved in prototype mode.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
        <Header />
        <main className="flex-1 mx-auto max-w-md w-full px-4 flex items-center justify-center py-20">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 rounded-full border border-smartBorder flex items-center justify-center mx-auto animate-spin">
              <div className="h-2 w-2 rounded-full bg-signature" />
            </div>
            <p className="text-xs text-smartTextSecondary font-mono uppercase">Retrieving ticket...</p>
          </div>
        </main>
      </div>
    );
  }

  // Handle case where no pending reservation is found in sessionStorage
  if (!summary) {
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
        <Header />
        <main className="flex-1 mx-auto max-w-xl w-full px-4 flex flex-col items-center justify-center text-center pt-20">
          <div className="h-16 w-16 rounded-full bg-limited/10 border border-limited/30 flex items-center justify-center mb-6 text-limited">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-xl font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-2">
            No Active Reservation Session Found
          </h1>
          <p className="text-xs text-smartTextSecondary mb-8 max-w-sm">
            To view a parking pass, you must first reserve a slot. We could not find any active prototype checkouts in your current session.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/search" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full text-xs gap-1.5 h-10 px-6 justify-center">
                <Search className="h-4 w-4" />
                FIND PARKING PLAZAS
              </Button>
            </Link>
            <Link href="/bookings" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full text-xs gap-1.5 h-10 px-6 justify-center">
                <BookOpen className="h-4 w-4 text-signature" />
                MY BOOKINGS
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // End time calculator helper
  const startTimeNum = parseInt(summary.selection.startTime.split(':')[0]);
  const endTimeStr = `${(startTimeNum + summary.selection.duration).toString().padStart(2, '0')}:00`;

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 pt-4 space-y-6">
        
        {/* SUCCESS HEADER */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-available/10 border border-available/30 flex items-center justify-center text-available">
            <CheckCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              PARKING RESERVED
            </h1>
            <p className="text-xs text-smartTextSecondary">
              Your SmartPark parking pass is ready.
            </p>
          </div>
          <div className="inline-block">
            <span className="text-[10px] font-mono font-bold text-signature bg-signature/10 border border-signature/30 px-3 py-1 rounded-full">
              PROTOTYPE RESERVATION ACTIVE
            </span>
          </div>
        </div>

        {/* DIGITAL PARKING PASS */}
        <Card variant="elevated" className="border-signature/25 bg-gradient-to-b from-smartElevated to-smartSurface p-6 relative overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-signature/5 blur-3xl pointer-events-none rounded-full" />
          
          {/* Header Ticket Section */}
          <div className="flex justify-between items-start border-b border-smartBorder/45 pb-4">
            <div>
              <span className="text-[9px] font-mono text-smartTextSecondary block tracking-widest">SMARTPARK DIGITAL PASS</span>
              <h2 className="text-sm font-bold font-display text-white uppercase mt-1 truncate max-w-[200px]">
                {summary.facility.name}
              </h2>
              <span className="text-[10px] text-smartTextSecondary block mt-0.5">{summary.facility.address}</span>
            </div>
            
            <div className="text-right shrink-0">
              <span className="text-[8px] font-mono text-smartTextSecondary uppercase block">PROTOTYPE REFERENCE</span>
              <strong className="text-xs font-mono text-signature block">{summary.reference}</strong>
            </div>
          </div>

          {/* Body Pass Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* QR Pattern visual wrapper */}
            <div className="flex flex-col items-center justify-center bg-white p-3.5 rounded-smart border border-smartBorder shadow-inner w-36 h-36 mx-auto shrink-0 select-none">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full">
                {Array.from({ length: 25 }).map((_, idx) => {
                  const isFilled = (idx * 7 + 13) % 3 === 0 || idx === 0 || idx === 4 || idx === 20 || idx === 24;
                  return (
                    <div
                      key={idx}
                      className={`rounded-sm ${isFilled ? 'bg-smartBg' : 'bg-transparent'}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Ticket details list */}
            <div className="md:col-span-2 grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs font-sans">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Floor Level</span>
                <strong className="text-white flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-signature" />
                  {summary.floorLabel.split(' ')[0]}
                </strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Assigned Slot</span>
                <strong className="text-signature font-mono text-sm">
                  Slot {summary.selection.slotId.split('-').pop() || summary.selection.slotId}
                </strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Date Window</span>
                <strong className="text-white flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-signature" />
                  {summary.selection.date}
                </strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Time Frame</span>
                <strong className="text-white flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-signature" />
                  {summary.selection.startTime} - {endTimeStr}
                </strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Vehicle Profile</span>
                <strong className="text-white flex items-center gap-1 truncate">
                  <Car className="h-3.5 w-3.5 text-signature shrink-0" />
                  <span className="truncate">{summary.selection.vehicleId.startsWith('veh-1') ? 'Honda City' : 'Nexon EV'}</span>
                </strong>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Pricing Capped</span>
                <strong className="text-white font-mono">
                  ₹{summary.pricing.totalAmount} (Paid via sandbox)
                </strong>
              </div>
            </div>

          </div>
        </Card>

        {/* PARKING INSTRUCTIONS */}
        <Card variant="default" className="space-y-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/60 pb-2">
            BEFORE ARRIVAL
          </h3>

          <div className="space-y-3 text-xs font-sans text-smartTextSecondary">
            <div className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center text-[10px] font-mono text-signature font-bold shrink-0">
                1
              </span>
              <p className="leading-relaxed">
                Follow standard facility entry signage. The smart gates will verify your vehicle registration <strong className="text-white">{summary.selection.vehicleId.startsWith('veh-1') ? 'MH-01-DR-4829' : 'MH-01-EE-9021'}</strong> or scan your digital QR code.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center text-[10px] font-mono text-signature font-bold shrink-0">
                2
              </span>
              <p className="leading-relaxed">
                Drive onto <strong className="text-white">{summary.floorLabel.split(' ')[0]}</strong> and park only in <strong className="text-signature font-mono">Slot {summary.selection.slotId.split('-').pop() || summary.selection.slotId}</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center text-[10px] font-mono text-signature font-bold shrink-0">
                3
              </span>
              <p className="leading-relaxed">
                In case of incorrect sensors occupancy readings or barriers failure, use dynamic emergency call points or report the ticket issue on our Support portal.
              </p>
            </div>
          </div>
        </Card>

        {/* FACILITY STATS */}
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              FACILITY SUMMARY
            </h3>
            <Link href="/map">
              <Button variant="secondary" className="text-[10px] h-7 gap-1">
                <Map className="h-3 w-3 text-signature" />
                VIEW MAP
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1">
              <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Operating Hours</span>
              <span className="font-semibold text-white">24/7 Monitored Access Lanes</span>
            </div>
            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1">
              <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Distance Info</span>
              <span className="font-semibold text-white">{summary.facility.distanceKm} km ({summary.facility.walkingEta} min walk)</span>
            </div>
          </div>
        </Card>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-smartBorder">
          <Button
            variant="secondary"
            onClick={handleSavePass}
            className="w-full sm:w-1/3 text-xs h-10 justify-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            SAVE PASS
          </Button>

          <Link href="/bookings" className="w-full sm:w-1/3">
            <Button
              variant="primary"
              className="w-full text-xs h-10 justify-center gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              VIEW BOOKINGS
            </Button>
          </Link>

          <Link href="/search" className="w-full sm:w-1/3">
            <Button
              variant="secondary"
              className="w-full text-xs h-10 justify-center"
            >
              Back to Search
            </Button>
          </Link>
        </div>

      </main>

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
