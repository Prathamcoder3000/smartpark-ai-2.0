'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { ParkingSlot, ParkingSlotState } from '../../components/ui/ParkingSlot';
import { AIInsight } from '../../components/ui/AIInsight';
import { SearchInput } from '../../components/ui/SearchInput';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import {
  MOCK_FACILITIES,
  MOCK_METRICS,
  MOCK_TELEMETRY_LEVELS,
  MOCK_HOURLY_DEMAND,
  HOW_IT_WORKS_STEPS,
  ParkingFacility,
} from '../../lib/overviewData';
import {
  Sparkles,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Filter,
  Navigation,
  Car,
  Layers,
  TrendingUp,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  React.useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // State for destination search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  // State for interactive bay simulation
  const [demoSlots, setDemoSlots] = useState<{ id: string; state: ParkingSlotState }[]>([
    { id: 'A1', state: 'OCCUPIED' },
    { id: 'A2', state: 'AVAILABLE' },
    { id: 'A3', state: 'LIMITED' },
    { id: 'A4', state: 'RESERVED' },
    { id: 'B1', state: 'AVAILABLE' },
    { id: 'B2', state: 'OCCUPIED' },
  ]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('A2');

  // State for modal & toast interaction
  const [activeFacilityModal, setActiveFacilityModal] = useState<ParkingFacility | null>(null);
  const [toastState, setToastState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  // Filter facilities based on search and active tab
  const filteredFacilities = useMemo(() => {
    return MOCK_FACILITIES.filter((facility) => {
      // Search query filter
      const matchesSearch =
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        facility.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Zone filter
      const matchesZone = selectedZone === 'ALL' || facility.zone.includes(selectedZone);

      // Category tab filter
      if (!matchesSearch || !matchesZone) return false;
      if (activeTab === 'available') return facility.status === 'AVAILABLE';
      if (activeTab === 'ev') return facility.evCharging;
      if (activeTab === 'covered') return facility.covered;
      return true;
    });
  }, [searchQuery, activeTab, selectedZone]);

  // Handle slot click in telemetry preview
  const handleSlotClick = (id: string) => {
    setSelectedSlotId(id);
    setDemoSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          return {
            ...slot,
            state: slot.state === 'SELECTED' ? 'AVAILABLE' : 'SELECTED',
          };
        }
        return slot;
      })
    );
    setToastState({
      isOpen: true,
      message: `Bay ${id} selected. Reservation hold active for 10 minutes.`,
      type: 'success',
    });
  };

  // Facility reservation trigger
  const handleReserveFacility = (facility: ParkingFacility) => {
    setToastState({
      isOpen: true,
      message: `Reserved 1 bay at ${facility.name}. Confirmation sent to vehicle unit.`,
      type: 'success',
    });
    if (activeFacilityModal) {
      setActiveFacilityModal(null);
    }
  };

  const quickLocations = ['Cyber City', 'Central Metro', 'TechPark', 'Financial Plaza', 'Galleria Mall'];

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-smartBg flex items-center justify-center font-mono text-xs text-smartTextSecondary">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 selection:bg-signature selection:text-smartBg relative overflow-x-hidden">
      {/* Spatial Background Mesh & Dot Grids */}
      <div className="absolute inset-0 spatial-grid-dots opacity-35 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-signature/5 blur-[180px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-aiBlue/5 blur-[200px] rounded-full pointer-events-none z-0" />

      {/* Header Navigation */}
      <Header />

      {/* Main Page Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-12 relative z-10 space-y-20">
        
        {/* ─────────────────────────────────────────────────────────────
           1. HERO & DESTINATION SEARCH CONSOLE
        ───────────────────────────────────────────────────────────── */}
        <section className="text-center max-w-4xl mx-auto pt-4 sm:pt-8">
          
          {/* Live System Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-smartSurface border border-smartBorder/80 mb-6 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-smartTextPrimary">
              SYSTEM ONLINE · 348 BAYS AVAILABLE IN METRO REGION
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Parking, <span className="text-signature">before</span> you arrive.
          </h1>

          <p className="font-sans text-sm sm:text-base lg:text-lg text-smartTextSecondary max-w-2xl mx-auto mt-6 leading-relaxed">
            SmartPark AI is a spatial mobility intelligence layer. Predict real-time parking availability, reserve optimal bays, and navigate seamlessly before your tires touch the ramp.
          </p>

          {/* Interactive Search Console Box */}
          <div className="mt-10 bg-smartSurface/80 border border-smartBorder rounded-smart-lg p-4 sm:p-6 shadow-2xl backdrop-blur-md text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-signature" />
                <span className="text-xs font-mono font-semibold text-smartTextPrimary uppercase tracking-wider">
                  Destination & Spatial Search Console
                </span>
              </div>
              <span className="text-[10px] font-mono text-smartTextSecondary">
                PRECISION: 15m GPS
              </span>
            </div>

            {/* Main Input Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Enter destination, area, building name, or zone (e.g. Cyber City, Gate 3)…"
                  className="h-11 text-sm bg-smartBg/70 border-smartBorder focus:border-signature"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="h-11 w-full bg-smartBg/70 border border-smartBorder rounded-smart px-3 text-xs font-sans text-smartTextPrimary outline-none focus:border-signature/60 transition-colors"
                  aria-label="Filter by zone"
                >
                  <option value="ALL">All Zones</option>
                  <option value="Zone A">Zone A — Commercial/Enterprise</option>
                  <option value="Zone B">Zone B — Transit Hub</option>
                  <option value="Zone C">Zone C — Retail/Mall</option>
                  <option value="Zone D">Zone D — Outer Ring</option>
                </select>

                <Button
                  variant="primary"
                  size="lg"
                  className="h-11 px-5 text-xs uppercase tracking-wider font-semibold shrink-0"
                  onClick={() => {
                    if (filteredFacilities.length > 0) {
                      setToastState({
                        isOpen: true,
                        message: `Found ${filteredFacilities.length} facilities matching "${searchQuery || selectedZone}".`,
                        type: 'info',
                      });
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Filter Location Pills */}
            <div className="mt-4 pt-3 border-t border-smartBorder/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-smartTextSecondary font-mono">Popular:</span>
                {quickLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSearchQuery(loc)}
                    className={`text-[11px] px-2.5 py-1 rounded-smart-sm border transition-colors ${
                      searchQuery === loc
                        ? 'bg-signature/15 border-signature text-signature font-medium'
                        : 'bg-smartBg/50 border-smartBorder/60 text-smartTextSecondary hover:text-smartTextPrimary hover:border-smartBorder'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedZone('ALL');
                  }}
                  className="text-[11px] text-signature hover:underline font-mono"
                >
                  Reset filters ({filteredFacilities.length} results)
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
           2. LIVE PARKING AVAILABILITY METRICS
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-signature">
                Real-Time Telemetry
              </span>
              <h2 className="text-lg font-semibold font-display text-smartTextPrimary uppercase tracking-wider">
                Metro Regional Metrics
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-smartTextSecondary block">
                LAST REFRESH: JUST NOW
              </span>
              <span className="text-xs font-mono font-semibold text-available">
                ● 100% SENSORS ACTIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_METRICS.map((metric, idx) => (
              <MetricCard
                key={idx}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                trend={metric.trend}
                icon={
                  idx === 0 ? (
                    <Car className="h-4 w-4 text-signature" />
                  ) : idx === 1 ? (
                    <Activity className="h-4 w-4 text-aiBlue" />
                  ) : idx === 2 ? (
                    <Clock className="h-4 w-4 text-available" />
                  ) : (
                    <Cpu className="h-4 w-4 text-limited" />
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
           3. SMARTPARK INTELLIGENCE RECOMMENDATION PANEL & SPATIAL SIMULATION
        ───────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: AI Recommendation Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <AIInsight
              title={filteredFacilities[0]?.name || 'Cyber City Innovation Hub Garage'}
              recommendation="Selected by neural allocator based on current arrival trajectory, 90-sec walking radius, and fast EV charging availability."
              confidence="96.8%"
              durationMinutes={`${filteredFacilities[0]?.walkMinutes || 4} min walk`}
              ratePerHour={filteredFacilities[0]?.ratePerHour || '₹40/hr'}
              demandTrend="Demand Index: Stable. 48 bays open on Level 2."
              reasons={[
                'Direct indoor skywalk to Main Tower Entrance',
                'Guaranteed rate lock for 120 minutes',
                'ANPR automatic barrier entry ready',
              ]}
              actionText="Reserve Recommended Bay"
              onAction={() =>
                handleReserveFacility(
                  filteredFacilities[0] || MOCK_FACILITIES[0]
                )
              }
            />
          </div>

          {/* Right Column: Live Interactive Bay Layout Telemetry */}
          <div className="lg:col-span-7 bg-smartSurface/70 border border-smartBorder rounded-smart-lg p-6 sm:p-8 spatial-grid-lines flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Layers className="h-48 w-48 text-smartTextSecondary" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature">
                    Level 2 Spatial Simulation
                  </span>
                  <h3 className="text-sm font-semibold font-display text-smartTextPrimary uppercase tracking-wider mt-0.5">
                    Live Bay Occupancy Grid
                  </h3>
                </div>
                <StatusBadge status="AVAILABLE" />
              </div>

              <p className="text-xs text-smartTextSecondary leading-relaxed font-sans">
                Interactive sensor telemetry layout for Cyber City Level 2. Click any available bay to test active slot reservation logic.
              </p>

              {/* Bay Layout Interactive Grid */}
              <div className="bg-smartBg/70 border border-smartBorder/60 rounded-smart p-6 flex flex-col items-center gap-6">
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  {demoSlots.map((slot) => (
                    <ParkingSlot
                      key={slot.id}
                      id={slot.id}
                      state={slot.id === selectedSlotId && slot.state !== 'OCCUPIED' ? 'SELECTED' : slot.state}
                      onClick={() => handleSlotClick(slot.id)}
                    />
                  ))}
                </div>

                <div className="text-[11px] font-mono text-smartTextSecondary bg-smartSurface/80 border border-smartBorder/40 px-3.5 py-2 rounded w-full text-center">
                  {selectedSlotId ? (
                    <span className="text-signature font-semibold">
                      Telemetry: Active Slot [{selectedSlotId}] — Sensor signal 100% optimal. Ready to lock.
                    </span>
                  ) : (
                    <span>Click on spot &ldquo;A2&rdquo; or &ldquo;B1&rdquo; to test slot dynamics.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Micro Technical Specs Footer */}
            <div className="grid grid-cols-3 gap-4 border-t border-smartBorder/60 pt-4 mt-6 text-center relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary block">Latency</span>
                <span className="font-mono text-xs font-semibold text-smartTextPrimary">11ms sync</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary block">Gate Protocol</span>
                <span className="font-mono text-xs font-semibold text-smartTextPrimary">ANPR v4.2</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-smartTextSecondary block">Grid Engine</span>
                <span className="font-mono text-xs font-semibold text-signature">Spatial R3F</span>
              </div>
            </div>
          </div>

        </section>

        {/* ─────────────────────────────────────────────────────────────
           4. REALISTIC PARKING FACILITY DIRECTORY
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-smartBorder/60 pb-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-signature">
                Verified Facilities Directory
              </span>
              <h2 className="text-2xl font-bold font-display text-smartTextPrimary tracking-tight">
                Nearby Parking Garages & Hubs
              </h2>
              <p className="text-xs text-smartTextSecondary mt-1">
                Showing {filteredFacilities.length} facilities matching your location and filter preferences.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="shrink-0">
              <Tabs
                tabs={[
                  { id: 'all', label: 'All Garages' },
                  { id: 'available', label: 'High Availability' },
                  { id: 'ev', label: 'EV Ready' },
                  { id: 'covered', label: 'Covered Decks' },
                ]}
                activeTab={activeTab}
                onChange={(id) => setActiveTab(id)}
              />
            </div>
          </div>

          {/* Facilities Cards Grid */}
          {filteredFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((facility) => {
                const occupancyPercent = Math.round(
                  ((facility.totalBays - facility.availableBays) / facility.totalBays) * 100
                );

                return (
                  <Card
                    key={facility.id}
                    variant="default"
                    padding="lg"
                    className="flex flex-col justify-between hover:border-smartBorder/90 transition-all duration-200 group relative"
                  >
                    <div>
                      {/* Card Header: Zone Tag & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-smartTextSecondary bg-smartElevated px-2 py-0.5 rounded border border-smartBorder/50">
                          {facility.zone}
                        </span>
                        <StatusBadge status={facility.status} />
                      </div>

                      {/* Facility Title & Address */}
                      <h3 className="font-display font-semibold text-base text-smartTextPrimary group-hover:text-white transition-colors">
                        {facility.name}
                      </h3>
                      <p className="text-xs text-smartTextSecondary flex items-center gap-1.5 mt-1 font-sans">
                        <MapPin className="h-3 w-3 text-smartTextSecondary shrink-0" />
                        {facility.location}
                      </p>

                      {/* Capacity Bar */}
                      <div className="mt-4 bg-smartBg/60 border border-smartBorder/40 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-smartTextSecondary">Occupancy:</span>
                          <span className="font-semibold text-smartTextPrimary">
                            {facility.availableBays} bays free / {facility.totalBays} total ({occupancyPercent}% filled)
                          </span>
                        </div>
                        <div className="w-full bg-smartBorder/50 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              facility.status === 'AVAILABLE'
                                ? 'bg-available'
                                : facility.status === 'LIMITED'
                                ? 'bg-limited'
                                : 'bg-occupied'
                            }`}
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-smartTextSecondary">
                          <Clock className="h-3.5 w-3.5 text-aiBlue" />
                          <span>{facility.walkMinutes} min walk ({facility.distanceKm} km)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-smartTextSecondary justify-end">
                          <Zap className="h-3.5 w-3.5 text-signature" />
                          <span className="font-semibold text-smartTextPrimary">{facility.ratePerHour}</span>
                        </div>
                      </div>

                      {/* Feature Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {facility.tags.map((tag, tIdx) => (
                          <Badge key={tIdx} variant="outline" className="text-[9px] font-mono">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-smartBorder/50">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[11px] font-mono uppercase"
                        onClick={() => setActiveFacilityModal(facility)}
                      >
                        Inspect Facility
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-[11px] font-mono uppercase font-semibold"
                        onClick={() => handleReserveFacility(facility)}
                      >
                        Reserve Spot
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="bg-smartSurface/50 border border-smartBorder rounded-smart-lg p-12 text-center space-y-3">
              <Filter className="h-8 w-8 text-smartTextSecondary mx-auto" />
              <h4 className="text-base font-semibold text-smartTextPrimary">No facilities match your search criteria</h4>
              <p className="text-xs text-smartTextSecondary max-w-sm mx-auto">
                Try clearing your search query or switching to &ldquo;All Garages&rdquo; to see all active parking hubs.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedZone('ALL');
                  setActiveTab('all');
                }}
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
           5. OCCUPANCY & DEMAND TELEMETRY VISUALIZER
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-smartSurface/40 border border-smartBorder rounded-smart-lg p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/60 pb-4">
            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-aiBlue">
                Spatial Capacity & Forecasting
              </span>
              <h2 className="text-xl font-bold font-display text-smartTextPrimary uppercase tracking-wider">
                Occupancy Telemetry & Demand Horizon
              </h2>
            </div>
            <span className="text-xs font-mono text-smartTextSecondary">
              MODEL: SMARTPARK PRED-NEURAL v2
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Level Breakdown Progress Bars */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-signature" />
                Level-Wise Bay Distribution
              </h3>

              <div className="space-y-3">
                {MOCK_TELEMETRY_LEVELS.map((lvl, idx) => (
                  <div key={idx} className="bg-smartBg/60 border border-smartBorder/40 p-3.5 rounded-smart space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-smartTextPrimary">{lvl.level}</span>
                      <span className="font-mono text-signature font-bold">{lvl.availableSlots} free bays</span>
                    </div>
                    
                    <div className="w-full bg-smartBorder/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-signature h-full rounded-full transition-all duration-300"
                        style={{ width: `${lvl.occupancyPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-smartTextSecondary">
                      <span>Occupied: {lvl.occupiedSlots} / {lvl.totalSlots}</span>
                      <span>{lvl.occupancyPercentage}% Load</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Demand Forecast Timeline */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-smartTextPrimary flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-limited" />
                Today&apos;s Demand Curve Forecast
              </h3>

              <div className="bg-smartBg/60 border border-smartBorder/40 p-4 rounded-smart space-y-4">
                <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
                  {MOCK_HOURLY_DEMAND.map((item, dIdx) => (
                    <div key={dIdx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full flex justify-center items-end h-full">
                        <div
                          className={`w-full max-w-[20px] rounded-t transition-all duration-300 ${
                            item.isPeak ? 'bg-limited' : 'bg-aiBlue'
                          }`}
                          style={{ height: `${item.occupancyPercent}%` }}
                          title={`${item.time}: ${item.occupancyPercent}% occupancy`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-smartTextSecondary">{item.time}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-smartBorder/40 pt-3 text-smartTextSecondary">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-aiBlue" />
                    <span>Normal Load</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-limited" />
                    <span>Predicted Peak Surge</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
           6. CLEAR "HOW SMARTPARK WORKS" SECTION
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-signature">
              Architecture & Workflow
            </span>
            <h2 className="text-3xl font-bold font-display text-smartTextPrimary tracking-tight">
              How SmartPark Works
            </h2>
            <p className="text-xs text-smartTextSecondary leading-relaxed">
              From arrival prediction to automated gate exit, SmartPark eliminates parking friction through precision sensor telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((item, idx) => (
              <Card
                key={idx}
                variant="elevated"
                padding="md"
                className="relative overflow-hidden border border-smartBorder/70 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-signature bg-signature/10 border border-signature/30 px-2 py-0.5 rounded">
                      STEP {item.step}
                    </span>
                    {idx === 0 ? (
                      <MapPin className="h-4 w-4 text-smartTextSecondary" />
                    ) : idx === 1 ? (
                      <Cpu className="h-4 w-4 text-aiBlue" />
                    ) : idx === 2 ? (
                      <ShieldCheck className="h-4 w-4 text-available" />
                    ) : (
                      <Zap className="h-4 w-4 text-limited" />
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-sm text-smartTextPrimary leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-smartTextSecondary leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-smartBorder/40 flex items-center justify-between text-[10px] font-mono text-smartTextSecondary">
                  <span>SYSTEM LATENCY</span>
                  <span className="text-smartTextPrimary font-semibold">&lt; 15ms</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
           7. FINAL CALL-TO-ACTION & FOOTER
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-smartSurface via-smartElevated to-smartSurface border border-smartBorder rounded-smart-lg p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 spatial-grid-dots opacity-20 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-signature bg-signature/10 border border-signature/30 px-3 py-1 rounded-full">
              Ready to park smarter?
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Reserve your parking bay before your wheels hit the road.
            </h2>

            <p className="text-xs sm:text-sm text-smartTextSecondary leading-relaxed max-w-xl mx-auto">
              Join thousands of smart commuters using SmartPark AI daily. Predict congestion, lock in rates, and drive straight to your spot.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/map">
                <Button variant="primary" size="lg" className="text-xs uppercase tracking-wider font-semibold px-6">
                  Launch Live Map
                </Button>
              </Link>
              <Link href="/intelligence">
                <Button variant="secondary" size="lg" className="text-xs uppercase tracking-wider font-semibold px-6">
                  Explore AI Intelligence
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="border-t border-smartBorder/60 pt-10 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-smartTextSecondary">
          <div>
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-smartTextPrimary">
              SmartPark<span className="text-signature">.</span>AI
            </span>
            <p className="text-[10px] text-smartTextSecondary mt-1">
              © {new Date().getFullYear()} SmartPark AI Technologies. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <Link href="/design-system" className="hover:text-signature transition-colors">
              Design System Showcase
            </Link>
            <span>·</span>
            <span className="text-available">API Status: Online</span>
            <span>·</span>
            <span className="opacity-70">v2.0.0 Stable</span>
          </div>
        </footer>

      </main>

      {/* ─────────────────────────────────────────────────────────────
         8. MODALS & TOAST NOTIFICATIONS
      ───────────────────────────────────────────────────────────── */}
      {/* Facility Inspector Modal */}
      <Modal
        isOpen={Boolean(activeFacilityModal)}
        onClose={() => setActiveFacilityModal(null)}
        title={activeFacilityModal?.name || 'Facility Inspector'}
        size="lg"
      >
        {activeFacilityModal && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-smartBorder/60 pb-3">
              <div>
                <span className="text-[10px] font-mono text-smartTextSecondary">ZONE CODE</span>
                <div className="text-xs font-mono font-semibold text-signature">{activeFacilityModal.zone}</div>
              </div>
              <StatusBadge status={activeFacilityModal.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-smartBg p-3 rounded border border-smartBorder/40">
                <span className="text-smartTextSecondary block text-[10px]">AVAILABLE BAYS</span>
                <span className="text-base font-bold text-smartTextPrimary">{activeFacilityModal.availableBays} / {activeFacilityModal.totalBays}</span>
              </div>
              <div className="bg-smartBg p-3 rounded border border-smartBorder/40">
                <span className="text-smartTextSecondary block text-[10px]">HOURLY RATE</span>
                <span className="text-base font-bold text-signature">{activeFacilityModal.ratePerHour}</span>
              </div>
              <div className="bg-smartBg p-3 rounded border border-smartBorder/40 col-span-2 sm:col-span-1">
                <span className="text-smartTextSecondary block text-[10px]">WALK ETA</span>
                <span className="text-base font-bold text-aiBlue">{activeFacilityModal.walkMinutes} mins ({activeFacilityModal.distanceKm} km)</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-smartTextPrimary uppercase">Features & Amenities</span>
              <div className="flex flex-wrap gap-2">
                {activeFacilityModal.tags.map((t, idx) => (
                  <Badge key={idx} variant="signature" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-smartBorder/60 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFacilityModal(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleReserveFacility(activeFacilityModal)}
              >
                Confirm Spot Hold
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Global Interactive Toast Feedback */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
