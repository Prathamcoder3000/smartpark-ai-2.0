/**
 * SmartPark AI 2.0 — Live Map Data Layer
 *
 * All TypeScript interfaces and mock datasets for the /map page.
 * Data is cleanly separated from UI so any constant can be swapped
 * for a real REST / GraphQL response without touching component code.
 *
 * ─── Swap guide ──────────────────────────────────────────────
 *  MAP_FACILITIES      → GET /api/v2/facilities?view=map
 *  MAP_AI_RECOMMENDATION → GET /api/v2/intelligence/recommendation
 *  MAP_POPULAR_DESTINATIONS → GET /api/v2/search/popular
 * ─────────────────────────────────────────────────────────────
 */

// ─── Slot / Floor types ──────────────────────────────────────

/**
 * Mirrors ParkingSlotState from ParkingSlot.tsx — kept local to
 * avoid a data-layer → UI-component import dependency.
 */
export type SlotState =
  | 'AVAILABLE'
  | 'LIMITED'
  | 'OCCUPIED'
  | 'SELECTED'
  | 'RESERVED';

export interface MapParkingSlot {
  /** Unique slot ID: "<facilityId>-<floorId>-<number>", e.g. "fac01-B1-03" */
  id: string;
  /** Current sensor-reported occupancy state */
  state: SlotState;
  /** Whether this slot has an EV charging point */
  isEV: boolean;
  /** Whether this slot is designated for disabled access */
  isDisabled: boolean;
}

export interface ParkingFloor {
  /** Floor identifier used as tab key, e.g. "B1" */
  id: string;
  /** Human-readable label, e.g. "B1 — VIP & EV Charging" */
  label: string;
  /** Short description shown in the floor picker */
  description: string;
  /** Available slots on this floor */
  availableCount: number;
  /** Total slots on this floor */
  totalCount: number;
  /** Detailed slot grid */
  slots: MapParkingSlot[];
}

// ─── Facility types ──────────────────────────────────────────

export type FacilityStatus = 'AVAILABLE' | 'LIMITED' | 'OCCUPIED';

export interface MapFacility {
  id: string;
  name: string;
  shortName: string;
  location: string;
  zone: string;
  status: FacilityStatus;
  availableBays: number;
  totalBays: number;
  ratePerHour: string;
  /** Numeric rate for price-sort filter */
  ratePerHourNum: number;
  distanceKm: number;
  walkMinutes: number;
  evCharging: boolean;
  security24x7: boolean;
  covered: boolean;
  tags: string[];
  /** Percentage position on the map canvas (0–100) */
  mapPosition: { x: number; y: number };
  /** AI-generated availability forecast string */
  predictedAvailability: string;
  /** Star rating out of 5 */
  rating: number;
  /** Per-floor occupancy breakdown */
  floors: ParkingFloor[];
}

// ─── Filter types ─────────────────────────────────────────────

export type MapFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'EV_READY'
  | 'COVERED'
  | 'LOWEST_PRICE';

export interface FilterOption {
  id: MapFilter;
  label: string;
}

export const MAP_FILTER_OPTIONS: FilterOption[] = [
  { id: 'ALL', label: 'All Facilities' },
  { id: 'AVAILABLE', label: 'High Availability' },
  { id: 'EV_READY', label: 'EV Ready' },
  { id: 'COVERED', label: 'Covered Deck' },
  { id: 'LOWEST_PRICE', label: 'Lowest Price' },
];

// ─── AI Recommendation type ───────────────────────────────────

export interface AIMapRecommendation {
  facilityId: string;
  facilityName: string;
  confidence: string;
  reasons: string[];
  predictedAvailabilityWindow: string;
  ratePerHour: string;
  walkMinutes: number;
}

// ─── Slot generation helper ───────────────────────────────────

/**
 * Generates a flat slot array from a compact spec:
 *   [count, state, isEV, isDisabled?]
 */
