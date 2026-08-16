import { ParkingStatusType } from '../components/ui/StatusBadge';
import { ParkingSlotState } from '../components/ui/ParkingSlot';

export interface FacilitySlot {
  id: string;
  state: ParkingSlotState;
  isEV: boolean;
  isDisabled: boolean;
}

export interface FacilityFloor {
  id: string;
  label: string;
  description: string;
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  reservedBays: number;
  slots: FacilitySlot[];
}

export interface FacilityAmenity {
  name: string;
  icon?: string;
  description?: string;
}

export interface FacilityForecast {
  timeOffset: string; // e.g. "NOW", "+30 MIN"
  status: ParkingStatusType;
  expectedOccupancy: number; // percentage
  expectedAvailableBays: number;
  isObserved: boolean;
}

export interface FacilityRate {
  name: string; // e.g. "Hourly Rate", "Daily Max"
  priceFormatted: string;
  description?: string;
}

export interface FacilityRecommendation {
  score: number; // out of 100
  confidence: string; // e.g. "98.4%"
  predictedAvailability: string;
  expectedOccupancyAtArrival: number;
  reasons: string[];
}

export interface FacilityReviewSummary {
  rating: number;
  reviewCount: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    timeAgo: string;
  }>;
}

export interface FacilityDetails {
  id: string;
  slug: string;
  name: string;
  zone: string;
  address: string;
  description: string;
  status: ParkingStatusType;
  totalBays: number;
  availableBays: number;
  occupiedBays: number;
  reservedBays: number;
  occupancyPct: number;
  distanceKm: number;
  walkingEta: number; // minutes
  rating: number;
  reviewCount: number;
  hasEv: boolean;
  evBays: number;
  isCovered: boolean;
  hasSecurity: boolean;
  isOpen24x7: boolean;
  hourlyRate: number;
  dailyRate: number;
  amenities: FacilityAmenity[];
  floors: FacilityFloor[];
  rates: FacilityRate[];
  forecast: FacilityForecast[];
  recommendation: FacilityRecommendation;
  updatedAt: string;
  demandCurrent: number; // occupancy % e.g. 29
  demandPredicted: number; // predicted occupancy e.g. 35
  forecastConfidence: string; // e.g. "97.5%"
  peakWindow: string; // e.g. "17:00 - 19:00"
  availabilityTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
  searchTimeImpact: string; // e.g. "+5 mins search time expected"
  otherNearbyIds: string[]; // references to other facility slugs/IDs
}

// Slot generator helper similar to the liveMapData one
function makeFacilitySlots(
  prefix: string,
  specs: Array<[number, ParkingSlotState, boolean, boolean?]>
): FacilitySlot[] {
  const slots: FacilitySlot[] = [];
  let counter = 1;
  for (const [count, state, isEV, isDisabled = false] of specs) {
    for (let i = 0; i < count; i++) {
      slots.push({
        id: `${prefix}-${counter.toString().padStart(2, '0')}`,
        state,
        isEV,
        isDisabled,
      });
      counter++;
    }
  }
  return slots;
}

