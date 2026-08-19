'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Building, 
  MapPin, 
  Layers, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock, 
  Info, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle,
  Database,
  ArrowUpDown,
  RotateCcw,
  Activity,
  SlidersHorizontal,
  PlusCircle,
  Smartphone,
  Eye,
  CheckCircle2,
  Lock,
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
import { 
  MOCK_OPERATOR_FACILITIES, 
  OperatorFacility, 
  OperatorFloor, 
  OperatorParkingSlot, 
  OperationalAlert, 
  OperatorInsight 
} from '../../lib/operatorData';
import { api } from '../../lib/api';
import { authService } from '../../lib/auth';
import { useRouter } from 'next/navigation';

// Top-down vehicle wireframe for occupied slots
const OperatorVehicleSilhouette: React.FC = () => (
  <svg
    viewBox="0 0 32 64"
    className="w-8 h-12 text-smartTextSecondary/40 fill-none stroke-current stroke-[1.2] animate-fade-in"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="24" height="56" rx="5" />
    <path d="M 6 4 L 26 4 M 6 60 L 26 60" />
    <path d="M 6 18 C 6 12, 26 12, 26 18" />
    <path d="M 7 46 C 7 49, 25 49, 25 46" />
    <rect x="7" y="19" width="18" height="26" rx="2" className="opacity-40" />
  </svg>
);

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

