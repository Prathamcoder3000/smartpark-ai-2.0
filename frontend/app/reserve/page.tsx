'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Car,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Navigation,
  Info,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { Header } from '../../components/ui/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge, ParkingStatusType } from '../../components/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { ParkingSlot, ParkingSlotState } from '../../components/ui/ParkingSlot';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  MOCK_FACILITY_DETAILS,
  FacilityDetails,
  FacilityFloor,
  FacilitySlot
} from '../../lib/facilityData';
import {
  VehicleOption,
  calculatePricing,
  ReservationSelection,
  ReservationSummary
} from '../../lib/reservationData';
import { api, BASE_URL } from '../../lib/api';
import { authService } from '../../lib/auth';

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

export default function ReservePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(true);

  const initialFacilitySlug = searchParams?.get('facility') || '';
  const initialSlotId = searchParams?.get('slot') || '';
  const initialFloorId = searchParams?.get('floor') || '';

  const [vehicles, setVehicles] = React.useState<VehicleOption[]>([]);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = React.useState(false);
  const [newVehLabel, setNewVehLabel] = React.useState('');
  const [newVehReg, setNewVehReg] = React.useState('');
  const [newVehType, setNewVehType] = React.useState('EV');

  const [facilitiesList, setFacilitiesList] = React.useState<FacilityDetails[]>(MOCK_FACILITY_DETAILS);
  const [selectedFacilityId, setSelectedFacilityId] = React.useState('');
  const [reservationDate, setReservationDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [duration, setDuration] = React.useState(2);
  const [activeFloorTab, setActiveFloorTab] = React.useState('');
  const [selectedSlotId, setSelectedSlotId] = React.useState('');
  const [selectedVehicleId, setSelectedVehicleId] = React.useState('');

  const [prefEvCharging, setPrefEvCharging] = React.useState(false);
  const [prefCoveredParking, setPrefCoveredParking] = React.useState(false);
  const [prefShorterWalk, setPrefShorterWalk] = React.useState(false);

  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const loadFacilityDetails = async (facId: string) => {
    try {
      const backendId = mapIdToBackend(facId);
      
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
          status: (facJson.data.availabilitySummary.available > 0 ? 'AVAILABLE' : 'LIMITED') as ParkingStatusType,
          floors
        };

        setFacilitiesList(prev => prev.map(f => f.id === facId || mapIdToBackend(f.id) === backendId ? currentFacilityDetails : f));
      }
    } catch (err) {
      console.error('Failed to load facility detailed slots:', err);
    }
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user vehicles
      const vRes = await api.get('/api/vehicles');
      if (vRes.success && Array.isArray(vRes.data)) {
        const mappedVeh: VehicleOption[] = vRes.data.map((v: any) => ({
          id: v.id,
          label: `${v.make} ${v.model}`,
          registration: v.licensePlate,
          type: v.isEV ? 'EV' : 'GAS',
          isDefault: v.isDefault || false
        }));
        setVehicles(mappedVeh);
        if (mappedVeh.length > 0) {
          setSelectedVehicleId(mappedVeh[0].id);
        }
      }

      // Fetch facilities list summary
      const fRes = await api.get('/api/facilities');
      if (fRes.success && Array.isArray(fRes.data)) {
        const mappedFac = MOCK_FACILITY_DETAILS.map(template => {
          const apiF = fRes.data.find((item: any) => item.id === mapIdToBackend(template.id));
          if (!apiF) return template;
          return {
            ...template,
            availableBays: apiF.availableSlots,
            totalBays: apiF.totalCapacity,
          };
        });

        setFacilitiesList(mappedFac);

        // Resolve selected facility
        let defaultFacId = mappedFac[0].id;
        if (initialFacilitySlug) {
          const match = mappedFac.find(
            (f) => f.slug === initialFacilitySlug || f.id === initialFacilitySlug || mapIdToBackend(f.id) === mapIdToBackend(initialFacilitySlug)
          );
          if (match) defaultFacId = match.id;
        }

        setSelectedFacilityId(defaultFacId);
        await loadFacilityDetails(defaultFacId);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Failed to sync checkout metadata.', 'error');
    } finally {
      setLoading(false);
    }
  }, [initialFacilitySlug]);

  React.useEffect(() => {
    const authed = authService.isAuthenticated();
    if (!authed) {
      router.push('/login');
    } else {
      loadData();
    }
  }, [router, loadData]);

  React.useEffect(() => {
    if (selectedFacilityId) {
      loadFacilityDetails(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  React.useEffect(() => {
    if (initialSlotId) {
      setSelectedSlotId(initialSlotId);
    }
  }, [initialSlotId]);

  const facility = React.useMemo(() => {
    return facilitiesList.find(
      (f) => f.slug === selectedFacilityId || f.id === selectedFacilityId
    );
  }, [selectedFacilityId, facilitiesList]);

  const activeFloor = React.useMemo(() => {
    if (!facility) return null;
    return facility.floors.find((f) => f.id === activeFloorTab) || facility.floors[0];
  }, [facility, activeFloorTab]);

  const pricing = React.useMemo(() => {
    if (!facility) {
      return { baseAmount: 0, serviceFee: 0, convenienceFee: 0, discount: 0, totalAmount: 0 };
    }
    const base = facility.hourlyRate * duration;
    return {
      baseAmount: base,
      serviceFee: 10,
      convenienceFee: 5,
      discount: 0,
      totalAmount: base + 15
    };
  }, [facility, duration]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehLabel.trim() || !newVehReg.trim()) {
      triggerToast('Label and registration are required.', 'error');
      return;
    }

    try {
      const parts = newVehLabel.split(' ');
      const make = parts[0] || 'Generic';
      const model = parts.slice(1).join(' ') || 'Car';

      const res = await api.post('/api/vehicles', {
        licensePlate: newVehReg.toUpperCase(),
        make,
        model,
        isEV: newVehType === 'EV'
      });

      if (res.success) {
        triggerToast('Vehicle registered successfully.', 'success');
        setNewVehLabel('');
        setNewVehReg('');
        setAddVehicleModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      triggerToast(err.message || 'Failed to add vehicle.', 'error');
    }
  };

  const aiRecommendation = React.useMemo(() => {
    if (!activeFloor || activeFloor.slots.length === 0) return null;
    let slot = activeFloor.slots.find((s) => s.state === 'AVAILABLE');
    if (prefEvCharging) {
      const evSlot = activeFloor.slots.find((s) => s.state === 'AVAILABLE' && s.isEV);
      if (evSlot) slot = evSlot;
    }
    if (!slot) return null;
    const shortId = slot.id.split('-').pop() || slot.id;
    return {
      slotId: slot.id,
      shortId,
      score: 95 + (prefCoveredParking ? 2 : 0) + (prefShorterWalk ? 1 : 0),
      reason: `Slot ${shortId} on Floor ${activeFloor.id} matches your preferences for location, rate, and safety profiles.`
    };
  }, [activeFloor, prefEvCharging, prefCoveredParking, prefShorterWalk]);

  const handleApplyRecommended = () => {
    if (aiRecommendation) {
      setSelectedSlotId(aiRecommendation.slotId);
      triggerToast(`Selected recommended slot: ${aiRecommendation.shortId}`, 'success');
    }
  };

  const validateAndProceed = () => {
    if (!selectedFacilityId) {
      triggerToast('Please select a parking facility.', 'error');
      return;
    }
    if (!reservationDate) {
      triggerToast('Please select a reservation date.', 'error');
      return;
    }
    if (!startTime) {
      triggerToast('Please select a start time.', 'error');
      return;
    }
    if (!selectedSlotId) {
      triggerToast('Please select an available parking slot.', 'error');
      return;
    }
    if (!selectedVehicleId) {
      triggerToast('Please select a vehicle profile.', 'error');
      return;
    }
    setStep(2);
  };

  const handleConfirmReservation = async () => {
    if (!facility || !activeFloor) return;

    try {
      const startHour = parseInt(startTime.split(':')[0]) || 9;
      const startD = new Date(reservationDate);
      startD.setHours(startHour, 0, 0, 0);
      const endD = new Date(startD.getTime() + duration * 60 * 60 * 1000);

      const res = await api.post('/api/reservations', {
        facilityId: mapIdToBackend(facility.id),
        slotId: selectedSlotId,
        vehicleId: selectedVehicleId,
        startTime: startD.toISOString(),
        endTime: endD.toISOString(),
        price: pricing.totalAmount
      });

      if (res.success) {
        const selection: ReservationSelection = {
          facilityId: selectedFacilityId,
          date: reservationDate,
          startTime,
          duration,
          floorId: activeFloorTab,
          slotId: selectedSlotId,
          vehicleId: selectedVehicleId,
          preferences: {
            evCharging: prefEvCharging,
            coveredParking: prefCoveredParking,
            shorterWalk: prefShorterWalk
          }
        };

        const floorObj = facility.floors?.find((fl: any) => fl.id === activeFloorTab);
        const floorLabel = floorObj?.label || activeFloorTab;

        const summary: ReservationSummary = {
          selection,
          facility: {
            id: facility.id,
            name: facility.name,
            zone: facility.zone,
            address: facility.address,
            distanceKm: facility.distanceKm,
            walkingEta: facility.walkingEta,
            hasEv: facility.hasEv,
            hourlyRate: facility.hourlyRate,
            availableBays: facility.availableBays,
            totalBays: facility.totalBays,
            occupancyPct: facility.occupancyPct || 0,
            rating: facility.rating,
            dailyRate: facility.dailyRate,
            isCovered: facility.isCovered
          },
          floorLabel,
          pricing,
          reference: res.data.id || 'SP-DEMO',
          createdAt: new Date().toISOString()
        };

        sessionStorage.setItem('smartpark_prototype_reservation', JSON.stringify(summary));
        router.push('/reserve/confirmation');
      }
    } catch (err: any) {
      triggerToast(err.message || 'Reservation failed. Slot may have been booked.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 select-none">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
          <div className="h-12 bg-smartSurface animate-pulse border border-smartBorder rounded-smart w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
              <div className="h-44 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
            </div>
            <div className="h-72 bg-smartSurface animate-pulse border border-smartBorder rounded-smart" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-left">
        
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center border-b border-smartBorder/40 pb-5 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-white flex items-center gap-2">
              <span className="text-signature">0{step}</span> 
              {step === 1 ? 'Configure Parking Spot' : 'Review Permit Checkout'}
            </h1>
            <p className="text-[10.5px] text-smartTextSecondary mt-0.5 font-sans">
              {step === 1 ? 'Configure timing limits, slots selection, and authorize plate profiles.' : 'Verify convenience fees, pricing summaries, and check out.'}
            </p>
          </div>

          <div className="flex gap-1.5 font-mono text-[9px]">
            <span className={`px-2 py-0.5 rounded ${step === 1 ? 'bg-signature text-black font-bold' : 'bg-smartSurface text-smartTextSecondary'}`}>1. PARAMS</span>
            <span className={`px-2 py-0.5 rounded ${step === 2 ? 'bg-signature text-black font-bold' : 'bg-smartSurface text-smartTextSecondary'}`}>2. CHECKOUT</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Config Panel */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              <Card className="flex flex-col gap-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary border-b border-smartBorder/30 pb-2 flex items-center justify-between">
                  <span>1. Facility & Duration Params</span>
                  <Badge variant="signature">Live Grid Sync</Badge>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Select Target Facility"
                    value={selectedFacilityId}
                    onChange={(e) => {
                      setSelectedFacilityId(e.target.value);
                      setSelectedSlotId('');
                      const match = facilitiesList.find(f => f.id === e.target.value);
                      if (match) setActiveFloorTab(match.floors[0].id);
                    }}
                    options={facilitiesList.map((f) => ({ value: f.id, label: f.name }))}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      label="Date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      required
                    />
                    <Select
                      label="Start Time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      options={Array.from({ length: 24 }).map((_, i) => {
                        const val = `${i.toString().padStart(2, '0')}:00`;
                        return { value: val, label: val };
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-smartTextSecondary uppercase">Duration (Hours)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full accent-signature h-1 bg-smartBg rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-xs text-white font-bold w-12 shrink-0 text-right">{duration} hrs</span>
                    </div>
                  </div>

                  <div className="bg-smartBg/60 border border-smartBorder/30 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-smartTextSecondary">Estimated Rate:</span>
                    <span className="font-bold text-signature">₹{facility?.hourlyRate || 0} / hr</span>
                  </div>
                </div>
              </Card>

              {/* Preferences Filter */}
              <Card className="flex flex-col gap-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary border-b border-smartBorder/30 pb-2">
                  2. User Preferences (AI Recommender Inputs)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-2.5 border p-3 rounded-lg cursor-pointer select-none transition-all ${prefEvCharging ? 'border-signature/50 bg-signature/5 text-white' : 'border-smartBorder bg-smartSurface text-smartTextSecondary'}`}>
                    <input type="checkbox" checked={prefEvCharging} onChange={(e) => { setPrefEvCharging(e.target.checked); setSelectedSlotId(''); }} className="accent-signature" />
                    <div>
                      <span className="text-[11px] font-bold block">EV Fast Charger</span>
                      <span className="text-[9px] opacity-80 block font-mono">Requires plug slot</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 border p-3 rounded-lg cursor-pointer select-none transition-all ${prefCoveredParking ? 'border-signature/50 bg-signature/5 text-white' : 'border-smartBorder bg-smartSurface text-smartTextSecondary'}`}>
                    <input type="checkbox" checked={prefCoveredParking} onChange={(e) => setPrefCoveredParking(e.target.checked)} className="accent-signature" />
                    <div>
                      <span className="text-[11px] font-bold block">Covered Deck</span>
                      <span className="text-[9px] opacity-80 block font-mono">Weather protection</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 border p-3 rounded-lg cursor-pointer select-none transition-all ${prefShorterWalk ? 'border-signature/50 bg-signature/5 text-white' : 'border-smartBorder bg-smartSurface text-smartTextSecondary'}`}>
                    <input type="checkbox" checked={prefShorterWalk} onChange={(e) => setPrefShorterWalk(e.target.checked)} className="accent-signature" />
                    <div>
                      <span className="text-[11px] font-bold block">Near Elevator</span>
                      <span className="text-[9px] opacity-80 block font-mono">Shorter walk time</span>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Slot Select Matrix */}
              <Card className="flex flex-col gap-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary border-b border-smartBorder/30 pb-2 flex justify-between items-center">
                  <span>3. Deck Level Slot Selection</span>
                  <Badge variant="signature">Live occupancy</Badge>
                </h3>

                {facility ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-1 overflow-x-auto pb-1 border-b border-smartBorder/30">
                      {facility.floors.map((floor) => (
                        <button
                          key={floor.id}
                          onClick={() => { setActiveFloorTab(floor.id); setSelectedSlotId(''); }}
                          className={`px-3 py-1.5 rounded-t text-[10px] font-mono uppercase tracking-wider transition-all border-b-2 ${
                            activeFloorTab === floor.id
                              ? 'border-signature text-signature bg-smartSurface font-bold'
                              : 'border-transparent text-smartTextSecondary hover:text-white'
                          }`}
                        >
                          {floor.label}
                        </button>
                      ))}
                    </div>

                    {activeFloor ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-[10px] text-smartTextSecondary font-sans">
                          {activeFloor.description}
                        </p>

                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-smartBg/70 p-4 rounded-xl border border-smartBorder/80 max-h-72 overflow-y-auto">
                          {activeFloor.slots.map((s) => {
                            const short = s.id.split('-').pop() || s.id;
                            const isSelected = selectedSlotId === s.id;
                            const isSlotEV = s.isEV;
                            const isDisabled = s.isDisabled;
                            const isOccupied = s.state === 'OCCUPIED';
                            const isReserved = s.state === 'RESERVED';

                            let bgClass = 'border-smartBorder hover:border-smartBorder/90 bg-smartSurface';
                            let textClass = 'text-white';

                            if (isDisabled) {
                              bgClass = 'border-smartBorder/30 bg-smartBg opacity-35 cursor-not-allowed';
                              textClass = 'text-smartTextSecondary';
                            } else if (isOccupied) {
                              bgClass = 'border-occupied/30 bg-occupied/10 cursor-not-allowed';
                              textClass = 'text-occupied';
                            } else if (isReserved) {
                              bgClass = 'border-aiBlue/30 bg-aiBlue/10 cursor-not-allowed';
                              textClass = 'text-aiBlue';
                            } else if (isSelected) {
                              bgClass = 'border-signature bg-signature/20 shadow-md shadow-signature/10';
                              textClass = 'text-signature font-bold';
                            } else if (isSlotEV) {
                              bgClass = 'border-available/40 bg-available/5 hover:border-available';
                              textClass = 'text-available';
                            }

                            return (
                              <button
                                key={s.id}
                                type="button"
                                disabled={isDisabled || isOccupied || isReserved}
                                onClick={() => setSelectedSlotId(s.id)}
                                className={`h-11 border rounded-smart-sm flex flex-col justify-center items-center text-[9px] font-mono transition-all relative ${bgClass} ${textClass}`}
                              >
                                <span>{short}</span>
                                {isSlotEV && <Zap className="h-2.5 w-2.5 mt-0.5 text-available shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-4 text-[9px] font-mono text-smartTextSecondary/80 pt-1 border-t border-smartBorder/30">
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-smartSurface border border-smartBorder" /> Available</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-signature/20 border border-signature" /> Selected</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-occupied/10 border border-occupied/30" /> Occupied</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-aiBlue/10 border border-aiBlue/30" /> Reserved</span>
                          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-smartBg border border-smartBorder/20 opacity-30" /> Disabled</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Card>

              {/* Vehicle Profiler */}
              <Card className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-smartBorder/30 pb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary">
                    4. Authorized Vehicle Profile
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddVehicleModalOpen(true)}
                    className="text-signature hover:text-signature/80 hover:bg-signature/5 font-mono text-[10px]"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    ADD VEHICLE
                  </Button>
                </div>

                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-4 border rounded-smart-lg text-left transition-all flex items-center justify-between gap-4 ${
                          selectedVehicleId === v.id
                            ? 'border-signature bg-signature/5 text-white'
                            : 'border-smartBorder bg-smartSurface text-smartTextSecondary hover:border-smartBorder/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Car className={`h-5 w-5 ${selectedVehicleId === v.id ? 'text-signature' : 'text-smartTextSecondary'}`} />
                          <div>
                            <span className="text-[11px] font-bold block">{v.label}</span>
                            <span className="text-[10px] font-mono opacity-80 block">{v.registration}</span>
                          </div>
                        </div>
                        <Badge variant={v.type === 'EV' ? 'available' : 'default'} className="text-[8px] font-mono uppercase tracking-wider">
                          {v.type}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-smartBorder/60 rounded-lg">
                    <p className="text-[10px] text-smartTextSecondary font-sans">No vehicles registered on this account.</p>
                    <Button variant="secondary" size="sm" onClick={() => setAddVehicleModalOpen(true)} className="mt-2 text-[10px] uppercase font-semibold">
                      Add Vehicle
                    </Button>
                  </div>
                )}
              </Card>

            </div>

            {/* Right Column: Checkout Summary & AI Spotlight */}
            <div className="flex flex-col gap-6">
              
              {aiRecommendation ? (
                <Card className="bg-gradient-to-br from-smartSurface to-signature/5 border-signature/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-signature/10 text-signature shrink-0 animate-pulse">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">AI Space Recommender</h4>
                      <p className="text-[10.5px] text-smartTextSecondary mt-1 leading-relaxed">
                        Based on your filter metrics, we recommend booking slot <span className="text-white font-bold font-mono">{aiRecommendation.shortId}</span> on floor <span className="text-white font-mono">{activeFloorTab}</span>.
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-mono text-signature font-bold">{aiRecommendation.score}% Match</span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleApplyRecommended}
                          className="text-[9px] uppercase tracking-wider font-bold py-1 px-3"
                        >
                          Apply Slot
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : null}

              <Card className="sticky top-6 flex flex-col gap-4 justify-between min-h-[300px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-smartTextSecondary border-b border-smartBorder/30 pb-2">
                    Checkout Summary
                  </h3>

                  <div className="flex flex-col gap-2.5 font-mono text-[10.5px]">
                    <div className="flex justify-between border-b border-smartBorder/20 pb-1.5">
                      <span className="text-smartTextSecondary">Facility:</span>
                      <span className="text-white font-bold truncate max-w-[150px]">{facility?.name || 'Not Selected'}</span>
                    </div>
                    <div className="flex justify-between border-b border-smartBorder/20 pb-1.5">
                      <span className="text-smartTextSecondary">Date & Time:</span>
                      <span className="text-white font-bold">{reservationDate ? `${reservationDate} @ ${startTime}` : 'Not Selected'}</span>
                    </div>
                    <div className="flex justify-between border-b border-smartBorder/20 pb-1.5">
                      <span className="text-smartTextSecondary">Duration:</span>
                      <span className="text-white font-bold">{duration} hours</span>
                    </div>
                    <div className="flex justify-between border-b border-smartBorder/20 pb-1.5">
                      <span className="text-smartTextSecondary">Floor Bay:</span>
                      <span className="text-signature font-bold">{selectedSlotId ? `${selectedSlotId.split('-').pop()} (${activeFloorTab})` : 'Not Selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-smartTextSecondary">Vehicle:</span>
                      <span className="text-white font-bold truncate max-w-[150px]">
                        {selectedVehicleId ? vehicles.find((v) => v.id === selectedVehicleId)?.label : 'Not Selected'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-smartBorder/30 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white uppercase font-bold">Total (INR)</span>
                    <span className="text-lg font-bold text-signature font-mono">₹{pricing.totalAmount}</span>
                  </div>

                  <Button
                    variant="primary"
                    onClick={validateAndProceed}
                    className="w-full text-xs h-10 justify-center font-bold tracking-wider uppercase gap-1"
                  >
                    PROCEED TO CHECKOUT
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <Card className="flex flex-col gap-6 p-6">
              
              <div className="flex items-center gap-3 border-b border-smartBorder/30 pb-4">
                <button
                  onClick={() => setStep(1)}
                  className="p-1.5 rounded hover:bg-smartBg text-smartTextSecondary hover:text-white transition-all"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <div>
                  <h3 className="text-[13px] font-sans font-bold text-white uppercase">Confirm parking reservation</h3>
                  <span className="text-[9.5px] text-smartTextSecondary font-mono uppercase">Reference permit review</span>
                </div>
              </div>

              <div className="bg-smartBg/60 border border-smartBorder/45 p-4 rounded-xl flex flex-col gap-3 font-mono text-[11px]">
                <div className="flex justify-between border-b border-smartBorder/30 pb-2">
                  <span className="text-smartTextSecondary">Selected Garage:</span>
                  <span className="text-white font-bold">{facility?.name}</span>
                </div>
                <div className="flex justify-between border-b border-smartBorder/30 pb-2">
                  <span className="text-smartTextSecondary">Address:</span>
                  <span className="text-white text-right max-w-[200px] truncate">{facility?.address}</span>
                </div>
                <div className="flex justify-between border-b border-smartBorder/30 pb-2">
                  <span className="text-smartTextSecondary">Date & Time:</span>
                  <span className="text-white font-bold">{reservationDate} at {startTime}</span>
                </div>
                <div className="flex justify-between border-b border-smartBorder/30 pb-2">
                  <span className="text-smartTextSecondary">Assigned Bay:</span>
                  <span className="text-signature font-bold">Slot {selectedSlotId.split('-').pop()} ({activeFloorTab})</span>
                </div>
                <div className="flex justify-between border-b border-smartBorder/30 pb-2">
                  <span className="text-smartTextSecondary">Vehicle Reg:</span>
                  <span className="text-white font-bold font-mono">{vehicles.find((v) => v.id === selectedVehicleId)?.registration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-smartTextSecondary">Permit Amount:</span>
                  <span className="text-signature font-bold font-mono">₹{pricing.totalAmount} (₹{facility?.hourlyRate}/hr)</span>
                </div>
              </div>

              <div className="flex gap-3 items-start bg-signature/5 border border-signature/20 p-3 rounded-lg">
                <Shield className="h-5 w-5 text-signature shrink-0 mt-0.5" />
                <p className="text-[10px] text-smartTextSecondary leading-relaxed">
                  Clicking "CONFIRM RESERVATION" will write this reservation and booking transaction into the system databases, update physical slot occupancy states, and issue your digital permit.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-smartBorder">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-1/3 text-xs h-10 justify-center uppercase font-mono tracking-wider"
                >
                  Back
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleConfirmReservation}
                  className="w-full sm:w-2/3 text-xs h-10 justify-center gap-1.5 uppercase font-mono tracking-wider"
                >
                  Confirm Reservation
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>

            </Card>
          </div>
        )}

      </main>

      <Modal
        isOpen={addVehicleModalOpen}
        onClose={() => setAddVehicleModalOpen(false)}
        title="Add Vehicle Registry Profile"
        size="md"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4 text-xs font-sans text-smartTextSecondary text-left">
          
          <Input
            label="Vehicle Label (e.g. My Honda City)"
            value={newVehLabel}
            onChange={(e) => setNewVehLabel(e.target.value)}
            placeholder="Label..."
            required
          />

          <Input
            label="Registration Number (e.g. MH-01-AB-1234)"
            value={newVehReg}
            onChange={(e) => setNewVehReg(e.target.value)}
            placeholder="Registration..."
            required
          />

          <Select
            label="Vehicle Fuel/Engine Type"
            value={newVehType}
            onChange={(e) => setNewVehType(e.target.value)}
            options={[
              { value: 'EV', label: 'Electric Vehicle (EV)' },
              { value: 'GAS', label: 'Petrol/Gas Engine' },
              { value: 'HYBRID', label: 'Hybrid Drive' }
            ]}
          />

          <div className="pt-4 border-t border-smartBorder flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAddVehicleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-1"
            >
              Save Vehicle
            </Button>
          </div>

        </form>
      </Modal>

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        type={toastType}
      />
    </div>
  );
}
