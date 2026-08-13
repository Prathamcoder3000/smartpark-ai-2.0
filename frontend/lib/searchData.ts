import { ParkingStatusType } from '../components/ui/StatusBadge';

export interface SearchFacility {
  id: string;
  name: string;
  shortName: string;
  zone: string;
  location: string;
  status: ParkingStatusType;
  availableBays: number;
  totalBays: number;
  occupancyPct: number;
  distanceKm: number;
  walkMinutes: number;
  priceFormatted: string;
  priceNum: number;
  predictedAvailability: string;
  rating: number;
  hasEv: boolean;
  isCovered: boolean;
  hasSecurity: boolean;
  isRecommended?: boolean;
  confidenceScore?: string;
  recommendationReasons?: string[];
  amenities: string[];
}

export interface SearchDestination {
  id: string;
  name: string;
  category: string;
  nearbyFacilityCount: number;
}

export interface SearchFilters {
  availability: 'ALL' | 'AVAILABLE' | 'LIMITED';
  evOnly: boolean;
  coveredOnly: boolean;
  securityOnly: boolean;
  maxPrice: number; // 0 means no limit, e.g. 100 or 200
  maxDistance: number; // 0 means no limit, e.g. 0.5, 1.0, 2.0 (km)
}

export type SearchSort = 'RECOMMENDED' | 'CLOSEST' | 'LOWEST_PRICE' | 'HIGHEST_AVAILABILITY';

export interface SearchSuggestion {
  id: string;
  label: string;
  category: string;
  type: 'FACILITY' | 'DESTINATION' | 'ZONE';
}

export const POPULAR_DESTINATIONS: SearchDestination[] = [
  { id: 'dest-1', name: 'Cyber City', category: 'Commercial Hub', nearbyFacilityCount: 8 },
  { id: 'dest-2', name: 'Central Metro', category: 'Transit Station', nearbyFacilityCount: 12 },
  { id: 'dest-3', name: 'TechPark', category: 'Business Center', nearbyFacilityCount: 6 },
  { id: 'dest-4', name: 'Financial Plaza', category: 'Financial District', nearbyFacilityCount: 9 },
  { id: 'dest-5', name: 'Galleria Mall', category: 'Shopping & Dining', nearbyFacilityCount: 5 },
];

export const RECENT_SEARCHES = [
  'Central Metro',
  'Cyber City Zone A',
  'Galleria Mall EV Deck',
  'Financial Plaza',
];

