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

// Top-down vehicle wireframe for occupied slots (reused local rendering to bypass click disables)
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

export default function OperatorPage() {
  // --- States ---
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [facilities, setFacilities] = React.useState<OperatorFacility[]>(MOCK_OPERATOR_FACILITIES);
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string>('fac-mcg');
  const [selectedFloorId, setSelectedFloorId] = React.useState<string>('B1');
  const [selectedSlot, setSelectedSlot] = React.useState<OperatorParkingSlot | null>(null);
  const [forecastHorizon, setForecastHorizon] = React.useState<string>('60');
  const [alertFilter, setAlertFilter] = React.useState<string>('ALL');
  const [sortKey, setSortKey] = React.useState<string>('occupancy');
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Toast
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMsg, setToastMsg] = React.useState<string>('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Find active facility data
  const activeFacility = React.useMemo(() => {
    return facilities.find(f => f.id === selectedFacilityId) || facilities[0];
  }, [facilities, selectedFacilityId]);

  // Find active floor layout
  const activeFloor = React.useMemo(() => {
    return activeFacility.floors.find(fl => fl.floorId === selectedFloorId) || activeFacility.floors[0];
  }, [activeFacility, selectedFloorId]);

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

  // Check if user has active filters modified
  const isFiltersActive = React.useMemo(() => {
    return selectedFloorId !== 'B1' || forecastHorizon !== '60' || alertFilter !== 'ALL';
  }, [selectedFloorId, forecastHorizon, alertFilter]);

  // Reset Filters logic
  const handleResetFilters = () => {
    setSelectedFloorId('B1');
    setForecastHorizon('60');
    setAlertFilter('ALL');
    showToast('Operations filters reset to defaults.', 'info');
  };

  // Switch Facility triggers
  const handleFacilityChange = (id: string, name: string) => {
    setSelectedFacilityId(id);
    setSelectedFloorId('B1');
    showToast(`Focused operational feed to ${name}`, 'success');
  };

  // Sort helper
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 relative">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">

        {/* ==================================================
            1. PAGE HEADER & PREVIEW STATUS
           ================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-smartBorder/40 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-signature bg-signature/10 border border-signature/20 px-2 py-0.5 rounded-full uppercase">
                OPERATIONAL MODE
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
              <span className="text-[9.5px] font-mono text-smartTextSecondary uppercase">
                active-feed-v2
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white animate-fade-in">
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
                OPERATIONS PREVIEW · LIVE DATA INTEGRATION PENDING
              </span>
            </div>
            <span className="text-[9px] font-mono text-smartTextSecondary/60 mt-1">
              Last Refreshed: {mounted ? new Date().toLocaleTimeString() : '--:--:--'} (Telemetry)
            </span>
          </div>
        </div>

        {/* ==================================================
            2. FACILITY SELECTOR GRID
           ================================================== */}
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

        {/* ==================================================
            3. OPERATIONAL SUMMARY METRICS
           ================================================== */}
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
            label="Occupancy Rate"
            value={`${activeFacility.occupancyPct}%`}
            trend={{ value: 'Capacity filled', direction: activeFacility.occupancyPct > 80 ? 'up' : 'neutral' }}
          />
          <MetricCard 
            label="Active Reservations"
            value={activeFacility.activeBookings}
            trend={{ value: 'Pending gate arrivals', direction: 'neutral' }}
          />
          <MetricCard 
            label="Revenue Today"
            value={`₹${activeFacility.revenueToday}`}
            trend={activeFacility.revenueTrend}
          />
          <MetricCard 
            label="Avg Stay Duration"
            value={`${activeFacility.pricing.avgTransactionValue} min`}
            trend={{ value: 'Per ticket processed', direction: 'neutral' }}
          />
        </div>

        {/* ==================================================
            4. DUAL SECTION: CURRENT OCCUPANCY COMMAND CENTER & FLOOR LAYOUT
           ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 1 Column: Occupancy command Center Visualizer */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
              Occupancy Command Center
            </h3>

            <Card variant="default" className="flex flex-col items-center justify-between gap-5 h-full py-6">
              <div className="text-center">
                <span className="text-[10px] font-mono text-smartTextSecondary uppercase">Total Registered Bays</span>
                <div className="font-mono text-3xl font-bold text-white mt-0.5">{activeFacility.totalBays}</div>
              </div>

              {/* Large Ring Visualization using SVG */}
              <div className="relative h-44 w-44 flex items-center justify-center">
                <svg className="h-full w-full transform -rotate-95" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#282F34" strokeWidth="8" />
                  
                  {/* Occupied Slice */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#EF4444" 
                    strokeWidth="8" 
                    strokeDasharray={`${(activeFacility.occupiedBays / activeFacility.totalBays) * 251.2} 251.2`} 
                  />

                  {/* Reserved Slice (Offset by occupied percentage) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#3B82F6" 
                    strokeWidth="8" 
                    strokeDasharray={`${(activeFacility.reservedBays / activeFacility.totalBays) * 251.2} 251.2`}
                    strokeDashoffset={`-${(activeFacility.occupiedBays / activeFacility.totalBays) * 251.2}`}
                  />
                  
                  {/* Available Slice (Remaining) */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="transparent" 
                    stroke="#10B981" 
                    strokeWidth="8" 
                    strokeDasharray={`${(activeFacility.availableBays / activeFacility.totalBays) * 251.2} 251.2`}
                    strokeDashoffset={`-${((activeFacility.occupiedBays + activeFacility.reservedBays) / activeFacility.totalBays) * 251.2}`}
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl font-extrabold text-white leading-none">
                    {activeFacility.occupancyPct}%
                  </span>
                  <span className="text-[9px] font-mono text-smartTextSecondary uppercase tracking-widest mt-1">
                    Occupied
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="w-full flex justify-between px-4 text-[10.5px] font-mono border-t border-smartBorder/45 pt-4">
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-available mb-1" />
                  <span className="text-white font-bold">{activeFacility.availableBays}</span>
                  <span className="text-smartTextSecondary text-[8.5px] uppercase">Free</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-occupied mb-1" />
                  <span className="text-white font-bold">{activeFacility.occupiedBays}</span>
                  <span className="text-smartTextSecondary text-[8.5px] uppercase">Filled</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="h-2 w-2 rounded-full bg-aiBlue mb-1" />
                  <span className="text-white font-bold">{activeFacility.reservedBays}</span>
                  <span className="text-smartTextSecondary text-[8.5px] uppercase">Res</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right 2 Columns: Floor layout visual grids */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
                Parking Floor Status
              </h3>
              
              <div className="flex items-center gap-1 bg-smartElevated p-0.5 rounded border border-smartBorder/60 select-none">
                {activeFacility.floors.map((fl) => {
                  const isActive = fl.floorId === selectedFloorId;
                  return (
                    <button
                      key={fl.floorId}
                      className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded transition-colors ${
                        isActive 
                          ? 'bg-smartSurface text-signature font-bold border border-smartBorder/80' 
                          : 'text-smartTextSecondary hover:text-smartTextPrimary'
                      }`}
                      onClick={() => setSelectedFloorId(fl.floorId)}
                    >
                      {fl.floorId} ({fl.availableBays} Free)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid display layout */}
            <Card variant="default" className="flex flex-col gap-4 justify-between h-full min-h-[300px]">
              <div>
                <span className="text-[10px] font-mono text-smartTextSecondary block uppercase">
                  Layout grid — {selectedFloorId} Level (Click slot to view details)
                </span>
                <div className="flex flex-wrap gap-2 justify-center py-4 bg-smartBg/60 border border-smartBorder/45 rounded-lg max-h-[340px] overflow-y-auto mt-2">
                  {activeFloor.slots.map((slot) => {
                    // Map local slots data state to component compatible options
                    const stateMapping: Record<string, string> = {
                      AVAILABLE: 'AVAILABLE',
                      OCCUPIED: 'OCCUPIED',
                      RESERVED: 'RESERVED',
                      DISABLED: 'LIMITED' // Fallback mapping for Disabled
                    };

                    const displayState = stateMapping[slot.state] || 'AVAILABLE';

                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`relative flex flex-col items-center justify-between py-2 h-20 w-12 border-x-2 border-dashed transition-all duration-200 select-none focus:outline-none focus:border-x-solid focus:border-signature ${
                          slot.state === 'AVAILABLE' ? 'border-available/30 hover:bg-available/5 bg-smartBg/30 text-available' :
                          slot.state === 'OCCUPIED' ? 'border-smartBorder/20 bg-smartSurface/30 text-smartTextSecondary/30' :
                          slot.state === 'RESERVED' ? 'border-aiBlue/30 bg-aiBlue/5 text-aiBlue font-bold' :
                          'border-limited/30 bg-limited/5 text-limited' // Disabled slots
                        }`}
                      >
                        <span className="font-mono text-[8.5px] font-bold text-smartTextSecondary tracking-tight bg-smartBg border border-smartBorder/35 px-1 py-0.5 rounded">
                          {slot.id}
                        </span>

                        <div className="flex-1 flex items-center justify-center w-full my-1">
                          {slot.state === 'OCCUPIED' ? (
                            <OperatorVehicleSilhouette />
                          ) : slot.state === 'RESERVED' ? (
                            <div className="h-1.5 w-1.5 rounded-full bg-aiBlue animate-pulse" />
                          ) : slot.state === 'DISABLED' ? (
                            <Lock className="h-3.5 w-3.5 text-limited" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-available" />
                          )}
                        </div>

                        {slot.evCharging && (
                          <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-signature flex items-center justify-center text-[5.5px] font-bold text-black" title="EV Charger Ready">
                            ⚡
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-[9.5px] font-mono text-smartTextSecondary border-t border-smartBorder/45 pt-3">
                <span>Legend: [Solid Line: Available] &bull; [Vehicle icon: Occupied] &bull; [Blue dot: Reserved] &bull; [Lock icon: Disabled]</span>
                <span className="text-signature">⚡ = EV Charger Ready</span>
              </div>
            </Card>
          </div>

        </div>

        {/* ==================================================
            5. DUAL UTILIZATION ANALYTICS CHART & DEMAND FORECAST
           ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Observed vs Forecast occupancies lightweight SVG Area Chart */}
          <Card variant="default" className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                Utilization Profile
              </span>
              <h3 className="text-sm font-display font-semibold uppercase text-white">
                Facility Utilization Timeline
              </h3>
            </div>

            <div className="relative w-full h-44 bg-smartBg border border-smartBorder rounded-lg p-2 overflow-hidden flex flex-col justify-between">
              
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">80%</div>
                <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">60%</div>
                <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">40%</div>
                <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">20%</div>
              </div>

              {/* SVG Area Chart */}
              <svg className="absolute inset-x-0 bottom-8 h-28 w-full px-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="opt-chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B7F34A" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#B7F34A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Observed to forecast poly path */}
                <path 
                  d={`
                    M 5,80 L 20,68 L 35,50 L 50,${100 - activeFacility.occupancyPct} 
                    L 65,${100 - Math.min(95, activeFacility.occupancyPct + 10)} 
                    L 80,${100 - Math.max(30, activeFacility.occupancyPct - 20)} 
                    L 95,20 L 95,100 L 5,100 Z
                  `} 
                  fill="url(#opt-chart-gradient)" 
                />

                {/* Observed Solid Line */}
                <path 
                  d={`M 5,80 L 20,68 L 35,50 L 50,${100 - activeFacility.occupancyPct}`} 
                  fill="none" 
                  stroke="#B7F34A" 
                  strokeWidth="2" 
                />

                {/* Forecast Dashed Line */}
                <path 
                  d={`
                    M 50,${100 - activeFacility.occupancyPct} 
                    L 65,${100 - Math.min(95, activeFacility.occupancyPct + 10)} 
                    L 80,${100 - Math.max(30, activeFacility.occupancyPct - 20)} 
                    L 95,20
                  `} 
                  fill="none" 
                  stroke="#B7F34A" 
                  strokeWidth="2" 
                  strokeDasharray="4,4" 
                />

                {/* Dot markers */}
                <circle cx="50" cy={100 - activeFacility.occupancyPct} r="3" fill="#0A0C0E" stroke="#B7F34A" strokeWidth="2" />
              </svg>

              {/* X Axis labels */}
              <div className="w-full flex justify-between px-6 pt-32 text-[9px] font-mono text-smartTextSecondary z-10 select-none">
                <div className="flex flex-col items-center">
                  <span>14:00</span>
                  <span className="text-[8px]">Observed</span>
                </div>
                <div className="flex flex-col items-center">
                  <span>16:00</span>
                  <span className="text-[8px]">Observed</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white font-bold">Now</span>
                  <span className="text-signature font-bold">{activeFacility.occupancyPct}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-signature/80">20:00</span>
                  <span className="text-[8px]">Forecast</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-signature/80">22:00</span>
                  <span className="text-[8px]">Forecast</span>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center text-[10px] font-mono bg-smartElevated px-3 py-2 rounded">
              <span className="text-smartTextSecondary">Accent line represents hourly forecast.</span>
              <span className="text-signature uppercase font-semibold">Peak utilization expected between 18:00 and 20:00.</span>
            </div>
          </Card>

          {/* Right Column: Demand Forecast Window selection */}
          <Card variant="default" className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-aiBlue block">
                  Temporal Trends
                </span>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Demand Forecast
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
                <span className="text-smartTextSecondary text-[9px]">Horizon:</span>
                <select
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(e.target.value)}
                  className="bg-smartElevated border border-smartBorder/60 px-2 py-0.5 rounded text-white text-[10px]"
                >
                  <option value="30">30 Min</option>
                  <option value="60">60 Min</option>
                  <option value="90">90 Min</option>
                  <option value="120">120 Min</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-52 pr-1">
              {(activeFacility.hourlyDemandForecast[forecastHorizon] || []).map((point, index) => {
                const demandColors = {
                  LOW: 'text-available bg-available/10 border-available/20',
                  MODERATE: 'text-smartTextPrimary bg-smartSurface border-smartBorder',
                  HIGH: 'text-limited bg-limited/10 border-limited/20',
                  'VERY HIGH': 'text-occupied bg-occupied/10 border-occupied/20'
                };

                return (
                  <div 
                    key={point.time}
                    className="flex items-center justify-between border border-smartBorder/50 bg-smartBg/40 rounded px-3 py-1.5 transition-colors hover:bg-smartElevated/25"
                  >
                    <span className="font-mono text-xs text-white">{point.time}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10.5px] font-mono text-smartTextSecondary">
                        Expected: {point.occupancyPercent}% Occ &bull; {point.availableBays} bays free
                      </span>
                      <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border ${demandColors[point.demandLevel]}`}>
                        {point.demandLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ==================================================
            6. DUAL SECTION: ALERTS & INSIGHTS
           ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Operational Alerts list with filtering */}
          <Card variant="default" className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-smartBorder/45 pb-2">
              <div>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Operational Alerts
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {['ALL', 'WARNING', 'CRITICAL'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAlertFilter(sev)}
                    className={`px-2 py-0.5 rounded border transition-colors ${
                      alertFilter === sev 
                        ? 'bg-smartSurface border-smartBorder text-signature font-bold' 
                        : 'border-transparent text-smartTextSecondary hover:text-smartTextPrimary'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  const sevConfig = {
                    INFO: { badge: 'default', border: 'border-smartBorder/45 bg-smartBg/20' },
                    WARNING: { badge: 'limited', border: 'border-limited/20 bg-limited/[0.02]' },
                    CRITICAL: { badge: 'occupied', border: 'border-occupied/20 bg-occupied/[0.02]' }
                  }[alert.severity];

                  return (
                    <div 
                      key={alert.id}
                      className={`border rounded-lg p-3 flex justify-between items-start gap-4 transition-colors ${sevConfig.border}`}
                    >
                      <div className="flex-1 flex gap-2">
                        <AlertTriangle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
                          alert.severity === 'CRITICAL' ? 'text-occupied' :
                          alert.severity === 'WARNING' ? 'text-limited' : 'text-smartTextSecondary'
                        }`} />
                        <div>
                          <h4 className="text-[11.5px] font-sans font-bold text-white leading-tight">{alert.title}</h4>
                          <p className="text-[10px] text-smartTextSecondary mt-0.5 leading-relaxed">{alert.description}</p>
                          <span className="text-[8.5px] font-mono text-smartTextSecondary/60 mt-1 block">
                            Area: {alert.affectedArea}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[9px] font-mono text-smartTextSecondary/80">{alert.timestamp.split(' ')[1]}</span>
                        <Badge variant={sevConfig.badge as any}>{alert.severity}</Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-smartTextSecondary/60 font-mono">
                  No active operational alerts for selected severity levels.
                </div>
              )}
            </div>
          </Card>

          {/* Right Column: Operator Insights panel */}
          <Card variant="default" className="flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                Command Dispatch Assistant
              </span>
              <h3 className="text-sm font-display font-semibold uppercase text-white">
                Operator Recommendations & Insights
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {activeFacility.insights.map((insight) => (
                <div 
                  key={insight.id}
                  className="bg-smartElevated/40 border border-smartBorder/60 rounded-lg p-3 flex justify-between gap-4"
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4.5 w-4.5 text-signature shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-smartTextPrimary leading-relaxed">
                        {insight.explanation}
                      </p>
                      <span className="text-[9px] font-mono text-smartTextSecondary/60 mt-1 block">
                        Target Floor Focus: {insight.affectedFloor}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-smartTextSecondary/80">{insight.timestamp}</span>
                    <Badge variant={
                      insight.priority === 'HIGH' ? 'occupied' :
                      insight.priority === 'MEDIUM' ? 'limited' : 'default'
                    }>
                      {insight.priority} Priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ==================================================
            7. DUAL SECTION: PRICING OVERVIEW & FILTER CONTROLS
           ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pricing detail column */}
          <Card variant="default" className="lg:col-span-2 flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                Billing Configurations
              </span>
              <h3 className="text-sm font-display font-semibold uppercase text-white">
                Pricing & Revenue Overview
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-smartBg/65 border border-smartBorder/45 p-4 rounded-xl">
              <div>
                <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Base rate</span>
                <span className="font-mono text-lg font-bold text-white">₹{activeFacility.pricing.currentHourlyRate}/hr</span>
              </div>
              <div>
                <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Peak rate</span>
                <span className="font-mono text-lg font-bold text-limited">₹{activeFacility.pricing.peakPeriodRate}/hr</span>
              </div>
              <div>
                <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">EV Charge base</span>
                <span className="font-mono text-lg font-bold text-signature">₹{activeFacility.pricing.evChargingRate}/hr</span>
              </div>
              <div>
                <span className="text-[8.5px] font-mono text-smartTextSecondary block uppercase">Avg ticket size</span>
                <span className="font-mono text-lg font-bold text-white">₹{activeFacility.pricing.avgTransactionValue}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[9.5px] font-mono text-smartTextSecondary border-t border-smartBorder/45 pt-3">
              <span>* Billing tariff configuration dashboard. Pricing changes updates localized simulation parameters.</span>
              <span className="text-signature font-semibold uppercase">Pricing Simulation Active</span>
            </div>
          </Card>

          {/* Filter operations controls panel */}
          <Card variant="default" className="lg:col-span-1 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-sm font-display font-semibold uppercase text-white">
                Workspace Controls
              </h3>
              <p className="text-[11px] text-smartTextSecondary mt-1 leading-relaxed">
                Filter controls active on floor grids, forecast ranges, and severities.
              </p>
            </div>

            {isFiltersActive ? (
              <div className="flex flex-col gap-2 mt-2">
                <div className="text-[10px] font-mono text-smartTextSecondary flex flex-wrap gap-x-2 gap-y-1">
                  <span>Active filters:</span>
                  {selectedFloorId !== 'B1' && <span className="text-signature">Floor {selectedFloorId}</span>}
                  {forecastHorizon !== '60' && <span className="text-signature">Horizon {forecastHorizon}m</span>}
                  {alertFilter !== 'ALL' && <span className="text-signature">Alerts {alertFilter}</span>}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full text-xs uppercase tracking-wider font-semibold group mt-1.5"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5 group-hover:rotate-45 transition-transform" />
                  Reset operational Filters
                </Button>
              </div>
            ) : (
              <div className="text-xs text-smartTextSecondary/60 font-mono italic">
                All filter grids are currently set to defaults.
              </div>
            )}
          </Card>
        </div>

        {/* ==================================================
            8. FACILITY PERFORMANCE COMPARISON TABLE
           ================================================== */}
        <Card variant="default" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-smartBorder/45 pb-3">
            <div>
              <h3 className="text-sm font-display font-semibold uppercase text-white">
                Global Facility Performance Comparison
              </h3>
              <p className="text-[11px] font-sans text-smartTextSecondary">
                Operational margins comparison matrix. Click table headers to sort columns.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-smartTextSecondary">
              <SlidersHorizontal className="h-3.5 w-3.5 text-signature" />
              <span>Sort telemetry indexes</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-smartBorder/60 text-smartTextSecondary font-semibold uppercase tracking-wider select-none text-[9.5px] font-mono">
                  <th className="py-2.5 px-3">Location Facility</th>
                  <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('occupancy')}>
                    <div className="flex items-center gap-1">
                      Occupancy <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </div>
                  </th>
                  <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('availability')}>
                    <div className="flex items-center gap-1">
                      Available Bays <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </div>
                  </th>
                  <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('reservations')}>
                    <div className="flex items-center gap-1">
                      Reservations <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </div>
                  </th>
                  <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('revenue')}>
                    <div className="flex items-center gap-1 justify-end">
                      Today's Revenue <ArrowUpDown className="h-3 w-3 shrink-0" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smartBorder/30">
                {sortedFacilitiesList.map((fac) => {
                  const isSelected = fac.id === selectedFacilityId;
                  return (
                    <tr 
                      key={fac.id}
                      className={`group transition-colors cursor-pointer text-[11px] ${
                        isSelected 
                          ? 'bg-signature/5 font-semibold border-l-2 border-signature' 
                          : 'hover:bg-smartElevated/35'
                      }`}
                      onClick={() => handleFacilityChange(fac.id, fac.name)}
                    >
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-display font-medium text-white group-hover:text-signature transition-colors">{fac.name}</div>
                          <div className="text-[10px] text-smartTextSecondary mt-0.5">
                            {fac.location} &bull; {fac.zone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            fac.occupancyPct >= 80 ? 'bg-occupied animate-pulse' :
                            fac.occupancyPct >= 60 ? 'bg-limited' : 'bg-available'
                          }`} />
                          <span className="font-mono text-white">{fac.occupancyPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-smartTextSecondary">{fac.availableBays} bays free</td>
                      <td className="py-3 px-2 font-mono text-white">{fac.activeBookings} active</td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-signature">
                        ₹{fac.revenueToday}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ==================================================
            9. OPERATIONS SYSTEM STATUS FOOTER
           ================================================== */}
        <Card variant="outlined" className="bg-smartSurface/20 border-smartBorder/45 flex flex-col md:flex-row justify-between gap-4 p-4 text-[10px] font-mono text-smartTextSecondary mt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-white font-bold uppercase tracking-wider">OPERATIONS TRANSPARENCY REPORT</span>
            <span>Current State: Local memory sandbox dataset simulation feed.</span>
            <span>Seed Telemetry Vector: static_08_15_2206_operator_metrics.</span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            <div>
              <span className="text-white">API GATEWAY:</span>
              <span className="text-limited font-bold ml-1">PENDING ROUTE BINDING</span>
            </div>
            <div>
              <span className="text-white">TELEMETRY SSE:</span>
              <span className="text-limited font-bold ml-1">OFFLINE Prototypes</span>
            </div>
            <div>
              <span className="text-white">AI DESPATCH ENGINE:</span>
              <span className="text-available font-bold ml-1">CONNECTED CLIENT REALLOCATION</span>
            </div>
          </div>
        </Card>

      </main>

      {/* ==================================================
          10. PARKING SLOT DETAIL MODAL
         ================================================== */}
      <Modal
        isOpen={selectedSlot !== null}
        onClose={() => setSelectedSlot(null)}
        title="Operational Parking Slot Details"
        size="sm"
      >
        {selectedSlot && (
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-smartBorder/45 pb-3">
              <div>
                <span className="text-[10px] font-mono text-smartTextSecondary block uppercase">Bay ID</span>
                <span className="font-mono text-sm font-bold text-white">{selectedSlot.id}</span>
              </div>
              <Badge variant={
                selectedSlot.state === 'AVAILABLE' ? 'available' :
                selectedSlot.state === 'OCCUPIED' ? 'occupied' :
                selectedSlot.state === 'RESERVED' ? 'ai' : 'limited'
              }>
                {selectedSlot.state}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-smartBorder/30 pb-3 font-mono">
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Level/Floor</span>
                <span className="text-white text-xs font-semibold">{selectedSlot.floor}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">EV Compatibility</span>
                <span className="text-white text-xs font-semibold">{selectedSlot.evCharging ? 'Active Charger Ready (⚡)' : 'Standard Bay'}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Reservation ID</span>
                <span className="text-white text-xs font-semibold">{selectedSlot.reservationId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[8.5px] text-smartTextSecondary block uppercase">Last State Change</span>
                <span className="text-white text-[10px] truncate block" title={selectedSlot.lastStateChange}>
                  {selectedSlot.lastStateChange.split(' ')[1]}
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2 pt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="text-xs uppercase tracking-wider font-semibold"
                onClick={() => setSelectedSlot(null)}
              >
                Close Details
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Application Toast */}
      <Toast 
        isOpen={toastOpen} 
        message={toastMsg} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
        duration={3000}
      />
    </div>
  );
}