export default function OperatorPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);
  
  const [dashboardMetrics, setDashboardMetrics] = React.useState<any>(null);
  const [facilities, setFacilities] = React.useState<OperatorFacility[]>(MOCK_OPERATOR_FACILITIES);
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string>('facility-metro-central');
  
  const [activeFacilityOccupancy, setActiveFacilityOccupancy] = React.useState<any>(null);
  const [activeFloorId, setActiveFloorId] = React.useState<string>('L1');
  const [recentTelemetry, setRecentTelemetry] = React.useState<any[]>([]);

  const [selectedSlot, setSelectedSlot] = React.useState<OperatorParkingSlot | null>(null);
  const [forecastHorizon, setForecastHorizon] = React.useState<string>('60');
  const [alertFilter, setAlertFilter] = React.useState<string>('ALL');
  const [sortKey, setSortKey] = React.useState<string>('occupancy');
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);

  // Toast
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMsg, setToastMsg] = React.useState<string>('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const loadOperatorData = React.useCallback(async () => {
    try {
      // 1. Fetch dashboard metrics
      const dashRes = await api.get('/api/operator/dashboard');
      if (dashRes.success) {
        setDashboardMetrics(dashRes.data);
      }

      // 2. Fetch facilities
      const facsRes = await api.get('/api/operator/facilities');
      if (facsRes.success && Array.isArray(facsRes.data)) {
        const mappedFacs: OperatorFacility[] = facsRes.data.map((f: any) => {
          const template = MOCK_OPERATOR_FACILITIES.find(m => mapIdToBackend(m.id) === f.id) || MOCK_OPERATOR_FACILITIES[0];
          return {
            ...template,
            id: f.id,
            name: f.name,
            location: f.address,
            totalBays: f.capacity,
            availableBays: f.available,
            occupiedBays: f.occupied,
            reservedBays: f.reserved,
            disabledBays: f.disabled,
            occupancyPct: f.occupancyPercentage
          };
        });
        setFacilities(mappedFacs);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('403') || err.message?.toLowerCase().includes('denied')) {
        setIsAuthorized(false);
      } else {
        showToast(err.message || 'Error fetching metrics.', 'error');
      }
    }
  }, []);

  const loadFacilityDetailData = React.useCallback(async (facilityId: string) => {
    try {
      const occRes = await api.get(`/api/operator/facilities/${facilityId}/occupancy`);
      if (occRes.success) {
        setActiveFacilityOccupancy(occRes.data);
        if (occRes.data.floors && occRes.data.floors.length > 0) {
          // Set active floor tab if not set or invalid
          const hasFloor = occRes.data.floors.some((fl: any) => fl.id === activeFloorId);
          if (!hasFloor) {
            setActiveFloorId(occRes.data.floors[0].id);
          }
        }

        setFacilities(prev => prev.map(f => {
          if (f.id !== facilityId) return f;
          
          const floors = f.floors.map(floorTemplate => {
            const apiFloor = occRes.data.floors.find((fl: any) => fl.id === floorTemplate.floorId);
            if (!apiFloor) return floorTemplate;
            
            const slots = (apiFloor.slots || []).map((s: any) => ({
              id: s.id,
              state: s.status as any,
              isEV: s.isEVCharging
            }));
            
            return {
              ...floorTemplate,
              slots: slots.length > 0 ? slots : floorTemplate.slots
            };
          });
          
          return {
            ...f,
            floors
          };
        }));
      }

      const telemRes = await api.get(`/api/operator/facilities/${facilityId}/telemetry`);
      if (telemRes.success) {
        setRecentTelemetry(telemRes.data);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Error loading facility layout details.', 'error');
    }
  }, [activeFloorId]);

  React.useEffect(() => {
    setMounted(true);
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
      loadOperatorData();
    }
  }, [router, loadOperatorData]);

  React.useEffect(() => {
    if (isAuthorized && selectedFacilityId) {
      loadFacilityDetailData(selectedFacilityId);
    }
  }, [isAuthorized, selectedFacilityId, loadFacilityDetailData]);

  // Find active facility template data
  const activeFacility = React.useMemo(() => {
    return facilities.find(f => f.id === selectedFacilityId) || facilities[0];
  }, [facilities, selectedFacilityId]);

  // Find active floor layout
  const activeFloor = React.useMemo(() => {
    return activeFacility.floors.find(fl => fl.floorId === activeFloorId) || activeFacility.floors[0];
  }, [activeFacility, activeFloorId]);

  // Alert filter computations
  const filteredAlerts = React.useMemo(() => {
    const facilityAlerts = activeFacility.alerts;
    if (alertFilter === 'ALL') return facilityAlerts;
    return facilityAlerts.filter(a => a.severity === alertFilter);
  }, [activeFacility, alertFilter]);

  // Facility list sorting logic
  const sortedFacilitiesList = React.useMemo(() => {
    const list = [...facilities];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'occupancy') {
        comparison = a.occupancyPct - b.occupancyPct;
      } else if (sortKey === 'availability') {
        comparison = a.availableBays - b.availableBays;
      } else if (sortKey === 'revenue') {
        comparison = a.revenueToday - b.revenueToday;
      } else if (sortKey === 'reservations') {
        comparison = a.activeBookings - b.activeBookings;
      }
      return sortAsc ? comparison : -comparison;
    });
    return list;
  }, [facilities, sortKey, sortAsc]);

  const handleFacilityChange = (id: string, name: string) => {
    setSelectedFacilityId(id);
    showToast(`Switched operational context to ${name}`, 'info');
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(prev => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-occupied/10 border border-occupied/30 flex items-center justify-center text-occupied mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-display font-bold uppercase tracking-tight text-white">403: Forbidden</h2>
          <p className="text-xs text-smartTextSecondary mt-2 leading-relaxed">
            Your authenticated user account does not have developer or operator privileges in the database. Please request access from the SmartPark System Administrator.
          </p>
          <Link href="/home" className="mt-6 w-full">
            <Button variant="secondary" className="w-full text-xs font-semibold uppercase">Back to Home</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (!dashboardMetrics || !mounted) {
    return (
      <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary animate-pulse">
        Loading real-time operations console...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 relative">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">

        {/* 1. PAGE HEADER & PREVIEW STATUS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-smartBorder/40 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-signature bg-signature/10 border border-signature/20 px-2 py-0.5 rounded-full uppercase">
                OPERATIONAL CONSOLE (ACTIVE)
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
              <span className="text-[9.5px] font-mono text-smartTextSecondary uppercase">
                Supabase Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white">
              Parking Operations
            </h1>
            <p className="text-xs text-smartTextSecondary font-sans mt-0.5">
              Monitor occupancy, demand, and facility performance from one operational workspace.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center">
            <span className="text-[10px] font-mono text-smartTextSecondary mb-1">
              SYSTEM STATUS: <span className="text-available">ONLINE</span>
            </span>
            <div className="bg-smartSurface/70 border border-smartBorder/60 px-3 py-1.5 rounded flex items-center gap-2">
              <Activity className="h-3 w-3 text-signature" />
              <span className="text-[9.5px] font-mono font-semibold text-smartTextPrimary uppercase tracking-wider">
                LIVE DATABASE TELEMETRY CHANNEL
              </span>
            </div>
          </div>
        </div>

        {/* 2. FACILITY SELECTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {facilities.map((fac) => {
            const isSelected = fac.id === selectedFacilityId;
            return (
              <Card 
                key={fac.id}
                variant={isSelected ? 'default' : 'outlined'}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-signature/40 bg-signature/[0.02]' 
                    : 'hover:bg-smartElevated/35 hover:border-smartBorder/95'
                }`}
                onClick={() => handleFacilityChange(fac.id, fac.name)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Building className={`h-4 w-4 ${isSelected ? 'text-signature' : 'text-smartTextSecondary'}`} />
                    <span className="font-display text-xs font-semibold text-white">{fac.name}</span>
                  </div>
                  <Badge variant={fac.operatingStatus === 'OPEN' ? 'available' : 'occupied'}>
                    {fac.operatingStatus}
                  </Badge>
                </div>
                <div className="text-[10px] text-smartTextSecondary mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {fac.location}
                </div>
                <div className="flex justify-between items-baseline mt-3 border-t border-smartBorder/30 pt-2 text-[10px] font-mono">
                  <span>Occupancy: {fac.occupancyPct}%</span>
                  <span className="text-signature font-bold">{fac.availableBays} bays free</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 3. OPERATIONAL SUMMARY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <MetricCard 
            label="Total Bays"
            value={activeFacility.totalBays}
            trend={{ value: 'System capacity', direction: 'neutral' }}
          />
          <MetricCard 
            label="Available Bays"
            value={activeFacility.availableBays}
            trend={{ value: 'Free slots', direction: 'neutral' }}
          />
          <MetricCard 
            label="Occupied Bays"
            value={activeFacility.occupiedBays}
            trend={{ value: `${activeFacility.occupancyPct}% full`, direction: 'neutral' }}
          />
          <MetricCard 
            label="Reserved Bays"
            value={activeFacility.reservedBays}
            trend={{ value: 'Future passes', direction: 'neutral' }}
          />
          <MetricCard 
            label="Bookings Today"
            value={dashboardMetrics.todaysReservations}
            trend={{ value: 'Total reservations', direction: 'neutral' }}
          />
          <MetricCard 
            label="Revenue Today"
            value={`₹${dashboardMetrics.todaysRevenue}`}
            trend={{ value: 'Gross rate ledger', direction: 'neutral' }}
          />
        </div>

        {/* 4. TWO-COLUMN OPERATIONAL DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left / Center 2 Columns: Live Floor Bay Layout Map */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-smartBorder/40 pb-2.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-signature" />
                Physical Space Deck Layout
              </h3>

              {activeFacilityOccupancy && activeFacilityOccupancy.floors && (
                <div className="flex gap-1.5">
                  {activeFacilityOccupancy.floors.map((fl: any) => (
                    <button
                      key={fl.id}
                      onClick={() => setActiveFloorId(fl.id)}
                      className={`px-3 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                        activeFloorId === fl.id 
                          ? 'bg-signature text-black font-bold' 
                          : 'bg-smartSurface text-smartTextSecondary border border-smartBorder hover:border-smartBorder/80 hover:text-white'
                      }`}
                    >
                      {fl.name || fl.id} ({fl.available})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Floor Map Layout Rendering */}
            {activeFacilityOccupancy && (
              <Card className="flex flex-col gap-6 bg-smartElevated/40">
                <div className="flex justify-between items-center text-[10px] font-mono text-smartTextSecondary border-b border-smartBorder/30 pb-2">
                  <span>Selected level: <span className="text-white font-bold">{activeFloorId}</span></span>
                  <span>Sensory status: <span className="text-available">ACTIVE</span></span>
                </div>

                {/* Bays Layout grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 justify-center py-4 bg-smartBg/70 p-4 border border-smartBorder/60 rounded-xl max-h-[300px] overflow-y-auto">
                  {/* Dynamic generation based on occupancy API floor breakdown */}
                  {activeFacilityOccupancy.floors?.find((fl: any) => fl.id === activeFloorId)?.available === undefined ? (
                    // Fallback to template if loading
                    activeFloor.slots.map((slot) => {
                      const isOccupied = slot.state === 'OCCUPIED';
                      return (
                        <div 
                          key={slot.id} 
                          onClick={() => setSelectedSlot(slot)}
                          className={`h-16 border rounded cursor-pointer transition-all flex flex-col justify-between p-2 relative ${
                            isOccupied ? 'border-occupied/35 bg-occupied/5' : 'border-available/45 bg-available/5 hover:border-available'
                          }`}
                        >
                          <span className="text-[8px] font-mono text-smartTextSecondary block">{slot.id}</span>
                          <div className="flex justify-center items-center h-full">
                            {isOccupied && <OperatorVehicleSilhouette />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Load slots from matchedApi state
                    (facilities.find(f => f.id === selectedFacilityId)?.floors?.find(fl => fl.floorId === activeFloorId)?.slots || []).map((slot: any) => {
                      const isOccupied = slot.state === 'OCCUPIED';
                      const isReserved = slot.state === 'RESERVED';
                      const isDisabled = slot.state === 'DISABLED';
                      const isAvailable = slot.state === 'AVAILABLE';

                      let borderClass = 'border-available/45 bg-available/5';
                      if (isOccupied) borderClass = 'border-occupied/35 bg-occupied/5';
                      else if (isReserved) borderClass = 'border-aiBlue/35 bg-aiBlue/5';
                      else if (isDisabled) borderClass = 'border-smartBorder/20 bg-smartBg/40 opacity-35 cursor-not-allowed';

                      return (
                        <div 
                          key={slot.id} 
                          onClick={() => !isDisabled && setSelectedSlot({
                            id: slot.id,
                            state: slot.state,
                            evCharging: !!slot.isEV,
                            floor: activeFloorId,
                            lastStateChange: 'Recent'
                          })}
                          className={`h-16 border rounded cursor-pointer transition-all flex flex-col justify-between p-2 relative ${borderClass}`}
                        >
                          <span className="text-[8px] font-mono text-smartTextSecondary block">{slot.id.split('-').pop()}</span>
                          <div className="flex justify-center items-center h-full">
                            {isOccupied && <OperatorVehicleSilhouette />}
                            {isReserved && <span className="h-2.5 w-2.5 bg-aiBlue rounded-full animate-pulse" />}
                            {isDisabled && <Lock className="h-3 w-3 text-smartTextSecondary" />}
                          </div>
                          {slot.isEV && <Zap className="absolute top-1 right-1 h-2.5 w-2.5 text-available" />}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center text-[9px] font-mono text-smartTextSecondary border-t border-smartBorder/30 pt-3">
                  <span>Legend: [Solid Line: Available] &bull; [Vehicle icon: Occupied] &bull; [Blue dot: Reserved] &bull; [Lock icon: Disabled]</span>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: IoT Raw Telemetry feed */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary flex items-center gap-1.5 border-b border-smartBorder/40 pb-2.5">
              <Database className="h-4 w-4 text-signature" />
              Live Sensor Influx
            </h3>

            <Card className="flex-1 flex flex-col gap-3 min-h-[300px] max-h-[380px] overflow-y-auto">
              {recentTelemetry.length > 0 ? (
                <div className="flex flex-col gap-2 font-mono text-[9px]">
                  {recentTelemetry.map((log) => (
                    <div key={log.id} className="p-2 border border-smartBorder/40 bg-smartBg/30 rounded flex justify-between items-center gap-3">
                      <div>
                        <span className="text-white font-bold uppercase">Slot {log.slot?.slotNumber || 'Bay'}</span>
                        <span className="text-smartTextSecondary/60 block">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <Badge variant={log.sensorValue === 'occupied' ? 'occupied' : 'available'} className="text-[8px] font-mono">
                        {log.sensorValue}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-smartTextSecondary text-[10px] font-sans">
                  No recent telemetry signals logged for this facility.
                </div>
              )}
            </Card>
          </div>
        </div>

      </main>

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