export const MOCK_SEARCH_FACILITIES: SearchFacility[] = [
  {
    id: 'fac-01',
    name: 'Metro Central Garage',
    shortName: 'Metro Central',
    zone: 'Zone A - Financial District',
    location: '45 Station Road, Near Central Metro',
    status: 'AVAILABLE',
    availableBays: 142,
    totalBays: 200,
    occupancyPct: 29,
    distanceKm: 0.3,
    walkMinutes: 4,
    priceFormatted: '₹60/hr',
    priceNum: 60,
    predictedAvailability: 'High stability (next 3 hrs)',
    rating: 4.8,
    hasEv: true,
    isCovered: true,
    hasSecurity: true,
    isRecommended: true,
    confidenceScore: '98.4%',
    recommendationReasons: [
      'High predicted availability (142 bays open)',
      'Short 4 min walking distance to destination',
      'Stable price locked for next 2 hours',
      '24/7 Monitored security & EV fast charging',
    ],
    amenities: ['24/7 Security', 'Fast EV Charging', 'Covered Deck', 'CCTV', 'Automated Boom Barrier'],
  },
  {
    id: 'fac-02',
    name: 'TechPark Underground Plaza',
    shortName: 'TechPark Lot',
    zone: 'Zone B - Tech Hub',
    location: '12 Innovation Way, TechPark',
    status: 'LIMITED',
    availableBays: 18,
    totalBays: 150,
    occupancyPct: 88,
    distanceKm: 0.7,
    walkMinutes: 8,
    priceFormatted: '₹80/hr',
    priceNum: 80,
    predictedAvailability: 'Filling up fast (next 30 mins)',
    rating: 4.6,
    hasEv: true,
    isCovered: true,
    hasSecurity: true,
    amenities: ['Valet Service', 'EV Charging', 'Covered Deck', 'Disability Access'],
  },
  {
    id: 'fac-03',
    name: 'Cyber City Hub Parking',
    shortName: 'Cyber Hub',
    zone: 'Zone A - Financial District',
    location: '88 Cyber Boulevard, Cyber City',
    status: 'AVAILABLE',
    availableBays: 94,
    totalBays: 180,
    occupancyPct: 47,
    distanceKm: 0.4,
    walkMinutes: 5,
    priceFormatted: '₹90/hr',
    priceNum: 90,
    predictedAvailability: 'Moderate traffic predicted',
    rating: 4.9,
    hasEv: true,
    isCovered: true,
    hasSecurity: true,
    amenities: ['Fast EV Chargers', 'Covered Parking', 'Contactless Payment', 'Smart Navigation'],
  },
  {
    id: 'fac-04',
    name: 'Financial Plaza Surface Lot',
    shortName: 'Financial Plaza',
    zone: 'Zone A - Financial District',
    location: '102 Wall Street Avenue',
    status: 'AVAILABLE',
    availableBays: 65,
    totalBays: 100,
    occupancyPct: 35,
    distanceKm: 0.9,
    walkMinutes: 11,
    priceFormatted: '₹50/hr',
    priceNum: 50,
    predictedAvailability: 'High availability expected',
    rating: 4.3,
    hasEv: false,
    isCovered: false,
    hasSecurity: true,
    amenities: ['Open Surface', '24/7 Security', 'Budget Friendly'],
  },
  {
    id: 'fac-05',
    name: 'Galleria Mall Multi-Level',
    shortName: 'Galleria Mall',
    zone: 'Zone C - Retail Corridor',
    location: '5 Shopping Centre Road, Galleria',
    status: 'LIMITED',
    availableBays: 12,
    totalBays: 250,
    occupancyPct: 95,
    distanceKm: 1.2,
    walkMinutes: 15,
    priceFormatted: '₹120/hr',
    priceNum: 120,
    predictedAvailability: 'Peak shopping hours',
    rating: 4.7,
    hasEv: true,
    isCovered: true,
    hasSecurity: true,
    amenities: ['Car Wash', 'EV Fast Charger', 'Multi-level Covered', 'Elevator Access'],
  },
  {
    id: 'fac-06',
    name: 'Harborside South Lot',
    shortName: 'Harborside',
    zone: 'Zone C - Retail Corridor',
    location: '1 Marina Drive, Harborside',
    status: 'AVAILABLE',
    availableBays: 110,
    totalBays: 160,
    occupancyPct: 31,
    distanceKm: 1.8,
    walkMinutes: 22,
    priceFormatted: '₹40/hr',
    priceNum: 40,
    predictedAvailability: 'High availability all day',
    rating: 4.2,
    hasEv: false,
    isCovered: false,
    hasSecurity: false,
    amenities: ['Economical', 'Wide Bays', 'Bicycle Racks'],
  },
];

export const MOCK_SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'sug-1', label: 'Central Metro Station', category: 'Transit Hub', type: 'DESTINATION' },
  { id: 'sug-2', label: 'Cyber City Hub', category: 'Commercial Center', type: 'DESTINATION' },
  { id: 'sug-3', label: 'TechPark Underground Plaza', category: 'Parking Facility', type: 'FACILITY' },
  { id: 'sug-4', label: 'Financial Plaza Surface Lot', category: 'Parking Facility', type: 'FACILITY' },
  { id: 'sug-5', label: 'Zone A - Financial District', category: 'Parking Zone', type: 'ZONE' },
  { id: 'sug-6', label: 'Zone B - Tech Hub', category: 'Parking Zone', type: 'ZONE' },
  { id: 'sug-7', label: 'Galleria Mall Multi-Level', category: 'Parking Facility', type: 'FACILITY' },
];