function makeSlots(
  prefix: string,
  specs: Array<[number, SlotState, boolean, boolean?]>
): MapParkingSlot[] {
  const slots: MapParkingSlot[] = [];
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

// ─── Mock Facilities ──────────────────────────────────────────

export const MAP_FACILITIES: MapFacility[] = [
  {
    id: 'fac-01',
    name: 'Cyber City Innovation Hub Garage',
    shortName: 'Cyber City Hub',
    location: 'Cyber City Phase II, Sector 24',
    zone: 'Zone A — Commercial Center',
    status: 'AVAILABLE',
    availableBays: 48,
    totalBays: 120,
    ratePerHour: '₹40/hr',
    ratePerHourNum: 40,
    distanceKm: 0.8,
    walkMinutes: 4,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['EV Fast Charge', 'Valet Available', '24/7 Access'],
    mapPosition: { x: 20, y: 20 },
    predictedAvailability: 'Stable for next 90 min',
    rating: 4.8,
    floors: [
      {
        id: 'B1',
        label: 'B1 — VIP & EV Charging',
        description: 'Premium bays with 150 kW EV fast-charge points',
        availableCount: 6,
        totalCount: 16,
        slots: makeSlots('fac01-B1', [
          [6, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [2, 'AVAILABLE', true],
          [4, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
        ]),
      },
      {
        id: 'B2',
        label: 'B2 — General Visitor Grid',
        description: 'Standard visitor bays with barrier access',
        availableCount: 22,
        totalCount: 36,
        slots: makeSlots('fac01-B2', [
          [8, 'OCCUPIED', false],
          [2, 'LIMITED', false],
          [4, 'AVAILABLE', true],
          [10, 'AVAILABLE', false],
          [4, 'OCCUPIED', false],
          [4, 'RESERVED', false],
          [4, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B3',
        label: 'B3 — Long-Term & Executive',
        description: 'Long-stay and monthly-pass executive bays',
        availableCount: 20,
        totalCount: 24,
        slots: makeSlots('fac01-B3', [
          [4, 'OCCUPIED', false],
          [20, 'AVAILABLE', false],
        ]),
      },
    ],
  },

  {
    id: 'fac-02',
    name: 'Central Metro Junction Station',
    shortName: 'Metro Junction',
    location: 'Concourse Road, Gate 3',
    zone: 'Zone B — Transit Hub',
    status: 'LIMITED',
    availableBays: 12,
    totalBays: 150,
    ratePerHour: '₹30/hr',
    ratePerHourNum: 30,
    distanceKm: 1.4,
    walkMinutes: 7,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['Metro Link', 'Covered Deck', 'CCTV Active'],
    mapPosition: { x: 50, y: 48 },
    predictedAvailability: 'Critical: High demand expected in 20 min',
    rating: 4.2,
    floors: [
      {
        id: 'B1',
        label: 'B1 — Priority & EV',
        description: 'Transit priority and EV charge bays',
        availableCount: 2,
        totalCount: 16,
        slots: makeSlots('fac02-B1', [
          [13, 'OCCUPIED', false],
          [1, 'RESERVED', true],
          [1, 'AVAILABLE', true],
          [1, 'AVAILABLE', false, true],
        ]),
      },
      {
        id: 'B2',
        label: 'B2 — General Transit Grid',
        description: 'Standard commuter parking bays',
        availableCount: 1,
        totalCount: 20,
        slots: makeSlots('fac02-B2', [
          [17, 'OCCUPIED', false],
          [2, 'LIMITED', false],
          [1, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B3',
        label: 'B3 — Overflow Deck',
        description: 'Overflow capacity — currently near capacity',
        availableCount: 0,
        totalCount: 16,
        slots: makeSlots('fac02-B3', [
          [14, 'OCCUPIED', false],
          [2, 'RESERVED', false],
        ]),
      },
    ],
  },

  {
    id: 'fac-03',
    name: 'TechPark Square Underground',
    shortName: 'TechPark Square',
    location: 'Tower 4 Promenade',
    zone: 'Zone A — Enterprise District',
    status: 'AVAILABLE',
    availableBays: 84,
    totalBays: 200,
    ratePerHour: '₹50/hr',
    ratePerHourNum: 50,
    distanceKm: 2.1,
    walkMinutes: 9,
    evCharging: true,
    security24x7: true,
    covered: true,
    tags: ['Automated Barrier', 'VIP Bays', 'Fast Exit'],
    mapPosition: { x: 75, y: 18 },
    predictedAvailability: 'Stable for next 2 hours',
    rating: 4.9,
    floors: [
      {
        id: 'B1',
        label: 'B1 — VIP & EV Charging',
        description: 'Ultra-premium VIP bays with 350 kW rapid charge',
        availableCount: 10,
        totalCount: 20,
        slots: makeSlots('fac03-B1', [
          [5, 'OCCUPIED', false],
          [3, 'RESERVED', true],
          [6, 'AVAILABLE', true],
          [4, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
        ]),
      },
      {
        id: 'B2',
        label: 'B2 — Enterprise Grid',
        description: 'Office tenant and visitor bays',
        availableCount: 36,
        totalCount: 48,
        slots: makeSlots('fac03-B2', [
          [6, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [16, 'AVAILABLE', false],
          [2, 'LIMITED', false],
          [12, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
          [8, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B3',
        label: 'B3 — Long-Stay & Executive',
        description: 'Monthly pass and long-stay bays',
        availableCount: 38,
        totalCount: 44,
        slots: makeSlots('fac03-B3', [
          [4, 'OCCUPIED', false],
          [1, 'RESERVED', false],
          [18, 'AVAILABLE', false],
          [1, 'OCCUPIED', false],
          [20, 'AVAILABLE', false],
        ]),
      },
    ],
  },

  {
    id: 'fac-04',
    name: 'Grand Galleria Shopping Deck',
    shortName: 'Grand Galleria',
    location: 'Main Retail Corridor, Level -1',
    zone: 'Zone C — Retail & Entertainment',
    status: 'LIMITED',
    availableBays: 9,
    totalBays: 180,
    ratePerHour: '₹60/hr',
    ratePerHourNum: 60,
    distanceKm: 2.8,
    walkMinutes: 12,
    evCharging: false,
    security24x7: true,
    covered: true,
    tags: ['Mall Access', 'Disabled Friendly', 'Wide Bays'],
    mapPosition: { x: 38, y: 75 },
    predictedAvailability: 'Limited: Will fill in ~15 min',
    rating: 3.9,
    floors: [
      {
        id: 'B1',
        label: 'B1 — Retail Priority',
        description: 'Nearest to mall entrance — near capacity',
        availableCount: 2,
        totalCount: 20,
        slots: makeSlots('fac04-B1', [
          [16, 'OCCUPIED', false],
          [2, 'LIMITED', false],
          [1, 'AVAILABLE', false, true],
          [1, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B2',
        label: 'B2 — General Shoppers',
        description: 'Standard retail visitor bays',
        availableCount: 3,
        totalCount: 20,
        slots: makeSlots('fac04-B2', [
          [15, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [3, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B3',
        label: 'B3 — Cinema & Dining',
        description: 'Entertainment district overflow deck',
        availableCount: 4,
        totalCount: 20,
        slots: makeSlots('fac04-B3', [
          [14, 'OCCUPIED', false],
          [2, 'RESERVED', false],
          [4, 'AVAILABLE', false],
        ]),
      },
    ],
  },

  {
    id: 'fac-05',
    name: 'Financial District North Deck',
    shortName: 'Financial North',
    location: 'Corporate Boulevard, Sector 18',
    zone: 'Zone A — Financial Plaza',
    status: 'OCCUPIED',
    availableBays: 2,
    totalBays: 90,
    ratePerHour: '₹45/hr',
    ratePerHourNum: 45,
    distanceKm: 3.5,
    walkMinutes: 15,
    evCharging: true,
    security24x7: true,
    covered: false,
    tags: ['Open Sky Deck', 'Monthly Passes', 'ANPR Scanner'],
    mapPosition: { x: 72, y: 76 },
    predictedAvailability: 'Near full — check back in 30 min',
    rating: 4.1,
    floors: [
      {
        id: 'B1',
        label: 'B1 — Corporate Reserved',
        description: 'Reserved for corporate account holders',
        availableCount: 1,
        totalCount: 16,
        slots: makeSlots('fac05-B1', [
          [13, 'OCCUPIED', false],
          [1, 'RESERVED', true],
          [1, 'RESERVED', false],
          [1, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B2',
        label: 'B2 — Open Sky Level',
        description: 'Open-air level — currently full',
        availableCount: 0,
        totalCount: 16,
        slots: makeSlots('fac05-B2', [
          [14, 'OCCUPIED', false],
          [2, 'RESERVED', false],
        ]),
      },
      {
        id: 'B3',
        label: 'B3 — Executive Deck',
        description: 'Executive monthly pass holders',
        availableCount: 1,
        totalCount: 16,
        slots: makeSlots('fac05-B3', [
          [14, 'OCCUPIED', false],
          [1, 'RESERVED', true],
          [1, 'AVAILABLE', false],
        ]),
      },
    ],
  },

  {
    id: 'fac-06',
    name: 'Westside Business Park Surface Lot',
    shortName: 'Westside Lot',
    location: 'Outer Ring Road, Exit 12',
    zone: 'Zone D — Outer Ring',
    status: 'AVAILABLE',
    availableBays: 115,
    totalBays: 160,
    ratePerHour: '₹25/hr',
    ratePerHourNum: 25,
    distanceKm: 4.2,
    walkMinutes: 18,
    evCharging: false,
    security24x7: true,
    covered: false,
    tags: ['Economical Rate', 'Large Vehicles', 'Easy Access'],
    mapPosition: { x: 12, y: 75 },
    predictedAvailability: 'Ample supply for 3+ hours',
    rating: 3.7,
    floors: [
      {
        id: 'B1',
        label: 'Lot A — North Section',
        description: 'Northern surface lot — easy entry',
        availableCount: 38,
        totalCount: 48,
        slots: makeSlots('fac06-B1', [
          [4, 'OCCUPIED', false],
          [6, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
          [18, 'AVAILABLE', false],
          [4, 'OCCUPIED', false],
          [14, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B2',
        label: 'Lot B — Central Section',
        description: 'Central surface lot — large vehicle bays',
        availableCount: 42,
        totalCount: 48,
        slots: makeSlots('fac06-B2', [
          [3, 'OCCUPIED', false],
          [20, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
          [15, 'AVAILABLE', false],
          [1, 'RESERVED', false],
          [7, 'AVAILABLE', false],
        ]),
      },
      {
        id: 'B3',
        label: 'Lot C — South Section',
        description: 'Southern lot — closest to bus stop',
        availableCount: 35,
        totalCount: 48,
        slots: makeSlots('fac06-B3', [
          [5, 'OCCUPIED', false],
          [3, 'RESERVED', false],
          [16, 'AVAILABLE', false],
          [3, 'OCCUPIED', false],
          [19, 'AVAILABLE', false],
          [2, 'OCCUPIED', false],
        ]),
      },
    ],
  },
];

// ─── AI Recommendation ────────────────────────────────────────

export const MAP_AI_RECOMMENDATION: AIMapRecommendation = {
  facilityId: 'fac-01',
  facilityName: 'Cyber City Innovation Hub Garage',
  confidence: '96.8%',
  reasons: [
    'Highest real-time availability in the metro region',
    'Fastest walking distance from detected destination pin',
    'EV charging available — rate locked for 120 minutes',
  ],
  predictedAvailabilityWindow: 'Stable supply for the next 90 min',
  ratePerHour: '₹40/hr',
  walkMinutes: 4,
};

// ─── Popular Destinations ────────────────────────────────────

export const MAP_POPULAR_DESTINATIONS: string[] = [
  'Cyber City Phase II',
  'Central Metro Gate 3',
  'TechPark Tower 4',
  'Grand Galleria Mall',
  'Financial District Sector 18',
  'Outer Ring Exit 12',
];

// ─── Zone options for zone select ────────────────────────────

export const MAP_ZONE_OPTIONS = [
  { value: 'ALL', label: 'All Zones' },
  { value: 'Zone A', label: 'Zone A — Commercial/Enterprise' },
  { value: 'Zone B', label: 'Zone B — Transit Hub' },
  { value: 'Zone C', label: 'Zone C — Retail & Entertainment' },
  { value: 'Zone D', label: 'Zone D — Outer Ring' },
];
