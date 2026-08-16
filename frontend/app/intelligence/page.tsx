'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Database, 
  Layers, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { StatusBadge, ParkingStatusType } from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/ui/MetricCard';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { 
  MOCK_REGIONS, 
  MOCK_INTELLIGENCE_FACILITIES, 
  IntelligenceFacility,
  RegionalSummary
} from '../../lib/intelligenceData';

export default function IntelligencePage() {
  // --- States ---
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [region, setRegion] = React.useState<string>('metro-central');
  const [forecastHorizon, setForecastHorizon] = React.useState<string>('60');
  const [priority, setPriority] = React.useState<string>('best-overall');
  const [selectedFacilityId, setSelectedFacilityId] = React.useState<string>('');
  const [sortKey, setSortKey] = React.useState<string>('recommendation');
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  // Toast state
  const [toastOpen, setToastOpen] = React.useState<boolean>(false);
  const [toastMsg, setToastMsg] = React.useState<string>('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  // Trigger toast helper
  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(message);
    setToastType(type);
    setToastOpen(true);
  };

  // --- Filter and data retrieval logic ---
  const activeRegionData = MOCK_REGIONS.find((r) => r.regionId === region) || MOCK_REGIONS[0];
  const facilitiesRaw = MOCK_INTELLIGENCE_FACILITIES[region] || [];

  // Simulate loading state on filters changes
  const handleFilterChange = (setter: (val: string) => void, val: string, filterName: string) => {
    setIsLoading(true);
    setter(val);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Intelligence filter: Updated ${filterName} to "${val}"`, 'info');
    }, 400);
  };

  // Sort and filter facilities list based on state
  const sortedFacilities = React.useMemo(() => {
    let list = [...facilitiesRaw];

    // Priority adjustments (virtually shifts weights for mock illustration)
    if (priority === 'availability') {
      list.sort((a, b) => b.availableBays - a.availableBays);
      return list;
    } else if (priority === 'distance') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
      return list;
    } else if (priority === 'price') {
      list.sort((a, b) => a.ratePerHour - b.ratePerHour);
      return list;
    }

    // Default sorting based on key
    list.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'recommendation') {
        comparison = a.recommendationScore - b.recommendationScore;
      } else if (sortKey === 'availability') {
        comparison = a.availableBays - b.availableBays;
      } else if (sortKey === 'distance') {
        comparison = a.distanceKm - b.distanceKm;
      } else if (sortKey === 'price') {
        comparison = a.ratePerHour - b.ratePerHour;
      } else if (sortKey === 'occupancy') {
        comparison = a.currentOccupancy - b.currentOccupancy;
      }

      return sortAsc ? comparison : -comparison;
    });

    return list;
  }, [facilitiesRaw, priority, sortKey, sortAsc]);

  // Set default selection to the highest recommended facility when region changes
  React.useEffect(() => {
    if (facilitiesRaw.length > 0) {
      // Find the highest recommended score
      const recommended = [...facilitiesRaw].sort((a, b) => b.recommendationScore - a.recommendationScore)[0];
      setSelectedFacilityId(recommended.id);
    }
  }, [region, facilitiesRaw]);

  const selectedFacility = sortedFacilities.find((f) => f.id === selectedFacilityId) || sortedFacilities[0];

  const handleFacilitySelect = (id: string, name: string) => {
    setSelectedFacilityId(id);
    showToast(`Focus target shifted to ${name}`, 'success');
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    showToast(`Sorting facilities by ${key}`, 'info');
  };

  // Helper mapping to status type
  const getStatusType = (occupancy: number): ParkingStatusType => {
    if (occupancy >= 90) return 'OCCUPIED';
    if (occupancy >= 70) return 'LIMITED';
    return 'AVAILABLE';
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-16 relative">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">
        
        {/* ==================================================
            1. PAGE HEADER & STATUS INDICATOR
           ================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-smartBorder/40 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-signature bg-signature/10 border border-signature/20 px-2 py-0.5 rounded-full uppercase">
                AI Engine Active
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-signature animate-pulse" />
              <span className="text-[10px] font-mono text-smartTextSecondary uppercase">
                v2.0-neural
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white">
              SmartPark Intelligence
            </h1>
            <p className="text-xs text-smartTextSecondary font-sans mt-0.5">
              Predict demand. Understand availability. Choose with confidence.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center">
            <span className="text-[10px] font-mono text-smartTextSecondary mb-1">
              SYSTEM STATUS: <span className="text-available">ONLINE</span>
            </span>
            <div className="bg-smartSurface/70 border border-smartBorder/60 px-3 py-1.5 rounded-md flex items-center gap-2">
              <Database className="h-3 w-3 text-aiBlue" />
              <span className="text-[9.5px] font-mono font-semibold text-smartTextPrimary uppercase tracking-wider">
                INTELLIGENCE PREVIEW · LIVE API INTEGRATION PENDING
              </span>
            </div>
            <span className="text-[9px] font-mono text-smartTextSecondary/60 mt-1">
              Last Refreshed: {mounted ? new Date().toLocaleTimeString() : '--:--:--'} (Local Feed)
            </span>
          </div>
        </div>

        {/* ==================================================
            2. INTERACTIVE FILTER PANEL
           ================================================== */}
        <Card variant="elevated" className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-smartElevated/40">
          <Select 
            label="Target Parking Region"
            value={region}
            onChange={(e) => handleFilterChange(setRegion, e.target.value, 'Region')}
            options={MOCK_REGIONS.map(r => ({ value: r.regionId, label: r.regionName }))}
          />

          <Select 
            label="Forecast Horizon"
            value={forecastHorizon}
            onChange={(e) => handleFilterChange(setForecastHorizon, e.target.value, 'Horizon')}
            options={[
              { value: '30', label: '30 Minutes Ahead' },
              { value: '60', label: '60 Minutes Ahead' },
              { value: '90', label: '90 Minutes Ahead' },
              { value: '120', label: '120 Minutes Ahead' }
            ]}
          />

          <Select 
            label="Optimized Dispatch Priority"
            value={priority}
            onChange={(e) => handleFilterChange(setPriority, e.target.value, 'Priority')}
            options={[
              { value: 'best-overall', label: 'Smart Recommendation (Best Overall)' },
              { value: 'availability', label: 'Maximum Availability' },
              { value: 'distance', label: 'Shortest Distance' },
              { value: 'price', label: 'Lowest Pricing' }
            ]}
          />
        </Card>

        {/* ==================================================
            3. SUMMARY METRICS ROW
           ================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, idx) => (
              <Card key={idx} variant="outlined" className="h-20 animate-pulse bg-smartSurface/40 border-smartBorder/45" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <MetricCard 
              label="Regional Occupancy"
              value={`${activeRegionData.occupancy}%`}
              trend={{ value: 'Real-time telemetry', direction: 'neutral' }}
              icon={<Activity className="h-3 w-3" />}
            />
            <MetricCard 
              label="Forecasted Occ."
              value={`${activeRegionData.predictedOccupancy}%`}
              trend={{ value: `+${forecastHorizon}m projection`, direction: activeRegionData.predictedOccupancy > activeRegionData.occupancy ? 'up' : 'down' }}
              icon={<TrendingUp className="h-3 w-3 text-signature" />}
            />
            <MetricCard 
              label="Demand Sector"
              value={activeRegionData.demandLevel}
              trend={{ value: 'Peak scaling active', direction: 'neutral' }}
              icon={<Clock className="h-3 w-3" />}
            />
            <MetricCard 
              label="Forecast Accuracy"
              value={`${activeRegionData.confidence}%`}
              trend={{ value: 'Confidence interval', direction: 'up' }}
              icon={<Shield className="h-3 w-3 text-aiBlue" />}
            />
            <MetricCard 
              label="Available Bays"
              value={activeRegionData.availableBays}
              unit="Bays"
              trend={{ value: 'In entire region', direction: 'neutral' }}
              icon={<Compass className="h-3.5 w-3.5 text-available" />}
            />
            <MetricCard 
              label="Search Time Saved"
              value={activeRegionData.searchTimeSavedMin}
              unit="min"
              trend={{ value: 'Average per trip', direction: 'up' }}
              icon={<Zap className="h-3 w-3 text-signature" />}
            />
          </div>
        )}

        {/* ==================================================
            4. AI RECOMMENDATION HERO PANEL
           ================================================== */}
        {selectedFacility && (
          <Card variant="default" className="relative overflow-hidden border border-signature/30 bg-gradient-to-r from-smartSurface via-smartSurface to-signature/5 p-6 sm:p-8">
            <div className="absolute top-0 right-0 h-40 w-40 bg-signature/5 blur-3xl rounded-full" />
            
            <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
              <div className="flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-signature bg-signature/10 border border-signature/30 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-signature fill-signature" />
                      SmartPark Recommends
                    </span>
                    <span className="text-[10.5px] font-mono text-aiBlue font-bold bg-aiBlue/10 border border-aiBlue/20 px-2 py-0.5 rounded">
                      {selectedFacility.recommendationScore}% MATCH
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-extrabold uppercase text-white tracking-wide">
                    {selectedFacility.name}
                  </h2>
                  <p className="text-xs text-smartTextSecondary flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {selectedFacility.zone} District &bull; {selectedFacility.distanceKm} km away &bull; {selectedFacility.walkMinutes} min walk
                  </p>
                </div>

                {/* Sub metrics inside hero */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-smartBg/60 border border-smartBorder/45 p-4 rounded-xl max-w-2xl">
                  <div>
                    <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Available Bays</span>
                    <span className="font-mono text-base font-bold text-available">{selectedFacility.availableBays} / {selectedFacility.totalBays}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Current Rate</span>
                    <span className="font-mono text-base font-bold text-white">₹{selectedFacility.ratePerHour}/hr</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Proj. Occupancy</span>
                    <span className="font-mono text-base font-bold text-signature">{selectedFacility.predictedOccupancy}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-smartTextSecondary block uppercase">Availability Trend</span>
                    <span className="text-[11.5px] font-mono text-available font-semibold block">Stable for {forecastHorizon} min</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/map">
                    <Button variant="primary" size="md" className="text-xs uppercase tracking-wider font-semibold group">
                      View Parking on Map
                      <ChevronRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  
                  <Link href={`/facility/${
                    selectedFacility.name.toLowerCase().includes('metro') ? 'metro-central-garage' :
                    selectedFacility.name.toLowerCase().includes('cyber') ? 'cyber-city-hub' :
                    selectedFacility.name.toLowerCase().includes('tech') ? 'techpark-parking' :
                    'financial-plaza-deck'
                  }`}>
                    <Button variant="secondary" size="md" className="text-xs uppercase tracking-wider font-semibold">
                      View Facility
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Reasons Why Checklist */}
              <div className="w-full lg:w-80 bg-smartElevated/50 border border-smartBorder/60 p-4 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold text-smartTextSecondary uppercase tracking-wider flex items-center gap-1 border-b border-smartBorder/40 pb-2">
                  <Info className="h-3 w-3 text-signature" />
                  Why this facility?
                </span>
                <div className="flex flex-col gap-2.5">
                  {selectedFacility.reasons.map((reason) => (
                    <div key={reason.id} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-signature shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-sans font-semibold text-smartTextPrimary">{reason.label}</h4>
                        <p className="text-[9.5px] font-sans text-smartTextSecondary">{reason.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ==================================================
            5. TWO-COLUMN ANALYTICS SECTION
               (OCCUPANCY INTELLIGENCE CHART + DEMAND TIMELINE)
           ================================================== */}
        {selectedFacility && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Occupancy Forecast Chart (SVG implementation) */}
            <Card variant="default" className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                  Occupancy Profile
                </span>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Current Occupancy & Predictions
                </h3>
              </div>

              {/* Visual SVG chart of forecast */}
              <div className="relative w-full h-48 bg-smartBg border border-smartBorder rounded-lg p-2 overflow-hidden flex flex-col justify-between">
                
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">80%</div>
                  <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">60%</div>
                  <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">40%</div>
                  <div className="border-b border-smartBorder/30 w-full text-[8px] font-mono text-smartTextSecondary/40 text-right">20%</div>
                </div>

                {/* SVG Polyline and Area */}
                <svg className="absolute inset-x-0 bottom-8 h-32 w-full px-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B7F34A" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#B7F34A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <path 
                    d={`
                      M 10,${100 - selectedFacility.occupancySnapshot.currentOccupancy} 
                      L 40,${100 - selectedFacility.occupancySnapshot.predicted30m} 
                      L 70,${100 - selectedFacility.occupancySnapshot.predicted60m} 
                      L 100,${100 - selectedFacility.occupancySnapshot.predicted120m}
                      L 100,100 L 10,100 Z
                    `} 
                    fill="url(#gradient-area)" 
                  />

                  {/* Main solid line (observed to predictions) */}
                  <path 
                    d={`
                      M 10,${100 - selectedFacility.occupancySnapshot.currentOccupancy} 
                      L 40,${100 - selectedFacility.occupancySnapshot.predicted30m} 
                    `} 
                    fill="none" 
                    stroke="#B7F34A" 
                    strokeWidth="2.5" 
                  />

                  {/* Predicted dashed line */}
                  <path 
                    d={`
                      M 40,${100 - selectedFacility.occupancySnapshot.predicted30m} 
                      L 70,${100 - selectedFacility.occupancySnapshot.predicted60m} 
                      L 100,${100 - selectedFacility.occupancySnapshot.predicted120m}
                    `} 
                    fill="none" 
                    stroke="#B7F34A" 
                    strokeWidth="2.5" 
                    strokeDasharray="4,4"
                  />

                  {/* Dot markers */}
                  <circle cx="10" cy={100 - selectedFacility.occupancySnapshot.currentOccupancy} r="4" fill="#0A0C0E" stroke="#B7F34A" strokeWidth="2" />
                  <circle cx="40" cy={100 - selectedFacility.occupancySnapshot.predicted30m} r="4" fill="#0A0C0E" stroke="#B7F34A" strokeWidth="2" />
                  <circle cx="70" cy={100 - selectedFacility.occupancySnapshot.predicted60m} r="4" fill="#0A0C0E" stroke="#B7F34A" strokeWidth="2" />
                  <circle cx="100" cy={100 - selectedFacility.occupancySnapshot.predicted120m} r="4" fill="#0A0C0E" stroke="#B7F34A" strokeWidth="2" />
                </svg>

                {/* X Axis labels */}
                <div className="w-full flex justify-between px-6 pt-36 text-[9px] font-mono text-smartTextSecondary z-10 select-none">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">Now</span>
                    <span>{selectedFacility.occupancySnapshot.currentOccupancy}% Occ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-signature/80 font-bold">+30 Min</span>
                    <span>{selectedFacility.occupancySnapshot.predicted30m}% Occ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-signature font-bold">+60 Min</span>
                    <span>{selectedFacility.occupancySnapshot.predicted60m}% Occ</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-signature font-bold">+120 Min</span>
                    <span>{selectedFacility.occupancySnapshot.predicted120m}% Occ</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono bg-smartElevated px-3 py-2 rounded">
                <span className="text-smartTextSecondary">
                  Observed status vs Projections. Accent line is forecast horizon boundary.
                </span>
                <span className="text-signature uppercase font-semibold">
                  Forecast indicates rising demand over the next 90 minutes.
                </span>
              </div>
            </Card>

            {/* Column 2: Demand Horizon Hourly Timeline */}
            <Card variant="default" className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-aiBlue block">
                  Temporal Trends
                </span>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Demand Horizon Timeline
                </h3>
              </div>

              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-56 pr-2">
                {selectedFacility.hourlyForecast.map((point, index) => {
                  const isCurrentTime = index === 2; // Let's mock third index as "now"
                  const demandColors = {
                    LOW: 'text-available bg-available/10 border-available/20',
                    MODERATE: 'text-smartTextPrimary bg-smartSurface border-smartBorder',
                    HIGH: 'text-limited bg-limited/10 border-limited/20',
                    'VERY HIGH': 'text-occupied bg-occupied/10 border-occupied/20'
                  };

                  return (
                    <div 
                      key={point.time} 
                      className={`flex items-center justify-between border rounded px-3 py-1.5 transition-colors ${
                        isCurrentTime 
                          ? 'border-signature bg-signature/5 font-bold' 
                          : 'border-smartBorder/50 bg-smartBg/40 hover:bg-smartElevated/25'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white">{point.time}</span>
                        {isCurrentTime && (
                          <span className="text-[8.5px] font-mono text-signature border border-signature/30 px-1 rounded uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10.5px] font-mono text-smartTextSecondary">
                            {point.occupancyPercent}% Occ &bull; {point.availableBays} bays
                          </span>
                        </div>
                        
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
        )}

        {/* ==================================================
            6. FACILITY COMPARISON TABLE
           ================================================== */}
        <div id="comparison-section" className="scroll-mt-24">
          <Card variant="default" className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-smartBorder/45 pb-3">
              <div>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Facility Intelligence Comparison
                </h3>
                <p className="text-[11px] font-sans text-smartTextSecondary">
                  Compare availability, distance, pricing, and AI dispatch suitability index.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10.5px] font-mono text-smartTextSecondary">
                <SlidersHorizontal className="h-3.5 w-3.5 text-signature" />
                <span>Click headers to sort values</span>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-smartBorder/60 text-smartTextSecondary font-semibold uppercase tracking-wider select-none text-[9.5px] font-mono">
                    <th className="py-2.5 px-3">Facility Details</th>
                    <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('occupancy')}>
                      <div className="flex items-center gap-1">
                        Current Occupancy <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('availability')}>
                      <div className="flex items-center gap-1">
                        Available Bays <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('distance')}>
                      <div className="flex items-center gap-1">
                        Distance <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('price')}>
                      <div className="flex items-center gap-1">
                        Rate/hr <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                    <th className="py-2.5 px-2">Confidence</th>
                    <th className="py-2.5 px-2 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('recommendation')}>
                      <div className="flex items-center gap-1 justify-end">
                        AI Score <ArrowUpDown className="h-3 w-3 shrink-0" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-smartBorder/30">
                  {sortedFacilities.map((facility) => {
                    const isSelected = selectedFacilityId === facility.id;
                    const isBest = facility.recommendationScore >= 95;

                    return (
                      <tr 
                        key={facility.id}
                        className={`group transition-colors cursor-pointer text-[11px] ${
                          isSelected 
                            ? 'bg-signature/5 font-semibold border-l-2 border-signature' 
                            : 'hover:bg-smartElevated/35'
                        }`}
                        onClick={() => handleFacilitySelect(facility.id, facility.name)}
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {isBest && (
                                <span className="text-[8.5px] font-mono text-signature font-bold border border-signature/40 bg-signature/10 px-1 rounded uppercase mr-1">
                                  Rec
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-display font-medium text-white group-hover:text-signature transition-colors">{facility.name}</div>
                              <div className="text-[10px] text-smartTextSecondary flex items-center gap-1 mt-0.5">
                                {facility.tags.slice(0, 2).join(' · ')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status={getStatusType(facility.currentOccupancy)} showDot={false} />
                            <span className="font-mono text-smartTextSecondary">{facility.currentOccupancy}% filled</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-mono text-white">{facility.availableBays} bays</td>
                        <td className="py-3 px-2 font-mono text-smartTextSecondary">
                          {facility.distanceKm} km ({facility.walkMinutes} min walk)
                        </td>
                        <td className="py-3 px-2 font-mono text-white">₹{facility.ratePerHour}/hr</td>
                        <td className="py-3 px-2 font-mono text-smartTextSecondary">{facility.forecastConfidence}%</td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-signature">
                          {facility.recommendationScore}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ==================================================
            7. AVAILABILITY OUTLOOK & REASONING DETAILS
           ================================================== */}
        {selectedFacility && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Outlook Block */}
            <Card variant="default" className="lg:col-span-1 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                  Projection Timeline
                </span>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Availability Outlook
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-smartBorder/45 pb-1">
                  <span className="text-[11px] text-smartTextSecondary">Horizon</span>
                  <span className="text-[11px] text-smartTextSecondary">Predicted Status</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span>Current Status</span>
                  <StatusBadge status={getStatusType(selectedFacility.currentOccupancy)} />
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span>Next 30 Minutes</span>
                  <StatusBadge status={getStatusType(selectedFacility.occupancySnapshot.predicted30m)} />
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span>Next 60 Minutes</span>
                  <StatusBadge status={getStatusType(selectedFacility.occupancySnapshot.predicted60m)} />
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span>Next 120 Minutes</span>
                  <StatusBadge status={getStatusType(selectedFacility.occupancySnapshot.predicted120m)} />
                </div>
              </div>

              <p className="text-[10px] text-smartTextSecondary/80 leading-relaxed bg-smartBg p-2.5 rounded border border-smartBorder/60 font-mono mt-2">
                * Arrival after 60 minutes may result in reduced availability. Plan itinerary accordingly.
              </p>
            </Card>

            {/* Why Chosen Ranked Block */}
            <Card variant="default" className="lg:col-span-2 flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-signature block">
                  Algorithmic Dispatch
                </span>
                <h3 className="text-sm font-display font-semibold uppercase text-white">
                  Why SmartPark Chose This
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <div className="flex gap-2.5 items-start">
                  <span className="font-mono text-xl font-bold text-signature">01</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Availability Window</h4>
                    <p className="text-[10.5px] text-smartTextSecondary">High predicted availability at approximate arrival timestamp.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="font-mono text-xl font-bold text-signature">02</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Optimal Distance</h4>
                    <p className="text-[10.5px] text-smartTextSecondary">Only {selectedFacility.distanceKm} km away, ensuring minimal walking connection time.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="font-mono text-xl font-bold text-signature">03</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Pricing Matches</h4>
                    <p className="text-[10.5px] text-smartTextSecondary">₹{selectedFacility.ratePerHour}/hr rate is within configured priority threshold values.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="font-mono text-xl font-bold text-signature">04</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Facility Preference</h4>
                    <p className="text-[10.5px] text-smartTextSecondary">{selectedFacility.covered ? 'Matches covered deck preference.' : 'Uncovered space matches open lot priority.'}</p>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* ==================================================
            8. REGIONAL OVERVIEW GRID
           ================================================== */}
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-smartTextSecondary block mb-2">
            Zone Dispatch Switcher
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {MOCK_REGIONS.map((reg) => {
              const isActive = reg.regionId === region;
              return (
                <Card 
                  key={reg.regionId} 
                  variant={isActive ? 'default' : 'outlined'} 
                  className={`cursor-pointer transition-colors p-4 ${
                    isActive 
                      ? 'border-signature/40 bg-signature/[0.02]' 
                      : 'hover:bg-smartElevated/30 hover:border-smartBorder'
                  }`}
                  onClick={() => handleFilterChange(setRegion, reg.regionId, 'Region')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-xs font-semibold text-white">{reg.regionName}</span>
                    <span className={`text-[8.5px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                      reg.demandLevel === 'VERY HIGH' ? 'text-occupied border-occupied/30 bg-occupied/5' :
                      reg.demandLevel === 'HIGH' ? 'text-limited border-limited/30 bg-limited/5' : 'text-available border-available/30 bg-available/5'
                    }`}>
                      {reg.demandLevel}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2.5">
                    <span className="text-[10px] font-mono text-smartTextSecondary">Avg Occ: {reg.occupancy}%</span>
                    <span className="text-[10.5px] font-mono font-semibold text-signature">{reg.availableBays} bays</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ==================================================
            9. STATUS / SYSTEM TRANSPARENCY PANEL
           ================================================== */}
        <Card variant="outlined" className="bg-smartSurface/20 border-smartBorder/45 flex flex-col md:flex-row justify-between gap-4 p-4 text-[10px] font-mono text-smartTextSecondary mt-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-white font-bold uppercase tracking-wider">Intelligence status transparency report</span>
            <span>Current Workspace Mode: Predictive intelligence simulation (local client model).</span>
            <span>Local Dataset Seed: static_08_15_2026_regional_telemetry.</span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            <div>
              <span className="text-white">AI SERVICE:</span>
              <span className="text-limited font-bold ml-1">FASTAPI INTEGRATION PENDING</span>
            </div>
            <div>
              <span className="text-white">DATABASE LAYER:</span>
              <span className="text-limited font-bold ml-1">LOCAL MEMORY FALLBACK</span>
            </div>
            <div>
              <span className="text-white">TELEMETRY DECK:</span>
              <span className="text-available font-bold ml-1">MOCK SEED TELEMETRY GENERATOR</span>
            </div>
          </div>
        </Card>

      </main>

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
