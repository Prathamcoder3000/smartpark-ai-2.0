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
import { BASE_URL } from '../../../lib/api';

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

  // Selected Floor state
  const [activeFloorTab, setActiveFloorTab] = React.useState<string>('');

  // Slot Click state
  const [selectedSlot, setSelectedSlot] = React.useState<any | null>(null);

  // Toast notifications
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const backendId = mapIdToBackend(facilityId);
      
      const [facRes, floorsRes, slotsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/facilities/${backendId}`),
        fetch(`${BASE_URL}/api/facilities/${backendId}/floors`),
        fetch(`${BASE_URL}/api/facilities/${backendId}/slots`)
      ]);

      const facJson = await facRes.json();
      const floorsJson = await floorsRes.json();
      const slotsJson = await slotsRes.json();

      if (facJson.success && floorsJson.success && slotsJson.success) {
        const matchedApi = facJson.data.facility;
        const template = MOCK_FACILITY_DETAILS.find((m) => mapIdToBackend(m.id) === matchedApi.id) || MOCK_FACILITY_DETAILS[0];
        
        const floors = floorsJson.data.map((fl: any, idx: number) => {
          const floorTemplate = template.floors.find(ft => ft.id === fl.name || ft.id === String(fl.level)) || template.floors[idx] || template.floors[0];
          
          const floorSlots = slotsJson.data.filter((s: any) => s.floorId === fl.id);
          const slots = floorSlots.map((s: any) => ({
            id: s.id,
            slotNumber: s.slotNumber,
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
            id: floorTemplate.id,
            dbFloorId: fl.id,
            name: fl.name,
            totalBays: totalBays > 0 ? totalBays : floorTemplate.totalBays,
            availableBays: totalBays > 0 ? availableBays : floorTemplate.availableBays,
            occupiedBays: totalBays > 0 ? occupiedBays : floorTemplate.occupiedBays,
            reservedBays: totalBays > 0 ? reservedBays : floorTemplate.reservedBays,
            slots: slots.length > 0 ? slots : floorTemplate.slots
          };
        });

        const currentFacilityDetails = {
          ...template,
          id: mapIdToFrontend(matchedApi.id),
          name: matchedApi.name,
          address: matchedApi.address,
          availableBays: facJson.data.availabilitySummary.available,
          totalBays: facJson.data.capacitySummary.totalCapacity,
          occupiedBays: facJson.data.availabilitySummary.occupied,
          occupancyPct: facJson.data.capacitySummary.occupancyPercentage,
          status: facJson.data.availabilitySummary.available > 0 ? 'AVAILABLE' : 'LIMITED',
          floors
        };

        setFacility(currentFacilityDetails);
        
        // Set default floor active tab if not set
        if (!activeFloorTab && floors.length > 0) {
          setActiveFloorTab(floors[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load facility data:', err);
      // Graceful fallback to mock details in case of backend server issues
      const template = MOCK_FACILITY_DETAILS.find((m) => mapIdToBackend(m.id) === mapIdToBackend(facilityId)) || MOCK_FACILITY_DETAILS[0];
      setFacility(template);
      if (!activeFloorTab && template.floors.length > 0) {
        setActiveFloorTab(template.floors[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();

    // Ingest Server Sent Events for real time status pushes
    let eventSource: EventSource | null = null;
    try {
      const backendId = mapIdToBackend(facilityId);
      eventSource = new EventSource(`${BASE_URL}/api/realtime/facilities/${backendId}`);
      eventSource.onmessage = () => {
        loadData(true);
      };
    } catch (e) {
      console.warn('Realtime updates gateway offline');
    }

    return () => {
      eventSource?.close();
    };
  }, [facilityId]);

  const reviewsSummary = React.useMemo(() => {
    return facility ? getReviewSummaryForFacility(facility.slug) : null;
  }, [facility]);

  // Selected Floor object
  const activeFloor = React.useMemo(() => {
    if (!facility) return null;
    return facility.floors.find((f: any) => f.id === activeFloorTab) || facility.floors[0];
  }, [facility, activeFloorTab]);

  // Split slots into Aisle A and Aisle B for roadway structure simulation
  const aisleSlots = React.useMemo(() => {
    if (!activeFloor || !activeFloor.slots) return { rowA: [], rowB: [] };
    const midway = Math.ceil(activeFloor.slots.length / 2);
    return {
      rowA: activeFloor.slots.slice(0, midway),
      rowB: activeFloor.slots.slice(midway)
    };
  }, [activeFloor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
        <Header />
        <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <div className="h-10 bg-smartSurface animate-pulse border border-smartBorder rounded-smart w-48" />
          <div className="h-44 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-72 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
            <div className="h-72 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
          </div>
        </main>
      </div>
    );
  }

  if (!facility) {
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

  const relatedFacilities = MOCK_FACILITY_DETAILS.filter((f) => f.id !== facility.id).slice(0, 3);

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

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6 text-left">
        
        {/* Breadcrumb + Header */}
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
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded border uppercase tracking-wider ${statusColors[facility.status as ParkingStatusType]}`}>
                {facility.status}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <Card variant="elevated" padding="lg" className="border-signature/25 bg-gradient-to-br from-smartElevated via-smartSurface to-signature/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-signature/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
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

              <div className="flex flex-wrap gap-1.5 pt-1">
                {facility.hasEv && (
                  <Badge variant="signature" className="text-[9px] flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    EV READY ({facility.evBays} BAYS)
                  </Badge>
                )}
                {facility.isCovered && <Badge variant="default" className="text-[9px]">COVERED DECK</Badge>}
                {facility.hasSecurity && <Badge variant="outline" className="text-[9px]">24/7 PATROLLED</Badge>}
                {facility.isOpen24x7 && <Badge variant="outline" className="text-[9px]">24/7 OPEN</Badge>}
              </div>
            </div>

            <div className="flex flex-col justify-between p-4 bg-smartBg/60 border border-smartBorder/80 rounded-smart space-y-4 md:text-right">
              <div>
                <span className="text-[9px] font-mono text-smartTextSecondary block uppercase mb-1">
                  CURRENT RATE
                </span>
                <div className="text-2xl font-bold font-mono text-signature">
                  ₹{facility.hourlyRate}/hr
                </div>
                <div className="text-[10px] font-mono text-smartTextSecondary">
                  Daily Cap: ₹{facility.dailyRate} • {facility.distanceKm} km (~{facility.walkingEta} min walk)
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link href={`/reserve?facility=${facility.slug}`} className="w-full">
                  <Button variant="primary" className="w-full text-xs h-9 justify-center uppercase font-mono tracking-wider">
                    Reserve Parking
                  </Button>
                </Link>
                <Link href="/map" className="w-full">
                  <Button variant="secondary" className="w-full text-xs h-9 justify-center gap-1.5 uppercase font-mono tracking-wider">
                    <Map className="h-3.5 w-3.5 text-signature" />
                    View Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default" className="md:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                LIVE OVERVIEW
              </h3>
              <span className="text-[10px] font-mono text-smartTextSecondary uppercase">
                Sensor feeds synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="flex justify-center relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="60" strokeWidth="10" stroke="#181D21" fill="transparent" />
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-smartTextPrimary">{facility.occupancyPct}%</span>
                  <span className="text-[9px] font-mono uppercase text-smartTextSecondary">OCCUPIED</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 bg-smartSurface/50 border border-smartBorder/45 rounded-smart">
                  <span className="text-[9px] text-smartTextSecondary block uppercase">Total Bays</span>
                  <span className="font-bold text-smartTextPrimary text-sm">{facility.totalBays}</span>
                </div>
                <div className="p-3 bg-available/10 border border-available/20 rounded-smart">
                  <span className="text-[9px] text-available block uppercase">Available</span>
                  <span className="font-bold text-available text-sm">{facility.availableBays} open</span>
                </div>
                <div className="p-3 bg-smartSurface/50 border border-smartBorder/45 rounded-smart">
                  <span className="text-[9px] text-smartTextSecondary block uppercase">Occupied</span>
                  <span className="font-bold text-smartTextPrimary text-sm">{facility.occupiedBays}</span>
                </div>
                <div className="p-3 bg-aiBlue/10 border border-aiBlue/20 rounded-smart">
                  <span className="text-[9px] text-aiBlue block uppercase">Reserved</span>
                  <span className="font-bold text-aiBlue text-sm">{facility.reservedBays}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" className="border-aiBlue/30 bg-smartSurface/50 space-y-4">
            <div className="flex items-center justify-between border-b border-smartBorder pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold font-display uppercase tracking-wider text-aiBlue">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI PREDICTIONS
              </div>
              <span className="text-[10px] font-mono text-signature font-bold">
                {facility.recommendation.score}/100
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs">
                <div className="text-[9px] font-mono uppercase text-smartTextSecondary">Occupancy Prediction</div>
                <div className="text-smartTextPrimary font-sans font-medium mt-0.5">
                  {facility.recommendation.predictedAvailability}
                </div>
                <div className="text-[10px] font-mono text-smartTextSecondary mt-1">
                  Expected Occupancy on Arrival: <span className="text-smartTextPrimary font-bold">{facility.recommendation.expectedOccupancyAtArrival}%</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-smartBorder/45">
                {facility.recommendation.reasons.map((reason: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-sans text-smartTextPrimary">
                    <Check className="h-3.5 w-3.5 text-signature shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Floor Visualizer Grid */}
        <Card variant="default" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/60 pb-3">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                FLOOR LEVEL LAYOUTS
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                Select a floor deck level to inspect slots
              </p>
            </div>

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
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-smartSurface/50 border border-smartBorder/45 p-3 rounded-smart">
                <div>
                  <h4 className="text-xs font-bold text-white">{activeFloor.label}</h4>
                  <p className="text-[10px] text-smartTextSecondary mt-0.5">{activeFloor.description}</p>
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
                    <span className="text-aiBlue mr-1">Reserved:</span>
                    <strong className="text-aiBlue">{activeFloor.reservedBays}</strong>
                  </div>
                </div>
              </div>

              {/* Layout Legend */}
              <div className="flex flex-wrap gap-4 items-center justify-center p-3 bg-smartBg/40 border border-smartBorder/40 rounded-smart text-[10px] font-mono text-smartTextSecondary">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-4 border-x border-dashed border-available/50 bg-smartBg rounded" />
                  <span>Available Bay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-4 border-x border-dashed border-available/50 bg-smartBg rounded flex items-center justify-center">
                    <Zap className="h-2 w-2 text-signature" />
                  </span>
                  <span>EV Charge Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-4 border-x border-dashed border-aiBlue/50 bg-aiBlue/10 rounded" />
                  <span>Reserved Space</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-4 border-x border-dashed border-smartBorder/30 bg-smartSurface/40 rounded" />
                  <span>Occupied Bay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-4 border-x border-dashed border-limited/40 bg-smartBg rounded" />
                  <span>Disabled Spot</span>
                </div>
              </div>

              {/* 2D structured aisle-driveway layout representation */}
              <div className="py-6 px-4 bg-smartBg/80 border border-smartBorder rounded-smart space-y-6 relative overflow-x-auto min-w-full">
                
                {/* Aisle A row of bays */}
                <div className="flex justify-center gap-3 md:gap-4 flex-nowrap min-w-max pb-2 border-b border-smartBorder/30">
                  {aisleSlots.rowA.map((slot: any) => (
                    <div key={slot.id} className="relative">
                      <ParkingSlot
                        id={slot.slotNumber}
                        state={slot.state}
                        onClick={() => setSelectedSlot(slot)}
                      />
                      {slot.isEV && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-signature/10 border border-signature/40 flex items-center justify-center pointer-events-none">
                          <Zap className="h-2.5 w-2.5 text-signature" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Central roadway separator */}
                <div className="py-3 bg-smartSurface/40 rounded border border-smartBorder/50 flex items-center justify-between px-6 font-mono text-[9px] tracking-widest text-smartTextSecondary/60 min-w-max select-none">
                  <span>◄ DRIVEWAY LANE (Aisle A)</span>
                  <div className="border-t border-dashed border-smartTextSecondary/30 flex-1 mx-6" />
                  <span>DO NOT PARK</span>
                  <div className="border-t border-dashed border-smartTextSecondary/30 flex-1 mx-6" />
                  <span>DRIVEWAY LANE (Aisle B) ►</span>
                </div>

                {/* Aisle B row of bays */}
                <div className="flex justify-center gap-3 md:gap-4 flex-nowrap min-w-max pt-2 border-t border-smartBorder/30">
                  {aisleSlots.rowB.map((slot: any) => (
                    <div key={slot.id} className="relative">
                      <ParkingSlot
                        id={slot.slotNumber}
                        state={slot.state}
                        onClick={() => setSelectedSlot(slot)}
                      />
                      {slot.isEV && (
                        <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-signature/10 border border-signature/40 flex items-center justify-center pointer-events-none">
                          <Zap className="h-2.5 w-2.5 text-signature" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>

              </div>

              <p className="text-[10px] font-mono text-smartTextSecondary text-center">
                Click any available space to select it and start reservation.
              </p>
            </div>
          )}
        </Card>

        {/* Access and Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="default" className="space-y-4">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              FACILITY AMENITIES
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

          <Card variant="default" className="space-y-4">
            <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              TARIFF RATES
            </h3>
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

        {/* Operating Rules */}
        <Card variant="default" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary mb-1">
                ACCESS RULES
              </h3>
              <p className="text-[10px] text-smartTextSecondary">
                RFID Scanning barrier guidelines and hours
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1 font-sans">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">OPERATING HOURS</div>
              <p className="font-semibold text-smartTextPrimary">
                {facility.isOpen24x7 ? '24 Hours / 7 Days' : '06:00 AM - 11:30 PM'}
              </p>
            </div>

            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1 font-sans">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">GATE CONTROL</div>
              <p className="font-semibold text-smartTextPrimary font-sans">
                License Plate Scan Recognition Barrier
              </p>
            </div>

            <div className="bg-smartBg/60 p-3.5 rounded border border-smartBorder/50 space-y-1 font-sans">
              <div className="font-mono text-smartTextSecondary text-[9px] uppercase">WALK DISTANCE</div>
              <p className="font-semibold text-smartTextPrimary">
                {facility.distanceKm} km (~{facility.walkingEta} min walk)
              </p>
            </div>
          </div>
        </Card>

      </main>

      {/* Selected Slot Details Modal */}
      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title={`Parking Space ${selectedSlot.slotNumber}`}
          size="md"
        >
          <div className="space-y-4 text-xs font-sans text-smartTextSecondary text-left">
            <div className="flex items-center justify-between border-b border-smartBorder/45 pb-3">
              <div>
                <span className="text-[10px] font-mono block">FLOOR LEVEL</span>
                <strong className="text-sm text-smartTextPrimary">{activeFloor?.label}</strong>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                selectedSlot.state === 'AVAILABLE' ? 'text-available bg-available/10 border-available/30' :
                selectedSlot.state === 'RESERVED' ? 'text-aiBlue bg-aiBlue/10 border-aiBlue/30' :
                'text-limited bg-limited/10 border-limited/30'
              }`}>
                {selectedSlot.state}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart space-y-1">
                <span className="text-[9px] font-mono block text-smartTextSecondary">BAY CAPABILITY</span>
                <span className="font-semibold text-smartTextPrimary">
                  {selectedSlot.isEV ? 'EV Fast Charger Equipped' : 'Standard Gas Space'}
                </span>
              </div>

              <div className="p-3 bg-smartSurface border border-smartBorder rounded-smart space-y-1">
                <span className="text-[9px] font-mono block text-smartTextSecondary">ACCESSIBILITY</span>
                <span className="font-semibold text-smartTextPrimary">
                  {selectedSlot.isDisabled ? 'Disabled Access Only' : 'General Access'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-smartBg border border-smartBorder rounded-smart space-y-1 font-sans">
              <span className="font-semibold text-smartTextPrimary block">Availability Permit</span>
              {selectedSlot.state === 'AVAILABLE' ? (
                <p>This space is open and ready to accept instant check-in reserves. Click below to continue.</p>
              ) : selectedSlot.state === 'RESERVED' ? (
                <p>This space is reserved for a pending digital driver arrival card.</p>
              ) : (
                <p>This space is occupied by an active checked-in vehicle silhouette.</p>
              )}
            </div>

            <div className="pt-4 border-t border-smartBorder flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSlot(null)} className="font-mono uppercase h-9">
                Close
              </Button>
              {selectedSlot.state === 'AVAILABLE' && (
                <Link href={`/reserve?facility=${facility.slug}&slot=${selectedSlot.id}&floor=${activeFloor?.id}`}>
                  <Button variant="primary" size="sm" onClick={() => setSelectedSlot(null)} className="font-mono uppercase h-9">
                    Book Space
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        type={toastType}
      />
    </div>
  );
}