export const MOCK_FACILITY_DETAILS: FacilityDetails[] = [
  {
    id: 'fac-01',
    slug: 'metro-central-garage',
    name: 'Metro Central Garage',
    zone: 'Zone A - Financial District',
    address: '45 Station Road, Near Central Metro, Mumbai',
    description: 'Multi-level premium parking garage catering directly to commuters and local office workers. Monitored 24/7 with direct underground transit link, state-of-the-art security, and dual speed EV fast charging.',
    status: 'AVAILABLE',
    totalBays: 200,
    availableBays: 142,
    occupiedBays: 48,
    reservedBays: 10,
    occupancyPct: 29,
    distanceKm: 0.3,
    walkingEta: 4,
    rating: 4.8,
    reviewCount: 382,
    hasEv: true,
    evBays: 24,
    isCovered: true,
    hasSecurity: true,
    isOpen24x7: true,
    hourlyRate: 60,
    dailyRate: 450,
    amenities: [
      { name: 'EV Charging', description: 'Up to 150 kW DC charging' },
      { name: 'Covered Parking', description: 'Full protection from weather' },
      { name: '24/7 Security', description: 'Active guards & thermal patrol' },
      { name: 'CCTV', description: 'High definition feed coverage' },
      { name: 'Accessible Parking', description: 'Extra wide near elevators' },
      { name: 'Digital Entry', description: 'License plate recognition barrier' },
      { name: 'Emergency Support', description: 'Call points on every pillar' }
    ],
    rates: [
      { name: 'Hourly Rate', priceFormatted: '₹60/hr', description: 'Standard billing per hour or part thereof' },
      { name: '2-Hour Estimate', priceFormatted: '₹120', description: 'Estimated parking rate for short visits' },
      { name: 'Daily Maximum', priceFormatted: '₹450', description: 'Capped at 24 hours of parking' },
      { name: 'EV Fast Charge Rate', priceFormatted: '₹12/kWh', description: 'Additional charge for electricity consumed' },
      { name: 'Peak-Period Surcharge', priceFormatted: '+₹15/hr', description: 'Applies between 17:30 - 19:30 on weekdays' }
    ],
    forecast: [
      { timeOffset: 'NOW', status: 'AVAILABLE', expectedOccupancy: 29, expectedAvailableBays: 142, isObserved: true },
      { timeOffset: '+30 MIN', status: 'AVAILABLE', expectedOccupancy: 31, expectedAvailableBays: 138, isObserved: false },
      { timeOffset: '+60 MIN', status: 'AVAILABLE', expectedOccupancy: 34, expectedAvailableBays: 132, isObserved: false },
      { timeOffset: '+90 MIN', status: 'AVAILABLE', expectedOccupancy: 38, expectedAvailableBays: 124, isObserved: false },
      { timeOffset: '+120 MIN', status: 'LIMITED', expectedOccupancy: 45, expectedAvailableBays: 110, isObserved: false }
    ],
    recommendation: {
      score: 98,
      confidence: '98.4%',
      predictedAvailability: 'High stability (next 3 hrs)',
      expectedOccupancyAtArrival: 31,
      reasons: [
        'High predicted availability (142 bays open)',
        'Short 4 min walking distance to destination',
        'Stable price locked for next 2 hours',
        'Moderate demand curve ensures stress-free arrival'
      ]
    },
    updatedAt: 'Updated 2 minutes ago',
    demandCurrent: 29,
    demandPredicted: 35,
    forecastConfidence: '98.4%',
    peakWindow: '17:30 - 19:30',
    availabilityTrend: 'STABLE',
    searchTimeImpact: 'Minimal search time impact (<1 min)',
    otherNearbyIds: ['cyber-city-hub', 'financial-plaza-deck'],
    floors: [
      {
        id: 'B1',
        label: 'B1 — Priority & EV Charging',
        description: 'Premium floor containing dedicated EV charging infrastructure.',
        totalBays: 50,
        availableBays: 32,
        occupiedBays: 14,
        reservedBays: 4,
        slots: makeFacilitySlots('MC-B1', [
          [5, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [6, 'AVAILABLE', true],
          [4, 'AVAILABLE', false],
          [4, 'OCCUPIED', true],
          [2, 'RESERVED', true],
          [20, 'AVAILABLE', false],
          [7, 'OCCUPIED', false]
        ])
      },
      {
        id: 'B2',
        label: 'B2 — General Visitor Grid',
        description: 'Standard commuter parking bays and accessible zones.',
        totalBays: 80,
        availableBays: 60,
        occupiedBays: 16,
        reservedBays: 4,
        slots: makeFacilitySlots('MC-B2', [
          [8, 'OCCUPIED', false],
          [2, 'LIMITED', false],
          [4, 'AVAILABLE', true],
          [10, 'AVAILABLE', false],
          [4, 'OCCUPIED', false],
          [4, 'RESERVED', false],
          [42, 'AVAILABLE', false],
          [6, 'OCCUPIED', false]
        ])
      },
      {
        id: 'B3',
        label: 'B3 — Long-Term & Overflow',
        description: 'Economical spaces suited for day-long or multi-day storage.',
        totalBays: 70,
        availableBays: 50,
        occupiedBays: 18,
        reservedBays: 2,
        slots: makeFacilitySlots('MC-B3', [
          [10, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [40, 'AVAILABLE', false],
          [8, 'OCCUPIED', false],
          [10, 'AVAILABLE', false]
        ])
      }
    ]
  },
  {
    id: 'fac-03',
    slug: 'cyber-city-hub',
    name: 'Cyber City Hub Parking',
    zone: 'Zone A - Financial District',
    address: '88 Cyber Boulevard, Cyber City, Mumbai',
    description: 'Stunning smart garage located in the core commercial hub of Cyber City. Boasts digital contactless gates, automated navigation signage, and high-speed multi-standard EV chargers.',
    status: 'AVAILABLE',
    totalBays: 180,
    availableBays: 94,
    occupiedBays: 76,
    reservedBays: 10,
    occupancyPct: 47,
    distanceKm: 0.4,
    walkingEta: 5,
    rating: 4.9,
    reviewCount: 512,
    hasEv: true,
    evBays: 36,
    isCovered: true,
    hasSecurity: true,
    isOpen24x7: true,
    hourlyRate: 90,
    dailyRate: 700,
    amenities: [
      { name: 'Fast EV Chargers', description: 'Up to 250 kW rapid charger' },
      { name: 'Covered Parking', description: 'Completely enclosed structure' },
      { name: 'Contactless Payment', description: 'Fast RFID and QR codes scan' },
      { name: 'Smart Navigation', description: 'Visual indicators for open bays' },
      { name: '24/7 Security', description: 'High-tech surveillance and on-site crew' }
    ],
    rates: [
      { name: 'Hourly Rate', priceFormatted: '₹90/hr', description: 'Standard billing tier' },
      { name: 'Daily Maximum', priceFormatted: '₹700', description: '24 hour flat rate cap' },
      { name: 'EV Supercharger Fee', priceFormatted: '₹15/kWh', description: 'Rapid charge session' }
    ],
    forecast: [
      { timeOffset: 'NOW', status: 'AVAILABLE', expectedOccupancy: 47, expectedAvailableBays: 94, isObserved: true },
      { timeOffset: '+30 MIN', status: 'AVAILABLE', expectedOccupancy: 50, expectedAvailableBays: 90, isObserved: false },
      { timeOffset: '+60 MIN', status: 'AVAILABLE', expectedOccupancy: 55, expectedAvailableBays: 81, isObserved: false },
      { timeOffset: '+90 MIN', status: 'LIMITED', expectedOccupancy: 65, expectedAvailableBays: 63, isObserved: false },
      { timeOffset: '+120 MIN', status: 'LIMITED', expectedOccupancy: 72, expectedAvailableBays: 50, isObserved: false }
    ],
    recommendation: {
      score: 92,
      confidence: '95.1%',
      predictedAvailability: 'Moderate traffic predicted',
      expectedOccupancyAtArrival: 50,
      reasons: [
        'Short 5 min walk to Cyber Towers',
        'State of the art EV charging lanes available',
        'Secure indoor structure with smart navigation guidance'
      ]
    },
    updatedAt: 'Updated 1 minute ago',
    demandCurrent: 47,
    demandPredicted: 55,
    forecastConfidence: '95.1%',
    peakWindow: '09:00 - 11:30',
    availabilityTrend: 'DECREASING',
    searchTimeImpact: 'Minor search time impact (+1-2 mins)',
    otherNearbyIds: ['metro-central-garage', 'techpark-parking'],
    floors: [
      {
        id: 'B1',
        label: 'B1 — EV Charging & VIP',
        description: 'Dedicated EV charging zone and rapid parking slots.',
        totalBays: 60,
        availableBays: 24,
        occupiedBays: 30,
        reservedBays: 6,
        slots: makeFacilitySlots('CC-B1', [
          [10, 'OCCUPIED', true],
          [4, 'RESERVED', true],
          [14, 'AVAILABLE', true],
          [20, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [10, 'AVAILABLE', false]
        ])
      },
      {
        id: 'B2',
        label: 'B2 — General Parking',
        description: 'General visitor parking bays.',
        totalBays: 120,
        availableBays: 70,
        occupiedBays: 46,
        reservedBays: 4,
        slots: makeFacilitySlots('CC-B2', [
          [20, 'OCCUPIED', false],
          [4, 'RESERVED', false],
          [50, 'AVAILABLE', false],
          [26, 'OCCUPIED', false],
          [20, 'AVAILABLE', false]
        ])
      }
    ]
  },
  {
    id: 'fac-02',
    slug: 'techpark-parking',
    name: 'TechPark Parking',
    zone: 'Zone B - Tech Hub',
    address: '12 Innovation Way, TechPark, Mumbai',
    description: 'High-capacity underground plaza servicing the corporate high-rises at TechPark. Featuring robust security protocols, valet services, and extensive EV charging points.',
    status: 'LIMITED',
    totalBays: 150,
    availableBays: 18,
    occupiedBays: 122,
    reservedBays: 10,
    occupancyPct: 88,
    distanceKm: 0.7,
    walkingEta: 8,
    rating: 4.6,
    reviewCount: 290,
    hasEv: true,
    evBays: 18,
    isCovered: true,
    hasSecurity: true,
    isOpen24x7: true,
    hourlyRate: 80,
    dailyRate: 600,
    amenities: [
      { name: 'Valet Service', description: 'Drop and pick at main lobby' },
      { name: 'EV Charging', description: 'AC charging points' },
      { name: 'Covered Deck', description: 'Underground temperature-controlled deck' },
      { name: 'Disability Access', description: 'Wheelchair ramp access near elevators' }
    ],
    rates: [
      { name: 'Hourly Rate', priceFormatted: '₹80/hr', description: 'Standard billing rate' },
      { name: 'Valet Surcharge', priceFormatted: '₹150 Flat', description: 'Optional valet parking setup fee' },
      { name: 'Daily Maximum', priceFormatted: '₹600', description: '24 hour capped flat rate' }
    ],
    forecast: [
      { timeOffset: 'NOW', status: 'LIMITED', expectedOccupancy: 88, expectedAvailableBays: 18, isObserved: true },
      { timeOffset: '+30 MIN', status: 'LIMITED', expectedOccupancy: 92, expectedAvailableBays: 12, isObserved: false },
      { timeOffset: '+60 MIN', status: 'OCCUPIED', expectedOccupancy: 96, expectedAvailableBays: 6, isObserved: false },
      { timeOffset: '+90 MIN', status: 'OCCUPIED', expectedOccupancy: 97, expectedAvailableBays: 4, isObserved: false },
      { timeOffset: '+120 MIN', status: 'LIMITED', expectedOccupancy: 85, expectedAvailableBays: 22, isObserved: false }
    ],
    recommendation: {
      score: 65,
      confidence: '89.2%',
      predictedAvailability: 'Filling up fast (next 30 mins)',
      expectedOccupancyAtArrival: 92,
      reasons: [
        'Currently high occupancy (88%) limits slot selections',
        'Close to corporate towers (8 min walk)',
        'Valet service can expedite parking times'
      ]
    },
    updatedAt: 'Updated 5 minutes ago',
    demandCurrent: 88,
    demandPredicted: 95,
    forecastConfidence: '89.2%',
    peakWindow: '08:30 - 10:30',
    availabilityTrend: 'DECREASING',
    searchTimeImpact: 'Significant search time impact (+6-8 mins)',
    otherNearbyIds: ['cyber-city-hub', 'financial-plaza-deck'],
    floors: [
      {
        id: 'B1',
        label: 'B1 — Corporate Premium',
        description: 'Reserved executive slots and rapid valet bay integration.',
        totalBays: 70,
        availableBays: 4,
        occupiedBays: 60,
        reservedBays: 6,
        slots: makeFacilitySlots('TP-B1', [
          [30, 'OCCUPIED', false],
          [4, 'RESERVED', false],
          [2, 'AVAILABLE', true],
          [30, 'OCCUPIED', true],
          [2, 'RESERVED', true],
          [2, 'AVAILABLE', false]
        ])
      },
      {
        id: 'B2',
        label: 'B2 — General Corporate',
        description: 'Standard employee and guest corporate parking.',
        totalBays: 80,
        availableBays: 14,
        occupiedBays: 62,
        reservedBays: 4,
        slots: makeFacilitySlots('TP-B2', [
          [40, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [10, 'AVAILABLE', false],
          [22, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [4, 'AVAILABLE', false]
        ])
      }
    ]
  },
  {
    id: 'fac-04',
    slug: 'financial-plaza-deck',
    name: 'Financial Plaza Deck',
    zone: 'Zone A - Financial District',
    address: '102 Wall Street Avenue, Financial District, Mumbai',
    description: 'Open surface and multi-tier budget-friendly parking deck. Convenient access to major financial firms, with standard security and affordable pricing models.',
    status: 'AVAILABLE',
    totalBays: 100,
    availableBays: 65,
    occupiedBays: 30,
    reservedBays: 5,
    occupancyPct: 35,
    distanceKm: 0.9,
    walkingEta: 11,
    rating: 4.3,
    reviewCount: 154,
    hasEv: false,
    evBays: 0,
    isCovered: false,
    hasSecurity: true,
    isOpen24x7: false,
    hourlyRate: 50,
    dailyRate: 350,
    amenities: [
      { name: 'Open Surface', description: 'Combination of deck and open spaces' },
      { name: '24/7 Security', description: 'Active guard checks at main gates' },
      { name: 'Budget Friendly', description: 'Lowest pricing in the central district' }
    ],
    rates: [
      { name: 'Hourly Rate', priceFormatted: '₹50/hr', description: 'Flat daytime rate' },
      { name: 'Daily Maximum', priceFormatted: '₹350', description: '12-hour daytime cap' }
    ],
    forecast: [
      { timeOffset: 'NOW', status: 'AVAILABLE', expectedOccupancy: 35, expectedAvailableBays: 65, isObserved: true },
      { timeOffset: '+30 MIN', status: 'AVAILABLE', expectedOccupancy: 36, expectedAvailableBays: 64, isObserved: false },
      { timeOffset: '+60 MIN', status: 'AVAILABLE', expectedOccupancy: 38, expectedAvailableBays: 62, isObserved: false },
      { timeOffset: '+90 MIN', status: 'AVAILABLE', expectedOccupancy: 40, expectedAvailableBays: 60, isObserved: false },
      { timeOffset: '+120 MIN', status: 'AVAILABLE', expectedOccupancy: 42, expectedAvailableBays: 58, isObserved: false }
    ],
    recommendation: {
      score: 80,
      confidence: '92.7%',
      predictedAvailability: 'High availability expected',
      expectedOccupancyAtArrival: 36,
      reasons: [
        'Budget-friendly rates in Zone A',
        'Consistent open bays throughout the morning',
        'Fully monitored entry and exit checkpoints'
      ]
    },
    updatedAt: 'Updated 10 minutes ago',
    demandCurrent: 35,
    demandPredicted: 40,
    forecastConfidence: '92.7%',
    peakWindow: '12:00 - 14:00',
    availabilityTrend: 'STABLE',
    searchTimeImpact: 'Minimal search time impact (<1 min)',
    otherNearbyIds: ['metro-central-garage', 'cyber-city-hub'],
    floors: [
      {
        id: 'L1',
        label: 'Level 1 — Main Surface Lot',
        description: 'Main entry surface parking area.',
        totalBays: 50,
        availableBays: 30,
        occupiedBays: 16,
        reservedBays: 4,
        slots: makeFacilitySlots('FP-L1', [
          [10, 'OCCUPIED', false],
          [4, 'RESERVED', false],
          [20, 'AVAILABLE', false],
          [6, 'OCCUPIED', false],
          [10, 'AVAILABLE', false]
        ])
      },
      {
        id: 'L2',
        label: 'Level 2 — Elevated Deck',
        description: 'Uncovered elevated deck with standard bays.',
        totalBays: 50,
        availableBays: 35,
        occupiedBays: 14,
        reservedBays: 1,
        slots: makeFacilitySlots('FP-L2', [
          [12, 'OCCUPIED', false],
          [1, 'RESERVED', false],
          [30, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
          [5, 'AVAILABLE', false]
        ])
      }
    ]
  }
];

export const MOCK_REVIEWS_DATABASE: Record<string, FacilityReviewSummary> = {
  'metro-central-garage': {
    rating: 4.8,
    reviewCount: 382,
    distribution: { 5: 310, 4: 52, 3: 15, 2: 3, 1: 2 },
    reviews: [
      { id: 'rev-1', author: 'Rahul S.', rating: 5, comment: 'Perfect location right next to the metro concourse. Elevators are extremely clean and fast.', timeAgo: '2 hours ago' },
      { id: 'rev-2', author: 'Aditi K.', rating: 5, comment: 'Amazing EV fast charging facilities, B1 level is very spacious and well-lit. Strongly recommend.', timeAgo: 'Yesterday' },
      { id: 'rev-3', author: 'Vikram M.', rating: 4, comment: 'Pricing is standard for South district. Safe and reliable, barrier opens automatically via license recognition.', timeAgo: '3 days ago' }
    ]
  },
  'cyber-city-hub': {
    rating: 4.9,
    reviewCount: 512,
    distribution: { 5: 470, 4: 30, 3: 8, 2: 3, 1: 1 },
    reviews: [
      { id: 'rev-4', author: 'Pranav P.', rating: 5, comment: 'Hands-down the best smart garage in Mumbai. Dynamic bay lights are a lifesaver.', timeAgo: '1 hour ago' },
      { id: 'rev-5', author: 'Sneha G.', rating: 5, comment: 'Super fast RFID scanning, never have to wait in line. High-speed chargers are highly reliable.', timeAgo: '2 days ago' }
    ]
  },
  'techpark-parking': {
    rating: 4.6,
    reviewCount: 290,
    distribution: { 5: 200, 4: 70, 3: 12, 2: 5, 1: 3 },
    reviews: [
      { id: 'rev-6', author: 'Amit B.', rating: 4, comment: 'Fills up very early on workdays. The valet option is super convenient though.', timeAgo: '4 hours ago' },
      { id: 'rev-7', author: 'Karan J.', rating: 5, comment: 'Extremely professional security desk and excellent accessible parking close to the corporate entrance.', timeAgo: 'Yesterday' }
    ]
  },
  'financial-plaza-deck': {
    rating: 4.3,
    reviewCount: 154,
    distribution: { 5: 90, 4: 40, 3: 14, 2: 8, 1: 2 },
    reviews: [
      { id: 'rev-8', author: 'Rohit D.', rating: 4, comment: 'Cheapest option by far in this area. Uncovered surface deck can get hot in afternoons, but secure.', timeAgo: '3 hours ago' },
      { id: 'rev-9', author: 'Neha S.', rating: 5, comment: 'Great budget deck. Straightforward entry and exit, perfect if you work at Wall Street Towers.', timeAgo: 'Last week' }
    ]
  }
};

export function getFacilityByIdOrSlug(idOrSlug: string): FacilityDetails | undefined {
  if (!idOrSlug) return undefined;
  const normalized = idOrSlug.toLowerCase();
  return MOCK_FACILITY_DETAILS.find(
    (f) => f.id.toLowerCase() === normalized || f.slug.toLowerCase() === normalized
  );
}

export function getReviewSummaryForFacility(slug: string): FacilityReviewSummary {
  return MOCK_REVIEWS_DATABASE[slug] || {
    rating: 4.0,
    reviewCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  };
}
