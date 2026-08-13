import { ParkingStatusType } from '../components/ui/StatusBadge';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  memberSince: string;
  badge: string;
}

export interface ParkingPreferences {
  evParking: boolean;
  coveredParking: boolean;
  lowerPrice: boolean;
  shorterWalk: boolean;
  parkingRadius: string;
  defaultZone: string;
}

export interface SavedParkingFacility {
  id: string;
  name: string;
  availability: ParkingStatusType;
  distance: string;
  walkingEta: string;
  price: string;
  hasEv: boolean;
  isCovered: boolean;
}

export interface BookingSummary {
  id: string;
  facilityName: string;
  date: string;
  time: string;
  slot: string;
  amount: string;
  status: ParkingStatusType;
}

export interface NotificationPreferences {
  availabilityAlerts: boolean;
  bookingReminders: boolean;
  aiRecommendationAlerts: boolean;
  promotionalNotifications: boolean;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Pratham',
  email: 'pratham@example.com',
  phone: '+1 (555) 234-5678',
  location: 'Downtown Metro Zone',
  status: 'ACTIVE',
  memberSince: 'August 2026',
  badge: 'PRO OPERATOR',
};

export const INITIAL_PREFERENCES: ParkingPreferences = {
  evParking: true,
  coveredParking: true,
  lowerPrice: false,
  shorterWalk: true,
  parkingRadius: '2.0 km',
  defaultZone: 'Zone A - Financial District',
};

export const INITIAL_SAVED_PARKING: SavedParkingFacility[] = [
  {
    id: 'sp-1',
    name: 'Metro Central Garage',
    availability: 'AVAILABLE',
    distance: '0.3 km',
    walkingEta: '4 min walk',
    price: '$4.50/hr',
    hasEv: true,
    isCovered: true,
  },
  {
    id: 'sp-2',
    name: 'Tech Tower Parking Lot',
    availability: 'LIMITED',
    distance: '0.7 km',
    walkingEta: '8 min walk',
    price: '$3.00/hr',
    hasEv: true,
    isCovered: false,
  },
  {
    id: 'sp-3',
    name: 'Grand Avenue Plaza',
    availability: 'OCCUPIED',
    distance: '1.1 km',
    walkingEta: '14 min walk',
    price: '$5.00/hr',
    hasEv: false,
    isCovered: true,
  },
];

export const INITIAL_RECENT_BOOKINGS: BookingSummary[] = [
  {
    id: 'BK-2026-8891',
    facilityName: 'Metro Central Garage - Level 2',
    date: 'Aug 14, 2026',
    time: '09:00 AM - 05:00 PM',
    slot: 'Bay A-14',
    amount: '$24.00',
    status: 'RESERVED',
  },
  {
    id: 'BK-2026-7412',
    facilityName: 'Tech Tower Parking Lot',
    date: 'Aug 12, 2026',
    time: '10:00 AM - 02:00 PM',
    slot: 'Bay B-08',
    amount: '$12.00',
    status: 'AVAILABLE',
  },
  {
    id: 'BK-2026-6104',
    facilityName: 'Harborside Lot 4',
    date: 'Aug 10, 2026',
    time: '01:00 PM - 03:00 PM',
    slot: 'Bay C-02',
    amount: '$0.00',
    status: 'CLOSED',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationPreferences = {
  availabilityAlerts: true,
  bookingReminders: true,
  aiRecommendationAlerts: true,
  promotionalNotifications: false,
};

export const RADIUS_OPTIONS = [
  { value: '0.5 km', label: '0.5 km (Immediate Walk)' },
  { value: '1.0 km', label: '1.0 km (Short Walk)' },
  { value: '2.0 km', label: '2.0 km (Standard Radius)' },
  { value: '5.0 km', label: '5.0 km (Expanded Zone)' },
];

export const ZONE_OPTIONS = [
  { value: 'Zone A - Financial District', label: 'Zone A - Financial District' },
  { value: 'Zone B - Tech Hub & University', label: 'Zone B - Tech Hub & University' },
  { value: 'Zone C - Waterfront & Harbor', label: 'Zone C - Waterfront & Harbor' },
  { value: 'Zone D - Medical Center', label: 'Zone D - Medical Center' },
];
