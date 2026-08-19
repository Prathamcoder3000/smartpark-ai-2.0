'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Navigation,
  Star,
  Check,
  ChevronRight,
  TrendingUp,
  Map,
  Layers,
  Info,
  ExternalLink,
  Phone,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Award,
  Users
} from 'lucide-react';
import { Header } from '../../../components/ui/Header';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { Badge } from '../../../components/ui/Badge';
import { StatusBadge, ParkingStatusType } from '../../../components/ui/StatusBadge';
import { Tabs } from '../../../components/ui/Tabs';
import { Modal } from '../../../components/ui/Modal';
import { ParkingSlot, ParkingSlotState } from '../../../components/ui/ParkingSlot';
import { Toast } from '../../../components/ui/Toast';
import {
  getFacilityByIdOrSlug,
  getReviewSummaryForFacility,
  MOCK_FACILITY_DETAILS,
  FacilityFloor,
  FacilitySlot
} from '../../../lib/facilityData';

const mapIdToBackend = (idOrSlug: string): string => {
  const normalized = idOrSlug.toLowerCase();
  if (normalized === 'fac-01' || normalized === 'metro-central-garage' || normalized === 'facility-metro-central') {
    return 'facility-metro-central';
  }
  if (normalized === 'fac-02' || normalized === 'cyber-city-hub' || normalized === 'facility-cyber-city') {
    return 'facility-cyber-city';
  }
  if (normalized === 'fac-03' || normalized === 'techpark-parking' || normalized === 'facility-techpark') {
    return 'facility-techpark';
  }
  if (normalized === 'fac-04' || normalized === 'financial-plaza-deck' || normalized === 'facility-financial-plaza') {
    return 'facility-financial-plaza';
  }
  return idOrSlug;
};

const mapIdToFrontend = (backendId: string): string => {
  if (backendId === 'facility-metro-central') return 'fac-01';
  if (backendId === 'facility-cyber-city') return 'fac-02';
  if (backendId === 'facility-techpark') return 'fac-03';
  if (backendId === 'facility-financial-plaza') return 'fac-04';
  return backendId;
};

