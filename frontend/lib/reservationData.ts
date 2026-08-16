import { ParkingSlotState } from '../components/ui/ParkingSlot';

export interface ReservationSlot {
  id: string;
  floor: string;
  state: ParkingSlotState;
  isEV: boolean;
  isDisabled: boolean;
  priceModifier: number; // e.g. 1.0 for normal, 1.2 for EV premium
}

export interface ReservationFloor {
  id: string;
  label: string;
  availableSlots: number;
  totalSlots: number;
  slots: ReservationSlot[];
}

export interface ReservationFacility {
  id: string;
  name: string;
  zone: string;
  address: string;
  availableBays: number;
  totalBays: number;
  occupancyPct: number;
  distanceKm: number;
  walkingEta: number;
  rating: number;
  hourlyRate: number;
  dailyRate: number;
  hasEv: boolean;
  isCovered: boolean;
}

export interface ReservationSelection {
  facilityId: string;
  date: string;
  startTime: string;
  duration: number; // hours
  floorId: string;
  slotId: string;
  vehicleId: string;
  preferences: {
    evCharging: boolean;
    coveredParking: boolean;
    shorterWalk: boolean;
  };
}

export interface ReservationPricing {
  baseAmount: number;
  serviceFee: number;
  convenienceFee: number;
  discount: number;
  totalAmount: number;
}

export interface ReservationSummary {
  selection: ReservationSelection;
  facility: ReservationFacility;
  floorLabel: string;
  pricing: ReservationPricing;
  reference: string;
  createdAt: string;
}

export interface VehicleOption {
  id: string;
  label: string;
  registration: string;
  type: string;
  isDefault: boolean;
}

export const INITIAL_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'veh-1',
    label: 'Primary Sedan (Honda City)',
    registration: 'MH-01-DR-4829',
    type: 'Sedan',
    isDefault: true
  },
  {
    id: 'veh-2',
    label: 'Secondary EV (Tata Nexon EV)',
    registration: 'MH-01-EE-9021',
    type: 'SUV (EV)',
    isDefault: false
  }
];

export function calculatePricing(
  hourlyRate: number,
  durationHours: number,
  isEvSelected: boolean
): ReservationPricing {
  const baseAmount = hourlyRate * durationHours;
  const serviceFee = 10;
  const convenienceFee = 5;
  const discount = 0; // future prototype promos
  
  const evPremium = isEvSelected ? 20 : 0;
  const totalAmount = baseAmount + serviceFee + convenienceFee - discount + evPremium;

  return {
    baseAmount: baseAmount + evPremium,
    serviceFee,
    convenienceFee,
    discount,
    totalAmount
  };
}
