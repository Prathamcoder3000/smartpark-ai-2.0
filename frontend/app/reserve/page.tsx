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
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { ParkingSlot } from '../../components/ui/ParkingSlot';
import {
  MOCK_FACILITY_DETAILS,
  FacilityDetails,
  FacilityFloor,
  FacilitySlot
} from '../../lib/facilityData';
import {
  VehicleOption,
  INITIAL_VEHICLE_OPTIONS,
  calculatePricing,
  ReservationSelection,
  ReservationSummary
} from '../../lib/reservationData';

export default function ReservePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Step state: 1 = SELECT, 2 = REVIEW
  const [step, setStep] = React.useState<number>(1);

  // Load facility slug from search params
  const initialFacilitySlug = searchParams?.get('facility') || '';
  const initialSlotId = searchParams?.get('slot') || '';
  const initialFloorId = searchParams?.get('floor') || '';

  // Vehicle list state (local session storage/state)
  const [vehicles, setVehicles] = React.useState<VehicleOption[]>(INITIAL_VEHICLE_OPTIONS);
  const [addVehicleModalOpen, setAddVehicleModalOpen] = React.useState(false);
  const [newVehLabel, setNewVehLabel] = React.useState('');
  const [newVehReg, setNewVehReg] = React.useState('');
  const [newVehType, setNewVehType] = React.useState('EV');

  // Form states
  const [selectedFacilityId, setSelectedFacilityId] = React.useState('');
  const [reservationDate, setReservationDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('09:00');
  const [duration, setDuration] = React.useState(2);
  const [activeFloorTab, setActiveFloorTab] = React.useState('');
  const [selectedSlotId, setSelectedSlotId] = React.useState('');
  const [selectedVehicleId, setSelectedVehicleId] = React.useState('');

  // Preferences states
  const [prefEvCharging, setPrefEvCharging] = React.useState(false);
  const [prefCoveredParking, setPrefCoveredParking] = React.useState(false);
  const [prefShorterWalk, setPrefShorterWalk] = React.useState(false);

  // Toast
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'warning' | 'info' | 'error'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Resolve active facility details
  const facility = React.useMemo(() => {
    return MOCK_FACILITY_DETAILS.find(
      (f) => f.slug === selectedFacilityId || f.id === selectedFacilityId
    );
  }, [selectedFacilityId]);

  // Set default initial facility context
  React.useEffect(() => {
    if (initialFacilitySlug) {
      const match = MOCK_FACILITY_DETAILS.find(
        (f) => f.slug === initialFacilitySlug || f.id === initialFacilitySlug
      );
      if (match) {
        setSelectedFacilityId(match.id);
        if (match.floors.length > 0) {
          setActiveFloorTab(initialFloorId || match.floors[0].id);
        }
      } else {
        if (MOCK_FACILITY_DETAILS.length > 0) {
          setSelectedFacilityId(MOCK_FACILITY_DETAILS[0].id);
          setActiveFloorTab(MOCK_FACILITY_DETAILS[0].floors[0].id);
        }
        triggerToast('Requested facility not found. Defaulting to Central Plaza.', 'warning');
      }
    } else if (MOCK_FACILITY_DETAILS.length > 0) {
      setSelectedFacilityId(MOCK_FACILITY_DETAILS[0].id);
      setActiveFloorTab(MOCK_FACILITY_DETAILS[0].floors[0].id);
    }
  }, [initialFacilitySlug, initialFloorId]);

  // Set default parameters
  React.useEffect(() => {
    // Set Tomorrow's date as default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReservationDate(tomorrow.toISOString().split('T')[0]);

    // Set default vehicle
    const defaultVeh = vehicles.find((v) => v.isDefault) || vehicles[0];
    if (defaultVeh) {
      setSelectedVehicleId(defaultVeh.id);
    }
  }, []);

  // Update floor tabs when facility changes
  React.useEffect(() => {
    if (facility && facility.floors.length > 0) {
      // Don't overwrite if we matched the initial param floor
      if (initialFloorId && facility.floors.some(f => f.id === initialFloorId)) {
        setActiveFloorTab(initialFloorId);
      } else {
        setActiveFloorTab(facility.floors[0].id);
      }
      setSelectedSlotId('');
    }
  }, [selectedFacilityId, facility, initialFloorId]);

  // Set initial slot parameter if specified
  React.useEffect(() => {
    if (initialSlotId) {
      setSelectedSlotId(initialSlotId);
    }
  }, [initialSlotId]);

  // Get active floor details
  const activeFloor = React.useMemo(() => {
    if (!facility) return null;
    return facility.floors.find((f) => f.id === activeFloorTab) || facility.floors[0];
  }, [facility, activeFloorTab]);

  // Compute pricing
  const pricing = React.useMemo(() => {
    if (!facility) {
      return { baseAmount: 0, serviceFee: 0, convenienceFee: 0, discount: 0, totalAmount: 0 };
    }
    return calculatePricing(facility.hourlyRate, duration, prefEvCharging);
  }, [facility, duration, prefEvCharging]);

  // Handle vehicle additions
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehLabel.trim() || !newVehReg.trim()) {
      triggerToast('Label and registration are required.', 'error');
      return;
    }

    const newVeh: VehicleOption = {
      id: `veh-${Date.now()}`,
      label: `${newVehLabel} (${newVehType})`,
      registration: newVehReg.toUpperCase(),
      type: newVehType,
      isDefault: false
    };

    setVehicles((prev) => [...prev, newVeh]);
    setSelectedVehicleId(newVeh.id);
    setNewVehLabel('');
    setNewVehReg('');
    setAddVehicleModalOpen(false);
    triggerToast('Vehicle added to local registry.', 'success');
  };

  // Local AI recommendations computed properties
  const aiRecommendation = React.useMemo(() => {
    if (!activeFloor || activeFloor.slots.length === 0) return null;
    
    // Find first available slot on this floor
    let slot = activeFloor.slots.find((s) => s.state === 'AVAILABLE');
    
    // If EV is preferred, prioritize EV slots
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

  // Apply AI recommended slot helper
  const handleApplyRecommended = () => {
    if (aiRecommendation) {
      setSelectedSlotId(aiRecommendation.slotId);
      triggerToast(`Selected recommended slot: ${aiRecommendation.shortId}`, 'success');
    }
  };

  // Submission validation
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

    setStep(2); // Go to review step
  };

  // Final Confirmation Submit
  const handleConfirmReservation = () => {
    if (!facility || !activeFloor) return;

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

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

    const reference = `SP-DEMO-${Math.floor(10000 + Math.random() * 90000)}`;

    const summary: ReservationSummary = {
      selection,
      facility: {
        id: facility.id,
        name: facility.name,
        zone: facility.zone,
        address: facility.address,
        availableBays: facility.availableBays,
        totalBays: facility.totalBays,
        occupancyPct: facility.occupancyPct,
        distanceKm: facility.distanceKm,
        walkingEta: facility.walkingEta,
        rating: facility.rating,
        hourlyRate: facility.hourlyRate,
        dailyRate: facility.dailyRate,
        hasEv: facility.hasEv,
        isCovered: facility.isCovered
      },
      floorLabel: activeFloor.label,
      pricing,
      reference,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Save temporary details in sessionStorage
    try {
      sessionStorage.setItem('smartpark_pending_reservation', JSON.stringify(summary));
      router.push('/reserve/confirmation');
    } catch (e) {
      triggerToast('Session storage unavailable. Unable to save reservation.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-smartBg text-smartTextPrimary flex flex-col font-sans pb-20 selection:bg-signature/20 selection:text-signature">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-smartBorder/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-smartTextPrimary">
              RESERVE PARKING
            </h1>
            <p className="text-xs sm:text-sm text-smartTextSecondary">
              Secure a parking bay before demand increases.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-smartSurface border border-smartBorder px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-signature animate-pulse" />
              <span>PROTOTYPE ON</span>
            </div>
            
            {/* STEP INDICATOR */}
            <div className="flex items-center gap-1.5 font-bold uppercase">
              <span className={step === 1 ? 'text-signature' : 'text-smartTextSecondary'}>01 SELECT</span>
              <span className="text-smartTextSecondary">→</span>
              <span className={step === 2 ? 'text-signature' : 'text-smartTextSecondary'}>02 REVIEW</span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            STEP 1: SELECT RESERVATION PARAMETERS
           -------------------------------------------------- */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 columns form console */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* FACILITY SELECTION */}
              <Card variant="default" className="space-y-4">
                <h2 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/65 pb-2">
                  1. SELECT FACILITY
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {MOCK_FACILITY_DETAILS.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => setSelectedFacilityId(fac.id)}
                      className={`p-4 rounded-smart border transition-all cursor-pointer flex justify-between items-center gap-4 ${
                        selectedFacilityId === fac.id
                          ? 'border-signature bg-signature/5 shadow-md ring-1 ring-signature/10'
                          : 'bg-smartSurface/50 border-smartBorder/50 hover:border-smartBorder'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-white uppercase">{fac.name}</strong>
                          <Badge variant="outline" className="text-[8px] font-mono">{fac.zone}</Badge>
                        </div>
                        <p className="text-[11px] text-smartTextSecondary truncate">{fac.address}</p>
                        <div className="flex flex-wrap gap-1">
                          {fac.hasEv && <Badge variant="signature" className="text-[8px]">EV LANE</Badge>}
                          {fac.isCovered && <Badge variant="default" className="text-[8px]">COVERED</Badge>}
                          <span className="text-[10px] font-mono font-bold text-smartTextPrimary flex items-center gap-1">
                            ★ {fac.rating}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-signature text-sm">₹{fac.hourlyRate}/hr</div>
                        <div className="text-[9px] font-mono text-smartTextSecondary">
                          {fac.distanceKm} km ({fac.walkingEta} min walk)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* DATE & TIME SELECTOR */}
              <Card variant="default" className="space-y-4">
                <h2 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/65 pb-2">
                  2. PARKING TIME
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-sans font-semibold uppercase tracking-wider text-smartTextSecondary">
                      Reservation Date
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-9 bg-smartSurface border border-smartBorder rounded-smart px-3 text-sm text-white outline-none focus:border-signature/60"
                    />
                  </div>

                  {/* Start Time */}
                  <Select
                    label="Start Time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    options={[
                      { value: '08:00', label: '08:00 AM' },
                      { value: '09:00', label: '09:00 AM' },
                      { value: '10:00', label: '10:00 AM' },
                      { value: '11:00', label: '11:00 AM' },
                      { value: '12:00', label: '12:00 PM' },
                      { value: '13:00', label: '01:00 PM' },
                      { value: '14:00', label: '02:00 PM' },
                      { value: '15:00', label: '03:00 PM' },
                      { value: '16:00', label: '04:00 PM' },
                      { value: '17:00', label: '05:00 PM' },
                      { value: '18:00', label: '06:00 PM' }
                    ]}
                  />

                  {/* Duration */}
                  <Select
                    label="Duration"
                    value={duration.toString()}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    options={[
                      { value: '1', label: '1 hour' },
                      { value: '2', label: '2 hours' },
                      { value: '3', label: '3 hours' },
                      { value: '4', label: '4 hours' },
                      { value: '6', label: '6 hours' },
                      { value: '8', label: '8 hours' }
                    ]}
                  />
                </div>
              </Card>

              {/* FLOOR & SLOT SELECTION */}
              <Card variant="default" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-smartBorder/65 pb-2">
                  <h2 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                    3. SELECT FLOOR & SLOT
                  </h2>

                  {/* Floor Selector Tabs */}
                  {facility && (
                    <div className="flex gap-1 overflow-x-auto">
                      {facility.floors.map((fl) => (
                        <button
                          key={fl.id}
                          type="button"
                          onClick={() => setActiveFloorTab(fl.id)}
                          className={`text-xs px-3 py-1 rounded font-mono font-bold uppercase transition-all shrink-0 border ${
                            activeFloorTab === fl.id
                              ? 'bg-signature border-signature text-smartBg'
                              : 'bg-smartSurface border-smartBorder text-smartTextSecondary hover:text-smartTextPrimary'
                          }`}
                        >
                          {fl.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {activeFloor && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-mono bg-smartBg/60 p-2 border border-smartBorder rounded-smart">
                      <span className="text-smartTextSecondary">{activeFloor.label}</span>
                      <span className="text-available font-bold">{activeFloor.availableBays} bays open</span>
                    </div>

                    {/* Slot selection grid */}
                    <div className="flex flex-wrap gap-2.5 justify-center py-4 bg-smartBg/40 border border-dashed border-smartBorder rounded-smart">
                      {activeFloor.slots.map((slot) => {
                        const isSlotSelected = selectedSlotId === slot.id;
                        
                        // EV filter alignment
                        const isRecommendedEv = prefEvCharging && slot.isEV && slot.state === 'AVAILABLE';

                        return (
                          <div key={slot.id} className="relative">
                            <ParkingSlot
                              id={slot.id.split('-').pop() || slot.id}
                              state={isSlotSelected ? 'SELECTED' : slot.state}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={isRecommendedEv ? 'ring-2 ring-signature ring-offset-2 ring-offset-smartBg' : ''}
                            />
                            {slot.isEV && (
                              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-signature/10 border border-signature flex items-center justify-center pointer-events-none">
                                <Zap className="h-2 w-2 text-signature" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* VEHICLE SELECTION */}
              <Card variant="default" className="space-y-4">
                <div className="flex items-center justify-between border-b border-smartBorder/65 pb-2">
                  <h2 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                    4. VEHICLE REGISTER
                  </h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-[10px] h-7 gap-1"
                    onClick={() => setAddVehicleModalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    ADD VEHICLE
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3.5 rounded-smart border cursor-pointer flex items-center justify-between ${
                        selectedVehicleId === v.id
                          ? 'border-signature bg-signature/5'
                          : 'bg-smartSurface/50 border-smartBorder/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <strong className="text-white block font-semibold">{v.label}</strong>
                        <span className="font-mono text-smartTextSecondary text-[10px] bg-smartBg px-1.5 py-0.5 rounded border border-smartBorder/70">
                          REG: {v.registration}
                        </span>
                      </div>
                      <Car className={`h-5 w-5 ${selectedVehicleId === v.id ? 'text-signature' : 'text-smartTextSecondary'}`} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* PREFERENCES & AI RECOMMENDATIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* PREFERENCES CHECKBOXES */}
                <Card variant="default" className="space-y-3">
                  <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder/65 pb-1.5">
                    PARKING PREFERENCES
                  </h3>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefEvCharging}
                        onChange={(e) => setPrefEvCharging(e.target.checked)}
                        className="h-4 w-4 bg-smartSurface border border-smartBorder text-signature rounded focus:ring-0"
                      />
                      <span>Require EV Charging Point</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefCoveredParking}
                        onChange={(e) => setPrefCoveredParking(e.target.checked)}
                        className="h-4 w-4 bg-smartSurface border border-smartBorder text-signature rounded focus:ring-0"
                      />
                      <span>Prefer Weather Protected Deck</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefShorterWalk}
                        onChange={(e) => setPrefShorterWalk(e.target.checked)}
                        className="h-4 w-4 bg-smartSurface border border-smartBorder text-signature rounded focus:ring-0"
                      />
                      <span>Prioritize Proximity to Elevators</span>
                    </label>
                  </div>
                </Card>

                {/* AI RECOMMENDS CARD */}
                {aiRecommendation ? (
                  <Card variant="elevated" className="border-aiBlue/30 bg-smartSurface/50 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-smartBorder pb-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold font-display uppercase tracking-wider text-aiBlue">
                        <Sparkles className="h-4 w-4" />
                        SMARTPARK RECOMMENDS
                      </span>
                      <span className="text-[10px] font-mono font-bold text-signature bg-signature/10 border border-signature/30 px-2 py-0.5 rounded">
                        Score: {aiRecommendation.score}%
                      </span>
                    </div>

                    <p className="text-xs text-smartTextSecondary leading-relaxed">
                      "{aiRecommendation.reason}"
                    </p>

                    <div className="flex justify-end pt-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyRecommended}
                        className="text-[10px] h-8"
                      >
                        Apply Recommendation
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <div className="bg-smartSurface/30 border border-dashed border-smartBorder p-4 rounded-smart text-center text-xs text-smartTextSecondary">
                    Select a floor to generate slot recommendations.
                  </div>
                )}

              </div>

            </div>

            {/* STICKY SIDEBAR RESERVATION SUMMARY */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <Card variant="elevated" className="border-signature/20 bg-smartSurface/70 space-y-5">
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-smartTextPrimary border-b border-smartBorder pb-2">
                  SUMMARY BREAKDOWN
                </h3>

                {facility && (
                  <div className="space-y-4 text-xs font-sans">
                    
                    {/* Items */}
                    <div className="space-y-2 text-smartTextSecondary">
                      <div className="flex justify-between">
                        <span>Facility</span>
                        <strong className="text-white uppercase text-[11px] truncate max-w-[150px]">{facility.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Floor Level</span>
                        <strong className="text-white font-mono">{activeFloorTab || 'Not Selected'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Slot</span>
                        <strong className="text-signature font-mono">
                          {selectedSlotId ? (selectedSlotId.split('-').pop() || selectedSlotId) : 'Not Selected'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Date / Start</span>
                        <strong className="text-white">{reservationDate} @ {startTime}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <strong className="text-white">{duration} hrs</strong>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-4 border-t border-smartBorder/45 space-y-2">
                      <div className="flex justify-between text-smartTextSecondary">
                        <span>Base parking charge</span>
                        <span className="font-mono">₹{pricing.baseAmount - (prefEvCharging ? 20 : 0)}</span>
                      </div>
                      {prefEvCharging && (
                        <div className="flex justify-between text-signature">
                          <span>EV Supercharger Surcharge</span>
                          <span className="font-mono">+₹20</span>
                        </div>
                      )}
                      <div className="flex justify-between text-smartTextSecondary">
                        <span>Platform service fee</span>
                        <span className="font-mono">₹{pricing.serviceFee}</span>
                      </div>
                      <div className="flex justify-between text-smartTextSecondary">
                        <span>Convenience fee</span>
                        <span className="font-mono">₹{pricing.convenienceFee}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-smartBorder font-bold text-sm text-signature">
                        <span>TOTAL</span>
                        <span className="font-mono">₹{pricing.totalAmount}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        onClick={validateAndProceed}
                        className="w-full text-xs h-10 justify-center gap-1.5"
                      >
                        REVIEW RESERVATION
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

          </div>
        )}

        {/* --------------------------------------------------
            STEP 2: REVIEW RESERVATION PREVIEW
           -------------------------------------------------- */}
        {step === 2 && facility && activeFloor && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <Card variant="elevated" className="border-signature/30 bg-smartSurface/90 p-6 space-y-6">
              
              <div className="flex items-center gap-2 border-b border-smartBorder pb-3">
                <IconButton variant="ghost" size="sm" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                </IconButton>
                <h2 className="text-base font-bold font-display uppercase tracking-wider text-smartTextPrimary">
                  REVIEW RESERVATION DETAILS
                </h2>
              </div>

              {/* Review details grid */}
              <div className="divide-y divide-smartBorder/45 text-xs font-sans">
                
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-smartTextSecondary font-mono uppercase tracking-wider">Facility</span>
                  <div className="text-right">
                    <strong className="text-white block uppercase">{facility.name}</strong>
                    <span className="text-smartTextSecondary text-[10px]">{facility.address}</span>
                  </div>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-smartTextSecondary font-mono uppercase tracking-wider">Floor & Bay</span>
                  <strong className="text-signature font-mono">
                    {activeFloor.label} (Slot {selectedSlotId ? (selectedSlotId.split('-').pop() || selectedSlotId) : ''})
                  </strong>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-smartTextSecondary font-mono uppercase tracking-wider">Time Window</span>
                  <strong className="text-white">
                    {reservationDate} | {startTime} ({duration} hours duration)
                  </strong>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-smartTextSecondary font-mono uppercase tracking-wider">Vehicle Profile</span>
                  <strong className="text-white">
                    {vehicles.find((v) => v.id === selectedVehicleId)?.label}
                  </strong>
                </div>

                <div className="py-3 flex justify-between">
                  <span className="text-smartTextSecondary font-mono uppercase tracking-wider">Preferences Matched</span>
                  <div className="flex gap-1.5">
                    {prefEvCharging && <Badge variant="signature">EV</Badge>}
                    {prefCoveredParking && <Badge variant="default">COVERED</Badge>}
                    {prefShorterWalk && <Badge variant="outline">PROXIMITY</Badge>}
                    {!prefEvCharging && !prefCoveredParking && !prefShorterWalk && (
                      <span className="text-smartTextSecondary">None selected</span>
                    )}
                  </div>
                </div>

                {/* Final pricing info */}
                <div className="py-4 pt-6 space-y-2">
                  <div className="flex justify-between text-smartTextSecondary">
                    <span>Base Fare ({duration} hrs)</span>
                    <span className="font-mono">₹{pricing.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-smartTextSecondary">
                    <span>Platform Fee + Service Taxes</span>
                    <span className="font-mono">₹{pricing.serviceFee + pricing.convenienceFee}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-smartBorder font-bold text-base text-signature">
                    <span>FINAL TOTAL</span>
                    <span className="font-mono">₹{pricing.totalAmount}</span>
                  </div>
                </div>

              </div>

              <div className="p-3.5 bg-smartBg border border-smartBorder rounded-smart flex items-start gap-3 text-xs text-smartTextSecondary leading-relaxed">
                <Info className="h-4 w-4 text-signature shrink-0 mt-0.5" />
                <p>
                  This is a prototype confirmation step. Clicking "CONFIRM RESERVATION" will mock checkout actions and generate a prototype digital parking pass for this session. No monetary charge is made.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-smartBorder">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-1/3 text-xs h-10 justify-center"
                >
                  Back to Select
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleConfirmReservation}
                  className="w-full sm:w-2/3 text-xs h-10 justify-center gap-1.5"
                >
                  CONFIRM RESERVATION
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>

            </Card>

          </div>
        )}

      </main>

      {/* ADD VEHICLE MODAL */}
      <Modal
        isOpen={addVehicleModalOpen}
        onClose={() => setAddVehicleModalOpen(false)}
        title="Add Vehicle Registry Profile"
        size="md"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4 text-xs font-sans text-smartTextSecondary">
          
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
              { value: 'Petrol', label: 'Petrol Engine' },
              { value: 'Diesel', label: 'Diesel Engine' },
              { value: 'CNG', label: 'CNG Engine' }
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