export default function FacilityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const facilityId = params?.id as string;

  const [facility, setFacility] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8001/api/facilities`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const matchedApi = json.data.find((f: any) => f.id === mapIdToBackend(facilityId) || mapIdToFrontend(f.id) === facilityId);
          if (matchedApi) {
            const template = MOCK_FACILITY_DETAILS.find((m) => mapIdToBackend(m.id) === matchedApi.id) || MOCK_FACILITY_DETAILS[0];
            
            const floors = template.floors.map(floorTemplate => {
              const apiFloor = matchedApi.floors?.find((fl: any) => fl.level === floorTemplate.id) || {};
              const slots = (apiFloor.slots || []).map((s: any) => ({
                id: s.id,
                state: s.status as ParkingSlotState,
                isEV: s.isEVCharging,
                isDisabled: s.status === 'DISABLED'
              }));
              
              const totalBays = slots.length;
              const availableBays = slots.filter((s: any) => s.state === 'AVAILABLE').length;
              const occupiedBays = slots.filter((s: any) => s.state === 'OCCUPIED').length;
              const reservedBays = slots.filter((s: any) => s.state === 'RESERVED').length;

              return {
                ...floorTemplate,
                slots: slots.length > 0 ? slots : floorTemplate.slots,
                totalBays: slots.length > 0 ? totalBays : floorTemplate.totalBays,
                availableBays: slots.length > 0 ? availableBays : floorTemplate.availableBays,
                occupiedBays: slots.length > 0 ? occupiedBays : floorTemplate.occupiedBays,
                reservedBays: slots.length > 0 ? reservedBays : floorTemplate.reservedBays
              };
            });

            setFacility({
              ...template,
              id: mapIdToFrontend(matchedApi.id),
              name: matchedApi.name,
              availableBays: matchedApi.availableSlots,
              totalBays: matchedApi.totalCapacity,
              occupiedBays: matchedApi.totalCapacity - matchedApi.availableSlots,
              occupancyPct: matchedApi.occupancyPercentage,
              status: matchedApi.availableSlots > 0 ? 'AVAILABLE' : 'LIMITED',
              floors
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    let eventSource: EventSource | null = null;
    try {
      const backendId = mapIdToBackend(facilityId);
      eventSource = new EventSource(`http://localhost:8001/api/realtime/facilities/${backendId}`);
      eventSource.onmessage = () => {
        load();
      };
    } catch (e) {
      console.warn('Realtime updates offline');
    }

    return () => {
      eventSource?.close();
    };
  }, [facilityId]);

  const reviewsSummary = React.useMemo(() => {
    return facility ? getReviewSummaryForFacility(facility.slug) : null;
  }, [facility]);

  // Selected Floor state
  const [activeFloorTab, setActiveFloorTab] = React.useState<string>('');

  // Set default floor tab when facility loads
  React.useEffect(() => {
    if (facility && facility.floors.length > 0) {
      setActiveFloorTab(facility.floors[0].id);
    }
  }, [facility]);

  // Selected Floor object
  const activeFloor = React.useMemo(() => {
    if (!facility) return null;
    return facility.floors.find((f: any) => f.id === activeFloorTab) || facility.floors[0];
  }, [facility, activeFloorTab]);

  // Slot Click state
  const [selectedSlot, setSelectedSlot] = React.useState<FacilitySlot | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  if (!facility) {
    // --------------------------------------------------
    // POLISHED NOT-FOUND STATE
    // --------------------------------------------------
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
        <Header />
        <main className="flex-1 mx-auto max-w-xl w-full px-4 flex flex-col items-center justify-center text-center pt-20">
          <div className="h-16 w-16 rounded-full bg-limited/10 border border-limited/30 flex items-center justify-center mb-6 text-limited animate-pulse">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-2">
            Facility Not Found
          </h1>
          <p className="text-sm text-smartTextSecondary mb-8 max-w-sm">
            The parking facility identifier <code className="text-signature bg-smartSurface px-1.5 py-0.5 rounded font-mono">"{facilityId}"</code> does not match any smart node in our system.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/search" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full text-xs gap-2">
                Back to Search
              </Button>
            </Link>
            <Link href="/map" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full text-xs gap-2">
                View Parking Map
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Related Facilities logic (exclude current, take next 2-3)
  const relatedFacilities = MOCK_FACILITY_DETAILS.filter((f) => f.id !== facility.id).slice(0, 3);

  // Status config
  const statusColors: Record<ParkingStatusType, string> = {
    AVAILABLE: 'text-available bg-available/10 border-available/30',
    LIMITED: 'text-limited bg-limited/10 border-limited/30',
    OCCUPIED: 'text-occupied bg-occupied/10 border-occupied/30',
    CLOSED: 'text-smartTextSecondary bg-smartSurface border-smartBorder',
    RESERVED: 'text-aiBlue bg-aiBlue/10 border-aiBlue/30'
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        
        {/* BREADCRUMB + Header */}
        <div className="flex flex-col gap-2 pb-4 border-b border-smartBorder/60">
          <nav className="text-[10px] font-mono uppercase tracking-wider text-smartTextSecondary flex items-center gap-1.5">
            <Link href="/search" className="hover:text-signature transition-colors">Search</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-smartTextPrimary">Facility Details</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-smartTextSecondary tracking-widest block uppercase mb-1">
                FACILITY DETAILS
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                {facility.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="text-[10px] font-mono text-smartTextSecondary text-right hidden sm:block">
                {facility.updatedAt}
              </div>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded border uppercase tracking-wider ${statusColors[facility.status as ParkingStatusType]}`}>
                {facility.status}
              </span>
            </div>
          </div>
        </div>

        {/* HERO CARD */}
        <Card variant="elevated" padding="lg" className="border-signature/25 bg-gradient-to-br from-smartElevated via-smartSurface to-signature/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-signature/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Info details */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="signature" className="text-[9px] uppercase tracking-wider font-bold">
                    {facility.zone}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-mono font-semibold text-smartTextPrimary">
                    <Star className="h-3.5 w-3.5 text-signature fill-signature" />
                    <span>{facility.rating}</span>
                    <span className="text-smartTextSecondary">({facility.reviewCount} reviews)</span>
                  </div>
                </div>
                <h2 className="text-base sm:text-lg font-bold font-display text-smartTextPrimary">
                  {facility.name}
                </h2>
                <p className="text-xs text-smartTextSecondary flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-signature shrink-0" />
                  <span>{facility.address}</span>
                </p>
              </div>

              <p className="text-xs text-smartTextSecondary leading-relaxed">
                {facility.description}
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {facility.hasEv && (
                  <Badge variant="signature" className="text-[9px] flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    EV CHARGING LANE ({facility.evBays} BAYS)
                  </Badge>
                )}
                {facility.isCovered && <Badge variant="default" className="text-[9px]">COVERED DECK</Badge>}
                {facility.hasSecurity && <Badge variant="outline" className="text-[9px]">24/7 PATROLLED</Badge>}
                {facility.isOpen24x7 && <Badge variant="outline" className="text-[9px]">24/7 OPEN</Badge>}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col justify-between p-4 bg-smartBg/60 border border-smartBorder/80 rounded-smart space-y-4 md:text-right">
              <div>
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase mb-1">
                  CURRENT RATE
                </span>
                <div className="text-2xl font-bold font-mono text-signature">
                  ₹{facility.hourlyRate}/hr
                </div>
                <div className="text-[10px] font-mono text-smartTextSecondary">
                  Daily Cap: ₹{facility.dailyRate} • {facility.distanceKm} km ({facility.walkingEta} min walk)
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/reserve?facility=${facility.slug}`} className="w-full">
                  <Button
                    variant="primary"
                    className="w-full text-xs h-9 justify-center gap-1"
                  >
                    RESERVE PARKING
                  </Button>
                </Link>
                <Link href="/map" className="w-full">
                  <Button variant="secondary" className="w-full text-xs h-9 justify-center gap-1.5">
                    <Map className="h-3.5 w-3.5 text-signature" />
                    VIEW ON MAP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* METRICS & VISUALIZATION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CURRENT AVAILABILITY CARD */}
          <Card variant="default" className="md:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                CURRENT AVAILABILITY
              </h3>
              <span className="text-[10px] font-mono text-smartTextSecondary uppercase">
                sensor telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Circular Occupancy Meter */}
              <div className="flex justify-center relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    strokeWidth="10"
                    stroke="#181D21"
                    fill="transparent"
                  />
                  {/* Colored Progress */}
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    strokeWidth="10"
                    stroke={facility.status === 'AVAILABLE' ? '#10B981' : facility.status === 'LIMITED' ? '#F59E0B' : '#EF4444'}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - facility.occupancyPct / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-smartTextPrimary">
                    {facility.occupancyPct}%
                  </span>
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary">
                    OCCUPIED
                  </span>
                </div>
              </div>

              {/* Visual Numeric Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-smartSurface/50 border border-smartBorder/45 rounded-smart">
                  <span className="text-[9px] text-smartTextSecondary block uppercase">Total Capacity</span>
                  <span className="font-bold text-smartTextPrimary text-sm">{facility.totalBays} bays</span>
                </div>
                <div className="p-3 bg-available/10 border border-available/20 rounded-smart">
                  <span className="text-[9px] text-available block uppercase">Available</span>
                  <span className="font-bold text-available text-sm">{facility.availableBays} open</span>
                </div>
                <div className="p-3 bg-smartSurface/50 border border-smartBorder/45 rounded-smart">
                  <span className="text-[9px] text-smartTextSecondary block uppercase">Occupied</span>
                  <span className="font-bold text-smartTextPrimary text-sm">{facility.occupiedBays} active</span>
                </div>
                <div className="p-3 bg-aiBlue/10 border border-aiBlue/20 rounded-smart">
                  <span className="text-[9px] text-aiBlue block uppercase">Reserved</span>
                  <span className="font-bold text-aiBlue text-sm">{facility.reservedBays} upcoming</span>
                </div>
              </div>
            </div>
          </Card>

          {/* SMARTPARK RECOMMENDS AI CARD */}
          <Card variant="elevated" className="border-aiBlue/30 bg-smartSurface/50 space-y-4">
            <div className="flex items-center justify-between border-b border-smartBorder pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold font-display uppercase tracking-wider text-aiBlue">
                <Sparkles className="h-4 w-4" />
                SMARTPARK RECOMMENDS
              </div>
              <span className="text-[10px] font-mono text-signature font-bold">
                {facility.recommendation.score}/100
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs">
                <div className="text-[9px] font-mono uppercase text-smartTextSecondary">AI Predictor</div>
                <div className="text-smartTextPrimary font-sans">
                  {facility.recommendation.predictedAvailability}
                </div>
                <div className="text-[10px] font-mono text-smartTextSecondary">
                  Arrival occupancy expectation: <span className="text-smartTextPrimary font-bold">{facility.recommendation.expectedOccupancyAtArrival}%</span>
                </div>
              </div>

              {/* Reason list */}
              <div className="space-y-2 pt-2 border-t border-smartBorder/45">
                {facility.recommendation.reasons.map((reason: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-sans text-smartTextPrimary">
                    <Check className="h-3.5 w-3.5 text-signature shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] font-mono text-smartTextSecondary/60 bg-smartBg p-2 rounded border border-smartBorder/40">
                Confidence rating: {facility.recommendation.confidence} · Historical analysis feeds model 3.2.0
              </div>
            </div>
          </Card>

        </div>

        {/* OUTLOOK + INTELLIGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AVAILABILITY OUTLOOK */}
          <Card variant="default" className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                AVAILABILITY OUTLOOK
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                Predicted versus observed occupancy counts
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {facility.forecast.map((fc: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded border transition-colors ${
                    fc.isObserved
                      ? 'bg-smartSurface/70 border-signature/30'
                      : 'bg-smartBg/40 border-smartBorder/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${fc.status === 'AVAILABLE' ? 'bg-available animate-pulse' : fc.status === 'LIMITED' ? 'bg-limited' : 'bg-occupied'}`} />
                    <span className="font-bold">{fc.timeOffset}</span>
                    {fc.isObserved && (
                      <span className="text-[8px] bg-signature/10 border border-signature/30 text-signature px-1.5 py-0.5 rounded font-mono">
                        OBSERVED
                      </span>
                    )}
                    {!fc.isObserved && (
                      <span className="text-[8px] bg-aiBlue/10 border border-aiBlue/30 text-aiBlue px-1.5 py-0.5 rounded font-mono">
                        PREDICTED
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-smartTextPrimary font-bold">{fc.expectedAvailableBays} bays open</span>
                    <span className="text-smartTextSecondary text-[10px] ml-2">({fc.expectedOccupancy}% occ)</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FACILITY INTELLIGENCE */}
          <Card variant="default" className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                FACILITY INTELLIGENCE
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                Advanced data telemetry patterns for optimized parking
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-smartBg/60 p-3 rounded border border-smartBorder/50 space-y-1">
                <span className="text-[9px] text-smartTextSecondary block uppercase">CURRENT DEMAND</span>
                <span className="font-bold text-smartTextPrimary text-sm">{facility.demandCurrent}%</span>
              </div>
              <div className="bg-smartBg/60 p-3 rounded border border-smartBorder/50 space-y-1">
                <span className="text-[9px] text-smartTextSecondary block uppercase">PREDICTED DEMAND</span>
                <span className="font-bold text-smartTextPrimary text-sm">{facility.demandPredicted}%</span>
              </div>
              <div className="bg-smartBg/60 p-3 rounded border border-smartBorder/50 space-y-1">
                <span className="text-[9px] text-smartTextSecondary block uppercase">CONFIDENCE</span>
                <span className="font-bold text-aiBlue text-sm">{facility.forecastConfidence}</span>
              </div>
              <div className="bg-smartBg/60 p-3 rounded border border-smartBorder/50 space-y-1">
                <span className="text-[9px] text-smartTextSecondary block uppercase">PEAK WINDOW</span>
                <span className="font-bold text-limited text-sm">{facility.peakWindow}</span>
              </div>
            </div>

            <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart flex items-center gap-3 text-xs">
              <TrendingUp className="h-5 w-5 text-signature shrink-0" />
              <div>
                <span className="font-semibold text-smartTextPrimary block">
                  Trend: {facility.availabilityTrend}
                </span>
                <span className="text-[10px] text-smartTextSecondary">
                  {facility.searchTimeImpact}
                </span>
              </div>
            </div>
          </Card>

        </div>

        {/* FLOOR PLAN OVERVIEW */}
        <Card variant="default" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/60 pb-3">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                PARKING FLOORS
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                Select a floor to view real-time layout & slots
              </p>
            </div>

            {/* Floor switcher */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap">
              {facility.floors.map((fl: any) => (
                <button
                  key={fl.id}
                  type="button"
                  onClick={() => setActiveFloorTab(fl.id)}
                  className={`text-xs px-3.5 py-1.5 rounded font-mono font-bold uppercase transition-all shrink-0 border ${
                    activeFloorTab === fl.id
                      ? 'bg-signature border-signature text-smartBg'
                      : 'bg-smartSurface border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                  }`}
                >
                  {fl.id}
                </button>
              ))}
            </div>
          </div>

          {activeFloor && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-smartSurface/50 border border-smartBorder/45 p-3 rounded-smart">
                <div>
                  <h4 className="text-xs font-bold text-smartTextPrimary">
                    {activeFloor.label}
                  </h4>
                  <p className="text-[10px] text-smartTextSecondary">
                    {activeFloor.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-smartTextSecondary mr-1">Total:</span>
                    <strong className="text-smartTextPrimary">{activeFloor.totalBays}</strong>
                  </div>
                  <div>
                    <span className="text-available mr-1">Available:</span>
                    <strong className="text-available">{activeFloor.availableBays}</strong>
                  </div>
                  <div>
                    <span className="text-smartTextSecondary mr-1">Reserved:</span>
                    <strong className="text-aiBlue">{activeFloor.reservedBays}</strong>
                  </div>
                </div>
              </div>

              {/* Slot Representative Grid */}
              <div className="flex flex-wrap gap-3 justify-center py-4 bg-smartBg/60 border border-dashed border-smartBorder/70 rounded-smart">
                {activeFloor.slots.map((slot: any) => (
                  <div key={slot.id} className="relative group">
                    <ParkingSlot
                      id={slot.id.split('-').pop() || slot.id}
                      state={slot.state}
                      onClick={() => setSelectedSlot(slot)}
                    />
                    {slot.isEV && (
                      <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-signature/20 border border-signature/60 flex items-center justify-center pointer-events-none">
                        <Zap className="h-2 w-2 text-signature" />
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-mono text-smartTextSecondary text-center">
                Click an available or reserved bay to view details and reservation state.
              </div>
            </div>
          )}
        </Card>

        {/* FEATURES & RATES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FEATURES / AMENITIES */}
          <Card variant="default" className="space-y-4">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              FACILITY FEATURES
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {facility.amenities.map((amenity: any, idx: number) => (
                <div key={idx} className="p-3 bg-smartSurface/50 border border-smartBorder/45 rounded-smart flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center text-signature shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-smartTextPrimary block">{amenity.name}</span>
                    {amenity.description && (
                      <span className="text-[10px] text-smartTextSecondary">{amenity.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* PARKING RATES */}
          <Card variant="default" className="space-y-4">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                PARKING RATES
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                All pricing is indicative of prototype testing parameters
              </p>
            </div>

            <div className="divide-y divide-smartBorder/45">
              {facility.rates.map((rate: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-sans">
                  <div>
                    <span className="font-semibold text-smartTextPrimary block">{rate.name}</span>
                    {rate.description && (
                      <span className="text-[10px] text-smartTextSecondary">{rate.description}</span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-signature shrink-0">
                    {rate.priceFormatted}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* ACCESS & LOCATION */}
        <Card variant="default" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                ACCESS & LOCATION
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                Directions, operational restrictions, and gate access info
              </p>
            </div>

            <Link href="/map">
              <Button variant="secondary" className="text-xs gap-1.5 h-8">
                <Map className="h-3.5 w-3.5 text-signature" />
                VIEW MAP DIRECTORY
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">OPERATING HOURS</div>
              <p className="font-semibold text-smartTextPrimary">
                {facility.isOpen24x7 ? '24 hours / 7 Days Open' : '06:00 AM - 11:30 PM Daily'}
              </p>
            </div>

            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">ENTRY REQUIREMENTS</div>
              <p className="font-semibold text-smartTextPrimary">
                RFID Scanning / LPR Camera Barrier Access
              </p>
            </div>

            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">ETA INFO</div>
              <p className="font-semibold text-smartTextPrimary text-xs">
                {facility.distanceKm} km distance · ~{facility.walkingEta} mins walk time
              </p>
            </div>
          </div>
        </Card>

        {/* READY TO PARK? BOTTOM CTA */}
        <Card variant="elevated" className="border-signature/40 bg-gradient-to-r from-smartElevated to-signature/10 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold font-display text-smartTextPrimary uppercase tracking-wider">
                READY TO PARK?
              </h3>
              <p className="text-xs text-smartTextSecondary">
                Reserve a bay at <strong className="text-smartTextPrimary">{facility.name}</strong> before occupancy peaks.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono pt-1 text-smartTextSecondary">
                <div>
                  Available: <strong className="text-available">{facility.availableBays} bays</strong>
                </div>
                <div>
                  Current Rate: <strong className="text-signature">₹{facility.hourlyRate}/hr</strong>
                </div>
                <div>
                  Forecast: <strong className="text-smartTextPrimary">{facility.recommendation.predictedAvailability}</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/reserve?facility=${facility.slug}`}>
                <Button
                  variant="primary"
                  className="text-xs h-10 px-6 justify-center gap-1.5"
                >
                  RESERVE PARKING
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="secondary" className="text-xs h-10 px-6 justify-center gap-1.5">
                  <Map className="h-3.5 w-3.5 text-signature" />
                  VIEW ON MAP
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* OTHER NEARBY OPTIONS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
            OTHER NEARBY OPTIONS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedFacilities.map((near: any) => (
              <Card
                key={near.id}
                variant="default"
                padding="md"
                className="hover:border-smartBorder/90 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold font-display text-smartTextPrimary uppercase truncate">
                      {near.name}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-smartBg border border-smartBorder/80">
                      {near.distanceKm} km
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <Star className="h-3.5 w-3.5 text-signature fill-signature" />
                    <span className="font-bold">{near.rating}</span>
                    <span className="text-[10px] text-available font-bold">{near.availableBays} Open</span>
                  </div>

                  <p className="text-[11px] text-smartTextSecondary line-clamp-2">
                    {near.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {near.hasEv && <Badge variant="signature" className="text-[8px] px-1 py-0">EV READY</Badge>}
                    {near.isCovered && <Badge variant="default" className="text-[8px] px-1 py-0">COVERED</Badge>}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-smartBorder/45">
                  <Link href={`/facility/${near.slug}`} className="w-1/2">
                    <Button variant="secondary" className="w-full text-[10px] h-7 px-1 justify-center">
                      VIEW DETAILS
                    </Button>
                  </Link>
                  <Link href="/map" className="w-1/2">
                    <Button variant="primary" className="w-full text-[10px] h-7 px-1 justify-center">
                      VIEW PARKING
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* TRUST SUMMARY / REVIEWS */}
        {reviewsSummary && (
          <Card variant="default" className="space-y-6">
            <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                  DRIVER FEEDBACK
                </h3>
                <p className="text-[10px] text-smartTextSecondary">
                  Verified reviews and ratings distribution
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-smartTextPrimary">{reviewsSummary.rating} / 5</div>
                  <div className="text-[10px] text-smartTextSecondary">{reviewsSummary.reviewCount} driver ratings</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-signature/10 border border-signature/30 flex items-center justify-center text-signature font-bold">
                  {reviewsSummary.rating}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Distribution */}
              <div className="space-y-2 text-xs font-mono">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsSummary.distribution[stars as 5 | 4 | 3 | 2 | 1];
                  const pct = reviewsSummary.reviewCount ? (count / reviewsSummary.reviewCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3 text-right">{stars}★</span>
                      <div className="flex-1 h-2 bg-smartBg border border-smartBorder/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-signature"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[10px] text-smartTextSecondary">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-4">
                {reviewsSummary.reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-smartBg/60 border border-smartBorder/50 rounded-smart space-y-2">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <div className="flex items-center gap-2">
                        <strong className="text-smartTextPrimary">{rev.author}</strong>
                        <span className="text-[10px] text-smartTextSecondary">{rev.timeAgo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-signature font-bold font-mono">
                        {Array.from({ length: rev.rating }).map((_, idx) => (
                          <Star key={idx} className="h-3 w-3 fill-signature stroke-signature" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-smartTextSecondary leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </Card>
        )}

      </main>

      {/* SLOT CLICK DETAIL MODAL */}
      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title={`Parking Slot ${selectedSlot.id.split('-').pop() || selectedSlot.id}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-sans text-smartTextSecondary">
            <div className="flex items-center justify-between border-b border-smartBorder/45 pb-3">
              <div>
                <span className="text-[10px] font-mono block">FLOOR LEVEL</span>
                <strong className="text-sm text-smartTextPrimary">{activeFloor?.label}</strong>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                selectedSlot.state === 'AVAILABLE' ? 'text-available bg-available/10 border-available/30' :
                selectedSlot.state === 'RESERVED' ? 'text-aiBlue bg-aiBlue/10 border-aiBlue/30' :
                'text-limited bg-limited/10 border-limited/30'
              }`}>
                {selectedSlot.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart space-y-1">
                <span className="text-[9px] font-mono block text-smartTextSecondary">INFRASTRUCTURE</span>
                <span className="font-semibold text-smartTextPrimary">
                  {selectedSlot.isEV ? 'EV Fast Charger Ready' : 'Standard Parking Bay'}
                </span>
              </div>

              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart space-y-1">
                <span className="text-[9px] font-mono block text-smartTextSecondary">ACCESSIBILITY</span>
                <span className="font-semibold text-smartTextPrimary">
                  {selectedSlot.isDisabled ? 'Designated Accessible Space' : 'General Access'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-smartBg border border-smartBorder rounded-smart space-y-1.5">
              <span className="font-semibold text-smartTextPrimary block">Reservation Status</span>
              {selectedSlot.state === 'AVAILABLE' ? (
                <p>This slot is currently open and can be reserved instantly for your arrival.</p>
              ) : selectedSlot.state === 'RESERVED' ? (
                <p>This slot is reserved for an incoming driver with a digital parking permit.</p>
              ) : (
                <p>This slot is currently limited or occupied by another active vehicle.</p>
              )}
            </div>

            <div className="pt-4 border-t border-smartBorder flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedSlot(null)}
              >
                Close Details
              </Button>
              {selectedSlot.state === 'AVAILABLE' && (
                <Link href={`/reserve?facility=${facility.slug}&slot=${selectedSlot.id}&floor=${activeFloor?.id}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Reserve Slot
                  </Button>
                </Link>
              )}
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
